'use client';

import React, { useState } from 'react';
import { CanvasNode, ToolLogEntry, WebMCPToolDef } from '@/lib/types';
import { BoardHealthReport } from '@/lib/layouts';
import { Sparkles, X, Activity, ShieldCheck, Wrench, Settings2, Bot } from 'lucide-react';
import { QuickMissions } from './QuickMissions';
import { FreeformPromptBar } from './FreeformPromptBar';
import { ToolRegistryView } from './ToolRegistryView';
import { ToolActivityLog } from './ToolActivityLog';
import { GraphHealthView } from './GraphHealthView';
import { LLMSettingsView } from './LLMSettingsView';

interface AgentStudioDrawerProps {
  isOpen: boolean;
  hasWebMCP: boolean;
  nodes: CanvasNode[];
  selectedNodeId: string | null;
  tools: Record<string, WebMCPToolDef>;
  logs: ToolLogEntry[];
  healthReport: BoardHealthReport;
  onClose: () => void;
  onRunMission: (missionId: string) => Promise<void>;
  onRunPrompt: (prompt: string) => Promise<void>;
  onAutoTidy: () => void;
  onHighlightNode: (nodeId: string, reason?: string) => void;
  onClearLogs: () => void;
}

export function AgentStudioDrawer({
  isOpen,
  hasWebMCP,
  nodes,
  selectedNodeId,
  tools,
  logs,
  healthReport,
  onClose,
  onRunMission,
  onRunPrompt,
  onAutoTidy,
  onHighlightNode,
  onClearLogs,
}: AgentStudioDrawerProps) {
  const [activeTab, setActiveTab] = useState<'missions' | 'health' | 'tools' | 'logs' | 'settings'>('missions');

  if (!isOpen) return null;

  return (
    <aside className="absolute top-4 right-4 bottom-4 z-40 w-80 sm:w-96 flex flex-col bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-2xl shadow-[6px_6px_0_#1D1A16] overflow-hidden animate-note-pop">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#DCD4C2] bg-[#F4EFE4]/80 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#E24E1B] text-white flex items-center justify-center border border-[#B33A10]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-['Fraunces'] italic font-bold text-base text-[#1D1A16] leading-none">
              Agent Studio
            </h3>
            <span className="text-[10px] text-[#6B6353] font-mono flex items-center gap-1 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${hasWebMCP ? 'bg-emerald-500 animate-pulse' : 'bg-[#E24E1B]'}`} />
              {hasWebMCP ? 'WebMCP Connected' : 'Local Dynamic Simulation'}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg border border-[#1D1A16] bg-[#FFFDF6] hover:bg-[#F4EFE4] transition-colors cursor-pointer"
          title="Close Agent Studio"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center border-b border-[#DCD4C2] bg-[#FFFDF6] px-2 pt-1 gap-1 text-[11px] font-bold flex-shrink-0 overflow-x-auto">
        {[
          { id: 'missions', label: 'Missions', icon: Bot },
          { id: 'health', label: `Health (${healthReport.score}%)`, icon: ShieldCheck },
          { id: 'tools', label: 'Schemas', icon: Wrench },
          { id: 'logs', label: `Logs (${logs.length})`, icon: Activity },
          { id: 'settings', label: 'Settings', icon: Settings2 },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1 px-2.5 py-2 border-b-2 font-['Space_Grotesk'] transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-[#E24E1B] text-[#E24E1B] bg-[#FFE9A8]/20 rounded-t-md'
                  : 'border-transparent text-[#6B6353] hover:text-[#1D1A16]'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Body contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'missions' && (
          <div className="space-y-4">
            <FreeformPromptBar onRunPrompt={onRunPrompt} />
            <QuickMissions
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onRunMission={onRunMission}
            />
          </div>
        )}

        {activeTab === 'health' && (
          <GraphHealthView
            report={healthReport}
            onAutoTidy={onAutoTidy}
            onRunMission={onRunMission}
            onHighlightNode={onHighlightNode}
          />
        )}

        {activeTab === 'tools' && <ToolRegistryView tools={tools} />}

        {activeTab === 'logs' && <ToolActivityLog logs={logs} onClearLogs={onClearLogs} />}

        {activeTab === 'settings' && <LLMSettingsView />}
      </div>
    </aside>
  );
}
