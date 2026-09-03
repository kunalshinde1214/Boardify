'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CanvasNode, NoteColor, NodeType, TaskItem } from '@/lib/types';
import {
  Sparkles,
  Trash2,
  Edit3,
  CheckSquare,
  Plus,
  ChevronDown,
  Layers,
  Stamp as StampIcon,
  Search,
  Bot,
  Wrench,
  Database,
  Table2,
  Key,
  Diamond,
  Hexagon,
  Circle,
  Network,
  Cloud,
  ShieldCheck,
  Zap,
  Monitor,
  Copy,
  Maximize2,
  Minimize2,
  Type,
  Minus,
  X,
} from 'lucide-react';
import {
  AVAILABLE_LOGOS,
  AVAILABLE_SIGNS,
  AVAILABLE_STAMPS,
  DynamicGilbarbaraIcon,
  resolveBrandOrSignIcon,
} from '@/components/ui/BrandIcons';
import { GILBARBARA_LOGOS } from '@/lib/all-logos-catalog';

const COLOR_MAP: Record<NoteColor, string> = {
  butter: '#FFE9A8',
  sage: '#DCEBC8',
  coral: '#FFD8C7',
  slate: '#DAE5E6',
  lavender: '#E8DEFF',
  mint: '#C7F3E3',
};

const NODE_TYPE_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  agent: { label: 'AGENT', icon: Bot, color: 'bg-indigo-600' },
  tool: { label: 'TOOL', icon: Wrench, color: 'bg-amber-600' },
  database: { label: 'DATABASE', icon: Database, color: 'bg-emerald-700' },
  api: { label: 'API / RPC', icon: Network, color: 'bg-blue-600' },
  cloud: { label: 'CLOUD', icon: Cloud, color: 'bg-cyan-700' },
  auth: { label: 'AUTH', icon: ShieldCheck, color: 'bg-rose-600' },
  trigger: { label: 'TRIGGER', icon: Zap, color: 'bg-purple-600' },
  ui: { label: 'CLIENT UI', icon: Monitor, color: 'bg-slate-700' },
};

const FONT_SIZE_CLASSES: Record<string, { title: string; body: string }> = {
  sm: { title: 'text-lg', body: 'text-xs' },
  md: { title: 'text-2xl', body: 'text-sm' },
  lg: { title: 'text-3xl', body: 'text-base' },
  xl: { title: 'text-4xl', body: 'text-lg' },
  '2xl': { title: 'text-5xl', body: 'text-xl' },
};

export type ResizeDirection = 'se' | 'e' | 's' | 'sw' | 'ne' | 'nw';

interface StickyNoteProps {
  node: CanvasNode;
  isSelected: boolean;
  isHighlighted?: boolean;
  highlightReason?: string;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasNode>) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onStartLink: (e: React.PointerEvent, node: CanvasNode) => void;
  onDragStart: (e: React.PointerEvent, node: CanvasNode) => void;
  onResizeStart?: (e: React.PointerEvent, node: CanvasNode, direction: ResizeDirection) => void;
  onOpenLogoSearch?: (category?: string, targetNodeId?: string) => void;
}

