import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  ExternalLink,
  X,
  Loader2,
  Compass,
  Layers,
  AtSign,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { playKeyClick, playOptionSelect } from '../utils/audio';

interface LoreAtlasModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  isEmbedded?: boolean;
}

interface LiveLoreArticle {
  id: string;
  resourceId: string;
  name: string;
  tier: string;
  tierLevel: number;
  markdown: string;
  mentions: { id: string; label: string }[];
  hasSubMap: boolean;
  subMapChildren: { id: string; name: string; tier: string }[];
}

export const LoreAtlasModal: React.FC<LoreAtlasModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  isEmbedded = false,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<LiveLoreArticle | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([]);
  const [bridgeStatus, setBridgeStatus] = useState<'LIVE' | 'CREDENTIALS_REQUIRED' | 'IDLE'>('IDLE');
  const [diagnosticReason, setDiagnosticReason] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        setQuery(initialQuery);
        handleOpenArticle(initialQuery, true);
      } else {
        handleSearch('');
      }
    }
  }, [isOpen, initialQuery]);

  const handleOpenArticle = async (idOrQuery: string, resetCrumbs = false) => {
    const slug = idOrQuery.trim();
    if (!slug) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/lore/article/${encodeURIComponent(slug)}`);
      if (!res.ok) {
        setSelectedDoc(null);
        setBridgeStatus('CREDENTIALS_REQUIRED');
        setDiagnosticReason(`Cloudflare Worker /api/lore/article/${slug} returned HTTP ${res.status}.`);
        return;
      }
      const body: any = await res.json();
      if (body.status === 'CREDENTIALS_REQUIRED' || body.diagnostic === '[LK BRIDGE: CREDENTIALS REQUIRED]') {
        setSelectedDoc(null);
        setBridgeStatus('CREDENTIALS_REQUIRED');
        setDiagnosticReason(body.error || 'LEGENDKEEPER_API_KEY / LK_API_KEY or root map ID is missing.');
        return;
      }

      const article: LiveLoreArticle = {
        id: body.id || slug,
        resourceId: body.resourceId || slug,
        name: body.name || body.title || slug,
        tier: body.tier || 'LegendKeeper v3 Resource',
        tierLevel: body.tierLevel || 2,
        markdown: body.markdown || body.text || 'No textual blocks returned from LegendKeeper.',
        mentions: Array.isArray(body.mentions) ? body.mentions : [],
        hasSubMap: Boolean(body.hasSubMap),
        subMapChildren: Array.isArray(body.subMapChildren) ? body.subMapChildren : [],
      };
      setBridgeStatus('LIVE');
      setDiagnosticReason('');
      setSelectedDoc(article);
      setBreadcrumbs((prev) =>
        resetCrumbs
          ? [{ id: article.resourceId, name: article.name }]
          : [...prev.filter((b) => b.id !== article.resourceId), { id: article.resourceId, name: article.name }]
      );
    } catch (err: any) {
      setSelectedDoc(null);
      setBridgeStatus('CREDENTIALS_REQUIRED');
      setDiagnosticReason(err?.message || 'LegendKeeper v3 bridge endpoint unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchTerm: string) => {
    setLoading(true);
    setSelectedDoc(null);
    const qStr = searchTerm.trim();
    try {
      const endpoint = qStr
        ? `/api/lore/legendkeeper?q=${encodeURIComponent(qStr)}`
        : `/api/lore/legendkeeper?pins=1`;
      const res = await fetch(endpoint);
      if (!res.ok) {
        setResults([]);
        setBridgeStatus('CREDENTIALS_REQUIRED');
        setDiagnosticReason(`Cloudflare Worker /api/lore/legendkeeper returned HTTP ${res.status}.`);
        return;
      }
      const body: any = await res.json();
      if (body.status === 'CREDENTIALS_REQUIRED' || body.diagnostic === '[LK BRIDGE: CREDENTIALS REQUIRED]') {
        setResults([]);
        setBridgeStatus('CREDENTIALS_REQUIRED');
        setDiagnosticReason(
          body.error || 'Missing LEGENDKEEPER_API_KEY / LK_API_KEY or root map ID in Cloudflare Worker secrets.'
        );
        return;
      }

      setBridgeStatus('LIVE');
      setDiagnosticReason('');
      const rawList = Array.isArray(body.data) ? body.data : [];
      // Normalize either search hits ({ resource, document }) or pin records ({ id, name, resourceId })
      const normalized = rawList.map((item: any) => {
        if (item.resource) return item;
        return {
          resource: {
            id: item.resourceId || item.id,
            name: item.name,
            hasSubMap: item.hasSubMap,
          },
          document: {
            id: `doc-${item.resourceId || item.id}`,
            name: item.name,
            highlights: item.lat !== undefined
              ? [{ segment: `${item.name} (${(item.tier || 'pin').toUpperCase()}) — Lat ${Number(item.lat).toFixed(1)}°, Lng ${Number(item.lng).toFixed(1)}°` }]
              : [],
          },
        };
      });
      setResults(normalized);
    } catch (err: any) {
      setResults([]);
      setBridgeStatus('CREDENTIALS_REQUIRED');
      setDiagnosticReason(err?.message || 'Unable to reach /api/lore/legendkeeper.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const content = (
    <div
      className={`relative w-full ${
        isEmbedded
          ? 'h-full flex-1'
          : 'max-w-2xl border-2 border-[#7d561a] rounded-2xl shadow-2xl max-h-[85vh]'
      } bg-[#0c0804] p-4 sm:p-5 text-[#d4af37] flex flex-col font-serif overflow-hidden`}
    >
      {/* Header + Live Diagnostic Bridge Status Badge */}
      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-[#5e3b1c]/70 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#ffd700]" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#ffd700] tracking-wide">
                Grand Codex &amp; Live Map Atlas (LegendKeeper v3)
              </h2>
              {bridgeStatus === 'CREDENTIALS_REQUIRED' && (
                <span
                  className="px-2 py-0.5 rounded bg-red-950/90 border border-red-400 text-red-200 font-mono text-[10px] font-bold tracking-wider flex items-center gap-1"
                  data-testid="lk-bridge-status"
                >
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  [LK BRIDGE: CREDENTIALS REQUIRED]
                </span>
              )}
              {bridgeStatus === 'LIVE' && (
                <span
                  className="px-2 py-0.5 rounded bg-emerald-950/90 border border-[#39ff14]/60 text-[#39ff14] font-mono text-[10px] font-bold tracking-wider flex items-center gap-1"
                  data-testid="lk-bridge-status"
                >
                  <ShieldCheck className="w-3 h-3 text-[#39ff14]" />
                  [LK BRIDGE: LIVE]
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-[#a78b54]">
              Direct Live Proxy → /api/lore/legendkeeper &amp; /api/lore/article/:resourceId (Zero Mock Data)
            </p>
          </div>
        </div>
        {!isEmbedded && (
          <button
            onClick={onClose}
            className="p-1 text-[#a78b54] hover:text-[#ffd700] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="relative flex-1 min-w-[180px]">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            placeholder="Query live LegendKeeper v3 world archives..."
            className="w-full bg-[#180f08] border border-[#5e3b1c] rounded px-3 py-1.5 pl-8 text-xs text-[#ffd700] placeholder-[#8c7456] focus:outline-none focus:border-[#ffd700] font-sans"
          />
          <Search className="w-4 h-4 text-[#8c7456] absolute left-2.5 top-2" />
        </div>
        <button
          onClick={() => {
            playKeyClick();
            handleSearch(query);
          }}
          disabled={loading}
          className="px-3 py-1.5 bg-[#291708] border border-[#d4af37] text-[#ffd700] hover:bg-[#3d240e] rounded text-xs uppercase tracking-wider font-bold transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
        </button>
      </div>

      {/* Diagnostic Alert Panel when LK_API_KEY / LEGENDKEEPER_API_KEY is missing or unauthorized */}
      {bridgeStatus === 'CREDENTIALS_REQUIRED' && (
        <div className="mb-3 p-3.5 rounded-lg bg-red-950/60 border border-red-500/60 font-mono text-xs text-red-200 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>[LK BRIDGE: CREDENTIALS REQUIRED]</span>
          </div>
          <p className="text-[11px] text-red-200/90 leading-relaxed">
            {diagnosticReason ||
              'Live LegendKeeper v3 credentials (LEGENDKEEPER_API_KEY / LK_API_KEY) or root map ID were not returned by the Cloudflare Worker.'}
          </p>
          <p className="text-[10px] text-amber-300/80">
            Mock/placeholder pins have been purged. Configure <code className="text-white">LEGENDKEEPER_API_KEY</code> and <code className="text-white">LEGENDKEEPER_PROJECT_ID</code> in Cloudflare Pages secrets (or local <code className="text-white">.dev.vars</code>) to stream live maps and articles.
          </p>
        </div>
      )}

      {/* Breadcrumb Trail */}
      {breadcrumbs.length > 0 && selectedDoc && (
        <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono text-[#a78b54] mb-2 bg-[#140b05] px-2.5 py-1 rounded border border-[#5e3b1c]/50">
          <button
            onClick={() => {
              playOptionSelect();
              setSelectedDoc(null);
            }}
            className="hover:text-[#ffd700] underline cursor-pointer"
          >
            Atlas Root
          </button>
          {breadcrumbs.map((crumb) => (
            <React.Fragment key={crumb.id}>
              <span>/</span>
              <button
                onClick={() => {
                  playOptionSelect();
                  handleOpenArticle(crumb.id);
                }}
                className={`hover:text-[#ffd700] cursor-pointer ${
                  crumb.id === selectedDoc.resourceId ? 'text-[#ffd700] font-bold' : ''
                }`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 font-sans text-xs">
        {selectedDoc ? (
          <div className="space-y-3 bg-[#140b05] border border-[#5e3b1c]/80 rounded-lg p-4">
            <div className="flex flex-wrap justify-between items-start gap-2 border-b border-[#5e3b1c]/40 pb-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-[#291708] border border-[#ffd700]/40 text-[9px] font-mono text-[#ffd700] uppercase">
                    {selectedDoc.tier}
                  </span>
                  {selectedDoc.hasSubMap && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-400/50 text-[9px] font-mono text-emerald-300 flex items-center gap-1">
                      <Compass className="w-2.5 h-2.5 animate-spin" />
                      SUB-MAP PORTAL ACTIVE
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-base font-bold text-[#ffd700] mt-1">{selectedDoc.name}</h3>
              </div>
              <button
                onClick={() => {
                  playOptionSelect();
                  setSelectedDoc(null);
                }}
                className="text-[10px] font-mono text-[#a78b54] hover:text-[#ffd700] underline cursor-pointer"
              >
                ← Back to Search Results
              </button>
            </div>

            <div className="text-stone-200 leading-relaxed whitespace-pre-line text-xs font-serif bg-black/30 p-3 rounded border border-[#5e3b1c]/40">
              {selectedDoc.markdown}
            </div>

            {selectedDoc.subMapChildren.length > 0 && (
              <div className="pt-2 border-t border-[#5e3b1c]/40">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-400 mb-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Dive Inside Nested Sub-Map Portals ({selectedDoc.subMapChildren.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDoc.subMapChildren.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => {
                        playOptionSelect();
                        handleOpenArticle(child.id);
                      }}
                      className="flex items-center justify-between p-2.5 rounded bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/40 text-left transition-all cursor-pointer group"
                    >
                      <div>
                        <div className="text-xs font-serif font-bold text-[#ffd700] group-hover:text-white">
                          ◎ {child.name}
                        </div>
                        <div className="text-[9px] font-mono text-emerald-300/80">{child.tier}</div>
                      </div>
                      <Compass className="w-4 h-4 text-emerald-400 group-hover:rotate-45 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedDoc.mentions.length > 0 && (
              <div className="pt-2 border-t border-[#5e3b1c]/40">
                <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[#a78b54] mb-1.5">
                  <AtSign className="w-3 h-3 text-[#ffd700]" />
                  <span>Linked @page Mentions</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDoc.mentions.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        playOptionSelect();
                        handleOpenArticle(m.id);
                      }}
                      className="px-2 py-1 rounded bg-[#291708] hover:bg-[#3d240e] border border-[#d4af37]/50 text-[10px] font-mono text-[#ffd700] cursor-pointer transition-colors"
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : results.length > 0 ? (
          results.map((hit, index) => (
            <div
              key={index}
              onClick={() => {
                playOptionSelect();
                handleOpenArticle(hit.resource.id || hit.resource.name, true);
              }}
              className="p-3 bg-[#140b05] border border-[#5e3b1c]/60 hover:border-[#ffd700]/70 rounded cursor-pointer transition-colors flex justify-between items-center group"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-bold text-[#ffd700] text-sm group-hover:text-white">
                    {hit.resource.name}
                  </h4>
                  {hit.resource.hasSubMap && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[8.5px] font-mono text-emerald-300">
                      ◎ SUB-MAP PORTAL
                    </span>
                  )}
                </div>
                {hit.document?.highlights && hit.document.highlights.length > 0 && (
                  <p className="text-[11px] text-stone-400 mt-1 italic line-clamp-2">
                    {hit.document.highlights[0].segment}
                  </p>
                )}
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#8c7456] group-hover:text-[#ffd700] shrink-0 ml-3" />
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-stone-500 font-mono text-xs">
            {loading
              ? 'Querying live LegendKeeper v3 edge bridge...'
              : bridgeStatus === 'CREDENTIALS_REQUIRED'
              ? '[LK BRIDGE: CREDENTIALS REQUIRED] — Connect LegendKeeper API credentials to populate live pins and articles.'
              : 'Enter a query above to search live LegendKeeper v3 documents.'}
          </div>
        )}
      </div>
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md">
      {content}
    </div>
  );
};
