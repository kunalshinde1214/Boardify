'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface AgentGhostCursorProps {
  x: number;
  y: number;
  isActive: boolean;
  actionText?: string;
}

export function AgentGhostCursor({ x, y, isActive, actionText }: AgentGhostCursorProps) {
  if (!isActive) return null;

  return (
    <div
      style={{
        transform: `translate(${x}px, ${y}px)`,
        transition: 'transform 0.45s cubic-bezier(0.2, 1, 0.3, 1)',
      }}
      className="absolute top-0 left-0 z-50 pointer-events-none -ml-4 -mt-4 flex items-center"
    >
      {/* Concentric pulsing aura */}
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-[#E24E1B] text-white flex items-center justify-center shadow-lg border border-white/50">
          <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-[#E24E1B] animate-pulse-ring" />
      </div>

      {/* Label Badge */}
      <div className="ml-2 flex items-center gap-1.5 bg-[#FFFDF6] border border-[#E24E1B] text-[#E24E1B] text-[10px] font-bold px-2 py-0.5 rounded shadow-[2px_2px_0_#E24E1B] whitespace-nowrap">
        <span>AGENT</span>
        {actionText && <span className="text-[#1D1A16] font-normal">· {actionText}</span>}
      </div>
    </div>
  );
}
