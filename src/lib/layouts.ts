import { CanvasNode, CanvasEdge } from './types';

export function getBoundingBox(nodes: CanvasNode[]) {
  if (!nodes.length) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach(n => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + n.width);
    maxY = Math.max(maxY, n.y + (n.height || 140));
  });
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

export function getCentroid(nodes: CanvasNode[]) {
  if (!nodes.length) return { x: 0, y: 0 };
  let sx = 0, sy = 0;
  nodes.forEach(n => { sx += n.x; sy += n.y; });
  return { x: sx / nodes.length, y: sy / nodes.length };
}

export function findFreeSpot(
  nodes: CanvasNode[],
  startX: number,
  startY: number,
  w = 230,
  h = 140
): { x: number; y: number } {
  let x = startX;
  let y = startY;
  const padding = 30;

  for (let attempt = 0; attempt < 500; attempt++) {
    let clash = false;
    for (const n of nodes) {
      const nw = n.width || w;
      const nh = n.height || h;
      if (
        x < n.x + nw + padding &&
        x + w + padding > n.x &&
        y < n.y + nh + padding &&
        y + h + padding > n.y
      ) {
        clash = true;
        break;
      }
    }
    if (!clash) return { x: Math.round(x), y: Math.round(y) };
    y += 60;
    if (y > startY + 700) {
      y = startY;
      x += 270;
    }
  }
  return { x: Math.round(startX), y: Math.round(startY) };
}

export function getConnectedComponents(nodes: CanvasNode[], edges: CanvasEdge[]): CanvasNode[][] {
  const nodeMap = new Map<string, CanvasNode>(nodes.map(n => [n.id, n]));
  const parent = new Map<string, string>();
  nodes.forEach(n => parent.set(n.id, n.id));

  const find = (x: string): string => {
    while (parent.get(x) !== x) {
      const p = parent.get(x)!;
      parent.set(x, parent.get(p)!);
      x = p;
    }
    return x;
  };

  edges.forEach(e => {
    if (parent.has(e.from) && parent.has(e.to)) {
      const rootA = find(e.from);
      const rootB = find(e.to);
      if (rootA !== rootB) parent.set(rootA, rootB);
    }
  });

  const comps = new Map<string, CanvasNode[]>();
  nodes.forEach(n => {
    const root = find(n.id);
    if (!comps.has(root)) comps.set(root, []);
    comps.get(root)!.push(n);
  });

  return [...comps.values()]
    .map(c => c.sort((a, b) => a.created - b.created))
    .sort((a, b) => b.length - a.length);
}

export function calculateSmartFlowTargets(nodes: CanvasNode[], edges: CanvasEdge[]): Map<string, { x: number; y: number }> {
  const targets = new Map<string, { x: number; y: number }>();
  if (nodes.length === 0) return targets;
  if (nodes.length === 1) {
    targets.set(nodes[0].id, { x: -115, y: -70 });
    return targets;
  }

  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  nodes.forEach(n => {
    adj.set(n.id, []);
    inDegree.set(n.id, 0);
  });

  edges.forEach(e => {
    if (adj.has(e.from) && inDegree.has(e.to)) {
      adj.get(e.from)!.push(e.to);
      inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1);
    }
  });

  // Assign levels / columns via topological traversal
  const levels = new Map<string, number>();
  const queue: { id: string; level: number }[] = [];

  // Start with root notes (inDegree === 0)
  nodes.forEach(n => {
    if ((inDegree.get(n.id) || 0) === 0) {
      queue.push({ id: n.id, level: 0 });
      levels.set(n.id, 0);
    }
  });

  // If no root (cycle), pick oldest note as level 0
  if (queue.length === 0) {
    const oldest = [...nodes].sort((a, b) => a.created - b.created)[0];
    queue.push({ id: oldest.id, level: 0 });
    levels.set(oldest.id, 0);
  }

  const visited = new Set<string>();
  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);

    (adj.get(id) || []).forEach(childId => {
      const currentChildLevel = levels.get(childId) ?? -1;
      const nextLevel = Math.max(currentChildLevel, level + 1);
      levels.set(childId, nextLevel);
      queue.push({ id: childId, level: nextLevel });
    });
  }

  // Handle any remaining disconnected notes
  nodes.forEach(n => {
    if (!levels.has(n.id)) {
      levels.set(n.id, 0);
    }
  });

  // Group nodes by level (column)
  const columns = new Map<number, CanvasNode[]>();
  nodes.forEach(n => {
    const lvl = levels.get(n.id) || 0;
    if (!columns.has(lvl)) columns.set(lvl, []);
    columns.get(lvl)!.push(n);
  });

  const sortedLevels = Array.from(columns.keys()).sort((a, b) => a - b);
  const totalCols = sortedLevels.length;
  const colPitch = 340;
  const startX = -((totalCols - 1) * colPitch) / 2 - 115;

  sortedLevels.forEach((lvl, colIndex) => {
    const colNodes = columns.get(lvl)!;
    const colX = startX + colIndex * colPitch;
    const rowPitch = 180;
    const totalHeight = (colNodes.length - 1) * rowPitch;
    const startY = -(totalHeight / 2) - 70;

    colNodes.forEach((n, rowIndex) => {
      targets.set(n.id, {
        x: Math.round(colX),
        y: Math.round(startY + rowIndex * rowPitch),
      });
    });
  });

  return targets;
}

