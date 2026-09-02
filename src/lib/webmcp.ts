import { WebMCPToolDef, CanvasNode, CanvasEdge, ToolLogEntry, NoteColor, NodeType, TaskItem } from './types';
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
  analyzeBoardHealth,
} from './layouts';
import { BOARD_TEMPLATES } from './templates-data';
import { AVAILABLE_LOGOS, AVAILABLE_SIGNS, AVAILABLE_STAMPS } from '@/components/ui/BrandIcons';
import { GILBARBARA_LOGOS } from './all-logos-catalog';
import {
  parseDiagramDsl,
  layoutDiagramDsl,
  exportCanvasToDsl,
  exportCanvasToMermaid,
} from './diagram-dsl';

export interface CanvasCheckpoint {
  id: string;
  name: string;
  timestamp: number;
  nodeCount: number;
  edgeCount: number;
}

export interface WebMCPContextActions {
  getNodes: () => CanvasNode[];
  getEdges: () => CanvasEdge[];
  addNode: (
    node: Omit<CanvasNode, 'id' | 'created'> & {
      id?: string;
      nodeType?: NodeType;
      signType?: string;
      logoType?: string;
      stamp?: string;
      tasks?: TaskItem[];
      fontSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
      styleVariant?: 'sticky' | 'glass' | 'badge' | 'signpost' | 'banner' | 'clean' | 'neon';
    }
  ) => CanvasNode;
  addNodesAndEdges?: (nodes: CanvasNode[], edges: CanvasEdge[], append: boolean) => void;
  updateNode: (id: string, updates: Partial<CanvasNode>) => boolean;
  deleteNode: (id: string) => boolean;
  connectNodes: (sourceId: string, targetId: string, label?: string) => CanvasEdge | null;
  animateLayout: (targets: Map<string, { x: number; y: number }>) => void;
  highlightNode: (id: string, reason?: string) => void;
  clearCanvas: () => void;
  createNewBoard?: (title: string) => string;
  addLog: (entry: Omit<ToolLogEntry, 'id' | 'timestamp'>) => void;
  createCheckpoint?: (name?: string) => CanvasCheckpoint;
  restoreCheckpoint?: (checkpointIdOrName: string) => boolean;
  listCheckpoints?: () => CanvasCheckpoint[];
  undo?: () => boolean;
  redo?: () => boolean;
  captureScreenshot?: () => Promise<string | null> | string | null;
  selectNodes?: (ids: string[]) => void;
  duplicateNode?: (id: string, offset?: { x: number; y: number }) => CanvasNode | null;
}

/**
 * Extracts and cleans text fields from arbitrary AI input objects, supporting all common aliases.
 */
function extractTitleAndBody(input: Record<string, any>): { title: string; body: string } {
  let rawTitle = input.title ?? input.label ?? input.headline ?? input.name ?? input.header ?? input.topic ?? '';
  let rawBody = input.body ?? input.text ?? input.content ?? input.description ?? input.message ?? input.details ?? '';

  rawTitle = String(rawTitle || '').trim();
  rawBody = String(rawBody || '').trim();

  // If title is missing but body/text is provided, auto-extract the first line/phrase as title
  if (!rawTitle && rawBody) {
    const lines = rawBody.split('\n').map((l: string) => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      if (lines[0].length <= 50) {
        rawTitle = lines[0];
        rawBody = lines.slice(1).join('\n').trim();
      } else {
        rawTitle = lines[0].slice(0, 40) + '...';
      }
    }
  }

  if (!rawTitle) {
    rawTitle = 'Idea Note';
  }

  return { title: rawTitle, body: rawBody };
}

/**
 * Normalizes checklist tasks input (accepting array of strings or {text, done} objects)
 */
function normalizeTasks(rawTasks: any): TaskItem[] {
  if (!Array.isArray(rawTasks)) return [];
  return rawTasks
    .map((item, idx) => {
      if (typeof item === 'string') {
        return { id: `task_${Date.now()}_${idx}`, text: item.trim(), done: false };
      }
      if (item && typeof item === 'object') {
        return {
          id: String(item.id || `task_${Date.now()}_${idx}`),
          text: String(item.text || item.title || item.name || '').trim(),
          done: Boolean(item.done || item.completed),
        };
      }
      return null;
    })
    .filter((t): t is TaskItem => Boolean(t && t.text.length > 0));
}

