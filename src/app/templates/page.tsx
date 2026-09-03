'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider, useToast } from '@/components/ui/ToastProvider';
import { BOARD_TEMPLATES } from '@/lib/templates-data';
import { TemplateCategory } from '@/lib/types';
import { resolveBrandOrSignIcon } from '@/components/ui/BrandIcons';
import { saveBoard, createBoardFromTemplate } from '@/lib/firestore-boards';
import {
  Layers,
  ArrowRight,
  Sparkles,
  Tag,
  Search,
  Cpu,
  Cloud,
  Database,
  Boxes,
  TrendingUp,
} from 'lucide-react';

const CATEGORY_TABS: { label: string; value: TemplateCategory; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: 'All', value: 'All', icon: Layers },
  { label: 'AI & Agents', value: 'AI & Agents', icon: Cpu },
  { label: 'Cloud & Infra', value: 'Cloud & Infra', icon: Cloud },
  { label: 'Databases & ERD', value: 'Databases & ERD', icon: Database },
  { label: 'Product & SaaS', value: 'Product & SaaS', icon: Boxes },
  { label: 'Strategy', value: 'Strategy', icon: TrendingUp },
];

function TemplatesPageInner() {
  const router = useRouter();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('All');

  const filteredTemplates = useMemo(() => {
    return BOARD_TEMPLATES.filter(tmpl => {
      const matchCategory =
        selectedCategory === 'All' || tmpl.category === selectedCategory;
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

  const handleUseTemplate = async (templateId: string) => {
    const tmpl = BOARD_TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;

    const boardState = createBoardFromTemplate(tmpl);
    await saveBoard('default', boardState);
    showToast(`Loaded "${tmpl.title}" into canvas!`, 'ok');
    router.push('/canvas');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4EFE4]">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE9A8] border border-[#1D1A16] text-xs font-bold text-[#1D1A16]">
            <Layers className="w-3.5 h-3.5 text-[#E24E1B]" />
            <span>Curated Strategy & Architecture Tapestries</span>
          </div>
          <h1 className="font-['Fraunces'] italic font-bold text-4xl sm:text-5xl text-[#1D1A16]">
            Templates for Human + Agent Pairing
          </h1>
          <p className="text-sm sm:text-base text-[#6B6353] font-['Space_Grotesk'] leading-relaxed">
            Jumpstart your brainstorm with pre-structured spatial topologies. Each template is pre-seeded with SQL entity tables, geometric decision shapes, authentic tech vector logos, and WebMCP agent prompts.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#FFFDF6] p-4 rounded-2xl border-2 border-[#1D1A16] shadow-[4px_4px_0_#1D1A16]">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#6B6353] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search RAG, Kafka, Postgres, Stripe..."
              className="w-full pl-9 pr-4 py-2 text-xs font-mono bg-[#F4EFE4]/60 border border-[#1D1A16] rounded-xl outline-none focus:ring-2 focus:ring-[#E24E1B]"
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
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto py-0.5">
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

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(tmpl => (
            <div
              key={tmpl.id}
              className="p-6 rounded-2xl border-2 border-[#1D1A16] bg-[#FFFDF6] shadow-[4px_4px_0_#1D1A16] flex flex-col justify-between hover:bg-[#F4EFE4]/80 hover:shadow-[6px_6px_0_#1D1A16] hover:-translate-y-0.5 transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-[#1D1A16] text-[#F4EFE4]">
                    {tmpl.category}
                  </span>
                  {tmpl.badge && (
                    <span className="text-[10px] font-bold text-[#E24E1B] bg-[#FFD8C7] px-2 py-0.5 rounded-full border border-[#E24E1B]/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      {tmpl.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-['Fraunces'] italic font-bold text-xl text-[#1D1A16] group-hover:text-[#E24E1B] transition-colors">
                    {tmpl.title}
                  </h3>
                  <p className="text-xs text-[#6B6353] mt-2 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>

                {/* Stack Icons if present */}
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

                {/* Suggested Prompt Box */}
                <div className="p-3 rounded-xl bg-[#F4EFE4] border border-[#DCD4C2] text-xs">
                  <span className="font-mono text-[10px] font-bold text-[#E24E1B] uppercase flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3" /> Agent Mission Prompt:
                  </span>
                  <p className="font-mono text-[11px] text-[#403A2F] italic line-clamp-3">
                    "{tmpl.suggestedPrompt}"
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#6B6353] font-mono">
                  <span>{tmpl.nodes.length} starting nodes</span>
                  <span>·</span>
                  <span>{tmpl.edges.length} pre-wired links</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleUseTemplate(tmpl.id)}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1D1A16] text-white text-xs font-bold shadow-[2px_2px_0_#6B6353] group-hover:bg-[#E24E1B] group-hover:shadow-[2px_2px_0_#B33A10] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
              >
                <span>Open in Canvas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <ToastProvider>
      <TemplatesPageInner />
    </ToastProvider>
  );
}
