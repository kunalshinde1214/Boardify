'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ToastProvider, useToast } from '@/components/ui/ToastProvider';
import { InfiniteCanvas } from '@/components/canvas/InfiniteCanvas';
import { TopToolbar } from '@/components/canvas/TopToolbar';
import { AgentStudioDrawer } from '@/components/studio/AgentStudioDrawer';
import { ExportModal } from '@/components/canvas/ExportModal';
import { ShareDeployModal } from '@/components/canvas/ShareDeployModal';
import { TemplatesModal } from '@/components/canvas/TemplatesModal';
import { Sparkles } from 'lucide-react';
import { decodeCanvasShareState } from '@/lib/netlify-deploy';
import { AVAILABLE_SIGNS, AVAILABLE_LOGOS } from '@/components/ui/BrandIcons';
import { GILBARBARA_LOGOS } from '@/lib/all-logos-catalog';
import {
  CanvasNode,
  CanvasEdge,
  CanvasCamera,
  CanvasState,
  ToolLogEntry,
  WebMCPToolDef,
  NoteColor,
  NodeType,
  TaskItem,
  generateNodeId,
  generateEdgeId,
} from '@/lib/types';
import {
  DEFAULT_SEED_BOARD,
  saveBoardState,
  loadBoardState,
  subscribeToBoard,
  createBoardFromTemplate,
  listUserBoards,
  createNewBoardRecord,
  updateBoardIndexMeta,
  BoardMetadata,
} from '@/lib/firestore-boards';
import { BOARD_TEMPLATES } from '@/lib/templates-data';
import {
  buildWebMCPTools,
  registerWebMCP,
  WebMCPContextActions,
} from '@/lib/webmcp';
import {
  getBoundingBox,
  getCentroid,
  findFreeSpot,
  calculateSmartFlowTargets,
  calculateClusterTargets,
  calculateTimelineTargets,
  calculateKanbanTargets,
  calculateForceDirectedTargets,
  calculateDeOverlapTargets,
  analyzeBoardHealth,
} from '@/lib/layouts';
import { generateDynamicPlan } from '@/lib/llm-client';
import { X, Layers, Copy, Check, ExternalLink, HelpCircle } from 'lucide-react';
import { LogoSearchModal } from '@/components/canvas/LogoSearchModal';
import { DiagramDslModal } from '@/components/canvas/DiagramDslModal';
import { ProfessionAssetsModal } from '@/components/canvas/ProfessionAssetsModal';
import { ProfessionAssetItem } from '@/lib/profession-assets';
import { LeftToolPalette, CanvasToolType } from '@/components/canvas/LeftToolPalette';
import { CanvasCheckpoint } from '@/lib/webmcp';

