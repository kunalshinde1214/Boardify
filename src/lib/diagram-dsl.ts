import { CanvasNode, CanvasEdge, NoteColor, NodeType } from './types';
import { AVAILABLE_LOGOS, AVAILABLE_SIGNS } from '@/components/ui/BrandIcons';
import { GILBARBARA_LOGOS } from './all-logos-catalog';

export interface ParsedDslNode {
  id: string;
  title: string;
  body: string;
  nodeType: NodeType;
  logoType?: string;
  signType?: string;
  color: NoteColor;
  fields?: { id: string; name: string; type: string; isPrimaryKey?: boolean; isForeignKey?: boolean }[];
  shapeType?: 'rectangle' | 'circle' | 'diamond' | 'cylinder' | 'hexagon' | 'cloud';
}

export interface ParsedDslEdge {
  from: string;
  to: string;
  label?: string;
  style?: 'solid' | 'dashed';
}

export interface ParsedDiagram {
  direction: 'LR' | 'TB';
  nodes: ParsedDslNode[];
  edges: ParsedDslEdge[];
}

/**
 * Resolves a logo/brand ID from user input against built-in and Gilbarbara libraries
 */
function resolveBrandLogo(query: string): string | undefined {
  const q = query.toLowerCase().trim().replace(/^gil-/, '');
  if (!q) return undefined;

  const direct = AVAILABLE_LOGOS.find(l => l.id === q || l.name.toLowerCase() === q);
  if (direct) return direct.id;

  const gilMatch = GILBARBARA_LOGOS.find(
    g => g.id === q || g.file.replace('.svg', '') === q || g.name.toLowerCase() === q
  );
  if (gilMatch) return `gil-${gilMatch.id}`;

  const partialBuiltin = AVAILABLE_LOGOS.find(l => l.id.includes(q) || l.name.toLowerCase().includes(q));
  if (partialBuiltin) return partialBuiltin.id;

  const partialGil = GILBARBARA_LOGOS.find(g => g.id.includes(q) || g.name.toLowerCase().includes(q));
  if (partialGil) return `gil-${partialGil.id}`;

  return undefined;
}

/**
 * Resolves a road/status sign ID from query
 */
function resolveSign(query: string): string | undefined {
  const q = query.toLowerCase().trim();
  const direct = AVAILABLE_SIGNS.find(s => s.id === q || s.name.toLowerCase().includes(q));
  if (direct) return direct.id;
  return undefined;
}

/**
 * Determines color based on brand or explicit color name
 */
function resolveColor(rawColor?: string, fallback: NoteColor = 'slate'): NoteColor {
  if (!rawColor) return fallback;
  const c = rawColor.toLowerCase().trim();
  const validColors: NoteColor[] = ['butter', 'sage', 'coral', 'slate', 'lavender', 'mint'];
  if (validColors.includes(c as NoteColor)) return c as NoteColor;
  if (c.includes('green') || c.includes('mint')) return 'mint';
  if (c.includes('yellow') || c.includes('butter') || c.includes('gold')) return 'butter';
  if (c.includes('red') || c.includes('coral') || c.includes('orange')) return 'coral';
  if (c.includes('purple') || c.includes('lavender')) return 'lavender';
  if (c.includes('sage') || c.includes('olive')) return 'sage';
  return 'slate';
}

/**
 * Parse an Eraser-style or Mermaid-style Diagram DSL into structured nodes and edges
 */
