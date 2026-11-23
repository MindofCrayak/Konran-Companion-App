import React, { useState } from 'react';
import {
  AlertTriangle,
  Cloud,
  HardDrive,
  GitMerge,
  CheckCircle2,
  RefreshCw,
  X,
  ShieldAlert,
} from 'lucide-react';
import {
  CharacterSyncSnapshot,
  MergeResolutionStrategy,
  SplitBrainConflictReport,
  buildMergedSnapshot,
  detectSplitBrainConflict,
  submitMergeResolution,
} from '../../db/otaConflictEngine';
import { computeStateHash, idbPut } from '../../db/indexedDbVault';

export interface OTASyncConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConflict?: SplitBrainConflictReport | null;
  diagnosticMode?: boolean;
  characterName?: string;
  onResolved?: (resolved: CharacterSyncSnapshot, strategy: MergeResolutionStrategy) => void;
}

function createSimulatedConflict(characterName = 'Operative Vex-7'): SplitBrainConflictReport {
  const localItems = ['Oray Slablet Mk-IV', 'Med-Stim x2', 'Encrypted Keycard (Sector 4)'];
  const remoteItems = ['Oray Slablet Mk-IV', 'Med-Stim x1', 'Krayvuk Ration Pack'];

  const localBase = {
    characterId: 'char_vex_7',
    characterName,
    hpCurrent: 24,
    hpMax: 38,
    tempHp: 5,
    inventoryItems: localItems,
    inventoryHash: computeStateHash(localItems),
    statusFlags: ['Jacked-In', 'Synapse-Overclocked'],
  };

  const remoteBase = {
    characterId: 'char_vex_7',
    characterName,
    hpCurrent: 19,
    hpMax: 38,
    tempHp: 0,
    inventoryItems: remoteItems,
    inventoryHash: computeStateHash(remoteItems),
    statusFlags: ['Trace-Marked (Tier 1)', 'Exhausted'],
  };

  const local: CharacterSyncSnapshot = {
    ...localBase,
    stateHash: computeStateHash(localBase),
    lastModifiedIso: new Date(Date.now() - 45_000).toISOString(),
    source: 'local_idb',
  };

  const remote: CharacterSyncSnapshot = {
    ...remoteBase,
    stateHash: computeStateHash(remoteBase),
    lastModifiedIso: new Date(Date.now() - 12_000).toISOString(),
    source: 'cloud_sheet',
  };

  return detectSplitBrainConflict(local, remote);
}

