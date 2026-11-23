import React, { useState, useEffect } from 'react';
import { Search, BookOpen, ExternalLink, X, Loader2, Compass, Layers, AtSign } from 'lucide-react';
import {
  CANONICAL_GLOBE_PINS,
  resolveCanonicalLoreArticle,
  LoreArticleDossier,
} from '../utils/legendKeeperData';
import { playKeyClick, playOptionSelect } from '../utils/audio';

interface LoreAtlasModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  isEmbedded?: boolean;
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
  const [selectedDoc, setSelectedDoc] = useState<LoreArticleDossier | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        setQuery(initialQuery);
        handleOpenArticle(initialQuery, true);
      } else {
        // Default populate with Tier 1..4 canonical pins
        setResults(
          CANONICAL_GLOBE_PINS.map((m) => ({
            resource: {
              id: m.resourceId || m.id,
              name: m.name,
              tags: [m.tier, `Tier ${m.tierLevel || 2}`],
              hasSubMap: m.hasSubMap,
            },
            document: {
              id: `doc-${m.resourceId || m.id}`,
              name: m.name,
              highlights: [
                {
                  segment: `${m.name} (${m.tier.toUpperCase()}) — Lat ${m.lat.toFixed(1)}°, Lng ${m.lng.toFixed(1)}°`,
                },
              ],
            },
          }))
        );
      }
    }
  }, [isOpen, initialQuery]);

  const handleOpenArticle = async (idOrQuery: string, resetCrumbs = false) => {
    setLoading(true);
    const localDossier = resolveCanonicalLoreArticle(idOrQuery);
    try {
      const slug = localDossier.resourceId || idOrQuery.toLowerCase().trim().replace(/\s+/g, '-');
      const res = await fetch(`/api/lore/article/${encodeURIComponent(slug)}`);
      if (res.ok) {
        const body = await res.json();
        const merged: LoreArticleDossier = {
          id: body.id || localDossier.id,
          resourceId: body.resourceId || localDossier.resourceId,
          name: body.name || localDossier.name,
          tier: body.tier || localDossier.tier,
          tierLevel: body.tierLevel || localDossier.tierLevel,
          summary: localDossier.summary,
          markdown: body.markdown || body.text || localDossier.markdown,
          mentions:
            Array.isArray(body.mentions) && body.mentions.length > 0
              ? body.mentions
              : localDossier.mentions,
          hasSubMap: body.hasSubMap ?? localDossier.hasSubMap,
          subMapChildren:
            Array.isArray(body.subMapChildren) && body.subMapChildren.length > 0
              ? body.subMapChildren
              : localDossier.subMapChildren,
        };
        setSelectedDoc(merged);
        setBreadcrumbs((prev) =>
          resetCrumbs
            ? [{ id: merged.resourceId, name: merged.name }]
            : [...prev.filter((b) => b.id !== merged.resourceId), { id: merged.resourceId, name: merged.name }]
        );
        return;
      }
    } catch {
      // Fallback to local canonical dossier
    } finally {
      setLoading(false);
    }

    setSelectedDoc(localDossier);
    setBreadcrumbs((prev) =>
      resetCrumbs
        ? [{ id: localDossier.resourceId, name: localDossier.name }]
        : [...prev.filter((b) => b.id !== localDossier.resourceId), { id: localDossier.resourceId, name: localDossier.name }]
    );
  };

  const handleSearch = async (searchTerm: string) => {
    setLoading(true);
    setSelectedDoc(null);
    const qStr = searchTerm.trim();
    try {
      const res = await fetch(`/api/lore/legendkeeper?q=${encodeURIComponent(qStr)}`);
      if (res.ok) {
        const body = await res.json();
        if (Array.isArray(body.data) && body.data.length > 0) {
          setResults(body.data);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fallback to canonical search
    }

    const lower = qStr.toLowerCase();
    const matches = lower
      ? CANONICAL_GLOBE_PINS.filter(
          (p) => p.name.toLowerCase().includes(lower) || p.resourceId?.toLowerCase().includes(lower)
        )
      : CANONICAL_GLOBE_PINS;
    setResults(
      (matches.length > 0 ? matches : CANONICAL_GLOBE_PINS).map((m) => ({
        resource: {
          id: m.resourceId || m.id,
          name: m.name,
          tags: [m.tier, `Tier ${m.tierLevel || 2}`],
          hasSubMap: m.hasSubMap,
        },
        document: {
          id: `doc-${m.resourceId || m.id}`,
          name: m.name,
          highlights: [
            {
              segment: `${m.name} (${m.tier.toUpperCase()}) — Lat ${m.lat.toFixed(1)}°, Lng ${m.lng.toFixed(1)}°`,
            },
          ],
        },
      }))
    );
    setLoading(false);
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
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#5e3b1c]/70 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#ffd700]" />
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#ffd700] tracking-wide">
              Grand Codex &amp; Recursive Map Atlas (LegendKeeper v3)
            </h2>
            <p className="text-[10px] font-mono text-[#a78b54]">
              Tier 0 Solar System → Tier 1 Globe → Tier 2 Continent → Tier 3 City → Tier 4+ Street View
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

      {/* Search Bar & Quick Tier Portals */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="relative flex-1 min-w-[180px]">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            placeholder="Search Kray Providence, Crafton Cove, The Mydnight Rendezvous..."
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
                ← All Pins &amp; Locales
              </button>
            </div>

            <div className="text-stone-200 leading-relaxed whitespace-pre-line text-xs font-serif bg-black/30 p-3 rounded border border-[#5e3b1c]/40">
              {selectedDoc.markdown}
            </div>

            {/* Sub-Map Portal Diving Reticles (Tier N -> Tier N+1) */}
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

            {/* @page Mentions */}
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
          <div className="text-center py-8 text-stone-500 font-sans italic text-xs">
            {loading
              ? 'Consulting the grand library in LegendKeeper...'
              : 'Enter a query to search the live LegendKeeper world archives.'}
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