export function parseDiagramDsl(dslText: string): ParsedDiagram {
  const lines = dslText.split('\n');
  let direction: 'LR' | 'TB' = 'LR';
  const nodeMap = new Map<string, ParsedDslNode>();
  const edges: ParsedDslEdge[] = [];

  function ensureNode(id: string, initialTitle?: string): ParsedDslNode {
    const cleanId = id.trim();
    if (nodeMap.has(cleanId)) {
      const existing = nodeMap.get(cleanId)!;
      if (initialTitle && existing.title === existing.id) {
        existing.title = initialTitle;
      }
      return existing;
    }

    // Check if cleanId matches a known tech brand or sign
    let logoType = resolveBrandLogo(cleanId);
    let signType = resolveSign(cleanId);
    let nodeType: NodeType = logoType ? 'logo' : signType ? 'sign' : 'default';

    const node: ParsedDslNode = {
      id: cleanId,
      title: initialTitle || cleanId.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      body: '',
      nodeType,
      logoType,
      signType,
      color: logoType ? 'slate' : signType ? 'coral' : 'butter',
    };

    nodeMap.set(cleanId, node);
    return node;
  }

  for (let rawLine of lines) {
    let line = rawLine.trim();
    if (!line || line.startsWith('//') || line.startsWith('#') || line.startsWith('%%')) continue;

    // Direction directive: e.g. "direction: TB" or "graph LR" or "flowchart TD" or "erDiagram"
    if (/^(direction\s*:\s*(LR|TB|TD|RL))/i.test(line) || /^(graph|flowchart)\s+(LR|TB|TD|RL)/i.test(line) || /^erDiagram/i.test(line)) {
      if (/TB|TD/i.test(line)) direction = 'TB';
      else direction = 'LR';
      continue;
    }

    // 0. ER Diagram Entity Block: e.g. entity Users { id UUID PK, email VARCHAR, ... }
    const entityMatch = line.match(/^entity\s+([a-zA-Z0-9_-]+)\s*(?:\[(.*?)\])?\s*\{(.*?)\}$/i);
    if (entityMatch) {
      const entityId = entityMatch[1].trim();
      const entityAttrs = entityMatch[2] || '';
      const fieldsRaw = entityMatch[3].trim();

      const node = ensureNode(entityId);
      node.nodeType = 'entity';
      node.title = entityId;

      const parsedFields: { id: string; name: string; type: string; isPrimaryKey?: boolean; isForeignKey?: boolean }[] = [];
      const fieldItems = fieldsRaw.split(/[,\n;]+/).map(f => f.trim()).filter(Boolean);

      fieldItems.forEach((fStr, fIdx) => {
        const parts = fStr.split(/\s+/);
        if (parts.length > 0) {
          const fName = parts[0];
          const fType = parts[1] || 'VARCHAR';
          const isPK = /PK|primary/i.test(fStr);
          const isFK = /FK|foreign/i.test(fStr);
          parsedFields.push({
            id: `f_${fIdx + 1}`,
            name: fName,
            type: fType,
            isPrimaryKey: isPK,
            isForeignKey: isFK,
          });
        }
      });

      if (parsedFields.length > 0) {
        node.fields = parsedFields;
      }
      continue;
    }

    // 1. Connection line: A -> B or A --> B or A ||--o{ B or A }|--|| B or A -> B: "Label" or A --- B
    const edgeMatch = line.match(/^(.+?)\s*(-->|->|---|--\s*>\s*|\|\|--o\{|}\|--\|\||\|\|--\|\||\}o--o\{|--)\s*(.+)$/);
    if (edgeMatch) {
      let fromPart = edgeMatch[1].trim();
      const connector = edgeMatch[2].trim();
      let toPart = edgeMatch[3].trim();
      let edgeLabel: string | undefined = undefined;

      // Default ER labels if connector is a cardinality symbol
      if (connector === '||--o{' || connector === '}o--o{') edgeLabel = '1 : N';
      else if (connector === '||--||') edgeLabel = '1 : 1';
      else if (connector === '}|--||') edgeLabel = 'N : 1';

      // Extract label if written as: toPart: "Label" or toPart |Label| or toPart -- "Label" -->
      const labelMatch = toPart.match(/^(.+?)\s*:\s*["']?([^"']+)["']?$/);
      if (labelMatch) {
        toPart = labelMatch[1].trim();
        edgeLabel = labelMatch[2].trim();
      }

      // Handle pipe label in mermaid: A -->|Label| B
      const pipeMatch = fromPart.match(/^(.+?)\s*-->\|([^|]+)\|$/);
      if (pipeMatch) {
        fromPart = pipeMatch[1].trim();
        edgeLabel = pipeMatch[2].trim();
      }

      const fromNode = parseOrGetNode(fromPart, ensureNode);
      const toNode = parseOrGetNode(toPart, ensureNode);

      if (fromNode && toNode) {
        edges.push({
          from: fromNode.id,
          to: toNode.id,
          label: edgeLabel,
          style: connector.includes('---') ? 'dashed' : 'solid',
        });
      }
      continue;
    }

    // 2. Standalone Node Definition:
    // e.g. Client [icon: react, color: mint, title: "Web Frontend"]
    // e.g. [Client: React, color: mint]
    // e.g. A[React App] or A[(PostgreSQL Database)]
    parseOrGetNode(line, ensureNode);
  }

  return {
    direction,
    nodes: Array.from(nodeMap.values()),
    edges,
  };
}

/**
 * Helper to parse inline node bracket notation:
 * Handles:
 * - `Name [icon: aws-lambda, title: "Auth", color: mint]`
 * - `[Name: Brand, color: coral]`
 * - `A[Text Label]`
 * - `A[(Database Label)]`
 * - `A{Decision Label}`
 */
