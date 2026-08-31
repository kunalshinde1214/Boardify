'use client';

import React, { useState } from 'react';
import { CanvasNode, CanvasEdge } from '@/lib/types';
import { generateMarkdownExport, generateMermaidExport } from '@/lib/layouts';
import { X, Download, Copy, Check, FileText, Code2, Network } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

interface ExportModalProps {
  isOpen: boolean;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  onClose: () => void;
}

export function ExportModal({ isOpen, nodes, edges, onClose }: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<'markdown' | 'mermaid' | 'json'>('markdown');
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  let content = '';
  if (activeTab === 'mermaid') {
    content = generateMermaidExport(nodes, edges);
  } else if (activeTab === 'json') {
    content = JSON.stringify({ version: 1, nodes, edges }, null, 2);
  } else {
    content = generateMarkdownExport(nodes, edges);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    showToast('Copied export to clipboard!', 'ok');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = activeTab === 'json' ? 'json' : activeTab === 'mermaid' ? 'mmd' : 'md';
    const mime = activeTab === 'json' ? 'application/json' : 'text/plain';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boardify-export-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${ext.toUpperCase()} file!`, 'ok');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1A16]/50 backdrop-blur-xs animate-note-pop">
      <div className="bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[6px_6px_0_#1D1A16] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCD4C2] bg-[#F4EFE4]/60">
          <div>
            <h2 className="font-['Fraunces'] italic font-bold text-xl text-[#1D1A16]">
              Export Canvas
            </h2>
            <p className="text-xs text-[#6B6353]">
              Structured exports powered by the same <code className="text-[#E24E1B] font-mono">export_canvas</code> tool WebMCP agents call.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#1D1A16] bg-[#FFFDF6] hover:bg-[#F4EFE4] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-2 px-6 pt-4">
          <button
            onClick={() => setActiveTab('markdown')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'markdown'
                ? 'bg-[#1D1A16] text-[#F4EFE4]'
                : 'bg-[#F4EFE4] text-[#1D1A16] border border-[#DCD4C2] hover:bg-[#EAE2D2]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Markdown Outline</span>
          </button>

          <button
            onClick={() => setActiveTab('mermaid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'mermaid'
                ? 'bg-[#1D1A16] text-[#F4EFE4]'
                : 'bg-[#F4EFE4] text-[#1D1A16] border border-[#DCD4C2] hover:bg-[#EAE2D2]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Mermaid Chart</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'json'
                ? 'bg-[#1D1A16] text-[#F4EFE4]'
                : 'bg-[#F4EFE4] text-[#1D1A16] border border-[#DCD4C2] hover:bg-[#EAE2D2]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>JSON State</span>
          </button>
        </div>

        {/* Preview box */}
        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          <div className="relative flex-1 bg-[#1D1A16] text-[#F4EFE4] rounded-xl p-4 font-mono text-xs overflow-auto border border-[#1D1A16] max-h-[360px]">
            <pre className="whitespace-pre-wrap">{content}</pre>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#DCD4C2] bg-[#F4EFE4]/40">
          <span className="text-xs text-[#6B6353] font-mono">
            {nodes.length} notes · {edges.length} links
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#1D1A16] bg-[#FFFDF6] text-xs font-bold shadow-[2px_2px_0_#1D1A16] hover:bg-[#F4EFE4] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E24E1B] text-white text-xs font-bold border border-[#1D1A16] shadow-[2px_2px_0_#1D1A16] hover:bg-[#B33A10] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
