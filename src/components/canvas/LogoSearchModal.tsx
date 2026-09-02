'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Sparkles, Layers, Check, ShieldAlert, Cpu } from 'lucide-react';
import {
  AVAILABLE_LOGOS,
  AVAILABLE_SIGNS,
  DynamicGilbarbaraIcon,
  LogoMeta,
  SignMeta,
  IconProps,
} from '@/components/ui/BrandIcons';
import { GILBARBARA_LOGOS, GilbarbaraLogoItem } from '@/lib/all-logos-catalog';

export interface LogoSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLogo: (logoId: string) => void;
  onSelectSign?: (signId: string) => void;
  initialCategory?: string;
  targetNodeTitle?: string;
}

type CatalogCategory =
  | 'all'
  | 'aws'
  | 'cloud'
  | 'ai'
  | 'database'
  | 'framework'
  | 'language'
  | 'infra'
  | 'tool'
  | 'analytics'
  | 'payments'
  | 'signs';

interface CategoryTab {
  id: CatalogCategory;
  label: string;
  count?: number;
}

const CATEGORIES: CategoryTab[] = [
  { id: 'all', label: 'All 1,900+ Logos' },
  { id: 'aws', label: 'AWS Suite (45+)' },
  { id: 'cloud', label: 'Cloud & Hosting' },
  { id: 'ai', label: 'AI & LLMs' },
  { id: 'database', label: 'Databases & Vector' },
  { id: 'framework', label: 'Frameworks & UI' },
  { id: 'language', label: 'Languages' },
  { id: 'infra', label: 'DevOps & Infra' },
  { id: 'tool', label: 'DevTools & SaaS' },
  { id: 'analytics', label: 'Monitoring & APM' },
  { id: 'payments', label: 'Payments & Auth' },
  { id: 'signs', label: 'Road & Status Signs' },
];

