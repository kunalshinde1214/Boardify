'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CanvasNode, CanvasCamera } from '@/lib/types';
import { getBoundingBox } from '@/lib/layouts';
import { MapPin, Minimize2, Maximize2, GripHorizontal } from 'lucide-react';

interface MinimapProps {
  nodes: CanvasNode[];
  camera: CanvasCamera;
  viewportWidth: number;
  viewportHeight: number;
  onNavigate: (x: number, y: number) => void;
  isStudioOpen?: boolean;
}

const MINIMAP_WIDTH = 160;
const MINIMAP_HEIGHT = 100;

export function Minimap({
  nodes,
  camera,
  viewportWidth,
  viewportHeight,
  onNavigate,
}: MinimapProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  // Default position: slightly near bottom left, comfortably raised above screen bottom
  useEffect(() => {
    if (typeof window !== 'undefined' && pos === null) {
      setPos({
        x: 76,
        y: Math.max(80, window.innerHeight - 230),
      });
    }
  }, [pos]);

  const handleStartDrag = (e: React.MouseEvent) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    const currentX = pos ? pos.x : 76;
    const currentY = pos ? pos.y : (typeof window !== 'undefined' ? window.innerHeight - 230 : 550);

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: currentX,
      startY: currentY,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvent.clientX - dragStartRef.current.mouseX;
      const dy = moveEvent.clientY - dragStartRef.current.mouseY;

      const maxX = typeof window !== 'undefined' ? window.innerWidth - (isCollapsed ? 120 : MINIMAP_WIDTH + 24) : 1000;
      const maxY = typeof window !== 'undefined' ? window.innerHeight - (isCollapsed ? 60 : MINIMAP_HEIGHT + 75) : 800;

      const newX = Math.max(12, Math.min(maxX, dragStartRef.current.startX + dx));
      const newY = Math.max(60, Math.min(maxY, dragStartRef.current.startY + dy));

      setPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const seenNodeIds = new Set<string>();
  const uniqueNodes = nodes.filter(n => {
    if (!n || !n.id || seenNodeIds.has(n.id)) return false;
    seenNodeIds.add(n.id);
    return true;
  });

  const bb = getBoundingBox(uniqueNodes);

  // Default coordinate boundaries
  const minX = bb ? Math.min(bb.minX - 400, -camera.x / camera.z) : -1000;
  const maxX = bb ? Math.max(bb.maxX + 400, (-camera.x + viewportWidth) / camera.z) : 1000;
  const minY = bb ? Math.min(bb.minY - 400, -camera.y / camera.z) : -1000;
  const maxY = bb ? Math.max(bb.maxY + 400, (-camera.y + viewportHeight) / camera.z) : 1000;

  const worldW = Math.max(1000, maxX - minX);
  const worldH = Math.max(800, maxY - minY);

  const scaleX = MINIMAP_WIDTH / worldW;
  const scaleY = MINIMAP_HEIGHT / worldH;
  const scale = Math.min(scaleX, scaleY);

  const mapX = (x: number) => (x - minX) * scale;
  const mapY = (y: number) => (y - minY) * scale;

  // Viewport bounds in world coords
  const viewWorldX = -camera.x / camera.z;
  const viewWorldY = -camera.y / camera.z;
  const viewWorldW = viewportWidth / camera.z;
  const viewWorldH = viewportHeight / camera.z;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const targetWorldX = clickX / scale + minX;
    const targetWorldY = clickY / scale + minY;

    onNavigate(targetWorldX, targetWorldY);
  };

  const currentLeft = pos ? `${pos.x}px` : '76px';
  const currentTop = pos ? `${pos.y}px` : undefined;
  const currentBottom = pos ? undefined : '56px';

  if (isCollapsed) {
    return (
      <div
        style={{
          left: currentLeft,
          top: currentTop,
          bottom: currentBottom,
          position: 'absolute',
        }}
        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-xl shadow-[3px_3px_0_#1D1A16] hover:bg-[#F4EFE4] text-xs font-bold text-[#1D1A16] z-40 select-none animate-note-pop"
      >
        <div
          onMouseDown={handleStartDrag}
          className="cursor-grab active:cursor-grabbing p-0.5 text-[#6B6353] hover:text-[#1D1A16]"
          title="Drag to move Radar anywhere"
        >
          <GripHorizontal className="w-3.5 h-3.5" />
        </div>
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-1 cursor-pointer"
          title="Expand Radar"
        >
          <MapPin className="w-3.5 h-3.5 text-[#E24E1B]" />
          <span className="font-mono text-[11px] font-bold">RADAR</span>
          <span className="font-mono text-[10px] text-[#6B6353] bg-[#1D1A16]/5 px-1.5 py-0.5 rounded">
            {Math.round(camera.z * 100)}%
          </span>
          <Maximize2 className="w-3 h-3 text-[#6B6353] ml-0.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        left: currentLeft,
        top: currentTop,
        bottom: currentBottom,
        position: 'absolute',
      }}
      className="hidden sm:block z-40 bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-xl p-2 shadow-[3px_3px_0_#1D1A16] select-none animate-note-pop"
    >
      {/* Draggable Header Bar */}
      <div
        onMouseDown={handleStartDrag}
        className="flex items-center justify-between text-[10px] font-bold text-[#6B6353] pb-1.5 px-0.5 cursor-grab active:cursor-grabbing border-b border-[#DCD4C2]/60 mb-1.5"
        title="Drag header to move Radar anywhere"
      >
        <span className="flex items-center gap-1 font-mono uppercase tracking-wider text-[#1D1A16]">
          <GripHorizontal className="w-3 h-3 text-[#6B6353]" />
          <MapPin className="w-3 h-3 text-[#E24E1B]" /> Radar
        </span>
        <div className="flex items-center gap-1.5" onMouseDown={e => e.stopPropagation()}>
          <span className="font-mono text-[9px] bg-[#1D1A16]/5 px-1.5 py-0.5 rounded text-[#1D1A16]">
            {Math.round(camera.z * 100)}%
          </span>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-[#1D1A16]/10 rounded cursor-pointer transition-colors text-[#6B6353] hover:text-[#1D1A16]"
            title="Minimize Radar"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div
        onClick={handleClick}
        style={{ width: `${MINIMAP_WIDTH}px`, height: `${MINIMAP_HEIGHT}px` }}
        className="relative bg-[#F4EFE4] border border-[#DCD4C2] rounded-lg overflow-hidden cursor-pointer"
      >
        {/* Render mini nodes */}
        {uniqueNodes.map(n => (
          <div
            key={n.id}
            style={{
              left: `${mapX(n.x)}px`,
              top: `${mapY(n.y)}px`,
              width: `${Math.max(4, (n.width || 230) * scale)}px`,
              height: `${Math.max(3, (n.height || 140) * scale)}px`,
            }}
            className={`absolute rounded-xs ${
              n.author === 'agent' ? 'bg-[#E24E1B]' : 'bg-[#57503F]'
            }`}
          />
        ))}

        {/* Viewport rectangle indicator */}
        <div
          style={{
            left: `${mapX(viewWorldX)}px`,
            top: `${mapY(viewWorldY)}px`,
            width: `${Math.max(10, viewWorldW * scale)}px`,
            height: `${Math.max(10, viewWorldH * scale)}px`,
          }}
          className="absolute border border-[#E24E1B] bg-[#E24E1B]/15 rounded-xs pointer-events-none"
        />
      </div>
    </div>
  );
}