export function calculateClusterTargets(nodes: CanvasNode[], edges: CanvasEdge[]): Map<string, { x: number; y: number }> {
  const targets = new Map<string, { x: number; y: number }>();
  const bb = getBoundingBox(nodes);
  let currentX = bb ? bb.minX : -200;
  const startY = bb ? bb.minY : -150;

  const comps = getConnectedComponents(nodes, edges);
  comps.forEach(comp => {
    let currentY = startY;
    comp.forEach(n => {
      targets.set(n.id, { x: Math.round(currentX), y: Math.round(currentY) });
      currentY += (n.height || 140) + 40;
    });
    currentX += 300;
  });

  return targets;
}

export function calculateTimelineTargets(nodes: CanvasNode[]): Map<string, { x: number; y: number }> {
  const targets = new Map<string, { x: number; y: number }>();
  const bb = getBoundingBox(nodes);
  let currentX = bb ? bb.minX : -300;
  const currentY = bb ? bb.minY : 0;

  [...nodes]
    .sort((a, b) => a.created - b.created)
    .forEach(n => {
      targets.set(n.id, { x: Math.round(currentX), y: Math.round(currentY) });
      currentX += 300;
    });

  return targets;
}

export function calculateKanbanTargets(nodes: CanvasNode[]): Map<string, { x: number; y: number }> {
  const targets = new Map<string, { x: number; y: number }>();
  const colorBuckets: Record<string, CanvasNode[]> = {
    butter: [],
    sage: [],
    coral: [],
    slate: [],
    lavender: [],
    mint: [],
  };

  nodes.forEach(n => {
    const c = n.color || 'butter';
    if (!colorBuckets[c]) colorBuckets[c] = [];
    colorBuckets[c].push(n);
  });

  const activeBuckets = Object.entries(colorBuckets).filter(([, list]) => list.length > 0);
  const bb = getBoundingBox(nodes);
  let currentX = bb ? bb.minX : -350;
  const startY = bb ? bb.minY : -100;

  activeBuckets.forEach(([, list]) => {
    let currentY = startY;
    list.forEach(n => {
      targets.set(n.id, { x: Math.round(currentX), y: Math.round(currentY) });
      currentY += (n.height || 140) + 36;
    });
    currentX += 290;
  });

  return targets;
}

export function calculateGridTargets(nodes: CanvasNode[]): Map<string, { x: number; y: number }> {
  const targets = new Map<string, { x: number; y: number }>();
  const cols = Math.max(2, Math.ceil(Math.sqrt(nodes.length)));
  const bb = getBoundingBox(nodes);
  const startX = bb ? bb.minX : -200;
  const startY = bb ? bb.minY : -150;

  nodes.forEach((n, idx) => {
    const r = Math.floor(idx / cols);
    const c = idx % cols;
    targets.set(n.id, {
      x: Math.round(startX + c * 290),
      y: Math.round(startY + r * 200),
    });
  });

  return targets;
}

