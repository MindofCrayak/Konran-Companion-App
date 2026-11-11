import React, { useState } from 'react';
import { 
  Users, 
  Check, 
  ExternalLink, 
  Unlink, 
  ShieldCheck, 
  Radio, 
  ScrollText, 
  UserCheck 
} from 'lucide-react';
import { useCharacter } from '../context/CharacterContext';
import { playDivineReveal, playKeyClick } from '../utils/audio';

interface DiscordAuthNodeViewProps {
  onClose?: () => void;
}

export const DiscordAuthNodeView: React.FC<DiscordAuthNodeViewProps> = () => {
  const { account, characters, activeCharacter, connectDiscordAccount, disconnectDiscordAccount, syncToLedgerSheet } = useCharacter();
  const [discordHandleInput, setDiscordHandleInput] = useState(
    account.discordUsername || account.displayName || ''
  );
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSheetSync = async () => {
    setIsSyncing(true);
    setSyncStatus('TRANSMITTING TO LEDGER...');
    playKeyClick();
    const result = await syncToLedgerSheet();
    setIsSyncing(false);
    if (result.success) {
      setSyncStatus('SYNCHRONIZED WITH GOOGLE SHEET LEDGER');
      playDivineReveal();
    } else {
      setSyncStatus(`SYNC ERROR: ${result.message}`);
    }
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discordHandleInput.trim()) return;
    playDivineReveal();
    const clean = discordHandleInput.trim().replace(/^@/, '');
    connectDiscordAccount({
      discordId: `dev_discord_${Date.now()}`,
      username: clean,
    });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleUnlink = () => {
    playKeyClick();
    disconnectDiscordAccount();
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#070b12] text-white p-4 font-mono text-xs overflow-y-auto space-y-4">
      {/* Header status bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#5865F2]/40">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 fill-[#5865F2] shrink-0" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
          </svg>
          <div>
            <span className="font-bold text-[#5865F2] uppercase tracking-wider text-sm block">
              Discord Matrix & Roster Gateway
            </span>
            <span className="text-[10px] text-white/50">
              Synchronize party rosters, active covenants, and live voice channel presence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {account.discordUsername ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#5865F2]/20 border border-[#5865F2] text-[#5865F2] text-[10px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>LINKED: @{account.discordUsername}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 text-[10px]">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>UNLINKED</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Connection Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option 1: Official Discord OAuth2 */}
        <div className="p-4 rounded bg-[#5865F2]/10 border border-[#5865F2]/50 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-[#5865F2] uppercase tracking-wider text-xs">
                Method A // Official OAuth2
              </span>
              <span className="text-[9px] bg-[#5865F2] text-white px-1.5 py-0.5 rounded uppercase font-bold">
                OAuth2 SSO
              </span>
            </div>
            <p className="text-[11px] text-white/70 leading-relaxed font-sans">
              Authenticate directly against Discord servers. Synchronizes your avatar, Discord roles, verified membership in Konran campaign servers, and bot integrations.
            </p>
          </div>

          <a
            href="/api/auth/discord/login"
            className="w-full py-2.5 px-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(88,101,242,0.5)] transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Authorize via Discord OAuth2</span>
          </a>
        </div>

        {/* Option 2: Local Handle Link */}
        <div className="p-4 rounded bg-black/50 border border-white/15 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-[#39ff14] uppercase tracking-wider text-xs">
                Method B // Direct Handle Bind
              </span>
              <span className="text-[9px] bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14]/50 px-1.5 py-0.5 rounded uppercase font-bold">
                Local / Dev
              </span>
            </div>
            <p className="text-[11px] text-white/70 leading-relaxed font-sans">
              Set your Discord username manually for local sessions. Links your character sheet, private messages, and dice rolls to your party member tag.
            </p>
          </div>

          <form onSubmit={handleLinkSubmit} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-white/40">@</span>
              <input
                type="text"
                value={discordHandleInput}
                onChange={(e) => setDiscordHandleInput(e.target.value)}
                placeholder="DiscordUsername or Global Name"
                className="flex-1 px-3 py-1.5 bg-black border border-white/30 rounded text-white focus:outline-none focus:border-[#39ff14] text-xs font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#39ff14]/20 hover:bg-[#39ff14]/30 border border-[#39ff14] text-[#39ff14] font-bold rounded flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Bind Discord Handle</span>
            </button>
          </form>
        </div>
      </div>

      {isSavedNotice && (
        <div className="p-2 bg-[#39ff14]/20 border border-[#39ff14] text-[#39ff14] text-center rounded animate-fadeIn">
          DISCORD HANDLE SYNCHRONIZED ACROSS LOCAL SLABLET MATRIX
        </div>
      )}

      {/* Cloud Google Sheet Ledger Proxy Trigger */}
      <div className="p-3 bg-black/60 rounded border border-[#ffd700]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-[#ffd700]" />
          <div>
            <div className="text-xs font-bold text-white tracking-wide">Cloudflare Pages &harr; Google Sheet Ledger</div>
            <div className="text-[10px] text-white/60">Proxy: /api/sync/sheet &bull; Central Campaign Ledger</div>
          </div>
        </div>
        <button
          onClick={handleManualSheetSync}
          disabled={isSyncing}
          className="px-3 py-1.5 bg-[#ffd700]/20 hover:bg-[#ffd700]/30 border border-[#ffd700] text-[#ffd700] text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
        >
          {isSyncing ? 'TRANSMITTING...' : 'SYNC LEDGER NOW'}
        </button>
      </div>

      {syncStatus && (
        <div className="p-2 bg-[#ffd700]/20 border border-[#ffd700] text-[#ffd700] text-center text-xs rounded font-mono animate-fadeIn">
          {syncStatus}
        </div>
      )}

      {/* Synchronized Characters Section */}
      <div className="p-3 bg-black/40 rounded border border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-white/60 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#ffcc00]" />
            <span>Characters Registered to Account ({characters.length})</span>
          </span>
          {account.discordUsername && (
            <button
              onClick={handleUnlink}
              className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[10px] cursor-pointer"
            >
              <Unlink className="w-3 h-3" />
              <span>Unlink Account</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {characters.map((c) => (
            <div
              key={c.id}
              className={`p-2.5 rounded border flex items-center justify-between ${
                activeCharacter?.id === c.id
                  ? 'border-[#39ff14] bg-[#39ff14]/10'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#39ff14]" />
                  <span>{c.name}</span>
                </div>
                <div className="text-[10px] text-white/60">
                  Lv.{c.level} {c.species} {c.characterClass}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] px-2 py-0.5 rounded bg-black/60 border border-white/20 text-[#ffcc00] font-mono">
                  {c.declaredDeity || 'Unaligned'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
