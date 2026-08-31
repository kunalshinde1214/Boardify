'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Menu, X, ArrowRight, LayoutDashboard, FileCode2, Layers, BookOpen, Presentation, Info, Check } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasWebMCP, setHasWebMCP] = useState(false);

  useEffect(() => {
    const checkMCP = () => {
      const win = window as unknown as { document: { modelContext?: { registerTool?: unknown } } };
      if (win.document?.modelContext?.registerTool) {
        setHasWebMCP(true);
      }
    };
    checkMCP();
    const timer = setInterval(checkMCP, 2000);
    return () => clearInterval(timer);
  }, []);

  const navLinks = [
    { href: '/canvas', label: 'Canvas', icon: LayoutDashboard },
    { href: '/templates', label: 'Templates', icon: Layers },
    { href: '/docs', label: 'WebMCP Docs', icon: FileCode2 },
    { href: '/showcase', label: 'Showcase', icon: Presentation },
    { href: '/pricing', label: 'Pricing', icon: BookOpen },
    { href: '/about', label: 'About & Challenge', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FFFDF6]/90 backdrop-blur-md border-b border-[#1D1A16]/15 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#E24E1B] text-white flex items-center justify-center border border-[#B33A10] shadow-[2px_2px_0_#1D1A16] group-hover:rotate-6 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-['Fraunces'] italic font-bold text-xl sm:text-2xl text-[#1D1A16] tracking-tight">
              Boardify
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest text-[#6B6353] border border-[#DCD4C2] rounded px-1.5 py-0.5 bg-[#F4EFE4]">
              WebMCP Native
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-[#1D1A16] text-[#F4EFE4] shadow-[2px_2px_0_#6B6353]'
                    : 'text-[#1D1A16] hover:bg-[#F4EFE4]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side status & CTA */}
        <div className="flex items-center gap-3">
          {/* WebMCP Indicator Pill */}
          <div
            title={
              hasWebMCP
                ? 'WebMCP is detected & connected via document.modelContext'
                : 'No document.modelContext found. Agent Studio provides local tool simulation.'
            }
            className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
              hasWebMCP
                ? 'bg-emerald-50 text-emerald-800 border-emerald-500'
                : 'bg-[#F4EFE4] text-[#6B6353] border-[#DCD4C2]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                hasWebMCP ? 'bg-emerald-500 animate-pulse' : 'bg-[#E24E1B]'
              }`}
            />
            <span>{hasWebMCP ? 'WebMCP Live' : 'WebMCP Standard'}</span>
          </div>

          <Link
            href="/canvas"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E24E1B] text-white text-xs font-bold border border-[#1D1A16] shadow-[2px_2px_0_#1D1A16] hover:bg-[#B33A10] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            <span>Launch Canvas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg border border-[#1D1A16] bg-[#FFFDF6] shadow-[2px_2px_0_#1D1A16]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden pt-4 pb-2 border-t border-[#DCD4C2] mt-3 flex flex-col gap-1.5 animate-note-pop">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm font-semibold ${
                  isActive ? 'bg-[#1D1A16] text-[#F4EFE4]' : 'text-[#1D1A16] hover:bg-[#F4EFE4]'
                }`}
              >
                <Icon className="w-4 h-4 text-[#E24E1B]" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 flex items-center justify-between text-xs text-[#6B6353] px-3">
            <span>WebMCP Protocol v1.0</span>
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <Check className="w-3.5 h-3.5" /> 12 Tools Ready
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