export function generateMarkdownExport(nodes: CanvasNode[], edges: CanvasEdge[]): string {
  const lines = ['# Boardify Canvas Export', '', `Exported at: ${new Date().toISOString()}`, ''];
  const comps = getConnectedComponents(nodes, edges);

  comps.forEach((c, idx) => {
    if (comps.length > 1) {
      lines.push(`## Section ${idx + 1}`, '');
    }
    c.forEach(n => {
      lines.push(`### [${n.author.toUpperCase()}] ${n.title}`);
      if (n.body) {
        lines.push(n.body);
      }
      lines.push('');
    });
  });

  if (edges.length > 0) {
    lines.push('## Connections & Relationships', '');
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    edges.forEach(e => {
      const a = nodeMap.get(e.from);
      const b = nodeMap.get(e.to);
      if (a && b) {
        lines.push(`- **${a.title}** ──(${e.label || 'relates to'})──> **${b.title}**`);
      }
    });
    lines.push('');
  }

  return lines.join('\n');
}

export function generateMermaidExport(nodes: CanvasNode[], edges: CanvasEdge[]): string {
  const lines = ['graph TD', '  %% Boardify Canvas Mermaid Graph'];
  const sanitize = (s: string) => s.replace(/["\n\r]/g, ' ').slice(0, 45);

  nodes.forEach(n => {
    const title = sanitize(n.title);
    lines.push(`  ${n.id}["${title}"]`);
  });

  edges.forEach(e => {
    const label = e.label ? `|"${sanitize(e.label)}"|` : '';
    lines.push(`  ${e.from} -->${label} ${e.to}`);
  });

  return lines.join('\n');
}

export function calculateForceDirectedTargets(nodes: CanvasNode[], edges: CanvasEdge[]): Map<string, { x: number; y: number }> {
  const targets = new Map<string, { x: number; y: number }>();
  if (nodes.length === 0) return targets;
  if (nodes.length === 1) {
    targets.set(nodes[0].id, { x: nodes[0].x, y: nodes[0].y });
    return targets;
  }

  // Clone positions
  const pos = new Map<string, { x: number; y: number; vx: number; vy: number }>();
  nodes.forEach(n => {
    pos.set(n.id, { x: n.x, y: n.y, vx: 0, vy: 0 });
  });

  const k = 280; // Ideal distance between linked nodes
  const iterations = 60;
  const damping = 0.85;

  for (let iter = 0; iter < iterations; iter++) {
    // 1. Repulsion between all node pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const u = pos.get(nodes[i].id)!;
        const v = pos.get(nodes[j].id)!;
        let dx = v.x - u.x;
        let dy = v.y - u.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) {
          dx = (Math.random() - 0.5) * 10;
          dy = (Math.random() - 0.5) * 10;
          dist = Math.sqrt(dx * dx + dy * dy);
        }
        if (dist < 800) {
          const force = (k * k) / (dist * dist);
          const fx = (dx / dist) * force * 15;
          const fy = (dy / dist) * force * 15;
          u.vx -= fx;
          u.vy -= fy;
          v.vx += fx;
          v.vy += fy;
        }
      }
    }

    // 2. Attraction along edges
    edges.forEach(e => {
      const u = pos.get(e.from);
      const v = pos.get(e.to);
      if (!u || !v) return;
      const dx = v.x - u.x;
      const dy = v.y - u.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist * dist) / k;
      const fx = (dx / dist) * force * 0.08;
      const fy = (dy / dist) * force * 0.08;
      u.vx += fx;
      u.vy += fy;
      v.vx += fx;
      v.vy += fy;
    });

    // 3. Apply velocities with damping
    nodes.forEach(n => {
      const p = pos.get(n.id)!;
      p.x += Math.max(-50, Math.min(50, p.vx)) * 0.2;
      p.y += Math.max(-50, Math.min(50, p.vy)) * 0.2;
      p.vx *= damping;
      p.vy *= damping;
    });
  }

  // Normalize center around original centroid
  const originalCentroid = getCentroid(nodes);
  let newSx = 0, newSy = 0;
  nodes.forEach(n => {
    const p = pos.get(n.id)!;
    newSx += p.x;
    newSy += p.y;
  });
  const shiftX = originalCentroid.x - (newSx / nodes.length);
  const shiftY = originalCentroid.y - (newSy / nodes.length);

  nodes.forEach(n => {
    const p = pos.get(n.id)!;
    targets.set(n.id, {
      x: Math.round(p.x + shiftX),
      y: Math.round(p.y + shiftY),
    });
  });

  return targets;
}

