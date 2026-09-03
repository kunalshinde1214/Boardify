'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CanvasNode, CanvasEdge, CanvasCamera } from '@/lib/types';
import { StickyNote, ResizeDirection } from './StickyNote';
import { SvgWires } from './SvgWires';
import { AgentGhostCursor } from './AgentGhostCursor';
import { Minimap } from './Minimap';
import { CanvasToolType } from './LeftToolPalette';

interface InfiniteCanvasProps {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  camera: CanvasCamera;
  activeTool?: CanvasToolType;
  selectedNodeId: string | null;
  selectedNodeIds?: string[];
  selectedEdgeId: string | null;
  highlightedNodeId: string | null;
  highlightReason?: string;
  agentCursor: { x: number; y: number; isActive: boolean; actionText?: string };
  onUpdateCamera: (camera: CanvasCamera) => void;
  onSelectNode: (id: string | null) => void;
  onSelectNodes?: (ids: string[]) => void;
  onSelectEdge: (id: string | null) => void;
  onSelectTool?: (tool: CanvasToolType) => void;
  onAddNode: (x: number, y: number) => void;
  onAddHeading?: (x: number, y: number) => void;
  onAddTaskNote?: (x: number, y: number) => void;
  onAddEntityTable?: (x: number, y: number) => void;
  onAddShapeNode?: (x: number, y: number, shapeType?: string) => void;
  onDuplicateNode?: (id: string) => void;
  onUpdateNode: (id: string, updates: Partial<CanvasNode>) => void;
  onDeleteNode: (id: string) => void;
  onConnectNodes: (sourceId: string, targetId: string, label?: string) => void;
  onUpdateEdge: (id: string, updates: Partial<CanvasEdge>) => void;
  onDeleteEdge: (id: string) => void;
  onUndo: () => void;
  onOpenLogoSearch?: (category?: string, targetNodeId?: string) => void;
  isStudioOpen?: boolean;
}

