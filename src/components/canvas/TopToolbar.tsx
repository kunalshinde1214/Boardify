'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
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
  FolderOpen,
  FilePlus,
  ChevronDown,
  Workflow,
  Share2,
  CheckSquare,
  Type,
  Flag,
  Code2,
} from 'lucide-react';
import { BoardMetadata } from '@/lib/firestore-boards';
import { AVAILABLE_LOGOS, AVAILABLE_SIGNS, NetlifyIcon } from '@/components/ui/BrandIcons';

interface TopToolbarProps {
  zoomLevel: number;
  canUndo: boolean;
  isStudioOpen: boolean;
  healthScore?: number;
  boards?: BoardMetadata[];
  activeBoardId?: string;
  activeBoardTitle?: string;
  onAddNote: () => void;
  onAddSign?: (signId: string) => void;
  onAddLogo?: (logoId: string) => void;
  onAddHeading?: () => void;
  onAddTaskNote?: () => void;
  onSmartArrange: () => void;
  onTidyClusters: () => void;
  onTidyTimeline: () => void;
  onTidyKanban: () => void;
  onTidyForceDirected: () => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUndo: () => void;
  onOpenTemplates: () => void;
  onOpenDiagramDsl?: () => void;
  onOpenExport: () => void;
  onOpenShareDeploy?: () => void;
  onClearCanvas: () => void;
  onOpenHelp: () => void;
  onToggleStudio: () => void;
  onOpenHealth: () => void;
  onOpenLogoSearch?: (category?: string) => void;
  onCreateNewBoard?: () => void;
  onSwitchBoard?: (id: string) => void;
}

