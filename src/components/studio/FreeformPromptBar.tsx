'use client';

import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Settings2, Key } from 'lucide-react';
import { getLLMConfig } from '@/lib/llm-client';

interface FreeformPromptBarProps {
  onRunPrompt: (prompt: string) => Promise<void>;
  onOpenSettings?: () => void;
}

export function FreeformPromptBar({ onRunPrompt, onOpenSettings }: FreeformPromptBarProps) {
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeEngine, setActiveEngine] = useState<{ name: string; isCustomKey: boolean }>({
    name: 'Local WebMCP',
    isCustomKey: false,
  });

  useEffect(() => {
    const cfg = getLLMConfig();
    if (cfg.provider === 'gemini' && cfg.apiKey) {
      setActiveEngine({ name: 'Google Gemini', isCustomKey: true });
    } else if (cfg.provider === 'openai' && cfg.apiKey) {
      setActiveEngine({ name: 'OpenAI GPT-4o', isCustomKey: true });
    } else if (cfg.provider === 'anthropic' && cfg.apiKey) {
      setActiveEngine({ name: 'Anthropic Claude', isCustomKey: true });
    } else {
      setActiveEngine({ name: 'Local WebMCP', isCustomKey: false });
    }
  }, [isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isSubmitting) return;

    const current = prompt.trim();
    setPrompt('');
    setIsSubmitting(true);
    try {
      await onRunPrompt(current);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wider text-[#6B6353] uppercase font-mono">
          Agent Command
        </span>
        {activeEngine.isCustomKey ? (
          <span
            onClick={onOpenSettings}
            className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer hover:bg-emerald-200 transition-colors"
            title="Click to configure AI keys"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            {activeEngine.name} Active
          </span>
        ) : (
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-[10px] font-mono font-bold text-[#E24E1B] bg-[#FFD8C7]/50 hover:bg-[#FFD8C7] px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
            title="Click to add your Google Gemini or OpenAI key"
          >
            <Key className="w-2.5 h-2.5" />
            Add Gemini Key
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-1.5">
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="e.g. 'table users and orders', 'nextjs, redis, postgres'..."
          disabled={isSubmitting}
          className="flex-1 bg-[#F4EFE4] border border-[#1D1A16] rounded-xl px-3 py-2 text-xs text-[#1D1A16] placeholder:text-[#6B6353]/60 focus:outline-none focus:ring-2 focus:ring-[#E24E1B] shadow-inner"
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isSubmitting}
          className="px-3.5 py-2 rounded-xl bg-[#E24E1B] text-white text-xs font-bold border border-[#1D1A16] shadow-[2px_2px_0_#1D1A16] hover:bg-[#B33A10] disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer"
        >
          {isSubmitting ? (
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </form>

      {/* Suggestion pills */}
      <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-[#6B6353]">
        <span className="font-bold">Try:</span>
        {[
          'table users and orders',
          'nextjs, redis, postgres',
          'auth flow with decision',
          'sprint checklist',
        ].map(sample => (
          <button
            key={sample}
            type="button"
            onClick={() => setPrompt(sample)}
            className="bg-[#F4EFE4] hover:bg-[#EAE2D2] text-[#1D1A16] px-1.5 py-0.5 rounded border border-[#DCD4C2] font-mono cursor-pointer transition-colors"
          >
            {sample}
          </button>
        ))}
      </div>
    </div>
  );
}
