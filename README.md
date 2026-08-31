# Boardify — The Spatial Whiteboard Where Agents Pull Up a Chair

[![WebMCP Standard](https://img.shields.io/badge/WebMCP-v1.0-orange.svg)](https://webmachinelearning.github.io/webmcp/)
[![Open Source License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16%20App%20Router-black.svg)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20Sync-amber.svg)](https://firebase.google.com/)

> **Built for the OpenAI & Google WebMCP Challenge 2026 ($35,000 Prize Pool)**  
> An open standard spatial collaborative whiteboard where humans and AI browser agents co-create on a shared infinite canvas.

---

## 🌟 What is Boardify?

**Boardify** turns the traditional whiteboard into an agent-addressable canvas. Instead of trapping AI in a disconnected sidebar chat or relying on brittle visual screen-scraping, Boardify natively implements the **WebMCP standard** (`document.modelContext.registerTool`).

When opened in **ChatGPT's in-app browser** or **Google Chrome with WebMCP enabled**, Boardify registers **12 first-class structured tools**. AI browser agents can read the canvas state, spawn sticky notes, draw labeled bezier connection wires, highlight areas of focus, rearrange layouts into clusters or timelines, and export structured sprint documentation—all with sub-20ms client execution.

---

## 🛠️ The 12 WebMCP Tools Registered on `document.modelContext`

| Tool Name | Description | Key Parameters |
| :--- | :--- | :--- |
| `get_canvas_state` | Reads full board snapshot (all nodes, coordinates, authors, links). | `{}` |
| `add_idea_node` | Creates a sticky note with collision-free placement and color. | `title`, `body`, `x`, `y`, `color` |
| `update_node` | Updates an existing note's title, body, color, or position. | `node_id`, `title`, `body`, `color`, `x`, `y` |
| `delete_node` | Removes a note and cascade-deletes attached connection wires. | `node_id` |
| `connect_nodes` | Draws a directed bezier curve with relationship label. | `source_id`, `target_id`, `label` |
| `arrange_layout` | Auto-arranges canvas via graph clustering, timeline, kanban, or grid. | `layout: 'clusters' \| 'timeline' \| 'kanban' \| 'grid'` |
| `highlight_node` | Panning focus + pulsing ripple + agent speech bubble callout. | `node_id`, `reason` |
| `export_canvas` | Generates Markdown outline, Mermaid flowchart, or JSON graph. | `format: 'markdown' \| 'mermaid' \| 'json'` |
| `clear_canvas` | Wipes the board with safety confirmation flag. | `confirm: true` |
| `batch_create_nodes`| Atomically creates complex frameworks (SWOT, 4 Ps, Pros/Cons). | `nodes: []`, `links: []` |
| `search_canvas` | Searches note content and highlights matching nodes. | `query` |
| `cluster_by_topic` | Groups notes by semantic tags and visual columns. | `{}` |

---

## 🚀 Quickstart & Local Development

### 1. Clone & Install
```bash
git clone https://github.com/your-username/boardify.git
cd boardify
npm install
```

### 2. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Testing WebMCP

- **Method A (ChatGPT In-App Browser):** Open your deployed URL inside ChatGPT Pro/Plus. ChatGPT will automatically detect the 12 tools on `document.modelContext`.
- **Method B (Google Chrome Desktop):**
  1. Navigate to `chrome://flags/#enable-webmcp-testing` in Chrome.
  2. Set the flag to **Enabled** and relaunch Chrome.
  3. Open Boardify; the status pill will show **WebMCP Live**.
- **Method C (Built-in Agent Studio):** If running in standard Safari/Firefox, Boardify's **Agent Studio** provides local tool simulation using the exact same code paths.

---

## 📂 Project Architecture

```
boardify/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with typography, metadata & agent guide
│   │   ├── page.tsx           # Landing / Marketing Page
│   │   ├── canvas/page.tsx    # Whiteboard Canvas Application
│   │   ├── templates/page.tsx # Strategy, Engineering & Storyboard Templates
│   │   ├── docs/page.tsx      # WebMCP Developer Docs & Schema Explorer
│   │   ├── showcase/page.tsx  # Session Transcripts & Case Studies
│   │   ├── about/page.tsx     # WebMCP Challenge Submission Dossier & Judge Guide
│   │   └── pricing/page.tsx   # Pricing & Collaboration Plans
│   ├── components/
│   │   ├── canvas/            # InfiniteCanvas, StickyNote, SvgWires, Minimap, TopToolbar
│   │   ├── studio/            # AgentStudioDrawer, QuickMissions, ToolActivityLog, ToolRegistry
│   │   └── layout/            # Navbar, Footer, ToastProvider
│   └── lib/
│       ├── webmcp.ts          # 12 WebMCP Tool definitions & document.modelContext bridge
│       ├── layouts.ts         # Graph clustering, timeline & kanban algorithms
│       ├── firestore-boards.ts# Firebase real-time sync & local storage fallback
│       └── templates-data.ts  # Pre-built strategic board templates
└── LICENSE                    # Open Source MIT License
```

---

## 🏆 WebMCP Challenge Submission Dossier

See our full submission write-up at `/about` covering:
1. **Why this is the killer use case for WebMCP**
2. **How it eliminates "blank canvas paralysis"**
3. **What humans and agents can accomplish together**
4. **Implementation details & zero-latency client tool execution**

---

## 📜 License

Open source under the [MIT License](./LICENSE).