export function TopToolbar({
  zoomLevel,
  canUndo,
  isStudioOpen,
  healthScore = 100,
  boards = [],
  activeBoardId = 'default',
  activeBoardTitle = 'Welcome Canvas',
  onAddNote,
  onAddSign,
  onAddLogo,
  onAddHeading,
  onAddTaskNote,
  onSmartArrange,
  onTidyClusters,
  onTidyTimeline,
  onTidyKanban,
  onTidyForceDirected,
  onFitView,
  onZoomIn,
  onZoomOut,
  onUndo,
  onOpenTemplates,
  onOpenDiagramDsl,
  onOpenExport,
  onOpenShareDeploy,
  onClearCanvas,
  onOpenHelp,
  onToggleStudio,
  onOpenHealth,
  onOpenLogoSearch,
  onCreateNewBoard,
  onSwitchBoard,
}: TopToolbarProps) {
  const [isBoardMenuOpen, setIsBoardMenuOpen] = useState(false);
  const [isInsertMenuOpen, setIsInsertMenuOpen] = useState(false);

  return (
    <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 p-1 bg-[#FFFDF6] border border-[#1D1A16] rounded-2xl shadow-[4px_4px_0_rgba(29,26,22,0.14)] max-w-[98vw] overflow-visible select-none">
      {/* 1. Multi-Board Switcher */}
      {onCreateNewBoard && (
        <div className="relative">
          <button
            onClick={() => setIsBoardMenuOpen(!isBoardMenuOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F4EFE4] text-[#1D1A16] text-xs font-bold border border-[#DCD4C2] hover:border-[#1D1A16] transition-all cursor-pointer whitespace-nowrap"
            title="Switch or create canvases"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#E24E1B]" />
            <span className="max-w-[100px] truncate">{activeBoardTitle}</span>
            <ChevronDown className="w-3 h-3 text-[#6B6353]" />
          </button>

          {/* Boards Dropdown */}
          {isBoardMenuOpen && (
            <div
              className="absolute top-full left-0 mt-2 w-56 bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-xl p-1.5 shadow-[4px_4px_0_#1D1A16] z-50 animate-note-pop flex flex-col gap-1"
              onMouseLeave={() => setIsBoardMenuOpen(false)}
            >
              <div className="px-2 py-0.5 text-[9px] font-bold text-[#6B6353] uppercase tracking-wider">
                My Canvases
              </div>

              <div className="max-h-44 overflow-y-auto space-y-0.5">
                {boards.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      onSwitchBoard?.(b.id);
                      setIsBoardMenuOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      b.id === activeBoardId
                        ? 'bg-[#FFE9A8] text-[#1D1A16] font-bold'
                        : 'hover:bg-[#F4EFE4] text-[#1D1A16]'
                    }`}
                  >
                    <span className="truncate">{b.title}</span>
                    <span className="text-[9px] text-[#6B6353] font-mono">{b.nodeCount}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-[#DCD4C2] my-0.5" />

              <button
                onClick={() => {
                  onCreateNewBoard();
                  setIsBoardMenuOpen(false);
                }}
                className="w-full px-2 py-1.5 rounded-lg text-xs font-bold text-[#E24E1B] hover:bg-[#FFD8C7] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span>+ New Canvas</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. Primary Insert Group (Note, Sign, Logo, Heading, Task) */}
      <div className="relative">
        <div className="flex items-center rounded-xl bg-[#1D1A16] text-[#F4EFE4] shadow-[2px_2px_0_#6B6353]">
          <button
            onClick={onAddNote}
            className="flex items-center gap-1 px-3 py-1.5 rounded-l-xl text-xs font-bold hover:bg-[#E24E1B] active:translate-x-[1px] active:translate-y-[1px] transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
          <button
            onClick={() => setIsInsertMenuOpen(!isInsertMenuOpen)}
            className="px-1.5 py-1.5 rounded-r-xl border-l border-white/20 hover:bg-[#E24E1B] transition-colors cursor-pointer"
            title="Insert signs, logos, headings, or tasks"
          >
            <ChevronDown className="w-3 h-3 text-[#F4EFE4]" />
          </button>
        </div>

        {/* Extended Insert Menu Dropdown */}
        {isInsertMenuOpen && (
          <div
            className="absolute top-full left-0 mt-2 bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-xl p-2 shadow-[4px_4px_0_#1D1A16] w-72 z-50 animate-note-pop flex flex-col gap-2"
            onMouseLeave={() => setIsInsertMenuOpen(false)}
          >
            <div>
              <span className="text-[9px] font-bold text-[#6B6353] uppercase tracking-wider block px-1 mb-1">
                Quick Elements
              </span>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => {
                    onAddHeading?.();
                    setIsInsertMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-[#FFE9A8] text-left text-xs font-bold text-[#1D1A16] cursor-pointer"
                >
                  <Type className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Section Header</span>
                </button>
                <button
                  onClick={() => {
                    onAddTaskNote?.();
                    setIsInsertMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-[#FFE9A8] text-left text-xs font-bold text-[#1D1A16] cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Task Checklist</span>
                </button>
              </div>
            </div>

            <div className="border-t border-[#DCD4C2] pt-1.5">
              <span className="text-[9px] font-bold text-[#6B6353] uppercase tracking-wider block px-1 mb-1">
                Road & Status Signs
              </span>
              <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                {AVAILABLE_SIGNS.slice(0, 6).map(s => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        onAddSign?.(s.id);
                        setIsInsertMenuOpen(false);
                      }}
                      className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-[#F4EFE4] text-left text-xs font-bold text-[#1D1A16] cursor-pointer"
                    >
                      <Icon size={14} style={{ color: s.color }} />
                      <span className="truncate text-[11px]">{s.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-[#DCD4C2] pt-1.5">
              <span className="text-[9px] font-bold text-[#6B6353] uppercase tracking-wider block px-1 mb-1">
                Tech & Brand Logos
              </span>
              <div className="grid grid-cols-2 gap-1 max-h-28 overflow-y-auto">
                {AVAILABLE_LOGOS.slice(0, 6).map(l => {
                  const Icon = l.icon;
                  return (
                    <button
                      key={l.id}
                      onClick={() => {
                        onAddLogo?.(l.id);
                        setIsInsertMenuOpen(false);
                      }}
                      className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-[#F4EFE4] text-left text-xs font-bold text-[#1D1A16] cursor-pointer"
                    >
                      <Icon size={14} style={{ color: l.color }} />
                      <span className="truncate text-[11px]">{l.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Full Search Catalog Button */}
              {onOpenLogoSearch && (
                <button
                  onClick={() => {
                    onOpenLogoSearch();
                    setIsInsertMenuOpen(false);
                  }}
                  className="w-full mt-2 py-1.5 px-2 rounded-lg bg-[#FFE9A8] hover:bg-[#FFE082] text-[#1D1A16] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#1D1A16]/30 shadow-2xs transition-all cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-[#E24E1B]" />
                  <span>Search All 150+ Logos & Signs</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <span className="w-px h-4 bg-[#DCD4C2] mx-0.5" />

      {/* 3. Smart Arrange */}
      <button
        onClick={onSmartArrange}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#1D1A16] bg-[#FFE9A8] border border-amber-500/50 hover:bg-[#FFE082] transition-all whitespace-nowrap cursor-pointer shadow-xs"
        title="Smart Arrange: Beautiful hierarchical pipeline & tree layout"
      >
        <Workflow className="w-3.5 h-3.5 text-amber-800" />
        <span>Smart Arrange</span>
      </button>

      {/* 4. Layouts Dropdown */}
      <div className="relative group">
        <button
          onClick={onTidyClusters}
          className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold text-[#1D1A16] hover:bg-[#F4EFE4] transition-colors whitespace-nowrap cursor-pointer"
          title="Alternative graph layouts"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-[#6B6353]" />
          <span className="hidden sm:inline text-[11px] text-[#6B6353]">Layouts</span>
        </button>

        {/* Dropdown for alternative layouts */}
        <div className="absolute top-full left-0 mt-2 hidden group-hover:flex flex-col bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-xl p-1 shadow-[4px_4px_0_#1D1A16] min-w-[160px] z-50 animate-note-pop">
          <button
            onClick={onSmartArrange}
            className="text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-[#FFE9A8] text-[#1D1A16] flex items-center gap-1.5 cursor-pointer"
          >
            <Workflow className="w-3 h-3 text-amber-700" />
            <span>Smart Pipeline</span>
          </button>
          <button
            onClick={onTidyForceDirected}
            className="text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-[#DCEBC8] text-[#1D1A16] flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3 h-3 text-emerald-700" />
            <span>Physics Untangle</span>
          </button>
          <button
            onClick={onTidyClusters}
            className="text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-[#F4EFE4] text-[#1D1A16] cursor-pointer"
          >
            Cluster Columns
          </button>
          <button
            onClick={onTidyTimeline}
            className="text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-[#F4EFE4] text-[#1D1A16] cursor-pointer"
          >
            Timeline Sequence
          </button>
          <button
            onClick={onTidyKanban}
            className="text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-[#F4EFE4] text-[#1D1A16] cursor-pointer"
          >
            Kanban Categories
          </button>
        </div>
      </div>

      {/* 5. Templates */}
      <button
        onClick={onOpenTemplates}
        className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold text-[#1D1A16] hover:bg-[#F4EFE4] transition-colors whitespace-nowrap cursor-pointer"
        title="Load pre-built strategy and architecture templates"
      >
        <Layers className="w-3.5 h-3.5 text-[#E24E1B]" />
        <span className="hidden md:inline">Templates</span>
      </button>

      {/* 5b. Diagram-as-Code (DSL) */}
      {onOpenDiagramDsl && (
        <button
          onClick={onOpenDiagramDsl}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#1D1A16] bg-[#F7F4EA] border border-[#1D1A16]/20 hover:bg-[#1D1A16] hover:text-white transition-colors whitespace-nowrap cursor-pointer shadow-sm"
          title="Diagram-as-Code DSL & Mermaid Editor (Ctrl+Shift+D)"
        >
          <Code2 className="w-3.5 h-3.5 text-[#E24E1B]" />
          <span className="hidden lg:inline">Code / DSL</span>
        </button>
      )}

      {/* 6. Graph Health Pill */}
      <button
        onClick={onOpenHealth}
        className="flex items-center gap-1 px-2 py-1 rounded-xl border border-emerald-600/30 bg-emerald-50 text-emerald-900 text-xs font-bold hover:bg-emerald-100 transition-colors whitespace-nowrap cursor-pointer"
        title="View graph coherence score and lint suggestions"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
        <span className="font-mono text-[11px]">{healthScore}%</span>
      </button>

      {/* 7. Fit View */}
      <button
        onClick={onFitView}
        className="p-1.5 rounded-xl text-[#1D1A16] hover:bg-[#F4EFE4] transition-colors cursor-pointer"
        title="Zoom to fit all notes"
      >
        <Maximize className="w-3.5 h-3.5" />
      </button>

      {/* 8. Zoom Controls */}
      <div className="hidden lg:flex items-center bg-[#F4EFE4] border border-[#DCD4C2] rounded-xl px-1 py-0.5">
        <button onClick={onZoomOut} className="p-0.5 text-[#6B6353] hover:text-[#1D1A16] cursor-pointer">
          <ZoomOut className="w-3 h-3" />
        </button>
        <span className="text-[10px] font-mono font-bold px-1 min-w-[34px] text-center">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button onClick={onZoomIn} className="p-0.5 text-[#6B6353] hover:text-[#1D1A16] cursor-pointer">
          <ZoomIn className="w-3 h-3" />
        </button>
      </div>

      {/* 9. Undo */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`p-1.5 rounded-xl transition-colors ${
          canUndo ? 'text-[#1D1A16] hover:bg-[#F4EFE4] cursor-pointer' : 'text-[#6B6353]/40 cursor-not-allowed'
        }`}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="w-3.5 h-3.5" />
      </button>

      <span className="w-px h-4 bg-[#DCD4C2] mx-0.5" />

      {/* 10. Netlify & Share Deploy Button */}
      {onOpenShareDeploy && (
        <button
          onClick={onOpenShareDeploy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00C7B7] text-[#0E1E25] text-xs font-extrabold shadow-[2px_2px_0_#1D1A16] border border-[#1D1A16] hover:bg-[#00b0a2] active:translate-x-[1px] active:translate-y-[1px] transition-all whitespace-nowrap cursor-pointer"
          title="Share canvas link or deploy instantly to Netlify"
        >
          <NetlifyIcon size={14} />
          <span>Deploy & Share</span>
        </button>
      )}

      {/* 11. Export */}
      <button
        onClick={onOpenExport}
        className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold text-[#1D1A16] hover:bg-[#F4EFE4] transition-colors whitespace-nowrap cursor-pointer"
        title="Export to Markdown, Mermaid, Image, or JSON"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Export</span>
      </button>

      {/* 12. Clear Canvas */}
      <button
        onClick={onClearCanvas}
        className="p-1.5 rounded-xl text-[#E24E1B] hover:bg-[#FFD8C7] transition-colors cursor-pointer"
        title="Clear entire canvas"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {/* 13. Help Shortcuts */}
      <button
        onClick={onOpenHelp}
        className="p-1.5 rounded-xl text-[#6B6353] hover:text-[#1D1A16] hover:bg-[#F4EFE4] transition-colors cursor-pointer"
        title="Keyboard shortcuts and WebMCP tips"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      <span className="w-px h-4 bg-[#DCD4C2] mx-0.5" />

      {/* 14. Agent Studio Toggle Button */}
      <button
        onClick={onToggleStudio}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
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
