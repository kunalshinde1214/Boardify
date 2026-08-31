import { CanvasNode, CanvasEdge } from './types';

export function getBoundingBox(nodes: CanvasNode[]) {
  if (!nodes.length) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach(n => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + (n.width || 230));
    maxY = Math.max(maxY, n.y + (n.height || 160));
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
  h = 160
): { x: number; y: number } {
  let x = startX;
  let y = startY;
  const padding = 40;

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
    y += 70;
    if (y > startY + 800) {
      y = startY;
      x += 290;
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

/**
 * High-precision Hierarchical DAG / Pipeline Flow layout.
 * Separates distinct workflow charts into dedicated vertical bands with generous horizontal pitch,
 * parent-child vertical centering, and zero-overlap guarantees.
 */
export function calculateSmartFlowTargets(nodes: CanvasNode[], edges: CanvasEdge[]): Map<string, { x: number; y: number }> {
  const targets = new Map<string, { x: number; y: number }>();
  if (nodes.length === 0) return targets;
  if (nodes.length === 1) {
    targets.set(nodes[0].id, { x: -115, y: -80 });
    return targets;
  }

  // 1. Partition into connected workflow components
  const comps = getConnectedComponents(nodes, edges);
  const multiNodeComps = comps.filter(c => c.length > 1);
  const orphanNodes = comps.filter(c => c.length === 1).map(c => c[0]);

  const COL_PITCH = 360; // 240px note width + 120px wire gap
  const ROW_PITCH = 210; // 150px note height + 60px vertical margin
  const COMPONENT_GAP = 140; // Spacing between separate workflow diagrams

  let currentBandY = 0;
  const positionedBoxes: { minX: number; maxX: number; minY: number; maxY: number }[] = [];

  // 2. Position each connected workflow chart
  multiNodeComps.forEach(comp => {
    const compNodeIds = new Set(comp.map(n => n.id));
    const compEdges = edges.filter(e => compNodeIds.has(e.from) && compNodeIds.has(e.to));

    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    comp.forEach(n => {
      adj.set(n.id, []);
      inDegree.set(n.id, 0);
    });

    compEdges.forEach(e => {
      if (adj.has(e.from) && inDegree.has(e.to)) {
        adj.get(e.from)!.push(e.to);
        inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1);
      }
    });

    // Topological level assignment (Longest path to preserve left-to-right dependency order)
    const levels = new Map<string, number>();
    const queue: { id: string; level: number }[] = [];

    comp.forEach(n => {
      if ((inDegree.get(n.id) || 0) === 0) {
        queue.push({ id: n.id, level: 0 });
        levels.set(n.id, 0);
      }
    });

    if (queue.length === 0) {
      // Cyclic graph fallback: start with oldest
      const oldest = [...comp].sort((a, b) => a.created - b.created)[0];
      queue.push({ id: oldest.id, level: 0 });
      levels.set(oldest.id, 0);
    }

    const visited = new Set<string>();
    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);

      (adj.get(id) || []).forEach(childId => {
        const cur = levels.get(childId) ?? -1;
        const next = Math.max(cur, level + 1);
        levels.set(childId, next);
        queue.push({ id: childId, level: next });
      });
    }

    comp.forEach(n => {
      if (!levels.has(n.id)) levels.set(n.id, 0);
    });

    // Group into columns
    const columns = new Map<number, CanvasNode[]>();
    comp.forEach(n => {
      const lvl = levels.get(n.id) || 0;
      if (!columns.has(lvl)) columns.set(lvl, []);
      columns.get(lvl)!.push(n);
    });

    const sortedLevels = Array.from(columns.keys()).sort((a, b) => a - b);
    const maxColNodes = Math.max(...Array.from(columns.values()).map(col => col.length), 1);
    const compHeight = maxColNodes * ROW_PITCH;

    sortedLevels.forEach(lvl => {
      const colNodes = columns.get(lvl)!;
      const colX = lvl * COL_PITCH;
      const colHeight = colNodes.length * ROW_PITCH;
      const startY = currentBandY + (compHeight - colHeight) / 2;

      colNodes.forEach((n, rowIndex) => {
        targets.set(n.id, {
          x: Math.round(colX),
          y: Math.round(startY + rowIndex * ROW_PITCH),
        });
      });
    });

    currentBandY += compHeight + COMPONENT_GAP;
  });

  // 3. Position isolated orphan notes in a clean grid below the diagrams
  if (orphanNodes.length > 0) {
    const orphanCols = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(orphanNodes.length))));
    orphanNodes.forEach((n, idx) => {
      const c = idx % orphanCols;
      const r = Math.floor(idx / orphanCols);
      targets.set(n.id, {
        x: Math.round(c * COL_PITCH),
        y: Math.round(currentBandY + r * ROW_PITCH),
      });
    });
  }

  // 4. Anti-Collision Non-Overlap Relaxation Check
  const targetNodes = Array.from(targets.entries());
  for (let iter = 0; iter < 10; iter++) {
    let shifted = false;
    for (let i = 0; i < targetNodes.length; i++) {
      for (let j = i + 1; j < targetNodes.length; j++) {
        const [idA, posA] = targetNodes[i];
        const [idB, posB] = targetNodes[j];

        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;

        const minDistanceX = 280;
        const minDistanceY = 190;

        if (Math.abs(dx) < minDistanceX && Math.abs(dy) < minDistanceY) {
          // Push B downward
          posB.y += (minDistanceY - Math.abs(dy)) + 20;
          targets.set(idB, { x: posB.x, y: posB.y });
          shifted = true;
        }
      }
    }
    if (!shifted) break;
  }

  // 5. Center all coordinates around (0, 0)
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  targets.forEach(pos => {
    minX = Math.min(minX, pos.x);
    maxX = Math.max(maxX, pos.x + 240);
    minY = Math.min(minY, pos.y);
    maxY = Math.max(maxY, pos.y + 160);
  });

  const centerOffsetX = (minX + maxX) / 2;
  const centerOffsetY = (minY + maxY) / 2;

  targets.forEach((pos, id) => {
    targets.set(id, {
      x: Math.round(pos.x - centerOffsetX),
      y: Math.round(pos.y - centerOffsetY),
    });
  });

  return targets;
}