function parseOrGetNode(raw: string, ensureNode: (id: string, initialTitle?: string) => ParsedDslNode): ParsedDslNode | null {
  const str = raw.trim();
  if (!str) return null;

  // Bracket format: Id [attributes] or [Id: Brand, attributes]
  const bracketMatch = str.match(/^([^\[]+)?\[(.*?)\]$/);
  if (bracketMatch) {
    let rawId = (bracketMatch[1] || '').trim();
    const attrsStr = bracketMatch[2].trim();

    let title: string | undefined = undefined;
    let icon: string | undefined = undefined;
    let sign: string | undefined = undefined;
    let color: NoteColor | undefined = undefined;
    let body: string | undefined = undefined;

    // Check if format is [Id: Brand, ...] or [Text]
    if (!rawId && attrsStr.includes(':')) {
      const parts = attrsStr.split(',');
      const firstPart = parts[0].split(':');
      rawId = firstPart[0].trim();
      if (firstPart.length > 1) {
        icon = firstPart.slice(1).join(':').trim();
      }
    } else if (!rawId) {
      rawId = attrsStr;
      title = attrsStr;
    }

    // Parse key-value attributes: icon: aws, color: mint, title: "...", body: "..."
    const attrRegex = /(icon|sign|color|title|label|body|text)\s*:\s*(?:"([^"]*)"|'([^']*)'|([^,\s]+))/gi;
    let m: RegExpExecArray | null;
    while ((m = attrRegex.exec(attrsStr)) !== null) {
      const key = m[1].toLowerCase();
      const val = (m[2] ?? m[3] ?? m[4] ?? '').trim();
      if (key === 'icon') icon = val;
      if (key === 'sign') sign = val;
      if (key === 'color') color = resolveColor(val);
      if (key === 'title' || key === 'label') title = val;
      if (key === 'body' || key === 'text') body = val;
    }

    if (!rawId) rawId = title || 'node-' + Math.random().toString(36).slice(2, 6);

    const node = ensureNode(rawId, title);
    if (icon) {
      const resolvedLogo = resolveBrandLogo(icon);
      if (resolvedLogo) {
        node.logoType = resolvedLogo;
        node.nodeType = 'logo';
      }
    }
    if (sign) {
      const resolvedSign = resolveSign(sign);
      if (resolvedSign) {
        node.signType = resolvedSign;
        node.nodeType = 'sign';
      }
    }
    if (color) node.color = color;
    if (title) node.title = title;
    if (body) node.body = body;

    return node;
  }

  // Mermaid cylinder DB syntax: A[(Database Name)]
  const dbMatch = str.match(/^([a-zA-Z0-9_-]+)\[\((.*?)\)\]$/);
  if (dbMatch) {
    const id = dbMatch[1].trim();
    const title = dbMatch[2].trim();
    const node = ensureNode(id, title);
    node.nodeType = 'logo';
    node.logoType = resolveBrandLogo(title) || 'database';
    return node;
  }

  // Plain ID / Name
  const cleanId = str.replace(/[()[\]{}]/g, '').trim();
  return ensureNode(cleanId);
}

/**
 * Deterministic DAG Layout Engine
 * Places nodes in topological rank columns (LR) or rows (TB) without coordinate math.
 */
