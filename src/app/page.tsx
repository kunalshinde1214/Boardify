'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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

function HeroCanvasPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<{
    p1: { x: number; y: number };
    p2: { x: number; y: number };
    p3: { x: number; y: number };
  }>({
    p1: { x: 300, y: 160 },
    p2: { x: 620, y: 100 },
    p3: { x: 620, y: 310 },
  });

  const updateCoords = useCallback(() => {
    if (!containerRef.current || !card1Ref.current || !card2Ref.current || !card3Ref.current) return;
    const cRect = containerRef.current.getBoundingClientRect();
    const r1 = card1Ref.current.getBoundingClientRect();
    const r2 = card2Ref.current.getBoundingClientRect();
    const r3 = card3Ref.current.getBoundingClientRect();

    setCoords({
      p1: { x: r1.right - cRect.left, y: r1.top + r1.height / 2 - cRect.top },
      p2: { x: r2.left - cRect.left, y: r2.top + r2.height / 2 - cRect.top },
      p3: { x: r3.left - cRect.left, y: r3.top + r3.height / 2 - cRect.top },
    });
  }, []);

  useEffect(() => {
    updateCoords();
    window.addEventListener('resize', updateCoords);
    const observer = new ResizeObserver(updateCoords);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      window.removeEventListener('resize', updateCoords);
      observer.disconnect();
    };
  }, [updateCoords]);

  // Wire 1: Card 1 to Card 2 (Human -> Agent Scaler)
  const deltaX1 = Math.abs(coords.p2.x - coords.p1.x);
  const offset1 = Math.max(30, deltaX1 * 0.45);
  const path1 = `M ${coords.p1.x} ${coords.p1.y} C ${coords.p1.x + offset1} ${coords.p1.y}, ${coords.p2.x - offset1} ${coords.p2.y}, ${coords.p2.x} ${coords.p2.y}`;
  const mid1X = (coords.p1.x + coords.p2.x) / 2;
  const mid1Y = (coords.p1.y + coords.p2.y) / 2;

  // Wire 2: Card 1 to Card 3 (Human -> Relational Schema)
  const deltaX2 = Math.abs(coords.p3.x - coords.p1.x);
  const offset2 = Math.max(30, deltaX2 * 0.45);
  const path2 = `M ${coords.p1.x} ${coords.p1.y} C ${coords.p1.x + offset2} ${coords.p1.y}, ${coords.p3.x - offset2} ${coords.p3.y}, ${coords.p3.x} ${coords.p3.y}`;
  const mid2X = (coords.p1.x + coords.p3.x) / 2;
  const mid2Y = (coords.p1.y + coords.p3.y) / 2;

  return (
    <div className="mt-14 w-full max-w-5xl bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-3xl p-4 sm:p-6 shadow-[8px_8px_0_#1D1A16] relative overflow-hidden text-left">
      {/* Top Bar of Preview Canvas */}
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
      <div
        ref={containerRef}
        className="relative min-h-[440px] sm:min-h-[460px] canvas-grid-bg rounded-2xl border-2 border-[#1D1A16]/15 overflow-hidden p-6 select-none"
      >
        {/* SVG Connected Wires */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
          <defs>
            <marker
              id="hero-arrow-orange"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#E24E1B" />
            </marker>
            <marker
              id="hero-arrow-dark"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#57503F" />
            </marker>
          </defs>

          {/* Wire 1: Human -> Agent Scaler */}
          <path
            d={path1}
            fill="none"
            stroke="#E24E1B"
            strokeWidth="2.4"
            strokeDasharray="6 4"
            markerEnd="url(#hero-arrow-orange)"
          />

          {/* Wire 2: Human -> Relational Schema */}
          <path
            d={path2}
            fill="none"
            stroke="#57503F"
            strokeWidth="2.2"
            markerEnd="url(#hero-arrow-dark)"
          />

          {/* Floating Midpoint Relationship Badges */}
          <g transform={`translate(${mid1X}, ${mid1Y})`}>
            <rect
              x="-54"
              y="-12"
              width="108"
              height="24"
              rx="6"
              fill="#FFFDF6"
              stroke="#E24E1B"
              strokeWidth="1.2"
              className="shadow-sm"
            />
            <text
              x="0"
              y="4.5"
              textAnchor="middle"
              fill="#E24E1B"
              fontSize="10"
              fontFamily="'Space Grotesk', sans-serif"
              fontWeight="bold"
            >
              ✨ prompts agent
            </text>
          </g>

          <g transform={`translate(${mid2X}, ${mid2Y})`}>
            <rect
              x="-56"
              y="-12"
              width="112"
              height="24"
              rx="6"
              fill="#FFFDF6"
              stroke="#57503F"
              strokeWidth="1.2"
              className="shadow-sm"
            />
            <text
              x="0"
              y="4.5"
              textAnchor="middle"
              fill="#1D1A16"
              fontSize="10"
              fontFamily="'Space Grotesk', sans-serif"
              fontWeight="bold"
            >
              ⚡ generates schema
            </text>
          </g>
        </svg>

        {/* Note 1: Human Anchor (Left) */}
        <div
          ref={card1Ref}
          className="absolute top-1/2 -translate-y-1/2 left-4 sm:left-10 w-60 sm:w-68 bg-[#FFE9A8] border-2 border-[#1D1A16] p-4 rounded-xl shadow-[4px_4px_0_#1D1A16] -rotate-1 z-20 transition-all hover:rotate-0 hover:shadow-[6px_6px_0_#1D1A16]"
        >
          <div className="sticky-tape" />
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#1D1A16] text-[#FFFDF6] px-2 py-0.5 rounded">
              YOU · ARCHITECT
            </span>
            <span className="text-[10px] font-mono text-[#6B6353]">Input</span>
          </div>
          <h4 className="font-['Fraunces'] italic font-bold text-lg text-[#1D1A16] mt-1 leading-snug">
            Product Vision 2026
          </h4>
          <p className="font-['Space_Grotesk'] text-xs text-[#403A2F] mt-1.5 leading-relaxed">
            Zero blank canvas paralysis. Human and autonomous agent co-architect systems in one shared spatial frame.
          </p>
          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-[#1D1A16]/10 text-[10px] font-mono text-[#6B6353]">
            <span className="bg-[#1D1A16]/5 px-1.5 py-0.5 rounded font-bold">#spatial-ai</span>
            <span className="bg-[#1D1A16]/5 px-1.5 py-0.5 rounded font-bold">#agentic</span>
          </div>

          {/* Right magnetic output port */}
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FFFDF6] border-2 border-[#E24E1B] flex items-center justify-center shadow-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-[#E24E1B]" />
          </div>
        </div>

        {/* Note 2: Agent Autonomous Scaler (Top Right) */}
        <div
          ref={card2Ref}
          className="absolute top-6 right-4 sm:right-10 w-64 sm:w-76 bg-[#FFFDF6] border-2 border-[#1D1A16] p-4 rounded-xl shadow-[4px_4px_0_#1D1A16] rotate-1 z-20 transition-all hover:rotate-0 hover:shadow-[6px_6px_0_#1D1A16]"
        >
          <div className="sticky-tape" />
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#E24E1B] text-white px-2 py-0.5 rounded flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> AGENT · SWARM
            </span>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Active
            </span>
          </div>
          <h4 className="font-['Fraunces'] italic font-bold text-lg text-[#1D1A16] mt-1 leading-snug">
            WebMCP Autonomous Scaler
          </h4>
          <p className="font-['Space_Grotesk'] text-xs text-[#403A2F] mt-1 leading-relaxed">
            Automated branch expansion, smart DAG clustering, and real-time state synchronization.
          </p>
          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-[#DCD4C2] flex-wrap">
            <span className="text-[9px] font-mono uppercase bg-[#F4EFE4] px-1.5 py-0.5 rounded border border-[#DCD4C2] font-bold text-[#1D1A16]">
              Next.js 15
            </span>
            <span className="text-[9px] font-mono uppercase bg-[#F4EFE4] px-1.5 py-0.5 rounded border border-[#DCD4C2] font-bold text-[#1D1A16]">
              Claude 3.7
            </span>
            <span className="text-[9px] font-mono uppercase bg-[#FFE9A8] px-1.5 py-0.5 rounded border border-[#1D1A16]/20 font-bold text-[#E24E1B]">
              WebMCP
            </span>
          </div>

          {/* Left magnetic input port */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FFFDF6] border-2 border-[#E24E1B] flex items-center justify-center shadow-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-[#E24E1B]" />
          </div>
        </div>

        {/* Note 3: Agent SQL Entity Table (Bottom Right) */}
        <div
          ref={card3Ref}
          className="absolute bottom-6 right-4 sm:right-14 w-64 sm:w-76 bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-xl shadow-[4px_4px_0_#1D1A16] -rotate-1 z-20 transition-all hover:rotate-0 hover:shadow-[6px_6px_0_#1D1A16] overflow-hidden"
        >
          <div className="sticky-tape" />
          <div className="px-3.5 py-2 bg-[#F4EFE4] border-b-2 border-[#1D1A16] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold uppercase bg-[#1D1A16] text-[#FFFDF6] px-1.5 py-0.5 rounded">
                ER TABLE
              </span>
              <h4 className="font-['Fraunces'] italic font-bold text-sm text-[#1D1A16]">
                workspaces
              </h4>
            </div>
            <span className="text-[9px] font-mono font-bold text-[#6B6353]">SQL Schema</span>
          </div>

          <div className="p-2.5 space-y-1 text-[11px] font-mono bg-[#FFFDF6]">
            <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-[#F4EFE4]/60">
              <span className="flex items-center gap-1 font-bold text-[#1D1A16]">
                <span className="text-[9px] font-bold text-[#E24E1B] bg-[#FFD8C7] px-1 rounded">PK</span>
                id
              </span>
              <span className="text-[#6B6353] text-[10px]">UUID</span>
            </div>
            <div className="flex items-center justify-between px-1.5 py-0.5">
              <span className="flex items-center gap-1 text-[#403A2F]">
                <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1 rounded">FK</span>
                user_id
              </span>
              <span className="text-[#6B6353] text-[10px]">VARCHAR(255)</span>
            </div>
            <div className="flex items-center justify-between px-1.5 py-0.5">
              <span className="text-[#403A2F]">nodes_state</span>
              <span className="text-[#6B6353] text-[10px]">JSONB</span>
            </div>
            <div className="flex items-center justify-between px-1.5 py-0.5">
              <span className="text-[#403A2F]">synced_at</span>
              <span className="text-[#6B6353] text-[10px]">TIMESTAMP</span>
            </div>
          </div>

          {/* Left magnetic input port */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FFFDF6] border-2 border-[#57503F] flex items-center justify-center shadow-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-[#57503F]" />
          </div>
        </div>

        {/* Ghost Cursor Simulation Floating Near Center Wires */}
        <div
          style={{
            left: `${mid1X - 20}px`,
            top: `${mid1Y + 36}px`,
          }}
          className="absolute flex items-center gap-2 pointer-events-none z-30 animate-pulse transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-[#E24E1B] text-white flex items-center justify-center shadow-md border-2 border-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="bg-[#FFFDF6] border-2 border-[#E24E1B] text-[#E24E1B] text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-[2px_2px_0_#E24E1B] font-mono whitespace-nowrap">
            AGENT · calling add_entity_table("workspaces")
          </span>
        </div>
      </div>
    </div>
  );
}

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
        <HeroCanvasPreview />
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
