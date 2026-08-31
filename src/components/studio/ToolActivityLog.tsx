'use client';

import React from 'react';
import { ToolLogEntry } from '@/lib/types';
import { Terminal, CheckCircle2, XCircle, Trash2 } from 'lucide-react';

interface ToolActivityLogProps {
  logs: ToolLogEntry[];
  onClearLogs: () => void;
}

export function ToolActivityLog({ logs, onClearLogs }: ToolActivityLogProps) {
  return (
    <div className="flex flex-col h-full bg-[#1D1A16] text-[#F4EFE4] rounded-xl overflow-hidden border border-[#1D1A16]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#6B6353]/30 bg-[#1D1A16]">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#FFE9A8]">
          <Terminal className="w-3.5 h-3.5" />
          <span>TOOL ACTIVITY STREAM</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#6B6353]/40 text-[#F4EFE4]">
            {logs.length}
          </span>
        </div>
        <button
          onClick={onClearLogs}
          className="p-1 text-[#6B6353] hover:text-[#F4EFE4] rounded transition-colors"
          title="Clear activity log"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Log lines */}
      <div className="flex-1 p-2.5 space-y-2 overflow-y-auto font-mono text-[11px] max-h-[220px]">
        {logs.length === 0 ? (
          <div className="text-center py-6 text-[#6B6353] italic">
            No tool calls yet. Run a mission or speak to the agent in ChatGPT/Chrome.
          </div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={`${log.id}-${idx}`}
              className="p-2 rounded-lg bg-[#27231E] border border-[#6B6353]/20 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                      log.source === 'webmcp'
                        ? 'bg-[#E24E1B] text-white'
                        : 'bg-[#6B6353]/50 text-[#FFE9A8]'
                    }`}
                  >
                    {log.source === 'webmcp' ? 'WebMCP' : 'Studio'}
                  </span>
                  <span className="font-bold text-[#FFE9A8]">{log.toolName}</span>
                </div>
                <div className="flex items-center gap-1 text-[#6B6353]">
                  <span>{log.timestamp}</span>
                  {log.success !== false ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3 h-3 text-[#E24E1B]" />
                  )}
                </div>
              </div>

              {/* Input params */}
              {Object.keys(log.input || {}).length > 0 && (
                <div className="text-[#DAE5E6]/80 text-[10px] truncate">
                  <span className="text-[#6B6353]">args:</span> {JSON.stringify(log.input)}
                </div>
              )}

              {/* Output summary */}
              {log.output && (
                <div className="text-emerald-300/90 text-[10px] truncate">
                  <span className="text-[#6B6353]">result:</span>{' '}
                  {log.output.error
                    ? String(log.output.error)
                    : log.output.message
                    ? String(log.output.message)
                    : log.output.node_id
                    ? `node: ${String(log.output.node_id)}`
                    : 'success: true'}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
