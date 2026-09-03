'use client';

import React, { useState, useEffect } from 'react';
import {
  parseDiagramDsl,
  layoutDiagramDsl,
  exportCanvasToDsl,
  exportCanvasToMermaid,
} from '@/lib/diagram-dsl';
import { CanvasNode, CanvasEdge } from '@/lib/types';
import {
  Code2,
  Play,
  Copy,
  Check,
  Download,
  Sparkles,
  Layers,
  ArrowRight,
  ArrowDown,
  X,
  FileCode,
  RefreshCw,
  Info,
} from 'lucide-react';

interface DiagramDslModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDiagram: (nodes: CanvasNode[], edges: CanvasEdge[], append: boolean) => void;
  currentNodes: CanvasNode[];
  currentEdges: CanvasEdge[];
}

const PRESET_EXAMPLES = [
  {
    name: 'AWS Serverless 3-Tier',
    code: `// AWS Serverless 3-Tier Architecture
direction: LR

Client [icon: react, color: mint, title: "Next.js Web Client"]
Gateway [icon: aws-api-gateway, title: "API Gateway HTTP"]
AuthLambda [icon: aws-lambda, color: lavender, title: "Auth Lambda"]
AppLambda [icon: aws-lambda, color: lavender, title: "Core App Lambda"]
UsersDB [icon: aws-dynamodb, color: butter, title: "Users DynamoDB"]
Cache [icon: redis, color: coral, title: "ElastiCache Redis"]
Storage [icon: aws-s3, color: sage, title: "Assets S3 Bucket"]
RateAlert [sign: warning, color: coral, title: "Rate Limit 5000 req/s"]

Client --> Gateway: "HTTPS / REST"
Gateway --> AuthLambda: "Validate JWT"
Gateway --> AppLambda: "Proxy Requests"
AppLambda --> UsersDB: "Read / Write"
AppLambda --> Cache: "Session Cache"
AppLambda --> Storage: "Upload Presigned"
Gateway --- RateAlert
`,
  },
  {
    name: 'RAG / AI Agent Pipeline',
    code: `// RAG & Vector Search AI Pipeline
direction: LR

UserApp [icon: nextjs, color: mint, title: "User Chat Interface"]
APIServer [icon: fastapi, color: sage, title: "FastAPI Orchestrator"]
Embeddings [icon: openai, color: lavender, title: "Text Embeddings 3"]
VectorDB [icon: qdrant, color: coral, title: "Qdrant Vector DB"]
LLMEngine [icon: claude, color: butter, title: "Claude 3.5 Sonnet"]
Monitoring [icon: posthog, title: "PostHog Analytics"]
StatusLive [sign: launch, color: mint, title: "Production Live"]

UserApp --> APIServer: "User Query"
APIServer --> Embeddings: "Generate Vectors"
Embeddings --> VectorDB: "Cosine Search (Top-K)"
VectorDB --> APIServer: "Context Chunks"
APIServer --> LLMEngine: "Prompt + Context"
LLMEngine --> UserApp: "Streamed Response"
APIServer --- Monitoring
APIServer --- StatusLive
`,
  },
  {
    name: 'Microservices & Kafka Event Stream',
    code: `// Event-Driven Microservices
direction: LR

WebClient [icon: figma, color: mint, title: "Web Frontend"]
EnvoyProxy [icon: envoy, title: "Envoy API Gateway"]
AuthService [icon: node, color: lavender, title: "Auth Microservice"]
OrderService [icon: go, color: sage, title: "Order Microservice"]
EventBus [icon: kafka, color: coral, title: "Kafka Event Stream"]
PaymentWorker [icon: stripe, color: butter, title: "Stripe Worker"]
OrderDB [icon: postgres, color: slate, title: "Orders PostgreSQL"]
CriticalNotice [sign: critical, color: coral, title: "Zero Data Loss SLA"]

WebClient --> EnvoyProxy
EnvoyProxy --> AuthService: "gRPC Auth"
EnvoyProxy --> OrderService: "Create Order"
OrderService --> EventBus: "Publish 'OrderCreated'"
EventBus --> PaymentWorker: "Consume Event"
OrderService --> OrderDB: "ACID Commit"
EventBus --- CriticalNotice
`,
  },
  {
    name: 'E-Commerce Database Schema (ERD)',
    code: `// Relational Entity-Relationship Diagram
direction: LR

entity Users {
  id UUID PK
  email VARCHAR(255)
  name VARCHAR(100)
  created_at TIMESTAMP
}

entity Orders {
  id UUID PK
  user_id UUID FK
  total_amount DECIMAL(10,2)
  status VARCHAR(32)
  created_at TIMESTAMP
}

entity OrderItems {
  id UUID PK
  order_id UUID FK
  product_id UUID FK
  quantity INT
  unit_price DECIMAL(10,2)
}

entity Products {
  id UUID PK
  category_id UUID FK
  sku VARCHAR(64)
  title VARCHAR(255)
  price DECIMAL(10,2)
}

entity Payments {
  id UUID PK
  order_id UUID FK
  stripe_charge_id VARCHAR(128)
  status VARCHAR(32)
}

Users ||--o{ Orders : "places (1:N)"
Orders ||--o{ OrderItems : "contains (1:N)"
Products ||--o{ OrderItems : "ordered in (1:N)"
Orders ||--|| Payments : "settles (1:1)"
`,
  },
  {
    name: 'Mermaid Flowchart Syntax',
    code: `graph LR
  Frontend[Next.js Client: nextjs] --> Gateway[API Gateway: aws-api-gateway]
  Gateway --> Service[Node.js Service: node]
  Service --> Database[(Postgres DB: postgres)]
  Service --> Cache[(Redis Cache: redis)]
  Database --> Backup[S3 Glacier: aws-glacier]
`,
  },
];

