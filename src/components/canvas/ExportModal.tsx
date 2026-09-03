'use client';

import React, { useState, useEffect } from 'react';
import { CanvasNode, CanvasEdge } from '@/lib/types';
import { generateMarkdownExport, generateMermaidExport, getBoundingBox } from '@/lib/layouts';
import { exportCanvasToDsl } from '@/lib/diagram-dsl';
import { X, Download, Copy, Check, FileText, Code2, Network, Image as ImageIcon, FileSpreadsheet, Sparkles, FileDown, Workflow } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

import { NetlifyIcon } from '@/components/ui/BrandIcons';

interface ExportModalProps {
  isOpen: boolean;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  onClose: () => void;
  onOpenNetlifyDeploy?: () => void;
}

export function ExportModal({ isOpen, nodes, edges, onClose, onOpenNetlifyDeploy }: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'pdf' | 'dsl' | 'markdown' | 'mermaid' | 'json'>('image');
  const [copied, setCopied] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isRenderingImage, setIsRenderingImage] = useState(false);
  const { showToast } = useToast();

  // Capture canvas DOM directly using html-to-image
  useEffect(() => {
    if (!isOpen || !nodes.length) return;

    setIsRenderingImage(true);

    const captureCanvas = async () => {
      try {
        const viewportEl = document.getElementById('boardify-canvas-viewport');
        if (viewportEl) {
          // Filter out temporary overlays
          const dataUrl = await toPng(viewportEl, {
            quality: 0.98,
            pixelRatio: 2,
            backgroundColor: '#F4EFE4',
            skipFonts: true,
            filter: node => {
              // Ignore agent studio drawer and fixed buttons if nested
              if ((node as HTMLElement)?.classList?.contains?.('minimap-container')) return false;
              return true;
            },
          });
          setPreviewImageUrl(dataUrl);
          setIsRenderingImage(false);
          return;
        }
      } catch (err) {
        console.warn('html-to-image DOM capture failed, falling back to high-res canvas renderer:', err);
      }

      // Fallback: high-res vector canvas rendering
      try {
        const fallbackUrl = renderBoardToCanvasDataUrl(nodes, edges);
        setPreviewImageUrl(fallbackUrl);
      } catch (fallbackErr) {
        console.warn('Canvas rendering error:', fallbackErr);
      } finally {
        setIsRenderingImage(false);
      }
    };

    const timer = setTimeout(captureCanvas, 100);
    return () => clearTimeout(timer);
  }, [isOpen, nodes, edges]);

  if (!isOpen) return null;

  let textContent = '';
  if (activeTab === 'dsl') {
    textContent = exportCanvasToDsl(nodes, edges);
  } else if (activeTab === 'mermaid') {
    textContent = generateMermaidExport(nodes, edges);
  } else if (activeTab === 'json') {
    textContent = JSON.stringify({ version: 1, nodes, edges }, null, 2);
  } else if (activeTab === 'markdown') {
    textContent = generateMarkdownExport(nodes, edges);
  }

  const handleCopy = () => {
    if (activeTab === 'image' && previewImageUrl) {
      fetch(previewImageUrl)
        .then(res => res.blob())
        .then(blob => {
          navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setCopied(true);
          showToast('Copied high-res image to clipboard!', 'ok');
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          navigator.clipboard.writeText(previewImageUrl);
          showToast('Copied Image data URL', 'ok');
        });
      return;
    }

    navigator.clipboard.writeText(textContent);
    setCopied(true);
    showToast('Copied export to clipboard!', 'ok');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (activeTab === 'image') {
      if (!previewImageUrl) {
        showToast('Image still rendering, please wait...', 'info');
        return;
      }
      const a = document.createElement('a');
      a.href = previewImageUrl;
      a.download = `boardify-canvas-${Date.now()}.png`;
      a.click();
      showToast('Downloaded High-Res PNG Image!', 'ok');
      return;
    }

    if (activeTab === 'pdf') {
      if (!previewImageUrl) {
        showToast('Rendering PDF canvas preview...', 'info');
        return;
      }

      try {
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [1200, 800],
        });

        doc.setFillColor(244, 239, 228);
        doc.rect(0, 0, 1200, 800, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(29, 26, 22);
        doc.text('Boardify Strategy Canvas Export', 40, 45);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(107, 99, 83);
        doc.text(`Generated on ${new Date().toLocaleDateString()} · ${nodes.length} Notes · ${edges.length} Connections`, 40, 60);

        const pageWidth = 1200;
        const pageHeight = 800;
        const margin = 40;
        const maxW = pageWidth - margin * 2;
        const maxH = pageHeight - margin * 2 - 40;

        let printW = maxW;
        let printH = (maxW * 800) / 1200;
        if (printH > maxH) {
          printH = maxH;
          printW = (maxH * 1200) / 800;
        }

        const x = (pageWidth - printW) / 2;
        const y = 60 + (pageHeight - 80 - printH) / 2;

        doc.addImage(previewImageUrl, 'PNG', x, y, printW, printH);
        doc.save(`boardify-canvas-${Date.now()}.pdf`);
        showToast('Downloaded PDF Document!', 'ok');
      } catch (err) {
        console.warn('jsPDF generation failed, opening print dialog fallback:', err);
      }
      return;
    }

    const ext = activeTab === 'json' ? 'json' : activeTab === 'mermaid' ? 'mmd' : activeTab === 'dsl' ? 'dsl' : 'md';
    const mime = activeTab === 'json' ? 'application/json' : 'text/plain';
    const blob = new Blob([textContent], { type: mime });
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
      <div className="bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[6px_6px_0_#1D1A16] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCD4C2] bg-[#F4EFE4]/60">
          <div>
            <h2 className="font-['Fraunces'] italic font-bold text-xl text-[#1D1A16]">
              Export Canvas
            </h2>
            <p className="text-xs text-[#6B6353]">
              Download high-fidelity visuals or structured artifacts powered by WebMCP.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#1D1A16] bg-[#FFFDF6] hover:bg-[#F4EFE4] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center justify-between px-6 pt-4 border-b border-[#DCD4C2] pb-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'image', label: 'PNG Image', icon: ImageIcon },
              { id: 'pdf', label: 'PDF Document', icon: FileDown },
              { id: 'dsl', label: 'Diagram DSL', icon: Workflow },
              { id: 'markdown', label: 'Markdown Outline', icon: FileText },
              { id: 'mermaid', label: 'Mermaid Chart', icon: Network },
              { id: 'json', label: 'JSON Backup', icon: Code2 },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1D1A16] text-[#F4EFE4] shadow-[2px_2px_0_#6B6353]'
                      : 'bg-[#F4EFE4] text-[#1D1A16] border border-[#DCD4C2] hover:bg-[#EAE2D2]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {onOpenNetlifyDeploy && (
            <button
              onClick={() => {
                onClose();
                onOpenNetlifyDeploy();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00C7B7] text-[#0E1E25] text-xs font-extrabold shadow-[2px_2px_0_#1D1A16] border border-[#1D1A16] hover:bg-[#00b0a2] cursor-pointer whitespace-nowrap shrink-0"
            >
              <NetlifyIcon size={14} />
              <span>Deploy to Netlify</span>
            </button>
          )}
        </div>

        {/* Preview box */}
        <div className="p-6 flex-1 overflow-hidden flex flex-col min-h-[340px]">
          {activeTab === 'image' || activeTab === 'pdf' ? (
            <div className="relative flex-1 bg-[#F4EFE4] rounded-xl p-4 border-2 border-[#DCD4C2] flex items-center justify-center overflow-auto max-h-[380px]">
              {isRenderingImage ? (
                <div className="flex items-center gap-2 text-xs font-bold text-[#6B6353]">
                  <Sparkles className="w-4 h-4 animate-spin text-[#E24E1B]" />
                  <span>Capturing Pixel-Perfect Screen Snapshot...</span>
                </div>
              ) : previewImageUrl ? (
                <img
                  src={previewImageUrl}
                  alt="Boardify Canvas Screen Export"
                  className="max-h-full max-w-full object-contain rounded-lg shadow-md border border-[#1D1A16]/20"
                />
              ) : (
                <span className="text-xs text-[#6B6353]">No notes on canvas to export</span>
              )}
            </div>
          ) : (
            <div className="relative flex-1 bg-[#1D1A16] text-[#F4EFE4] rounded-xl p-4 font-mono text-xs overflow-auto border border-[#1D1A16] max-h-[380px]">
              <pre className="whitespace-pre-wrap">{textContent}</pre>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#DCD4C2] bg-[#F4EFE4]/40">
          <span className="text-xs text-[#6B6353] font-mono">
            {nodes.length} notes · {edges.length} links
          </span>

          <div className="flex items-center gap-3">
            {activeTab !== 'pdf' && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#1D1A16] bg-[#FFFDF6] text-xs font-bold shadow-[2px_2px_0_#1D1A16] hover:bg-[#F4EFE4] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E24E1B] text-white text-xs font-bold border border-[#1D1A16] shadow-[2px_2px_0_#1D1A16] hover:bg-[#B33A10] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
            >
              {activeTab === 'pdf' ? (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download PDF Document</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download {activeTab === 'image' ? 'PNG Image' : activeTab.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Fallback vector canvas renderer
 */
function renderBoardToCanvasDataUrl(nodes: CanvasNode[], edges: CanvasEdge[]): string {
  if (!nodes.length) return '';

  const bb = getBoundingBox(nodes);
  if (!bb) return '';

  const padding = 80;
  const width = Math.max(900, bb.width + padding * 2);
  const height = Math.max(600, bb.height + padding * 2);
  const dpr = 2;

  const canvas = document.createElement('canvas');
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(dpr, dpr);

  ctx.fillStyle = '#F4EFE4';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(29, 26, 22, 0.12)';
  const dotSpacing = 24;
  for (let x = 0; x < width; x += dotSpacing) {
    for (let y = 0; y < height; y += dotSpacing) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const offsetX = padding - bb.minX;
  const offsetY = padding - bb.minY;
  const nodeMap = new Map<string, CanvasNode>(nodes.map(n => [n.id, n]));

  // Draw wires
  edges.forEach(edge => {
    const src = nodeMap.get(edge.from);
    const tgt = nodeMap.get(edge.to);
    if (!src || !tgt) return;

    const sx = src.x + (src.width || 230) + offsetX;
    const sy = src.y + 70 + offsetY;
    const tx = tgt.x + offsetX;
    const ty = tgt.y + 70 + offsetY;

    const dx = Math.abs(tx - sx) * 0.5;
    ctx.strokeStyle = '#57503F';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(sx + Math.max(40, dx), sy, tx - Math.max(40, dx), ty, tx, ty);
    ctx.stroke();

    const arrowSize = 8;
    ctx.fillStyle = '#57503F';
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - arrowSize, ty - arrowSize * 0.6);
    ctx.lineTo(tx - arrowSize, ty + arrowSize * 0.6);
    ctx.closePath();
    ctx.fill();

    if (edge.label) {
      const mx = (sx + tx) / 2;
      const my = (sy + ty) / 2;
      ctx.font = 'bold 10px sans-serif';
      const textMetrics = ctx.measureText(edge.label);
      const bgW = textMetrics.width + 12;
      ctx.fillStyle = '#FFFDF6';
      ctx.strokeStyle = '#1D1A16';
      ctx.lineWidth = 1;
      ctx.fillRect(mx - bgW / 2, my - 9, bgW, 18);
      ctx.strokeRect(mx - bgW / 2, my - 9, bgW, 18);
      ctx.fillStyle = '#1D1A16';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(edge.label, mx, my);
    }
  });

  const COLOR_MAP: Record<string, string> = {
    butter: '#FFE9A8',
    sage: '#DCEBC8',
    coral: '#FFD8C7',
    slate: '#DAE5E6',
    lavender: '#E8DEFF',
    mint: '#C7F3E3',
  };

  nodes.forEach(node => {
    const nx = node.x + offsetX;
    const ny = node.y + offsetY;
    const nw = node.width || 230;
    const nh = 140;

    ctx.fillStyle = 'rgba(29, 26, 22, 0.14)';
    ctx.fillRect(nx + 3, ny + 4, nw, nh);

    ctx.fillStyle = COLOR_MAP[node.color] || '#FFE9A8';
    ctx.fillRect(nx, ny, nw, nh);

    ctx.strokeStyle = '#1D1A16';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(nx, ny, nw, nh);

    const tag = node.author === 'agent' ? 'AGENT' : 'YOU';
    ctx.fillStyle = node.author === 'agent' ? '#E24E1B' : '#1D1A16';
    ctx.fillRect(nx + 10, ny - 8, 44, 14);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag, nx + 32, ny - 1);

    ctx.fillStyle = '#1D1A16';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const titleText = node.title.length > 26 ? node.title.slice(0, 24) + '…' : node.title;
    ctx.fillText(titleText, nx + 12, ny + 16);

    ctx.strokeStyle = 'rgba(29, 26, 22, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(nx + 12, ny + 34);
    ctx.lineTo(nx + nw - 12, ny + 34);
    ctx.stroke();

    ctx.fillStyle = '#403A2F';
    ctx.font = '10px sans-serif';
    const bodyWords = (node.body || '').split('\n');
    let lineY = ny + 42;
    bodyWords.slice(0, 4).forEach(line => {
      const truncated = line.length > 34 ? line.slice(0, 32) + '…' : line;
      ctx.fillText(truncated, nx + 12, lineY);
      lineY += 16;
    });
  });

  ctx.fillStyle = '#6B6353';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('Boardify · WebMCP Spatial Whiteboard', width - 20, height - 16);

  return canvas.toDataURL('image/png');
}

function printCanvasFallback(imageDataUrl: string, title: string): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head><title>${title}</title></head>
      <body style="margin:0;padding:20px;background:#F4EFE4;display:flex;justify-content:center;">
        <img src="${imageDataUrl}" onload="window.print();" style="max-width:100%;border:2px solid #1D1A16;border-radius:12px;" />
      </body>
    </html>
  `);
  printWindow.document.close();
}
