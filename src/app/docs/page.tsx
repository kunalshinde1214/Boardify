'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider, useToast } from '@/components/ui/ToastProvider';
import {
  FileCode2,
  Terminal,
  Play,
  Check,
  Copy,
  ChevronRight,
  Shield,
  Zap,
  ExternalLink,
  BookOpen,
  Code2,
} from 'lucide-react';

function DocsPageInner() {
  const [selectedToolIndex, setSelectedToolIndex] = useState(0);
  const [customPayload, setCustomPayload] = useState('{\n  "title": "Autonomous Architecture Spike",\n  "body": "Spike out client-side WebMCP handlers.",\n  "color": "sage"\n}');
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const { showToast } = useToast();

  const toolDocs = [
    {
      name: 'get_canvas_state',
      description: 'Read the full board: all notes (id, title, body, position, color, author) and all directed links. Call this first to understand the canvas before taking action.',
      inputSchema: { type: 'object', properties: {} },
      sampleInput: '{}',
      sampleOutput: '{\n  "success": true,\n  "note_count": 3,\n  "link_count": 2,\n  "notes": [...],\n  "links": [...]\n}',
    },
    {
      name: 'add_idea_node',
      description: 'Create a new sticky note on the canvas. If coordinates are omitted, a free spot near the board center is automatically selected without overlapping existing notes.',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Headline for the sticky note (~40 chars)' },
          body: { type: 'string', description: 'Detailed bullet points or supporting explanation; newlines supported' },
          x: { type: 'number', description: 'Canvas X position' },
          y: { type: 'number', description: 'Canvas Y position' },
          color: { type: 'string', enum: ['butter', 'sage', 'coral', 'slate', 'lavender', 'mint'], description: 'Color' },
        },
        required: ['title'],
      },
      sampleInput: '{\n  "title": "Market Positioning",\n  "body": "Direct WebMCP native vs sidebar wrappers",\n  "color": "sage"\n}',
      sampleOutput: '{\n  "success": true,\n  "node_id": "n4",\n  "x": 340,\n  "y": 180,\n  "title": "Market Positioning"\n}',
    },
    {
      name: 'update_node',
      description: 'Modify an existing sticky note\'s title, body, color, or canvas position.',
      inputSchema: {
        type: 'object',
        properties: {
          node_id: { type: 'string', description: 'ID of the node to update' },
          title: { type: 'string' },
          body: { type: 'string' },
          color: { type: 'string', enum: ['butter', 'sage', 'coral', 'slate', 'lavender', 'mint'] },
          x: { type: 'number' },
          y: { type: 'number' },
        },
        required: ['node_id'],
      },
      sampleInput: '{\n  "node_id": "n1",\n  "title": "Refined Mission Statement",\n  "color": "lavender"\n}',
      sampleOutput: '{\n  "success": true,\n  "node_id": "n1"\n}',
    },
    {
      name: 'connect_nodes',
      description: 'Draw a directed link from one note to another with an optional relationship label.',
      inputSchema: {
        type: 'object',
        properties: {
          source_id: { type: 'string', description: 'Source node ID' },
          target_id: { type: 'string', description: 'Target node ID' },
          label: { type: 'string', description: 'Relationship label on the wire' },
        },
        required: ['source_id', 'target_id'],
      },
      sampleInput: '{\n  "source_id": "n1",\n  "target_id": "n2",\n  "label": "powers"\n}',
      sampleOutput: '{\n  "success": true,\n  "link_id": "e3",\n  "from": "n1",\n  "to": "n2",\n  "label": "powers"\n}',
    },
    {
      name: 'arrange_layout',
      description: 'Auto-arrange all sticky notes using an intelligent spatial algorithm ("clusters", "timeline", "kanban", or "grid").',
      inputSchema: {
        type: 'object',
        properties: {
          layout: { type: 'string', enum: ['clusters', 'timeline', 'kanban', 'grid'], description: 'Layout algorithm' },
        },
      },
      sampleInput: '{\n  "layout": "clusters"\n}',
      sampleOutput: '{\n  "success": true,\n  "layout": "clusters",\n  "moved_count": 6\n}',
    },
    {
      name: 'highlight_node',
      description: 'Pan camera to a note and trigger an animated attention pulse with a speech flag callout to direct human focus.',
      inputSchema: {
        type: 'object',
        properties: {
          node_id: { type: 'string', description: 'ID of the node to highlight' },
          reason: { type: 'string', description: 'Reason displayed on the callout flag' },
        },
        required: ['node_id'],
      },
      sampleInput: '{\n  "node_id": "n2",\n  "reason": "Unlinked risk factor needs mitigation"\n}',
      sampleOutput: '{\n  "success": true,\n  "node_id": "n2"\n}',
    },
    {
      name: 'export_canvas',
      description: 'Export board into structured Markdown outline, Mermaid flowchart, or full JSON graph format.',
      inputSchema: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['markdown', 'mermaid', 'json'] },
        },
      },
      sampleInput: '{\n  "format": "markdown"\n}',
      sampleOutput: '{\n  "success": true,\n  "format": "markdown",\n  "note_count": 5,\n  "link_count": 4,\n  "content": "# Boardify Export..."\n}',
    },
    {
      name: 'batch_create_nodes',
      description: 'Create multiple linked sticky notes in a single atomic tool call (ideal for frameworks like SWOT or brainstorms).',
      inputSchema: {
        type: 'object',
        properties: {
          nodes: { type: 'array', description: 'Array of node objects' },
          links: { type: 'array', description: 'Array of link objects with fromIndex and toIndex' },
        },
        required: ['nodes'],
      },
      sampleInput: '{\n  "nodes": [\n    { "title": "Strength", "color": "sage" },\n    { "title": "Weakness", "color": "coral" }\n  ],\n  "links": [\n    { "fromIndex": 0, "toIndex": 1, "label": "offsets" }\n  ]\n}',
      sampleOutput: '{\n  "success": true,\n  "created_count": 2,\n  "node_ids": ["n5", "n6"]\n}',
    },
  ];

  const currentTool = toolDocs[selectedToolIndex];

  const handleTestExecution = () => {
    setIsExecuting(true);
    try {
      const parsed = JSON.parse(customPayload);
      setTimeout(() => {
        setIsExecuting(false);
        setExecutionResult(JSON.stringify({
          status: 'success',
          executed_tool: currentTool.name,
          mock_result: currentTool.name === 'add_idea_node'
            ? { success: true, node_id: `n${Math.floor(Math.random() * 100)}`, ...parsed }
            : { success: true, message: `Executed ${currentTool.name} cleanly` },
          execution_time_ms: 12,
        }, null, 2));
        showToast(`Simulated ${currentTool.name} execution!`, 'ok');
      }, 400);
    } catch {
      setIsExecuting(false);
      setExecutionResult(JSON.stringify({ status: 'error', message: 'Invalid JSON payload' }, null, 2));
      showToast('JSON syntax error in input payload', 'warn');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4EFE4]">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE9A8] border border-[#1D1A16] text-xs font-bold text-[#1D1A16]">
            <Code2 className="w-3.5 h-3.5 text-[#E24E1B]" />
            <span>WebMCP Open Standard Specification v1.0</span>
          </div>
          <h1 className="font-['Fraunces'] italic font-bold text-4xl sm:text-5xl text-[#1D1A16]">
            WebMCP Developer & Tool Reference
          </h1>
          <p className="text-sm sm:text-base text-[#6B6353] font-['Space_Grotesk'] leading-relaxed">
            Everything you need to understand how browser agents interface with Boardify via <code className="text-[#E24E1B] font-mono bg-white px-1.5 py-0.5 rounded border border-[#DCD4C2]">document.modelContext</code>.
          </p>
        </div>

        {/* Quickstart Setup Guide */}
        <div id="chrome-flag" className="p-6 sm:p-8 rounded-3xl border-2 border-[#1D1A16] bg-[#FFFDF6] shadow-[6px_6px_0_#1D1A16] space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#E24E1B] text-white flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-['Fraunces'] italic font-bold text-2xl text-[#1D1A16]">
                Testing WebMCP in Your Browser
              </h2>
              <p className="text-xs text-[#6B6353]">
                Two official ways to test live WebMCP agents on Boardify right now.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Method 1: ChatGPT */}
            <div className="p-5 rounded-2xl bg-[#F4EFE4] border border-[#1D1A16] space-y-3">
              <span className="font-mono text-[10px] font-bold uppercase text-[#E24E1B]">
                Method 1 · Zero Setup
              </span>
              <h3 className="font-bold text-base text-[#1D1A16]">
                ChatGPT In-App Browser
              </h3>
              <p className="text-xs text-[#6B6353] leading-relaxed">
                ChatGPT Pro / Plus in-app browser supports WebMCP out of the box. Simply share your Boardify link or ask ChatGPT to open <code className="font-mono text-[#E24E1B]">https://boardify.live/canvas</code>.
              </p>
            </div>

            {/* Method 2: Google Chrome Flag */}
            <div className="p-5 rounded-2xl bg-[#F4EFE4] border border-[#1D1A16] space-y-3">
              <span className="font-mono text-[10px] font-bold uppercase text-[#E24E1B]">
                Method 2 · Desktop Chrome
              </span>
              <h3 className="font-bold text-base text-[#1D1A16]">
                Google Chrome Flag
              </h3>
              <p className="text-xs text-[#6B6353] leading-relaxed">
                Open <code className="font-mono text-[#E24E1B] bg-white px-1 rounded">chrome://flags/#enable-webmcp-testing</code> in Chrome, toggle to <b>Enabled</b>, and relaunch your browser.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Schema Explorer */}
        <div id="schema-explorer" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Tool Selector List */}
          <div className="lg:col-span-4 space-y-2">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#6B6353] px-1">
              Registered Tools ({toolDocs.length})
            </h3>

            <div className="space-y-1.5">
              {toolDocs.map((t, idx) => (
                <button
                  key={t.name}
                  onClick={() => {
                    setSelectedToolIndex(idx);
                    setCustomPayload(t.sampleInput);
                    setExecutionResult(null);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left font-mono text-xs font-bold transition-all ${
                    selectedToolIndex === idx
                      ? 'bg-[#1D1A16] text-[#F4EFE4] border-[#1D1A16] shadow-[3px_3px_0_#6B6353]'
                      : 'bg-[#FFFDF6] text-[#1D1A16] border-[#DCD4C2] hover:bg-[#F4EFE4]'
                  }`}
                >
                  <span className="truncate">{t.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Tool Detail & Interactive Executor */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl border-2 border-[#1D1A16] bg-[#FFFDF6] shadow-[6px_6px_0_#1D1A16] space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#E24E1B] font-bold">
                  Tool Specification
                </span>
                <span className="font-mono text-[10px] text-[#6B6353]">
                  document.modelContext
                </span>
              </div>
              <h2 className="font-mono font-bold text-2xl text-[#1D1A16] mt-1">
                {currentTool.name}
              </h2>
              <p className="text-xs text-[#6B6353] mt-2 leading-relaxed">
                {currentTool.description}
              </p>
            </div>

            {/* Input Schema Display */}
            <div>
              <h4 className="font-mono text-xs font-bold text-[#1D1A16] uppercase mb-2">
                Input JSON Schema
              </h4>
              <pre className="p-3.5 rounded-xl bg-[#1D1A16] text-[#F4EFE4] font-mono text-xs overflow-x-auto border border-[#1D1A16]">
                {JSON.stringify(currentTool.inputSchema, null, 2)}
              </pre>
            </div>

            {/* Live Tool Payload Tester */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-xs font-bold text-[#1D1A16] uppercase">
                  Interactive Test Runner (JSON Payload)
                </h4>
                <button
                  onClick={handleTestExecution}
                  disabled={isExecuting}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E24E1B] text-white text-xs font-bold shadow-[2px_2px_0_#1D1A16] hover:bg-[#B33A10] disabled:opacity-50 transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isExecuting ? 'Running...' : 'Execute Tool'}</span>
                </button>
              </div>

              <textarea
                value={customPayload}
                onChange={e => setCustomPayload(e.target.value)}
                rows={4}
                className="w-full bg-[#F4EFE4] border border-[#1D1A16] rounded-xl p-3 font-mono text-xs text-[#1D1A16] focus:outline-none focus:ring-2 focus:ring-[#E24E1B]"
              />

              {executionResult && (
                <div className="space-y-1.5 animate-note-pop">
                  <span className="font-mono text-[10px] font-bold text-emerald-800 uppercase">
                    Execution Output
                  </span>
                  <pre className="p-3.5 rounded-xl bg-[#1D1A16] text-emerald-300 font-mono text-xs overflow-x-auto border border-[#1D1A16]">
                    {executionResult}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function DocsPage() {
  return (
    <ToastProvider>
      <DocsPageInner />
    </ToastProvider>
  );
}
