'use client';

import React, { useState } from 'react';
import { WebMCPToolDef } from '@/lib/types';
import { ChevronRight, Code2, Shield } from 'lucide-react';

interface ToolRegistryViewProps {
  tools: Record<string, WebMCPToolDef>;
}

export function ToolRegistryView({ tools }: ToolRegistryViewProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const toolList = Object.values(tools);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wider text-[#6B6353] uppercase font-mono">
          WebMCP Tool Registry ({toolList.length})
        </span>
        <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
          <Shield className="w-3 h-3" /> Live on document.modelContext
        </span>
      </div>

      <div className="border border-[#DCD4C2] rounded-xl overflow-hidden bg-[#FFFDF6] divide-y divide-[#DCD4C2] max-h-[160px] overflow-y-auto text-xs">
        {toolList.map(t => {
          const isOpen = selectedTool === t.name;
          return (
            <div key={t.name} className="flex flex-col">
              <button
                onClick={() => setSelectedTool(isOpen ? null : t.name)}
                className="flex items-center justify-between px-3 py-2 hover:bg-[#F4EFE4] text-left transition-colors font-mono"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Code2 className="w-3.5 h-3.5 text-[#E24E1B] flex-shrink-0" />
                  <span className="font-bold text-[#1D1A16] truncate">{t.name}</span>
                </div>
                <ChevronRight
                  className={`w-3 h-3 text-[#6B6353] transition-transform ${
                    isOpen ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-3 pb-2.5 pt-1 bg-[#F4EFE4]/60 text-[11px] text-[#403A2F] border-t border-[#DCD4C2]/50 font-sans space-y-1.5 animate-note-pop">
                  <p className="leading-snug">{t.description}</p>
                  <pre className="p-2 rounded bg-[#1D1A16] text-[#F4EFE4] font-mono text-[10px] overflow-x-auto">
                    {JSON.stringify(t.inputSchema, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