export const OTASyncConflictModal: React.FC<OTASyncConflictModalProps> = ({
  isOpen,
  onClose,
  initialConflict = null,
  diagnosticMode = true,
  characterName = 'Operative Vex-7',
  onResolved,
}) => {
  const [conflict, setConflict] = useState<SplitBrainConflictReport | null>(
    initialConflict ?? (diagnosticMode ? createSimulatedConflict(characterName) : null)
  );
  const [selectedStrategy, setSelectedStrategy] = useState<MergeResolutionStrategy>('Merge Both');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolutionLog, setResolutionLog] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateConflict = () => {
    setResolutionLog(null);
    setConflict(createSimulatedConflict(characterName));
  };

  const handleResolve = async () => {
    if (!conflict) return;
    setIsSubmitting(true);
    const resolvedSnapshot = buildMergedSnapshot(
      conflict.local,
      conflict.remote,
      selectedStrategy
    );

    await idbPut('characters', resolvedSnapshot.characterId, resolvedSnapshot);

    const res = await submitMergeResolution({
      characterId: conflict.characterId,
      characterName: conflict.characterName,
      strategy: selectedStrategy,
      resolvedSnapshot,
      localSnapshot: conflict.local,
      remoteSnapshot: conflict.remote,
      submittedAtIso: new Date().toISOString(),
    });

    setIsSubmitting(false);
    setResolutionLog(
      `Reconciled [${selectedStrategy}] -> Hash ${resolvedSnapshot.stateHash}. Dispatched to Merge_Queue & Discord DM webhook (${res.queued ? 'LIVE' : 'OFFLINE-QUEUED'}).`
    );
    onResolved?.(resolvedSnapshot, selectedStrategy);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-xl border border-amber-500/40 bg-zinc-950 text-zinc-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 bg-amber-950/30 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold tracking-wider uppercase text-amber-300">
                OTA Split-Brain Sync Conflict Detected
              </h2>
              <p className="text-xs text-zinc-400">
                Non-destructive reconciliation between Local IndexedDB Vault &amp; Cloud Campaign_State
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {diagnosticMode && (
              <button
                type="button"
                onClick={handleSimulateConflict}
                className="flex items-center gap-1.5 rounded border border-cyan-500/40 bg-cyan-950/40 px-2.5 py-1 text-xs font-mono text-cyan-300 hover:bg-cyan-900/50 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Simulate OTA Split-Brain Conflict
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {!conflict || !conflict.hasConflict ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-6 text-center space-y-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
              <div className="text-sm font-semibold text-emerald-300">
                Local Vault &amp; Remote Campaign_State are in parity.
              </div>
              {diagnosticMode && (
                <button
                  type="button"
                  onClick={handleSimulateConflict}
                  className="inline-flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-950/40 px-4 py-2 text-xs font-mono uppercase text-amber-300 hover:bg-amber-900/50"
                >
                  <ShieldAlert className="h-4 w-4" />
                  Simulate OTA Split-Brain Conflict
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Metadata Snapshot Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-3">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-1">
                    <HardDrive className="h-3.5 w-3.5" />
                    LOCAL SLABLET VAULT (IndexedDB)
                  </div>
                  <div className="text-zinc-400">Hash: {conflict.local.stateHash}</div>
                  <div className="text-zinc-400">Modified: {conflict.local.lastModifiedIso}</div>
                </div>
                <div className="rounded-lg border border-purple-500/30 bg-purple-950/20 p-3">
                  <div className="flex items-center gap-1.5 text-purple-300 font-bold mb-1">
                    <Cloud className="h-3.5 w-3.5" />
                    CLOUD CAMPAIGN_STATE (Google Sheets)
                  </div>
                  <div className="text-zinc-400">Hash: {conflict.remote.stateHash}</div>
                  <div className="text-zinc-400">Modified: {conflict.remote.lastModifiedIso}</div>
                </div>
              </div>

              {/* Diff Table */}
              <div className="rounded-lg border border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/90 text-zinc-400 uppercase font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Field</th>
                      <th className="py-2.5 px-3 text-cyan-300">Local (IndexedDB)</th>
                      <th className="py-2.5 px-3 text-purple-300">Cloud (Campaign_State)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 font-mono">
                    {conflict.diffs.map((d) => (
                      <tr key={d.field} className="bg-zinc-950/60">
                        <td className="py-2.5 px-3 font-semibold text-zinc-200">{d.label}</td>
                        <td className="py-2.5 px-3 text-cyan-200">
                          {Array.isArray(d.localValue) ? d.localValue.join(', ') : String(d.localValue)}
                        </td>
                        <td className="py-2.5 px-3 text-purple-200">
                          {Array.isArray(d.remoteValue)
                            ? d.remoteValue.join(', ')
                            : String(d.remoteValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Strategy Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase text-zinc-400">
                  Select Reconciliation Strategy
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(['Keep Local', 'Accept Cloud', 'Merge Both'] as MergeResolutionStrategy[]).map(
                    (strategy) => {
                      const active = selectedStrategy === strategy;
                      return (
                        <button
                          key={strategy}
                          type="button"
                          onClick={() => setSelectedStrategy(strategy)}
                          className={`flex flex-col items-start rounded-lg border p-3 text-left transition ${
                            active
                              ? 'border-amber-400 bg-amber-950/40 text-amber-200'
                              : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase">
                            <GitMerge className="h-3.5 w-3.5" />
                            {strategy}
                          </div>
                          <p className="mt-1 text-[11px] leading-snug text-zinc-400">
                            {strategy === 'Keep Local' &&
                              'Preserve offline Slablet edits and queue override for DM approval.'}
                            {strategy === 'Accept Cloud' &&
                              'Adopt authoritative GM Cloud Campaign_State snapshot.'}
                            {strategy === 'Merge Both' &&
                              'Union inventory & status flags; conservative HP reconciliation.'}
                          </p>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {resolutionLog && (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs font-mono text-emerald-300">
                  {resolutionLog}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900/70 px-5 py-3">
          <span className="text-[11px] font-mono text-zinc-400">
            Target Queue: <strong className="text-amber-300">Merge_Queue</strong> + Discord DM Webhook
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-700 px-3.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
            >
              Close
            </button>
            {conflict?.hasConflict && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleResolve}
                className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold uppercase text-black hover:bg-amber-400 disabled:opacity-50"
              >
                {isSubmitting ? 'Dispatching...' : `Submit (${selectedStrategy})`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTASyncConflictModal;