export function LogoSearchModal({
  isOpen,
  onClose,
  onSelectLogo,
  onSelectSign,
  initialCategory = 'all',
  targetNodeTitle,
}: LogoSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CatalogCategory>(
    (initialCategory as CatalogCategory) || 'all'
  );
  const [displayCount, setDisplayCount] = useState(96);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDisplayCount(96);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    setDisplayCount(96);
  }, [searchQuery, activeCategory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Combined searchable logos: AVAILABLE_LOGOS + GILBARBARA_LOGOS (1,876 items)
  const combinedLogos = useMemo(() => {
    const seenIds = new Set<string>();
    const list: Array<{
      id: string;
      name: string;
      category: string;
      file?: string;
      color?: string;
      isGilbarbara?: boolean;
      iconComponent?: React.ComponentType<IconProps>;
    }> = [];

    // 1. First add bundled & developer-icons
    AVAILABLE_LOGOS.forEach(l => {
      seenIds.add(l.id.toLowerCase());
      list.push({
        id: l.id,
        name: l.name,
        category: l.category,
        color: l.color,
        iconComponent: l.icon,
      });
    });

    // 2. Add all 1,876 Gilbarbara SVG icons
    GILBARBARA_LOGOS.forEach(g => {
      const cleanId = `gil-${g.id}`;
      if (seenIds.has(g.id.toLowerCase()) || seenIds.has(cleanId.toLowerCase())) return;
      seenIds.add(cleanId.toLowerCase());
      list.push({
        id: cleanId,
        name: g.name,
        category: g.cat,
        file: g.file,
        isGilbarbara: true,
      });
    });

    return list;
  }, []);

  // Filtered lists
  const filteredLogos = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return combinedLogos.filter(logo => {
      // Category filter
      if (activeCategory === 'aws') {
        if (!logo.id.toLowerCase().includes('aws') && !logo.name.toLowerCase().includes('aws')) return false;
      } else if (activeCategory === 'signs') {
        return false;
      } else if (activeCategory !== 'all') {
        if (logo.category !== activeCategory) return false;
      }

      // Search query filter
      if (!q) return true;
      return (
        logo.id.toLowerCase().includes(q) ||
        logo.name.toLowerCase().includes(q) ||
        logo.category.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, activeCategory, combinedLogos]);

  const filteredSigns = useMemo(() => {
    if (activeCategory !== 'all' && activeCategory !== 'signs') return [];
    const q = searchQuery.toLowerCase().trim();
    return AVAILABLE_SIGNS.filter(sign => {
      if (!q) return true;
      return (
        sign.id.toLowerCase().includes(q) ||
        sign.name.toLowerCase().includes(q) ||
        sign.defaultTitle.toLowerCase().includes(q) ||
        sign.defaultBody.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, activeCategory]);

  const totalResultsCount = filteredLogos.length + filteredSigns.length;
  const visibleLogos = filteredLogos.slice(0, displayCount);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in select-none">
      {/* Modal Container */}
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-2xl shadow-[8px_8px_0_#1D1A16] overflow-hidden flex flex-col max-h-[85vh] animate-note-pop"
      >
        {/* Header with Search Input */}
        <div className="p-4 border-b border-[#DCD4C2] bg-[#F4EFE4]/60">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E24E1B] text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-['Space_Grotesk'] font-bold text-base text-[#1D1A16] leading-tight">
                  Architecture Logo & Icon Catalog
                </h2>
                <p className="text-xs text-[#6B6353]">
                  {targetNodeTitle
                    ? `Assigning vector icon to "${targetNodeTitle}"`
                    : 'Click any logo to add as a standalone vector architecture icon'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#DCD4C2] hover:bg-[#1D1A16] hover:text-white transition-colors cursor-pointer text-[#1D1A16]"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6353]" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search 150+ logos & signs: AWS S3, Lambda, OpenAI, Docker, Postgres, React, Redis..."
              className="w-full pl-10 pr-10 py-2.5 bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-xl text-sm font-['Space_Grotesk'] text-[#1D1A16] placeholder:text-[#6B6353]/70 focus:outline-none focus:ring-2 focus:ring-[#E24E1B] shadow-[2px_2px_0_#1D1A16]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B6353] hover:text-[#1D1A16] p-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#1D1A16] text-[#FFFDF6] shadow-xs'
                    : 'bg-[#FFFDF6] text-[#6B6353] border border-[#DCD4C2] hover:border-[#1D1A16] hover:text-[#1D1A16]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Tech & Brand Logos Grid */}
          {visibleLogos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B6353]">
                  Tech & Brand Logos ({filteredLogos.length})
                </span>
                {filteredLogos.length > displayCount && (
                  <span className="text-[10px] font-mono text-[#6B6353]">
                    Showing 1-{visibleLogos.length} of {filteredLogos.length}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {visibleLogos.map(logo => {
                  const Icon = logo.iconComponent;
                  return (
                    <button
                      key={logo.id}
                      onClick={() => {
                        onSelectLogo(logo.id);
                        onClose();
                      }}
                      className="group flex flex-col items-center text-center p-3 rounded-xl bg-[#FFFDF6] border-2 border-[#1D1A16]/20 hover:border-[#1D1A16] hover:shadow-[3px_3px_0_#1D1A16] hover:-translate-y-0.5 transition-all cursor-pointer relative"
                    >
                      {/* Icon Tile */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#F4EFE4]/50 group-hover:bg-[#FFFDF6] border border-[#1D1A16]/10 mb-2 transition-colors p-1.5"
                        style={{ color: logo.color }}
                      >
                        {logo.isGilbarbara && logo.file ? (
                          <DynamicGilbarbaraIcon file={logo.file} size={28} />
                        ) : Icon ? (
                          <Icon size={28} />
                        ) : null}
                      </div>

                      {/* Name */}
                      <span className="font-['Space_Grotesk'] font-bold text-xs text-[#1D1A16] truncate max-w-full block">
                        {logo.name}
                      </span>

                      {/* Category Chip */}
                      <span className="text-[9px] font-mono text-[#6B6353] uppercase tracking-wider mt-0.5">
                        {logo.category}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Load More Pagination */}
              {filteredLogos.length > displayCount && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setDisplayCount(prev => prev + 96)}
                    className="px-4 py-2 rounded-xl bg-[#F4EFE4] hover:bg-[#FFE9A8] text-xs font-bold text-[#1D1A16] border border-[#1D1A16]/30 shadow-2xs transition-all cursor-pointer"
                  >
                    Load More Logos ({filteredLogos.length - displayCount} remaining)...
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Road & Status Signs Grid */}
          {filteredSigns.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B6353]">
                  Road & Status Signs ({filteredSigns.length})
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {filteredSigns.map(sign => {
                  const Icon = sign.icon;
                  return (
                    <button
                      key={sign.id}
                      onClick={() => {
                        if (onSelectSign) {
                          onSelectSign(sign.id);
                        } else {
                          onSelectLogo(sign.id);
                        }
                        onClose();
                      }}
                      className="group flex flex-col items-center text-center p-3 rounded-xl bg-[#FFFDF6] border-2 border-[#1D1A16]/20 hover:border-[#1D1A16] hover:shadow-[3px_3px_0_#1D1A16] hover:-translate-y-0.5 transition-all cursor-pointer relative"
                    >
                      {/* Icon Tile */}
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#F4EFE4]/50 group-hover:bg-[#FFFDF6] border border-[#1D1A16]/10 mb-2 transition-colors">
                        <Icon size={26} style={{ color: sign.color }} />
                      </div>

                      {/* Name */}
                      <span className="font-['Space_Grotesk'] font-bold text-xs text-[#1D1A16] truncate max-w-full block">
                        {sign.name}
                      </span>

                      {/* Badge text */}
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded mt-1 text-white shadow-2xs"
                        style={{ backgroundColor: sign.color }}
                      >
                        SIGN
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {totalResultsCount === 0 && (
            <div className="py-12 text-center">
              <Search className="w-8 h-8 text-[#6B6353] mx-auto mb-2 opacity-50" />
              <p className="font-['Space_Grotesk'] font-bold text-sm text-[#1D1A16]">
                No matching logos or signs found
              </p>
              <p className="text-xs text-[#6B6353] mt-1">
                Try searching for "AWS", "database", "React", "AI", "Stripe", or "Snowflake"
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[#F4EFE4]/60 border-t border-[#DCD4C2] flex items-center justify-between text-xs text-[#6B6353]">
          <span>
            Showing {Math.min(displayCount, filteredLogos.length) + filteredSigns.length} of {totalResultsCount} vector items
          </span>
          <span className="font-mono text-[11px]">1,876+ SVGs from gilbarbara/logos & developer-icons</span>
        </div>
      </div>
    </div>
  );
}
