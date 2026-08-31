'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider, useToast } from '@/components/ui/ToastProvider';
import { BOARD_TEMPLATES } from '@/lib/templates-data';
import { saveBoard, createBoardFromTemplate } from '@/lib/firestore-boards';
import { Layers, ArrowRight, Sparkles, Tag, Play } from 'lucide-react';

function TemplatesPageInner() {
  const router = useRouter();
  const { showToast } = useToast();

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

      <main className="flex-1 py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-12">
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
            Jumpstart your brainstorm with pre-structured spatial topologies. Each template is pre-seeded with human anchor notes and suggested WebMCP agent prompts.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BOARD_TEMPLATES.map(tmpl => (
            <div
              key={tmpl.id}
              className="p-6 rounded-2xl border-2 border-[#1D1A16] bg-[#FFFDF6] shadow-[4px_4px_0_#1D1A16] flex flex-col justify-between hover:bg-[#F4EFE4]/80 transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-[#1D1A16] text-[#F4EFE4]">
                    {tmpl.category}
                  </span>
                  {tmpl.badge && (
                    <span className="text-[10px] font-bold text-[#E24E1B] bg-[#FFD8C7] px-2 py-0.5 rounded-full border border-[#E24E1B]/30">
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
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1D1A16] text-white text-xs font-bold shadow-[2px_2px_0_#6B6353] group-hover:bg-[#E24E1B] group-hover:shadow-[2px_2px_0_#B33A10] active:translate-x-[1px] active:translate-y-[1px] transition-all"
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
