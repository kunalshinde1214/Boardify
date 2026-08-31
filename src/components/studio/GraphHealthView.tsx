'use client';

import React from 'react';
import { BoardHealthReport } from '@/lib/layouts';
import { ShieldCheck, AlertTriangle, CheckCircle, ArrowRight, Zap, RefreshCw, MapPin, Sparkles } from 'lucide-react';

interface GraphHealthViewProps {
  report: BoardHealthReport;
  onAutoTidy: () => void;
  onRunMission: (missionId: string) => Promise<void>;
  onHighlightNode: (nodeId: string, reason?: string) => void;
}

export function GraphHealthView({
  report,
  onAutoTidy,
  onRunMission,
  onHighlightNode,
}: GraphHealthViewProps) {
  const getGradeColor = (g: string) => {
    if (g === 'A+' || g === 'A') return 'text-emerald-700 bg-emerald-100 border-emerald-500';
    if (g === 'B') return 'text-blue-700 bg-blue-100 border-blue-500';
    if (g === 'C') return 'text-amber-700 bg-amber-100 border-amber-500';
    return 'text-rose-700 bg-rose-100 border-rose-500';
  };

  return (
    <div className="space-y-3.5 text-left">
      {/* Top Health Card */}
      <div className="p-3.5 rounded-xl bg-[#FFFDF6] border border-[#1D1A16] shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] font-bold text-[#6B6353] uppercase tracking-wider">
              Spatial Graph Health
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-['Fraunces'] font-extrabold text-2xl text-[#1D1A16]">
                {report.score}%
              </span>
              <span className="text-xs text-[#6B6353] font-mono">Coherence</span>
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-xl border text-base font-extrabold font-['Fraunces'] shadow-xs ${getGradeColor(
              report.grade
            )}`}
          >
            {report.grade}
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="w-full bg-[#E5DFD3] h-2 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#E24E1B] to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${report.score}%` }}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#DCD4C2] text-center font-mono text-[10px]">
          <div>
            <div className="font-bold text-xs text-[#1D1A16]">{report.totalNodes}</div>
            <div className="text-[#6B6353]">Notes</div>
          </div>
          <div>
            <div className="font-bold text-xs text-[#1D1A16]">{report.totalEdges}</div>
            <div className="text-[#6B6353]">Links</div>
          </div>
          <div>
            <div className="font-bold text-xs text-emerald-700">{report.agentCount}</div>
            <div className="text-[#6B6353]">Agent Co-created</div>
          </div>
        </div>
      </div>

      {/* Structural Insights */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6353] font-mono">
          Agent Lint Findings
        </span>
        <div className="space-y-1.5 text-xs">
          {report.insights.map((ins, idx) => (
            <div
              key={idx}
              className="p-2 rounded-lg bg-[#F4EFE4] border border-[#DCD4C2] text-[#403A2F] text-[11px] flex items-start gap-2"
            >
              <span>{ins}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Orphan Nodes Callout */}
      {report.orphanNodes.length > 0 && (
        <div className="p-3 rounded-xl bg-[#FFD8C7]/40 border border-[#E24E1B]/40 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#B33A10]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#E24E1B]" />
            <span>{report.orphanNodes.length} Unconnected Notes Detected</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {report.orphanNodes.slice(0, 4).map(node => (
              <button
                key={node.id}
                onClick={() => onHighlightNode(node.id, 'Unconnected orphan note')}
                className="text-[10px] px-2 py-0.5 bg-[#FFFDF6] border border-[#1D1A16] rounded-md font-semibold text-[#1D1A16] hover:bg-[#FFE9A8] transition-colors flex items-center gap-1 cursor-pointer"
                title="Click to focus note on canvas"
              >
                <MapPin className="w-2.5 h-2.5 text-[#E24E1B]" />
                <span>{node.title.slice(0, 16)}…</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 1-Click Fixes */}
      <div className="space-y-2 pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6353] font-mono">
          Quick Optimization Actions
        </span>
        <div className="space-y-1.5">
          <button
            onClick={onAutoTidy}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#FFFDF6] border border-[#1D1A16] shadow-[2px_2px_0_#1D1A16] hover:bg-[#DCEBC8] text-xs font-bold text-[#1D1A16] transition-all"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-emerald-700" />
              <span>Physics Auto-Tidy & Untangle</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#6B6353]" />
          </button>

          <button
            onClick={() => onRunMission('expand')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#FFFDF6] border border-[#1D1A16] shadow-[2px_2px_0_#1D1A16] hover:bg-[#FFE9A8] text-xs font-bold text-[#1D1A16] transition-all"
          >
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-[#E24E1B]" />
              <span>Auto-Expand Selected Anchor</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#6B6353]" />
          </button>
        </div>
      </div>
    </div>
  );
}