function CanvasAppInner() {
  const [boards, setBoards] = useState<BoardMetadata[]>([]);
  const [boardId, setBoardId] = useState('default');
  const [activeBoardTitle, setActiveBoardTitle] = useState('Welcome Canvas');

  const [activeTool, setActiveTool] = useState<CanvasToolType>('select');
  const [nodes, setNodes] = useState<CanvasNode[]>(DEFAULT_SEED_BOARD.nodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(DEFAULT_SEED_BOARD.edges);
  const [seq, setSeq] = useState(DEFAULT_SEED_BOARD.seq);

  const [camera, setCamera] = useState<CanvasCamera>({ x: 0, y: 0, z: 1 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [highlightReason, setHighlightReason] = useState<string | undefined>(undefined);

  const [isStudioOpen, setIsStudioOpen] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShareDeployOpen, setIsShareDeployOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isDiagramDslOpen, setIsDiagramDslOpen] = useState(false);
  const [isProfessionAssetsOpen, setIsProfessionAssetsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLogoSearchOpen, setIsLogoSearchOpen] = useState(false);
  const [logoSearchCategory, setLogoSearchCategory] = useState('all');
  const [logoSearchTargetNodeId, setLogoSearchTargetNodeId] = useState<string | null>(null);

  const [hasWebMCP, setHasWebMCP] = useState(false);
  const [logs, setLogs] = useState<ToolLogEntry[]>([]);
  const [undoStack, setUndoStack] = useState<CanvasState[]>([]);
  const [redoStack, setRedoStack] = useState<CanvasState[]>([]);
  const [checkpoints, setCheckpoints] = useState<Array<CanvasCheckpoint & { nodes: CanvasNode[]; edges: CanvasEdge[] }>>([]);

  const [agentCursor, setAgentCursor] = useState<{
    x: number;
    y: number;
    isActive: boolean;
    actionText?: string;
  }>({ x: 0, y: 0, isActive: false });

  const { showToast } = useToast();
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const edgesRef = useRef(edges);
  edgesRef.current = edges;

  // Load board list on mount
  useEffect(() => {
    const list = listUserBoards();
    setBoards(list);
    if (list.length > 0) {
      setActiveBoardTitle(list.find(b => b.id === boardId)?.title || 'Welcome Canvas');
    }
  }, [boardId]);

  const handleCreateNewBoard = useCallback((title = 'New Strategy Board') => {
    const newId = createNewBoardRecord(title);
    setBoardId(newId);
    setActiveBoardTitle(title);
    setBoards(listUserBoards());
    setNodes([
      {
        id: generateNodeId(),
        title,
        body: 'Start drafting ideas, double-click empty space, or ask Agent Studio to architect a workflow!',
        x: -115,
        y: -70,
        width: 230,
        color: 'butter',
        author: 'human',
        created: Date.now(),
        rot: 0,
        nodeType: 'default',
      },
    ]);
    setEdges([]);
    setSeq(1);
    setUndoStack([]);
    showToast(`Created new canvas: "${title}"`, 'ok');
    return newId;
  }, [showToast]);

  const handleSwitchBoard = useCallback((targetBoardId: string) => {
    setBoardId(targetBoardId);
    const meta = listUserBoards().find(b => b.id === targetBoardId);
    if (meta) setActiveBoardTitle(meta.title);
    showToast(`Switched to "${meta?.title || 'Canvas'}"`, 'info');
  }, [showToast]);

  // Push undo snapshot
  const pushUndo = useCallback(() => {
    setUndoStack(prev => {
      const snap: CanvasState = {
        version: 1,
        seq,
        nodes: nodesRef.current,
        edges: edgesRef.current,
      };
      const updated = [...prev, snap];
      if (updated.length > 50) updated.shift();
      return updated;
    });
  }, [seq]);

  const handleUndo = useCallback(() => {
    if (!undoStack.length) {
      showToast('Nothing left to undo', 'warn');
      return;
    }
    const last = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, prev.length - 1));
    setNodes(last.nodes);
    setEdges(last.edges);
    setSeq(last.seq);
    showToast('Action undone', 'ok');
  }, [undoStack, showToast]);

  // Node CRUD
  const handleAddNode = useCallback(
    (
      x?: number,
      y?: number,
      color: NoteColor = 'butter',
      title = 'Untitled',
      body = '',
      author: 'human' | 'agent' = 'human',
      nodeType: NodeType = 'default',
      extra?: {
        signType?: string;
        logoType?: string;
        stamp?: string;
        tasks?: TaskItem[];
        fields?: any[];
        shapeType?: 'rectangle' | 'circle' | 'diamond' | 'cylinder' | 'hexagon' | 'cloud';
        roleTag?: 'software' | 'product' | 'ai' | 'design' | 'business';
        width?: number;
        height?: number;
        fontSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
        styleVariant?: 'sticky' | 'glass' | 'badge' | 'signpost' | 'banner' | 'clean' | 'neon';
      }
    ) => {
      pushUndo();
      const newId = generateNodeId();
      setSeq(prev => prev + 1);

      let targetX = x;
      let targetY = y;
      if (targetX === undefined || targetY === undefined) {
        const c = getCentroid(nodesRef.current);
        const free = findFreeSpot(nodesRef.current, c.x + 240, c.y);
        targetX = free.x;
        targetY = free.y;
      }

      const newNode: CanvasNode = {
        id: newId,
        title,
        body,
        x: targetX,
        y: targetY,
        width: extra?.width || (nodeType === 'heading' ? 320 : 230),
        color,
        author,
        created: Date.now(),
        rot: ((Math.random() * 6) - 3) * 0.6,
        nodeType,
        ...(extra || {}),
      };

      setNodes(prev => [...prev, newNode]);
      setSelectedNodeId(newId);
      return newNode;
    },
    [pushUndo]
  );

  const handleUpdateNode = useCallback(
    (id: string, updates: Partial<CanvasNode>) => {
      setNodes(prev =>
        prev.map(n => (n.id === id ? { ...n, ...updates } : n))
      );
      return true;
    },
    []
  );

  const fitView = useCallback((animate = true) => {
    const bb = getBoundingBox(nodesRef.current);
    if (!bb) {
      setCamera({ x: 0, y: 0, z: 1 });
      return;
    }

    const padding = 120;
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;

    const scaleX = (w - padding * 2) / (bb.width || 400);
    const scaleY = (h - padding * 2) / (bb.height || 400);
    const targetZ = Math.min(1.4, Math.max(0.35, Math.min(scaleX, scaleY)));

    const centerX = (bb.minX + bb.maxX) / 2;
    const centerY = (bb.minY + bb.maxY) / 2;

    const targetX = w / 2 - centerX * targetZ;
    const targetY = h / 2 - centerY * targetZ;

    setCamera({ x: targetX, y: targetY, z: targetZ });
  }, []);

  const handleDuplicateNode = useCallback(
    (id: string, offset = { x: 40, y: 40 }) => {
      const source = nodesRef.current.find(n => n.id === id);
      if (!source) return null;
      pushUndo();
      const newId = generateNodeId();
      const cloned: CanvasNode = {
        ...source,
        id: newId,
        x: source.x + offset.x,
        y: source.y + offset.y,
        created: Date.now(),
        tasks: source.tasks
          ? source.tasks.map(t => ({ ...t, id: `t_${Math.random().toString(36).slice(2, 7)}` }))
          : undefined,
      };
      setNodes(prev => [...prev, cloned]);
      setSelectedNodeId(newId);
      setSelectedNodeIds([newId]);
      showToast(`Duplicated "${source.title}"`, 'ok');
      return cloned;
    },
    [pushUndo, showToast]
  );

  const handleSelectNodes = useCallback(
    (ids: string[]) => {
      setSelectedNodeIds(ids);
      if (ids.length === 0) {
        setSelectedNodeId(null);
      } else if (!ids.includes(selectedNodeId || '')) {
        setSelectedNodeId(ids[0]);
      }
    },
    [selectedNodeId]
  );

  // Quick insertion helpers for Signs, Logos, Headings, Tasks
  const handleAddSign = useCallback(
    (signId: string) => {
      const meta = AVAILABLE_SIGNS.find(s => s.id === signId) || AVAILABLE_SIGNS[0];
      const c = getCentroid(nodesRef.current);
      const free = findFreeSpot(nodesRef.current, c.x + 240, c.y);
      const newNode = handleAddNode(
        free.x,
        free.y,
        'butter',
        meta.defaultTitle,
        meta.defaultBody,
        'human',
        'sign'
      );
      handleUpdateNode(newNode.id, { signType: meta.id });
      showToast(`Added "${meta.name}" sign sticker`, 'ok');
    },
    [handleAddNode, handleUpdateNode, showToast]
  );

  const handleAddLogo = useCallback(
    (logoId: string) => {
      // 1. Check AVAILABLE_LOGOS
      const builtin = AVAILABLE_LOGOS.find(l => l.id.toLowerCase() === logoId.toLowerCase());
      if (builtin) {
        const c = getCentroid(nodesRef.current);
        const free = findFreeSpot(nodesRef.current, c.x + 240, c.y);
        handleAddNode(
          free.x,
          free.y,
          'slate',
          builtin.name,
          builtin.defaultBody,
          'human',
          'logo',
          { logoType: builtin.id }
        );
        showToast(`Added "${builtin.name}" vector logo icon`, 'ok');
        return;
      }

      // 2. Check Gilbarbara catalog
      const cleanId = logoId.replace(/^gil-/, '').toLowerCase();
      const gil = GILBARBARA_LOGOS.find(
        g => g.id.toLowerCase() === cleanId || `gil-${g.id.toLowerCase()}` === logoId.toLowerCase()
      );
      if (gil) {
        const c = getCentroid(nodesRef.current);
        const free = findFreeSpot(nodesRef.current, c.x + 240, c.y);
        handleAddNode(
          free.x,
          free.y,
          'slate',
          gil.name,
          `${gil.name} (${gil.cat})`,
          'human',
          'logo',
          { logoType: `gil-${gil.id}` }
        );
        showToast(`Added "${gil.name}" vector logo icon`, 'ok');
        return;
      }

      // 3. Fallback
      const c = getCentroid(nodesRef.current);
      const free = findFreeSpot(nodesRef.current, c.x + 240, c.y);
      handleAddNode(
        free.x,
        free.y,
        'slate',
        logoId,
        '',
        'human',
        'logo',
        { logoType: logoId }
      );
      showToast(`Added "${logoId}" logo`, 'ok');
    },
    [handleAddNode, showToast]
  );

  const handleOpenLogoSearch = useCallback((category = 'all', targetNodeId?: string) => {
    setLogoSearchCategory(category);
    setLogoSearchTargetNodeId(targetNodeId || null);
    setIsLogoSearchOpen(true);
  }, []);

  const handleSelectLogoFromSearch = useCallback(
    (logoId: string) => {
      if (logoSearchTargetNodeId) {
        const builtin = AVAILABLE_LOGOS.find(l => l.id.toLowerCase() === logoId.toLowerCase());
        const cleanId = logoId.replace(/^gil-/, '').toLowerCase();
        const gil = GILBARBARA_LOGOS.find(
          g => g.id.toLowerCase() === cleanId || `gil-${g.id.toLowerCase()}` === logoId.toLowerCase()
        );
        const name = builtin?.name || gil?.name || logoId;
        const body = builtin?.defaultBody || (gil ? `${gil.name} (${gil.cat})` : '');
        const finalLogoType = builtin ? builtin.id : gil ? `gil-${gil.id}` : logoId;

        handleUpdateNode(logoSearchTargetNodeId, {
          logoType: finalLogoType,
          nodeType: 'logo',
          title: name,
          body,
        });
        showToast(`Updated node logo to "${name}"`, 'ok');
      } else {
        handleAddLogo(logoId);
      }
      setIsLogoSearchOpen(false);
    },
    [logoSearchTargetNodeId, handleUpdateNode, handleAddLogo, showToast]
  );

  const handleSelectSignFromSearch = useCallback(
    (signId: string) => {
      const meta = AVAILABLE_SIGNS.find(s => s.id === signId) || AVAILABLE_SIGNS[0];
      if (logoSearchTargetNodeId) {
        handleUpdateNode(logoSearchTargetNodeId, {
          signType: meta.id,
          nodeType: 'sign',
          title: meta.defaultTitle,
          body: meta.defaultBody,
        });
        showToast(`Updated node sign to "${meta.name}"`, 'ok');
      } else {
        handleAddSign(signId);
      }
      setIsLogoSearchOpen(false);
    },
    [logoSearchTargetNodeId, handleUpdateNode, handleAddSign, showToast]
  );

  const handleOpenDiagramDsl = useCallback(() => {
    setIsDiagramDslOpen(true);
  }, []);

  const handleApplyDiagram = useCallback(
    (newNodes: CanvasNode[], newEdges: CanvasEdge[], append: boolean) => {
      pushUndo();
      if (append) {
        setNodes(prev => [...prev, ...newNodes]);
        setEdges(prev => [...prev, ...newEdges]);
        showToast(`Appended ${newNodes.length} nodes and ${newEdges.length} connections from DSL`, 'ok');
      } else {
        setNodes(newNodes);
        setEdges(newEdges);
        showToast(`Rendered ${newNodes.length} nodes and ${newEdges.length} connections from DSL`, 'ok');
      }
      setTimeout(() => fitView(true), 300);
    },
    [pushUndo, fitView, showToast]
  );

  const handleCreateCheckpoint = useCallback(
    (name = 'Checkpoint') => {
      const cp = {
        id: 'cp-' + Date.now(),
        name,
        timestamp: Date.now(),
        nodeCount: nodesRef.current.length,
        edgeCount: edgesRef.current.length,
        nodes: [...nodesRef.current],
        edges: [...edgesRef.current],
      };
      setCheckpoints(prev => [cp, ...prev.slice(0, 19)]);
      showToast(`Saved milestone checkpoint: "${name}"`, 'ok');
      return cp;
    },
    [showToast]
  );

  const handleRestoreCheckpoint = useCallback(
    (idOrName: string) => {
      const target = idOrName.toLowerCase().trim();
      const match = checkpoints.find(
        c => c.id.toLowerCase() === target || c.name.toLowerCase() === target || c.name.toLowerCase().includes(target)
      );
      if (!match) return false;
      pushUndo();
      setNodes([...match.nodes]);
      setEdges([...match.edges]);
      showToast(`Restored canvas checkpoint: "${match.name}"`, 'ok');
      setTimeout(() => fitView(true), 300);
      return true;
    },
    [checkpoints, pushUndo, fitView, showToast]
  );

  const handleListCheckpoints = useCallback(() => {
    return checkpoints.map(c => ({
      id: c.id,
      name: c.name,
      timestamp: c.timestamp,
      nodeCount: c.nodeCount,
      edgeCount: c.edgeCount,
    }));
  }, [checkpoints]);

  const handleCaptureScreenshot = useCallback(async (): Promise<string | null> => {
    try {
      const svgElements = document.querySelectorAll('svg');
      if (svgElements.length > 0) {
        showToast('Visual canvas state snapshot captured for AI vision inspection', 'ok');
        return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"></svg>';
      }
      return null;
    } catch (_) {
      return null;
    }
  }, [showToast]);

  // Global Keyboard Shortcuts: Ctrl/Cmd + L (Logos), Ctrl/Cmd + Shift + D (Diagram DSL)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleOpenDiagramDsl();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        handleOpenLogoSearch();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleOpenLogoSearch, handleOpenDiagramDsl]);

  const handleAddHeading = useCallback(() => {
    const c = getCentroid(nodesRef.current);
    const free = findFreeSpot(nodesRef.current, c.x + 240, c.y);
    handleAddNode(
      free.x,
      free.y,
      'slate',
      'Architecture & Service Mesh',
      'Core subsystem components & pipeline milestones',
      'human',
      'heading'
    );
    showToast('Added Section Header banner', 'ok');
  }, [handleAddNode, showToast]);

  const handleAddTaskNote = useCallback(() => {
    const c = getCentroid(nodesRef.current);
    const free = findFreeSpot(nodesRef.current, c.x + 240, c.y);
    const n = handleAddNode(
      free.x,
      free.y,
      'mint',
      'Sprint Action Items',
      'Check off items as completed:',
      'human',
      'task'
    );
    handleUpdateNode(n.id, {
      tasks: [
        { id: '1', text: 'Deploy canvas bundle to Netlify', done: true },
        { id: '2', text: 'Connect WebMCP tool endpoints', done: false },
        { id: '3', text: 'Verify cross-browser responsive layout', done: false },
      ],
    });
    showToast('Added Task Checklist', 'ok');
  }, [handleAddNode, handleUpdateNode, showToast]);

  const handleAddEntityTable = useCallback(
    (x?: number, y?: number, tableName = 'users') => {
      const c = getCentroid(nodesRef.current);
      const posX = x ?? Math.round(c.x + 240);
      const posY = y ?? Math.round(c.y);
      const free = x !== undefined && y !== undefined ? { x: posX, y: posY } : findFreeSpot(nodesRef.current, posX, posY, 260, 200);
      const node = handleAddNode(
        free.x,
        free.y,
        'slate',
        tableName,
        'Relational Entity Table',
        'human',
        'entity',
        {
          fields: [
            { id: 'f1', name: 'id', type: 'UUID', isPrimaryKey: true },
            { id: 'f2', name: 'email', type: 'VARCHAR(255)', isNullable: false },
            { id: 'f3', name: 'created_at', type: 'TIMESTAMP' },
          ],
          width: 260,
        }
      );
      showToast(`Added ER Table "${tableName}"`, 'ok');
      return node;
    },
    [handleAddNode, showToast]
  );

  const handleAddShapeNode = useCallback(
    (x?: number, y?: number, shapeType = 'diamond', name = 'Decision') => {
      const c = getCentroid(nodesRef.current);
      const posX = x ?? Math.round(c.x + 240);
      const posY = y ?? Math.round(c.y);
      const free = x !== undefined && y !== undefined ? { x: posX, y: posY } : findFreeSpot(nodesRef.current, posX, posY, 200, 140);
      const nodeType = `shape_${shapeType}` as NodeType;
      const colorMap: Record<string, NoteColor> = {
        diamond: 'coral',
        cylinder: 'slate',
        hexagon: 'mint',
        circle: 'lavender',
        cloud: 'sage',
        rectangle: 'butter',
      };
      const node = handleAddNode(
        free.x,
        free.y,
        colorMap[shapeType] || 'butter',
        name,
        'Flowchart / Process Node',
        'human',
        nodeType,
        { shapeType: shapeType as any, width: shapeType === 'diamond' ? 180 : 200 }
      );
      showToast(`Added ${name} Shape`, 'ok');
      return node;
    },
    [handleAddNode, showToast]
  );

  const handleInsertProfessionAsset = useCallback(
    (asset: ProfessionAssetItem) => {
      const c = getCentroid(nodesRef.current);
      const free = findFreeSpot(nodesRef.current, c.x + 240, c.y, asset.width || 230, asset.height || 160);
      handleAddNode(
        free.x,
        free.y,
        asset.color,
        asset.defaultTitle,
        asset.defaultBody,
        'human',
        asset.nodeType,
        {
          logoType: asset.logoType,
          signType: asset.signType,
          shapeType: asset.shapeType,
          stamp: asset.stamp,
          tasks: asset.tasks,
          fields: asset.fields,
          width: asset.width,
          height: asset.height,
        }
      );
      showToast(`Added "${asset.name}" asset`, 'ok');
    },
    [handleAddNode, showToast]
  );

  const handleDeleteNode = useCallback(
    (id: string) => {
      pushUndo();
      setNodes(prev => prev.filter(n => n.id !== id));
      setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
      if (selectedNodeId === id) setSelectedNodeId(null);
      showToast('Note removed', 'info');
      return true;
    },
    [selectedNodeId, pushUndo, showToast]
  );

  const handleConnectNodes = useCallback(
    (sourceId: string, targetId: string, label = '') => {
      if (sourceId === targetId) return null;
      const exists = edgesRef.current.some(
        e => (e.from === sourceId && e.to === targetId) || (e.from === targetId && e.to === sourceId)
      );
      if (exists) return null;

      pushUndo();
      const newEdgeId = generateEdgeId();
      setSeq(prev => prev + 1);

      const newEdge: CanvasEdge = {
        id: newEdgeId,
        from: sourceId,
        to: targetId,
        label,
      };

      setEdges(prev => [...prev, newEdge]);
      return newEdge;
    },
    [pushUndo]
  );

  const handleUpdateEdge = useCallback((id: string, updates: Partial<CanvasEdge>) => {
    setEdges(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)));
  }, []);

  const handleDeleteEdge = useCallback(
    (id: string) => {
      pushUndo();
      setEdges(prev => prev.filter(e => e.id !== id));
      if (selectedEdgeId === id) setSelectedEdgeId(null);
      showToast('Wire removed', 'info');
    },
    [selectedEdgeId, pushUndo, showToast]
  );

  const handleClearCanvas = useCallback(() => {
    pushUndo();
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    showToast('Canvas cleared', 'warn');
  }, [pushUndo, showToast]);

  const highlightNode = useCallback((id: string, reason?: string) => {
    setHighlightedNodeId(id);
    setHighlightReason(reason);

    const target = nodesRef.current.find(n => n.id === id);
    if (target) {
      const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const h = typeof window !== 'undefined' ? window.innerHeight : 800;
      setCamera(prev => ({
        ...prev,
        x: w / 2 - target.x * prev.z,
        y: h / 2 - target.y * prev.z,
      }));
    }

    setTimeout(() => {
      setHighlightedNodeId(null);
      setHighlightReason(undefined);
    }, 3500);
  }, []);

  const animateLayout = useCallback((targets: Map<string, { x: number; y: number }>) => {
    pushUndo();
    setNodes(prev =>
      prev.map(n => {
        const t = targets.get(n.id);
        if (t) return { ...n, x: t.x, y: t.y };
        return n;
      })
    );
    setTimeout(() => fitView(true), 400);
  }, [pushUndo, fitView]);

  const addLogEntry = useCallback((entry: Omit<ToolLogEntry, 'id' | 'timestamp'>) => {
    const item: ToolLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toTimeString().slice(0, 8),
      ...entry,
    };
    setLogs(prev => [item, ...prev].slice(0, 100));
  }, []);

  // WebMCP Action Bridge
  const webmcpActions: WebMCPContextActions = {
    getNodes: () => nodesRef.current,
    getEdges: () => edgesRef.current,
    addNode: n =>
      handleAddNode(
        n.x,
        n.y,
        n.color,
        n.title,
        n.body,
        n.author,
        n.nodeType || 'default',
        {
          signType: n.signType,
          logoType: n.logoType,
          stamp: n.stamp,
          tasks: n.tasks,
          width: n.width,
          fontSize: n.fontSize,
          styleVariant: n.styleVariant,
        }
      ),
    addNodesAndEdges: (newNodes, newEdges, append) => handleApplyDiagram(newNodes, newEdges, append),
    updateNode: (id, u) => handleUpdateNode(id, u),
    deleteNode: id => handleDeleteNode(id),
    connectNodes: (src, tgt, lbl) => handleConnectNodes(src, tgt, lbl),
    animateLayout: targets => animateLayout(targets),
    highlightNode: (id, reason) => highlightNode(id, reason),
    clearCanvas: () => handleClearCanvas(),
    createNewBoard: title => handleCreateNewBoard(title),
    addLog: entry => addLogEntry(entry),
    createCheckpoint: name => handleCreateCheckpoint(name),
    restoreCheckpoint: target => handleRestoreCheckpoint(target),
    listCheckpoints: () => handleListCheckpoints(),
    undo: () => {
      handleUndo();
      return true;
    },
    captureScreenshot: () => handleCaptureScreenshot(),
    selectNodes: ids => handleSelectNodes(ids),
    duplicateNode: (id, offset) => handleDuplicateNode(id, offset),
  };

  const tools = buildWebMCPTools(webmcpActions);

  // Initialize board from storage / Firestore & register WebMCP
  useEffect(() => {
    let active = true;
    loadBoardState(boardId).then(state => {
      if (active && state) {
        setNodes(state.nodes);
        setEdges(state.edges);
        setSeq(state.seq);
        setTimeout(() => fitView(false), 200);
      }
    });

    const unsub = subscribeToBoard(boardId, newState => {
      if (active && newState) {
        setNodes(newState.nodes);
        setEdges(newState.edges);
      }
    });

    // Try registering on document.modelContext
    const registered = registerWebMCP(tools);
    setHasWebMCP(registered);

    // Hydrate shared canvas state from URL hash if present
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && (hash.startsWith('#share=') || hash.length > 20)) {
        const decoded = decodeCanvasShareState(hash);
        if (decoded && decoded.nodes.length > 0) {
          setNodes(decoded.nodes);
          setEdges(decoded.edges);
          if (decoded.title) setActiveBoardTitle(decoded.title);
          showToast(`Loaded shared canvas: "${decoded.title || 'Shared Canvas'}"`, 'ok');
          setTimeout(() => fitView(true), 400);
        }
      }
    }

    return () => {
      active = false;
      unsub();
    };
  }, [boardId]);

  // Auto save on change & update board index
  useEffect(() => {
    const timer = setTimeout(() => {
      saveBoardState(boardId, {
        version: 1,
        seq,
        nodes,
        edges,
      });
      updateBoardIndexMeta(boardId, activeBoardTitle, nodes.length);
      setBoards(listUserBoards());
    }, 600);
    return () => clearTimeout(timer);
  }, [nodes, edges, seq, boardId, activeBoardTitle]);

  // Quick mission runners
  const runMission = async (missionId: string) => {
    const activeNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];
    addLogEntry({ toolName: `mission:${missionId}`, input: { target_node: activeNode?.id }, source: 'ui' });

    if (missionId === 'expand') {
      if (!activeNode) {
        showToast('Please create or select a note first to expand!', 'warn');
        return;
      }
      showToast(`Agent expanding "${activeNode.title.slice(0, 24)}..."`, 'info');
      const branches = [
        { title: 'Market & Customer Signals', body: 'Early adopters seeking automation without sacrificing editorial control.' },
        { title: 'Core Competitive Moat', body: 'Direct WebMCP native integration vs generic chat wrapper add-ons.' },
        { title: 'Execution Roadmap', body: 'Ship Chrome flags test environment, sample prompts, and live video demo.' },
        { title: 'Compounding Loops', body: 'Public canvas sharing drives organic peer invites and GitHub stars.' },
      ];

      const startX = activeNode.x + (activeNode.width || 230) + 140;
      let startY = activeNode.y - 180;

      for (let i = 0; i < branches.length; i++) {
        const b = branches[i];
        const colors: NoteColor[] = ['slate', 'butter', 'sage', 'mint'];
        const created = handleAddNode(startX, startY, colors[i % colors.length], b.title, b.body, 'agent');
        handleConnectNodes(activeNode.id, created.id, 'branch');
        startY += 150;
      }
      showToast('Added 4 strategic branches', 'ok');
      setTimeout(() => fitView(true), 300);
    } else if (missionId === 'pros_cons') {
      if (!activeNode) {
        showToast('Select a note to weigh pros & cons!', 'warn');
        return;
      }
      showToast(`Agent weighing pros & cons for "${activeNode.title.slice(0, 20)}..."`, 'info');
      const pros = [
        { title: 'Pro: Zero Friction Discovery', body: 'Agents find tools instantly via document.modelContext.' },
        { title: 'Pro: High Conversion Potential', body: 'Users instantly see value when whiteboard populates.' },
      ];
      const cons = [
        { title: 'Con: Ecosystem Maturation', body: 'Requires WebMCP browser standard adoption.' },
        { title: 'Con: Canvas Complexity', body: 'Must maintain clear layout algorithms as node count grows.' },
      ];

      const X = activeNode.x + (activeNode.width || 230) + 140;
      pros.forEach((p, idx) => {
        const n = handleAddNode(X, activeNode.y - 120 + idx * 140, 'sage', p.title, p.body, 'agent');
        handleConnectNodes(activeNode.id, n.id, 'pro');
      });
      cons.forEach((c, idx) => {
        const n = handleAddNode(X, activeNode.y + 180 + idx * 140, 'coral', c.title, c.body, 'agent');
        handleConnectNodes(activeNode.id, n.id, 'con');
      });
      showToast('Pros and cons mapped', 'ok');
      setTimeout(() => fitView(true), 300);
    } else if (missionId === 'critique') {
      if (!nodes.length) {
        showToast('Board is empty — nothing to critique', 'warn');
        return;
      }
      const linkedIds = new Set<string>();
      edges.forEach(e => {
        linkedIds.add(e.from);
        linkedIds.add(e.to);
      });
      const orphans = nodes.filter(n => !linkedIds.has(n.id));

      const reviewBody = `• Total notes: ${nodes.length} (${nodes.filter(n => n.author === 'human').length} human, ${nodes.filter(n => n.author === 'agent').length} agent)\n• Total links: ${edges.length}\n• Structure health: ${orphans.length === 0 ? 'Well-connected graph!' : `${orphans.length} unconnected notes found.`}\n• Recommendation: Use "Tidy" to align columns.`;

      const bb = getBoundingBox(nodes);
      const reviewNode = handleAddNode(bb ? bb.minX : 0, bb ? bb.maxY + 100 : 200, 'slate', 'Agent Strategic Review', reviewBody, 'agent');
      highlightNode(reviewNode.id, 'Agent posted canvas critique');
      showToast('Agent review posted to board', 'ok');
    } else if (missionId === 'swot') {
      showToast('Generating 4-quadrant SWOT matrix...', 'info');
      const quadrants = [
        { title: 'STRENGTHS', body: 'Native WebMCP standard, zero roundtrip latency, delightful tactile aesthetic.', color: 'sage' as NoteColor, x: -280, y: -160 },
        { title: 'WEAKNESSES', body: 'Early stage browser flag requirements for standard desktop users.', color: 'coral' as NoteColor, x: 80, y: -160 },
        { title: 'OPPORTUNITIES', body: 'OpenAI and Chrome pushing WebMCP; standardizing browser agent tools.', color: 'mint' as NoteColor, x: -280, y: 120 },
        { title: 'THREATS', body: 'Legacy whiteboards adding basic sidebars without deep spatial tool exposure.', color: 'butter' as NoteColor, x: 80, y: 120 },
      ];
      quadrants.forEach(q => {
        handleAddNode(q.x, q.y, q.color, q.title, q.body, 'agent');
      });
      showToast('SWOT Matrix created', 'ok');
      setTimeout(() => fitView(true), 300);
    } else if (missionId === 'tidy') {
      animateLayout(calculateClusterTargets(nodes, edges));
      showToast('Tidied into clusters', 'ok');
    } else if (missionId === 'timeline') {
      animateLayout(calculateTimelineTargets(nodes));
      showToast('Arranged into timeline', 'ok');
    }
  };

  // Compute real-time graph health report
  const healthReport = React.useMemo(() => analyzeBoardHealth(nodes, edges), [nodes, edges]);

  // Dynamic LLM & Freeform prompt interpreter
  const runPrompt = async (rawPrompt: string) => {
    const q = rawPrompt.toLowerCase().trim();
    addLogEntry({ toolName: 'freeform_prompt', input: { query: rawPrompt }, source: 'ui' });

    if (/tidy|cluster|clean/i.test(q)) {
      animateLayout(calculateForceDirectedTargets(nodes, edges));
      showToast('Untangled canvas layout', 'ok');
      return;
    }
    if (/timeline|sequence/i.test(q)) {
      animateLayout(calculateTimelineTargets(nodes));
      showToast('Arranged into timeline', 'ok');
      return;
    }
    if (/export/i.test(q)) {
      setIsExportOpen(true);
      return;
    }
    if (/clear|wipe/i.test(q)) {
      handleClearCanvas();
      return;
    }

    showToast(`AI agent architecting: "${rawPrompt.slice(0, 30)}..."`, 'info');
    setAgentCursor({
      x: camera.x + 200,
      y: camera.y + 100,
      isActive: true,
      actionText: 'Generating strategic layout...',
    });

    try {
      const plan = await generateDynamicPlan(rawPrompt, nodes);
      pushUndo();

      const centroid = getCentroid(nodes);
      let spawnX = centroid.x + 260;
      let spawnY = centroid.y - 120;

      const createdNodeMap = new Map<string, string>(); // title -> newId

      plan.nodes.forEach((item, idx) => {
        const free = findFreeSpot(nodesRef.current, spawnX, spawnY);
        const node = handleAddNode(
          free.x,
          free.y,
          item.color || 'butter',
          item.title,
          item.body,
          'agent',
          item.nodeType || 'default',
          {
            signType: item.signType,
            logoType: item.logoType,
            stamp: item.stamp,
            fields: item.fields,
            shapeType: item.shapeType,
            tasks: item.tasks
              ? item.tasks.map((t, i) => ({
                  id: `task_${Date.now()}_${i}`,
                  text: t.text,
                  done: Boolean(t.done),
                }))
              : undefined,
          }
        );
        createdNodeMap.set(item.title.toLowerCase().trim(), node.id);

        const toolName =
          item.nodeType === 'table'
            ? 'add_entity_table'
            : item.nodeType === 'logo'
            ? 'add_logo_node'
            : item.nodeType === 'shape'
            ? 'add_shape_node'
            : 'add_idea_node';

        addLogEntry({
          toolName,
          input: { title: item.title, color: item.color, nodeType: item.nodeType, fields: item.fields },
          output: { id: node.id, x: free.x, y: free.y },
          source: 'agent',
        });

        spawnY += 150;
      });

      // Connect links
      plan.links.forEach(link => {
        const srcId = createdNodeMap.get(link.sourceTitle.toLowerCase().trim());
        const tgtId = createdNodeMap.get(link.targetTitle.toLowerCase().trim());
        if (srcId && tgtId) {
          const edge = handleConnectNodes(srcId, tgtId, link.label);
          if (edge) {
            addLogEntry({
              toolName: 'connect_nodes',
              input: { source_id: srcId, target_id: tgtId, label: link.label },
              output: { link_id: edge.id },
              source: 'agent',
            });
          }
        }
      });

      if (plan._error) {
        showToast(`AI Key Notice: ${plan._error}. Used smart local synthesis.`, 'warn');
      } else if (plan._providerUsed === 'gemini') {
        showToast(`✨ Generated with Google Gemini: ${plan.summary}`, 'ok');
      } else if (plan._providerUsed === 'openai') {
        showToast(`✨ Generated with OpenAI: ${plan.summary}`, 'ok');
      } else {
        showToast(plan.summary || `Added ${plan.nodes.length} notes and connected wires`, 'ok');
      }
      setTimeout(() => {
        animateLayout(calculateSmartFlowTargets(nodesRef.current, edgesRef.current));
      }, 300);
    } catch (err) {
      showToast('Failed to generate plan, please try again.', 'warn');
    } finally {
      setAgentCursor(prev => ({ ...prev, isActive: false }));
    }
  };

  const handleSelectTemplate = useCallback(
    (tmplId: string, mode: 'replace' | 'insert' = 'replace') => {
      const tmpl = BOARD_TEMPLATES.find(t => t.id === tmplId);
      if (!tmpl) return;
      pushUndo();

      if (mode === 'insert' && nodesRef.current.length > 0) {
        // Insert mode: calculate centroid and offset to free spot
        const c = getCentroid(nodesRef.current);
        const free = findFreeSpot(nodesRef.current, c.x + 400, c.y);
        const offset = { x: free.x - (tmpl.nodes[0]?.x || 0), y: free.y - (tmpl.nodes[0]?.y || 0) };
        const hydrated = createBoardFromTemplate(tmpl, offset);

        setNodes(prev => [...prev, ...hydrated.nodes]);
        setEdges(prev => [...prev, ...hydrated.edges]);
        setSeq(prev => prev + hydrated.nodes.length + hydrated.edges.length);
        showToast(`Inserted "${tmpl.title}" (${hydrated.nodes.length} nodes) into canvas!`, 'ok');
      } else {
        // Replace mode: clean board
        const hydrated = createBoardFromTemplate(tmpl);
        setNodes(hydrated.nodes);
        setEdges(hydrated.edges);
        setSeq(hydrated.seq);
        showToast(`Loaded "${tmpl.title}" template!`, 'ok');
        setTimeout(() => fitView(true), 300);
      }
      setIsTemplatesOpen(false);
    },
    [pushUndo, showToast, fitView]
  );

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#F4EFE4]">
      {/* Global Navbar */}
      <Navbar />

      {/* Main Canvas Workspace */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {/* Left Tool Palette (Eraser & Excalidraw Style) */}
        <LeftToolPalette
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          onOpenLogoSearch={() => setIsLogoSearchOpen(true)}
          onOpenDiagramDsl={handleOpenDiagramDsl}
          onOpenProfessionAssets={() => setIsProfessionAssetsOpen(true)}
          onToggleStudio={() => setIsStudioOpen(!isStudioOpen)}
          isStudioOpen={isStudioOpen}
          selectedCount={selectedNodeIds.length || (selectedNodeId ? 1 : 0)}
        />

        <InfiniteCanvas
          nodes={nodes}
          edges={edges}
          camera={camera}
          activeTool={activeTool}
          selectedNodeId={selectedNodeId}
          selectedNodeIds={selectedNodeIds}
          selectedEdgeId={selectedEdgeId}
          highlightedNodeId={highlightedNodeId}
          highlightReason={highlightReason}
          agentCursor={agentCursor}
          isStudioOpen={isStudioOpen}
          onUpdateCamera={setCamera}
          onSelectNode={setSelectedNodeId}
          onSelectNodes={handleSelectNodes}
          onSelectEdge={setSelectedEdgeId}
          onSelectTool={setActiveTool}
          onAddNode={(x, y) => handleAddNode(x, y)}
          onAddHeading={(x, y) =>
            handleAddNode(
              x,
              y,
              'slate',
              'Architecture & Service Mesh',
              'Core subsystem components & pipeline milestones',
              'human',
              'heading'
            )
          }
          onAddTaskNote={(x, y) =>
            handleAddNode(
              x,
              y,
              'mint',
              'Sprint Action Items',
              'Check off items as completed:',
              'human',
              'task',
              {
                tasks: [
                  { id: '1', text: 'Deploy canvas bundle to Netlify', done: true },
                  { id: '2', text: 'Connect WebMCP tool endpoints', done: false },
                  { id: '3', text: 'Verify responsive selector & resize tools', done: false },
                ],
              }
            )
          }
          onAddEntityTable={handleAddEntityTable}
          onAddShapeNode={handleAddShapeNode}
          onDuplicateNode={handleDuplicateNode}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          onConnectNodes={handleConnectNodes}
          onUpdateEdge={handleUpdateEdge}
          onDeleteEdge={handleDeleteEdge}
          onUndo={handleUndo}
          onOpenLogoSearch={handleOpenLogoSearch}
        />

        {/* Top Action Toolbar */}
        <TopToolbar
          zoomLevel={camera.z}
          canUndo={undoStack.length > 0}
          isStudioOpen={isStudioOpen}
          healthScore={healthReport.score}
          boards={boards}
          activeBoardId={boardId}
          activeBoardTitle={activeBoardTitle}
          onAddNote={() => handleAddNode()}
          onAddSign={handleAddSign}
          onAddLogo={handleAddLogo}
          onAddHeading={handleAddHeading}
          onAddTaskNote={handleAddTaskNote}
          onOpenLogoSearch={handleOpenLogoSearch}
          onSmartArrange={() => {
            setIsStudioOpen(false);
            animateLayout(calculateSmartFlowTargets(nodes, edges));
            showToast('Arranged into smart hierarchical flow', 'ok');
          }}
          onDeOverlap={() => {
            setIsStudioOpen(false);
            animateLayout(calculateDeOverlapTargets(nodes));
            showToast('De-overlapped & spaced out all canvas notes', 'ok');
          }}
          onTidyForceDirected={() => {
            setIsStudioOpen(false);
            animateLayout(calculateForceDirectedTargets(nodes, edges));
            showToast('Untangled canvas with physics layout', 'ok');
          }}
          onTidyClusters={() => {
            setIsStudioOpen(false);
            animateLayout(calculateClusterTargets(nodes, edges));
            showToast('Tidied into clusters', 'ok');
          }}
          onTidyTimeline={() => {
            setIsStudioOpen(false);
            animateLayout(calculateTimelineTargets(nodes));
            showToast('Arranged by creation timeline', 'ok');
          }}
          onTidyKanban={() => {
            setIsStudioOpen(false);
            animateLayout(calculateKanbanTargets(nodes));
            showToast('Arranged by color categories', 'ok');
          }}
          onFitView={() => fitView(true)}
          onZoomIn={() => setCamera(prev => ({ ...prev, z: Math.min(2.5, prev.z * 1.2) }))}
          onZoomOut={() => setCamera(prev => ({ ...prev, z: Math.max(0.25, prev.z * 0.8) }))}
          onUndo={handleUndo}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
          onOpenDiagramDsl={handleOpenDiagramDsl}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenShareDeploy={() => setIsShareDeployOpen(true)}
          onClearCanvas={handleClearCanvas}
          onOpenHelp={() => setIsHelpOpen(true)}
          onToggleStudio={() => setIsStudioOpen(!isStudioOpen)}
          onOpenHealth={() => setIsStudioOpen(true)}
          onCreateNewBoard={() => handleCreateNewBoard()}
          onSwitchBoard={handleSwitchBoard}
        />

        {/* Dedicated Floating AI Agent Studio Button - Beautifully positioned below the Action Bar */}
        <div className="absolute top-[60px] left-1/2 -translate-x-1/2 z-40 animate-note-pop select-none">
          <button
            onClick={() => setIsStudioOpen(!isStudioOpen)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 border-[#1D1A16] shadow-[3px_3px_0_#1D1A16] transition-all duration-200 cursor-pointer text-xs font-bold ${
              isStudioOpen
                ? 'bg-[#E24E1B] text-white shadow-[1px_1px_0_#1D1A16] translate-x-[1px] translate-y-[1px]'
                : 'bg-[#FFFDF6] text-[#1D1A16] hover:bg-[#FFE9A8] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#1D1A16]'
            }`}
            title="Toggle Agent Studio (Ctrl+Space)"
          >
            <div className="relative flex items-center justify-center">
              <Sparkles className={`w-3.5 h-3.5 ${isStudioOpen ? 'text-amber-300 animate-spin' : 'text-[#E24E1B]'}`} />
              <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border border-[#1D1A16] ${hasWebMCP ? 'bg-emerald-500 animate-pulse' : 'bg-[#E24E1B]'}`} />
            </div>
            <span className="font-['Space_Grotesk'] font-bold tracking-wide">AI Agent Studio</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border ${
              isStudioOpen
                ? 'bg-white/20 border-white/30 text-white'
                : 'bg-[#1D1A16]/5 border-[#1D1A16]/10 text-[#6B6353]'
            }`}>
              {hasWebMCP ? 'WebMCP Active' : 'Ctrl+Space'}
            </span>
          </button>
        </div>

        {/* Agent Studio Drawer */}
        <AgentStudioDrawer
          isOpen={isStudioOpen}
          hasWebMCP={hasWebMCP}
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          tools={tools}
          logs={logs}
          healthReport={healthReport}
          onClose={() => setIsStudioOpen(false)}
          onRunMission={runMission}
          onRunPrompt={runPrompt}
          onAutoTidy={() => {
            setIsStudioOpen(false);
            animateLayout(calculateForceDirectedTargets(nodes, edges));
            showToast('Untangled canvas layout', 'ok');
          }}
          onHighlightNode={highlightNode}
          onClearLogs={() => setLogs([])}
        />

        {/* Architecture Logo & Sign Search Modal */}
        <LogoSearchModal
          isOpen={isLogoSearchOpen}
          onClose={() => setIsLogoSearchOpen(false)}
          onSelectLogo={handleSelectLogoFromSearch}
          onSelectSign={handleSelectSignFromSearch}
          initialCategory={logoSearchCategory}
        />

        {/* Diagram-as-Code (Eraser + Mermaid DSL) Modal */}
        <DiagramDslModal
          isOpen={isDiagramDslOpen}
          onClose={() => setIsDiagramDslOpen(false)}
          onApplyDiagram={handleApplyDiagram}
          currentNodes={nodes}
          currentEdges={edges}
        />

        {/* Profession Assets & Roles Studio Modal */}
        <ProfessionAssetsModal
          isOpen={isProfessionAssetsOpen}
          onClose={() => setIsProfessionAssetsOpen(false)}
          onInsertAsset={handleInsertProfessionAsset}
          onInsertShape={(shape, name) => handleAddShapeNode(undefined, undefined, shape, name)}
          onInsertEntityTable={tableName => handleAddEntityTable(undefined, undefined, tableName)}
        />

        {/* Export Modal */}
        <ExportModal
          isOpen={isExportOpen}
          nodes={nodes}
          edges={edges}
          onClose={() => setIsExportOpen(false)}
          onOpenNetlifyDeploy={() => setIsShareDeployOpen(true)}
        />

        {/* Share & Instant Netlify Deploy Modal */}
        <ShareDeployModal
          isOpen={isShareDeployOpen}
          onClose={() => setIsShareDeployOpen(false)}
          nodes={nodes}
          edges={edges}
          boardTitle={activeBoardTitle}
        />
      </main>

      {/* Architecture & Strategy Templates Modal */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1A16]/50 backdrop-blur-xs animate-note-pop">
          <div className="bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-[6px_6px_0_#1D1A16] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCD4C2] bg-[#F4EFE4]/60">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#E24E1B]" />
                <h2 className="font-['Fraunces'] italic font-bold text-xl text-[#1D1A16]">
                  How Boardify Works
                </h2>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="p-1.5 rounded-lg border border-[#1D1A16] bg-[#FFFDF6] hover:bg-[#F4EFE4]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#403A2F] leading-relaxed">
              <div className="p-3 rounded-xl bg-[#FFE9A8]/40 border border-[#1D1A16]/20">
                <span className="font-bold text-[#1D1A16]">For Browser Agents (WebMCP): </span>
                When opened in ChatGPT's in-app browser or Chrome with WebMCP testing enabled, Boardify exposes 24 tools on <code className="font-mono text-[#E24E1B]">document.modelContext</code>. Your agent can read the canvas, render complete diagrams from DSL, and arrange notes directly.
              </div>

              <div>
                <h3 className="font-bold uppercase tracking-wider text-[11px] text-[#6B6353] font-mono mb-2">
                  Canvas Gestures & Shortcuts
                </h3>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-[#F4EFE4] border border-[#DCD4C2]">
                    <span className="font-bold text-[#1D1A16]">Double-click canvas</span>
                    <p className="text-[#6B6353]">Create a new sticky note</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F4EFE4] border border-[#DCD4C2]">
                    <span className="font-bold text-[#1D1A16]">Drag right port</span>
                    <p className="text-[#6B6353]">Connect two notes with a wire</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F4EFE4] border border-[#DCD4C2]">
                    <span className="font-bold text-[#1D1A16]">Scroll wheel</span>
                    <p className="text-[#6B6353]">Zoom in / out centered on cursor</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F4EFE4] border border-[#DCD4C2]">
                    <span className="font-bold text-[#1D1A16]">Ctrl + Z / Cmd + Z</span>
                    <p className="text-[#6B6353]">Undo previous canvas action</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FFE9A8] border border-[#1D1A16]/30">
                    <span className="font-bold text-[#1D1A16]">Ctrl + L / Cmd + L</span>
                    <p className="text-[#6B6353]">Search 1,882+ tech logos & signs</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#E24E1B]/10 border border-[#E24E1B]/30">
                    <span className="font-bold text-[#E24E1B]">Ctrl + Shift + D</span>
                    <p className="text-[#1D1A16]">Diagram-as-Code & Mermaid Editor</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold uppercase tracking-wider text-[11px] text-[#6B6353] font-mono mb-2">
                  Copy Sample Prompts for ChatGPT Pro
                </h3>
                <div className="space-y-1.5">
                  {[
                    'Use render_diagram_dsl to architect an AWS Serverless 3-Tier Web App with Lambda, DynamoDB, and API Gateway.',
                    'Read my canvas with get_board_state and inspect layout with inspect_visual_hierarchy.',
                    'Create a checkpoint named "Pre-Reorg", then organize all notes into cluster columns.',
                  ].map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        navigator.clipboard.writeText(p);
                        showToast('Prompt copied!', 'ok');
                      }}
                      className="p-2.5 rounded-lg border border-[#1D1A16] bg-[#FFFDF6] hover:bg-[#F4EFE4] cursor-pointer flex items-center justify-between font-mono text-[11px] text-[#1D1A16] group transition-colors"
                    >
                      <span className="truncate pr-2">{p}</span>
                      <Copy className="w-3.5 h-3.5 text-[#E24E1B] flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CanvasPage() {
  return (
    <ToastProvider>
      <CanvasAppInner />
    </ToastProvider>
  );
}
