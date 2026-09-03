import { db, isConfigured } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { CanvasState, CanvasNode, CanvasEdge, BoardTemplate } from './types';

const LOCAL_STORAGE_PREFIX = 'boardify:board:';
const ACTIVE_BOARD_KEY = 'boardify:active_board_id';

export const DEFAULT_SEED_BOARD: CanvasState = {
  version: 1,
  seq: 3,
  nodes: [
    {
      id: 'n1',
      title: 'Welcome to Boardify',
      body: 'This canvas is shared — you and any WebMCP agent both have hands here.\nDrag notes, double-click empty space to add one, drag from a note\'s right port to link ideas.\nOpen Agent Studio on the right to trigger live missions!',
      x: -40,
      y: -90,
      width: 240,
      color: 'butter',
      author: 'human',
      created: Date.now() - 30000,
      rot: -1.5,
    },
    {
      id: 'n2',
      title: 'Humans bring taste',
      body: 'Judgment, intuition, domain expertise, and a nose for the weird idea that is actually right.',
      x: -420,
      y: 160,
      width: 230,
      color: 'sage',
      author: 'human',
      created: Date.now() - 20000,
      rot: 2,
    },
    {
      id: 'n3',
      title: 'Agents bring scale',
      body: 'Exhaustive branches, structured taxonomies, fast retrieval, and tireless layout rearrangement via WebMCP.',
      x: 340,
      y: 160,
      width: 230,
      color: 'slate',
      author: 'agent',
      created: Date.now() - 10000,
      rot: -2,
    },
  ],
  edges: [
    { id: 'e1', from: 'n1', to: 'n2', label: 'pairs with' },
    { id: 'e2', from: 'n1', to: 'n3', label: 'pairs with' },
  ],
  updatedAt: Date.now(),
};

export function sanitizeCanvasState(state: CanvasState): CanvasState {
  if (!state || !Array.isArray(state.nodes)) return DEFAULT_SEED_BOARD;

  const seenNodeIds = new Set<string>();
  const idReplacements = new Map<string, string>();

  const cleanNodes = state.nodes.map((node, index) => {
    let nodeId = node.id;
    if (!nodeId || seenNodeIds.has(nodeId)) {
      const newId = `n_${Date.now().toString(36)}_${index}_${Math.random().toString(36).slice(2, 6)}`;
      idReplacements.set(nodeId, newId);
      nodeId = newId;
    }
    seenNodeIds.add(nodeId);
    return { ...node, id: nodeId };
  });

  const seenEdgeIds = new Set<string>();
  const cleanEdges = (Array.isArray(state.edges) ? state.edges : []).map((edge, index) => {
    let edgeId = edge.id;
    if (!edgeId || seenEdgeIds.has(edgeId)) {
      edgeId = `e_${Date.now().toString(36)}_${index}_${Math.random().toString(36).slice(2, 6)}`;
    }
    seenEdgeIds.add(edgeId);

    const fromId = idReplacements.get(edge.from) || edge.from;
    const toId = idReplacements.get(edge.to) || edge.to;

    return { ...edge, id: edgeId, from: fromId, to: toId };
  });

  return {
    ...state,
    nodes: cleanNodes,
    edges: cleanEdges,
  };
}

export async function loadBoard(boardId = 'default'): Promise<CanvasState> {
  if (typeof window === 'undefined') return DEFAULT_SEED_BOARD;

  // If Firebase is configured, attempt Firestore fetch first
  if (isConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'boards', boardId));
      if (snap.exists()) {
        const data = snap.data() as CanvasState;
        return sanitizeCanvasState(data);
      }
    } catch {
      // Fall through to local storage
    }
  }

  // Local storage fallback
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PREFIX + boardId);
    if (raw) {
      const parsed = JSON.parse(raw) as CanvasState;
      if (parsed.nodes && Array.isArray(parsed.nodes)) {
        return sanitizeCanvasState(parsed);
      }
    }
  } catch {
    // Return default
  }

  return DEFAULT_SEED_BOARD;
}

export async function saveBoard(boardId: string, state: CanvasState): Promise<void> {
  if (typeof window === 'undefined') return;

  const enriched: CanvasState = {
    ...state,
    updatedAt: Date.now(),
  };

  // Always save to localStorage for instant offline access
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + boardId, JSON.stringify(enriched));
    localStorage.setItem(ACTIVE_BOARD_KEY, boardId);
  } catch {
    // Ignore storage quota errors
  }

  // Save to Firestore if available
  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'boards', boardId), enriched, { merge: true });
    } catch {
      // Ignore network errors
    }
  }
}

