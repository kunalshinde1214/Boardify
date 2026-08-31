'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CanvasNode, NoteColor } from '@/lib/types';
import { Sparkles, Trash2, Edit3, Tag } from 'lucide-react';
import {
  AgentBadgeIcon,
  ToolBadgeIcon,
  DatabaseBadgeIcon,
  ApiBadgeIcon,
  AuthBadgeIcon,
  TriggerBadgeIcon,
  UIBadgeIcon,
  WebMCPIcon,
} from '@/components/ui/BrandIcons';

const COLOR_MAP: Record<NoteColor, string> = {
  butter: '#FFE9A8',
  sage: '#DCEBC8',
  coral: '#FFD8C7',
  slate: '#DAE5E6',
  lavender: '#E8DEFF',
  mint: '#C7F3E3',
};

const NODE_TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  agent: { label: 'AGENT', icon: AgentBadgeIcon, color: 'bg-indigo-600' },
  tool: { label: 'TOOL', icon: ToolBadgeIcon, color: 'bg-amber-600' },
  database: { label: 'DATABASE', icon: DatabaseBadgeIcon, color: 'bg-emerald-700' },
  api: { label: 'API / RPC', icon: ApiBadgeIcon, color: 'bg-blue-600' },
  cloud: { label: 'CLOUD', icon: WebMCPIcon, color: 'bg-cyan-700' },
  auth: { label: 'AUTH', icon: AuthBadgeIcon, color: 'bg-rose-600' },
  trigger: { label: 'TRIGGER', icon: TriggerBadgeIcon, color: 'bg-purple-600' },
  ui: { label: 'CLIENT UI', icon: UIBadgeIcon, color: 'bg-slate-700' },
};

interface StickyNoteProps {
  node: CanvasNode;
  isSelected: boolean;
  isHighlighted?: boolean;
  highlightReason?: string;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasNode>) => void;
  onDelete: (id: string) => void;
  onStartLink: (e: React.PointerEvent, node: CanvasNode) => void;
  onDragStart: (e: React.PointerEvent, node: CanvasNode) => void;
}

export function StickyNote({
  node,
  isSelected,
  isHighlighted,
  highlightReason,
  onSelect,
  onUpdate,
  onDelete,
  onStartLink,
  onDragStart,
}: StickyNoteProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingBody, setIsEditingBody] = useState(false);
  const [titleValue, setTitleValue] = useState(node.title);
  const [bodyValue, setBodyValue] = useState(node.body);
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
      bodyInputRef.current.select();
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

  const bgHex = COLOR_MAP[node.color] || COLOR_MAP.butter;
  const rotation = node.rot || 0;

  return (
    <div
      data-node-id={node.id}
      style={{
        transform: `translate(${node.x}px, ${node.y}px) rotate(${rotation}deg)`,
        width: `${node.width || 230}px`,
        backgroundColor: bgHex,
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
          className="ignore-drag font-['Caveat'] font-bold text-2xl text-[#1D1A16] leading-tight w-full bg-transparent outline-none border-b border-[#1D1A16]/30 px-1"
        />
      ) : (
        <h3
          onDoubleClick={e => {
            e.stopPropagation();
            setIsEditingTitle(true);
          }}
          className="font-['Caveat'] font-bold text-2xl text-[#1D1A16] leading-tight break-words min-h-[28px] cursor-text"
        >
          {node.title}
        </h3>
      )}

      {/* Body Content */}
      {isEditingBody ? (
        <textarea
          ref={bodyInputRef}
          value={bodyValue}
          onChange={e => setBodyValue(e.target.value)}
          onBlur={commitBody}
          rows={3}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              setBodyValue(node.body);
              setIsEditingBody(false);
            }
          }}
          className="ignore-drag font-['Kalam'] text-sm text-[#403A2F] leading-snug w-full bg-transparent outline-none border border-[#1D1A16]/30 rounded p-1 mt-1 resize-none"
        />
      ) : (
        <div
          onDoubleClick={e => {
            e.stopPropagation();
            setIsEditingBody(true);
          }}
          className="font-['Kalam'] text-sm text-[#403A2F] leading-snug break-words whitespace-pre-wrap mt-1.5 min-h-[20px] cursor-text"
        >
          {node.body || <span className="opacity-40 italic">Double-click to write details...</span>}
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

      {/* Action Toolbar on Select */}
      {isSelected && (
        <div className="ignore-drag absolute -top-11 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#FFFDF6] border border-[#1D1A16] px-2.5 py-1 rounded-xl shadow-[3px_3px_0_rgba(29,26,22,0.15)] z-40 whitespace-nowrap animate-note-pop">
          {/* Color Dots */}
          {(['butter', 'sage', 'coral', 'slate', 'lavender', 'mint'] as NoteColor[]).map(c => (
            <button
              key={c}
              onClick={e => {
                e.stopPropagation();
                onUpdate(node.id, { color: c });
              }}
              style={{ backgroundColor: COLOR_MAP[c] }}
              className={`w-3.5 h-3.5 rounded-full border border-[#1D1A16]/50 hover:scale-125 transition-transform ${
                node.color === c ? 'ring-2 ring-[#1D1A16]' : ''
              }`}
              title={c}
            />
          ))}

          <span className="w-px h-3.5 bg-[#DCD4C2] mx-0.5" />

          {/* Edit body */}
          <button
            onClick={e => {
              e.stopPropagation();
              setIsEditingBody(true);
            }}
            className="p-1 hover:bg-[#1D1A16] hover:text-white rounded text-[#1D1A16] transition-colors"
            title="Edit body"
          >
            <Edit3 className="w-3 h-3" />
          </button>

          {/* Delete note */}
          <button
            onClick={e => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            className="p-1 hover:bg-[#B33A10] hover:text-white rounded text-[#E24E1B] transition-colors"
            title="Delete note"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
