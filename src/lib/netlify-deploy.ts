import JSZip from 'jszip';
import { CanvasNode, CanvasEdge } from './types';
import { getBoundingBox } from './layouts';

/**
 * Generate a standalone, zero-dependency, ultra-fast interactive HTML canvas page
 * that can be hosted directly on Netlify or opened in any browser.
 */
export function generateStandaloneCanvasHtml(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  title = 'Boardify Canvas'
): string {
  const serializedNodes = JSON.stringify(nodes);
  const serializedEdges = JSON.stringify(edges);
  const safeTitle = title.replace(/[<>&"]/g, '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} · Boardify Whiteboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,600&family=Kalam:wght@400;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --paper: #F4EFE4;
      --ink: #1D1A16;
      --panel: #FFFDF6;
      --line: #DCD4C2;
      --acc: #E24E1B;
      --butter: #FFE9A8;
      --sage: #DCEBC8;
      --coral: #FFD8C7;
      --slate: #DAE5E6;
      --lavender: #E8DEFF;
      --mint: #C7F3E3;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--paper);
      color: var(--ink);
      font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      user-select: none;
    }
    #viewport {
      position: absolute;
      inset: 0;
      background-color: var(--paper);
      background-image: radial-gradient(circle, rgba(29, 26, 22, 0.13) 1.2px, transparent 1.3px);
      background-size: 26px 26px;
      cursor: grab;
    }
    #viewport:active { cursor: grabbing; }
    #world {
      position: absolute;
      inset: 0;
      width: 0;
      height: 0;
      transform-origin: 0 0;
    }
    .note-card {
      position: absolute;
      padding: 14px;
      border-radius: 8px;
      border: 1px solid rgba(29,26,22,0.22);
      box-shadow: 3px 4px 0 rgba(29,26,22,0.12);
      transition: box-shadow 0.15s ease, transform 0.05s ease;
      cursor: grab;
      z-index: 10;
    }
    .note-card:hover {
      box-shadow: 4px 6px 0 rgba(29,26,22,0.2);
      z-index: 25;
    }
    .note-title {
      font-family: 'Caveat', cursive;
      font-weight: 700;
      font-size: 24px;
      line-height: 1.15;
      color: var(--ink);
      margin-bottom: 6px;
    }
    .note-body {
      font-family: 'Kalam', cursive;
      font-size: 14px;
      line-height: 1.35;
      color: #403A2F;
      white-space: pre-wrap;
    }
    .sign-banner {
      border: 2.5px solid var(--ink);
      box-shadow: 4px 4px 0 var(--ink);
      border-radius: 12px;
      padding: 16px;
    }
    .heading-banner {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      padding: 8px 0;
    }
    .heading-title {
      font-family: 'Fraunces', serif;
      font-style: italic;
      font-weight: 900;
      font-size: 36px;
      color: var(--ink);
      text-shadow: 1px 1px 0 rgba(255,255,255,0.8);
    }
    .tag-chip {
      position: absolute;
      top: -10px;
      left: 12px;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 4px;
      color: white;
      box-shadow: 0 1px 2px rgba(0,0,0,0.15);
    }
    .tape {
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%) rotate(-2deg);
      width: 50px;
      height: 15px;
      background: rgba(255,252,240,0.8);
      border: 1px solid rgba(29,26,22,0.1);
    }
    .task-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 12px;
      cursor: pointer;
    }
    .task-item input { cursor: pointer; accent-color: var(--acc); }
    .task-done { text-decoration: line-through; opacity: 0.6; }
    /* Wires SVG */
    #wires-svg {
      position: absolute;
      top: -10000px;
      left: -10000px;
      width: 20000px;
      height: 20000px;
      pointer-events: none;
      overflow: visible;
    }
    /* Controls Header */
    .top-header {
      position: fixed;
      top: 14px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--panel);
      border: 1.5px solid var(--ink);
      border-radius: 16px;
      padding: 6px 14px;
      box-shadow: 4px 4px 0 rgba(29,26,22,0.15);
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 700;
      color: var(--ink);
      cursor: pointer;
      transition: all 0.1s;
    }
    .btn:hover { background: #EAE2D2; border-color: var(--ink); }
    .btn-primary { background: var(--acc); color: white; border-color: var(--ink); }
    .btn-primary:hover { background: #B33A10; }
    .netlify-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #00C7B7;
      color: #0E1E25;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 8px;
      text-decoration: none;
    }
    /* Minimap */
    #minimap {
      position: fixed;
      bottom: 18px;
      right: 18px;
      width: 160px;
      height: 100px;
      background: var(--panel);
      border: 1.5px solid var(--ink);
      border-radius: 10px;
      box-shadow: 3px 3px 0 rgba(29,26,22,0.12);
      z-index: 100;
      overflow: hidden;
    }
  </style>