export const saveBoardState = saveBoard;
export const loadBoardState = loadBoard;

export function subscribeToBoard(
  boardId: string,
  onUpdate: (state: CanvasState) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  if (isConfigured && db) {
    try {
      const unsubscribe = onSnapshot(doc(db, 'boards', boardId), docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data() as CanvasState;
          onUpdate(sanitizeCanvasState(data));
        }
      });
      return unsubscribe;
    } catch {
      // Fallback
    }
  }

  // Listen to window storage events across tabs
  const handleStorage = (e: StorageEvent) => {
    if (e.key === LOCAL_STORAGE_PREFIX + boardId && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue) as CanvasState;
        onUpdate(sanitizeCanvasState(parsed));
      } catch {
        // ignore
      }
    }
  };

  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}

export interface BoardMetadata {
  id: string;
  title: string;
  updatedAt: number;
  nodeCount: number;
}

const BOARDS_INDEX_KEY = 'boardify:boards_index';

export function listUserBoards(): BoardMetadata[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOARDS_INDEX_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }

  // Initial default board if index is empty
  const defaultMeta: BoardMetadata = {
    id: 'default',
    title: 'Welcome Canvas',
    updatedAt: Date.now(),
    nodeCount: 3,
  };
  saveBoardsIndex([defaultMeta]);
  return [defaultMeta];
}

export function saveBoardsIndex(list: BoardMetadata[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BOARDS_INDEX_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function createNewBoardRecord(title = 'Untitled Canvas', initialSeed?: CanvasState): string {
  const newId = 'board_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const blankState: CanvasState = initialSeed || {
    version: 1,
    seq: 1,
    nodes: [
      {
        id: 'n_root_' + Date.now(),
        title: title,
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
    ],
    edges: [],
    updatedAt: Date.now(),
  };

  saveBoardState(newId, blankState);

  const existing = listUserBoards();
  const updated: BoardMetadata[] = [
    {
      id: newId,
      title,
      updatedAt: Date.now(),
      nodeCount: blankState.nodes.length,
    },
    ...existing.filter(b => b.id !== newId),
  ];
  saveBoardsIndex(updated);

  return newId;
}

export function updateBoardIndexMeta(id: string, title: string, nodeCount: number): void {
  const existing = listUserBoards();
  const idx = existing.findIndex(b => b.id === id);
  if (idx !== -1) {
    existing[idx].title = title;
    existing[idx].nodeCount = nodeCount;
    existing[idx].updatedAt = Date.now();
  } else {
    existing.unshift({ id, title, nodeCount, updatedAt: Date.now() });
  }
  saveBoardsIndex(existing);
}

export function createBoardFromTemplate(
  template: BoardTemplate,
  offset: { x: number; y: number } = { x: 0, y: 0 }
): CanvasState {
  const timestamp = Date.now();
  const nodes: CanvasNode[] = template.nodes.map((n, idx) => {
    return {
      id: `n_tmpl_${idx + 1}_${timestamp}`,
      title: n.title,
      body: n.body,
      x: n.x + offset.x,
      y: n.y + offset.y,
      width: n.width || 230,
      height: n.height,
      color: n.color || 'butter',
      author: n.author || 'human',
      created: timestamp + idx * 10,
      rot: n.rot !== undefined ? n.rot : ((idx * 37) % 7 - 3) * 0.6,
      nodeType: n.nodeType || 'default',
      shapeType: n.shapeType,
      logoType: n.logoType,
      signType: n.signType,
      fields: n.fields ? [...n.fields] : undefined,
      tasks: n.tasks ? [...n.tasks] : undefined,
      fontSize: n.fontSize,
      stamp: n.stamp,
    };
  });

  const edges: CanvasEdge[] = template.edges.map((e, idx) => ({
    id: `e_tmpl_${idx + 1}_${timestamp}`,
    from: nodes[e.sourceIndex]?.id || `n_tmpl_${e.sourceIndex + 1}_${timestamp}`,
    to: nodes[e.targetIndex]?.id || `n_tmpl_${e.targetIndex + 1}_${timestamp}`,
    label: e.label || '',
  }));

  return {
    version: 1,
    seq: nodes.length + edges.length,
    nodes,
    edges,
    updatedAt: Date.now(),
  };
}

