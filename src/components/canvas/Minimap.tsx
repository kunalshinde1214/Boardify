'use client';

import React from 'react';
import { CanvasNode, CanvasCamera } from '@/lib/types';
import { getBoundingBox } from '@/lib/layouts';
import { MapPin } from 'lucide-react';

interface MinimapProps {
  nodes: CanvasNode[];
  camera: CanvasCamera;
  viewportWidth: number;
  viewportHeight: number;
  onNavigate: (x: number, y: number) => void;
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

  return (
    <div className="hidden sm:block absolute bottom-4 left-4 z-40 bg-[#FFFDF6] border border-[#1D1A16] rounded-xl p-2 shadow-[3px_3px_0_#1D1A16]">
      <div className="flex items-center justify-between text-[10px] font-bold text-[#6B6353] pb-1.5 px-0.5">
        <span className="flex items-center gap-1 font-mono uppercase tracking-wider">
          <MapPin className="w-3 h-3 text-[#E24E1B]" /> Radar
        </span>
        <span className="font-mono text-[9px]">{Math.round(camera.z * 100)}%</span>
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
