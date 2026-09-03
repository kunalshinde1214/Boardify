import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('Autonomous WebMCP End-to-End Execution & Recording', async ({ page }) => {
  test.setTimeout(90000);

  const recordingsDir = path.join(process.cwd(), 'public', 'demo-recordings');
  if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir, { recursive: true });
  }

  console.log('🚀 [WebMCP Agent] Navigating to Boardify canvas...');
  await page.goto('/canvas');
  await page.waitForLoadState('networkidle');

  // Ensure canvas is ready and WebMCP context is registered
  console.log('⏳ [WebMCP Agent] Waiting for document.modelContext registration...');
  await page.waitForFunction(() => {
    return (
      typeof (window as any).document?.modelContext?.listTools === 'function' &&
      typeof (window as any).document?.modelContext?.executeTool === 'function'
    );
  }, { timeout: 15000 });

  // 1. Tool Discovery Phase
  console.log('🔍 [WebMCP Agent] Discovering available tools via document.modelContext.listTools()...');
  const tools = await page.evaluate(async () => {
    return await (window as any).document.modelContext.listTools();
  });
  console.log(`✅ [WebMCP Agent] Successfully discovered ${tools.length} structured tools!`);
  expect(tools.length).toBeGreaterThanOrEqual(12);
  fs.writeFileSync(
    path.join(recordingsDir, 'tools-registry.json'),
    JSON.stringify(tools, null, 2)
  );
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(recordingsDir, '01-pristine-canvas.png') });

  // 2. Add Idea Sticky Note
  console.log('📝 [WebMCP Agent] Calling tool: add_idea_node...');
  await page.evaluate(async () => {
    await (window as any).document.modelContext.executeTool('add_idea_node', {
      title: 'Core Engine: WebMCP Protocol',
      body: 'Deterministic tool execution for browser AI agents with sub-20ms latency.',
      color: 'butter',
      x: 350,
      y: 220,
    });
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(recordingsDir, '02-idea-node-added.png') });

  // 3. Add Tech Logo Nodes
  console.log('⚡ [WebMCP Agent] Calling tool: add_tech_logo (Next.js & Kafka)...');
  await page.evaluate(async () => {
    await (window as any).document.modelContext.executeTool('add_tech_logo', {
      logo_id: 'nextjs',
      title: 'Next.js 16 WebMCP Host',
      body: 'React 19 App Router with dynamic SVG wire routing.',
      x: 100,
      y: 380,
    });
    await (window as any).document.modelContext.executeTool('add_tech_logo', {
      logo_id: 'kafka',
      title: 'Apache Kafka Event Bus',
      body: 'High-throughput real-time message stream.',
      x: 650,
      y: 380,
    });
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(recordingsDir, '03-tech-logos-added.png') });

  // 3.5 Add Shape Decision Node
  console.log('🔶 [WebMCP Agent] Calling tool: add_shape_node (Diamond Decision Gate)...');
  await page.evaluate(async () => {
    await (window as any).document.modelContext.executeTool('add_shape_node', {
      shape_type: 'diamond',
      title: 'Payload Valid?',
      body: 'Deterministic validation rule gate before state mutation.',
      color: 'coral',
      x: 375,
      y: 450,
    });
  });
  await page.waitForTimeout(1200);

  // 4. Add Relational SQL Tables
  console.log('🗄️ [WebMCP Agent] Calling tool: add_entity_table (workspaces & canvas_nodes)...');
  await page.evaluate(async () => {
    await (window as any).document.modelContext.executeTool('add_entity_table', {
      table_name: 'workspaces',
      fields: [
        { name: 'id', type: 'UUID', isPrimaryKey: true },
        { name: 'slug', type: 'VARCHAR(64)' },
        { name: 'created_at', type: 'TIMESTAMP' },
      ],
      x: 120,
      y: 650,
    });
    await (window as any).document.modelContext.executeTool('add_entity_table', {
      table_name: 'canvas_nodes',
      fields: [
        { name: 'id', type: 'UUID', isPrimaryKey: true },
        { name: 'workspace_id', type: 'UUID', isForeignKey: true, foreignTable: 'workspaces' },
        { name: 'state', type: 'JSONB' },
      ],
      x: 620,
      y: 650,
    });
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(recordingsDir, '04-sql-er-tables-added.png') });

  // 5. Connect Nodes with Directed Bezier Wires
  console.log('🔗 [WebMCP Agent] Calling tool: connect_nodes...');
  await page.evaluate(async () => {
    const state = await (window as any).document.modelContext.executeTool('get_canvas_state');
    const nodes = state.nodes || [];

    const nextNode = nodes.find((n: any) => n.title?.toLowerCase().includes('next.js'));
    const coreNode = nodes.find((n: any) => n.title?.toLowerCase().includes('webmcp'));
    const kafkaNode = nodes.find((n: any) => n.title?.toLowerCase().includes('kafka'));
    const wsTable = nodes.find((n: any) => n.tableName === 'workspaces' || n.title === 'workspaces');
    const nodesTable = nodes.find((n: any) => n.tableName === 'canvas_nodes' || n.title === 'canvas_nodes');

    if (nextNode && coreNode) {
      await (window as any).document.modelContext.executeTool('connect_nodes', {
        source_id: nextNode.id,
        target_id: coreNode.id,
        label: 'hosts protocol',
      });
    }
    if (coreNode && kafkaNode) {
      await (window as any).document.modelContext.executeTool('connect_nodes', {
        source_id: coreNode.id,
        target_id: kafkaNode.id,
        label: 'streams mutations',
      });
    }
    if (wsTable && nodesTable) {
      await (window as any).document.modelContext.executeTool('connect_nodes', {
        source_id: wsTable.id,
        target_id: nodesTable.id,
        label: '1:N relational wire',
      });
    }
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(recordingsDir, '05-bezier-wires-connected.png') });

  // 6. Open and Show AI Agent Studio Drawer
  console.log('🤖 [WebMCP Agent] Inspecting Agent Studio Drawer...');
  const studioBtn = page.locator('button:has-text("AI Agent Studio")').first();
  if (await studioBtn.isVisible()) {
    await studioBtn.click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(recordingsDir, '06-agent-studio-drawer.png') });

    const schemasTab = page.locator('button:has-text("Schemas")').first();
    if (await schemasTab.isVisible()) {
      await schemasTab.click();
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(recordingsDir, '07-schemas-tab.png') });
    }

    const closeBtn = page.locator('button:has-text("✕"), button:has-text("Close"), button[aria-label="Close"]').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(800);
  }

  // 7. Execute Layout Physics (Smart Arrange)
  console.log('📐 [WebMCP Agent] Calling tool: arrange_layout (smart_flow)...');
  await page.evaluate(async () => {
    await (window as any).document.modelContext.executeTool('arrange_layout', {
      preset: 'smart_flow',
    });
  });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(recordingsDir, '08-layout-physics-arranged.png') });

  // 8. Export Canvas to Markdown & Mermaid
  console.log('📄 [WebMCP Agent] Calling tool: export_canvas...');
  const exportResults = await page.evaluate(async () => {
    const md = await (window as any).document.modelContext.executeTool('export_canvas', { format: 'markdown' });
    const mermaid = await (window as any).document.modelContext.executeTool('export_canvas', { format: 'mermaid' });
    return { md, mermaid };
  });

  if (exportResults?.md) {
    fs.writeFileSync(
      path.join(recordingsDir, 'exported-architecture.md'),
      typeof exportResults.md === 'string' ? exportResults.md : JSON.stringify(exportResults.md, null, 2)
    );
  }
  if (exportResults?.mermaid) {
    fs.writeFileSync(
      path.join(recordingsDir, 'exported-flowchart.mermaid'),
      typeof exportResults.mermaid === 'string' ? exportResults.mermaid : JSON.stringify(exportResults.mermaid, null, 2)
    );
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(recordingsDir, '09-final-canvas-overview.png') });
  console.log('🎉 [WebMCP Agent] Complete WebMCP execution and recording finished successfully!');
});