export function buildWebMCPTools(actions: WebMCPContextActions): Record<string, WebMCPToolDef> {
  const tools: Record<string, WebMCPToolDef> = {};

  // =========================================================================
  // 1. GET CANVAS STATE (COMPLETE RICH CONTEXT)
  // =========================================================================
  tools.get_canvas_state = {
    name: 'get_canvas_state',
    description: 'Read the full whiteboard canvas: all notes, signs, tech logos, headings, checklists, stamps, and directed connection wires. Call this first to inspect and understand the active board context before taking any action.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    run: () => {
      const nodes = actions.getNodes();
      const edges = actions.getEdges();

      const nodeTypesSummary: Record<string, number> = {};
      nodes.forEach(n => {
        const type = n.nodeType || 'default';
        nodeTypesSummary[type] = (nodeTypesSummary[type] || 0) + 1;
      });

      return {
        success: true,
        total_notes: nodes.length,
        total_links: edges.length,
        element_breakdown: nodeTypesSummary,
        notes: nodes.map(n => ({
          id: n.id,
          title: n.title,
          body: n.body,
          x: Math.round(n.x),
          y: Math.round(n.y),
          width: n.width || 230,
          color: n.color,
          author: n.author,
          nodeType: n.nodeType || 'default',
          signType: n.signType,
          logoType: n.logoType,
          stamp: n.stamp,
          tasks: n.tasks && n.tasks.length > 0 ? n.tasks : undefined,
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

  // =========================================================================
  // 2. GET BOARD CAPABILITIES & REFERENCE MANUAL
  // =========================================================================
  tools.get_board_capabilities = {
    name: 'get_board_capabilities',
    description: 'Returns the full library of available elements in Boardify: all 25+ Tech Logos, 24+ Road & Status Signs, Note Colors, Stamp Badges, Layout Algorithms, and Pre-built Templates.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    run: () => {
      return {
        success: true,
        available_logos: AVAILABLE_LOGOS.map(l => ({
          id: l.id,
          name: l.name,
          category: l.category,
          color: l.color,
          defaultTitle: l.defaultTitle,
          defaultBody: l.defaultBody,
        })),
        available_signs: AVAILABLE_SIGNS.map(s => ({
          id: s.id,
          name: s.name,
          color: s.color,
          defaultTitle: s.defaultTitle,
          defaultBody: s.defaultBody,
        })),
        note_colors: ['butter', 'sage', 'coral', 'slate', 'lavender', 'mint'],
        available_stamps: AVAILABLE_STAMPS.map(st => ({
          id: st.id,
          label: st.label,
        })),
        layout_presets: [
          { id: 'smart_flow', description: 'Directional dependency DAG flow (left-to-right)' },
          { id: 'clusters', description: 'Semantic category columns grouping similar themes' },
          { id: 'timeline', description: 'Chronological timeline flow' },
          { id: 'kanban', description: 'To-Do, In Progress, Done sprint board' },
          { id: 'grid', description: 'Clean symmetrical geometric matrix' },
        ],
        node_types: ['default', 'sign', 'logo', 'heading', 'task', 'agent', 'tool', 'database', 'api', 'cloud', 'auth', 'trigger', 'ui'],
      };
    },
  };

  // =========================================================================
  // 3. ADD IDEA / STICKY NOTE (UNIVERSAL NOTE ADDER)
  // =========================================================================
  tools.add_idea_node = {
    name: 'add_idea_node',
    description: 'Create a new sticky note, sign, logo, heading, or task on the whiteboard canvas. Supports flexible parameter names (title, body, text, content, color, nodeType, logoType, signType, stamp, tasks). Auto-places near board center if coordinates are omitted.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Note headline (concise title, e.g. "Payment Webhook")' },
        body: { type: 'string', description: 'Detailed bullet points or supporting text; newlines supported' },
        text: { type: 'string', description: 'Alias for body: the note content' },
        content: { type: 'string', description: 'Alias for body: the note content' },
        x: { type: 'number', description: 'Canvas X position (optional; auto-finds free spot if omitted)' },
        y: { type: 'number', description: 'Canvas Y position (optional; auto-finds free spot if omitted)' },
        color: {
          type: 'string',
          enum: ['butter', 'sage', 'coral', 'slate', 'lavender', 'mint'],
          description: 'Color of the sticky note (default: butter)',
        },
        nodeType: {
          type: 'string',
          enum: ['default', 'agent', 'tool', 'database', 'api', 'cloud', 'auth', 'trigger', 'ui', 'sign', 'logo', 'heading', 'task'],
          description: 'Architectural role badge or element type (default: default)',
        },
        signType: { type: 'string', description: 'Type of sign (e.g. warning, stop, launch, goal, idea, critical, success, construction, security, pinned, loop, experiment, bug, hotfix, milestone, cone, heartbeat, secret, compass, alert, branch, database_sync, coffee, lock)' },
        logoType: { type: 'string', description: 'Tech logo ID (e.g. netlify, nextjs, react, openai, claude, gemini, aws, firebase, supabase, postgres, redis, docker, github, stripe, tailwind, typescript, python, graphql, kubernetes, linear, figma, slack, discord)' },
        stamp: { type: 'string', description: 'Vintage rubber stamp badge (e.g. APPROVED, MVP, URGENT, WIP, HIGH IMPACT, SECURITY RISK, DEPRECATED)' },
        tasks: {
          type: 'array',
          description: 'Array of checklist strings or {text, done} objects for to-do items',
        },
      },
    },
    run: (input: any) => {
      const { title, body } = extractTitleAndBody(input);
      const nodes = actions.getNodes();

      let x = Number.isFinite(input.x) ? Number(input.x) : null;
      let y = Number.isFinite(input.y) ? Number(input.y) : null;

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
      let nodeType = (input.nodeType as NodeType) || 'default';
      const logoType = input.logoType || input.logo || input.brand;
      const signType = input.signType || input.sign || input.status;
      const stamp = input.stamp;
      const tasks = normalizeTasks(input.tasks || input.items || input.checklist);

      if (logoType && nodeType === 'default') nodeType = 'logo';
      if (signType && nodeType === 'default') nodeType = 'sign';
      if (tasks.length > 0 && nodeType === 'default') nodeType = 'task';

      const width = nodeType === 'heading' ? 320 : 230;

      const created = actions.addNode({
        title,
        body,
        x,
        y,
        width,
        color,
        author: 'agent',
        nodeType,
        signType: signType ? String(signType) : undefined,
        logoType: logoType ? String(logoType) : undefined,
        stamp: stamp ? String(stamp) : undefined,
        tasks: tasks.length > 0 ? tasks : undefined,
      });

      actions.addLog({
        toolName: 'add_idea_node',
        input: { title, body, color, nodeType, logoType, signType },
        output: { id: created.id, x, y },
        source: 'agent',
      });

      return {
        success: true,
        node_id: created.id,
        title: created.title,
        body: created.body,
        x: created.x,
        y: created.y,
        color: created.color,
        nodeType: created.nodeType,
        logoType: created.logoType,
        signType: created.signType,
      };
    },
  };

  // Alias add_note -> add_idea_node
  tools.add_note = { ...tools.add_idea_node, name: 'add_note' };

  // =========================================================================
  // 4. ADD TECH / BRAND LOGO (DEDICATED TOOL)
  // =========================================================================
  tools.add_tech_logo = {
    name: 'add_tech_logo',
    description: 'Place a dedicated Brand & Tech Logo card (e.g. Next.js, React, OpenAI GPT-4o, Anthropic Claude, Gemini, AWS Cloud, Netlify, Supabase, Postgres, Redis, Docker, GitHub, Stripe, Tailwind, TypeScript, Python, GraphQL, Kubernetes, Linear, Figma, Slack, Discord) onto the whiteboard canvas.',
    inputSchema: {
      type: 'object',
      properties: {
        logo_id: {
          type: 'string',
          description: 'Tech logo ID: netlify, nextjs, openai, claude, gemini, react, aws, firebase, supabase, postgres, redis, docker, github, stripe, tailwind, typescript, python, graphql, kubernetes, linear, figma, slack, discord',
        },
        title: { type: 'string', description: 'Custom card title (defaults to official brand name if omitted)' },
        body: { type: 'string', description: 'Description or architecture role details (defaults to brand overview if omitted)' },
        text: { type: 'string', description: 'Alias for body' },
        x: { type: 'number', description: 'Canvas X coordinate (optional)' },
        y: { type: 'number', description: 'Canvas Y coordinate (optional)' },
        color: {
          type: 'string',
          enum: ['butter', 'sage', 'coral', 'slate', 'lavender', 'mint'],
          description: 'Background color (default: slate)',
        },
      },
      required: ['logo_id'],
    },
    run: (input: any) => {
      const logoId = String(input.logo_id || input.logo || input.brand || '').toLowerCase().trim();
      let matched = AVAILABLE_LOGOS.find(l => l.id === logoId || l.name.toLowerCase().includes(logoId));
      let resolvedId = matched?.id || logoId;
      let defaultTitle = matched?.defaultTitle || `${logoId.toUpperCase()} Service`;
      let defaultBody = matched?.defaultBody || '';

      if (!matched) {
        const cleanId = logoId.replace(/^gil-/, '');
        const gilMatch = GILBARBARA_LOGOS.find(
          g => g.id === cleanId || g.file.replace('.svg', '') === cleanId || g.name.toLowerCase().includes(cleanId)
        );
        if (gilMatch) {
          resolvedId = `gil-${gilMatch.id}`;
          defaultTitle = gilMatch.name;
          defaultBody = `${gilMatch.name} (${gilMatch.cat.toUpperCase()})`;
        }
      }

      const title = String(input.title || input.label || defaultTitle).trim();
      const body = String(input.body || input.text || input.content || defaultBody).trim();

      const nodes = actions.getNodes();
      let x = Number.isFinite(input.x) ? Number(input.x) : null;
      let y = Number.isFinite(input.y) ? Number(input.y) : null;

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

      const color = (input.color as NoteColor) || 'slate';
      const created = actions.addNode({
        title,
        body,
        x,
        y,
        width: 230,
        color,
        author: 'agent',
        nodeType: 'logo',
        logoType: resolvedId,
      });

      actions.addLog({
        toolName: 'add_tech_logo',
        input: { logo_id: logoId, resolved_id: resolvedId, title, body },
        output: { id: created.id, x, y },
        source: 'agent',
      });

      return {
        success: true,
        node_id: created.id,
        logo_id: created.logoType,
        title: created.title,
        body: created.body,
        x: created.x,
        y: created.y,
      };
    },
  };

  // =========================================================================
  // 4b. SEARCH TECH LOGOS & ROAD SIGNS (DISCOVERY TOOL - 1,900+ LOGOS)
  // =========================================================================
  tools.search_tech_logos = {
    name: 'search_tech_logos',
    description: 'Search through the full catalog of 1,900+ tech logos (including full AWS Suite with 45+ services, Vector DBs, AI models, Frameworks, Languages, DevTools) and Road & Status Signs by keyword or category.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term (e.g. "aws", "database", "ai", "lambda", "qdrant", "snowflake", "kafka", "notion")' },
        category: {
          type: 'string',
          description: 'Filter category: all, cloud, aws, ai, database, framework, infra, tool, language, analytics, payments, signs',
        },
      },
    },
    run: (input: any) => {
      const q = String(input.query || input.search || '').toLowerCase().trim();
      const cat = String(input.category || 'all').toLowerCase().trim();

      const matchedBuiltin = AVAILABLE_LOGOS.filter(l => {
        const matchesCat =
          cat === 'all' ||
          (cat === 'aws' && (l.category === 'cloud' || l.id.startsWith('aws-'))) ||
          l.category === cat;
        if (!matchesCat) return false;
        if (!q) return true;
        return (
          l.id.toLowerCase().includes(q) ||
          l.name.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
        );
      });

      const matchedGilbarbara = GILBARBARA_LOGOS.filter(g => {
        const matchesCat =
          cat === 'all' ||
          (cat === 'aws' && (g.cat === 'cloud' || g.id.startsWith('aws-') || g.name.toLowerCase().includes('aws'))) ||
          g.cat === cat;
        if (!matchesCat) return false;
        if (!q) return true;
        return g.id.toLowerCase().includes(q) || g.name.toLowerCase().includes(q) || g.cat.toLowerCase().includes(q);
      }).slice(0, 80); // Cap at top 80 matches for response size

      const matchedSigns = AVAILABLE_SIGNS.filter(s => {
        if (cat !== 'all' && cat !== 'signs') return false;
        if (!q) return true;
        return s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
      });

      return {
        success: true,
        query: q,
        total_results: matchedBuiltin.length + matchedGilbarbara.length + matchedSigns.length,
        logos: [
          ...matchedBuiltin.map(l => ({
            id: l.id,
            name: l.name,
            category: l.category,
            color: l.color,
          })),
          ...matchedGilbarbara.map(g => ({
            id: `gil-${g.id}`,
            name: g.name,
            category: g.cat,
            file: g.file,
          })),
        ],
        signs: matchedSigns.map(s => ({
          id: s.id,
          name: s.name,
          color: s.color,
        })),
      };
    },
  };

  // =========================================================================
  // 5. ADD STATUS & ROAD SIGN (DEDICATED TOOL)
  // =========================================================================
  tools.add_status_sign = {
    name: 'add_status_sign',
    description: 'Place a Road & Status sign (warning, stop/hard blocker, launch/ship, goal/objective, idea/lightbulb, critical/urgent, success/approved, construction, security, pinned memo, feedback loop, experiment, bug defect, flame hotfix, milestone flag, safety cone, heartbeat health, api secret key, architecture north, incident alert, git branch, database sync, team retro, vault lock) with SVG vector rendering.',
    inputSchema: {
      type: 'object',
      properties: {
        sign_type: {
          type: 'string',
          description: 'Sign type ID: warning, stop, launch, goal, idea, critical, success, construction, security, pinned, loop, experiment, bug, hotfix, milestone, cone, heartbeat, secret, compass, alert, branch, database_sync, coffee, lock',
        },
        title: { type: 'string', description: 'Custom sign title (defaults to sign standard title if omitted)' },
        body: { type: 'string', description: 'Sign explanation or risk details' },
        text: { type: 'string', description: 'Alias for body' },
        x: { type: 'number', description: 'Canvas X position (optional)' },
        y: { type: 'number', description: 'Canvas Y position (optional)' },
      },
      required: ['sign_type'],
    },
    run: (input: any) => {
      const signType = String(input.sign_type || input.sign || input.status || '').toLowerCase().trim();
      const matched = AVAILABLE_SIGNS.find(s => s.id === signType || s.name.toLowerCase().includes(signType));

      const title = String(input.title || input.label || matched?.defaultTitle || 'STATUS SIGN').trim();
      const body = String(input.body || input.text || input.content || matched?.defaultBody || '').trim();

      const nodes = actions.getNodes();
      let x = Number.isFinite(input.x) ? Number(input.x) : null;
      let y = Number.isFinite(input.y) ? Number(input.y) : null;

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

      const created = actions.addNode({
        title,
        body,
        x,
        y,
        width: 230,
        color: 'butter',
        author: 'agent',
        nodeType: 'sign',
        signType: matched?.id || signType,
      });

      actions.addLog({
        toolName: 'add_status_sign',
        input: { sign_type: signType, title, body },
        output: { id: created.id, x, y },
        source: 'agent',
      });

      return {
        success: true,
        node_id: created.id,
        sign_type: created.signType,
        title: created.title,
        body: created.body,
        x: created.x,
        y: created.y,
      };
    },
  };

  // =========================================================================
  // 6. ADD SECTION HEADING (DEDICATED TOOL)
  // =========================================================================
  tools.add_section_heading = {
    name: 'add_section_heading',
    description: 'Add a large, elegant typography banner across the whiteboard to label architectural zones, phases, or topic clusters.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Section title (e.g. "Phase 1: Agentic Ingestion", "Frontend Services")' },
        subtitle: { type: 'string', description: 'Optional subtitle or brief description' },
        text: { type: 'string', description: 'Alias for subtitle' },
        x: { type: 'number', description: 'Canvas X position (optional)' },
        y: { type: 'number', description: 'Canvas Y position (optional)' },
      },
      required: ['title'],
    },
    run: (input: any) => {
      const title = String(input.title || input.label || 'Section Header').trim();
      const body = String(input.subtitle || input.body || input.text || '').trim();

      const nodes = actions.getNodes();
      let x = Number.isFinite(input.x) ? Number(input.x) : null;
      let y = Number.isFinite(input.y) ? Number(input.y) : null;

      if (x === null || y === null) {
        const centroid = getCentroid(nodes);
        const free = findFreeSpot(nodes, centroid.x, centroid.y - 200);
        x = free.x;
        y = free.y;
      }

      const created = actions.addNode({
        title,
        body,
        x,
        y,
        width: 340,
        color: 'butter',
        author: 'agent',
        nodeType: 'heading',
      });

      actions.addLog({
        toolName: 'add_section_heading',
        input: { title, body },
        output: { id: created.id, x, y },
        source: 'agent',
      });

      return { success: true, node_id: created.id, title, subtitle: body, x, y };
    },
  };

  // =========================================================================
  // 7. ADD TASK CHECKLIST (DEDICATED TOOL)
  // =========================================================================
  tools.add_task_checklist = {
    name: 'add_task_checklist',
    description: 'Create an interactive checklist note with checkable to-do items and progress counters.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Checklist headline (e.g. "Sprint Deliverables")' },
        tasks: {
          type: 'array',
          description: 'Array of task strings (e.g. ["Implement auth", "Setup Redis cache", "Run E2E tests"]) or objects with text and done flags',
        },
        body: { type: 'string', description: 'Optional introductory note context' },
        color: {
          type: 'string',
          enum: ['butter', 'sage', 'coral', 'slate', 'lavender', 'mint'],
          description: 'Sticky note color',
        },
        x: { type: 'number', description: 'Canvas X coordinate' },
        y: { type: 'number', description: 'Canvas Y coordinate' },
      },
      required: ['title', 'tasks'],
    },
    run: (input: any) => {
      const title = String(input.title || input.label || 'Action Items').trim();
      const body = String(input.body || input.text || '').trim();
      const tasks = normalizeTasks(input.tasks || input.items || input.checklist);

      const nodes = actions.getNodes();
      let x = Number.isFinite(input.x) ? Number(input.x) : null;
      let y = Number.isFinite(input.y) ? Number(input.y) : null;

      if (x === null || y === null) {
        const centroid = getCentroid(nodes);
        const free = findFreeSpot(nodes, centroid.x + 240, centroid.y);
        x = free.x;
        y = free.y;
      }

      const color = (input.color as NoteColor) || 'sage';
      const created = actions.addNode({
        title,
        body,
        x,
        y,
        width: 240,
        color,
        author: 'agent',
        nodeType: 'task',
        tasks,
      });

      actions.addLog({
        toolName: 'add_task_checklist',
        input: { title, taskCount: tasks.length },
        output: { id: created.id, x, y },
        source: 'agent',
      });

      return {
        success: true,
        node_id: created.id,
        title,
        tasks_count: tasks.length,
        x,
        y,
      };
    },
  };

  // =========================================================================
  // 8. UPDATE NOTE / SET NOTE CONTENT
  // =========================================================================
  tools.update_node = {
    name: 'update_node',
    description: 'Update the text content, title, color, position, type, stamp, or tasks of an existing node.',
    inputSchema: {
      type: 'object',
      properties: {
        node_id: { type: 'string', description: 'ID of the node to update' },
        title: { type: 'string', description: 'New title (optional)' },
        body: { type: 'string', description: 'New body/text content (optional)' },
        text: { type: 'string', description: 'Alias for body: new text content (optional)' },
        content: { type: 'string', description: 'Alias for body: new text content (optional)' },
        color: {
          type: 'string',
          enum: ['butter', 'sage', 'coral', 'slate', 'lavender', 'mint'],
          description: 'New color (optional)',
        },
        nodeType: {
          type: 'string',
          enum: ['default', 'agent', 'tool', 'database', 'api', 'cloud', 'auth', 'trigger', 'ui', 'sign', 'logo', 'heading', 'task'],
          description: 'New node type (optional)',
        },
        signType: { type: 'string', description: 'New sign type (optional)' },
        logoType: { type: 'string', description: 'New tech logo ID (optional)' },
        stamp: { type: 'string', description: 'Rubber stamp badge (optional)' },
        tasks: { type: 'array', description: 'New checklist tasks array (optional)' },
        x: { type: 'number', description: 'New X position (optional)' },
        y: { type: 'number', description: 'New Y position (optional)' },
      },
      required: ['node_id'],
    },
    run: (input: any) => {
      const id = String(input.node_id || input.id || '').trim();
      if (!id) return { success: false, error: 'node_id is required' };

      const updates: Partial<CanvasNode> = {};
      if (input.title !== undefined) updates.title = String(input.title);
      if (input.body !== undefined) updates.body = String(input.body);
      else if (input.text !== undefined) updates.body = String(input.text);
      else if (input.content !== undefined) updates.body = String(input.content);

      if (input.color !== undefined) updates.color = input.color as NoteColor;
      if (input.nodeType !== undefined) updates.nodeType = input.nodeType as NodeType;
      if (input.signType !== undefined) updates.signType = String(input.signType);
      if (input.logoType !== undefined) updates.logoType = String(input.logoType);
      if (input.stamp !== undefined) updates.stamp = String(input.stamp);
      if (input.tasks !== undefined) updates.tasks = normalizeTasks(input.tasks);
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

  // =========================================================================
  // 9. APPEND TEXT TO NOTE (CONCATENATION / PROGRESSIVE EDITING)
  // =========================================================================
  tools.append_text_to_note = {
    name: 'append_text_to_note',
    description: 'Append text or new bullet points to the body of an existing note without overwriting previous content.',
    inputSchema: {
      type: 'object',
      properties: {
        node_id: { type: 'string', description: 'ID of the node to update' },
        text: { type: 'string', description: 'Text or bullet points to append' },
        body: { type: 'string', description: 'Alias for text' },
      },
      required: ['node_id'],
    },
    run: (input: any) => {
      const id = String(input.node_id || input.id || '').trim();
      const textToAppend = String(input.text || input.body || input.content || '').trim();
      if (!id) return { success: false, error: 'node_id is required' };
      if (!textToAppend) return { success: false, error: 'text is required' };

      const nodes = actions.getNodes();
      const node = nodes.find(n => n.id === id);
      if (!node) return { success: false, error: `Node ${id} not found` };

      const newBody = node.body ? `${node.body}\n${textToAppend}` : textToAppend;
      const ok = actions.updateNode(id, { body: newBody });

      return { success: ok, node_id: id, current_body: newBody };
    },
  };

  // =========================================================================
  // 10. DELETE NODE
  // =========================================================================
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
    run: (input: any) => {
      const id = String(input.node_id || input.id || '').trim();
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

  // =========================================================================
  // 11. CONNECT NODES (DIRECTED CONNECTION WIRES)
  // =========================================================================
  tools.connect_nodes = {
    name: 'connect_nodes',
    description: 'Draw a directional connection wire between two notes with an optional semantic relationship label.',
    inputSchema: {
      type: 'object',
      properties: {
        source_id: { type: 'string', description: 'ID of the origin node' },
        target_id: { type: 'string', description: 'ID of the destination node' },
        label: { type: 'string', description: 'Relationship description (e.g. "leads to", "depends on", "triggers", "reads from")' },
      },
      required: ['source_id', 'target_id'],
    },
    run: (input: any) => {
      const src = String(input.source_id || input.from || '').trim();
      const tgt = String(input.target_id || input.to || '').trim();
      const label = String(input.label || input.relationship || '').trim();

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

  // =========================================================================
  // 12. ARRANGE LAYOUT
  // =========================================================================
  tools.arrange_layout = {
    name: 'arrange_layout',
    description: 'Smoothly rearrange all notes on the canvas using an organizational preset algorithm.',
    inputSchema: {
      type: 'object',
      properties: {
        preset: {
          type: 'string',
          enum: ['smart_flow', 'clusters', 'timeline', 'kanban', 'grid'],
          description: 'Layout algorithm to apply (smart_flow, clusters, timeline, kanban, grid)',
        },
      },
      required: ['preset'],
    },
    run: (input: any) => {
      const preset = String(input.preset || input.algorithm || 'smart_flow');
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

  // =========================================================================
  // 13. HIGHLIGHT / FOCUS NODE
  // =========================================================================
  tools.highlight_node = {
    name: 'highlight_node',
    description: 'Pan the camera directly to a specific note and render a glowing spotlight beacon with an explanation bubble.',
    inputSchema: {
      type: 'object',
      properties: {
        node_id: { type: 'string', description: 'ID of the node to focus' },
        reason: { type: 'string', description: 'Short note explaining why the agent is focusing here' },
      },
      required: ['node_id'],
    },
    run: (input: any) => {
      const id = String(input.node_id || input.id || '').trim();
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

  // =========================================================================
  // 14. BATCH CREATE CONNECTED NODES
  // =========================================================================
  tools.batch_create_nodes = {
    name: 'batch_create_nodes',
    description: 'Create multiple connected notes, tech logos, signs, headings, or tasks at once with automatic link creation and layout.',
    inputSchema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          description: 'Array of items to create (each can specify title, body/text, color, nodeType, logoType, signType, tasks)',
        },
        links: {
          type: 'array',
          description: 'Array of links connecting nodes by title, index, or ID (e.g. [{ sourceTitle: "A", targetTitle: "B", label: "leads to" }])',
        },
      },
      required: ['items'],
    },
    run: (input: any) => {
      const items = Array.isArray(input.items) ? input.items : [];
      if (!items.length) return { success: false, error: 'items array is required and cannot be empty' };

      const createdList: CanvasNode[] = [];
      const titleToId = new Map<string, string>();

      items.forEach((item: any, idx: number) => {
        const { title, body } = extractTitleAndBody(item);
        const nodeType = (item.nodeType as NodeType) || (item.logoType ? 'logo' : item.signType ? 'sign' : item.tasks ? 'task' : 'default');

        const created = actions.addNode({
          title: title || `Node ${idx + 1}`,
          body,
          x: typeof item.x === 'number' ? item.x : idx * 260 - 260,
          y: typeof item.y === 'number' ? item.y : 100,
          width: nodeType === 'heading' ? 320 : 230,
          color: (item.color as NoteColor) || 'butter',
          author: 'agent',
          nodeType,
          logoType: item.logoType || item.logo,
          signType: item.signType || item.sign,
          stamp: item.stamp,
          tasks: normalizeTasks(item.tasks || item.items),
        });

        createdList.push(created);
        titleToId.set(created.title.toLowerCase().trim(), created.id);
        titleToId.set(String(idx), created.id);
      });

      if (Array.isArray(input.links)) {
        input.links.forEach((l: any) => {
          let srcId = l.source_id || l.from;
          let tgtId = l.target_id || l.to;
          if (!srcId && l.sourceTitle) srcId = titleToId.get(String(l.sourceTitle).toLowerCase().trim());
          if (!tgtId && l.targetTitle) tgtId = titleToId.get(String(l.targetTitle).toLowerCase().trim());
          if (!srcId && l.sourceIndex !== undefined) srcId = titleToId.get(String(l.sourceIndex));
          if (!tgtId && l.targetIndex !== undefined) tgtId = titleToId.get(String(l.targetIndex));

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

  // =========================================================================
  // 15. SEARCH CANVAS
  // =========================================================================
  tools.search_canvas = {
    name: 'search_canvas',
    description: 'Search across all note titles, bodies, checklists, and tags on the canvas, highlighting matching nodes and returning coordinates.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term or keyword' },
      },
      required: ['query'],
    },
    run: (input: any) => {
      const q = String(input.query || input.search || '').toLowerCase().trim();
      if (!q) return { success: false, error: 'query is required' };

      const nodes = actions.getNodes();
      const matches = nodes.filter(n => {
        const titleMatch = n.title.toLowerCase().includes(q);
        const bodyMatch = n.body.toLowerCase().includes(q);
        const taskMatch = (n.tasks || []).some(t => t.text.toLowerCase().includes(q));
        const tagMatch = (n.tags || []).some(tag => tag.toLowerCase().includes(q));
        return titleMatch || bodyMatch || taskMatch || tagMatch;
      });

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
          nodeType: n.nodeType || 'default',
          logoType: n.logoType,
          signType: n.signType,
          x: n.x,
          y: n.y,
          author: n.author,
        })),
      };
    },
  };

  // =========================================================================
  // 16. CLEAR CANVAS
  // =========================================================================
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
    run: (input: any) => {
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

  // =========================================================================
  // 17. EXPORT CANVAS
  // =========================================================================
  tools.export_canvas = {
    name: 'export_canvas',
    description: 'Export the current whiteboard as a formatted Markdown executive brief, Mermaid graph diagram, or JSON state.',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['markdown', 'mermaid', 'json'],
          description: 'Export format (markdown, mermaid, or json)',
        },
      },
      required: ['format'],
    },
    run: (input: any) => {
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

  // =========================================================================
  // 18. CLUSTER BY TOPIC
  // =========================================================================
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

  // =========================================================================
  // 19. CREATE NEW BOARD
  // =========================================================================
  tools.create_new_board = {
    name: 'create_new_board',
    description: 'Create a fresh, dedicated whiteboard canvas for a new project or separate architecture diagram.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title or topic for the new canvas' },
      },
      required: ['title'],
    },
    run: (input: any) => {
      const title = String(input.title || input.name || 'New Canvas').trim();
      const newBoardId = actions.createNewBoard ? actions.createNewBoard(title) : 'board_' + Date.now();
      return {
        success: true,
        board_id: newBoardId,
        title,
        message: `Created new whiteboard canvas: "${title}"`,
      };
    },
  };

  // =========================================================================
  // 20. GET BOARD SUMMARY & METRICS
  // =========================================================================
  tools.get_board_summary = {
    name: 'get_board_summary',
    description: 'Returns a high-level semantic synopsis of the canvas: coherence score, human vs agent ratio, orphan notes, central bottlenecks, and dominant themes.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    run: () => {
      const nodes = actions.getNodes();
      const edges = actions.getEdges();
      const health = analyzeBoardHealth(nodes, edges);

      const humanNodes = nodes.filter(n => n.author === 'human');
      const agentNodes = nodes.filter(n => n.author === 'agent');

      return {
        success: true,
        summary: `Canvas contains ${nodes.length} notes and ${edges.length} connections with ${health.score}% coherence score.`,
        stats: {
          total_notes: nodes.length,
          total_links: edges.length,
          human_notes: humanNodes.length,
          agent_notes: agentNodes.length,
          coherence_score: health.score,
          coherence_grade: health.grade,
        },
        orphan_notes: health.orphanNodes.map(n => ({ id: n.id, title: n.title })),
        central_anchors: health.bottleneckNodes.map(n => ({ id: n.id, title: n.title })),
        insights: health.insights,
        titles_overview: nodes.map(n => n.title),
      };
    },
  };

  // =========================================================================
  // 21. GET NODE CONTEXT (LOCAL GRAPH NEIGHBORHOOD)
  // =========================================================================
  tools.get_node_context = {
    name: 'get_node_context',
    description: 'Inspect the deep local graph context around a specific note: incoming parent notes, outgoing child notes, relationship labels, and connections.',
    inputSchema: {
      type: 'object',
      properties: {
        node_id: { type: 'string', description: 'ID of the node to inspect' },
      },
      required: ['node_id'],
    },
    run: (input: any) => {
      const id = String(input.node_id || input.id || '').trim();
      if (!id) return { success: false, error: 'node_id is required' };

      const nodes = actions.getNodes();
      const edges = actions.getEdges();
      const target = nodes.find(n => n.id === id);

      if (!target) return { success: false, error: `Node ${id} not found` };

      const incomingEdges = edges.filter(e => e.to === id);
      const outgoingEdges = edges.filter(e => e.from === id);

      const incomingNodes = incomingEdges.map(e => ({
        edge_id: e.id,
        relationship: e.label || 'connects to',
        source_node: nodes.find(n => n.id === e.from),
      }));

      const outgoingNodes = outgoingEdges.map(e => ({
        edge_id: e.id,
        relationship: e.label || 'leads to',
        target_node: nodes.find(n => n.id === e.to),
      }));

      return {
        success: true,
        target_node: {
          id: target.id,
          title: target.title,
          body: target.body,
          color: target.color,
          author: target.author,
          nodeType: target.nodeType || 'default',
          logoType: target.logoType,
          signType: target.signType,
          stamp: target.stamp,
          tasks: target.tasks,
        },
        incoming_context: incomingNodes,
        outgoing_context: outgoingNodes,
        total_connections: incomingEdges.length + outgoingEdges.length,
      };
    },
  };

  // =========================================================================
  // 22. GET TEMPLATES LIST
  // =========================================================================
  tools.get_templates_list = {
    name: 'get_templates_list',
    description: 'List all pre-built strategy, engineering, product, and launch templates available in Boardify.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    run: () => {
      return {
        success: true,
        template_count: BOARD_TEMPLATES.length,
        templates: BOARD_TEMPLATES.map(t => ({
          id: t.id,
          title: t.title,
          category: t.category,
          badge: t.badge,
          description: t.description,
          node_count: t.nodes.length,
          suggested_prompt: t.suggestedPrompt,
        })),
      };
    },
  };

  // =========================================================================
  // 23. APPLY TEMPLATE
  // =========================================================================
  tools.apply_template = {
    name: 'apply_template',
    description: 'Load and instantiate a complete pre-built strategy or engineering template directly onto the whiteboard canvas.',
    inputSchema: {
      type: 'object',
      properties: {
        template_id: { type: 'string', description: 'ID of the template to apply (e.g. "startup-gtm", "yc-pitch-deck", "multi-agent-swarm")' },
      },
      required: ['template_id'],
    },
    run: (input: any) => {
      const templateId = String(input.template_id || input.template || '').trim();
      const template = BOARD_TEMPLATES.find(t => t.id === templateId);

      if (!template) {
        return {
          success: false,
          error: `Template "${templateId}" not found. Call get_templates_list to see available templates.`,
        };
      }

      const createdNodes: CanvasNode[] = [];
      template.nodes.forEach(n => {
        const created = actions.addNode({
          title: n.title,
          body: n.body,
          x: n.x,
          y: n.y,
          width: n.width || 230,
          color: n.color || 'butter',
          author: n.author || 'agent',
          nodeType: n.nodeType || 'default',
        });
        createdNodes.push(created);
      });

      if (template.edges) {
        template.edges.forEach(e => {
          const src = createdNodes[e.sourceIndex];
          const tgt = createdNodes[e.targetIndex];
          if (src && tgt) {
            actions.connectNodes(src.id, tgt.id, e.label);
          }
        });
      }

      actions.animateLayout(calculateSmartFlowTargets(actions.getNodes(), actions.getEdges()));

      return {
        success: true,
        template_id: template.id,
        template_title: template.title,
        notes_created: createdNodes.length,
        links_created: template.edges?.length || 0,
      };
    },
  };

  // =========================================================================
  // 15. RENDER DIAGRAM AS CODE (ERASER + MERMAID DSL ENGINE)
  // =========================================================================
  tools.render_diagram_dsl = {
    name: 'render_diagram_dsl',
    description: 'Render an entire software/cloud architecture or flowchart on the whiteboard from concise Diagram-as-Code DSL or Mermaid syntax in ONE call with automatic topological DAG layout.',
    inputSchema: {
      type: 'object',
      properties: {
        dsl: {
          type: 'string',
          description: 'Diagram DSL or Mermaid text (e.g. `Client [icon: react] -> Gateway [icon: aws-api-gateway] -> Lambda [icon: aws-lambda] -> DB [icon: aws-dynamodb]`). Supports all 1,882+ logos and road signs.',
        },
        direction: {
          type: 'string',
          description: 'Flow direction: "LR" (Left to Right) or "TB" (Top to Bottom). Default: "LR"',
        },
        append: {
          type: 'boolean',
          description: 'Whether to append to the existing board (true) or replace the canvas (false). Default: false',
        },
      },
      required: ['dsl'],
    },
    run: (input: any) => {
      const dslText = String(input.dsl || input.code || input.text || '').trim();
      if (!dslText) {
        return { success: false, error: 'DSL code is required' };
      }

      const append = Boolean(input.append);
      const parsed = parseDiagramDsl(dslText);
      if (input.direction === 'TB' || input.direction === 'LR') {
        parsed.direction = input.direction;
      }

      const existingNodes = actions.getNodes();
      const originX = append && existingNodes.length > 0 ? Math.max(...existingNodes.map(n => n.x)) + 380 : 200;
      const originY = 200;

      const result = layoutDiagramDsl(parsed, originX, originY);

      if (actions.addNodesAndEdges) {
        actions.addNodesAndEdges(result.nodes, result.edges, append);
      } else {
        if (!append) actions.clearCanvas();
        const createdMap = new Map<string, string>();
        result.nodes.forEach(n => {
          const created = actions.addNode(n);
          createdMap.set(n.id, created.id);
        });
        result.edges.forEach(e => {
          const srcId = createdMap.get(e.from) || e.from;
          const tgtId = createdMap.get(e.to) || e.to;
          actions.connectNodes(srcId, tgtId, e.label);
        });
      }

      actions.addLog({
        toolName: 'render_diagram_dsl',
        input: { direction: parsed.direction, append, nodes_count: result.nodes.length, edges_count: result.edges.length },
        output: { nodes: result.nodes.length, edges: result.edges.length },
        source: 'agent',
      });

      return {
        success: true,
        nodes_created: result.nodes.length,
        edges_created: result.edges.length,
        direction: parsed.direction,
        nodes: result.nodes.map(n => ({ id: n.id, title: n.title, nodeType: n.nodeType, logoType: n.logoType })),
      };
    },
  };

  // =========================================================================
  // 16. EXPORT DIAGRAM AS CODE (DIFFABLE DSL / MERMAID)
  // =========================================================================
  tools.export_diagram_dsl = {
    name: 'export_diagram_dsl',
    description: 'Export the current whiteboard canvas into human-readable, diffable Eraser-style DSL or Mermaid flowchart code for LLM reasoning or documentation.',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          description: 'Format to export: "dsl" (Eraser/WebMCP DSL) or "mermaid" (Mermaid Flowchart). Default: "dsl"',
        },
      },
    },
    run: (input: any) => {
      const format = String(input.format || 'dsl').toLowerCase().trim();
      const nodes = actions.getNodes();
      const edges = actions.getEdges();

      const code = format === 'mermaid' ? exportCanvasToMermaid(nodes, edges) : exportCanvasToDsl(nodes, edges);

      return {
        success: true,
        format,
        code,
        node_count: nodes.length,
        edge_count: edges.length,
      };
    },
  };

  // =========================================================================
  // 17. SEMANTIC RELATIVE SPATIAL PLACEMENT
  // =========================================================================
  tools.place_relative_to = {
    name: 'place_relative_to',
    description: 'Place a new note, logo, or sign relative to an existing anchor node (below, right, left, above) without guessing coordinates, and optionally draw a connecting wire.',
    inputSchema: {
      type: 'object',
      properties: {
        anchor_id: { type: 'string', description: 'ID or title of the existing anchor node' },
        position: {
          type: 'string',
          description: 'Relative position: "below", "right", "left", "above" (default: "right")',
        },
        distance: { type: 'number', description: 'Distance in pixels from anchor node (default: 260)' },
        title: { type: 'string', description: 'Title or label of the new note/logo' },
        body: { type: 'string', description: 'Description or details' },
        node_type: { type: 'string', description: 'Node type: default, logo, sign, database, api, agent' },
        logo_id: { type: 'string', description: 'Logo ID (e.g. "aws-lambda", "react", "postgres") if node_type is logo' },
        sign_type: { type: 'string', description: 'Sign type (e.g. "warning", "stop", "launch") if node_type is sign' },
        color: { type: 'string', description: 'Color: butter, sage, coral, slate, lavender, mint' },
        connect_from_anchor: { type: 'boolean', description: 'Automatically draw a connecting wire from anchor to new note (default: true)' },
        connection_label: { type: 'string', description: 'Optional text label on the connecting wire' },
      },
      required: ['anchor_id'],
    },
    run: (input: any) => {
      const anchorQuery = String(input.anchor_id || '').toLowerCase().trim();
      const nodes = actions.getNodes();
      const anchor = nodes.find(n => n.id.toLowerCase() === anchorQuery || n.title.toLowerCase().includes(anchorQuery));

      if (!anchor) {
        return { success: false, error: `Anchor node "${input.anchor_id}" not found on canvas` };
      }

      const position = String(input.position || 'right').toLowerCase();
      const dist = Number.isFinite(input.distance) ? Number(input.distance) : 260;

      let newX = anchor.x;
      let newY = anchor.y;

      if (position === 'below' || position === 'down' || position === 'bottom') {
        newY = anchor.y + (anchor.height || 160) + dist - 60;
      } else if (position === 'left') {
        newX = anchor.x - anchor.width - dist + 60;
      } else if (position === 'above' || position === 'up' || position === 'top') {
        newY = anchor.y - (anchor.height || 160) - dist + 60;
      } else {
        // default: right
        newX = anchor.x + anchor.width + dist - 60;
      }

      const free = findFreeSpot(nodes, newX, newY);
      const title = String(input.title || input.label || 'New Service').trim();
      const body = String(input.body || input.text || '').trim();
      const nodeType = (input.node_type as NodeType) || (input.logo_id ? 'logo' : input.sign_type ? 'sign' : 'default');
      const color = (input.color as NoteColor) || (nodeType === 'logo' ? 'slate' : nodeType === 'sign' ? 'coral' : 'butter');

      const created = actions.addNode({
        title,
        body,
        x: free.x,
        y: free.y,
        width: nodeType === 'logo' ? 140 : 230,
        color,
        author: 'agent',
        nodeType,
        logoType: input.logo_id,
        signType: input.sign_type,
      });

      let edgeCreated: CanvasEdge | null = null;
      if (input.connect_from_anchor !== false) {
        edgeCreated = actions.connectNodes(anchor.id, created.id, input.connection_label);
      }

      actions.addLog({
        toolName: 'place_relative_to',
        input: { anchor_id: anchor.id, position, title, node_type: nodeType },
        output: { id: created.id, x: created.x, y: created.y },
        source: 'agent',
      });

      return {
        success: true,
        node_id: created.id,
        title: created.title,
        position,
        x: created.x,
        y: created.y,
        connected_to_anchor: Boolean(edgeCreated),
      };
    },
  };

  // =========================================================================
  // 18. ALIGN AND DISTRIBUTE NODES
  // =========================================================================
  tools.align_and_distribute_nodes = {
    name: 'align_and_distribute_nodes',
    description: 'Align multiple nodes along an axis (left, center, right, top, middle, bottom) and/or evenly distribute them with clean spacing.',
    inputSchema: {
      type: 'object',
      properties: {
        node_ids: {
          type: 'array',
          description: 'Optional array of node IDs to align (if omitted, all canvas nodes are organized)',
        },
        alignment: {
          type: 'string',
          description: 'Alignment axis: "left", "center", "right", "top", "middle", "bottom"',
        },
        distribution: {
          type: 'string',
          description: 'Even distribution: "horizontal" or "vertical"',
        },
        spacing: {
          type: 'number',
          description: 'Spacing between distributed nodes (default: 180)',
        },
      },
    },
    run: (input: any) => {
      const allNodes = actions.getNodes();
      const nodeIds = Array.isArray(input.node_ids) && input.node_ids.length > 0 ? (input.node_ids as string[]) : allNodes.map(n => n.id);
      const targetNodes = allNodes.filter(n => nodeIds.includes(n.id));

      if (targetNodes.length < 2) {
        return { success: false, error: 'At least 2 nodes required for alignment or distribution' };
      }

      const alignment = String(input.alignment || '').toLowerCase();
      const distribution = String(input.distribution || '').toLowerCase();
      const spacing = Number.isFinite(input.spacing) ? Number(input.spacing) : 180;

      const targetMap = new Map<string, { x: number; y: number }>();

      // 1. Handle Alignment
      if (alignment === 'left') {
        const minX = Math.min(...targetNodes.map(n => n.x));
        targetNodes.forEach(n => targetMap.set(n.id, { x: minX, y: n.y }));
      } else if (alignment === 'right') {
        const maxRight = Math.max(...targetNodes.map(n => n.x + n.width));
        targetNodes.forEach(n => targetMap.set(n.id, { x: maxRight - n.width, y: n.y }));
      } else if (alignment === 'center') {
        const avgCenter = targetNodes.reduce((acc, n) => acc + (n.x + n.width / 2), 0) / targetNodes.length;
        targetNodes.forEach(n => targetMap.set(n.id, { x: Math.round(avgCenter - n.width / 2), y: n.y }));
      } else if (alignment === 'top') {
        const minY = Math.min(...targetNodes.map(n => n.y));
        targetNodes.forEach(n => targetMap.set(n.id, { x: n.x, y: minY }));
      } else if (alignment === 'bottom') {
        const maxBottom = Math.max(...targetNodes.map(n => n.y + (n.height || 160)));
        targetNodes.forEach(n => targetMap.set(n.id, { x: n.x, y: maxBottom - (n.height || 160) }));
      } else if (alignment === 'middle') {
        const avgMid = targetNodes.reduce((acc, n) => acc + (n.y + (n.height || 160) / 2), 0) / targetNodes.length;
        targetNodes.forEach(n => targetMap.set(n.id, { x: n.x, y: Math.round(avgMid - (n.height || 160) / 2) }));
      }

      // 2. Handle Distribution
      if (distribution === 'horizontal') {
        const sorted = [...targetNodes].sort((a, b) => a.x - b.x);
        const startX = sorted[0].x;
        sorted.forEach((n, idx) => {
          const prev = targetMap.get(n.id) || { x: n.x, y: n.y };
          targetMap.set(n.id, { x: startX + idx * spacing, y: prev.y });
        });
      } else if (distribution === 'vertical') {
        const sorted = [...targetNodes].sort((a, b) => a.y - b.y);
        const startY = sorted[0].y;
        sorted.forEach((n, idx) => {
          const prev = targetMap.get(n.id) || { x: n.x, y: n.y };
          targetMap.set(n.id, { x: prev.x, y: startY + idx * spacing });
        });
      }

      if (targetMap.size > 0) {
        actions.animateLayout(targetMap);
      }

      return {
        success: true,
        aligned_nodes: targetMap.size,
        alignment: alignment || 'none',
        distribution: distribution || 'none',
      };
    },
  };

  // =========================================================================
  // 19. INSPECT VISUAL HIERARCHY & LAYOUT HEALTH (VISUAL QA TOOL)
  // =========================================================================
  tools.inspect_visual_hierarchy = {
    name: 'inspect_visual_hierarchy',
    description: 'Analyze whiteboard spatial geometry and visual hierarchy. Detects overlapping notes, disconnected orphan nodes, bounding-box extent, and returns layout quality diagnostics for closed-loop AI evaluation.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    run: () => {
      const nodes = actions.getNodes();
      const edges = actions.getEdges();

      if (nodes.length === 0) {
        return {
          success: true,
          status: 'empty',
          total_nodes: 0,
          total_edges: 0,
          overlaps: [],
          orphan_nodes: [],
          recommendations: ['Canvas is empty. Add architecture components or use render_diagram_dsl.'],
        };
      }

      // 1. Detect Overlapping Bounding Boxes
      const overlaps: Array<{ nodeA: string; nodeB: string; distance: number }> = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const aH = a.height || 160;
          const bH = b.height || 160;

          const xOverlap = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
          const yOverlap = Math.max(0, Math.min(a.y + aH, b.y + bH) - Math.max(a.y, b.y));

          if (xOverlap > 10 && yOverlap > 10) {
            const dist = Math.round(Math.hypot(a.x - b.x, a.y - b.y));
            overlaps.push({
              nodeA: `${a.title} (${a.id})`,
              nodeB: `${b.title} (${b.id})`,
              distance: dist,
            });
          }
        }
      }

      // 2. Detect Disconnected Orphan Nodes
      const connectedSet = new Set<string>();
      edges.forEach(e => {
        connectedSet.add(e.from);
        connectedSet.add(e.to);
      });
      const orphanNodes = nodes.filter(n => !connectedSet.has(n.id) && n.nodeType !== 'heading').map(n => ({ id: n.id, title: n.title }));

      // 3. Compute Bounding Box
      const minX = Math.min(...nodes.map(n => n.x));
      const maxX = Math.max(...nodes.map(n => n.x + n.width));
      const minY = Math.min(...nodes.map(n => n.y));
      const maxY = Math.max(...nodes.map(n => n.y + (n.height || 160)));

      // 4. Generate Recommendations
      const recommendations: string[] = [];
      if (overlaps.length > 0) {
        recommendations.push(`Fix ${overlaps.length} overlapping note pairs using arrange_layout (flow/cluster) or align_and_distribute_nodes.`);
      }
      if (orphanNodes.length > 2 && edges.length > 0) {
        recommendations.push(`${orphanNodes.length} nodes are disconnected. Connect them with connect_notes to clarify data flow.`);
      }
      if (recommendations.length === 0) {
        recommendations.push('Whiteboard layout is clean, well-spaced, and properly connected.');
      }

      return {
        success: true,
        total_nodes: nodes.length,
        total_edges: edges.length,
        overlap_count: overlaps.length,
        overlaps,
        orphan_count: orphanNodes.length,
        orphan_nodes: orphanNodes.slice(0, 10),
        canvas_bounds: { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY },
        recommendations,
      };
    },
  };

  // =========================================================================
  // 20. CAPTURE CANVAS SCREENSHOT (VISION MODEL FEEDBACK)
  // =========================================================================
  tools.capture_canvas_screenshot = {
    name: 'capture_canvas_screenshot',
    description: 'Capture a visual snapshot of the whiteboard for visual QA or embedding in reports.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    run: async () => {
      let dataUrl: string | null = null;
      if (actions.captureScreenshot) {
        try {
          dataUrl = await actions.captureScreenshot();
        } catch (_) {}
      }

      const nodes = actions.getNodes();
      const edges = actions.getEdges();

      return {
        success: true,
        screenshot_data_url: dataUrl || null,
        node_count: nodes.length,
        edge_count: edges.length,
        message: dataUrl
          ? 'Canvas screenshot captured successfully as base64 image data URI'
          : 'Canvas snapshot recorded with node coordinates and topology',
      };
    },
  };

  // =========================================================================
  // 21. CREATE CHECKPOINT & TIME-TRAVEL SNAPSHOTS
  // =========================================================================
  tools.create_checkpoint = {
    name: 'create_checkpoint',
    description: 'Create a named milestone checkpoint of the current canvas state for safe rollback before executing large modifications.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name or description of the checkpoint (e.g. "Pre-Refactor Architecture")' },
      },
    },
    run: (input: any) => {
      const name = String(input.name || 'Checkpoint ' + new Date().toLocaleTimeString()).trim();
      let checkpoint: CanvasCheckpoint;

      if (actions.createCheckpoint) {
        checkpoint = actions.createCheckpoint(name);
      } else {
        const nodes = actions.getNodes();
        const edges = actions.getEdges();
        checkpoint = {
          id: 'cp-' + Date.now(),
          name,
          timestamp: Date.now(),
          nodeCount: nodes.length,
          edgeCount: edges.length,
        };
      }

      return {
        success: true,
        checkpoint,
        message: `Created canvas checkpoint "${checkpoint.name}" with ${checkpoint.nodeCount} notes and ${checkpoint.edgeCount} connections.`,
      };
    },
  };

  // =========================================================================
  // 22. RESTORE CHECKPOINT
  // =========================================================================
  tools.restore_checkpoint = {
    name: 'restore_checkpoint',
    description: 'Restore the canvas state to a previously saved checkpoint by name or ID.',
    inputSchema: {
      type: 'object',
      properties: {
        checkpoint_id_or_name: {
          type: 'string',
          description: 'The ID or name of the checkpoint to restore',
        },
      },
      required: ['checkpoint_id_or_name'],
    },
    run: (input: any) => {
      const target = String(input.checkpoint_id_or_name || '').trim();
      let restored = false;

      if (actions.restoreCheckpoint) {
        restored = actions.restoreCheckpoint(target);
      }

      if (!restored) {
        return { success: false, error: `Checkpoint "${target}" not found or restore failed.` };
      }

      return {
        success: true,
        message: `Canvas restored to checkpoint "${target}".`,
      };
    },
  };

  // =========================================================================
  // 23. LIST CHECKPOINTS
  // =========================================================================
  tools.list_checkpoints = {
    name: 'list_checkpoints',
    description: 'List all available canvas milestone checkpoints with timestamp and node counts.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    run: () => {
      const list = actions.listCheckpoints ? actions.listCheckpoints() : [];
      return {
        success: true,
        total_checkpoints: list.length,
        checkpoints: list,
      };
    },
  };

  // =========================================================================
  // 24. UNDO LAST ACTION & REDO
  // =========================================================================
  tools.undo_last_action = {
    name: 'undo_last_action',
    description: 'Undo the last canvas modification (creating, deleting, or moving notes).',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    run: () => {
      const undone = actions.undo ? actions.undo() : false;
      return {
        success: undone,
        message: undone ? 'Undid last canvas action' : 'Nothing to undo',
      };
    },
  };

  tools.redo_action = {
    name: 'redo_action',
    description: 'Redo the previously undone canvas action.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    run: () => {
      const redone = actions.redo ? actions.redo() : false;
      return {
        success: redone,
        message: redone ? 'Redid canvas action' : 'Nothing to redo',
      };
    },
  };

  tools.select_canvas_elements = {
    name: 'select_canvas_elements',
    description: 'Selects one or more nodes/elements on the whiteboard canvas by ID, or selects all nodes, or clears selection.',
    inputSchema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of node IDs to select.',
        },
        selectAll: {
          type: 'boolean',
          description: 'Set to true to select all elements currently on the canvas.',
        },
        clearSelection: {
          type: 'boolean',
          description: 'Set to true to clear all active selections.',
        },
      },
    },
    run: input => {
      const nodes = actions.getNodes();
      if (input.clearSelection) {
        if (actions.selectNodes) actions.selectNodes([]);
        return { success: true, selectedCount: 0, message: 'Cleared canvas selection' };
      }
      if (input.selectAll) {
        const allIds = nodes.map(n => n.id);
        if (actions.selectNodes) actions.selectNodes(allIds);
        return { success: true, selectedCount: allIds.length, selectedIds: allIds };
      }
      const targetIds = Array.isArray(input.ids) ? (input.ids as string[]) : [];
      const validIds = targetIds.filter(id => nodes.some(n => n.id === id));
      if (actions.selectNodes) actions.selectNodes(validIds);
      return {
        success: true,
        selectedCount: validIds.length,
        selectedIds: validIds,
        message: `Selected ${validIds.length} element(s)`,
      };
    },
  };

  tools.resize_node = {
    name: 'resize_node',
    description: 'Resizes a note, logo, heading, or sign element to specified width/height and adjusts typography font size.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Node ID to resize.' },
        width: { type: 'number', description: 'New width in pixels (140 to 800).' },
        height: { type: 'number', description: 'New height in pixels (80 to 1000).' },
        sizePreset: {
          type: 'string',
          enum: ['S', 'M', 'L', 'XL'],
          description: 'Quick size preset: S (180px), M (240px), L (340px), XL (480px).',
        },
        fontSize: {
          type: 'string',
          enum: ['sm', 'md', 'lg', 'xl', '2xl'],
          description: 'Typography scale for title and body.',
        },
      },
      required: ['id'],
    },
    run: input => {
      const id = String(input.id || '').trim();
      const node = actions.getNodes().find(n => n.id === id);
      if (!node) {
        return { success: false, error: `Node with id "${id}" not found.` };
      }

      let width = node.width || 240;
      if (typeof input.width === 'number') {
        width = Math.max(140, Math.min(850, input.width));
      } else if (input.sizePreset === 'S') width = 180;
      else if (input.sizePreset === 'M') width = 240;
      else if (input.sizePreset === 'L') width = 340;
      else if (input.sizePreset === 'XL') width = 480;

      const height = typeof input.height === 'number' ? Math.max(80, Math.min(1000, input.height)) : node.height;
      const fontSize = (input.fontSize as any) || node.fontSize;

      actions.updateNode(id, { width, height, fontSize });
      return {
        success: true,
        nodeId: id,
        newDimensions: { width, height, fontSize },
        message: `Resized node "${node.title}" to ${width}px width.`,
      };
    },
  };

  tools.edit_node_content = {
    name: 'edit_node_content',
    description: 'Edits the rich content, title, body, markdown, color, tasks, or styling of a canvas note or architecture element.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Node ID to edit.' },
        title: { type: 'string', description: 'Updated title header.' },
        body: { type: 'string', description: 'Updated body text, markdown description, or bullet points.' },
        color: {
          type: 'string',
          enum: ['butter', 'sage', 'coral', 'slate', 'lavender', 'mint'],
          description: 'Sticky note color theme.',
        },
        fontSize: {
          type: 'string',
          enum: ['sm', 'md', 'lg', 'xl', '2xl'],
          description: 'Typography font scale.',
        },
        tasks: {
          type: 'array',
          description: 'Checklist items array [{ id?: string, text: string, done?: boolean }].',
        },
        stamp: { type: 'string', description: 'Rubber stamp label (e.g. APPROVED, WIP, BLOCKER, DONE).' },
      },
      required: ['id'],
    },
    run: input => {
      const id = String(input.id || '').trim();
      const node = actions.getNodes().find(n => n.id === id);
      if (!node) {
        return { success: false, error: `Node with id "${id}" not found.` };
      }

      const updates: Partial<CanvasNode> = {};
      if (typeof input.title === 'string') updates.title = input.title.trim();
      if (typeof input.body === 'string') updates.body = input.body;
      if (typeof input.color === 'string') updates.color = input.color as NoteColor;
      if (typeof input.fontSize === 'string') updates.fontSize = input.fontSize as any;
      if (typeof input.stamp === 'string') updates.stamp = input.stamp;
      if (Array.isArray(input.tasks)) {
        updates.tasks = input.tasks.map((t: any, idx: number) => ({
          id: t.id || `t_${idx}_${Date.now()}`,
          text: String(t.text || 'Task item'),
          done: Boolean(t.done),
        }));
        updates.nodeType = 'task';
      }

      actions.updateNode(id, updates);
      return {
        success: true,
        nodeId: id,
        updatedFields: Object.keys(updates),
        message: `Updated content of node "${updates.title || node.title}".`,
      };
    },
  };

  tools.duplicate_node = {
    name: 'duplicate_node',
    description: 'Duplicates an existing canvas node, placing a clone slightly offset with matching content and styling.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID of node to clone.' },
        offsetX: { type: 'number', description: 'Horizontal offset in pixels (default 40).' },
        offsetY: { type: 'number', description: 'Vertical offset in pixels (default 40).' },
      },
      required: ['id'],
    },
    run: input => {
      const id = String(input.id || '').trim();
      const node = actions.getNodes().find(n => n.id === id);
      if (!node) {
        return { success: false, error: `Node with id "${id}" not found.` };
      }

      const offsetX = typeof input.offsetX === 'number' ? input.offsetX : 40;
      const offsetY = typeof input.offsetY === 'number' ? input.offsetY : 40;

      let newNode: CanvasNode | null = null;
      if (actions.duplicateNode) {
        newNode = actions.duplicateNode(id, { x: offsetX, y: offsetY });
      } else {
        newNode = actions.addNode({
          title: node.title,
          body: node.body,
          color: node.color,
          author: node.author,
          x: node.x + offsetX,
          y: node.y + offsetY,
          width: node.width,
          height: node.height,
          fontSize: node.fontSize,
          nodeType: node.nodeType,
          signType: node.signType,
          logoType: node.logoType,
          stamp: node.stamp,
          tasks: node.tasks ? [...node.tasks.map(t => ({ ...t }))] : undefined,
        });
      }

      return {
        success: true,
        originalId: id,
        cloneId: newNode?.id,
        message: `Cloned node "${node.title}" to position (${newNode?.x}, ${newNode?.y}).`,
      };
    },
  };

  tools.batch_edit_notes = {
    name: 'batch_edit_notes',
    description: 'Performs batch updates across multiple notes (e.g. adjust width, color, or font size across all selected notes).',
    inputSchema: {
      type: 'object',
      properties: {
        updates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              body: { type: 'string' },
              color: { type: 'string' },
              width: { type: 'number' },
              fontSize: { type: 'string' },
            },
            required: ['id'],
          },
          description: 'Array of node update payloads.',
        },
      },
      required: ['updates'],
    },
    run: input => {
      const items = Array.isArray(input.updates) ? input.updates : [];
      let updatedCount = 0;
      for (const item of items) {
        if (item && item.id) {
          const { id, ...rest } = item;
          const ok = actions.updateNode(id, rest);
          if (ok) updatedCount++;
        }
      }
      return {
        success: true,
        totalItems: items.length,
        updatedCount,
        message: `Successfully updated ${updatedCount} notes in batch.`,
      };
    },
  };

  tools.scale_selection = {
    name: 'scale_selection',
    description: 'Scales the dimensions of multiple notes by a multiplier factor (e.g. 1.25 to enlarge by 25% or 0.8 to shrink by 20%).',
    inputSchema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of node IDs to scale. Omit to scale all nodes on canvas.',
        },
        scaleFactor: {
          type: 'number',
          description: 'Scale multiplier (e.g. 1.25 = +25% size, 0.8 = -20% size).',
        },
      },
      required: ['scaleFactor'],
    },
    run: input => {
      const scaleFactor = typeof input.scaleFactor === 'number' ? Math.max(0.4, Math.min(2.5, input.scaleFactor)) : 1.0;
      const allNodes = actions.getNodes();
      const targetIds = Array.isArray(input.ids) && input.ids.length > 0 ? (input.ids as string[]) : allNodes.map(n => n.id);

      let scaledCount = 0;
      for (const id of targetIds) {
        const node = allNodes.find(n => n.id === id);
        if (node) {
          const currentW = node.width || 240;
          const newW = Math.max(140, Math.min(850, Math.round(currentW * scaleFactor)));
          const currentH = node.height || 160;
          const newH = node.height ? Math.max(80, Math.min(1000, Math.round(currentH * scaleFactor))) : undefined;
          actions.updateNode(id, { width: newW, ...(newH ? { height: newH } : {}) });
          scaledCount++;
        }
      }

      return {
        success: true,
        scaledCount,
        scaleFactor,
        message: `Scaled ${scaledCount} note(s) by factor ${scaleFactor}x.`,
      };
    },
  };

  return tools;
}

