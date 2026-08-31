export type NoteColor = 'butter' | 'sage' | 'coral' | 'slate' | 'lavender' | 'mint';

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
}

export interface CanvasEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  style?: 'solid' | 'dashed';
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
  source: 'webmcp' | 'demo' | 'ui';
  durationMs?: number;
}

export interface BoardTemplate {
  id: string;
  title: string;
  category: 'Strategy' | 'Engineering' | 'Product' | 'Creative' | 'Analysis';
  description: string;
  badge?: string;
  suggestedPrompt: string;
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

