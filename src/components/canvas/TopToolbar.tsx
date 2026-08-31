'use client';

import React from 'react';
import {
  Plus,
  LayoutGrid,
  Maximize,
  Undo2,
  Download,
  Trash2,
  Layers,
  Sparkles,
  ZoomIn,
  ZoomOut,
  HelpCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface TopToolbarProps {
  zoomLevel: number;
  canUndo: boolean;
  isStudioOpen: boolean;
  healthScore?: number;
  onAddNote: () => void;
  onTidyClusters: () => void;
  onTidyTimeline: () => void;
  onTidyKanban: () => void;
  onTidyForceDirected: () => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUndo: () => void;
  onOpenTemplates: () => void;
  onOpenExport: () => void;
  onClearCanvas: () => void;
  onOpenHelp: () => void;
  onToggleStudio: () => void;
  onOpenHealth: () => void;
}

export function TopToolbar({
  zoomLevel,
  canUndo,
  isStudioOpen,
  healthScore = 100,
  onAddNote,
  onTidyClusters,
  onTidyTimeline,
  onTidyKanban,
  onTidyForceDirected,
  onFitView,
  onZoomIn,
  onZoomOut,
  onUndo,
  onOpenTemplates,
  onOpenExport,
  onClearCanvas,
  onOpenHelp,
  onToggleStudio,
  onOpenHealth,
}: TopToolbarProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 p-1.5 bg-[#FFFDF6] border border-[#1D1A16] rounded-2xl shadow-[4px_4px_0_rgba(29,26,22,0.14)] max-w-[95vw] overflow-x-auto">
      {/* Primary New Note */}
      <button
        onClick={onAddNote}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1D1A16] text-[#F4EFE4] text-xs font-bold shadow-[2px_2px_0_#6B6353] hover:bg-[#E24E1B] hover:shadow-[2px_2px_0_#B33A10] active:translate-x-[1px] active:translate-y-[1px] transition-all whitespace-nowrap cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>New Note</span>
      </button>

      <span className="w-px h-5 bg-[#DCD4C2] mx-1" />

      {/* Templates */}
      <button
        onClick={onOpenTemplates}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1D1A16] hover:bg-[#F4EFE4] transition-colors whitespace-nowrap cursor-pointer"
        title="Load pre-built strategy and architecture templates"
      >
        <Layers className="w-3.5 h-3.5 text-[#E24E1B]" />
        <span className="hidden sm:inline">Templates</span>
      </button>

      {/* 1-Click Physics Untangle / Auto-Tidy */}
      <button
        onClick={onTidyForceDirected}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1D1A16] bg-[#DCEBC8]/50 border border-emerald-600/30 hover:bg-[#DCEBC8] transition-colors whitespace-nowrap cursor-pointer"
        title="Physics-based auto-tidy: Untangle wires & balance note spacing"
      >
        <Zap className="w-3.5 h-3.5 text-emerald-700" />
        <span className="hidden md:inline">Auto-Tidy</span>
      </button>

      {/* Layout Presets Dropdown */}
      <div className="relative group">
        <button
          onClick={onTidyClusters}
          className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold text-[#1D1A16] hover:bg-[#F4EFE4] transition-colors whitespace-nowrap cursor-pointer"
          title="Alternative graph layouts"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-[#6B6353]" />
          <span className="text-[10px] text-[#6B6353]">Layouts</span>
        </button>

        {/* Dropdown for alternative layouts */}
        <div className="absolute top-full left-0 mt-1 hidden group-hover:flex flex-col bg-[#FFFDF6] border border-[#1D1A16] rounded-xl p-1 shadow-[3px_3px_0_#1D1A16] min-w-[150px] z-50 animate-note-pop">
          <button
            onClick={onTidyForceDirected}
            className="text-left px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-[#DCEBC8] text-[#1D1A16] flex items-center gap-1.5"
          >
            <Zap className="w-3 h-3 text-emerald-700" />
            <span>Physics Untangle</span>
          </button>
          <button
            onClick={onTidyClusters}
            className="text-left px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-[#F4EFE4] text-[#1D1A16]"
          >
            Cluster Columns
          </button>
          <button
            onClick={onTidyTimeline}
            className="text-left px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-[#F4EFE4] text-[#1D1A16]"
          >
            Timeline Sequence
          </button>
          <button
            onClick={onTidyKanban}
            className="text-left px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-[#F4EFE4] text-[#1D1A16]"
          >
            Kanban Categories
          </button>
        </div>
      </div>

      {/* Graph Health Pill */}
      <button
        onClick={onOpenHealth}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 text-emerald-900 text-xs font-bold hover:bg-emerald-100 transition-colors whitespace-nowrap cursor-pointer"
        title="View graph coherence score and lint suggestions"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
        <span className="font-mono text-[11px]">{healthScore}%</span>
      </button>

      {/* Fit View */}
      <button
        onClick={onFitView}
        className="p-2 rounded-xl text-[#1D1A16] hover:bg-[#F4EFE4] transition-colors cursor-pointer"
        title="Zoom to fit all notes"
      >
        <Maximize className="w-4 h-4" />
      </button>

      {/* Zoom controls */}
      <div className="hidden lg:flex items-center bg-[#F4EFE4] border border-[#DCD4C2] rounded-xl px-1.5 py-0.5">
        <button onClick={onZoomOut} className="p-1 text-[#6B6353] hover:text-[#1D1A16] cursor-pointer">
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-[11px] font-mono font-bold px-1.5 min-w-[40px] text-center">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button onClick={onZoomIn} className="p-1 text-[#6B6353] hover:text-[#1D1A16] cursor-pointer">
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Undo */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`p-2 rounded-xl transition-colors ${
          canUndo ? 'text-[#1D1A16] hover:bg-[#F4EFE4] cursor-pointer' : 'text-[#6B6353]/40 cursor-not-allowed'
        }`}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4" />
      </button>

      <span className="w-px h-5 bg-[#DCD4C2] mx-1" />

      {/* Export */}
      <button
        onClick={onOpenExport}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1D1A16] hover:bg-[#F4EFE4] transition-colors whitespace-nowrap cursor-pointer"
        title="Export to Markdown, Mermaid, or JSON"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Export</span>
      </button>

      {/* Clear Canvas */}
      <button
        onClick={onClearCanvas}
        className="p-2 rounded-xl text-[#E24E1B] hover:bg-[#FFD8C7] transition-colors cursor-pointer"
        title="Clear entire canvas"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Help Shortcuts */}
      <button
        onClick={onOpenHelp}
        className="p-2 rounded-xl text-[#6B6353] hover:text-[#1D1A16] hover:bg-[#F4EFE4] transition-colors cursor-pointer"
        title="Keyboard shortcuts and WebMCP tips"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      <span className="w-px h-5 bg-[#DCD4C2] mx-1" />

      {/* Agent Studio Toggle Button */}
      <button
        onClick={onToggleStudio}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
          isStudioOpen
            ? 'bg-[#E24E1B] text-white border-[#B33A10] shadow-[2px_2px_0_#1D1A16]'
            : 'bg-[#FFFDF6] text-[#1D1A16] border-[#1D1A16] hover:bg-[#F4EFE4]'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>Agent Studio</span>
      </button>
    </div>
  );
}
