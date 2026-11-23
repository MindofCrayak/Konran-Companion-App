import React, { useState } from 'react';
import {
  ShieldCheck,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  Database,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
} from 'lucide-react';
import { useVaultSyncStatus, enqueueVaultSync } from '../utils/vault';
import { playKeyClick, playOptionSelect } from '../utils/audio';

export interface StorageVaultPanelProps {
  className?: string;
  onSyncComplete?: () => void;
  onCacheCleared?: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

export const StorageVaultPanel: React.FC<StorageVaultPanelProps> = ({
  className = '',
  onSyncComplete,
  onCacheCleared,
}) => {
  const {
    vaultKeyCount,
    vaultBytes,
    cacheKeyCount,
    cacheBytes,
    pendingSyncCount,
    lastSyncedAt,
    isOnline,
    isSyncing,
    lastSyncError,
    syncNow,
    clearCache,
  } = useVaultSyncStatus();

  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSyncNow = async () => {
    playKeyClick();
    setStatusMessage(null);
    if (pendingSyncCount === 0) {
      // Enqueue a heartbeat snapshot if queue is currently empty so manual Sync Now pushes state
      enqueueVaultSync('manual_vault_checkpoint', {
        triggeredAt: new Date().toISOString(),
      });
    }
    const result = await syncNow();
    if (result.success) {
      setStatusMessage('Protected Vault synchronized with Cloud Ledger.');
      onSyncComplete?.();
    } else if (result.error) {
      setStatusMessage(result.error);
    }
  };

  const handleConfirmClearCache = async () => {
    playOptionSelect();
    const res = await clearCache();
    setShowConfirmClear(false);
    setStatusMessage(
      `Cleared ${res.clearedLocalStorageKeys} cached entries & ${res.clearedCacheBuckets} media buckets. Vault intact.`
    );
    onCacheCleared?.();
  };

  return (
    <div
      className={`rounded-md border border-white/15 bg-zinc-950/80 backdrop-blur-md p-3.5 font-mono text-xs text-white/90 shadow-lg space-y-3 ${className}`}
    >
      {/* Header Row: Protected User Vault Title + Online/Offline Badge */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>PROTECTED USER VAULT</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-500/40">
                TIER-1 SAFE
              </span>
            </div>
            <div className="text-[10px] text-white/55">
              Sheet, inventory, Resonance dice, Home theme &amp; murder-boards
            </div>
          </div>
        </div>

        {/* Online / Offline Badge */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
            isOnline
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-950/70 text-amber-300 border-amber-500/40'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-amber-400" />
              <span>Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Two-Tier Storage Metrics */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-2.5 rounded bg-black/50 border border-emerald-500/25 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-emerald-300/80 uppercase">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3" /> Local Vault
            </span>
            <span>{vaultKeyCount} keys</span>
          </div>
          <div className="text-sm font-bold text-white">{formatBytes(vaultBytes)}</div>
          <div className="text-[10px] text-emerald-400/80">Never wiped by cache clear</div>
        </div>

        <div className="p-2.5 rounded bg-black/50 border border-purple-500/25 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-purple-300/80 uppercase">
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3" /> Lore &amp; Media Cache
            </span>
            <span>{cacheKeyCount} keys</span>
          </div>
          <div className="text-sm font-bold text-white">{formatBytes(cacheBytes)}</div>
          <div className="text-[10px] text-purple-300/70">LK maps, articles &amp; textures</div>
        </div>
      </div>

      {/* Sync Queue Status & Controls */}
      <div className="p-2.5 rounded bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="text-[11px] text-white/90 flex items-center gap-1.5">
            <span>Offline Dirty-Flag Sync Queue:</span>
            <span
              className={`px-1.5 py-0.2 rounded font-bold ${
                pendingSyncCount > 0
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-white/10 text-white/70'
              }`}
            >
              {pendingSyncCount} pending
            </span>
          </div>
          <div className="text-[10px] text-white/45">
            {lastSyncedAt
              ? `Last synced: ${new Date(lastSyncedAt).toLocaleTimeString()}`
              : 'Auto-flushes to Google Sheets / Discord on reconnect'}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSyncNow}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 font-bold text-[11px] cursor-pointer transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>

      {/* Clear Lore & Media Cache Action / Confirmation Prompt */}
      {!showConfirmClear ? (
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => {
              playKeyClick();
              setShowConfirmClear(true);
              setStatusMessage(null);
            }}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-bold text-[11px] cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Lore &amp; Media Cache</span>
          </button>
        </div>
      ) : (
        <div className="p-3 rounded bg-amber-950/60 border border-amber-500/50 space-y-2.5">
          <div className="flex items-start gap-2 text-amber-200 text-[11px] leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Clears cached lore &amp; map assets; your character sheet and local OS data remain safe
            </span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                playKeyClick();
                setShowConfirmClear(false);
              }}
              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white/80 text-[11px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmClearCache}
              className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] cursor-pointer"
            >
              Confirm Clear Cache
            </button>
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {(statusMessage || lastSyncError) && (
        <div
          className={`p-2 rounded text-[11px] flex items-center gap-1.5 border ${
            lastSyncError
              ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
              : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{statusMessage || lastSyncError}</span>
        </div>
      )}
    </div>
  );
};

export default StorageVaultPanel;
