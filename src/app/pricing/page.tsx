'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { CheckCircle2, Sparkles, ArrowRight, Zap, Shield, HelpCircle } from 'lucide-react';

function PricingPageInner() {
  const plans = [
    {
      name: 'Open Source / Free',
      price: '$0',
      period: 'forever',
      description: 'Ideal for solo thinkers, developers, and testing in ChatGPT or Chrome.',
      badge: 'Open Standard',
      features: [
        '12 WebMCP document.modelContext tools',
        'Infinite spatial canvas with pan & zoom',
        'Local Agent Studio with simulation engine',
        'Full Markdown, Mermaid & JSON export',
        '6 pre-built strategy & architecture templates',
        'LocalStorage offline persistence',
      ],
      buttonText: 'Launch Canvas Free',
      href: '/canvas',
      highlighted: false,
    },
    {
      name: 'Pro Creator',
      price: '$12',
      period: '/ month',
      description: 'For power users who collaborate with AI agents daily on strategy & code.',
      badge: 'Most Popular',
      features: [
        'Everything in Free, plus:',
        'Real-time Firebase Firestore cloud sync',
        'Multiplayer collaborative rooms with live cursors',
        'Unlimited agent missions and auto-layouts',
        'Custom template saving and cloud sharing',
        'Priority WebMCP tool execution pipelines',
      ],
      buttonText: 'Start Pro 14-Day Trial',
      href: '/canvas',
      highlighted: true,
    },
    {
      name: 'Team & Studio',
      price: '$39',
      period: '/ month',
      description: 'For design, product, and engineering teams scaling agentic workflows.',
      badge: 'Team Power',
      features: [
        'Everything in Pro, plus:',
        'Unlimited team members & shared workspace',
        'Multi-agent concurrent swarms on one board',
        'Role-based permissions & audit logs',
        'Custom WebMCP domain white-labeling',
        'Dedicated Slack / Discord channel support',
      ],
      buttonText: 'Contact Team Sales',
      href: '/canvas',
      highlighted: false,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F4EFE4]">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE9A8] border border-[#1D1A16] text-xs font-bold text-[#1D1A16]">
            <Zap className="w-3.5 h-3.5 text-[#E24E1B]" />
            <span>Simple, Transparent Pricing</span>
          </div>
          <h1 className="font-['Fraunces'] italic font-bold text-4xl sm:text-5xl text-[#1D1A16]">
            Plans for Humans & Their Agents
          </h1>
          <p className="text-sm sm:text-base text-[#6B6353] font-['Space_Grotesk'] leading-relaxed">
            Boardify is 100% open source and free to run locally. Upgrade whenever you need real-time cloud sync, multiplayer collaboration, and team workspaces.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`p-8 rounded-3xl border-2 border-[#1D1A16] flex flex-col justify-between transition-all ${
                plan.highlighted
                  ? 'bg-[#FFFDF6] shadow-[8px_8px_0_#1D1A16] scale-105 z-10'
                  : 'bg-[#FFFDF6]/80 shadow-[4px_4px_0_#1D1A16]'
              }`}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-[#1D1A16] text-[#F4EFE4]">
                    {plan.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-['Fraunces'] italic font-bold text-2xl text-[#1D1A16]">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="font-['Fraunces'] font-extrabold text-4xl text-[#1D1A16]">
                      {plan.price}
                    </span>
                    <span className="text-xs text-[#6B6353] font-mono">{plan.period}</span>
                  </div>
                  <p className="text-xs text-[#6B6353] mt-2 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 pt-4 border-t border-[#DCD4C2]">
                  {plan.features.map((f, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-[#403A2F]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action CTA */}
              <Link
                href={plan.href}
                className={`mt-8 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-bold border border-[#1D1A16] shadow-[2px_2px_0_#1D1A16] transition-all ${
                  plan.highlighted
                    ? 'bg-[#E24E1B] text-white hover:bg-[#B33A10]'
                    : 'bg-[#1D1A16] text-white hover:bg-[#E24E1B]'
                }`}
              >
                <span>{plan.buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto pt-10 space-y-6">
          <div className="text-center">
            <h2 className="font-['Fraunces'] italic font-bold text-3xl text-[#1D1A16]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-[#FFFDF6] border border-[#1D1A16] space-y-2">
              <h4 className="font-bold text-sm text-[#1D1A16]">
                Is the WebMCP standard free to use?
              </h4>
              <p className="text-[#6B6353] leading-relaxed">
                Yes! WebMCP is an open standard proposed for browser engines. Boardify exposes all 12 tools for free on every page.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFFDF6] border border-[#1D1A16] space-y-2">
              <h4 className="font-bold text-sm text-[#1D1A16]">
                How does real-time sync work?
              </h4>
              <p className="text-[#6B6353] leading-relaxed">
                We use Firebase Firestore real-time listeners. Any change made by your agent in ChatGPT updates your teammates' canvases in under 100ms.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFFDF6] border border-[#1D1A16] space-y-2">
              <h4 className="font-bold text-sm text-[#1D1A16]">
                Can I export my boards to code?
              </h4>
              <p className="text-[#6B6353] leading-relaxed">
                Yes! Export one-click to Markdown outlines, Mermaid flowcharts, or full JSON graph state at any time.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFFDF6] border border-[#1D1A16] space-y-2">
              <h4 className="font-bold text-sm text-[#1D1A16]">
                Where can I report bugs or submit PRs?
              </h4>
              <p className="text-[#6B6353] leading-relaxed">
                Boardify is open source under the MIT License on GitHub. We welcome contributions from the developer community.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PricingPage() {
  return (
    <ToastProvider>
      <PricingPageInner />
    </ToastProvider>
  );
}
