'use client';

import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface FreeformPromptBarProps {
  onRunPrompt: (prompt: string) => Promise<void>;
}

export function FreeformPromptBar({ onRunPrompt }: FreeformPromptBarProps) {
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wider text-[#6B6353] uppercase font-mono">
          Freeform Agent Command
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-1.5">
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="e.g. 'add note Launch Plan', 'tidy', 'pros & cons'..."
          disabled={isSubmitting}
          className="flex-1 bg-[#F4EFE4] border border-[#1D1A16] rounded-xl px-3 py-2 text-xs text-[#1D1A16] placeholder:text-[#6B6353]/60 focus:outline-none focus:ring-2 focus:ring-[#E24E1B] shadow-inner"
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isSubmitting}
          className="px-3.5 py-2 rounded-xl bg-[#E24E1B] text-white text-xs font-bold border border-[#1D1A16] shadow-[2px_2px_0_#1D1A16] hover:bg-[#B33A10] disabled:opacity-50 transition-all flex items-center justify-center"
        >
          {isSubmitting ? (
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </form>

      <p className="text-[10px] text-[#6B6353] font-['Kalam']">
        Tip: try <span className="underline cursor-pointer" onClick={() => setPrompt('add note: Pricing Model')}>"add note: Pricing Model"</span> or <span className="underline cursor-pointer" onClick={() => setPrompt('tidy')}>"tidy"</span>
      </p>
    </div>
  );
}
