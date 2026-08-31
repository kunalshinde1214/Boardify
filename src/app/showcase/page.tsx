'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { Presentation, Sparkles, ArrowRight, Bot, User, CheckCircle2, Play } from 'lucide-react';

function ShowcasePageInner() {
  const caseStudies = [
    {
      title: '5-Minute SaaS Pricing Strategy Session',
      duration: '4m 12s',
      badge: 'Strategy',
      overview: 'Human founder types a raw 3-tier pricing draft. Agent reads the canvas, identifies missing expansion revenue levers, maps pros/cons for per-seat vs usage pricing, and organizes the board into an executive proposal.',
      steps: [
        { actor: 'human', text: 'Drops 3 sticky notes for Starter ($29), Growth ($99), and Scale ($299).' },
        { actor: 'agent', tool: 'get_canvas_state', text: 'Reads note coordinates and pricing tiers.' },
        { actor: 'agent', tool: 'add_idea_node', text: 'Spawns 4 value metric candidates (Active Seats, Tool Calls, Board Storage).' },
        { actor: 'agent', tool: 'connect_nodes', text: 'Wires "Usage Levers" into Growth and Scale tiers.' },
        { actor: 'agent', tool: 'arrange_layout', text: 'Tidies notes into structured Cluster columns.' },
      ],
    },
    {
      title: 'Autonomous System Architecture Refactor',
      duration: '3m 45s',
      badge: 'Engineering',
      overview: 'Senior engineer sketches a basic monolithic backend. Browser agent detects single point of failure bottlenecks, spawns event stream and Redis cache nodes, and exports the final topology as a Mermaid diagram.',
      steps: [
        { actor: 'human', text: 'Draws API Gateway connected directly to Postgres DB.' },
        { actor: 'agent', tool: 'get_canvas_state', text: 'Analyzes connection density.' },
        { actor: 'agent', tool: 'add_idea_node', text: 'Creates "Redis Read Replica" and "Kafka Event Bus" notes.' },
        { actor: 'agent', tool: 'connect_nodes', text: 'Re-wires database queries through caching layer.' },
        { actor: 'agent', tool: 'export_canvas', text: 'Generates Mermaid diagram code for GitHub PR.' },
      ],
    },
    {
      title: 'Creative Narrative & Storyboard Arc',
      duration: '6m 20s',
      badge: 'Storytelling',
      overview: 'Screenwriter sketches Act 1 and Act 3. Agent fills the Act 2 midpoint reversal, suggests two character tension sub-plots, and lays the entire storyboard out in chronological timeline order.',
      steps: [
        { actor: 'human', text: 'Sets up Protagonist goal in Act 1 and Final Showdown in Act 3.' },
        { actor: 'agent', tool: 'add_idea_node', text: 'Spawns Midpoint Reversal and False Victory beats.' },
        { actor: 'agent', tool: 'connect_nodes', text: 'Links character motivations across acts.' },
        { actor: 'agent', tool: 'arrange_layout', text: 'Sequences the board from left to right along a timeline.' },
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F4EFE4]">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE9A8] border border-[#1D1A16] text-xs font-bold text-[#1D1A16]">
            <Presentation className="w-3.5 h-3.5 text-[#E24E1B]" />
            <span>Human + Agent Pairing Case Studies</span>
          </div>
          <h1 className="font-['Fraunces'] italic font-bold text-4xl sm:text-5xl text-[#1D1A16]">
            Watch WebMCP in Action
          </h1>
          <p className="text-sm sm:text-base text-[#6B6353] font-['Space_Grotesk'] leading-relaxed">
            Real session replays showing how humans and AI browser agents build, critique, and structure thoughts together on one spatial canvas.
          </p>
        </div>

        {/* Case Studies */}
        <div className="space-y-8">
          {caseStudies.map((cs, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-3xl border-2 border-[#1D1A16] bg-[#FFFDF6] shadow-[6px_6px_0_#1D1A16] space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCD4C2] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-[#1D1A16] text-[#F4EFE4]">
                      {cs.badge}
                    </span>
                    <span className="text-xs text-[#6B6353] font-mono">
                      Session duration: {cs.duration}
                    </span>
                  </div>
                  <h2 className="font-['Fraunces'] italic font-bold text-2xl text-[#1D1A16]">
                    {cs.title}
                  </h2>
                </div>

                <Link
                  href="/canvas"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E24E1B] text-white text-xs font-bold shadow-[2px_2px_0_#1D1A16] hover:bg-[#B33A10] transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Try in Canvas</span>
                </Link>
              </div>

              <p className="text-xs sm:text-sm text-[#403A2F] leading-relaxed">
                {cs.overview}
              </p>

              {/* Step Transcript */}
              <div className="space-y-2 pt-2">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#6B6353]">
                  Session Action Sequence
                </h4>
                <div className="space-y-2">
                  {cs.steps.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3 rounded-xl bg-[#F4EFE4] border border-[#DCD4C2] flex items-center justify-between text-xs gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {step.actor === 'agent' ? (
                          <span className="px-2 py-0.5 rounded bg-[#E24E1B] text-white text-[10px] font-bold flex items-center gap-1 flex-shrink-0">
                            <Sparkles className="w-2.5 h-2.5" /> AGENT
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-[#1D1A16] text-white text-[10px] font-bold flex-shrink-0">
                            YOU
                          </span>
                        )}
                        <span className="text-[#1D1A16] truncate">{step.text}</span>
                      </div>
                      {step.tool && (
                        <code className="text-[10px] font-mono font-bold text-[#E24E1B] bg-white px-2 py-0.5 rounded border border-[#DCD4C2] flex-shrink-0">
                          {step.tool}()
                        </code>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ShowcasePage() {
  return (
    <ToastProvider>
      <ShowcasePageInner />
    </ToastProvider>
  );
}
