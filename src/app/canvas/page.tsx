'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ToastProvider, useToast } from '@/components/ui/ToastProvider';
import { InfiniteCanvas } from '@/components/canvas/InfiniteCanvas';
import { TopToolbar } from '@/components/canvas/TopToolbar';
import { AgentStudioDrawer } from '@/components/studio/AgentStudioDrawer';
import { ExportModal } from '@/components/canvas/ExportModal';
import {
  CanvasNode,
  CanvasEdge,
  CanvasCamera,
  CanvasState,
  ToolLogEntry,
  WebMCPToolDef,
  NoteColor,
  NodeType,
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
  analyzeBoardHealth,
} from '@/lib/layouts';
import { generateDynamicPlan } from '@/lib/llm-client';
import { X, Layers, Copy, Check, ExternalLink, HelpCircle } from 'lucide-react';

function CanvasAppInner() {
  const [boards, setBoards] = useState<BoardMetadata[]>([]);
  const [boardId, setBoardId] = useState('default');
  const [activeBoardTitle, setActiveBoardTitle] = useState('Welcome Canvas');

  const [nodes, setNodes] = useState<CanvasNode[]>(DEFAULT_SEED_BOARD.nodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(DEFAULT_SEED_BOARD.edges);
  const [seq, setSeq] = useState(DEFAULT_SEED_BOARD.seq);

  const [camera, setCamera] = useState<CanvasCamera>({ x: 0, y: 0, z: 1 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [highlightReason, setHighlightReason] = useState<string | undefined>(undefined);

  const [isStudioOpen, setIsStudioOpen] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const [hasWebMCP, setHasWebMCP] = useState(false);
  const [logs, setLogs] = useState<ToolLogEntry[]>([]);
  const [undoStack, setUndoStack] = useState<CanvasState[]>([]);

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
      nodeType: NodeType = 'default'
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
        width: 230,
        color,
        author,
        created: Date.now(),
        rot: ((Math.random() * 6) - 3) * 0.6,
        nodeType,
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
    addNode: n => handleAddNode(n.x, n.y, n.color, n.title, n.body, n.author, (n as any).nodeType),
    updateNode: (id, u) => handleUpdateNode(id, u),
    deleteNode: id => handleDeleteNode(id),
    connectNodes: (src, tgt, lbl) => handleConnectNodes(src, tgt, lbl),
    animateLayout: targets => animateLayout(targets),
    highlightNode: (id, reason) => highlightNode(id, reason),
    clearCanvas: () => handleClearCanvas(),
    createNewBoard: title => handleCreateNewBoard(title),
    addLog: entry => addLogEntry(entry),
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
          item.nodeType || 'default'
        );
        createdNodeMap.set(item.title.toLowerCase().trim(), node.id);

        addLogEntry({
          toolName: 'add_idea_node',
          input: { title: item.title, color: item.color, nodeType: item.nodeType },
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

      showToast(plan.summary || `Added ${plan.nodes.length} notes and connected wires`, 'ok');
      setTimeout(() => {
        animateLayout(calculateSmartFlowTargets(nodesRef.current, edgesRef.current));
      }, 300);
    } catch (err) {
      showToast('Failed to generate plan, please try again.', 'warn');
    } finally {
      setAgentCursor(prev => ({ ...prev, isActive: false }));
    }
  };

  const loadTemplate = (tmplId: string) => {
    const tmpl = BOARD_TEMPLATES.find(t => t.id === tmplId);
    if (!tmpl) return;
    pushUndo();
    const hydrated = createBoardFromTemplate(tmpl);
    setNodes(hydrated.nodes);
    setEdges(hydrated.edges);
    setSeq(hydrated.seq);
    setIsTemplatesOpen(false);
    showToast(`Loaded "${tmpl.title}" template!`, 'ok');
    setTimeout(() => fitView(true), 300);
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#F4EFE4]">
      {/* Global Navbar */}
      <Navbar />

      {/* Main Canvas Workspace */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <InfiniteCanvas
          nodes={nodes}
          edges={edges}
          camera={camera}
          selectedNodeId={selectedNodeId}
          selectedEdgeId={selectedEdgeId}
          highlightedNodeId={highlightedNodeId}
          highlightReason={highlightReason}
          agentCursor={agentCursor}
          onUpdateCamera={setCamera}
          onSelectNode={setSelectedNodeId}
          onSelectEdge={setSelectedEdgeId}
          onAddNode={(x, y) => handleAddNode(x, y)}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          onConnectNodes={handleConnectNodes}
          onUpdateEdge={handleUpdateEdge}
          onDeleteEdge={handleDeleteEdge}
          onUndo={handleUndo}
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
          onSmartArrange={() => {
            animateLayout(calculateSmartFlowTargets(nodes, edges));
            showToast('Arranged into smart hierarchical flow', 'ok');
          }}
          onTidyForceDirected={() => {
            animateLayout(calculateForceDirectedTargets(nodes, edges));
            showToast('Untangled canvas with physics layout', 'ok');
          }}
          onTidyClusters={() => {
            animateLayout(calculateClusterTargets(nodes, edges));
            showToast('Tidied into clusters', 'ok');
          }}
          onTidyTimeline={() => {
            animateLayout(calculateTimelineTargets(nodes));
            showToast('Arranged by creation timeline', 'ok');
          }}
          onTidyKanban={() => {
            animateLayout(calculateKanbanTargets(nodes));
            showToast('Arranged by color categories', 'ok');
          }}
          onFitView={() => fitView(true)}
          onZoomIn={() => setCamera(prev => ({ ...prev, z: Math.min(2.5, prev.z * 1.2) }))}
          onZoomOut={() => setCamera(prev => ({ ...prev, z: Math.max(0.25, prev.z * 0.8) }))}
          onUndo={handleUndo}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          onClearCanvas={handleClearCanvas}
          onOpenHelp={() => setIsHelpOpen(true)}
          onToggleStudio={() => setIsStudioOpen(!isStudioOpen)}
          onOpenHealth={() => setIsStudioOpen(true)}
          onCreateNewBoard={() => handleCreateNewBoard()}
          onSwitchBoard={handleSwitchBoard}
        />

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
            animateLayout(calculateForceDirectedTargets(nodes, edges));
            showToast('Untangled canvas layout', 'ok');
          }}
          onHighlightNode={highlightNode}
          onClearLogs={() => setLogs([])}
        />
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        nodes={nodes}
        edges={edges}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Templates Drawer Modal */}
      {isTemplatesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1A16]/50 backdrop-blur-xs animate-note-pop">
          <div className="bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-[6px_6px_0_#1D1A16] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCD4C2] bg-[#F4EFE4]/60">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#E24E1B]" />
                <h2 className="font-['Fraunces'] italic font-bold text-xl text-[#1D1A16]">
                  Boardify Templates Gallery
                </h2>
              </div>
              <button
                onClick={() => setIsTemplatesOpen(false)}
                className="p-1.5 rounded-lg border border-[#1D1A16] bg-[#FFFDF6] hover:bg-[#F4EFE4]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[60vh]">
              {BOARD_TEMPLATES.map(t => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl border border-[#1D1A16] bg-[#FFFDF6] shadow-[3px_3px_0_#1D1A16] flex flex-col justify-between hover:bg-[#F4EFE4] transition-colors group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#1D1A16] text-[#F4EFE4]">
                        {t.category}
                      </span>
                      {t.badge && (
                        <span className="text-[10px] font-bold text-[#E24E1B] bg-[#FFD8C7] px-2 py-0.5 rounded-full">
                          {t.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-[#1D1A16]">{t.title}</h3>
                    <p className="text-xs text-[#6B6353] mt-1 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  </div>

                  <button
                    onClick={() => loadTemplate(t.id)}
                    className="mt-4 w-full py-2 rounded-xl bg-[#1D1A16] text-white text-xs font-bold shadow-[2px_2px_0_#6B6353] hover:bg-[#E24E1B] transition-colors"
                  >
                    Load Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
                When opened in ChatGPT's in-app browser or Chrome with WebMCP testing enabled, Boardify exposes 12 tools on <code className="font-mono text-[#E24E1B]">document.modelContext</code>. Your agent can read the canvas and create/arrange notes directly.
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
                </div>
              </div>

              <div>
                <h3 className="font-bold uppercase tracking-wider text-[11px] text-[#6B6353] font-mono mb-2">
                  Copy Sample Prompts for ChatGPT Pro
                </h3>
                <div className="space-y-1.5">
                  {[
                    'Read my canvas with get_canvas_state and add 3 market expansion strategies to the right.',
                    'Critique my SWOT board, identify weak spots, and add mitigation notes.',
                    'Organize all notes into cluster columns and export as a Markdown sprint document.',
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
