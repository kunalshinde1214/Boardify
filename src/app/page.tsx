'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider, useToast } from '@/components/ui/ToastProvider';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  FileCode2,
  Download,
  Share2,
  Terminal,
  Zap,
  ShieldCheck,
  Flame,
  Copy,
  ExternalLink,
  Bot,
  User,
  GitBranch,
} from 'lucide-react';
import {
  WebMCPIcon,
  OpenAIIcon,
  ChromeIcon,
  GeminiIcon,
  AnthropicIcon,
} from '@/components/ui/BrandIcons';

function LandingPageContent() {
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleCopyPrompt = (p: string) => {
    navigator.clipboard.writeText(p);
    setCopiedPrompt(p);
    showToast('Prompt copied to clipboard! Paste it in ChatGPT.', 'ok');
    setTimeout(() => setCopiedPrompt(null), 2500);
  };

  const samplePrompts = [
    {
      title: 'Strategic GTM Expansion',
      prompt: 'Read my canvas using get_canvas_state, find the core value proposition note, and add 4 tactical acquisition channel branches with connected wires.',
      tag: 'Strategy',
    },
    {
      title: 'Autonomous Board Critique',
      prompt: 'Scan the board for orphan nodes, evaluate the logical coherence of the plan, and post an Agent Strategic Review sticky note with highlight flags.',
      tag: 'Audit',
    },
    {
      title: 'Tidy & Sprint Document Export',
      prompt: 'Arrange all nodes into clean cluster columns with arrange_layout, then export the entire board as a Markdown sprint brief.',
      tag: 'Engineering',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#F4EFE4]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full pt-12 pb-16 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Challenge Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFE9A8] border border-[#1D1A16] shadow-[2px_2px_0_#1D1A16] text-xs font-bold text-[#1D1A16] mb-6 animate-note-pop">
          <Sparkles className="w-3.5 h-3.5 text-[#E24E1B]" />
          <span>Built for the OpenAI & Google WebMCP Challenge</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#E24E1B]" />
          <span className="font-mono text-[11px] text-[#B33A10]">$35,000 Open Standard</span>
        </div>

        {/* Headline */}
        <h1 className="font-['Fraunces'] italic font-extrabold text-4xl sm:text-6xl md:text-7xl text-[#1D1A16] leading-[1.08] max-w-4xl tracking-tight">
          The spatial whiteboard where{' '}
          <span className="underline decoration-[#E24E1B] decoration-wavy decoration-2">
            agents pull up a chair.
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-base sm:text-xl text-[#6B6353] max-w-2xl font-['Space_Grotesk'] leading-relaxed">
          Boardify exposes 12 first-class tools on <code className="text-[#E24E1B] font-mono font-bold bg-[#FFFDF6] px-1.5 py-0.5 rounded border border-[#DCD4C2]">document.modelContext</code>. AI browser agents in ChatGPT and Google Chrome read, build, connect, and arrange thoughts alongside humans on one shared infinite canvas.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/canvas"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#E24E1B] text-white text-sm font-bold border-2 border-[#1D1A16] shadow-[4px_4px_0_#1D1A16] hover:bg-[#B33A10] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <span>Launch Canvas App</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/docs"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#FFFDF6] text-[#1D1A16] text-sm font-bold border-2 border-[#1D1A16] shadow-[4px_4px_0_#1D1A16] hover:bg-[#F4EFE4] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <FileCode2 className="w-4 h-4 text-[#E24E1B]" />
            <span>WebMCP Developer Docs</span>
          </Link>
        </div>

        {/* Interactive Canvas Preview Card */}
        <div className="mt-14 w-full max-w-5xl bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-3xl p-4 sm:p-6 shadow-[8px_8px_0_#1D1A16] relative overflow-hidden text-left">
          {/* Top Bar of Fake Canvas */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#DCD4C2]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#E24E1B]" />
              <div className="w-3 h-3 rounded-full bg-[#FFE9A8] border border-[#1D1A16]/30" />
              <div className="w-3 h-3 rounded-full bg-[#DCEBC8] border border-[#1D1A16]/30" />
              <span className="ml-2 font-mono text-xs text-[#6B6353] font-bold">
                boardify.live/canvas/demo
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-500 text-emerald-800 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                12 WebMCP Tools Active
              </span>
            </div>
          </div>

          {/* Canvas simulation viewport */}
          <div className="relative h-80 sm:h-96 canvas-grid-bg rounded-2xl border border-[#DCD4C2] overflow-hidden p-6">
            {/* Note 1: Human */}
            <div className="absolute top-8 left-8 sm:left-14 w-60 bg-[#FFE9A8] border border-[#1D1A16]/20 p-3.5 rounded-md shadow-[3px_4px_0_rgba(29,26,22,0.1)] -rotate-1">
              <div className="sticky-tape" />
              <span className="text-[9px] font-bold uppercase tracking-wider bg-[#1D1A16] text-[#F4EFE4] px-1.5 py-0.5 rounded">
                YOU
              </span>
              <h4 className="font-['Caveat'] font-bold text-xl text-[#1D1A16] mt-1">
                Product Vision 2026
              </h4>
              <p className="font-['Kalam'] text-xs text-[#403A2F] mt-1">
                Zero blank canvas paralysis. Human and agent think together in one spatial frame.
              </p>
            </div>

            {/* Bezier Wire in Preview */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path
                d="M 280 80 C 350 80, 380 60, 460 60"
                fill="none"
                stroke="#57503F"
                strokeWidth="2"
                markerEnd="url(#arrow-preview)"
              />
              <path
                d="M 280 120 C 360 120, 390 190, 460 200"
                fill="none"
                stroke="#E24E1B"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>

            {/* Note 2: Agent */}
            <div className="absolute top-6 right-8 sm:right-20 w-64 bg-[#DAE5E6] border border-[#1D1A16]/20 p-3.5 rounded-md shadow-[3px_4px_0_rgba(29,26,22,0.1)] rotate-2">
              <div className="sticky-tape" />
              <span className="text-[9px] font-bold uppercase tracking-wider bg-[#E24E1B] text-white px-1.5 py-0.5 rounded flex items-center gap-1 w-fit">
                <Sparkles className="w-2.5 h-2.5" /> AGENT
              </span>
              <h4 className="font-['Caveat'] font-bold text-xl text-[#1D1A16] mt-1">
                WebMCP Autonomous Scaler
              </h4>
              <p className="font-['Kalam'] text-xs text-[#403A2F] mt-1">
                Tireless branch expansion, smart layout clustering, and instant Markdown synchronization.
              </p>
            </div>

            {/* Note 3: Agent Note 2 */}
            <div className="absolute bottom-6 right-8 sm:right-28 w-60 bg-[#DCEBC8] border border-[#1D1A16]/20 p-3.5 rounded-md shadow-[3px_4px_0_rgba(29,26,22,0.1)] -rotate-2">
              <div className="sticky-tape" />
              <span className="text-[9px] font-bold uppercase tracking-wider bg-[#E24E1B] text-white px-1.5 py-0.5 rounded flex items-center gap-1 w-fit">
                <Sparkles className="w-2.5 h-2.5" /> AGENT
              </span>
              <h4 className="font-['Caveat'] font-bold text-xl text-[#1D1A16] mt-1">
                Real-Time Firestore Sync
              </h4>
              <p className="font-['Kalam'] text-xs text-[#403A2F] mt-1">
                Multiplayer room broadcasting coordinate diffs at 60 FPS.
              </p>
            </div>

            {/* Ghost Cursor Simulation */}
            <div className="absolute top-44 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none animate-bounce">
              <div className="w-7 h-7 rounded-full bg-[#E24E1B] text-white flex items-center justify-center shadow-lg border border-white">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="bg-[#FFFDF6] border border-[#E24E1B] text-[#E24E1B] text-[10px] font-bold px-2 py-0.5 rounded shadow-[2px_2px_0_#E24E1B]">
                AGENT · calling add_idea_node
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Protocol Comparison Section: WebMCP vs Screen Scraping */}
      <section className="py-20 bg-[#FFFDF6] border-y border-[#1D1A16]/15 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E24E1B]">
              Why WebMCP is Revolutionary
            </span>
            <h2 className="font-['Fraunces'] italic font-bold text-3xl sm:text-4xl text-[#1D1A16] mt-2">
              The End of Flaky DOM Scraping
            </h2>
            <p className="text-sm sm:text-base text-[#6B6353] mt-3">
              Traditional web agents guess their way through confusing HTML trees. WebMCP establishes a clean, structured API contract inside the browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="p-6 rounded-2xl border-2 border-[#1D1A16] bg-[#FFD8C7]/30 shadow-[4px_4px_0_#1D1A16] flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-[#B33A10] uppercase">
                  Legacy AI Agents (Vision / DOM Scraping)
                </span>
                <h3 className="font-bold text-xl text-[#1D1A16] mt-1">
                  Blind, Slow, and Prone to Hallucinations
                </h3>
                <ul className="mt-4 space-y-2.5 text-xs text-[#403A2F]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#E24E1B] font-bold">✕</span>
                    <span>Guesses button coordinates via noisy screenshot OCR.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#E24E1B] font-bold">✕</span>
                    <span>High latency round-trips taking 5–15 seconds per click.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#E24E1B] font-bold">✕</span>
                    <span>Breaks whenever CSS class names or DOM layouts shift.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#E24E1B] font-bold">✕</span>
                    <span>Trapped in a lonely sidebar chat with zero spatial context.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* The WebMCP Way (Boardify) */}
            <div className="p-6 rounded-2xl border-2 border-[#1D1A16] bg-[#DCEBC8]/40 shadow-[4px_4px_0_#1D1A16] flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-800 uppercase flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-700" /> Boardify + WebMCP Standard
                </span>
                <h3 className="font-bold text-xl text-[#1D1A16] mt-1">
                  Deterministic, Millisecond-Fast Co-Creation
                </h3>
                <ul className="mt-4 space-y-2.5 text-xs text-[#403A2F]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <span>Direct <code className="font-mono text-[#E24E1B] bg-white px-1 rounded">document.modelContext</code> tool invocation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <span>Instant client-side execution in under 20 milliseconds.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <span>Structured JSON schemas guarantee 100% reliable parameters.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <span>Agent cursor moves dynamically on the shared canvas in real time.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Human + Agent Co-Creation Pillars */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E24E1B]">
            Symbiotic Collaboration
          </span>
          <h2 className="font-['Fraunces'] italic font-bold text-3xl sm:text-4xl text-[#1D1A16] mt-2">
            Humans Bring Taste. Agents Bring Scale.
          </h2>
          <p className="text-sm sm:text-base text-[#6B6353] mt-3">
            Great ideas are neither purely human nor purely synthetic. They emerge when human intuition meets agentic rigor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl border-2 border-[#1D1A16] bg-[#FFFDF6] shadow-[4px_4px_0_#1D1A16] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFE9A8] text-[#1D1A16] flex items-center justify-center border border-[#1D1A16] font-bold">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-[#1D1A16]">1. Human Direction</h3>
            <p className="text-xs text-[#6B6353] leading-relaxed">
              You provide the spark, context, customer nuance, and aesthetic judgment. You decide what problem matters and steer the big picture.
            </p>
          </div>

          <div className="p-6 rounded-2xl border-2 border-[#1D1A16] bg-[#FFFDF6] shadow-[4px_4px_0_#1D1A16] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#DAE5E6] text-[#1D1A16] flex items-center justify-center border border-[#1D1A16] font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-[#1D1A16]">2. Agent Expansion</h3>
            <p className="text-xs text-[#6B6353] leading-relaxed">
              The agent reads your canvas, builds exhaustive sub-branches, stress-tests edge cases, weighs pros and cons, and draws connections.
            </p>
          </div>

          <div className="p-6 rounded-2xl border-2 border-[#1D1A16] bg-[#FFFDF6] shadow-[4px_4px_0_#1D1A16] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8DEFF] text-[#1D1A16] flex items-center justify-center border border-[#1D1A16] font-bold">
              <GitBranch className="w-5 h-5 text-[#6B6353]" />
            </div>
            <h3 className="font-bold text-lg text-[#1D1A16]">3. Structured Synthesis</h3>
            <p className="text-xs text-[#6B6353] leading-relaxed">
              With one click, auto-organize hundreds of floating ideas into structured clusters or chronological timelines, then export to Markdown or Mermaid.
            </p>
          </div>
        </div>
      </section>

      {/* Copy-to-ChatGPT Prompt Playground */}
      <section className="py-20 bg-[#1D1A16] text-[#F4EFE4] px-4 sm:px-8 border-y border-[#1D1A16]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FFE9A8]">
              Ready-to-Use Prompts
            </span>
            <h2 className="font-['Fraunces'] italic font-bold text-3xl sm:text-4xl text-[#FFFDF6] mt-2">
              Try It in ChatGPT or Chrome
            </h2>
            <p className="text-sm text-[#DAE5E6]/70 mt-3">
              Open Boardify inside ChatGPT's in-app browser or Chrome with <code className="text-[#FFD8C7] font-mono">#enable-webmcp-testing</code>. Click to copy these prompts:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {samplePrompts.map((sp, idx) => (
              <div
                key={idx}
                onClick={() => handleCopyPrompt(sp.prompt)}
                className="p-5 rounded-2xl bg-[#27231E] border border-[#6B6353]/30 flex flex-col justify-between hover:border-[#E24E1B] cursor-pointer group transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#6B6353]/30 text-[#FFE9A8]">
                      {sp.tag}
                    </span>
                    <Copy className="w-3.5 h-3.5 text-[#6B6353] group-hover:text-[#E24E1B] transition-colors" />
                  </div>
                  <h3 className="font-bold text-sm text-[#FFFDF6]">{sp.title}</h3>
                  <p className="text-xs text-[#DAE5E6]/75 mt-2 font-mono leading-relaxed bg-[#1D1A16] p-2.5 rounded-lg border border-[#6B6353]/20">
                    "{sp.prompt}"
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-xs text-[#FFE9A8] font-bold">
                  <span>{copiedPrompt === sp.prompt ? 'Copied!' : 'Click to copy prompt'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Matrix */}
      <section className="py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#E24E1B]">
            Feature Matrix
          </span>
          <h2 className="font-['Fraunces'] italic font-bold text-3xl sm:text-4xl text-[#1D1A16] mt-2">
            How Boardify Compares
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-2xl shadow-[6px_6px_0_#1D1A16] overflow-hidden">
            <thead>
              <tr className="bg-[#1D1A16] text-[#F4EFE4] font-mono">
                <th className="p-4">Capability</th>
                <th className="p-4 bg-[#E24E1B] text-white">Boardify (WebMCP)</th>
                <th className="p-4">Traditional Whiteboard (Miro)</th>
                <th className="p-4">AI Chatbot Sidebar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCD4C2]">
              <tr>
                <td className="p-4 font-bold text-[#1D1A16]">WebMCP document.modelContext Tools</td>
                <td className="p-4 font-bold text-emerald-700 bg-emerald-50">✓ 12 Native Tools</td>
                <td className="p-4 text-[#6B6353]">✕ None</td>
                <td className="p-4 text-[#6B6353]">✕ Text only</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-[#1D1A16]">Agent Execution Latency</td>
                <td className="p-4 font-bold text-emerald-700 bg-emerald-50">Instant (&lt; 20ms)</td>
                <td className="p-4 text-[#6B6353]">N/A</td>
                <td className="p-4 text-[#6B6353]">Slow (5–10s scraping)</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-[#1D1A16]">Live Spatial Cursor Presence</td>
                <td className="p-4 font-bold text-emerald-700 bg-emerald-50">✓ Agent Ghost Cursor</td>
                <td className="p-4 text-[#6B6353]">Human only</td>
                <td className="p-4 text-[#6B6353]">✕ No spatial canvas</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-[#1D1A16]">Layout Algorithms (Clusters, Timeline)</td>
                <td className="p-4 font-bold text-emerald-700 bg-emerald-50">✓ Autonomous</td>
                <td className="p-4 text-[#6B6353]">Manual dragging</td>
                <td className="p-4 text-[#6B6353]">✕ None</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-[#1D1A16]">Multiplayer Real-time Sync</td>
                <td className="p-4 font-bold text-emerald-700 bg-emerald-50">✓ Firebase Firestore</td>
                <td className="p-4 text-emerald-700">✓ Proprietary Cloud</td>
                <td className="p-4 text-[#6B6353]">✕ Single player</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-[#1D1A16]">Export Options</td>
                <td className="p-4 font-bold text-emerald-700 bg-emerald-50">Markdown, Mermaid, JSON</td>
                <td className="p-4 text-[#6B6353]">PDF / Image only</td>
                <td className="p-4 text-[#6B6353]">Raw Text only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="py-16 bg-[#FFE9A8] border-t-2 border-[#1D1A16] px-4 sm:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="font-['Fraunces'] italic font-bold text-3xl sm:text-5xl text-[#1D1A16]">
            Pull up a chair. Let's think together.
          </h2>
          <p className="text-sm sm:text-base text-[#403A2F] max-w-xl mx-auto">
            Try Boardify in seconds. Zero account required to explore the infinite canvas and test all 12 WebMCP tools.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              href="/canvas"
              className="px-8 py-4 rounded-2xl bg-[#E24E1B] text-white text-base font-bold border-2 border-[#1D1A16] shadow-[4px_4px_0_#1D1A16] hover:bg-[#B33A10] transition-all"
            >
              Open Whiteboard Canvas Now
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function LandingPage() {
  return (
    <ToastProvider>
      <LandingPageContent />
    </ToastProvider>
  );
}
