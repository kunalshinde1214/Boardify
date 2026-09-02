'use client';

import React, { useState, useMemo } from 'react';
import { WebMCPToolDef } from '@/lib/types';
import { ChevronRight, Code2, Shield, Search, Copy, Check } from 'lucide-react';

interface ToolRegistryViewProps {
  tools: Record<string, WebMCPToolDef>;
}

export function ToolRegistryView({ tools }: ToolRegistryViewProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTool, setCopiedTool] = useState<string | null>(null);

  const toolList = useMemo(() => Object.values(tools), [tools]);

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return toolList;
    const q = searchQuery.toLowerCase().trim();
    return toolList.filter(
      t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        JSON.stringify(t.inputSchema).toLowerCase().includes(q)
    );
  }, [toolList, searchQuery]);

  const handleCopySchema = (e: React.MouseEvent, toolName: string, schema: any) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    setCopiedTool(toolName);
    setTimeout(() => setCopiedTool(null), 2000);
  };

  return (
    <div className="space-y-3 flex flex-col h-full">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wider text-[#6B6353] uppercase font-mono">
          WebMCP Tool Registry ({toolList.length})
        </span>
        <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
          <Shield className="w-3 h-3 text-emerald-600" /> Live on document.modelContext
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B6353]" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Filter 30+ WebMCP tools by name, action, schema..."
          className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#DCD4C2] bg-[#FFFDF6] text-xs text-[#1D1A16] placeholder:text-[#6B6353]/60 outline-none focus:border-[#E24E1B] transition-colors"
        />
        {searchQuery && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#6B6353]">
            {filteredTools.length} found
          </span>
        )}
      </div>

      {/* Tool List */}
      <div className="border border-[#DCD4C2] rounded-xl overflow-hidden bg-[#FFFDF6] divide-y divide-[#DCD4C2] max-h-[380px] overflow-y-auto text-xs flex-1">
        {filteredTools.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#6B6353]">
            No WebMCP tools match "{searchQuery}"
          </div>
        ) : (
          filteredTools.map(t => {
            const isOpen = selectedTool === t.name;
            const isCopied = copiedTool === t.name;

            return (
              <div key={t.name} className="flex flex-col">
                <button
                  onClick={() => setSelectedTool(isOpen ? null : t.name)}
                  className={`flex items-center justify-between px-3 py-2 text-left transition-colors font-mono cursor-pointer ${
                    isOpen ? 'bg-[#FFE9A8]/40' : 'hover:bg-[#F4EFE4]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <Code2 className="w-3.5 h-3.5 text-[#E24E1B] flex-shrink-0" />
                    <span className="font-bold text-[#1D1A16] truncate text-[11px]">{t.name}</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 text-[#6B6353] transition-transform flex-shrink-0 ${
                      isOpen ? 'rotate-90 text-[#E24E1B]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 pt-2 bg-[#F4EFE4]/60 text-[11px] text-[#403A2F] border-t border-[#DCD4C2]/60 font-sans space-y-2 animate-note-pop">
                    <div className="flex items-start justify-between gap-2">
                      <p className="leading-relaxed text-[#1D1A16] font-medium">{t.description}</p>
                      <button
                        onClick={e => handleCopySchema(e, t.name, t.inputSchema)}
                        className="p-1 rounded hover:bg-[#1D1A16]/10 text-[#6B6353] hover:text-[#1D1A16] shrink-0 cursor-pointer"
                        title="Copy JSON Schema"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-[#6B6353] block mb-1">
                        Input Schema
                      </span>
                      <pre className="p-2.5 rounded-lg bg-[#1D1A16] text-[#F4EFE4] font-mono text-[10px] overflow-x-auto leading-tight max-h-40">
                        {JSON.stringify(t.inputSchema, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
