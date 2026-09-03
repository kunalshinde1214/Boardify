export type NoteColor = 'butter' | 'sage' | 'coral' | 'slate' | 'lavender' | 'mint';

export type NodeType =
  | 'default'
  | 'agent'
  | 'tool'
  | 'database'
  | 'api'
  | 'cloud'
  | 'auth'
  | 'trigger'
  | 'ui'
  | 'sign'
  | 'logo'
  | 'heading'
  | 'task'
  | 'entity'
  | 'table'
  | 'shape'
  | 'shape_rectangle'
  | 'shape_circle'
  | 'shape_diamond'
  | 'shape_cylinder'
  | 'shape_hexagon'
  | 'shape_cloud';

export interface TaskItem {
  id: string;
  text: string;
  done: boolean;
}

export interface EntityField {
  id: string;
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  isNullable?: boolean;
  foreignTable?: string;
}

export interface CanvasNode {
  id: string;
  title: string;
  body: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  color: NoteColor;
  author: 'human' | 'agent';
  created: number;
  rot?: number;
  tags?: string[];
  nodeType?: NodeType;
  signType?: string;
  logoType?: string;
  stamp?: string;
  tasks?: TaskItem[];
  fields?: EntityField[];
  shapeType?: 'rectangle' | 'circle' | 'diamond' | 'cylinder' | 'hexagon' | 'cloud';
  roleTag?: 'software' | 'product' | 'design' | 'ai' | 'business';
  fontSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  styleVariant?: 'sticky' | 'glass' | 'badge' | 'signpost' | 'banner' | 'clean' | 'neon';
}

export type EdgeLineStyle = 'solid' | 'dashed' | 'dotted';
export type EdgeDirection = 'directed' | 'bidirectional' | 'undirected';

export interface CanvasEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  style?: 'solid' | 'dashed' | 'dotted' | 'bidirectional';
  lineStyle?: EdgeLineStyle;
  direction?: EdgeDirection;
  animated?: boolean;
}

export interface CanvasCamera {
  x: number;
  y: number;
  z: number;
}

export interface CanvasState {
  version: number;
  seq: number;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  updatedAt?: number;
}

export interface ToolInputSchema {
  type: string;
  properties: Record<string, {
    type?: string;
    description?: string;
    enum?: string[];
    items?: unknown;
    required?: string[];
  }>;
  required?: string[];
}

export interface WebMCPToolDef {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
  run: (input: Record<string, unknown>) => Promise<Record<string, unknown>> | Record<string, unknown>;
}

export interface ToolLogEntry {
  id: string;
  timestamp: string;
  toolName: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  success?: boolean;
  source: 'webmcp' | 'demo' | 'ui' | 'agent';
  durationMs?: number;
}

export type TemplateCategory =
  | 'All'
  | 'AI & Agents'
  | 'Cloud & Infra'
  | 'Databases & ERD'
  | 'Product & SaaS'
  | 'Engineering'
  | 'Strategy'
  | 'Creative'
  | 'Analysis';

export interface BoardTemplate {
  id: string;
  title: string;
  category: 'Strategy' | 'Engineering' | 'Product' | 'Creative' | 'Analysis' | 'AI & Agents' | 'Databases & ERD' | 'Cloud & Infra' | 'Product & SaaS';
  description: string;
  badge?: string;
  suggestedPrompt: string;
  stackIcons?: string[];
  tags?: string[];
  nodes: Omit<CanvasNode, 'id' | 'created'>[];
  edges: { sourceIndex: number; targetIndex: number; label?: string }[];
}

export interface BoardMetadata {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  nodeCount: number;
  edgeCount: number;
  isFavorite?: boolean;
}

export function generateNodeId(): string {
  return `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function generateEdgeId(): string {
  return `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

