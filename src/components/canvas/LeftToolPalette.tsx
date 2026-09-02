'use client';

import React from 'react';
import {
  MousePointer2,
  Hand,
  StickyNote as NoteIcon,
  Shapes,
  Type,
  CheckSquare,
  Workflow,
  Code2,
  Eraser,
  Sparkles,
  Search,
} from 'lucide-react';

export type CanvasToolType =
  | 'select'
  | 'hand'
  | 'note'
  | 'logo'
  | 'heading'
  | 'task'
  | 'connector'
  | 'eraser';

interface LeftToolPaletteProps {
  activeTool: CanvasToolType;
  onSelectTool: (tool: CanvasToolType) => void;
  onOpenLogoSearch: () => void;
  onOpenDiagramDsl: () => void;
  onToggleStudio: () => void;
  isStudioOpen: boolean;
  selectedCount?: number;
}

export function LeftToolPalette({
  activeTool,
  onSelectTool,
  onOpenLogoSearch,
  onOpenDiagramDsl,
  onToggleStudio,
  isStudioOpen,
  selectedCount = 0,
}: LeftToolPaletteProps) {
  const tools: Array<{
    id: CanvasToolType;
    label: string;
    shortcut: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }> = [
    {
      id: 'select',
      label: 'Select / Resize',
      shortcut: 'V',
      icon: MousePointer2,
      description: 'Select, move, resize, and edit canvas elements. Drag to box-select.',
    },
    {
      id: 'hand',
      label: 'Pan Canvas',
      shortcut: 'H',
      icon: Hand,
      description: 'Drag canvas freely to navigate without moving notes.',
    },
    {
      id: 'note',
      label: 'Sticky Note',
      shortcut: 'N',
      icon: NoteIcon,
      description: 'Click anywhere on canvas to drop a new sticky note.',
    },
    {
      id: 'logo',
      label: 'Tech Logos',
      shortcut: 'I',
      icon: Shapes,
      description: 'Browse and place 1,880+ vector architecture logos.',
    },
    {
      id: 'heading',
      label: 'Section Banner',
      shortcut: 'T',
      icon: Type,
      description: 'Click to add a bold section header banner.',
    },
    {
      id: 'task',
      label: 'Checklist Task',
      shortcut: 'C',
      icon: CheckSquare,
      description: 'Click to place an interactive task list card.',
    },
    {
      id: 'connector',
      label: 'Wire Connector',
      shortcut: 'W',
      icon: Workflow,
      description: 'Click a note to start connecting wires.',
    },
    {
      id: 'eraser',
      label: 'Eraser',
      shortcut: 'E',
      icon: Eraser,
      description: 'Click any note or connection wire to delete it.',
    },
  ];

  return (
    <aside
      aria-label="Canvas Tool Palette"
      className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1.5 p-2 bg-[#FFFDF6]/95 backdrop-blur-md border-2 border-[#1D1A16] rounded-2xl shadow-[4px_4px_0_#1D1A16] transition-all"
    >
      {/* Primary Tool Switchers */}
      <div className="flex flex-col gap-1">
        {tools.map(tool => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => {
                if (tool.id === 'logo') {
                  onOpenLogoSearch();
                } else {
                  onSelectTool(tool.id);
                }
              }}
              className={`relative group p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                isActive
                  ? 'bg-[#1D1A16] text-[#FFFDF6] shadow-[2px_2px_0_#E24E1B]'
                  : 'text-[#1D1A16] hover:bg-[#F4EFE4] hover:text-[#E24E1B]'
              }`}
              title={`${tool.label} (${tool.shortcut}) - ${tool.description}`}
            >
              <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />

              {/* Tooltip on Hover */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#1D1A16] text-[#FFFDF6] text-xs font-bold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 flex items-center gap-2">
                <span>{tool.label}</span>
                <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono font-bold">
                  {tool.shortcut}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="w-6 h-px bg-[#DCD4C2] my-1" />

      {/* Quick Action: Diagram as Code (DSL) */}
      <button
        onClick={onOpenDiagramDsl}
        className="relative group p-2.5 rounded-xl text-[#1D1A16] hover:bg-[#FFE9A8] hover:text-[#B33A10] transition-colors cursor-pointer"
        title="Diagram-as-Code DSL & Mermaid Editor (Ctrl+Shift+D)"
      >
        <Code2 className="w-4 h-4 text-[#E24E1B]" />
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#1D1A16] text-[#FFFDF6] text-xs font-bold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 flex items-center gap-2">
          <span>Diagram-as-Code DSL</span>
          <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono font-bold">
            Ctrl+Shift+D
          </span>
        </div>
      </button>

      {/* Quick Action: Search Logos */}
      <button
        onClick={onOpenLogoSearch}
        className="relative group p-2.5 rounded-xl text-[#1D1A16] hover:bg-[#F4EFE4] transition-colors cursor-pointer"
        title="Search All 1,882+ Tech Logos (Ctrl+L)"
      >
        <Search className="w-4 h-4 text-[#00C7B7]" />
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#1D1A16] text-[#FFFDF6] text-xs font-bold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 flex items-center gap-2">
          <span>Search 1,882+ Logos</span>
          <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono font-bold">
            Ctrl+L
          </span>
        </div>
      </button>

      {/* Quick Action: Agent Studio */}
      <button
        onClick={onToggleStudio}
        className={`relative group p-2.5 rounded-xl transition-all cursor-pointer ${
          isStudioOpen
            ? 'bg-[#E24E1B] text-white shadow-[2px_2px_0_#1D1A16]'
            : 'text-[#E24E1B] hover:bg-[#FFD8C7]'
        }`}
        title="Toggle AI Agent Studio"
      >
        <Sparkles className="w-4 h-4" />
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#1D1A16] text-[#FFFDF6] text-xs font-bold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 flex items-center gap-2">
          <span>AI Agent Studio</span>
        </div>
      </button>

      {/* Selected Items Counter Badge if > 0 */}
      {selectedCount > 0 && (
        <div
          className="mt-1 px-1.5 py-0.5 rounded-full bg-[#E24E1B] text-white text-[10px] font-mono font-bold shadow-xs animate-note-pop"
          title={`${selectedCount} item${selectedCount > 1 ? 's' : ''} selected`}
        >
          {selectedCount}
        </div>
      )}
    </aside>
  );
}
