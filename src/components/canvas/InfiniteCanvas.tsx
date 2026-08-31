'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CanvasNode, CanvasEdge, CanvasCamera, NoteColor } from '@/lib/types';
import { StickyNote } from './StickyNote';
import { SvgWires } from './SvgWires';
import { AgentGhostCursor } from './AgentGhostCursor';
import { Minimap } from './Minimap';

interface InfiniteCanvasProps {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  camera: CanvasCamera;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  highlightedNodeId: string | null;
  highlightReason?: string;
  agentCursor: { x: number; y: number; isActive: boolean; actionText?: string };
  onUpdateCamera: (camera: CanvasCamera) => void;
  onSelectNode: (id: string | null) => void;
  onSelectEdge: (id: string | null) => void;
  onAddNode: (x: number, y: number) => void;
  onUpdateNode: (id: string, updates: Partial<CanvasNode>) => void;
  onDeleteNode: (id: string) => void;
  onConnectNodes: (sourceId: string, targetId: string, label?: string) => void;
  onUpdateEdge: (id: string, updates: Partial<CanvasEdge>) => void;
  onDeleteEdge: (id: string) => void;
  onUndo: () => void;
}

export function InfiniteCanvas({
  nodes,
  edges,
  camera,
  selectedNodeId,
  selectedEdgeId,
  highlightedNodeId,
  highlightReason,
  agentCursor,
  onUpdateCamera,
  onSelectNode,
  onSelectEdge,
  onAddNode,
  onUpdateNode,
  onDeleteNode,
  onConnectNodes,
  onUpdateEdge,
  onDeleteEdge,
  onUndo,
}: InfiniteCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 1200, height: 800 });

  // Pan state
  const isPanningRef = useRef(false);
  const startPanRef = useRef({ x: 0, y: 0, camX: 0, camY: 0, hasMoved: false });

  // Node drag state
  const isDraggingNodeRef = useRef(false);
  const dragNodeRef = useRef<{ node: CanvasNode; startMouseX: number; startMouseY: number; startNodeX: number; startNodeY: number } | null>(null);

  // Link creation state
  const [tempLink, setTempLink] = useState<{ fromNode: CanvasNode; mouseX: number; mouseY: number } | null>(null);

  // Resize listener
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setViewportSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      return {
        x: (screenX - camera.x) / camera.z,
        y: (screenY - camera.y) / camera.z,
      };
    },
    [camera]
  );

  // Background pointer down -> Panning or Deselection
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-node-id]')) return;

    if (e.button === 0 || e.button === 1) {
      isPanningRef.current = true;
      startPanRef.current = {
        x: e.clientX,
        y: e.clientY,
        camX: camera.x,
        camY: camera.y,
        hasMoved: false,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // 1. Panning
    if (isPanningRef.current) {
      const dx = e.clientX - startPanRef.current.x;
      const dy = e.clientY - startPanRef.current.y;
      if (!startPanRef.current.hasMoved && Math.hypot(dx, dy) > 4) {
        startPanRef.current.hasMoved = true;
      }
      onUpdateCamera({
        ...camera,
        x: startPanRef.current.camX + dx,
        y: startPanRef.current.camY + dy,
      });
      return;
    }

    // 2. Node Dragging
    if (isDraggingNodeRef.current && dragNodeRef.current) {
      const { node, startMouseX, startMouseY, startNodeX, startNodeY } = dragNodeRef.current;
      const dx = (e.clientX - startMouseX) / camera.z;
      const dy = (e.clientY - startMouseY) / camera.z;
      onUpdateNode(node.id, {
        x: Math.round(startNodeX + dx),
        y: Math.round(startNodeY + dy),
      });
      return;
    }

    // 3. Link Dragging
    if (tempLink) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      setTempLink(prev => (prev ? { ...prev, mouseX: worldPos.x, mouseY: worldPos.y } : null));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    // End pan
    if (isPanningRef.current) {
      if (!startPanRef.current.hasMoved) {
        onSelectNode(null);
        onSelectEdge(null);
      }
      isPanningRef.current = false;
    }

    // End node drag
    if (isDraggingNodeRef.current) {
      isDraggingNodeRef.current = false;
      dragNodeRef.current = null;
    }

    // End link drag
    if (tempLink) {
      const targetElement = document.elementFromPoint(e.clientX, e.clientY);
      const targetNodeElement = targetElement?.closest('[data-node-id]');
      if (targetNodeElement) {
        const targetId = targetNodeElement.getAttribute('data-node-id');
        if (targetId && targetId !== tempLink.fromNode.id) {
          onConnectNodes(tempLink.fromNode.id, targetId);
        }
      }
      setTempLink(null);
    }
  };

  // Wheel zoom centered at mouse cursor
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = Math.exp(-e.deltaY * 0.00125);
    const newZoom = Math.max(0.2, Math.min(2.5, camera.z * zoomFactor));

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const newCamX = mouseX - (mouseX - camera.x) * (newZoom / camera.z);
    const newCamY = mouseY - (mouseY - camera.y) * (newZoom / camera.z);

    onUpdateCamera({ x: newCamX, y: newCamY, z: newZoom });
  };

  // Double click canvas to create note
  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-node-id]')) return;
    const worldPos = screenToWorld(e.clientX, e.clientY);
    onAddNode(Math.round(worldPos.x - 115), Math.round(worldPos.y - 65));
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
        if (e.key === 'Escape') (active as HTMLElement).blur();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        onUndo();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          onDeleteNode(selectedNodeId);
        } else if (selectedEdgeId) {
          onDeleteEdge(selectedEdgeId);
        }
        return;
      }

      if (e.key === 'Escape') {
        onSelectNode(null);
        onSelectEdge(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedEdgeId, onDeleteNode, onDeleteEdge, onUndo, onSelectNode, onSelectEdge]);

  const seenNodeIds = new Set<string>();
  const uniqueNodes = nodes.filter(node => {
    if (!node || !node.id || seenNodeIds.has(node.id)) return false;
    seenNodeIds.add(node.id);
    return true;
  });

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      style={{
        backgroundSize: `${26 * camera.z}px ${26 * camera.z}px`,
        backgroundPosition: `${camera.x}px ${camera.y}px`,
      }}
      className="relative w-full h-full overflow-hidden canvas-grid-bg cursor-grab active:cursor-grabbing select-none touch-none"
    >
      {/* World transform container */}
      <div
        style={{
          transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.z})`,
          transformOrigin: '0 0',
        }}
        className="absolute inset-0 w-0 h-0 overflow-visible"
      >
        {/* SVG Bezier Wires */}
        <SvgWires
          nodes={uniqueNodes}
          edges={edges}
          selectedEdgeId={selectedEdgeId}
          tempLink={tempLink}
          onSelectEdge={onSelectEdge}
          onUpdateEdge={onUpdateEdge}
          onDeleteEdge={onDeleteEdge}
        />

        {/* Sticky Notes */}
        {uniqueNodes.map(node => (
          <StickyNote
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            isHighlighted={highlightedNodeId === node.id}
            highlightReason={highlightedNodeId === node.id ? highlightReason : undefined}
            onSelect={onSelectNode}
            onUpdate={onUpdateNode}
            onDelete={onDeleteNode}
            onStartLink={(_e, n) => {
              const startPos = screenToWorld(_e.clientX, _e.clientY);
              setTempLink({ fromNode: n, mouseX: startPos.x, mouseY: startPos.y });
            }}
            onDragStart={(_e, n) => {
              isDraggingNodeRef.current = true;
              dragNodeRef.current = {
                node: n,
                startMouseX: _e.clientX,
                startMouseY: _e.clientY,
                startNodeX: n.x,
                startNodeY: n.y,
              };
            }}
          />
        ))}

        {/* Agent Ghost Cursor */}
        <AgentGhostCursor
          x={agentCursor.x}
          y={agentCursor.y}
          isActive={agentCursor.isActive}
          actionText={agentCursor.actionText}
        />
      </div>

      {/* Empty State Prompt if 0 notes */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center p-6 bg-[#FFFDF6]/80 border border-[#1D1A16] rounded-2xl shadow-[4px_4px_0_#1D1A16] max-w-sm pointer-events-auto">
            <h3 className="font-['Fraunces'] italic font-bold text-xl text-[#1D1A16]">
              Your canvas is fresh and ready.
            </h3>
            <p className="font-['Kalam'] text-sm text-[#6B6353] mt-2">
              Double-click anywhere to create a sticky note, or open the Agent Studio to run a mission.
            </p>
          </div>
        </div>
      )}

      {/* Minimap Radar Navigation */}
      <Minimap
        nodes={uniqueNodes}
        camera={camera}
        viewportWidth={viewportSize.width}
        viewportHeight={viewportSize.height}
        onNavigate={(targetX, targetY) => {
          onUpdateCamera({
            ...camera,
            x: viewportSize.width / 2 - targetX * camera.z,
            y: viewportSize.height / 2 - targetY * camera.z,
          });
        }}
      />
    </div>
  );
}