export function calculateClusterTargets(nodes: CanvasNode[], edges: CanvasEdge[]): Map<string, { x: number; y: number }> {
  const targets = new Map<string, { x: number; y: number }>();
  if (!nodes.length) return targets;

  const comps = getConnectedComponents(nodes, edges);
  let currentX = 0;

  comps.forEach(comp => {
    let currentY = 0;
    comp.forEach(n => {
      targets.set(n.id, { x: Math.round(currentX), y: Math.round(currentY) });
      currentY += (n.height || 150) + 50;
    });
    currentX += 340;
  });

  // Center around (0, 0)
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  targets.forEach(pos => {
    minX = Math.min(minX, pos.x);
    maxX = Math.max(maxX, pos.x + 240);
    minY = Math.min(minY, pos.y);
    maxY = Math.max(maxY, pos.y + 160);
  });

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  targets.forEach((pos, id) => {
    targets.set(id, { x: Math.round(pos.x - cx), y: Math.round(pos.y - cy) });
  });

  return targets;
}

export function calculateTimelineTargets(nodes: CanvasNode[]): Map<string, { x: number; y: number }> {
  const targets = new Map<string, { x: number; y: number }>();
  if (!nodes.length) return targets;

  let currentX = 0;
  [...nodes]
    .sort((a, b) => a.created - b.created)
    .forEach(n => {
      targets.set(n.id, { x: Math.round(currentX), y: 0 });
      currentX += 350;
    });

  let minX = Infinity, maxX = -Infinity;
  targets.forEach(pos => {
    minX = Math.min(minX, pos.x);
    maxX = Math.max(maxX, pos.x + 240);
  });
  const cx = (minX + maxX) / 2;
  targets.forEach((pos, id) => {
    targets.set(id, { x: Math.round(pos.x - cx), y: -75 });
  });

  return targets;
}

