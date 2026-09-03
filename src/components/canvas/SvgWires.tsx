'use client';

import React, { useState } from 'react';
import { CanvasNode, CanvasEdge, EdgeLineStyle, EdgeDirection } from '@/lib/types';
import { ArrowRight, ArrowLeftRight, Trash2, Edit3 } from 'lucide-react';

interface SvgWiresProps {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedEdgeId: string | null;
  tempLink: { fromNode: CanvasNode; mouseX: number; mouseY: number } | null;
  onSelectEdge: (id: string | null) => void;
  onUpdateEdge: (id: string, updates: Partial<CanvasEdge>) => void;
  onDeleteEdge: (id: string) => void;
}

export function SvgWires({
  nodes,
  edges,
  selectedEdgeId,
  tempLink,
  onSelectEdge,
  onUpdateEdge,
  onDeleteEdge,
}: SvgWiresProps) {
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [labelInput, setLabelInput] = useState('');

  const nodeMap = new Map<string, CanvasNode>(nodes.map(n => [n.id, n]));

  const getPortCoord = (n: CanvasNode, side: 'left' | 'right') => {
    const w = n.width || 230;
    const h = n.height || 140;
    return {
      x: side === 'right' ? n.x + w : n.x,
      y: n.y + h / 2,
    };
  };

  const seenEdgeIds = new Set<string>();
  const uniqueEdges = edges.filter(edge => {
    if (!edge || !edge.id || seenEdgeIds.has(edge.id)) return false;
    seenEdgeIds.add(edge.id);
    return true;
  });

  return (
    <svg
      style={{
        position: 'absolute',
        left: -25000,
        top: -25000,
        width: 50000,
        height: 50000,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
      viewBox="-25000 -25000 50000 50000"
      className="z-0"
    >
      <defs>
        {/* Forward arrows (target end) */}
        <marker
          id="wire-arrow-normal"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#57503F" />
        </marker>
        <marker
          id="wire-arrow-selected"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#E24E1B" />
        </marker>

        {/* Backward arrows (source end for bidirectional links) */}
        <marker
          id="wire-arrow-start-normal"
          viewBox="0 0 10 10"
          refX="2"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="#57503F" />
        </marker>
        <marker
          id="wire-arrow-start-selected"
          viewBox="0 0 10 10"
          refX="2"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="#E24E1B" />
        </marker>
      </defs>

      {/* Render existing edges */}
      {uniqueEdges.map(edge => {
        const source = nodeMap.get(edge.from);
        const target = nodeMap.get(edge.to);
        if (!source || !target) return null;

        const isSelected = selectedEdgeId === edge.id;
        const p1 = getPortCoord(source, 'right');
        const p2 = getPortCoord(target, 'left');

        const deltaX = Math.abs(p2.x - p1.x);
        const controlOffset = Math.max(50, Math.min(220, deltaX * 0.5));

        const c1 = { x: p1.x + controlOffset, y: p1.y };
        const c2 = { x: p2.x - controlOffset, y: p2.y };
        const midX = (p1.x + 3 * c1.x + 3 * c2.x + p2.x) / 8;
        const midY = (p1.y + 3 * c1.y + 3 * c2.y + p2.y) / 8;

        const pathData = `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;

        // Line style resolution
        const isBidirectional = edge.direction === 'bidirectional' || edge.style === 'bidirectional';
        const lineStyle: EdgeLineStyle =
          edge.lineStyle ||
          (edge.style === 'solid' ? 'solid' : edge.style === 'dotted' ? 'dotted' : 'dashed');

        let dashArray: string | undefined;
        if (lineStyle === 'solid') {
          dashArray = undefined;
        } else if (lineStyle === 'dotted') {
          dashArray = '3 4';
        } else {
          dashArray = '7 5';
        }

        return (
          <g key={edge.id} className="group pointer-events-auto cursor-pointer">
            {/* Invisible thick hit-test line for easy clicking */}
            <path
              d={pathData}
              fill="none"
              stroke="transparent"
              strokeWidth={24}
              onClick={e => {
                e.stopPropagation();
                onSelectEdge(edge.id);
              }}
              onDoubleClick={e => {
                e.stopPropagation();
                setEditingEdgeId(edge.id);
                setLabelInput(edge.label || '');
              }}
            />

            {/* Visible wire path */}
            <path
              d={pathData}
              fill="none"
              stroke={isSelected ? '#E24E1B' : '#57503F'}
              strokeWidth={isSelected ? 3 : 2.2}
              strokeDasharray={dashArray}
              markerStart={
                isBidirectional
                  ? isSelected
                    ? 'url(#wire-arrow-start-selected)'
                    : 'url(#wire-arrow-start-normal)'
                  : undefined
              }
              markerEnd={isSelected ? 'url(#wire-arrow-selected)' : 'url(#wire-arrow-normal)'}
              className="transition-colors duration-150"
            />

            {/* Relationship Label badge */}
            {(edge.label || isSelected) && editingEdgeId !== edge.id && (
              <g
                transform={`translate(${midX}, ${midY})`}
                onClick={e => {
                  e.stopPropagation();
                  onSelectEdge(edge.id);
                }}
                onDoubleClick={e => {
                  e.stopPropagation();
                  setEditingEdgeId(edge.id);
                  setLabelInput(edge.label || '');
                }}
                className="cursor-pointer pointer-events-auto"
              >
                <rect
                  x="-50"
                  y="-13"
                  width="100"
                  height="26"
                  rx="7"
                  fill="#FFFDF6"
                  stroke={isSelected ? '#E24E1B' : '#1D1A16'}
                  strokeWidth="1.4"
                  className="shadow-sm"
                />
                <text
                  x="0"
                  y="4.5"
                  textAnchor="middle"
                  fill="#1D1A16"
                  fontSize="11"
                  fontFamily="'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif"
                  fontWeight="600"
                >
                  {edge.label ? (edge.label.length > 14 ? edge.label.slice(0, 13) + '…' : edge.label) : '+ label'}
                </text>
              </g>
            )}

            {/* Selected Edge Quick Style Floating Toolbar */}
            {isSelected && editingEdgeId !== edge.id && (
              <foreignObject
                x={midX - 110}
                y={midY - 48}
                width="220"
                height="36"
                className="pointer-events-auto overflow-visible"
              >
                <div
                  className="flex items-center gap-1 p-1 bg-[#FFFDF6] border border-[#1D1A16] rounded-xl shadow-[3px_3px_0_#1D1A16] text-[10px] font-bold select-none animate-note-pop justify-center"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Line Style Switcher */}
                  <button
                    onClick={() => {
                      const nextStyle: EdgeLineStyle =
                        lineStyle === 'solid' ? 'dashed' : lineStyle === 'dashed' ? 'dotted' : 'solid';
                      onUpdateEdge(edge.id, { lineStyle: nextStyle, style: nextStyle });
                    }}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[#F4EFE4] hover:bg-[#EAE2D2] text-[#1D1A16] transition-colors cursor-pointer"
                    title="Click to toggle Line Style (Solid / Dashed / Dotted)"
                  >
                    <span>
                      {lineStyle === 'solid' ? '── Solid' : lineStyle === 'dashed' ? '╌╌ Dashed' : '··· Dotted'}
                    </span>
                  </button>

                  {/* Direction Switcher (Directed vs Bidirectional) */}
                  <button
                    onClick={() => {
                      const nextDir: EdgeDirection = isBidirectional ? 'directed' : 'bidirectional';
                      onUpdateEdge(edge.id, {
                        direction: nextDir,
                        style: nextDir === 'bidirectional' ? 'bidirectional' : lineStyle,
                      });
                    }}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg transition-colors cursor-pointer ${
                      isBidirectional
                        ? 'bg-[#FFE9A8] text-[#E24E1B] border border-[#E24E1B]/40'
                        : 'bg-[#F4EFE4] hover:bg-[#EAE2D2] text-[#1D1A16]'
                    }`}
                    title="Click to toggle direction (1-Way ➔ or 2-Way ⇄)"
                  >
                    {isBidirectional ? (
                      <>
                        <ArrowLeftRight className="w-3 h-3" />
                        <span>⇄ Both</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-3 h-3" />
                        <span>➔ 1-Way</span>
                      </>
                    )}
                  </button>

                  {/* Edit Label button */}
                  <button
                    onClick={() => {
                      setEditingEdgeId(edge.id);
                      setLabelInput(edge.label || '');
                    }}
                    className="p-1 rounded-lg hover:bg-[#F4EFE4] text-[#6B6353] hover:text-[#1D1A16] transition-colors cursor-pointer"
                    title="Edit Label"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>

                  {/* Delete Wire button */}
                  <button
                    onClick={() => onDeleteEdge(edge.id)}
                    className="p-1 rounded-lg hover:bg-[#FFD8C7] text-[#E24E1B] transition-colors cursor-pointer"
                    title="Delete connection"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </foreignObject>
            )}

            {/* Editing input foreignObject */}
            {editingEdgeId === edge.id && (
              <foreignObject x={midX - 75} y={midY - 17} width="150" height="36" className="pointer-events-auto">
                <input
                  type="text"
                  autoFocus
                  value={labelInput}
                  onChange={e => setLabelInput(e.target.value)}
                  onBlur={() => {
                    onUpdateEdge(edge.id, { label: labelInput.trim() });
                    setEditingEdgeId(null);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      onUpdateEdge(edge.id, { label: labelInput.trim() });
                      setEditingEdgeId(null);
                    }
                    if (e.key === 'Escape') {
                      setEditingEdgeId(null);
                    }
                  }}
                  className="w-full text-center text-xs font-semibold px-2 py-1 bg-[#FFFDF6] border border-[#1D1A16] rounded-md shadow-md outline-none"
                  placeholder="relationship label..."
                />
              </foreignObject>
            )}
          </g>
        );
      })}

      {/* Temporary dragging wire when creating a link */}
      {tempLink && (
        <path
          d={`M ${getPortCoord(tempLink.fromNode, 'right').x} ${getPortCoord(tempLink.fromNode, 'right').y} L ${tempLink.mouseX} ${tempLink.mouseY}`}
          fill="none"
          stroke="#E24E1B"
          strokeWidth={2.6}
          strokeDasharray="5 4"
          markerEnd="url(#wire-arrow-selected)"
        />
      )}
    </svg>
  );
}
