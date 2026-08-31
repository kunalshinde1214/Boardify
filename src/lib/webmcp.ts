import { WebMCPToolDef, CanvasNode, CanvasEdge, ToolLogEntry, NoteColor, NodeType } from './types';
import {
  calculateSmartFlowTargets,
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
  addNode: (
    node: Omit<CanvasNode, 'id' | 'created'> & { id?: string; nodeType?: NodeType }
  ) => CanvasNode;
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
    description: 'Read the full board: all notes (id, title, body, position, color, author, nodeType) and all directed links. Call this first to understand the canvas before taking action.',
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
          nodeType: n.nodeType || 'default',
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
        nodeType: {
          type: 'string',
          enum: ['default', 'agent', 'tool', 'database', 'api', 'cloud', 'auth', 'trigger', 'ui'],
          description: 'Architectural role badge',
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

      const color = (input.color as NoteColor) || 'butter';
      const nodeType = (input.nodeType as NodeType) || 'default';
      const created = actions.addNode({
        title,
        body: String(input.body || ''),
        x,
        y,
        width: 230,
        color,
        author: 'agent',
        nodeType,
      });

      actions.addLog({
        toolName: 'add_idea_node',
        input: { title, color, nodeType },
        output: { id: created.id, x, y },
        source: 'agent',
      });

      return {
        success: true,
        node_id: created.id,
        title: created.title,
        x: created.x,
        y: created.y,
        color: created.color,
      };
    },
  };

  // 3. update_node
  tools.update_node = {
    name: 'update_node',
    description: 'Update the text content, color, or position of an existing note.',
    inputSchema: {
      type: 'object',
      properties: {
        node_id: { type: 'string', description: 'ID of the node to update' },
        title: { type: 'string', description: 'New title (optional)' },
        body: { type: 'string', description: 'New body (optional)' },
        color: {
          type: 'string',
          enum: ['butter', 'sage', 'coral', 'slate', 'lavender', 'mint'],
          description: 'New color (optional)',
        },
        x: { type: 'number', description: 'New X position (optional)' },
        y: { type: 'number', description: 'New Y position (optional)' },
      },
      required: ['node_id'],
    },
    run: input => {
      const id = String(input.node_id || '').trim();
      if (!id) return { success: false, error: 'node_id is required' };

      const updates: Partial<CanvasNode> = {};
      if (input.title !== undefined) updates.title = String(input.title);
      if (input.body !== undefined) updates.body = String(input.body);
      if (input.color !== undefined) updates.color = input.color as NoteColor;
      if (typeof input.x === 'number') updates.x = input.x;
      if (typeof input.y === 'number') updates.y = input.y;

      const ok = actions.updateNode(id, updates);
      if (!ok) return { success: false, error: `Node ${id} not found` };

      actions.addLog({
        toolName: 'update_node',
        input: { node_id: id, updates },
        output: { success: true },
        source: 'agent',
      });

      return { success: true, node_id: id, updated_fields: Object.keys(updates) };
    },
  };

  // 4. delete_node
  tools.delete_node = {
    name: 'delete_node',
    description: 'Delete a single note from the canvas. Any connection wires attached to it are cleaned up automatically.',
    inputSchema: {
      type: 'object',
      properties: {
        node_id: { type: 'string', description: 'ID of the node to delete' },
      },
      required: ['node_id'],
    },
    run: input => {
      const id = String(input.node_id || '').trim();
      if (!id) return { success: false, error: 'node_id is required' };

      const ok = actions.deleteNode(id);
      if (!ok) return { success: false, error: `Node ${id} not found` };

      actions.addLog({
        toolName: 'delete_node',
        input: { node_id: id },
        output: { success: true },
        source: 'agent',
      });

      return { success: true, deleted_node_id: id };
    },
  };

  // 5. connect_nodes
  tools.connect_nodes = {
    name: 'connect_nodes',
    description: 'Draw a directional connection wire between two notes with an optional semantic relationship label.',
    inputSchema: {
      type: 'object',
      properties: {
        source_id: { type: 'string', description: 'ID of the origin node' },
        target_id: { type: 'string', description: 'ID of the destination node' },
        label: { type: 'string', description: 'Relationship description (e.g. "leads to", "pro", "con", "depends on")' },
      },
      required: ['source_id', 'target_id'],
    },
    run: input => {
      const src = String(input.source_id || '').trim();
      const tgt = String(input.target_id || '').trim();
      const label = String(input.label || '').trim();

      if (!src || !tgt) return { success: false, error: 'source_id and target_id are required' };

      const edge = actions.connectNodes(src, tgt, label);
      if (!edge) return { success: false, error: 'Could not create link (nodes may already be connected or missing)' };

      actions.addLog({
        toolName: 'connect_nodes',
        input: { source_id: src, target_id: tgt, label },
        output: { link_id: edge.id },
        source: 'agent',
      });

      return { success: true, link_id: edge.id, source: src, target: tgt, label };
    },
  };

  // 6. arrange_layout
  tools.arrange_layout = {
    name: 'arrange_layout',
    description: 'Smoothly rearrange all notes on the canvas using an organizational preset.',
    inputSchema: {
      type: 'object',
      properties: {
        preset: {
          type: 'string',
          enum: ['smart_flow', 'clusters', 'timeline', 'kanban', 'grid'],
          description: 'Layout algorithm to apply',
        },
      },
      required: ['preset'],
    },
    run: input => {
      const preset = String(input.preset || 'smart_flow');
      const nodes = actions.getNodes();
      const edges = actions.getEdges();

      if (!nodes.length) return { success: false, error: 'Board has no notes to arrange' };

      let targets: Map<string, { x: number; y: number }>;
      if (preset === 'smart_flow') targets = calculateSmartFlowTargets(nodes, edges);
      else if (preset === 'clusters') targets = calculateClusterTargets(nodes, edges);
      else if (preset === 'timeline') targets = calculateTimelineTargets(nodes);
      else if (preset === 'kanban') targets = calculateKanbanTargets(nodes);
      else targets = calculateGridTargets(nodes);

      actions.animateLayout(targets);

      actions.addLog({
        toolName: 'arrange_layout',
        input: { preset },
        output: { count: targets.size },
        source: 'agent',
      });

      return { success: true, preset, notes_arranged: targets.size };
    },
  };

  // 7. highlight_node
  tools.highlight_node = {
    name: 'highlight_node',
    description: 'Pan the camera directly to a specific note and render a glowing beacon with an explanation thought bubble.',
    inputSchema: {
      type: 'object',
      properties: {
        node_id: { type: 'string', description: 'ID of the node to focus' },
        reason: { type: 'string', description: 'Short note explaining why the agent is focusing here' },
      },
      required: ['node_id'],
    },
    run: input => {
      const id = String(input.node_id || '').trim();
      const reason = input.reason ? String(input.reason) : 'Agent spotlight';

      const nodes = actions.getNodes();
      const target = nodes.find(n => n.id === id);
      if (!target) return { success: false, error: `Node ${id} not found` };

      actions.highlightNode(id, reason);

      actions.addLog({
        toolName: 'highlight_node',
        input: { node_id: id, reason },
        output: { focused: target.title },
        source: 'agent',
      });

      return { success: true, node_id: id, title: target.title, reason };
    },
  };

  // 8. clear_canvas
  tools.clear_canvas = {
    name: 'clear_canvas',
    description: 'Wipe all notes and links from the canvas to start completely fresh. Destructive action; requires confirm: true.',
    inputSchema: {
      type: 'object',
      properties: {
        confirm: { type: 'boolean', description: 'Must be explicitly set to true to execute' },
      },
      required: ['confirm'],
    },
    run: input => {
      if (input.confirm !== true) {
        return { success: false, error: 'Confirmation required: set { confirm: true } to clear the canvas' };
      }

      actions.clearCanvas();

      actions.addLog({
        toolName: 'clear_canvas',
        input: { confirm: true },
        output: { success: true },
        source: 'agent',
      });

      return { success: true, message: 'Canvas cleared' };
    },
  };

  // 9. export_canvas
  tools.export_canvas = {
    name: 'export_canvas',
    description: 'Export the current canvas as a formatted Markdown brief, Mermaid relationship diagram, or JSON state.',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['markdown', 'mermaid', 'json'],
          description: 'Export format',
        },
      },
      required: ['format'],
    },
    run: input => {
      const format = String(input.format || 'markdown');
      const nodes = actions.getNodes();
      const edges = actions.getEdges();

      let content = '';
      if (format === 'mermaid') content = generateMermaidExport(nodes, edges);
      else if (format === 'json') content = JSON.stringify({ nodes, edges }, null, 2);
      else content = generateMarkdownExport(nodes, edges);

      return { success: true, format, content };
    },
  };

  // 10. batch_create_nodes
  tools.batch_create_nodes = {
    name: 'batch_create_nodes',
    description: 'Create multiple connected notes at once (ideal for SWOT matrices, frameworks, or multi-step roadmaps).',
    inputSchema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          description: 'Array of nodes to create with titles, bodies, and colors',
        },
        links: {
          type: 'array',
          description: 'Array of links connecting the new nodes by title or index',
        },
      },
      required: ['items'],
    },
    run: input => {
      const items = Array.isArray(input.items) ? input.items : [];
      if (!items.length) return { success: false, error: 'items array is required and cannot be empty' };

      const createdList: CanvasNode[] = [];
      const titleToId = new Map<string, string>();

      items.forEach((item: any, idx: number) => {
        const created = actions.addNode({
          title: String(item.title || `Idea ${idx + 1}`),
          body: String(item.body || ''),
          x: typeof item.x === 'number' ? item.x : idx * 260 - 260,
          y: typeof item.y === 'number' ? item.y : 100,
          width: 230,
          color: (item.color as NoteColor) || 'butter',
          author: 'agent',
          nodeType: (item.nodeType as NodeType) || 'default',
        });
        createdList.push(created);
        titleToId.set(created.title.toLowerCase().trim(), created.id);
      });

      if (Array.isArray(input.links)) {
        input.links.forEach((l: any) => {
          let srcId = l.source_id;
          let tgtId = l.target_id;
          if (!srcId && l.sourceTitle) srcId = titleToId.get(String(l.sourceTitle).toLowerCase().trim());
          if (!tgtId && l.targetTitle) tgtId = titleToId.get(String(l.targetTitle).toLowerCase().trim());

          if (srcId && tgtId) {
            actions.connectNodes(srcId, tgtId, l.label || '');
          }
        });
      }

      actions.animateLayout(calculateSmartFlowTargets(actions.getNodes(), actions.getEdges()));

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

/**
 * Registers all tools onto window.document.modelContext following the official WebMCP standard.
 * If the browser does not natively provide document.modelContext, an automatic polyfill is injected
 * so ChatGPT, extensions, and console scripts can execute tools seamlessly in ANY browser.
 */
export function registerWebMCP(tools: Record<string, WebMCPToolDef>): boolean {
  if (typeof window === 'undefined') return false;

  const win = window as any;

  // Initialize document.modelContext standard polyfill if not already present
  if (!win.document.modelContext) {
    win.document.modelContext = {
      _registeredTools: new Map<string, any>(),
      registerTool: function (tool: any) {
        this._registeredTools.set(tool.name, tool);
      },
      getTools: function () {
        return Array.from(this._registeredTools.values());
      },
      listTools: function () {
        return Array.from(this._registeredTools.values()).map((t: any) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        }));
      },
      executeTool: async function (name: string, input: any = {}) {
        const tool = this._registeredTools.get(name);
        if (!tool) throw new Error(`WebMCP Tool "${name}" not found.`);
        return await tool.execute(input);
      },
    };
  }

  const mc = win.document.modelContext;

  try {
    Object.values(tools).forEach(t => {
      mc.registerTool({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
        execute: async (input: Record<string, unknown>) => {
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

    console.log(
      `%c[WebMCP v1.0 Standard]%c Registered ${Object.keys(tools).length} tools on document.modelContext. Try: document.modelContext.listTools()`,
      'background: #E24E1B; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
      'color: #1D1A16; font-weight: bold;'
    );

    return true;
  } catch (err) {
    console.warn('WebMCP registration warning:', err);
    return false;
  }
}