export function DiagramDslModal({
  isOpen,
  onClose,
  onApplyDiagram,
  currentNodes,
  currentEdges,
}: DiagramDslModalProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'export'>('editor');
  const [dslCode, setDslCode] = useState(PRESET_EXAMPLES[0].code);
  const [direction, setDirection] = useState<'LR' | 'TB'>('LR');
  const [appendMode, setAppendMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'dsl' | 'mermaid'>('dsl');

  // When opening in export tab, serialize current board
  useEffect(() => {
    if (activeTab === 'export') {
      if (exportFormat === 'dsl') {
        setDslCode(exportCanvasToDsl(currentNodes, currentEdges));
      } else {
        setDslCode(exportCanvasToMermaid(currentNodes, currentEdges));
      }
    }
  }, [activeTab, exportFormat, currentNodes, currentEdges]);

  if (!isOpen) return null;

  const handleRender = () => {
    const parsed = parseDiagramDsl(dslCode);
    if (direction) parsed.direction = direction;

    const layoutOriginX = appendMode && currentNodes.length > 0 ? Math.max(...currentNodes.map(n => n.x)) + 400 : 250;
    const layoutOriginY = appendMode && currentNodes.length > 0 ? 250 : 250;

    const result = layoutDiagramDsl(parsed, layoutOriginX, layoutOriginY);
    onApplyDiagram(result.nodes, result.edges, appendMode);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(dslCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = exportFormat === 'mermaid' ? 'mmd' : 'dsl';
    const blob = new Blob([dslCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boardify-diagram.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-[#FFFDF6] border-2 border-[#1D1A16] shadow-[8px_8px_0px_0px_#1D1A16] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#1D1A16] bg-[#F7F4EA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E24E1B] border-2 border-[#1D1A16] shadow-[2px_2px_0px_0px_#1D1A16] flex items-center justify-center text-white">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-xl text-[#1D1A16] tracking-tight">
                  Diagram-as-Code Engine
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20">
                  Eraser + WebMCP DSL
                </span>
              </div>
              <p className="text-xs text-[#1D1A16]/70">
                Declarative text architecture & auto-layout for agents and developers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex items-center rounded-xl bg-[#EAE5D9] p-1 border border-[#1D1A16]/20">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'editor'
                    ? 'bg-[#1D1A16] text-[#FFFDF6] shadow-sm'
                    : 'text-[#1D1A16]/70 hover:text-[#1D1A16]'
                }`}
              >
                Code Editor
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'export'
                    ? 'bg-[#1D1A16] text-[#FFFDF6] shadow-sm'
                    : 'text-[#1D1A16]/70 hover:text-[#1D1A16]'
                }`}
              >
                Export Canvas as Code
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#1D1A16]/70 hover:text-[#1D1A16] hover:bg-[#1D1A16]/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x-2 divide-[#1D1A16]">
          {/* Left / Main Editor Area */}
          <div className="flex-1 flex flex-col overflow-hidden p-4">
            {activeTab === 'editor' ? (
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-[11px] font-bold text-[#1D1A16]/60 uppercase tracking-wider whitespace-nowrap">
                    Presets:
                  </span>
                  {PRESET_EXAMPLES.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setDslCode(preset.code)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg border border-[#1D1A16]/20 bg-[#FFFDF6] hover:bg-[#1D1A16] hover:text-white transition-colors whitespace-nowrap shadow-sm"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDirection(d => (d === 'LR' ? 'TB' : 'LR'))}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-[#1D1A16] bg-[#FFFDF6] shadow-[2px_2px_0_#1D1A16] hover:translate-y-0.5 transition-transform"
                    title="Toggle Layout Direction"
                  >
                    {direction === 'LR' ? (
                      <>
                        <ArrowRight className="w-3.5 h-3.5 text-[#E24E1B]" />
                        <span>Left to Right</span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="w-3.5 h-3.5 text-[#E24E1B]" />
                        <span>Top to Bottom</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#1D1A16]/60 uppercase tracking-wider">
                    Format:
                  </span>
                  <button
                    onClick={() => setExportFormat('dsl')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border border-[#1D1A16] ${
                      exportFormat === 'dsl' ? 'bg-[#1D1A16] text-white' : 'bg-white text-[#1D1A16]'
                    }`}
                  >
                    Eraser / WebMCP DSL
                  </button>
                  <button
                    onClick={() => setExportFormat('mermaid')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border border-[#1D1A16] ${
                      exportFormat === 'mermaid' ? 'bg-[#1D1A16] text-white' : 'bg-white text-[#1D1A16]'
                    }`}
                  >
                    Mermaid Flowchart (.mmd)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border border-[#1D1A16] bg-white shadow-[2px_2px_0_#1D1A16] hover:bg-[#F7F4EA]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border border-[#1D1A16] bg-white shadow-[2px_2px_0_#1D1A16] hover:bg-[#F7F4EA]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            )}

            {/* Code Textarea */}
            <div className="flex-1 relative rounded-2xl border-2 border-[#1D1A16] bg-[#1E1E1E] shadow-inner overflow-hidden flex flex-col">
              <textarea
                value={dslCode}
                onChange={e => setDslCode(e.target.value)}
                placeholder="// Write or paste your architecture DSL or Mermaid code here..."
                className="w-full flex-1 p-4 font-mono text-xs sm:text-sm text-[#F7F4EA] bg-transparent resize-none focus:outline-none leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Right / Sidebar Cheatsheet */}
          <div className="w-full md:w-80 p-4 bg-[#F7F4EA] flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#1D1A16]">
                <Sparkles className="w-4 h-4 text-[#E24E1B]" />
                <span>DSL Syntax Cheatsheet</span>
              </div>

              <div className="space-y-3 text-xs text-[#1D1A16]/80 font-sans">
                <div className="p-2.5 rounded-xl bg-white border border-[#1D1A16]/20">
                  <span className="font-bold text-[#1D1A16] block mb-1">1. Tech Logo Node</span>
                  <code className="block bg-[#1D1A16]/5 p-1 rounded font-mono text-[11px] text-[#E24E1B]">
                    Client [icon: react, title: "Web App"]
                  </code>
                  <p className="text-[10px] text-[#1D1A16]/60 mt-1">Supports all 1,882+ logos</p>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#1D1A16]/20">
                  <span className="font-bold text-[#1D1A16] block mb-1">2. Road & Status Signs</span>
                  <code className="block bg-[#1D1A16]/5 p-1 rounded font-mono text-[11px] text-[#E24E1B]">
                    Alert [sign: warning, color: coral]
                  </code>
                  <p className="text-[10px] text-[#1D1A16]/60 mt-1">warning, stop, launch, goal, bug</p>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#1D1A16]/20">
                  <span className="font-bold text-[#1D1A16] block mb-1">3. Labeled Connections</span>
                  <code className="block bg-[#1D1A16]/5 p-1 rounded font-mono text-[11px] text-[#E24E1B]">
                    A --&gt; B: &quot;HTTPS / JSON&quot;
                  </code>
                  <code className="block bg-[#1D1A16]/5 p-1 rounded font-mono text-[11px] text-[#E24E1B] mt-1">
                    A --- B (Dashed line)
                  </code>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#1D1A16]/20">
                  <span className="font-bold text-[#1D1A16] block mb-1">4. Colors & Attributes</span>
                  <p className="text-[11px] text-[#1D1A16]/70">
                    <span className="font-mono text-[10px]">color: butter | mint | coral | lavender | sage | slate</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {activeTab === 'editor' && (
              <div className="mt-4 pt-4 border-t border-[#1D1A16]/20 space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-[#1D1A16] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appendMode}
                    onChange={e => setAppendMode(e.target.checked)}
                    className="rounded border-[#1D1A16] text-[#E24E1B] focus:ring-[#E24E1B]"
                  />
                  <span>Append to existing board</span>
                </label>

                <button
                  onClick={handleRender}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#E24E1B] text-white font-heading font-black text-sm tracking-tight border-2 border-[#1D1A16] shadow-[4px_4px_0px_0px_#1D1A16] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1D1A16] active:translate-y-1 active:shadow-none transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Compile & Render to Whiteboard</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