</head>
<body>

  <div class="top-header">
    <span style="font-family:'Fraunces',serif;font-style:italic;font-weight:800;font-size:15px;color:var(--ink);">${safeTitle}</span>
    <span style="width:1px;height:16px;background:var(--line);"></span>
    <a href="https://www.netlify.com" target="_blank" class="netlify-badge" title="Hosted on Netlify Edge">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.48 4.35 1.5 9.33a.75.75 0 0 0 0 1.06l4.98 4.98 4.98-4.98-4.98-5.04zm11.04 0-4.98 4.98 4.98 4.98 4.98-4.98a.75.75 0 0 0 0-1.06l-4.98-4.92zM12 9.87l-4.98 4.98 4.98 4.98 4.98-4.98L12 9.87zM6.48 15.39l-4.98 4.98a.75.75 0 0 0 .53 1.28h9.96l-5.51-6.26zm11.04 0-5.51 6.26h9.96a.75.75 0 0 0 .53-1.28l-4.98-4.98z"/></svg>
      <span>Netlify Ready</span>
    </a>
    <button class="btn" onclick="fitView()">Fit View</button>
    <button class="btn" onclick="resetZoom()">100%</button>
  </div>

  <div id="viewport">
    <div id="world">
      <svg id="wires-svg"></svg>
      <div id="nodes-container"></div>
    </div>
  </div>

  <canvas id="minimap"></canvas>

  <script>
    const INITIAL_NODES = ${serializedNodes};
    const INITIAL_EDGES = ${serializedEdges};

    let nodes = INITIAL_NODES;
    let edges = INITIAL_EDGES;
    let camera = { x: 0, y: 0, z: 1 };
    let isPanning = false;
    let panStart = { x: 0, y: 0, camX: 0, camY: 0 };

    const viewport = document.getElementById('viewport');
    const world = document.getElementById('world');
    const wiresSvg = document.getElementById('wires-svg');
    const nodesContainer = document.getElementById('nodes-container');
    const minimap = document.getElementById('minimap');
    const mmCtx = minimap.getContext('2d');

    const COLOR_MAP = {
      butter: '#FFE9A8',
      sage: '#DCEBC8',
      coral: '#FFD8C7',
      slate: '#DAE5E6',
      lavender: '#E8DEFF',
      mint: '#C7F3E3',
    };

    function applyCamera() {
      world.style.transform = 'translate(' + camera.x + 'px, ' + camera.y + 'px) scale(' + camera.z + ')';
      viewport.style.backgroundPosition = camera.x + 'px ' + camera.y + 'px';
      viewport.style.backgroundSize = (26 * camera.z) + 'px ' + (26 * camera.z) + 'px';
      drawMinimap();
    }

    function renderWires() {
      const nodeMap = new Map(nodes.map(n => [n.id, n]));
      let svgHtml = '<defs><marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 1 L 10 5 L 0 9 z" fill="#57503F"/></marker></defs>';

      edges.forEach(e => {
        const src = nodeMap.get(e.from);
        const tgt = nodeMap.get(e.to);
        if (!src || !tgt) return;

        const sx = src.x + (src.width || 230) + 10000;
        const sy = src.y + 70 + 10000;
        const tx = tgt.x + 10000;
        const ty = tgt.y + 70 + 10000;
        const dx = Math.abs(tx - sx) * 0.5;

        const d = 'M ' + sx + ' ' + sy + ' C ' + (sx + Math.max(40, dx)) + ' ' + sy + ', ' + (tx - Math.max(40, dx)) + ' ' + ty + ', ' + tx + ' ' + ty;
        svgHtml += '<path d="' + d + '" stroke="#57503F" stroke-width="2.2" fill="none" marker-end="url(#arrow)" />';

        if (e.label) {
          const mx = (sx + tx) / 2;
          const my = (sy + ty) / 2;
          svgHtml += '<rect x="' + (mx - 40) + '" y="' + (my - 10) + '" width="80" height="20" rx="6" fill="#FFFDF6" stroke="#1D1A16" stroke-width="1"/>';
          svgHtml += '<text x="' + mx + '" y="' + (my + 4) + '" fill="#1D1A16" font-size="10" font-weight="bold" text-anchor="middle" font-family="Space Grotesk">' + e.label + '</text>';
        }
      });

      wiresSvg.innerHTML = svgHtml;
    }

    function renderNodes() {
      nodesContainer.innerHTML = '';
      nodes.forEach(n => {
        const el = document.createElement('div');
        el.className = 'note-card';
        el.style.left = n.x + 'px';
        el.style.top = n.y + 'px';
        el.style.width = (n.width || 230) + 'px';
        el.style.backgroundColor = COLOR_MAP[n.color] || COLOR_MAP.butter;
        el.style.transform = 'rotate(' + (n.rot || 0) + 'deg)';

        if (n.nodeType === 'heading') {
          el.className = 'note-card heading-banner';
          el.innerHTML = '<h2 class="heading-title">' + (n.title || '') + '</h2>' + (n.body ? '<p style="font-size:13px;color:#6B6353;margin-top:4px;">' + n.body + '</p>' : '');
        } else if (n.nodeType === 'sign' || n.signType) {
          el.className = 'note-card sign-banner';
          el.innerHTML = '<div class="tag-chip" style="background:#E24E1B;">SIGN</div><h3 class="note-title">' + (n.title || '') + '</h3><p class="note-body">' + (n.body || '') + '</p>';
        } else if (n.nodeType === 'logo' || n.logoType) {
          el.style.background = 'transparent';
          el.style.border = 'none';
          el.style.boxShadow = 'none';
          el.style.width = '110px';
          el.style.display = 'flex';
          el.style.flexDirection = 'column';
          el.style.alignItems = 'center';
          const fileRaw = (n.logoType || '').replace(/^gil-/, '');
          const svgUrl = 'https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/' + fileRaw + (fileRaw.endsWith('.svg') ? '' : '.svg');
          el.innerHTML = '<div style="width:58px;height:58px;border-radius:16px;background:#FFFDF6;border:2px solid #1D1A16;box-shadow:3px 3px 0 #1D1A16;display:flex;align-items:center;justify-content:center;padding:8px;"><img src="' + svgUrl + '" style="width:36px;height:36px;object-fit:contain;" onerror="this.style.display=\'none\';this.parentNode.innerHTML=\'⚡\';" /></div><span style="font-family:Space Grotesk,sans-serif;font-weight:700;font-size:11px;color:#1D1A16;margin-top:6px;text-align:center;word-break:break-word;">' + (n.title || n.logoType || '') + '</span>';
        } else {
          el.innerHTML = '<div class="tag-chip" style="background:' + (n.author === 'agent' ? '#E24E1B' : '#1D1A16') + ';">' + (n.author === 'agent' ? 'AGENT' : 'YOU') + '</div><div class="tape"></div><h3 class="note-title">' + (n.title || '') + '</h3><p class="note-body">' + (n.body || '') + '</p>';
        }

        // Add task list if present
        if (n.tasks && n.tasks.length > 0) {
          const taskDiv = document.createElement('div');
          taskDiv.style.marginTop = '8px';
          taskDiv.style.borderTop = '1px solid rgba(29,26,22,0.15)';
          taskDiv.style.paddingTop = '6px';
          n.tasks.forEach((t, i) => {
            const row = document.createElement('label');
            row.className = 'task-item ' + (t.done ? 'task-done' : '');
            row.innerHTML = '<input type="checkbox" ' + (t.done ? 'checked' : '') + ' /><span>' + t.text + '</span>';
            row.querySelector('input').addEventListener('change', (e) => {
              t.done = e.target.checked;
              row.className = 'task-item ' + (t.done ? 'task-done' : '');
            });
            taskDiv.appendChild(row);
          });
          el.appendChild(taskDiv);
        }

        // Dragging support
        let isDragging = false;
        let startPos = { x: 0, y: 0, nodeX: 0, nodeY: 0 };
        el.addEventListener('pointerdown', e => {
          if (e.target.tagName === 'INPUT') return;
          e.stopPropagation();
          isDragging = true;
          startPos = { x: e.clientX, y: e.clientY, nodeX: n.x, nodeY: n.y };
          el.setPointerCapture(e.pointerId);
        });
        el.addEventListener('pointermove', e => {
          if (!isDragging) return;
          const dx = (e.clientX - startPos.x) / camera.z;
          const dy = (e.clientY - startPos.y) / camera.z;
          n.x = Math.round(startPos.nodeX + dx);
          n.y = Math.round(startPos.nodeY + dy);
          el.style.left = n.x + 'px';
          el.style.top = n.y + 'px';
          renderWires();
          drawMinimap();
        });
        el.addEventListener('pointerup', e => {
          isDragging = false;
          try { el.releasePointerCapture(e.pointerId); } catch(err){}
        });

        nodesContainer.appendChild(el);
      });
    }

    function drawMinimap() {
      minimap.width = minimap.clientWidth * 2;
      minimap.height = minimap.clientHeight * 2;
      mmCtx.scale(2, 2);
      mmCtx.clearRect(0, 0, minimap.clientWidth, minimap.clientHeight);

      if (!nodes.length) return;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      nodes.forEach(n => {
        minX = Math.min(minX, n.x);
        maxX = Math.max(maxX, n.x + (n.width || 230));
        minY = Math.min(minY, n.y);
        maxY = Math.max(maxY, n.y + 140);
      });

      const pad = 80;
      const bW = Math.max(400, maxX - minX + pad * 2);
      const bH = Math.max(300, maxY - minY + pad * 2);
      const sX = minimap.clientWidth / bW;
      const sY = minimap.clientHeight / bH;
      const scale = Math.min(sX, sY);

      nodes.forEach(n => {
        const mx = (n.x - minX + pad) * scale;
        const my = (n.y - minY + pad) * scale;
        const mw = (n.width || 230) * scale;
        const mh = 140 * scale;
        mmCtx.fillStyle = COLOR_MAP[n.color] || '#FFE9A8';
        mmCtx.fillRect(mx, my, mw, mh);
        mmCtx.strokeStyle = '#1D1A16';
        mmCtx.strokeRect(mx, my, mw, mh);
      });
    }

    function fitView() {
      if (!nodes.length) return;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      nodes.forEach(n => {
        minX = Math.min(minX, n.x);
        maxX = Math.max(maxX, n.x + (n.width || 230));
        minY = Math.min(minY, n.y);
        maxY = Math.max(maxY, n.y + 140);
      });

      const pad = 100;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const bw = maxX - minX;
      const bh = maxY - minY;

      const sX = (w - pad * 2) / (bw || 400);
      const sY = (h - pad * 2) / (bh || 400);
      const tz = Math.min(1.3, Math.max(0.35, Math.min(sX, sY)));

      const cX = (minX + maxX) / 2;
      const cY = (minY + maxY) / 2;

      camera = {
        x: w / 2 - cX * tz,
        y: h / 2 - cY * tz,
        z: tz,
      };
      applyCamera();
    }

    function resetZoom() {
      camera.z = 1;
      applyCamera();
    }

    // Panning & Zooming
    viewport.addEventListener('pointerdown', e => {
      if (e.target.closest('.note-card') || e.target.closest('.top-header')) return;
      isPanning = true;
      panStart = { x: e.clientX, y: e.clientY, camX: camera.x, camY: camera.y };
    });

    window.addEventListener('pointermove', e => {
      if (!isPanning) return;
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      camera.x = panStart.camX + dx;
      camera.y = panStart.camY + dy;
      applyCamera();
    });

    window.addEventListener('pointerup', () => { isPanning = false; });

    viewport.addEventListener('wheel', e => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0012);
      const newZ = Math.max(0.2, Math.min(2.5, camera.z * factor));
      const mx = e.clientX;
      const my = e.clientY;
      camera.x = mx - (mx - camera.x) * (newZ / camera.z);
      camera.y = my - (my - camera.y) * (newZ / camera.z);
      camera.z = newZ;
      applyCamera();
    });

    // Init
    renderNodes();
    renderWires();
    fitView();
  </script>