export interface BoardHealthReport {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  totalNodes: number;
  totalEdges: number;
  humanCount: number;
  agentCount: number;
  orphanNodes: CanvasNode[];
  bottleneckNodes: CanvasNode[];
  colorDistribution: Record<string, number>;
  insights: string[];
  suggestions: {
    type: 'connect_orphans' | 'tidy_clusters' | 'add_expansion' | 'balance_colors';
    title: string;
    description: string;
    actionLabel: string;
  }[];
}

export function analyzeBoardHealth(nodes: CanvasNode[], edges: CanvasEdge[]): BoardHealthReport {
  if (nodes.length === 0) {
    return {
      score: 100,
      grade: 'A+',
      totalNodes: 0,
      totalEdges: 0,
      humanCount: 0,
      agentCount: 0,
      orphanNodes: [],
      bottleneckNodes: [],
      colorDistribution: {},
      insights: ['Canvas is empty and ready for fresh ideas.'],
      suggestions: [],
    };
  }

  const linkedIds = new Set<string>();
  const connectionCounts = new Map<string, number>();
  nodes.forEach(n => connectionCounts.set(n.id, 0));

  edges.forEach(e => {
    linkedIds.add(e.from);
    linkedIds.add(e.to);
    connectionCounts.set(e.from, (connectionCounts.get(e.from) || 0) + 1);
    connectionCounts.set(e.to, (connectionCounts.get(e.to) || 0) + 1);
  });

  const orphanNodes = nodes.filter(n => !linkedIds.has(n.id));
  const bottleneckNodes = nodes.filter(n => (connectionCounts.get(n.id) || 0) >= 3);
  const humanCount = nodes.filter(n => n.author === 'human').length;
  const agentCount = nodes.filter(n => n.author === 'agent').length;

  const colorDistribution: Record<string, number> = {};
  nodes.forEach(n => {
    const c = n.color || 'butter';
    colorDistribution[c] = (colorDistribution[c] || 0) + 1;
  });

  // Calculate score (0-100)
  let score = 100;
  const orphanPenalty = Math.round((orphanNodes.length / nodes.length) * 35);
  score -= orphanPenalty;

  if (nodes.length >= 4 && edges.length === 0) {
    score -= 25;
  }

  if (agentCount === 0 && nodes.length >= 3) {
    score -= 10;
  }

  score = Math.max(25, Math.min(100, score));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'A+';
  if (score >= 93) grade = 'A+';
  else if (score >= 82) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 55) grade = 'C';
  else grade = 'D';

  const insights: string[] = [];
  if (orphanNodes.length === 0) {
    insights.push('Graph is 100% interconnected with no orphan thoughts.');
  } else {
    insights.push(`${orphanNodes.length} orphan note${orphanNodes.length > 1 ? 's' : ''} lack connecting relationships.`);
  }

  if (bottleneckNodes.length > 0) {
    insights.push(`Key anchor note: "${bottleneckNodes[0].title}" has ${connectionCounts.get(bottleneckNodes[0].id)} connected links.`);
  }

  if (agentCount > 0) {
    insights.push(`Collaborative balance: ${humanCount} human notes, ${agentCount} agent notes.`);
  } else {
    insights.push('Tip: Trigger an Agent Studio mission to add sub-branches.');
  }

  const suggestions: BoardHealthReport['suggestions'] = [];
  if (orphanNodes.length > 0) {
    suggestions.push({
      type: 'connect_orphans',
      title: 'Link Orphan Notes',
      description: `Connect ${orphanNodes[0].title} to an anchor topic.`,
      actionLabel: 'Connect Notes',
    });
  }

  if (nodes.length >= 3) {
    suggestions.push({
      type: 'tidy_clusters',
      title: 'Untangle Canvas Layout',
      description: 'Run physics-based auto-tidy to align branches smoothly.',
      actionLabel: 'Auto-Tidy',
    });
  }

  return {
    score,
    grade,
    totalNodes: nodes.length,
    totalEdges: edges.length,
    humanCount,
    agentCount,
    orphanNodes,
    bottleneckNodes,
    colorDistribution,
    insights,
    suggestions,
  };
}
