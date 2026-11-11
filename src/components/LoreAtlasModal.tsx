import React, { useState, useEffect } from 'react';
import { Search, BookOpen, ExternalLink, X, Loader2 } from 'lucide-react';

interface LoreAtlasModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  isEmbedded?: boolean;
}

export const LoreAtlasModal: React.FC<LoreAtlasModalProps> = ({ isOpen, onClose, initialQuery = '', isEmbedded = false }) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<{ title: string; text: string; link?: string } | null>(null);

  useEffect(() => {
    if (isOpen && initialQuery) {
      handleSearch(initialQuery);
    }
  }, [isOpen, initialQuery]);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setSelectedDoc(null);
    try {
      const res = await fetch(`/api/lore/legendkeeper?q=${encodeURIComponent(searchTerm)}`);
      if (res.ok) {
        const body = await res.json();
        setResults(body.data || []);
      }
    } catch (err) {
      console.error('Lore search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDoc = async (resourceId: string, docId?: string, title?: string) => {
    setLoading(true);
    try {
      let docText = '';
      if (docId) {
        const res = await fetch(`/api/lore/legendkeeper?resource_id=${resourceId}&doc_id=${docId}`);
        if (res.ok) {
          const body = await res.json();
          docText = body.text || 'No textual content available.';
        }
      } else {
        const res = await fetch(`/api/lore/legendkeeper?resource_id=${resourceId}`);
        if (res.ok) {
          const body = await res.json();
          docText = body.name ? `Resource: ${body.name}` : 'Details loaded.';
        }
      }

      setSelectedDoc({
        title: title || 'Codex Entry',
        text: docText,
        link: `https://app.legendkeeper.com`,
      });
    } catch (err) {
      console.error('Fetch lore doc error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const content = (
    <div className={`relative w-full ${isEmbedded ? 'h-full flex-1' : 'max-w-2xl border-2 border-[#7d561a] rounded-2xl shadow-2xl max-h-[85vh]'} bg-[#0c0804] p-4 sm:p-6 text-[#d4af37] flex flex-col font-serif overflow-hidden`}>
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#5e3b1c]/70 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#ffd700]" />
          <h2 className="text-base sm:text-lg font-bold text-[#ffd700] tracking-wide">
            Grand Codex &amp; Atlas (LegendKeeper Live)
          </h2>
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
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            placeholder="Search lore, gods, locales, history in LegendKeeper..."
            className="w-full bg-[#180f08] border border-[#5e3b1c] rounded px-3 py-1.5 pl-8 text-xs text-[#ffd700] placeholder-[#8c7456] focus:outline-none focus:border-[#ffd700] font-sans"
          />
          <Search className="w-4 h-4 text-[#8c7456] absolute left-2.5 top-2" />
        </div>
        <button
          onClick={() => handleSearch(query)}
          disabled={loading}
          className="px-3 py-1.5 bg-[#291708] border border-[#d4af37] text-[#ffd700] hover:bg-[#3d240e] rounded text-xs uppercase tracking-wider font-bold transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 font-sans text-xs">
        {selectedDoc ? (
          <div className="space-y-3 bg-[#140b05] border border-[#5e3b1c]/80 rounded p-4">
            <div className="flex justify-between items-start border-b border-[#5e3b1c]/40 pb-2">
              <h3 className="font-serif text-sm font-bold text-[#ffd700]">{selectedDoc.title}</h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-[10px] text-[#a78b54] hover:text-[#ffd700] underline cursor-pointer"
              >
                ← Back to results
              </button>
            </div>
            <p className="text-stone-300 leading-relaxed whitespace-pre-line text-xs font-serif">
              {selectedDoc.text}
            </p>
          </div>
        ) : results.length > 0 ? (
          results.map((hit, index) => (
            <div
              key={index}
              onClick={() =>
                handleViewDoc(
                  hit.resource.id,
                  hit.document?.id,
                  hit.resource.name
                )
              }
              className="p-3 bg-[#140b05] border border-[#5e3b1c]/60 hover:border-[#ffd700]/70 rounded cursor-pointer transition-colors flex justify-between items-center group"
            >
              <div>
                <h4 className="font-serif font-bold text-[#ffd700] text-sm group-hover:text-white">
                  {hit.resource.name}
                </h4>
                {hit.document?.highlights && hit.document.highlights.length > 0 && (
                  <p className="text-[11px] text-stone-400 mt-1 italic line-clamp-2">
                    "...{hit.document.highlights[0].segment}..."
                  </p>
                )}
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#8c7456] group-hover:text-[#ffd700] shrink-0 ml-3" />
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-stone-500 font-sans italic text-xs">
            {loading ? 'Consulting the grand library in LegendKeeper...' : 'Enter a query to search the live LegendKeeper world archives.'}
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