</body>
</html>`;
}

/**
 * Generate a Netlify configuration file (netlify.toml)
 */
export function generateNetlifyToml(): string {
  return `[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "ALLOWALL"
    Access-Control-Allow-Origin = "*"
    Cache-Control = "public, max-age=3600"
`;
}

/**
 * Generate a deploy instructions README
 */
export function generateNetlifyReadme(title: string): string {
  return `# ${title} — Netlify Deployment Package

This package is a standalone, ultra-fast interactive spatial whiteboard created with **Boardify**.

## 🚀 How to Deploy on Netlify (10 Seconds)

1. Open **[Netlify Drop](https://app.netlify.com/drop)** in your browser.
2. Drag and drop this extracted folder (or the \`boardify-netlify-site.zip\` file) onto the upload box.
3. Done! Netlify will immediately give you a live production URL (e.g., \`https://boardify-whiteboard-abc123.netlify.app\`).

## 📁 Package Contents
- \`index.html\` — Full standalone interactive canvas application with pan, zoom, nodes, wires, and minimap.
- \`netlify.toml\` — Production Netlify configuration with security and iframe headers.
- \`README.md\` — Deployment documentation.

---
Built with **Boardify** · Spatial Whiteboards for Humans & AI Browser Agents.
`;
}

/**
 * Pack canvas into a complete Netlify Drop ready ZIP archive
 */
export async function generateNetlifyDropZip(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  title = 'Boardify Canvas'
): Promise<Blob> {
  const zip = new JSZip();

  const htmlContent = generateStandaloneCanvasHtml(nodes, edges, title);
  const tomlContent = generateNetlifyToml();
  const readmeContent = generateNetlifyReadme(title);

  zip.file('index.html', htmlContent);
  zip.file('netlify.toml', tomlContent);
  zip.file('README.md', readmeContent);

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Direct Netlify API deployment helper
 */
export async function deployToNetlifyApi(
  zipBlob: Blob,
  siteName?: string,
  netlifyToken?: string
): Promise<{ success: boolean; siteUrl?: string; adminUrl?: string; error?: string }> {
  if (!netlifyToken) {
    return { success: false, error: 'Netlify Personal Access Token is required for API deployment.' };
  }

  try {
    const cleanSiteName = siteName
      ? siteName.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 32)
      : `boardify-${Date.now().toString(36)}`;

    // 1. Create or query site
    const createRes = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${netlifyToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: cleanSiteName,
      }),
    });

    if (!createRes.ok) {
      const errJson = await createRes.json().catch(() => ({}));
      return { success: false, error: errJson.message || `Netlify API error (${createRes.status})` };
    }

    const siteData = await createRes.json();
    const siteId = siteData.id;

    // 2. Deploy zip blob to the site
    const deployRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${netlifyToken}`,
        'Content-Type': 'application/zip',
      },
      body: zipBlob,
    });

    if (!deployRes.ok) {
      const deployErr = await deployRes.json().catch(() => ({}));
      return { success: false, error: deployErr.message || `Failed to upload deploy zip (${deployRes.status})` };
    }

    const deployData = await deployRes.json();
    const siteUrl = deployData.ssl_url || deployData.url || siteData.ssl_url || siteData.url;

    return {
      success: true,
      siteUrl,
      adminUrl: siteData.admin_url,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error communicating with Netlify API' };
  }
}

/**
 * Encode board into a shareable URL hash payload
 */
export function encodeCanvasShareState(nodes: CanvasNode[], edges: CanvasEdge[], title = 'Shared Canvas'): string {
  try {
    const payload = JSON.stringify({
      t: title,
      v: 1,
      n: nodes.map(n => ({
        id: n.id,
        t: n.title,
        b: n.body,
        x: Math.round(n.x),
        y: Math.round(n.y),
        w: n.width,
        c: n.color,
        a: n.author,
        nt: n.nodeType,
        st: n.signType,
        lt: n.logoType,
        sm: n.stamp,
        ts: n.tasks,
      })),
      e: edges.map(e => ({
        id: e.id,
        f: e.from,
        t: e.to,
        l: e.label,
      })),
    });

    // Base64 encode UTF-8
    const base64 = btoa(encodeURIComponent(payload));
    return base64;
  } catch (err) {
    console.warn('Failed to encode share state:', err);
    return '';
  }
}

/**
 * Decode canvas share state from URL hash
 */
export function decodeCanvasShareState(hash: string): { nodes: CanvasNode[]; edges: CanvasEdge[]; title?: string } | null {
  try {
    const raw = hash.startsWith('#share=') ? hash.replace('#share=', '') : hash.replace('#', '');
    if (!raw) return null;

    const jsonStr = decodeURIComponent(atob(raw));
    const data = JSON.parse(jsonStr);

    const nodes: CanvasNode[] = (data.n || []).map((item: any) => ({
      id: item.id || `n_${Math.random().toString(36).slice(2, 7)}`,
      title: item.t || 'Untitled',
      body: item.b || '',
      x: item.x || 0,
      y: item.y || 0,
      width: item.w || 230,
      color: item.c || 'butter',
      author: item.a || 'human',
      created: Date.now(),
      nodeType: item.nt || 'default',
      signType: item.st,
      logoType: item.lt,
      stamp: item.sm,
      tasks: item.ts,
    }));

    const edges: CanvasEdge[] = (data.e || []).map((item: any) => ({
      id: item.id || `e_${Math.random().toString(36).slice(2, 7)}`,
      from: item.f,
      to: item.t,
      label: item.l,
    }));

    return { nodes, edges, title: data.t };
  } catch (err) {
    console.warn('Failed to decode share state:', err);
    return null;
  }
}