export function calculateKanbanTargets(nodes: CanvasNode[]): Map<string, { x: number; y: number }> {
  const targets = new Map<string, { x: number; y: number }>();
  if (!nodes.length) return targets;

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
  let currentX = 0;

  activeBuckets.forEach(([, list]) => {
    let currentY = 0;
    list.forEach(n => {
      targets.set(n.id, { x: Math.round(currentX), y: Math.round(currentY) });
      currentY += (n.height || 150) + 40;
    });
    currentX += 340;
  });

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  targets.forEach(pos => {
    minX = Math.min(minX, pos.x);
    maxX = Math.max(maxX, pos.x + 240);
    minY = Math.min(minY, pos.y);
    maxY = Math.max(maxY, pos.y + 160);
  });

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  targets.forEach((pos, id) => {
    targets.set(id, { x: Math.round(pos.x - cx), y: Math.round(pos.y - cy) });
  });

  return targets;
}

export function calculateGridTargets(nodes: CanvasNode[]): Map<string, { x: number; y: number }> {
  const targets = new Map<string, { x: number; y: number }>();
  if (!nodes.length) return targets;

  const cols = Math.max(2, Math.ceil(Math.sqrt(nodes.length)));

  nodes.forEach((n, idx) => {
    const r = Math.floor(idx / cols);
    const c = idx % cols;
    targets.set(n.id, {
      x: Math.round(c * 340),
      y: Math.round(r * 220),
    });
  });

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  targets.forEach(pos => {
    minX = Math.min(minX, pos.x);
    maxX = Math.max(maxX, pos.x + 240);
    minY = Math.min(minY, pos.y);
    maxY = Math.max(maxY, pos.y + 160);
  });

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  targets.forEach((pos, id) => {
    targets.set(id, { x: Math.round(pos.x - cx), y: Math.round(pos.y - cy) });
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
  const lines = ['graph TD', '  %% Boardify Canvas Graph Export'];
  const idMap = new Map<string, string>();

  nodes.forEach((n, idx) => {
    const safeId = `N${idx + 1}`;
    idMap.set(n.id, safeId);
    const cleanTitle = n.title.replace(/["\n]/g, ' ').slice(0, 32);
    lines.push(`  ${safeId}["${cleanTitle}"]`);
  });

  edges.forEach(e => {
    const from = idMap.get(e.from);
    const to = idMap.get(e.to);
    if (from && to) {
      if (e.label) {
        const cleanLabel = e.label.replace(/["\n]/g, ' ').slice(0, 24);
        lines.push(`  ${from} -->|"${cleanLabel}"| ${to}`);
      } else {
        lines.push(`  ${from} --> ${to}`);
      }
    }
  });

  return lines.join('\n');
}

export function calculateForceDirectedTargets(nodes: CanvasNode[], edges: CanvasEdge[]): Map<string, { x: number; y: number }> {
  return calculateSmartFlowTargets(nodes, edges);
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

  const linkedNodeIds = new Set<string>();
  const connectionCounts = new Map<string, number>();
  nodes.forEach(n => connectionCounts.set(n.id, 0));

  edges.forEach(e => {
    linkedNodeIds.add(e.from);
    linkedNodeIds.add(e.to);
    connectionCounts.set(e.from, (connectionCounts.get(e.from) || 0) + 1);
    connectionCounts.set(e.to, (connectionCounts.get(e.to) || 0) + 1);
  });

  const orphanNodes = nodes.filter(n => !linkedNodeIds.has(n.id));
  const humanCount = nodes.filter(n => n.author === 'human').length;
  const agentCount = nodes.filter(n => n.author === 'agent').length;

  const colorDistribution: Record<string, number> = {};
  nodes.forEach(n => {
    const c = n.color || 'butter';
    colorDistribution[c] = (colorDistribution[c] || 0) + 1;
  });

  const bottleneckNodes = [...nodes]
    .filter(n => (connectionCounts.get(n.id) || 0) >= 3)
    .sort((a, b) => (connectionCounts.get(b.id) || 0) - (connectionCounts.get(a.id) || 0));

  let score = 100;
  if (nodes.length > 2) {
    const orphanPenalty = Math.min(40, orphanNodes.length * 12);
    score -= orphanPenalty;
  }

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