export function StickyNote({
  node,
  isSelected,
  isHighlighted,
  highlightReason,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onStartLink,
  onDragStart,
  onResizeStart,
  onOpenLogoSearch,
}: StickyNoteProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingBody, setIsEditingBody] = useState(false);
  const [titleValue, setTitleValue] = useState(node.title);
  const [bodyValue, setBodyValue] = useState(node.body);
  const [activeMenu, setActiveMenu] = useState<'type' | 'sign' | 'logo' | 'stamp' | 'size' | 'font' | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const bodyInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitleValue(node.title);
    setBodyValue(node.body);
  }, [node.title, node.body]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingBody && bodyInputRef.current) {
      bodyInputRef.current.focus();
      // Auto adjust height
      bodyInputRef.current.style.height = 'auto';
      bodyInputRef.current.style.height = `${bodyInputRef.current.scrollHeight}px`;
    }
  }, [isEditingBody]);

  const commitTitle = () => {
    setIsEditingTitle(false);
    const trimmed = titleValue.trim() || 'Untitled';
    if (trimmed !== node.title) {
      onUpdate(node.id, { title: trimmed });
    }
  };

  const commitBody = () => {
    setIsEditingBody(false);
    if (bodyValue !== node.body) {
      onUpdate(node.id, { body: bodyValue });
    }
  };

  const handleToggleTask = (taskIndex: number) => {
    if (!node.tasks) return;
    const updated = node.tasks.map((t, idx) => (idx === taskIndex ? { ...t, done: !t.done } : t));
    onUpdate(node.id, { tasks: updated });
  };

  const handleUpdateTaskText = (taskIndex: number, text: string) => {
    if (!node.tasks) return;
    const updated = node.tasks.map((t, idx) => (idx === taskIndex ? { ...t, text } : t));
    onUpdate(node.id, { tasks: updated });
  };

  const handleDeleteTask = (taskIndex: number) => {
    if (!node.tasks) return;
    const updated = node.tasks.filter((_, idx) => idx !== taskIndex);
    onUpdate(node.id, { tasks: updated });
  };

  const handleAddTask = () => {
    const current = node.tasks || [];
    const newTask: TaskItem = {
      id: `t_${Date.now().toString(36)}`,
      text: 'New checklist item',
      done: false,
    };
    onUpdate(node.id, { tasks: [...current, newTask], nodeType: 'task' });
  };

  const bgHex = COLOR_MAP[node.color] || COLOR_MAP.butter;
  const rotation = node.rot || 0;
  const fontStyle = FONT_SIZE_CLASSES[node.fontSize || 'md'] || FONT_SIZE_CLASSES.md;

  // Resolve matching Sign or Logo metadata
  const currentSign = AVAILABLE_SIGNS.find(s => s.id === node.signType);
  const currentLogo = AVAILABLE_LOGOS.find(
    l => l.id.toLowerCase() === (node.logoType || '').toLowerCase()
  );
  const cleanGilId = (node.logoType || '').replace(/^gil-/, '').toLowerCase();
  const currentGilLogo = GILBARBARA_LOGOS.find(
    g => g.id.toLowerCase() === cleanGilId || `gil-${g.id.toLowerCase()}` === (node.logoType || '').toLowerCase()
  );
  const fallbackIcon = resolveBrandOrSignIcon(node.logoType || node.title);

  // 1. RENDER HEADING / BANNER
  if (node.nodeType === 'heading') {
    const headingWidth = Math.max(240, node.width || 340);
    return (
      <div
        data-node-id={node.id}
        style={{
          transform: `translate(${node.x}px, ${node.y}px) rotate(${rotation}deg)`,
          width: `${headingWidth}px`,
        }}
        onPointerDown={e => {
          if ((e.target as HTMLElement).closest('.ignore-drag')) return;
          onSelect(node.id);
          onDragStart(e, node);
        }}
        className={`absolute select-none cursor-grab active:cursor-grabbing p-3 rounded-xl transition-all group ${
          isSelected
            ? 'ring-2 ring-[#1D1A16] ring-offset-2 z-20 bg-[#FFFDF6]/95 border-2 border-[#1D1A16] shadow-[4px_4px_0_#1D1A16]'
            : 'hover:bg-[#FFFDF6]/50 z-10'
        } ${isHighlighted ? 'ring-4 ring-[#E24E1B] animate-bounce z-30' : ''}`}
      >
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            value={titleValue}
            onChange={e => setTitleValue(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={e => {
              if (e.key === 'Enter') commitTitle();
              if (e.key === 'Escape') setIsEditingTitle(false);
            }}
            className="ignore-drag font-['Fraunces'] italic font-black text-3xl text-[#1D1A16] leading-tight w-full bg-transparent outline-none border-b-2 border-[#1D1A16]"
          />
        ) : (
          <h2
            onDoubleClick={e => {
              e.stopPropagation();
              setIsEditingTitle(true);
            }}
            className="font-['Fraunces'] italic font-black text-3xl text-[#1D1A16] tracking-tight leading-none cursor-text break-words"
          >
            {node.title}
          </h2>
        )}

        {node.body && (
          <p
            onDoubleClick={e => {
              e.stopPropagation();
              setIsEditingBody(true);
            }}
            className="text-xs font-bold text-[#6B6353] mt-1 cursor-text"
          >
            {node.body}
          </p>
        )}

        {/* Resize Handles */}
        {isSelected && onResizeStart && (
          <ResizeHandles
            node={node}
            onResizeStart={onResizeStart}
            width={headingWidth}
          />
        )}

        {/* Selection Toolbar */}
        {isSelected && (
          <SelectionActionToolbar
            node={node}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onStartEditBody={() => setIsEditingBody(true)}
            onOpenLogoSearch={onOpenLogoSearch}
          />
        )}
      </div>
    );
  }

  // 1.5 RENDER ER DIAGRAM ENTITY TABLE NODE
  if (node.nodeType === 'entity' || node.nodeType === 'table') {
    const tableWidth = Math.max(220, node.width || 260);
    const fields = node.fields || [
      { id: 'f1', name: 'id', type: 'UUID', isPrimaryKey: true },
      { id: 'f2', name: 'created_at', type: 'TIMESTAMP' },
    ];

    const handleTogglePrimaryKey = (fieldId: string) => {
      const updated = fields.map(f =>
        f.id === fieldId ? { ...f, isPrimaryKey: !f.isPrimaryKey, isForeignKey: false } : f
      );
      onUpdate(node.id, { fields: updated });
    };

    const handleToggleForeignKey = (fieldId: string) => {
      const updated = fields.map(f =>
        f.id === fieldId ? { ...f, isForeignKey: !f.isForeignKey, isPrimaryKey: false } : f
      );
      onUpdate(node.id, { fields: updated });
    };

    const handleUpdateFieldName = (fieldId: string, name: string) => {
      const updated = fields.map(f => (f.id === fieldId ? { ...f, name } : f));
      onUpdate(node.id, { fields: updated });
    };

    const handleCycleFieldType = (fieldId: string) => {
      const types = ['UUID', 'VARCHAR(255)', 'INT', 'BIGINT', 'BOOLEAN', 'TIMESTAMP', 'JSONB', 'DECIMAL(10,2)', 'TEXT'];
      const current = fields.find(f => f.id === fieldId)?.type || 'VARCHAR';
      const nextIdx = (types.findIndex(t => t.startsWith(current.split('(')[0])) + 1) % types.length;
      const updated = fields.map(f => (f.id === fieldId ? { ...f, type: types[nextIdx] } : f));
      onUpdate(node.id, { fields: updated });
    };

    const handleAddField = () => {
      const newField = {
        id: `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
        name: `column_${fields.length + 1}`,
        type: 'VARCHAR(255)',
      };
      onUpdate(node.id, { fields: [...fields, newField] });
    };

    const handleDeleteField = (fieldId: string) => {
      onUpdate(node.id, { fields: fields.filter(f => f.id !== fieldId) });
    };

    return (
      <div
        data-node-id={node.id}
        style={{
          transform: `translate(${node.x}px, ${node.y}px) rotate(${rotation}deg)`,
          width: `${tableWidth}px`,
          backgroundColor: '#FFFDF6',
        }}
        onPointerDown={e => {
          if ((e.target as HTMLElement).closest('.ignore-drag')) return;
          onSelect(node.id);
          onDragStart(e, node);
        }}
        className={`absolute select-none cursor-grab active:cursor-grabbing rounded-xl overflow-hidden border-2 border-[#1D1A16] shadow-[4px_4px_0_#1D1A16] transition-all group ${
          isSelected ? 'ring-2 ring-[#E24E1B] ring-offset-2 z-20 shadow-[6px_6px_0_#E24E1B]' : 'z-10'
        } ${isHighlighted ? 'ring-4 ring-[#E24E1B] animate-bounce z-30' : ''}`}
      >
        {/* Table Header */}
        <div
          className="px-3.5 py-2.5 border-b-2 border-[#1D1A16] flex items-center justify-between gap-2"
          style={{ backgroundColor: bgHex }}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <Table2 className="w-4 h-4 text-[#1D1A16] shrink-0" />
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                value={titleValue}
                onChange={e => setTitleValue(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitTitle();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
                className="ignore-drag font-mono font-bold text-sm text-[#1D1A16] bg-transparent outline-none border-b border-[#1D1A16] w-full"
              />
            ) : (
              <span
                onDoubleClick={e => {
                  e.stopPropagation();
                  setIsEditingTitle(true);
                }}
                className="font-mono font-extrabold text-sm text-[#1D1A16] truncate cursor-text"
                title="Double click to rename table"
              >
                {node.title || 'entity_table'}
              </span>
            )}
          </div>
          <span className="text-[9px] font-mono font-bold bg-[#1D1A16] text-[#FFFDF6] px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
            TABLE
          </span>
        </div>

        {/* Optional Table Description */}
        {node.body && (
          <div className="px-3 py-1.5 bg-[#F4EFE4]/60 border-b border-[#DCD4C2] text-[10px] text-[#6B6353] font-['Space_Grotesk'] leading-tight">
            {node.body}
          </div>
        )}

        {/* Columns Table */}
        <div className="divide-y divide-[#DCD4C2]/60 font-mono text-xs">
          {fields.map((f, idx) => (
            <div
              key={f.id || idx}
              className="flex items-center justify-between px-3 py-1.5 hover:bg-[#F4EFE4]/80 group/row transition-colors"
            >
              {/* Key Badge (PK / FK / None) */}
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    if (f.isPrimaryKey) handleToggleForeignKey(f.id);
                    else if (f.isForeignKey) handleToggleForeignKey(f.id);
                    else handleTogglePrimaryKey(f.id);
                  }}
                  title="Click to cycle PK -> FK -> None"
                  className={`px-1 py-0.5 rounded text-[9px] font-black tracking-wider cursor-pointer transition-all ${
                    f.isPrimaryKey
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : f.isForeignKey
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-transparent text-transparent group-hover/row:text-[#6B6353] hover:bg-[#DCD4C2]'
                  }`}
                >
                  {f.isPrimaryKey ? 'PK' : f.isForeignKey ? 'FK' : '·'}
                </button>

                {/* Field Name */}
                <input
                  defaultValue={f.name}
                  onBlur={e => handleUpdateFieldName(f.id, e.target.value)}
                  className="ignore-drag bg-transparent font-mono text-xs text-[#1D1A16] font-semibold outline-none w-full min-w-0 focus:bg-white focus:ring-1 focus:ring-[#1D1A16] rounded px-1 -mx-1"
                />
              </div>

              {/* Data Type & Delete */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleCycleFieldType(f.id);
                  }}
                  title="Click to cycle data types"
                  className="text-[10px] text-[#6B6353] bg-[#F4EFE4] px-1.5 py-0.5 rounded border border-[#DCD4C2] hover:border-[#1D1A16] hover:text-[#1D1A16] cursor-pointer"
                >
                  {f.type || 'VARCHAR'}
                </button>

                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleDeleteField(f.id);
                  }}
                  title="Remove column"
                  className="opacity-0 group-hover/row:opacity-100 p-0.5 text-[#6B6353] hover:text-[#E24E1B] transition-opacity cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Field Button */}
        <div className="p-1.5 bg-[#F4EFE4]/40 border-t border-[#DCD4C2]">
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              handleAddField();
            }}
            className="w-full py-1 text-[10px] font-mono font-bold text-[#6B6353] hover:text-[#1D1A16] hover:bg-[#FFFDF6] border border-dashed border-[#DCD4C2] hover:border-[#1D1A16] rounded-md flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add Column</span>
          </button>
        </div>

        {/* Connection Port */}
        <div
          title="Drag to connect"
          onPointerDown={e => {
            e.stopPropagation();
            onStartLink(e, node);
          }}
          className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#FFFDF6] border-2 border-[#1D1A16] hover:bg-[#E24E1B] cursor-crosshair transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-sm z-30"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#1D1A16] pointer-events-none" />
        </div>

        {/* Resize Handles */}
        {isSelected && onResizeStart && (
          <ResizeHandles
            node={node}
            onResizeStart={onResizeStart}
            width={tableWidth}
          />
        )}

        {/* Selection Toolbar */}
        {isSelected && (
          <SelectionActionToolbar
            node={node}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onStartEditBody={() => setIsEditingBody(true)}
            onOpenLogoSearch={onOpenLogoSearch}
          />
        )}
      </div>
    );
  }

  // 1.8 RENDER GEOMETRIC SHAPE NODES (Diamond, Cylinder, Hexagon, Circle, Cloud, Rectangle)
  const isShape =
    node.nodeType === 'shape' ||
    node.nodeType === 'shape_diamond' ||
    node.nodeType === 'shape_cylinder' ||
    node.nodeType === 'shape_hexagon' ||
    node.nodeType === 'shape_circle' ||
    node.nodeType === 'shape_cloud' ||
    node.nodeType === 'shape_rectangle';

  if (isShape) {
    const rawShape = node.shapeType || (node.nodeType?.startsWith('shape_') ? node.nodeType.replace('shape_', '') : 'rectangle');
    const shapeType = rawShape.toLowerCase();
    const shapeWidth = Math.max(130, node.width || (shapeType === 'diamond' ? 180 : 200));
    const shapeHeight = Math.max(90, node.height || (shapeType === 'diamond' ? 140 : 130));

    return (
      <div
        data-node-id={node.id}
        style={{
          transform: `translate(${node.x}px, ${node.y}px) rotate(${rotation}deg)`,
          width: `${shapeWidth}px`,
          height: `${shapeHeight}px`,
        }}
        onPointerDown={e => {
          if ((e.target as HTMLElement).closest('.ignore-drag')) return;
          onSelect(node.id);
          onDragStart(e, node);
        }}
        className={`absolute select-none cursor-grab active:cursor-grabbing flex flex-col items-center justify-center p-3 transition-all group ${
          isSelected ? 'z-20' : 'z-10'
        } ${isHighlighted ? 'animate-bounce z-30' : ''}`}
      >
        {/* Background Visual Shape */}
        <div
          style={{ backgroundColor: bgHex }}
          className={`absolute inset-0 border-2 border-[#1D1A16] shadow-[4px_4px_0_#1D1A16] transition-all ${
            shapeType === 'circle'
              ? 'rounded-full'
              : shapeType === 'cylinder'
              ? 'rounded-2xl border-t-8'
              : shapeType === 'diamond'
              ? 'rotate-45 scale-75 rounded-xl'
              : shapeType === 'hexagon'
              ? 'rounded-xl [clip-path:polygon(20%_0%,80%_0%,100%_50%,80%_100%,20%_100%,0%_50%)]'
              : shapeType === 'cloud'
              ? 'rounded-3xl border-dashed'
              : 'rounded-xl'
          } ${isSelected ? 'ring-2 ring-[#E24E1B] ring-offset-2' : ''}`}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-3 w-full">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={e => {
                if (e.key === 'Enter') commitTitle();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              className="ignore-drag font-['Space_Grotesk'] font-bold text-sm text-[#1D1A16] text-center w-full bg-transparent outline-none border-b border-[#1D1A16]"
            />
          ) : (
            <h4
              onDoubleClick={e => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
              className="font-['Space_Grotesk'] font-bold text-sm text-[#1D1A16] leading-tight break-words cursor-text"
            >
              {node.title}
            </h4>
          )}

          {node.body && (
            <p
              onDoubleClick={e => {
                e.stopPropagation();
                setIsEditingBody(true);
              }}
              className="text-[11px] text-[#403A2F] mt-1 leading-snug line-clamp-2 cursor-text font-['Space_Grotesk']"
            >
              {node.body}
            </p>
          )}
        </div>

        {/* Connection Port */}
        <div
          title="Drag to connect"
          onPointerDown={e => {
            e.stopPropagation();
            onStartLink(e, node);
          }}
          className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FFFDF6] border-2 border-[#1D1A16] hover:bg-[#E24E1B] cursor-crosshair transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-sm z-30"
        >
          <span className="w-1 h-1 rounded-full bg-[#1D1A16] pointer-events-none" />
        </div>

        {/* Resize Handles */}
        {isSelected && onResizeStart && (
          <ResizeHandles
            node={node}
            onResizeStart={onResizeStart}
            width={shapeWidth}
          />
        )}

        {/* Selection Toolbar */}
        {isSelected && (
          <SelectionActionToolbar
            node={node}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onStartEditBody={() => setIsEditingBody(true)}
            onOpenLogoSearch={onOpenLogoSearch}
          />
        )}
      </div>
    );
  }

  // 2. RENDER SIGN / STICKER NODE
  if (node.nodeType === 'sign' || currentSign) {
    const SignIcon = currentSign?.icon || fallbackIcon || AVAILABLE_SIGNS[0].icon;
    const signColor = currentSign?.color || '#E24E1B';
    const signWidth = Math.max(160, node.width || 240);

    return (
      <div
        data-node-id={node.id}
        style={{
          transform: `translate(${node.x}px, ${node.y}px) rotate(${rotation}deg)`,
          width: `${signWidth}px`,
          backgroundColor: '#FFFDF6',
        }}
        onPointerDown={e => {
          if ((e.target as HTMLElement).closest('.ignore-drag')) return;
          onSelect(node.id);
          onDragStart(e, node);
        }}
        className={`absolute select-none cursor-grab active:cursor-grabbing rounded-2xl p-4 border-2 border-[#1D1A16] shadow-[4px_4px_0_#1D1A16] transition-all group ${
          isSelected ? 'ring-2 ring-[#1D1A16] ring-offset-2 z-20 shadow-[6px_6px_0_#1D1A16]' : 'z-10'
        } ${isHighlighted ? 'ring-4 ring-[#E24E1B] animate-bounce z-30' : ''}`}
      >
        {/* Top Sign Header Badge */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="p-1.5 rounded-xl border border-[#1D1A16] shadow-xs text-[#1D1A16]"
            style={{ backgroundColor: `${signColor}25` }}
          >
            <SignIcon size={18} className="shrink-0" style={{ color: signColor }} />
          </div>
          <span
            className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded text-white shadow-xs truncate"
            style={{ backgroundColor: signColor }}
          >
            {currentSign?.name || 'SIGN / STICKER'}
          </span>
        </div>

        {/* Title */}
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            value={titleValue}
            onChange={e => setTitleValue(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={e => {
              if (e.key === 'Enter') commitTitle();
              if (e.key === 'Escape') setIsEditingTitle(false);
            }}
            className="ignore-drag font-['Space_Grotesk'] font-bold text-base text-[#1D1A16] leading-snug w-full bg-transparent outline-none border-b border-[#1D1A16]"
          />
        ) : (
          <h3
            onDoubleClick={e => {
              e.stopPropagation();
              setIsEditingTitle(true);
            }}
            className="font-['Space_Grotesk'] font-bold text-base text-[#1D1A16] leading-snug break-words cursor-text"
          >
            {node.title}
          </h3>
        )}

        {/* Body */}
        {isEditingBody ? (
          <textarea
            ref={bodyInputRef}
            value={bodyValue}
            onChange={e => {
              setBodyValue(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onBlur={commitBody}
            rows={2}
            className="ignore-drag font-['Space_Grotesk'] text-xs text-[#403A2F] leading-snug w-full bg-transparent outline-none border border-[#1D1A16]/30 rounded p-1 mt-1.5 resize-none"
          />
        ) : (
          <p
            onDoubleClick={e => {
              e.stopPropagation();
              setIsEditingBody(true);
            }}
            className="font-['Space_Grotesk'] text-xs text-[#403A2F] leading-relaxed mt-1 cursor-text"
          >
            {node.body || <span className="opacity-40 italic">Double-click to add sign notes...</span>}
          </p>
        )}

        {/* Connect Link Port */}
        <div
          title="Drag to connect"
          onPointerDown={e => {
            e.stopPropagation();
            onStartLink(e, node);
          }}
          className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#FFFDF6] border-2 border-[#1D1A16] hover:bg-[#E24E1B] cursor-crosshair transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-sm z-30"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#1D1A16] pointer-events-none" />
        </div>

        {/* Resize Handles */}
        {isSelected && onResizeStart && (
          <ResizeHandles
            node={node}
            onResizeStart={onResizeStart}
            width={signWidth}
          />
        )}

        {/* Selection Toolbar */}
        {isSelected && (
          <SelectionActionToolbar
            node={node}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onStartEditBody={() => setIsEditingBody(true)}
            onOpenLogoSearch={onOpenLogoSearch}
          />
        )}
      </div>
    );
  }

  // 3. RENDER TECH & BRAND LOGO NODE
  if (node.nodeType === 'logo' || currentLogo || currentGilLogo || node.logoType) {
    const LogoIcon = currentLogo?.icon || fallbackIcon || AVAILABLE_LOGOS[0].icon;
    const logoColor = currentLogo?.color || '#00C7B7';
    const logoTileSize = Math.max(56, Math.min(128, (node.width || 120) * 0.55));

    return (
      <div
        data-node-id={node.id}
        style={{
          transform: `translate(${node.x}px, ${node.y}px) rotate(${rotation}deg)`,
          width: `${Math.max(90, node.width || 120)}px`,
        }}
        onPointerDown={e => {
          if ((e.target as HTMLElement).closest('.ignore-drag')) return;
          onSelect(node.id);
          onDragStart(e, node);
        }}
        className={`absolute select-none cursor-grab active:cursor-grabbing flex flex-col items-center group ${
          isSelected ? 'z-20' : 'z-10'
        } ${isHighlighted ? 'animate-bounce z-30' : ''}`}
      >
        {/* Standalone Vector Logo Tile */}
        <div
          style={{ width: `${logoTileSize}px`, height: `${logoTileSize}px`, color: logoColor }}
          className={`rounded-2xl flex items-center justify-center bg-[#FFFDF6] border-2 border-[#1D1A16] shadow-[3px_3px_0_#1D1A16] hover:shadow-[4px_4px_0_#1D1A16] hover:-translate-y-0.5 transition-all relative ${
            isSelected ? 'ring-2 ring-[#E24E1B] ring-offset-2 shadow-[4px_4px_0_#E24E1B]' : ''
          }`}
        >
          {currentGilLogo && currentGilLogo.file ? (
            <DynamicGilbarbaraIcon file={currentGilLogo.file} size={Math.round(logoTileSize * 0.55)} />
          ) : (
            <LogoIcon size={Math.round(logoTileSize * 0.52)} />
          )}

          {/* Connection Port */}
          <div
            title="Drag to connect"
            onPointerDown={e => {
              e.stopPropagation();
              onStartLink(e, node);
            }}
            className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FFFDF6] border-2 border-[#1D1A16] hover:bg-[#E24E1B] hover:border-[#E24E1B] cursor-crosshair transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-xs z-30"
          >
            <span className="w-1 h-1 rounded-full bg-[#1D1A16] pointer-events-none" />
          </div>
        </div>

        {/* Crisp Label Underneath (Editable on Double Click) */}
        <div className="mt-1.5 text-center w-full px-1">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={e => {
                if (e.key === 'Enter') commitTitle();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              className="ignore-drag font-['Space_Grotesk'] font-bold text-xs text-[#1D1A16] text-center w-full bg-[#FFFDF6] border border-[#1D1A16] rounded px-1 py-0.5 outline-none shadow-xs"
            />
          ) : (
            <span
              onDoubleClick={e => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
              className="font-['Space_Grotesk'] font-bold text-xs text-[#1D1A16] leading-tight block break-words cursor-text px-1.5 py-0.5 rounded hover:bg-[#1D1A16]/5 transition-colors"
            >
              {node.title || currentLogo?.name || currentGilLogo?.name || 'Tech Logo'}
            </span>
          )}
        </div>

        {/* Resize Handles */}
        {isSelected && onResizeStart && (
          <ResizeHandles
            node={node}
            onResizeStart={onResizeStart}
            width={Math.max(90, node.width || 120)}
          />
        )}

        {/* Selection Toolbar */}
        {isSelected && (
          <SelectionActionToolbar
            node={node}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onStartEditBody={() => setIsEditingTitle(true)}
            onOpenLogoSearch={onOpenLogoSearch}
          />
        )}
      </div>
    );
  }

  // 4. RENDER STANDARD STICKY NOTE & TASK LIST NOTE
  const hasTasks = node.nodeType === 'task' || (node.tasks && node.tasks.length > 0);
  const noteWidth = Math.max(160, node.width || 240);

  return (
    <div
      data-node-id={node.id}
      style={{
        transform: `translate(${node.x}px, ${node.y}px) rotate(${rotation}deg)`,
        width: `${noteWidth}px`,
        backgroundColor: bgHex,
        ...(node.height ? { minHeight: `${node.height}px` } : {}),
      }}
      onPointerDown={e => {
        if ((e.target as HTMLElement).closest('.ignore-drag')) return;
        onSelect(node.id);
        onDragStart(e, node);
      }}
      className={`absolute select-none cursor-grab active:cursor-grabbing rounded-md p-4 pt-4 pb-3.5 border border-[#1D1A16]/20 shadow-[3px_4px_0_rgba(29,26,22,0.12)] transition-shadow group ${
        isSelected ? 'ring-2 ring-[#1D1A16] ring-offset-2 z-20 shadow-[4px_6px_0_rgba(29,26,22,0.2)]' : 'z-10'
      } ${isHighlighted ? 'z-30 ring-4 ring-[#E24E1B] ring-offset-2 animate-bounce' : ''}`}
    >
      {/* Sticky Tape Decorator */}
      <div className="sticky-tape pointer-events-none" />

      {/* Rubber Stamp Badge if set */}
      {node.stamp && (
        <div className="absolute -top-3.5 -right-2 z-20 pointer-events-none rotate-6">
          <div
            className={`border-2 border-dashed px-2 py-0.5 rounded font-black text-[10px] tracking-widest uppercase shadow-xs ${
              AVAILABLE_STAMPS.find(s => s.id === node.stamp)?.color || 'border-[#E24E1B] text-[#E24E1B] bg-white'
            }`}
          >
            {node.stamp}
          </div>
        </div>
      )}

      {/* Author & Node Type Chip Container */}
      <div className="absolute -top-2.5 left-3 flex items-center gap-1.5 z-10">
        <div
          className={`flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded shadow-sm ${
            node.author === 'agent'
              ? 'bg-[#E24E1B] text-white'
              : 'bg-[#1D1A16] text-[#F4EFE4]'
          }`}
        >
          {node.author === 'agent' ? (
            <>
              <Sparkles className="w-2.5 h-2.5" />
              <span>AGENT</span>
            </>
          ) : (
            <span>YOU</span>
          )}
        </div>

        {/* Specialized Tool / Node Type Badge if available */}
        {node.nodeType && node.nodeType !== 'default' && NODE_TYPE_CONFIG[node.nodeType] && (
          <div
            className={`flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded text-white shadow-xs ${
              NODE_TYPE_CONFIG[node.nodeType].color
            }`}
          >
            {React.createElement(NODE_TYPE_CONFIG[node.nodeType].icon, { className: 'w-2.5 h-2.5' })}
            <span>{NODE_TYPE_CONFIG[node.nodeType].label}</span>
          </div>
        )}
      </div>

      {/* Highlight Callout Flag */}
      {highlightReason && (
        <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-[#E24E1B] text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-[2px_2px_0_#1D1A16] whitespace-nowrap animate-note-pop flex items-center gap-1 z-40 pointer-events-none">
          <Sparkles className="w-3 h-3" />
          <span>{highlightReason}</span>
        </div>
      )}

      {/* Title */}
      {isEditingTitle ? (
        <input
          ref={titleInputRef}
          value={titleValue}
          onChange={e => setTitleValue(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={e => {
            if (e.key === 'Enter') commitTitle();
            if (e.key === 'Escape') {
              setTitleValue(node.title);
              setIsEditingTitle(false);
            }
          }}
          className={`ignore-drag font-['Caveat'] font-bold ${fontStyle.title} text-[#1D1A16] leading-tight w-full bg-transparent outline-none border-b border-[#1D1A16]/30 px-1`}
        />
      ) : (
        <h3
          onDoubleClick={e => {
            e.stopPropagation();
            setIsEditingTitle(true);
          }}
          className={`font-['Caveat'] font-bold ${fontStyle.title} text-[#1D1A16] leading-tight break-words min-h-[28px] cursor-text`}
        >
          {node.title}
        </h3>
      )}

      {/* Body Content */}
      {isEditingBody ? (
        <textarea
          ref={bodyInputRef}
          value={bodyValue}
          onChange={e => {
            setBodyValue(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onBlur={commitBody}
          rows={3}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              setBodyValue(node.body);
              setIsEditingBody(false);
            }
          }}
          className={`ignore-drag font-['Kalam'] ${fontStyle.body} text-[#403A2F] leading-snug w-full bg-transparent outline-none border border-[#1D1A16]/30 rounded p-1 mt-1 resize-none`}
        />
      ) : (
        <div
          onDoubleClick={e => {
            e.stopPropagation();
            setIsEditingBody(true);
          }}
          className={`font-['Kalam'] ${fontStyle.body} text-[#403A2F] leading-snug break-words whitespace-pre-wrap mt-1.5 min-h-[20px] cursor-text`}
        >
          {node.body || <span className="opacity-40 italic">Double-click to write details...</span>}
        </div>
      )}

      {/* Tasks / Checklist Section */}
      {hasTasks && (
        <div className="ignore-drag mt-2 pt-2 border-t border-[#1D1A16]/15 space-y-1.5">
          {(node.tasks || []).map((t, idx) => (
            <div key={t.id || idx} className="flex items-center gap-1.5 group/task text-xs font-['Space_Grotesk']">
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => handleToggleTask(idx)}
                className="rounded text-[#E24E1B] focus:ring-0 cursor-pointer w-3.5 h-3.5 shrink-0"
              />
              <input
                type="text"
                value={t.text}
                onChange={e => handleUpdateTaskText(idx, e.target.value)}
                className={`w-full bg-transparent outline-none border-b border-transparent focus:border-[#1D1A16]/30 px-0.5 ${
                  t.done ? 'line-through opacity-50' : 'text-[#1D1A16]'
                }`}
              />
              <button
                onClick={() => handleDeleteTask(idx)}
                className="opacity-0 group-hover/task:opacity-100 text-[#E24E1B] p-0.5 hover:bg-[#E24E1B]/10 rounded cursor-pointer transition-opacity"
                title="Remove task"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
          <button
            onClick={handleAddTask}
            className="text-[10px] font-bold text-[#E24E1B] hover:underline flex items-center gap-1 mt-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Checklist Item</span>
          </button>
        </div>
      )}

      {/* Connection Port on Right Side for Drag-to-Link */}
      <div
        title="Drag from here to connect to another note"
        onPointerDown={e => {
          e.stopPropagation();
          onStartLink(e, node);
        }}
        className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#FFFDF6] border-2 border-[#1D1A16] hover:bg-[#E24E1B] hover:border-[#E24E1B] cursor-crosshair transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-sm z-30"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#1D1A16] pointer-events-none" />
      </div>

      {/* Resize Handles */}
      {isSelected && onResizeStart && (
        <ResizeHandles
          node={node}
          onResizeStart={onResizeStart}
          width={noteWidth}
          height={node.height}
        />
      )}

      {/* Action Toolbar on Select */}
      {isSelected && (
        <SelectionActionToolbar
          node={node}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onStartEditBody={() => setIsEditingBody(true)}
          onAddTask={handleAddTask}
          onOpenLogoSearch={onOpenLogoSearch}
        />
      )}
    </div>
  );
}

// =========================================================================
// RESIZE HANDLES COMPONENT
// =========================================================================

interface ResizeHandlesProps {
  node: CanvasNode;
  onResizeStart: (e: React.PointerEvent, node: CanvasNode, direction: ResizeDirection) => void;
  width: number;
  height?: number;
}

function ResizeHandles({ node, onResizeStart, width, height }: ResizeHandlesProps) {
  const handles: Array<{ dir: ResizeDirection; className: string; cursor: string }> = [
    { dir: 'se', className: '-bottom-1.5 -right-1.5', cursor: 'cursor-se-resize' },
    { dir: 'sw', className: '-bottom-1.5 -left-1.5', cursor: 'cursor-sw-resize' },
    { dir: 'ne', className: '-top-1.5 -right-1.5', cursor: 'cursor-ne-resize' },
    { dir: 'nw', className: '-top-1.5 -left-1.5', cursor: 'cursor-nw-resize' },
    { dir: 'e', className: 'top-1/2 -translate-y-1/2 -right-1.5 h-4 w-2', cursor: 'cursor-e-resize' },
    { dir: 's', className: 'left-1/2 -translate-x-1/2 -bottom-1.5 w-4 h-2', cursor: 'cursor-s-resize' },
  ];

  return (
    <div className="ignore-drag pointer-events-auto">
      {handles.map(h => (
        <div
          key={h.dir}
          onPointerDown={e => {
            e.stopPropagation();
            e.preventDefault();
            onResizeStart(e, node, h.dir);
          }}
          className={`absolute ${h.className} ${h.cursor} bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-xs shadow-xs hover:bg-[#E24E1B] hover:scale-125 transition-transform z-30 ${
            h.dir === 'e' || h.dir === 's' ? 'rounded-full bg-[#1D1A16]' : 'w-3 h-3'
          }`}
          title={`Drag to resize (${h.dir.toUpperCase()})`}
        />
      ))}

      {/* Live Dimension Indicator Tag */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[#1D1A16] text-[#FFFDF6] text-[9px] font-mono font-bold whitespace-nowrap shadow-xs pointer-events-none opacity-80 group-hover:opacity-100 z-30">
        {Math.round(width)}px {height ? `× ${Math.round(height)}px` : ''}
      </div>
    </div>
  );
}

// =========================================================================
// SELECTION ACTION TOOLBAR & POPOVER CUSTOMIZERS
// =========================================================================

interface SelectionActionToolbarProps {
  node: CanvasNode;
  activeMenu: 'type' | 'sign' | 'logo' | 'stamp' | 'size' | 'font' | null;
  setActiveMenu: (menu: 'type' | 'sign' | 'logo' | 'stamp' | 'size' | 'font' | null) => void;
  onUpdate: (id: string, updates: Partial<CanvasNode>) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onStartEditBody: () => void;
  onAddTask?: () => void;
  onOpenLogoSearch?: (category?: string, targetNodeId?: string) => void;
}

function SelectionActionToolbar({
  node,
  activeMenu,
  setActiveMenu,
  onUpdate,
  onDelete,
  onDuplicate,
  onStartEditBody,
  onAddTask,
  onOpenLogoSearch,
}: SelectionActionToolbarProps) {
  const currentWidth = node.width || 240;

  const handleAdjustWidth = (delta: number) => {
    const next = Math.max(140, Math.min(800, currentWidth + delta));
    onUpdate(node.id, { width: next });
  };

  const handleSetPresetWidth = (presetWidth: number) => {
    onUpdate(node.id, { width: presetWidth });
  };

  return (
    <div className="ignore-drag absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#FFFDF6] border-2 border-[#1D1A16] px-2 py-1 rounded-xl shadow-[4px_4px_0_#1D1A16] z-40 whitespace-nowrap animate-note-pop">
      {/* Color Dots */}
      <div className="flex items-center gap-1 pr-1 border-r border-[#DCD4C2]">
        {(['butter', 'sage', 'coral', 'slate', 'lavender', 'mint'] as NoteColor[]).map(c => (
          <button
            key={c}
            onClick={e => {
              e.stopPropagation();
              onUpdate(node.id, { color: c });
            }}
            style={{ backgroundColor: COLOR_MAP[c] }}
            className={`w-3.5 h-3.5 rounded-full border border-[#1D1A16]/50 hover:scale-125 transition-transform cursor-pointer ${
              node.color === c ? 'ring-2 ring-[#1D1A16] scale-110' : ''
            }`}
            title={c}
          />
        ))}
      </div>

      {/* Quick Size Steppers & Presets */}
      <div className="flex items-center gap-0.5 px-1 border-r border-[#DCD4C2]">
        <button
          onClick={e => {
            e.stopPropagation();
            handleAdjustWidth(-30);
          }}
          className="p-1 hover:bg-[#F4EFE4] rounded text-[#1D1A16] cursor-pointer"
          title="Decrease Size (-30px)"
        >
          <Minus className="w-3 h-3" />
        </button>

        {/* Size Presets Pill */}
        <div className="relative">
          <button
            onClick={e => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'size' ? null : 'size');
            }}
            className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-[#1D1A16] hover:bg-[#F4EFE4] flex items-center gap-0.5 cursor-pointer"
            title="Choose Size Preset"
          >
            <span>{currentWidth}px</span>
            <ChevronDown className="w-2.5 h-2.5" />
          </button>

          {activeMenu === 'size' && (
            <div
              className="absolute top-full left-0 mt-1 bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-xl p-1 shadow-[4px_4px_0_#1D1A16] min-w-[110px] z-50 flex flex-col gap-0.5"
              onMouseLeave={() => setActiveMenu(null)}
            >
              {[
                { label: 'Small (180px)', w: 180 },
                { label: 'Medium (240px)', w: 240 },
                { label: 'Large (340px)', w: 340 },
                { label: 'X-Large (480px)', w: 480 },
              ].map(p => (
                <button
                  key={p.w}
                  onClick={e => {
                    e.stopPropagation();
                    handleSetPresetWidth(p.w);
                    setActiveMenu(null);
                  }}
                  className={`text-left px-2 py-1 text-[11px] font-semibold rounded-lg hover:bg-[#FFE9A8] text-[#1D1A16] cursor-pointer ${
                    Math.abs(currentWidth - p.w) < 20 ? 'bg-[#FFE9A8] font-bold' : ''
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={e => {
            e.stopPropagation();
            handleAdjustWidth(30);
          }}
          className="p-1 hover:bg-[#F4EFE4] rounded text-[#1D1A16] cursor-pointer"
          title="Increase Size (+30px)"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Font Size Selector */}
      <div className="relative border-r border-[#DCD4C2] pr-1">
        <button
          onClick={e => {
            e.stopPropagation();
            setActiveMenu(activeMenu === 'font' ? null : 'font');
          }}
          className="p-1 hover:bg-[#F4EFE4] rounded text-[#1D1A16] flex items-center gap-0.5 cursor-pointer"
          title="Adjust Font Size"
        >
          <Type className="w-3 h-3 text-[#E24E1B]" />
          <span className="text-[10px] font-mono font-bold uppercase">{node.fontSize || 'md'}</span>
        </button>

        {activeMenu === 'font' && (
          <div
            className="absolute top-full left-0 mt-1 bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-xl p-1 shadow-[4px_4px_0_#1D1A16] min-w-[90px] z-50 flex flex-col gap-0.5"
            onMouseLeave={() => setActiveMenu(null)}
          >
            {[
              { id: 'sm', label: 'Small' },
              { id: 'md', label: 'Medium' },
              { id: 'lg', label: 'Large' },
              { id: 'xl', label: 'X-Large' },
            ].map(f => (
              <button
                key={f.id}
                onClick={e => {
                  e.stopPropagation();
                  onUpdate(node.id, { fontSize: f.id as any });
                  setActiveMenu(null);
                }}
                className={`text-left px-2 py-1 text-xs font-semibold rounded-lg hover:bg-[#FFE9A8] text-[#1D1A16] cursor-pointer ${
                  (node.fontSize || 'md') === f.id ? 'bg-[#FFE9A8] font-bold' : ''
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Change Type Dropdown (Note, Sign, Logo, Heading, Task) */}
      <div className="relative">
        <button
          onClick={e => {
            e.stopPropagation();
            setActiveMenu(activeMenu === 'type' ? null : 'type');
          }}
          className="px-1.5 py-0.5 rounded text-[11px] font-bold text-[#1D1A16] hover:bg-[#F4EFE4] flex items-center gap-1 border border-[#DCD4C2] cursor-pointer"
          title="Change element style"
        >
          <Layers className="w-3 h-3 text-[#E24E1B]" />
          <span className="capitalize">{node.nodeType || 'Note'}</span>
          <ChevronDown className="w-2.5 h-2.5" />
        </button>

        {activeMenu === 'type' && (
          <div
            className="absolute top-full left-0 mt-1 bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-xl p-1 shadow-[4px_4px_0_#1D1A16] min-w-[130px] z-50 flex flex-col gap-0.5"
            onMouseLeave={() => setActiveMenu(null)}
          >
            {[
              { id: 'default', label: 'Sticky Note' },
              { id: 'sign', label: 'Road / Status Sign' },
              { id: 'logo', label: 'Tech / Brand Logo' },
              { id: 'heading', label: 'Section Title' },
              { id: 'task', label: 'Checklist Note' },
            ].map(t => (
              <button
                key={t.id}
                onClick={e => {
                  e.stopPropagation();
                  onUpdate(node.id, { nodeType: t.id as NodeType });
                  setActiveMenu(null);
                }}
                className="text-left px-2 py-1 text-xs font-semibold rounded-lg hover:bg-[#FFE9A8] text-[#1D1A16] cursor-pointer"
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Choose Sign Type Picker */}
      <div className="relative">
        <button
          onClick={e => {
            e.stopPropagation();
            setActiveMenu(activeMenu === 'sign' ? null : 'sign');
          }}
          className="px-1.5 py-0.5 rounded text-[11px] font-bold text-[#1D1A16] hover:bg-[#F4EFE4] flex items-center gap-1 border border-[#DCD4C2] cursor-pointer"
          title="Select Sign Icon"
        >
          <span>Signs</span>
          <ChevronDown className="w-2.5 h-2.5" />
        </button>

        {activeMenu === 'sign' && (
          <div
            className="absolute top-full left-0 mt-1 bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-xl p-2 shadow-[4px_4px_0_#1D1A16] w-64 max-h-56 overflow-y-auto z-50 grid grid-cols-2 gap-1"
            onMouseLeave={() => setActiveMenu(null)}
          >
            {onOpenLogoSearch && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onOpenLogoSearch('signs', node.id);
                  setActiveMenu(null);
                }}
                className="col-span-2 mb-1 p-1.5 rounded-lg bg-[#FFE9A8] hover:bg-[#FFE082] text-xs font-bold text-[#1D1A16] flex items-center justify-center gap-1 border border-[#1D1A16]/20 cursor-pointer shadow-2xs"
              >
                <Search className="w-3 h-3 text-[#E24E1B]" />
                <span>Search All Signs...</span>
              </button>
            )}
            {AVAILABLE_SIGNS.map(s => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={e => {
                    e.stopPropagation();
                    onUpdate(node.id, {
                      signType: s.id,
                      nodeType: 'sign',
                      title: node.title === 'Untitled' ? s.defaultTitle : node.title,
                      body: !node.body ? s.defaultBody : node.body,
                    });
                    setActiveMenu(null);
                  }}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-[#F4EFE4] text-left text-xs font-bold text-[#1D1A16] cursor-pointer"
                >
                  <Icon size={14} style={{ color: s.color }} />
                  <span className="truncate text-[11px]">{s.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Choose Tech Logo Picker */}
      <div className="relative">
        <button
          onClick={e => {
            e.stopPropagation();
            setActiveMenu(activeMenu === 'logo' ? null : 'logo');
          }}
          className="px-1.5 py-0.5 rounded text-[11px] font-bold text-[#1D1A16] hover:bg-[#F4EFE4] flex items-center gap-1 border border-[#DCD4C2] cursor-pointer"
          title="Select Tech Logo"
        >
          <span>Logos</span>
          <ChevronDown className="w-2.5 h-2.5" />
        </button>

        {activeMenu === 'logo' && (
          <div
            className="absolute top-full left-0 mt-1 bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-xl p-2 shadow-[4px_4px_0_#1D1A16] w-64 max-h-56 overflow-y-auto z-50 grid grid-cols-2 gap-1"
            onMouseLeave={() => setActiveMenu(null)}
          >
            {onOpenLogoSearch && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onOpenLogoSearch('all', node.id);
                  setActiveMenu(null);
                }}
                className="col-span-2 mb-1 p-1.5 rounded-lg bg-[#FFE9A8] hover:bg-[#FFE082] text-xs font-bold text-[#1D1A16] flex items-center justify-center gap-1 border border-[#1D1A16]/20 cursor-pointer shadow-2xs"
              >
                <Search className="w-3 h-3 text-[#E24E1B]" />
                <span>Search 1,882+ Logos...</span>
              </button>
            )}
            {AVAILABLE_LOGOS.map(l => {
              const Icon = l.icon;
              return (
                <button
                  key={l.id}
                  onClick={e => {
                    e.stopPropagation();
                    onUpdate(node.id, {
                      logoType: l.id,
                      nodeType: 'logo',
                      title: node.title === 'Untitled' ? l.defaultTitle : node.title,
                      body: !node.body ? l.defaultBody : node.body,
                    });
                    setActiveMenu(null);
                  }}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-[#F4EFE4] text-left text-xs font-bold text-[#1D1A16] cursor-pointer"
                >
                  <Icon size={14} style={{ color: l.color }} />
                  <span className="truncate text-[11px]">{l.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Stamp Picker */}
      <div className="relative">
        <button
          onClick={e => {
            e.stopPropagation();
            setActiveMenu(activeMenu === 'stamp' ? null : 'stamp');
          }}
          className="p-1 hover:bg-[#F4EFE4] rounded text-[#1D1A16] border border-[#DCD4C2] cursor-pointer"
          title="Attach Rubber Stamp"
        >
          <StampIcon className="w-3 h-3 text-[#E24E1B]" />
        </button>

        {activeMenu === 'stamp' && (
          <div
            className="absolute top-full left-0 mt-1 bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-xl p-1.5 shadow-[4px_4px_0_#1D1A16] min-w-[140px] z-50 flex flex-col gap-1"
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button
              onClick={e => {
                e.stopPropagation();
                onUpdate(node.id, { stamp: undefined });
                setActiveMenu(null);
              }}
              className="text-left px-2 py-1 text-xs font-semibold rounded-lg hover:bg-[#F4EFE4] text-[#6B6353] cursor-pointer"
            >
              None (Remove Stamp)
            </button>
            {AVAILABLE_STAMPS.map(st => (
              <button
                key={st.id}
                onClick={e => {
                  e.stopPropagation();
                  onUpdate(node.id, { stamp: st.id });
                  setActiveMenu(null);
                }}
                className={`text-left px-2 py-1 text-xs font-mono font-bold rounded-lg border ${st.color} cursor-pointer`}
              >
                {st.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <span className="w-px h-3.5 bg-[#DCD4C2] mx-0.5" />

      {/* Edit body */}
      <button
        onClick={e => {
          e.stopPropagation();
          onStartEditBody();
        }}
        className="p-1 hover:bg-[#1D1A16] hover:text-white rounded text-[#1D1A16] transition-colors cursor-pointer"
        title="Edit Content"
      >
        <Edit3 className="w-3 h-3" />
      </button>

      {/* Duplicate note */}
      {onDuplicate && (
        <button
          onClick={e => {
            e.stopPropagation();
            onDuplicate(node.id);
          }}
          className="p-1 hover:bg-[#1D1A16] hover:text-white rounded text-[#1D1A16] transition-colors cursor-pointer"
          title="Duplicate Element (Ctrl+D)"
        >
          <Copy className="w-3 h-3" />
        </button>
      )}

      {/* Add Task item */}
      {onAddTask && (
        <button
          onClick={e => {
            e.stopPropagation();
            onAddTask();
          }}
          className="p-1 hover:bg-[#1D1A16] hover:text-white rounded text-[#1D1A16] transition-colors cursor-pointer"
          title="Add Task item"
        >
          <CheckSquare className="w-3 h-3" />
        </button>
      )}

      {/* Delete note */}
      <button
        onClick={e => {
          e.stopPropagation();
          onDelete(node.id);
        }}
        className="p-1 hover:bg-[#B33A10] hover:text-white rounded text-[#E24E1B] transition-colors cursor-pointer"
        title="Delete Element (Delete)"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}