// Global reference holder so tool executors always call the latest active canvas actions
let globalActiveTools: Record<string, WebMCPToolDef> = {};
let isModelContextLogged = false;

/**
 * Registers all tools onto window.document.modelContext following the official WebMCP standard.
 * If the browser does not natively provide document.modelContext, an automatic polyfill is injected
 * so ChatGPT, extensions, and console scripts can execute tools seamlessly in ANY browser.
 */
export function registerWebMCP(tools: Record<string, WebMCPToolDef>): boolean {
  if (typeof window === 'undefined') return false;

  // Always update the active tools map for dynamic execution
  globalActiveTools = tools;

  const win = window as any;

  // Initialize document.modelContext standard polyfill if not already present
  if (!win.document.modelContext) {
    win.document.modelContext = {
      _registeredTools: new Map<string, any>(),
      registerTool: function (tool: any) {
        this._registeredTools.set(tool.name, tool);
        return Promise.resolve();
      },
      unregisterTool: function (name: string) {
        this._registeredTools.delete(name);
        return Promise.resolve();
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

  // Window-level tracking set so tools are registered ONCE per browser session
  if (!win.__boardify_registered_tools) {
    win.__boardify_registered_tools = new Set<string>();

    // Suppress benign duplicate WebMCP registration rejections from Next.js dev overlay
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
        const reason = event?.reason;
        const msg = String(reason?.message || reason || '');
        if (msg.includes('Duplicate tool name') || reason?.name === 'InvalidStateError') {
          event.preventDefault(); // Prevents Next.js runtime error overlay
        }
      });
    }
  }

  const registeredSet: Set<string> = win.__boardify_registered_tools;

  // Populate from existing native modelContext if available
  if (typeof mc.getTools === 'function') {
    try {
      const existing = mc.getTools();
      if (Array.isArray(existing)) {
        existing.forEach((item: any) => {
          if (item?.name) registeredSet.add(item.name);
        });
      }
    } catch (_) {}
  }

  Object.keys(tools).forEach(toolName => {
    const t = tools[toolName];

    // If this tool name has already been registered on document.modelContext, DO NOT call registerTool again.
    // The executor function already delegates dynamically to globalActiveTools[t.name], so it is always up to date!
    if (registeredSet.has(t.name)) {
      return;
    }

    try {
      const regRes = mc.registerTool({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
        execute: async (input: Record<string, unknown>) => {
          const start = performance.now();
          let result: Record<string, unknown>;
          try {
            const activeTool = globalActiveTools[t.name] || t;
            result = await activeTool.run(input || {});
          } catch (err) {
            result = { success: false, error: String(err instanceof Error ? err.message : err) };
          }
          const durationMs = Math.round(performance.now() - start);
          return { ...result, _executed_via: 'WebMCP', duration_ms: durationMs };
        },
      });

      registeredSet.add(t.name);

      if (regRes && typeof regRes.catch === 'function') {
        regRes.catch((err: any) => {
          if (err?.name === 'InvalidStateError' || String(err).includes('Duplicate tool name')) {
            registeredSet.add(t.name);
            return;
          }
          console.debug(`[WebMCP] Async notice registering ${t.name}:`, err);
        });
      }
    } catch (err: any) {
      if (err?.name === 'InvalidStateError' || String(err).includes('Duplicate tool name')) {
        registeredSet.add(t.name);
        return;
      }
      console.warn(`[WebMCP] Registration warning for ${t.name}:`, err);
    }
  });

  if (!isModelContextLogged) {
    isModelContextLogged = true;
    console.log(
      `%c[WebMCP v1.0 Standard]%c Registered ${Object.keys(tools).length} tools on document.modelContext. Try: document.modelContext.listTools()`,
      'background: #E24E1B; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
      'color: #1D1A16; font-weight: bold;'
    );
  }

  return true;
}
