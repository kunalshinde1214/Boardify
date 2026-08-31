import { WebMCPToolDef, CanvasNode, CanvasEdge, ToolLogEntry, NoteColor } from './types';
import {
  calculateClusterTargets,
  calculateTimelineTargets,
  calculateKanbanTargets,
  calculateGridTargets,
  findFreeSpot,
  getCentroid,
  generateMarkdownExport,
  generateMermaidExport,
} from './layouts';

export interface WebMCPContextActions {
  getNodes: () => CanvasNode[];
  getEdges: () => CanvasEdge[];
  addNode: (node: Omit<CanvasNode, 'id' | 'created'> & { id?: string }) => CanvasNode;
  updateNode: (id: string, updates: Partial<CanvasNode>) => boolean;
  deleteNode: (id: string) => boolean;
  connectNodes: (sourceId: string, targetId: string, label?: string) => CanvasEdge | null;
  animateLayout: (targets: Map<string, { x: number; y: number }>) => void;
  highlightNode: (id: string, reason?: string) => void;
  clearCanvas: () => void;
  createNewBoard?: (title: string) => string;
  addLog: (entry: Omit<ToolLogEntry, 'id' | 'timestamp'>) => void;
}

export function buildWebMCPTools(actions: WebMCPContextActions): Record<string, WebMCPToolDef> {
  const tools: Record<string, WebMCPToolDef> = {};

  // 1. get_canvas_state
  tools.get_canvas_state = {
    name: 'get_canvas_state',
    description: 'Read the full board: all notes (id, title, body, position, color, author) and all directed links. Call this first to understand the canvas before taking action.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    run: () => {
      const nodes = actions.getNodes();
      const edges = actions.getEdges();
      return {
        success: true,
        note_count: nodes.length,
        link_count: edges.length,
        notes: nodes.map(n => ({
          id: n.id,
          title: n.title,
          body: n.body,
          x: Math.round(n.x),
          y: Math.round(n.y),
          width: n.width,
          color: n.color,
          author: n.author,
          tags: n.tags || [],
        })),
        links: edges.map(e => ({
          id: e.id,
          source: e.from,
          target: e.to,
          label: e.label || '',
        })),
      };
    },
  };

  // 2. add_idea_node
  tools.add_idea_node = {
    name: 'add_idea_node',
    description: 'Create a new sticky note on the canvas. If coordinates are omitted, a free spot near the board center is automatically selected without overlapping existing notes.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Headline for the sticky note (concise, ~40 chars)' },
        body: { type: 'string', description: 'Detailed bullet points or supporting explanation; newlines supported' },
        x: { type: 'number', description: 'Canvas X position (optional)' },
        y: { type: 'number', description: 'Canvas Y position (optional)' },
        color: {
          type: 'string',
          enum: ['butter', 'sage', 'coral', 'slate', 'lavender', 'mint'],
          description: 'Color of the sticky note',
        },
      },
      required: ['title'],
    },
    run: input => {
      const title = String(input.title || '').trim();
      if (!title) return { success: false, error: 'Title is required' };

      const nodes = actions.getNodes();
      let x = Number.isFinite(input.x) ? (input.x as number) : null;
      let y = Number.isFinite(input.y) ? (input.y as number) : null;

      if (x === null || y === null) {
        const centroid = getCentroid(nodes);
        const free = findFreeSpot(nodes, centroid.x + 240, centroid.y);
        x = free.x;
        y = free.y;
      } else {
        const free = findFreeSpot(nodes, x, y);
        x = free.x;
        y = free.y;
      }

      const validColors: NoteColor[] = ['butter', 'sage', 'coral', 'slate', 'lavender', 'mint'];
      const color = validColors.includes(input.color as NoteColor)
        ? (input.color as NoteColor)
        : 'slate';

      const newNode = actions.addNode({
        title: title.slice(0, 100),
        body: String(input.body || '').slice(0, 1000),
        x,
        y,
        width: 230,
        color,
        author: 'agent',
      });

      actions.highlightNode(newNode.id, 'Agent created note');

      return {
        success: true,
        node_id: newNode.id,
        x: newNode.x,
        y: newNode.y,
        title: newNode.title,
      };
    },
  };

  // 3. update_node
  tools.update_node = {
    name: 'update_node',
    description: 'Modify an existing sticky note\'s title, body, color, or canvas position.',
    inputSchema: {
      type: 'object',
      properties: {
        node_id: { type: 'string', description: 'ID of the node to update (e.g. "n1")' },
        title: { type: 'string', description: 'New title' },
        body: { type: 'string', description: 'New body text' },
        color: {
          type: 'string',
          enum: ['butter', 'sage', 'coral', 'slate', 'lavender', 'mint'],
          description: 'New color',
        },
        x: { type: 'number', description: 'New canvas X position' },
        y: { type: 'number', description: 'New canvas Y position' },
      },
      required: ['node_id'],
    },
    run: input => {
      const nodeId = String(input.node_id || '');
      const updates: Partial<CanvasNode> = {};

      if (input.title !== undefined) updates.title = String(input.title).slice(0, 100);
      if (input.body !== undefined) updates.body = String(input.body).slice(0, 1000);
      if (input.color) updates.color = input.color as NoteColor;
      if (Number.isFinite(input.x)) updates.x = input.x as number;
      if (Number.isFinite(input.y)) updates.y = input.y as number;

      const ok = actions.updateNode(nodeId, updates);
      if (!ok) return { success: false, error: `Node ${nodeId} not found` };

      actions.highlightNode(nodeId, 'Updated');
      return { success: true, node_id: nodeId };
    },
  };

  // 4. delete_node
  tools.delete_node = {
    name: 'delete_node',
    description: 'Delete a note from the canvas and cascade-remove any links attached to it.',
    inputSchema: {
      type: 'object',
      properties: {
        node_id: { type: 'string', description: 'ID of the node to remove' },
      },
      required: ['node_id'],
    },
    run: input => {
      const nodeId = String(input.node_id || '');
      const ok = actions.deleteNode(nodeId);
      if (!ok) return { success: false, error: `Node ${nodeId} not found` };
      return { success: true, node_id: nodeId };
    },
  };

  // 5. connect_nodes
  tools.connect_nodes = {
    name: 'connect_nodes',
    description: 'Draw a directed link from one note to another with an optional relationship label (e.g. "pairs with", "causes", "blocks").',
    inputSchema: {
      type: 'object',
      properties: {
        source_id: { type: 'string', description: 'Source node ID' },
        target_id: { type: 'string', description: 'Target node ID' },
        label: { type: 'string', description: 'Short relationship label shown on the wire' },
      },
      required: ['source_id', 'target_id'],
    },
    run: input => {
      const sourceId = String(input.source_id || '');
      const targetId = String(input.target_id || '');
      const label = input.label ? String(input.label).slice(0, 50) : '';

      const edge = actions.connectNodes(sourceId, targetId, label);
      if (!edge) return { success: false, error: 'Could not connect notes (invalid IDs or duplicate link)' };

      return { success: true, link_id: edge.id, from: edge.from, to: edge.to, label: edge.label };
    },
  };

  // 6. arrange_layout
  tools.arrange_layout = {
    name: 'arrange_layout',
    description: 'Auto-arrange all sticky notes using an intelligent spatial algorithm ("clusters", "timeline", "kanban", or "grid").',
    inputSchema: {
      type: 'object',
      properties: {
        layout: {
          type: 'string',
          enum: ['clusters', 'timeline', 'kanban', 'grid'],
          description: 'Layout algorithm to apply',
        },
      },
    },
    run: input => {
      const nodes = actions.getNodes();
      const edges = actions.getEdges();
      if (!nodes.length) return { success: false, error: 'Board is empty' };

      const layoutType = String(input.layout || 'clusters');
      let targets: Map<string, { x: number; y: number }>;

      switch (layoutType) {
        case 'timeline':
          targets = calculateTimelineTargets(nodes);
          break;
        case 'kanban':
          targets = calculateKanbanTargets(nodes);
          break;
        case 'grid':
          targets = calculateGridTargets(nodes);
          break;
        case 'clusters':
        default:
          targets = calculateClusterTargets(nodes, edges);
          break;
      }

      actions.animateLayout(targets);
      return { success: true, layout: layoutType, moved_count: targets.size };
    },
  };

  // 7. highlight_node
  tools.highlight_node = {
    name: 'highlight_node',
    description: 'Pan camera to a note and trigger an animated attention pulse with a speech flag callout to direct human focus.',
    inputSchema: {
      type: 'object',
      properties: {
        node_id: { type: 'string', description: 'ID of the node to highlight' },
        reason: { type: 'string', description: 'Short reason displayed in the agent callout flag' },
      },
      required: ['node_id'],
    },
    run: input => {
      const nodeId = String(input.node_id || '');
      const reason = input.reason ? String(input.reason).slice(0, 90) : undefined;
      actions.highlightNode(nodeId, reason);
      return { success: true, node_id: nodeId };
    },
  };

  // 8. export_canvas
  tools.export_canvas = {
    name: 'export_canvas',
    description: 'Export board into structured Markdown outline, Mermaid flowchart, or full JSON graph format.',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['markdown', 'mermaid', 'json'],
          description: 'Export format',
        },
      },
    },
    run: input => {
      const nodes = actions.getNodes();
      const edges = actions.getEdges();
      const fmt = String(input.format || 'markdown').toLowerCase();

      let content = '';
      if (fmt === 'mermaid') {
        content = generateMermaidExport(nodes, edges);
      } else if (fmt === 'json') {
        content = JSON.stringify({ nodes, edges }, null, 2);
      } else {
        content = generateMarkdownExport(nodes, edges);
      }

      return {
        success: true,
        format: fmt,
        note_count: nodes.length,
        link_count: edges.length,
        content,
      };
    },
  };

  // 9. clear_canvas
  tools.clear_canvas = {
    name: 'clear_canvas',
    description: 'Wipe all notes and links from the canvas. Requires confirm: true as a safety guard.',
    inputSchema: {
      type: 'object',
      properties: {
        confirm: { type: 'boolean', description: 'Must be true to execute canvas wipe' },
      },
      required: ['confirm'],
    },
    run: input => {
      if (input.confirm !== true) {
        return { success: false, error: 'Refused: confirm: true must be provided to wipe canvas' };
      }
      actions.clearCanvas();
      return { success: true, message: 'Canvas cleared' };
    },
  };

  // 10. batch_create_nodes
  tools.batch_create_nodes = {
    name: 'batch_create_nodes',
    description: 'Create multiple linked sticky notes in a single atomic tool call (ideal for frameworks like SWOT, pros/cons, or brainstorms).',
    inputSchema: {
      type: 'object',
      properties: {
        nodes: {
          type: 'array',
          description: 'Array of notes to create with optional title, body, color, and x/y',
        },
        links: {
          type: 'array',
          description: 'Array of link definitions between created nodes by index { fromIndex, toIndex, label }',
        },
      },
      required: ['nodes'],
    },
    run: input => {
      const rawNodes = Array.isArray(input.nodes) ? input.nodes : [];
      if (!rawNodes.length) return { success: false, error: 'nodes array cannot be empty' };

      const existingNodes = actions.getNodes();
      const centroid = getCentroid(existingNodes);
      let startX = centroid.x + 200;
      let startY = centroid.y - (rawNodes.length * 70);

      const createdList: CanvasNode[] = [];
      const validColors: NoteColor[] = ['butter', 'sage', 'coral', 'slate', 'lavender', 'mint'];

      rawNodes.forEach((n, idx) => {
        const title = String((n as Record<string, unknown>).title || `Idea ${idx + 1}`);
        const body = String((n as Record<string, unknown>).body || '');
        const c = (n as Record<string, unknown>).color as NoteColor;
        const color = validColors.includes(c) ? c : validColors[idx % validColors.length];

        const free = findFreeSpot(
          [...existingNodes, ...createdList],
          Number.isFinite((n as Record<string, unknown>).x) ? ((n as Record<string, unknown>).x as number) : startX,
          Number.isFinite((n as Record<string, unknown>).y) ? ((n as Record<string, unknown>).y as number) : startY
        );

        const node = actions.addNode({
          title: title.slice(0, 100),
          body: body.slice(0, 1000),
          x: free.x,
          y: free.y,
          width: 230,
          color,
          author: 'agent',
        });
        createdList.push(node);
        startY += 150;
      });

      // Connect links if provided
      const rawLinks = Array.isArray(input.links) ? input.links : [];
      rawLinks.forEach(l => {
        const fromIdx = (l as Record<string, unknown>).fromIndex as number;
        const toIdx = (l as Record<string, unknown>).toIndex as number;
        const label = String((l as Record<string, unknown>).label || '');
        if (createdList[fromIdx] && createdList[toIdx]) {
          actions.connectNodes(createdList[fromIdx].id, createdList[toIdx].id, label);
        }
      });

      return {
        success: true,
        created_count: createdList.length,
        node_ids: createdList.map(n => n.id),
      };
    },
  };

  // 11. search_canvas
  tools.search_canvas = {
    name: 'search_canvas',
    description: 'Search across all note titles and bodies on the canvas, highlighting matching nodes and returning coordinates.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term or keyword' },
      },
      required: ['query'],
    },
    run: input => {
      const q = String(input.query || '').toLowerCase().trim();
      if (!q) return { success: false, error: 'Query is required' };

      const nodes = actions.getNodes();
      const matches = nodes.filter(n =>
        n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
      );

      if (matches.length > 0) {
        actions.highlightNode(matches[0].id, `Match: "${q}"`);
      }

      return {
        success: true,
        query: q,
        match_count: matches.length,
        matches: matches.map(n => ({
          id: n.id,
          title: n.title,
          body: n.body,
          x: n.x,
          y: n.y,
          author: n.author,
        })),
      };
    },
  };

  // 12. cluster_by_topic
  tools.cluster_by_topic = {
    name: 'cluster_by_topic',
    description: 'Re-organize canvas notes into categorized visual columns and connect them to section headers.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    run: () => {
      const nodes = actions.getNodes();
      const edges = actions.getEdges();
      if (!nodes.length) return { success: false, error: 'Board is empty' };

      const targets = calculateClusterTargets(nodes, edges);
      actions.animateLayout(targets);
      return { success: true, clustered_count: targets.size };
    },
  };

  // 13. create_new_board
  tools.create_new_board = {
    name: 'create_new_board',
    description: 'Create a fresh, dedicated whiteboard canvas for a new project, strategic initiative, or separate toolchain diagram.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title or topic for the new canvas' },
      },
      required: ['title'],
    },
    run: input => {
      const title = String(input.title || 'New Canvas').trim();
      const newBoardId = actions.createNewBoard ? actions.createNewBoard(title) : 'board_' + Date.now();
      return {
        success: true,
        board_id: newBoardId,
        title,
        message: `Created new whiteboard canvas: "${title}"`,
      };
    },
  };

  return tools;
}

export function registerWebMCP(tools: Record<string, WebMCPToolDef>): boolean {
  if (typeof window === 'undefined') return false;

  const win = window as unknown as {
    document: {
      modelContext?: {
        registerTool: (tool: {
          name: string;
          description: string;
          inputSchema: unknown;
          execute: (input: Record<string, unknown>) => Promise<unknown> | unknown;
        }) => void;
      };
    };
  };

  const mc = win.document?.modelContext;
  if (mc && typeof mc.registerTool === 'function') {
    try {
      Object.values(tools).forEach(t => {
        mc.registerTool({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
          execute: async input => {
            const start = performance.now();
            let result: Record<string, unknown>;
            try {
              result = await t.run(input || {});
            } catch (err) {
              result = { success: false, error: String(err instanceof Error ? err.message : err) };
            }
            const durationMs = Math.round(performance.now() - start);
            return { ...result, _executed_via: 'WebMCP', duration_ms: durationMs };
          },
        });
      });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
