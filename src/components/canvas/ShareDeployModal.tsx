'use client';

import React, { useState, useEffect } from 'react';
import { CanvasNode, CanvasEdge } from '@/lib/types';
import {
  generateNetlifyDropZip,
  generateStandaloneCanvasHtml,
  deployToNetlifyApi,
  encodeCanvasShareState,
} from '@/lib/netlify-deploy';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Globe,
  Sparkles,
  Code2,
  QrCode,
  ShieldCheck,
  Zap,
  ArrowRight,
  FolderArchive,
  KeyRound,
} from 'lucide-react';
import { NetlifyIcon } from '@/components/ui/BrandIcons';
import { useToast } from '@/components/ui/ToastProvider';

interface ShareDeployModalProps {
  isOpen: boolean;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  boardTitle?: string;
  boardId?: string;
  onClose: () => void;
}

export function ShareDeployModal({
  isOpen,
  nodes,
  edges,
  boardTitle = 'Welcome Canvas',
  boardId = 'default',
  onClose,
}: ShareDeployModalProps) {
  const [activeTab, setActiveTab] = useState<'netlify' | 'link' | 'embed' | 'html'>('netlify');
  const [copied, setCopied] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [isDeployingApi, setIsDeployingApi] = useState(false);
  const [netlifyToken, setNetlifyToken] = useState('');
  const [siteNameInput, setSiteNameInput] = useState('');
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    // Generate Share URL with state hash
    const hash = encodeCanvasShareState(nodes, edges, boardTitle);
    const origin = window.location.origin;
    const path = window.location.pathname;
    const fullShareUrl = `${origin}${path}#share=${hash}`;
    setShareUrl(fullShareUrl);

    // Generate responsive iframe embed
    const iframeSnippet = `<iframe \n  src="${fullShareUrl}" \n  width="100%" \n  height="650px" \n  style="border: 2px solid #1D1A16; border-radius: 12px; box-shadow: 4px 4px 0 #1D1A16;" \n  title="${boardTitle} — Boardify Canvas"\n  allow="clipboard-write"\n></iframe>`;
    setEmbedCode(iframeSnippet);

    if (!siteNameInput) {
      setSiteNameInput(`boardify-${boardTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 18) || 'canvas'}`);
    }
  }, [isOpen, nodes, edges, boardTitle]);

  if (!isOpen) return null;

  const handleCopy = (text: string, label = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast(label, 'ok');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadNetlifyZip = async () => {
    setIsGeneratingZip(true);
    try {
      const blob = await generateNetlifyDropZip(nodes, edges, boardTitle);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boardify-netlify-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Downloaded Netlify Drop ZIP Package! Ready to drop on app.netlify.com/drop', 'ok');
    } catch (err) {
      showToast('Failed to package ZIP archive', 'warn');
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const handleDownloadStandaloneHtml = () => {
    try {
      const html = generateStandaloneCanvasHtml(nodes, edges, boardTitle);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boardify-${boardTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'canvas'}.html`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Downloaded Standalone HTML Web App!', 'ok');
    } catch (err) {
      showToast('Failed to export HTML', 'warn');
    }
  };

  const handleDeployWithApi = async () => {
    if (!netlifyToken.trim()) {
      showToast('Please enter your Netlify Personal Access Token', 'warn');
      return;
    }

    setIsDeployingApi(true);
    try {
      const zipBlob = await generateNetlifyDropZip(nodes, edges, boardTitle);
      const res = await deployToNetlifyApi(zipBlob, siteNameInput, netlifyToken.trim());

      if (res.success && res.siteUrl) {
        setDeployedUrl(res.siteUrl);
        showToast('Successfully deployed to Netlify Edge!', 'ok');
      } else {
        showToast(res.error || 'Deployment failed', 'warn');
      }
    } catch (err: any) {
      showToast('Deployment error: ' + err.message, 'warn');
    } finally {
      setIsDeployingApi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1A16]/50 backdrop-blur-xs animate-note-pop select-none">
      <div className="bg-[#FFFDF6] border-2 border-[#1D1A16] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[6px_6px_0_#1D1A16] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCD4C2] bg-[#F4EFE4]/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00C7B7]/15 border border-[#00C7B7]/30 text-[#00C7B7]">
              <NetlifyIcon size={20} />
            </div>
            <div>
              <h2 className="font-['Fraunces'] italic font-bold text-xl text-[#1D1A16]">
                Share & Deploy Canvas
              </h2>
              <p className="text-xs text-[#6B6353]">
                Deploy to Netlify Edge in seconds, or share interactive links with your team.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#1D1A16] bg-[#FFFDF6] hover:bg-[#F4EFE4] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-6 pt-4 overflow-x-auto border-b border-[#DCD4C2] pb-3 bg-[#FFFDF6]">
          {[
            { id: 'netlify', label: 'Deploy on Netlify', icon: NetlifyIcon, color: 'text-[#00C7B7]' },
            { id: 'link', label: 'Live Share Link', icon: Share2, color: 'text-[#E24E1B]' },
            { id: 'embed', label: 'Embed Widget', icon: Code2, color: 'text-indigo-600' },
            { id: 'html', label: 'Standalone HTML', icon: Globe, color: 'text-emerald-700' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1D1A16] text-[#F4EFE4] shadow-[2px_2px_0_#6B6353]'
                    : 'bg-[#F4EFE4] text-[#1D1A16] border border-[#DCD4C2] hover:bg-[#EAE2D2]'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : tab.color} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4 max-h-[60vh]">
          {/* TAB 1: NETLIFY DEPLOYMENT */}
          {activeTab === 'netlify' && (
            <div className="space-y-4">
              {/* Method A: Netlify Drop (1-Click Zip Drag & Drop) */}
              <div className="p-4 rounded-xl border-2 border-[#00C7B7]/40 bg-[#00C7B7]/5 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#00C7B7] text-[#0E1E25]">
                        RECOMMENDED · FASTEST
                      </span>
                      <h3 className="font-bold text-sm text-[#1D1A16]">Method 1: Netlify Drop (No Account Needed)</h3>
                    </div>
                    <p className="text-xs text-[#6B6353] mt-1 leading-relaxed">
                      Download the pre-configured package (.ZIP containing interactive canvas + netlify.toml) and drop it directly onto Netlify Drop for instant live hosting.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleDownloadNetlifyZip}
                    disabled={isGeneratingZip}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00C7B7] text-[#0E1E25] font-bold text-xs shadow-[2px_2px_0_#1D1A16] border border-[#1D1A16] hover:bg-[#00b0a2] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                  >
                    <FolderArchive className="w-4 h-4" />
                    <span>{isGeneratingZip ? 'Packaging ZIP...' : '1. Download Netlify ZIP'}</span>
                  </button>

                  <a
                    href="https://app.netlify.com/drop"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D1A16] text-white font-bold text-xs shadow-[2px_2px_0_#6B6353] border border-[#1D1A16] hover:bg-[#332e27] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer text-center"
                  >
                    <span>2. Open Netlify Drop</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-2.5 rounded-lg bg-[#FFFDF6] border border-[#DCD4C2] text-[11px] text-[#6B6353] flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-[#00C7B7] shrink-0" />
                  <span>Your deployed canvas will support full pan, zoom, notes, tech logos, signs, and bezier links with 0 latency.</span>
                </div>
              </div>

              {/* Method B: Netlify Direct API Token */}
              <div className="p-4 rounded-xl border border-[#DCD4C2] bg-[#F4EFE4]/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-[#1D1A16] flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#E24E1B]" />
                    <span>Method 2: Direct Netlify API Deploy (Automated)</span>
                  </h3>
                  <a
                    href="https://app.netlify.com/user/applications#personal-access-tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#E24E1B] font-bold hover:underline flex items-center gap-0.5"
                  >
                    <span>Get Netlify Token</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B6353] uppercase mb-1">
                      Site Subdomain
                    </label>
                    <input
                      type="text"
                      value={siteNameInput}
                      onChange={e => setSiteNameInput(e.target.value)}
                      placeholder="my-boardify-canvas"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFDF6] border border-[#DCD4C2] text-xs font-mono text-[#1D1A16] outline-none focus:border-[#00C7B7]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#6B6353] uppercase mb-1">
                      Personal Access Token
                    </label>
                    <input
                      type="password"
                      value={netlifyToken}
                      onChange={e => setNetlifyToken(e.target.value)}
                      placeholder="nfp_..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFDF6] border border-[#DCD4C2] text-xs font-mono text-[#1D1A16] outline-none focus:border-[#00C7B7]"
                    />
                  </div>
                </div>

                <button
                  onClick={handleDeployWithApi}
                  disabled={isDeployingApi}
                  className="w-full py-2 rounded-xl bg-[#1D1A16] text-white text-xs font-bold shadow-[2px_2px_0_#6B6353] hover:bg-[#00C7B7] hover:text-[#0E1E25] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isDeployingApi ? 'Deploying to Netlify Edge...' : 'Deploy Directly to Netlify'}</span>
                </button>

                {deployedUrl && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-500 text-emerald-900 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">Live Site Ready!</span>
                      <p className="text-xs font-mono font-bold truncate max-w-[280px]">{deployedUrl}</p>
                    </div>
                    <a
                      href={deployedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-lg bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 hover:bg-emerald-800"
                    >
                      <span>Open Live</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE SHARE LINK */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#DCD4C2] bg-[#F4EFE4]/50 space-y-3">
                <h3 className="font-bold text-xs text-[#1D1A16] flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-[#E24E1B]" />
                  <span>Instant Public Share Link</span>
                </h3>
                <p className="text-xs text-[#6B6353] leading-relaxed">
                  Anyone with this link can open the complete canvas with all notes, tech logos, and wires in their browser.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#FFFDF6] border border-[#DCD4C2] text-xs font-mono text-[#1D1A16] truncate select-all"
                  />
                  <button
                    onClick={() => handleCopy(shareUrl, 'Copied Share Link!')}
                    className="px-3.5 py-2 rounded-lg bg-[#1D1A16] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#E24E1B] transition-colors cursor-pointer shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FFE9A8]/40 border border-[#1D1A16]/20 text-xs text-[#403A2F] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>The complete state is compressed directly in the URL hash, so it works reliably even without database credentials.</span>
              </div>
            </div>
          )}

          {/* TAB 3: EMBED WIDGET */}
          {activeTab === 'embed' && (
            <div className="space-y-3">
              <p className="text-xs text-[#6B6353]">
                Paste this code into any HTML documentation, Notion embed, blog post, or company wiki to display a live interactive whiteboard:
              </p>

              <div className="relative bg-[#1D1A16] text-[#F4EFE4] rounded-xl p-3.5 font-mono text-xs overflow-auto max-h-40 border border-[#1D1A16]">
                <pre className="whitespace-pre-wrap">{embedCode}</pre>
              </div>

              <button
                onClick={() => handleCopy(embedCode, 'Copied HTML Embed Code!')}
                className="w-full py-2.5 rounded-xl bg-[#1D1A16] text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#E24E1B] transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Embed Code!' : 'Copy Embed Snippet'}</span>
              </button>
            </div>
          )}

          {/* TAB 4: STANDALONE HTML */}
          {activeTab === 'html' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#DCD4C2] bg-[#F4EFE4]/50 space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-bold text-sm text-[#1D1A16]">Single-File Self-Contained Web App</h3>
                </div>
                <p className="text-xs text-[#6B6353] leading-relaxed">
                  Export a single zero-dependency <code className="font-mono text-[#E24E1B]">index.html</code> containing all canvas logic, nodes, signs, tech logos, wires, and styling. You can double click it to open locally or host on any static provider (S3, GitHub Pages, Vercel, Netlify).
                </p>

                <button
                  onClick={handleDownloadStandaloneHtml}
                  className="w-full py-2.5 rounded-xl bg-[#1D1A16] text-white text-xs font-bold shadow-[2px_2px_0_#6B6353] hover:bg-[#E24E1B] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Standalone HTML Web App</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#DCD4C2] bg-[#F4EFE4]/40 text-xs text-[#6B6353]">
          <span className="font-mono">
            {nodes.length} canvas items · {edges.length} connections
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-[#1D1A16] bg-[#FFFDF6] text-[#1D1A16] font-bold hover:bg-[#F4EFE4] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
