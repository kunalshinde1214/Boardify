import React from 'react';
import Link from 'next/link';
import { Sparkles, GitBranch, ExternalLink, Cpu, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1D1A16] text-[#F4EFE4] border-t border-[#1D1A16] pt-14 pb-10 px-4 sm:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Brand column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E24E1B] text-white flex items-center justify-center border border-[#B33A10]">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-['Fraunces'] italic font-bold text-2xl tracking-tight text-[#FFFDF6]">
              Boardify
            </span>
          </div>
          <p className="text-xs text-[#DAE5E6]/70 leading-relaxed max-w-sm">
            The spatial whiteboard where browser agents pull up a chair. Powered by the open WebMCP standard, giving AI agents first-class hands to read, build, and organize ideas alongside humans.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#6B6353] text-xs font-semibold text-[#F4EFE4] hover:bg-[#6B6353]/30 transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>GitHub (MIT Open Source)</span>
            </a>
            <span className="text-[11px] font-mono px-2 py-1 rounded bg-[#E24E1B]/20 text-[#FFD8C7] border border-[#E24E1B]/40">
              WebMCP v1.0
            </span>
          </div>
        </div>

        {/* Product links */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-[#FFE9A8] mb-3 font-mono">
            Product
          </h4>
          <ul className="space-y-2 text-xs text-[#DAE5E6]/80">
            <li>
              <Link href="/canvas" className="hover:text-white transition-colors">
                Infinite Canvas
              </Link>
            </li>
            <li>
              <Link href="/templates" className="hover:text-white transition-colors">
                Templates Gallery
              </Link>
            </li>
            <li>
              <Link href="/showcase" className="hover:text-white transition-colors">
                Agent Pairing Showcase
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-white transition-colors">
                Pricing & Plans
              </Link>
            </li>
          </ul>
        </div>

        {/* WebMCP & Docs */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-[#FFE9A8] mb-3 font-mono">
            Developers
          </h4>
          <ul className="space-y-2 text-xs text-[#DAE5E6]/80">
            <li>
              <Link href="/docs" className="hover:text-white transition-colors">
                WebMCP Tool API Reference
              </Link>
            </li>
            <li>
              <Link href="/docs#chrome-flag" className="hover:text-white transition-colors">
                Chrome Flags Setup Guide
              </Link>
            </li>
            <li>
              <Link href="/docs#schema-explorer" className="hover:text-white transition-colors">
                Interactive Schema Tester
              </Link>
            </li>
            <li>
              <a
                href="https://webmachinelearning.github.io/webmcp/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-white transition-colors"
              >
                <span>WebMCP Spec</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>

        {/* Challenge & Submission */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-[#FFE9A8] mb-3 font-mono">
            Challenge
          </h4>
          <ul className="space-y-2 text-xs text-[#DAE5E6]/80">
            <li>
              <Link href="/about" className="hover:text-white transition-colors">
                WebMCP Challenge Dossier
              </Link>
            </li>
            <li>
              <Link href="/about#judges" className="hover:text-white transition-colors">
                Judge Quickstart Guide
              </Link>
            </li>
            <li>
              <Link href="/about#architecture" className="hover:text-white transition-colors">
                Architecture Blueprint
              </Link>
            </li>
            <li>
              <a
                href="https://webmcp.devpost.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-white transition-colors"
              >
                <span>Devpost Hackathon</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-[#6B6353]/30 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#DAE5E6]/60 gap-4">
        <p>© 2026 Boardify. Open source under MIT License.</p>
        <p className="flex items-center gap-1.5">
          <span>Crafted for human + agent co-creation with</span>
          <Heart className="w-3 h-3 text-[#E24E1B] fill-current" />
          <span>and WebMCP</span>
        </p>
      </div>
    </footer>
  );
}