export function layoutDiagramDsl(
  parsed: ParsedDiagram,
  originX: number = 200,
  originY: number = 200
): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  const { direction, nodes, edges } = parsed;
  if (nodes.length === 0) return { nodes: [], edges: [] };

  // 1. Build adjacency graph & in-degree map
  const inDegree = new Map<string, number>();
  const outEdges = new Map<string, string[]>();
  nodes.forEach(n => {
    inDegree.set(n.id, 0);
    outEdges.set(n.id, []);
  });

  edges.forEach(e => {
    if (inDegree.has(e.to)) {
      inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1);
    }
    if (outEdges.has(e.from)) {
      outEdges.get(e.from)!.push(e.to);
    }
  });

  // 2. Assign topological ranks (columns for LR, rows for TB)
  const ranks = new Map<string, number>();
  const queue: string[] = [];

  // Start nodes: in-degree 0
  nodes.forEach(n => {
    if ((inDegree.get(n.id) || 0) === 0) {
      ranks.set(n.id, 0);
      queue.push(n.id);
    }
  });

  // If graph has cycles or disconnected nodes without 0 in-degree, fallback
  if (queue.length === 0 && nodes.length > 0) {
    ranks.set(nodes[0].id, 0);
    queue.push(nodes[0].id);
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentRank = ranks.get(current) || 0;
    const neighbors = outEdges.get(current) || [];

    for (const next of neighbors) {
      const nextRank = ranks.get(next);
      if (nextRank === undefined || nextRank < currentRank + 1) {
        ranks.set(next, currentRank + 1);
        queue.push(next);
      }
    }
  }

  // Handle any remaining unranked nodes (e.g. orphans or isolated components)
  let maxRank = 0;
  ranks.forEach(r => {
    if (r > maxRank) maxRank = r;
  });

  nodes.forEach((n, idx) => {
    if (!ranks.has(n.id)) {
      ranks.set(n.id, idx % 3);
    }
  });

  // Group nodes by rank
  const rankGroups = new Map<number, ParsedDslNode[]>();
  nodes.forEach(n => {
    const r = ranks.get(n.id) || 0;
    if (!rankGroups.has(r)) rankGroups.set(r, []);
    rankGroups.get(r)!.push(n);
  });

  // 3. Compute spatial coordinates
  const canvasNodes: CanvasNode[] = [];
  const now = Date.now();

  const isLR = direction === 'LR';
  const rankGap = isLR ? 280 : 200; // Distance between layers
  const nodeGap = isLR ? 150 : 260; // Distance between sibling nodes in same layer

  // Sort ranks
  const sortedRanks = Array.from(rankGroups.keys()).sort((a, b) => a - b);

  sortedRanks.forEach((rank, rankIndex) => {
    const group = rankGroups.get(rank)!;
    const totalGroupHeight = (group.length - 1) * nodeGap;

    group.forEach((pNode, itemIndex) => {
      const width = pNode.nodeType === 'logo' ? 140 : 220;

      let x: number;
      let y: number;

      if (isLR) {
        x = originX + rankIndex * rankGap;
        y = originY + itemIndex * nodeGap - totalGroupHeight / 2;
      } else {
        // TB (Top to Bottom)
        x = originX + itemIndex * nodeGap - ((group.length - 1) * nodeGap) / 2;
        y = originY + rankIndex * rankGap;
      }

      canvasNodes.push({
        id: pNode.id,
        title: pNode.title,
        body: pNode.body,
        x: Math.round(x),
        y: Math.round(y),
        width: pNode.nodeType === 'entity' ? 260 : width,
        color: pNode.color,
        author: 'agent',
        created: now,
        nodeType: pNode.nodeType,
        logoType: pNode.logoType,
        signType: pNode.signType,
        fields: pNode.fields,
        shapeType: pNode.shapeType,
      });
    });
  });

  // 4. Generate CanvasEdges
  const canvasEdges: CanvasEdge[] = edges.map((e, idx) => ({
    id: `edge-dsl-${now}-${idx}`,
    from: e.from,
    to: e.to,
    label: e.label,
    style: e.style || 'solid',
  }));

  return {
    nodes: canvasNodes,
    edges: canvasEdges,
  };
}

/**
 * Serializes current canvas state back into concise, diffable Eraser-style Diagram DSL
 */
export function exportCanvasToDsl(nodes: CanvasNode[], edges: CanvasEdge[]): string {
  if (nodes.length === 0) return '// Empty Whiteboard Canvas';

  const lines: string[] = [];
  lines.push('// Boardify Diagram-as-Code (Eraser + WebMCP DSL)');
  lines.push('direction: LR\n');

  // Nodes declarations
  lines.push('// Nodes & Services');
  nodes.forEach(n => {
    let attrs: string[] = [];
    if (n.nodeType === 'logo' && n.logoType) {
      attrs.push(`icon: ${n.logoType}`);
    } else if (n.nodeType === 'sign' && n.signType) {
      attrs.push(`sign: ${n.signType}`);
    }
    if (n.color && n.color !== 'slate') {
      attrs.push(`color: ${n.color}`);
    }
    if (n.title && n.title !== n.id) {
      attrs.push(`title: "${n.title}"`);
    }
    if (n.body) {
      attrs.push(`body: "${n.body.replace(/\n/g, ' ')}"`);
    }

    const attrStr = attrs.length > 0 ? ` [${attrs.join(', ')}]` : '';
    lines.push(`${n.id}${attrStr}`);
  });

  // Edges connections
  if (edges.length > 0) {
    lines.push('\n// Connections & Data Flow');
    edges.forEach(e => {
      const arrow = e.style === 'dashed' ? '---' : '-->';
      const labelStr = e.label ? `: "${e.label}"` : '';
      lines.push(`${e.from} ${arrow} ${e.to}${labelStr}`);
    });
  }

  return lines.join('\n');
}

/**
 * Serializes current canvas state into standard Mermaid flowchart markdown
 */
export function exportCanvasToMermaid(nodes: CanvasNode[], edges: CanvasEdge[]): string {
  if (nodes.length === 0) return 'graph LR\n  empty[Empty Canvas]';

  const lines: string[] = ['graph LR'];

  nodes.forEach(n => {
    const cleanLabel = (n.title || n.id).replace(/[\[\]"()]/g, '');
    if (n.nodeType === 'database' || n.logoType?.includes('db') || n.logoType?.includes('sql')) {
      lines.push(`  ${n.id}[("${cleanLabel}")]`);
    } else {
      lines.push(`  ${n.id}["${cleanLabel}"]`);
    }
  });

  edges.forEach(e => {
    if (e.label) {
      lines.push(`  ${e.from} -->|"${e.label}"| ${e.to}`);
    } else {
      lines.push(`  ${e.from} --> ${e.to}`);
    }
  });

  return lines.join('\n');
}
