'use client';

import React, { useState, useMemo } from 'react';
import { BoardTemplate, TemplateCategory } from '@/lib/types';
import { BOARD_TEMPLATES } from '@/lib/templates-data';
import { resolveBrandOrSignIcon } from '@/components/ui/BrandIcons';
import {
  X,
  Search,
  Layers,
  Sparkles,
  Plus,
  RotateCcw,
  Tag,
  Boxes,
  Database,
  Cloud,
  Cpu,
  TrendingUp,
} from 'lucide-react';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string, mode: 'replace' | 'insert') => void;
}

const CATEGORY_TABS: { label: string; value: TemplateCategory; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: 'All Templates', value: 'All', icon: Layers },
  { label: 'AI & Agents', value: 'AI & Agents', icon: Cpu },
  { label: 'Cloud & Infra', value: 'Cloud & Infra', icon: Cloud },
  { label: 'Databases & ERD', value: 'Databases & ERD', icon: Database },
  { label: 'Product & SaaS', value: 'Product & SaaS', icon: Boxes },
  { label: 'Strategy', value: 'Strategy', icon: TrendingUp },
];

export function TemplatesModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplatesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('All');

  const filteredTemplates = useMemo(() => {
    return BOARD_TEMPLATES.filter(tmpl => {
      // Category match
      const matchCategory =
        selectedCategory === 'All' || tmpl.category === selectedCategory;

      // Query match
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        tmpl.title.toLowerCase().includes(q) ||
        tmpl.description.toLowerCase().includes(q) ||
        tmpl.category.toLowerCase().includes(q) ||
        (tmpl.tags && tmpl.tags.some(t => t.toLowerCase().includes(q)));

      return matchCategory && matchQuery;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1D1A16]/60 backdrop-blur-xs animate-note-pop"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-[8px_8px_0_#1D1A16] overflow-hidden">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b-2 border-[#1D1A16] bg-[#F4EFE4]/80 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFE9A8] border-2 border-[#1D1A16] flex items-center justify-center shadow-[2px_2px_0_#1D1A16]">
              <Layers className="w-5 h-5 text-[#E24E1B]" />
            </div>
            <div>
              <h2 className="font-['Fraunces'] italic font-bold text-2xl text-[#1D1A16] leading-tight">
                Architecture & Strategy Templates
              </h2>
              <p className="font-['Space_Grotesk'] text-xs text-[#6B6353]">
                Production topologies with ERD tables, shapes, vector logos, and pre-wired flow DAGs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl border-2 border-[#1D1A16] bg-[#FFFDF6] hover:bg-[#F4EFE4] transition-colors cursor-pointer text-[#1D1A16]"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="px-6 py-3 border-b border-[#DCD4C2] bg-[#FFFDF6] flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#6B6353] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by tech, RAG, Kafka, Postgres, Stripe..."
              className="w-full pl-9 pr-4 py-2 text-xs font-mono bg-[#F4EFE4]/60 border border-[#1D1A16] rounded-xl outline-none focus:ring-2 focus:ring-[#E24E1B] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B6353] hover:text-[#1D1A16]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {CATEGORY_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = selectedCategory === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setSelectedCategory(tab.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#1D1A16] text-[#FFFDF6] shadow-[2px_2px_0_#E24E1B]'
                      : 'bg-[#F4EFE4] text-[#6B6353] hover:text-[#1D1A16] hover:bg-[#EAE2D2]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Template Cards Grid */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#F4EFE4]/30 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <Boxes className="w-12 h-12 text-[#6B6353]/40 mx-auto mb-3" />
              <p className="font-['Fraunces'] italic font-bold text-lg text-[#1D1A16]">
                No templates matched "{searchQuery}"
              </p>
              <p className="text-xs text-[#6B6353] mt-1">
                Try searching for "RAG", "Postgres", "Microservices", or clear your filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-[#1D1A16] text-white text-xs font-bold shadow-xs hover:bg-[#E24E1B] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredTemplates.map(tmpl => (
              <div
                key={tmpl.id}
                className="p-5 rounded-2xl border-2 border-[#1D1A16] bg-[#FFFDF6] shadow-[4px_4px_0_#1D1A16] flex flex-col justify-between hover:shadow-[6px_6px_0_#1D1A16] hover:-translate-y-0.5 transition-all group"
              >
                <div className="space-y-3">
                  {/* Category & Badge Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1D1A16] text-[#FFFDF6]">
                      {tmpl.category}
                    </span>
                    {tmpl.badge && (
                      <span className="text-[10px] font-bold text-[#E24E1B] bg-[#FFD8C7] px-2 py-0.5 rounded-full border border-[#E24E1B]/30 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        {tmpl.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-['Fraunces'] italic font-bold text-lg text-[#1D1A16] group-hover:text-[#E24E1B] transition-colors leading-snug">
                      {tmpl.title}
                    </h3>
                    <p className="text-xs text-[#6B6353] mt-1.5 line-clamp-3 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>

                  {/* Tech Stack Icons Preview if present */}
                  {tmpl.stackIcons && tmpl.stackIcons.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-mono text-[#6B6353] mr-1">Stack:</span>
                      {tmpl.stackIcons.map(iconId => {
                        const Icon = resolveBrandOrSignIcon(iconId);
                        return (
                          <span
                            key={iconId}
                            title={iconId.toUpperCase()}
                            className="w-6 h-6 rounded-lg bg-[#F4EFE4] border border-[#DCD4C2] flex items-center justify-center p-0.5 shadow-2xs"
                          >
                            {Icon ? <Icon size={14} /> : <Tag className="w-3 h-3 text-[#6B6353]" />}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Architecture Stats */}
                  <div className="flex items-center gap-3 text-[11px] text-[#6B6353] font-mono border-t border-[#DCD4C2]/60 pt-2.5">
                    <span>{tmpl.nodes.length} nodes</span>
                    <span>·</span>
                    <span>{tmpl.edges.length} pre-wired wires</span>
                  </div>

                  {/* Agent Mission Prompt Snippet */}
                  {tmpl.suggestedPrompt && (
                    <div className="p-2.5 rounded-xl bg-[#F4EFE4] border border-[#DCD4C2] text-xs">
                      <span className="font-mono text-[9px] font-bold text-[#E24E1B] uppercase tracking-wider block mb-0.5">
                        Agent Mission Prompt:
                      </span>
                      <p className="font-mono text-[10px] text-[#403A2F] italic line-clamp-2">
                        "{tmpl.suggestedPrompt}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Dual Action Buttons */}
                <div className="mt-4 pt-3 border-t border-[#DCD4C2]/60 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectTemplate(tmpl.id, 'insert')}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#FFFDF6] border-2 border-[#1D1A16] text-[#1D1A16] text-xs font-bold shadow-[2px_2px_0_#1D1A16] hover:bg-[#DCEBC8] hover:border-[#2E5E1B] hover:text-[#2E5E1B] transition-all cursor-pointer"
                    title="Insert template next to your current canvas notes without overwriting"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Insert</span>
                  </button>

                  <button
                    onClick={() => onSelectTemplate(tmpl.id, 'replace')}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#1D1A16] text-white text-xs font-bold shadow-[2px_2px_0_#6B6353] hover:bg-[#E24E1B] hover:shadow-[2px_2px_0_#B33A10] transition-all cursor-pointer"
                    title="Start fresh: Clears canvas and loads clean template"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replace</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
