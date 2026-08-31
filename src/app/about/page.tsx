'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { Info, Sparkles, CheckCircle2, Shield, ArrowRight, GitBranch, ExternalLink, Award, Users } from 'lucide-react';

function AboutPageInner() {
  const judges = [
    { name: 'Justin Rushing', role: 'Browser Platform Lead, OpenAI' },
    { name: 'Sarah Drasner', role: 'Distinguished Engineer, Chrome, Google' },
    { name: 'Jude Gao', role: 'Member of Technical Staff, Vercel · Next.js Core' },
    { name: 'Alex Nahas', role: 'Creator of MCP-B' },
    { name: 'Sean Roberts', role: 'VP of Applied AI, Netlify' },
    { name: 'Ilya Grigorik', role: 'Distinguished Engineer, Shopify' },
    { name: 'Andrew Galloni', role: 'VP Research & Innovation, Cloudflare' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F4EFE4]">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-8 max-w-5xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE9A8] border border-[#1D1A16] text-xs font-bold text-[#1D1A16]">
            <Award className="w-3.5 h-3.5 text-[#E24E1B]" />
            <span>WebMCP Challenge 2026 Submission Dossier</span>
          </div>
          <h1 className="font-['Fraunces'] italic font-bold text-4xl sm:text-5xl text-[#1D1A16]">
            About Boardify & The WebMCP Vision
          </h1>
          <p className="text-sm sm:text-base text-[#6B6353] font-['Space_Grotesk'] leading-relaxed">
            Building the premier agent-native collaborative spatial environment for the open web.
          </p>
        </div>

        {/* Hackathon Questions & Answers Card */}
        <div className="p-6 sm:p-10 rounded-3xl border-2 border-[#1D1A16] bg-[#FFFDF6] shadow-[6px_6px_0_#1D1A16] space-y-8">
          {/* Question 1 */}
          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-[#E24E1B] uppercase">
              1. Why is this use case a strong fit for WebMCP?
            </span>
            <h3 className="font-['Fraunces'] italic font-bold text-2xl text-[#1D1A16]">
              Spatial Thinking Requires Deterministic Tool Ergonomics
            </h3>
            <p className="text-xs sm:text-sm text-[#403A2F] leading-relaxed">
              Whiteboards are inherently non-linear and high-dimensional. LLM chatbots have historically been trapped in linear text boxes. Through WebMCP, Boardify gives agents explicit, typed tools to manipulate a 2D spatial canvas: reading node coordinates, calculating collision-free free spots, drawing labeled bezier wires, and applying graph layout algorithms without fragile DOM vision-parsing.
            </p>
          </div>

          {/* Question 2 */}
          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-[#E24E1B] uppercase">
              2. How it creates a fundamentally better user experience
            </span>
            <h3 className="font-['Fraunces'] italic font-bold text-2xl text-[#1D1A16]">
              Eliminates "Blank Canvas Paralysis" & Context Loss
            </h3>
            <p className="text-xs sm:text-sm text-[#403A2F] leading-relaxed">
              Instead of manually creating dozens of cards or copying text back and forth between a chat window and Miro, the human sets the direction and the agent immediately populates, categorizes, and weaves the board in real time. The Agent Ghost cursor and tool activity stream provide clear visual proof of agent collaboration.
            </p>
          </div>

          {/* Question 3 */}
          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-[#E24E1B] uppercase">
              3. What people and agents can do together that was impossible before
            </span>
            <h3 className="font-['Fraunces'] italic font-bold text-2xl text-[#1D1A16]">
              Autonomous Spatial Graph Structuring & Live Synthesis
            </h3>
            <p className="text-xs sm:text-sm text-[#403A2F] leading-relaxed">
              Human users can drop a single ambiguous concept, and the agent can asynchronously expand 4 orthogonal branches, weigh pros and cons, detect orphan nodes, auto-cluster the graph into columns, and export the entire topology to Markdown or Mermaid—all in under 3 seconds.
            </p>
          </div>

          {/* Question 4 */}
          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-[#E24E1B] uppercase">
              4. Technical Implementation & WebMCP Architecture
            </span>
            <h3 className="font-['Fraunces'] italic font-bold text-2xl text-[#1D1A16]">
              12 Native Tools on document.modelContext + Realtime Sync
            </h3>
            <div className="p-4 rounded-xl bg-[#1D1A16] text-[#F4EFE4] font-mono text-xs overflow-x-auto space-y-2 border border-[#1D1A16]">
              <div className="text-[#6B6353]">// WebMCP standard tool registration</div>
              <div>document.modelContext.registerTool({'{'}</div>
              <div className="pl-4 text-[#FFE9A8]">name: "add_idea_node",</div>
              <div className="pl-4 text-[#FFE9A8]">description: "Create a sticky note on the canvas...",</div>
              <div className="pl-4 text-[#FFE9A8]">inputSchema: {'{ title: { type: "string" }, ... }'},</div>
              <div className="pl-4 text-emerald-400">execute: async (input) =&gt; {'{ return handleAddNode(input); }'}</div>
              <div>{'}'});</div>
            </div>
          </div>
        </div>

        {/* Challenge Judges Quickstart */}
        <div id="judges" className="p-6 sm:p-8 rounded-3xl border-2 border-[#1D1A16] bg-[#FFFDF6] shadow-[6px_6px_0_#1D1A16] space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1D1A16] text-white flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-['Fraunces'] italic font-bold text-2xl text-[#1D1A16]">
                Judge's Quickstart Guide
              </h2>
              <p className="text-xs text-[#6B6353]">
                Prepared for the WebMCP Challenge panel.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {judges.map((j, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#F4EFE4] border border-[#DCD4C2] text-xs">
                <span className="font-bold text-[#1D1A16] block">{j.name}</span>
                <span className="text-[#6B6353] text-[11px]">{j.role}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#FFE9A8]/40 border border-[#1D1A16]/20 text-xs text-[#403A2F] leading-relaxed">
            <b>Testing in 30 seconds:</b> Open Boardify in the ChatGPT in-app browser or Chrome with <code className="font-mono text-[#E24E1B]">#enable-webmcp-testing</code>. Tell your agent: <span className="font-mono text-[#1D1A16]">"Read my board and expand the main idea into 4 growth strategies."</span> Watch the canvas populate live!
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function AboutPage() {
  return (
    <ToastProvider>
      <AboutPageInner />
    </ToastProvider>
  );
}
