'use client';

import React, { useState } from 'react';
import { Sparkles, GitFork, Scale, Eye, LayoutGrid, Clock, ShieldCheck, Play } from 'lucide-react';
import { CanvasNode } from '@/lib/types';
import { useToast } from '@/components/ui/ToastProvider';

interface QuickMissionsProps {
  nodes: CanvasNode[];
  selectedNodeId: string | null;
  onRunMission: (missionId: string) => Promise<void>;
}

export function QuickMissions({ nodes, selectedNodeId, onRunMission }: QuickMissionsProps) {
  const [runningId, setRunningId] = useState<string | null>(null);
  const { showToast } = useToast();

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const missions = [
    {
      id: 'expand',
      title: 'Expand Idea',
      description: selectedNode
        ? `Generate 4 structured branches off "${selectedNode.title.slice(0, 20)}..."`
        : 'Generate 4 structured branches off selected note',
      icon: GitFork,
      requiresSelection: false,
    },
    {
      id: 'pros_cons',
      title: 'Weigh Pros & Cons',
      description: 'Map 3 supporting arguments and 3 critical risks with directed wires',
      icon: Scale,
      requiresSelection: false,
    },
    {
      id: 'critique',
      title: 'Critique Board',
      description: 'Scan graph structure, highlight orphan nodes, and post strategic review',
      icon: Eye,
      requiresSelection: false,
    },
    {
      id: 'swot',
      title: 'SWOT Matrix',
      description: 'Spawn Strengths, Weaknesses, Opportunities & Threats quadrant',
      icon: ShieldCheck,
      requiresSelection: false,
    },
    {
      id: 'tidy',
      title: 'Tidy into Clusters',
      description: 'Auto-group connected components into clean visual columns',
      icon: LayoutGrid,
      requiresSelection: false,
    },
    {
      id: 'timeline',
      title: 'Sequence Timeline',
      description: 'Arrange all canvas ideas chronologically by creation timestamp',
      icon: Clock,
      requiresSelection: false,
    },
  ];

  const handleRun = async (id: string) => {
    if (runningId) return;
    setRunningId(id);
    try {
      await onRunMission(id);
    } catch {
      showToast('Mission failed to execute', 'warn');
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wider text-[#6B6353] uppercase font-mono">
          Quick Missions
        </span>
        <span className="text-[10px] text-[#6B6353]">Same tools as WebMCP</span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {missions.map(m => {
          const Icon = m.icon;
          const isBusy = runningId === m.id;

          return (
            <button
              key={m.id}
              onClick={() => handleRun(m.id)}
              disabled={Boolean(runningId)}
              className="flex items-start gap-2.5 p-2.5 rounded-xl border border-[#1D1A16] bg-[#FFFDF6] shadow-[2px_2px_0_#1D1A16] hover:bg-[#1D1A16] hover:text-[#F4EFE4] group text-left transition-all active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-50"
            >
              <div className="p-1.5 rounded-lg bg-[#F4EFE4] border border-[#DCD4C2] group-hover:bg-[#E24E1B] group-hover:text-white group-hover:border-[#B33A10] transition-colors flex-shrink-0">
                {isBusy ? (
                  <Sparkles className="w-4 h-4 animate-spin text-[#E24E1B] group-hover:text-white" />
                ) : (
                  <Icon className="w-4 h-4 text-[#E24E1B] group-hover:text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold truncate group-hover:text-white">
                    {m.title}
                  </h4>
                  <Play className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FFE9A8]" />
                </div>
                <p className="text-[11px] text-[#6B6353] group-hover:text-[#DAE5E6]/80 leading-tight line-clamp-2 mt-0.5 font-['Kalam']">
                  {m.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