export function InfiniteCanvas({
  nodes,
  edges,
  camera,
  activeTool = 'select',
  selectedNodeId,
  selectedNodeIds = [],
  selectedEdgeId,
  highlightedNodeId,
  highlightReason,
  agentCursor,
  isStudioOpen = false,
  onUpdateCamera,
  onSelectNode,
  onSelectNodes,
  onSelectEdge,
  onSelectTool,
  onAddNode,
  onAddHeading,
  onAddTaskNote,
  onAddEntityTable,
  onAddShapeNode,
  onDuplicateNode,
  onUpdateNode,
  onDeleteNode,
  onConnectNodes,
  onUpdateEdge,
  onDeleteEdge,
  onUndo,
  onOpenLogoSearch,
}: InfiniteCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 1200, height: 800 });

  // Pan state
  const isPanningRef = useRef(false);
  const startPanRef = useRef({ x: 0, y: 0, camX: 0, camY: 0, hasMoved: false });

  // Node drag state
  const isDraggingNodeRef = useRef(false);
  const dragNodeRef = useRef<{ node: CanvasNode; startMouseX: number; startMouseY: number; startNodeX: number; startNodeY: number } | null>(null);

  // Resize state
  const isResizingNodeRef = useRef(false);
  const resizeStateRef = useRef<{
    node: CanvasNode;
    direction: ResizeDirection;
    startMouseX: number;
    startMouseY: number;
    startWidth: number;
    startHeight?: number;
    startNodeX: number;
    startNodeY: number;
  } | null>(null);

  // Marquee Selection Box
  const [marquee, setMarquee] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

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

  // Background pointer down -> Panning, Marquee Selection, or Tool Placement
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const isTargetingNode = (e.target as HTMLElement).closest('[data-node-id]');
    if (isTargetingNode) return;

    const worldPos = screenToWorld(e.clientX, e.clientY);

    // 1. Tool-Specific Immediate Placement Actions
    if (activeTool === 'note') {
      onAddNode(Math.round(worldPos.x - 115), Math.round(worldPos.y - 65));
      if (onSelectTool) onSelectTool('select');
      return;
    }

    if (activeTool === 'heading' && onAddHeading) {
      onAddHeading(Math.round(worldPos.x - 160), Math.round(worldPos.y - 40));
      if (onSelectTool) onSelectTool('select');
      return;
    }

    if (activeTool === 'task' && onAddTaskNote) {
      onAddTaskNote(Math.round(worldPos.x - 120), Math.round(worldPos.y - 80));
      if (onSelectTool) onSelectTool('select');
      return;
    }

    if (activeTool === 'erd' && onAddEntityTable) {
      onAddEntityTable(Math.round(worldPos.x - 130), Math.round(worldPos.y - 100));
      if (onSelectTool) onSelectTool('select');
      return;
    }

    if (activeTool === 'shape' && onAddShapeNode) {
      onAddShapeNode(Math.round(worldPos.x - 100), Math.round(worldPos.y - 70));
      if (onSelectTool) onSelectTool('select');
      return;
    }

    // 2. Hand / Pan Mode or Middle Click
    if (activeTool === 'hand' || e.button === 1) {
      isPanningRef.current = true;
      startPanRef.current = {
        x: e.clientX,
        y: e.clientY,
        camX: camera.x,
        camY: camera.y,
        hasMoved: false,
      };
      return;
    }

    // 3. Select Mode -> Marquee Box Selection or Canvas Pan
    if (e.button === 0) {
      if (!e.shiftKey) {
        onSelectNode(null);
        onSelectEdge(null);
        if (onSelectNodes) onSelectNodes([]);
      }

      // Start Marquee drag
      setMarquee({
        startX: e.clientX,
        startY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
      });

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
    // 1. Resizing Node
    if (isResizingNodeRef.current && resizeStateRef.current) {
      const { node, direction, startMouseX, startMouseY, startWidth, startHeight, startNodeX, startNodeY } =
        resizeStateRef.current;
      const dx = (e.clientX - startMouseX) / camera.z;
      const dy = (e.clientY - startMouseY) / camera.z;

      let newWidth = startWidth;
      let newHeight = startHeight || 160;
      let newX = startNodeX;
      let newY = startNodeY;

      if (direction.includes('e')) {
        newWidth = Math.max(140, Math.min(850, Math.round(startWidth + dx)));
      }
      if (direction.includes('w')) {
        newWidth = Math.max(140, Math.min(850, Math.round(startWidth - dx)));
        newX = Math.round(startNodeX + (startWidth - newWidth));
      }
      if (direction.includes('s')) {
        newHeight = Math.max(80, Math.min(1000, Math.round((startHeight || 160) + dy)));
      }
      if (direction.includes('n')) {
        newHeight = Math.max(80, Math.min(1000, Math.round((startHeight || 160) - dy)));
        newY = Math.round(startNodeY + ((startHeight || 160) - newHeight));
      }

      onUpdateNode(node.id, {
        width: newWidth,
        height: newHeight,
        x: newX,
        y: newY,
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
      return;
    }

    // 4. Marquee Selection Box Update
    if (marquee) {
      setMarquee(prev => (prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null));
      return;
    }

    // 5. Canvas Panning
    if (isPanningRef.current && (activeTool === 'hand' || startPanRef.current.hasMoved)) {
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
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    // End Resize
    if (isResizingNodeRef.current) {
      isResizingNodeRef.current = false;
      resizeStateRef.current = null;
    }

    // End Node Drag
    if (isDraggingNodeRef.current) {
      isDraggingNodeRef.current = false;
      dragNodeRef.current = null;
    }

    // End Marquee Selection
    if (marquee) {
      const minScreenX = Math.min(marquee.startX, marquee.currentX);
      const maxScreenX = Math.max(marquee.startX, marquee.currentX);
      const minScreenY = Math.min(marquee.startY, marquee.currentY);
      const maxScreenY = Math.max(marquee.startY, marquee.currentY);

      if (maxScreenX - minScreenX > 10 || maxScreenY - minScreenY > 10) {
        const p1 = screenToWorld(minScreenX, minScreenY);
        const p2 = screenToWorld(maxScreenX, maxScreenY);

        const insideNodes = nodes.filter(n => {
          const nw = n.width || 240;
          const nh = n.height || 160;
          return n.x + nw >= p1.x && n.x <= p2.x && n.y + nh >= p1.y && n.y <= p2.y;
        });

        if (insideNodes.length > 0) {
          if (insideNodes.length === 1) {
            onSelectNode(insideNodes[0].id);
          } else {
            onSelectNode(insideNodes[0].id);
            if (onSelectNodes) {
              onSelectNodes(insideNodes.map(n => n.id));
            }
          }
        }
      }
      setMarquee(null);
    }

    // End Pan
    if (isPanningRef.current) {
      isPanningRef.current = false;
    }

    // End Link Drag
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

  // Wheel zoom centered at mouse cursor (attached natively with { passive: false } to prevent browser passive warning)
  const cameraRef = useRef(camera);
  cameraRef.current = camera;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const currentCamera = cameraRef.current;
      const zoomFactor = Math.exp(-e.deltaY * 0.00125);
      const newZoom = Math.max(0.2, Math.min(2.5, currentCamera.z * zoomFactor));

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const newCamX = mouseX - (mouseX - currentCamera.x) * (newZoom / currentCamera.z);
      const newCamY = mouseY - (mouseY - currentCamera.y) * (newZoom / currentCamera.z);

      onUpdateCamera({ x: newCamX, y: newCamY, z: newZoom });
    };

    container.addEventListener('wheel', onNativeWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onNativeWheel);
    };
  }, [onUpdateCamera]);

  // Double click canvas to create note
  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-node-id]')) return;
    const worldPos = screenToWorld(e.clientX, e.clientY);
    onAddNode(Math.round(worldPos.x - 115), Math.round(worldPos.y - 65));
  };

  // Keyboard Shortcuts for Tools & Actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
        if (e.key === 'Escape') (active as HTMLElement).blur();
        return;
      }

      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        onUndo();
        return;
      }

      // Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && !e.shiftKey) {
        if (selectedNodeId && onDuplicateNode) {
          e.preventDefault();
          onDuplicateNode(selectedNodeId);
          return;
        }
      }

      // Select All
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (nodes.length > 0) {
          onSelectNode(nodes[0].id);
          if (onSelectNodes) onSelectNodes(nodes.map(n => n.id));
        }
        return;
      }

      // Tool Switching Keys
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey && onSelectTool) {
        const k = e.key.toLowerCase();
        if (k === 'v') onSelectTool('select');
        else if (k === 'h') onSelectTool('hand');
        else if (k === 'n') onSelectTool('note');
        else if (k === 't') onSelectTool('heading');
        else if (k === 'c') onSelectTool('task');
        else if (k === 'w' || k === 'a') onSelectTool('connector');
        else if (k === 'e') onSelectTool('eraser');
      }

      // Delete Selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          onDeleteNode(selectedNodeId);
          if (onSelectNodes && selectedNodeIds.length > 0) {
            selectedNodeIds.forEach(id => {
              if (id !== selectedNodeId) onDeleteNode(id);
            });
            onSelectNodes([]);
          }
        } else if (selectedEdgeId) {
          onDeleteEdge(selectedEdgeId);
        }
        return;
      }

      // Escape Deselect
      if (e.key === 'Escape') {
        onSelectNode(null);
        onSelectEdge(null);
        if (onSelectNodes) onSelectNodes([]);
        if (onSelectTool) onSelectTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedNodeId,
    selectedNodeIds,
    selectedEdgeId,
    nodes,
    onDeleteNode,
    onDeleteEdge,
    onDuplicateNode,
    onUndo,
    onSelectNode,
    onSelectNodes,
    onSelectEdge,
    onSelectTool,
  ]);

  const seenNodeIds = new Set<string>();
  const uniqueNodes = nodes.filter(node => {
    if (!node || !node.id || seenNodeIds.has(node.id)) return false;
    seenNodeIds.add(node.id);
    return true;
  });

  // Cursor style based on active tool
  const getCanvasCursorClass = () => {
    if (activeTool === 'hand') return 'cursor-grab active:cursor-grabbing';
    if (activeTool === 'eraser') return 'cursor-crosshair';
    if (activeTool === 'note' || activeTool === 'heading' || activeTool === 'task') return 'cursor-cell';
    if (activeTool === 'connector') return 'cursor-crosshair';
    return 'cursor-default';
  };

  return (
    <div
      id="boardify-canvas-viewport"
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      style={{
        backgroundSize: `${26 * camera.z}px ${26 * camera.z}px`,
        backgroundPosition: `${camera.x}px ${camera.y}px`,
      }}
      className={`relative w-full h-full overflow-hidden canvas-grid-bg select-none touch-none ${getCanvasCursorClass()}`}
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
          onSelectEdge={id => {
            if (activeTool === 'eraser' && id) {
              onDeleteEdge(id);
            } else {
              onSelectEdge(id);
            }
          }}
          onUpdateEdge={onUpdateEdge}
          onDeleteEdge={onDeleteEdge}
        />

        {/* Sticky Notes & Elements */}
        {uniqueNodes.map(node => {
          const isNodeSelected = selectedNodeId === node.id || selectedNodeIds.includes(node.id);

          return (
            <StickyNote
              key={node.id}
              node={node}
              isSelected={isNodeSelected}
              isHighlighted={highlightedNodeId === node.id}
              highlightReason={highlightedNodeId === node.id ? highlightReason : undefined}
              onSelect={id => {
                if (activeTool === 'eraser') {
                  onDeleteNode(id);
                  return;
                }
                onSelectNode(id);
              }}
              onUpdate={onUpdateNode}
              onDelete={onDeleteNode}
              onDuplicate={onDuplicateNode}
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
              onResizeStart={(_e, n, direction) => {
                isResizingNodeRef.current = true;
                resizeStateRef.current = {
                  node: n,
                  direction,
                  startMouseX: _e.clientX,
                  startMouseY: _e.clientY,
                  startWidth: n.width || 240,
                  startHeight: n.height || 160,
                  startNodeX: n.x,
                  startNodeY: n.y,
                };
              }}
              onOpenLogoSearch={onOpenLogoSearch}
            />
          );
        })}

        {/* Agent Ghost Cursor */}
        <AgentGhostCursor
          x={agentCursor.x}
          y={agentCursor.y}
          isActive={agentCursor.isActive}
          actionText={agentCursor.actionText}
        />
      </div>

      {/* Marquee Selection Drag Overlay */}
      {marquee && (
        <div
          style={{
            left: `${Math.min(marquee.startX, marquee.currentX)}px`,
            top: `${Math.min(marquee.startY, marquee.currentY)}px`,
            width: `${Math.abs(marquee.currentX - marquee.startX)}px`,
            height: `${Math.abs(marquee.currentY - marquee.startY)}px`,
          }}
          className="absolute border-2 border-dashed border-[#E24E1B] bg-[#E24E1B]/10 rounded-md pointer-events-none z-40 shadow-sm"
        />
      )}

      {/* Empty State Prompt if 0 notes */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center p-6 bg-[#FFFDF6]/90 border-2 border-[#1D1A16] rounded-2xl shadow-[6px_6px_0_#1D1A16] max-w-sm pointer-events-auto">
            <h3 className="font-['Fraunces'] italic font-bold text-xl text-[#1D1A16]">
              Your canvas is fresh and ready.
            </h3>
            <p className="font-['Kalam'] text-sm text-[#6B6353] mt-2">
              Select any tool on the left, double-click to place a note, or open the Agent Studio to generate an architecture diagram!
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
        isStudioOpen={isStudioOpen}
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
