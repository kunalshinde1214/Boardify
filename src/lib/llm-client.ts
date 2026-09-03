'use client';

import { CanvasNode, CanvasEdge, NoteColor } from './types';

export interface LLMConfig {
  provider: 'openai' | 'gemini' | 'anthropic' | 'smart_mock';
  apiKey?: string;
  model?: string;
}

export interface GeneratedPlan {
  summary: string;
  _providerUsed?: string;
  _error?: string;
  nodes: {
    title: string;
    body: string;
    color: NoteColor;
    nodeType?:
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
      | 'table'
      | 'shape';
    signType?: string;
    logoType?: string;
    stamp?: string;
    fields?: {
      id: string;
      name: string;
      type: string;
      isPrimaryKey?: boolean;
      isForeignKey?: boolean;
      isNullable?: boolean;
      foreignTable?: string;
    }[];
    shapeType?: 'rectangle' | 'circle' | 'diamond' | 'cylinder' | 'hexagon' | 'cloud';
    tasks?: { text: string; done?: boolean }[];
    suggestedOffset?: { x: number; y: number };
  }[];
  links: {
    sourceTitle: string;
    targetTitle: string;
    label: string;
  }[];
}

const STORAGE_KEY = 'boardify:llm_config';

export function getLLMConfig(): LLMConfig {
  if (typeof window === 'undefined') return { provider: 'smart_mock' };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && parsed.apiKey.trim().length > 0) return parsed;
      if (parsed.provider === 'smart_mock') return parsed;
    }
  } catch {
    // fallback
  }

  // Auto-detect environment variables if configured
  const envGemini = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (envGemini && envGemini.startsWith('AIzaSy')) {
    return { provider: 'gemini', apiKey: envGemini, model: 'gemini-2.0-flash' };
  }

  const envOpenAI = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (envOpenAI && envOpenAI.startsWith('sk-')) {
    return { provider: 'openai', apiKey: envOpenAI, model: 'gpt-4o-mini' };
  }

  return { provider: 'smart_mock' };
}

export function saveLLMConfig(config: LLMConfig) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export async function generateDynamicPlan(
  prompt: string,
  existingNodes: CanvasNode[],
  config: LLMConfig = getLLMConfig()
): Promise<GeneratedPlan> {
  const contextNotes = existingNodes
    .slice(0, 20)
    .map(n => `- [${n.id}] (${n.nodeType || 'note'}${n.logoType ? `:${n.logoType}` : ''}${n.signType ? `:${n.signType}` : ''}) "${n.title}": ${n.body}`)
    .join('\n');

  const systemInstruction = `You are a spatial whiteboard strategy and systems architecture expert for Boardify.
The user is working on an infinite canvas with sticky notes, tech/brand logos, relational database tables, decision diamonds, status signs, section headers, checklists, and directional connection wires.

Existing board context:
${contextNotes || '(Board is empty)'}

User Request: "${prompt}"

CRITICAL INSTRUCTIONS:
1. Exact Text Fidelity: If the user provides specific text or asks to add verbatim content (e.g. "add this text: XYZ"), place their exact text in the "body" field without truncating or losing detail.
2. Relational Database Tables: If the user requests a database table or schema (e.g. "users table", "orders model", "schema for customers"), set nodeType: "table", title: "table_name", and provide "fields": [{"id": "1", "name": "id", "type": "UUID", "isPrimaryKey": true}, {"id": "2", "name": "email", "type": "VARCHAR"}, ...]
3. Decision / Logic Gates: If the user requests a decision, rule, check, or branching logic, set nodeType: "shape", shapeType: "diamond", title: "Decision condition".
4. Tech Logos: If the request refers to software or infrastructure tools, set nodeType: "logo" and logoType to one of: "netlify", "nextjs", "openai", "claude", "gemini", "react", "aws", "firebase", "supabase", "postgres", "redis", "docker", "github", "stripe", "tailwind", "typescript", "python", "graphql", "kubernetes", "linear", "figma", "slack", "discord".
5. Road & Status Signs: If the request refers to alerts, milestones, risks, or blockers, set nodeType: "sign" and signType to one of: "warning", "stop", "launch", "goal", "idea", "critical", "success", "construction", "security", "pinned", "loop", "experiment", "bug", "hotfix", "milestone", "cone", "heartbeat", "secret", "compass", "alert", "branch", "database_sync", "coffee", "lock".
6. Section Headings: For grouping areas or architecture phases, set nodeType: "heading".
7. Task Checklists: For to-do lists, set nodeType: "task" and include "tasks": [{"text": "item 1", "done": false}, ...].

Return ONLY a JSON object matching this structure:
{
  "summary": "Short 1-sentence description of what was created",
  "nodes": [
    {
      "title": "Clear punchy title",
      "body": "Detailed text content or explanation",
      "color": "butter" | "sage" | "coral" | "slate" | "lavender" | "mint",
      "nodeType": "default" | "table" | "shape" | "sign" | "logo" | "heading" | "task" | "agent" | "tool" | "database" | "api" | "cloud" | "auth" | "trigger" | "ui",
      "logoType": "optional tech logo ID",
      "signType": "optional sign ID",
      "shapeType": "diamond" | "cylinder" | "circle",
      "fields": [{"id": "1", "name": "id", "type": "UUID", "isPrimaryKey": true}],
      "stamp": "optional stamp",
      "tasks": [{"text": "action item", "done": false}]
    }
  ],
  "links": [
    {
      "sourceTitle": "Exact title of source note",
      "targetTitle": "Exact title of target note",
      "label": "triggers" | "depends on" | "queries" | "deploys to" | "reads from" | "leads to" | "1:N"
    }
  ]
}`;

  // 1. OpenAI Integration
  if (config.provider === 'openai' && config.apiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: config.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'OpenAI API error');
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      const parsed = JSON.parse(content);
      parsed._providerUsed = 'openai';
      return parsed;
    } catch (e: any) {
      console.warn('OpenAI call failed, falling back to smart synthesis:', e);
      const fallback = generateHeuristicPlan(prompt, existingNodes);
      fallback._providerUsed = 'smart_mock';
      fallback._error = e?.message || 'OpenAI call failed';
      return fallback;
    }
  }

  // 2. Google Gemini Integration
  if (config.provider === 'gemini' && config.apiKey) {
    let lastError = null;
    try {
      let rawModel = (config.model || 'gemini-2.0-flash').trim().replace(/^models\//, '');
      const modelsToTry = [rawModel, 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
      const uniqueModels = Array.from(new Set(modelsToTry));

      for (const m of uniqueModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${config.apiKey.trim()}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemInstruction}\n\nUser Prompt: ${prompt}\n\nRespond with valid JSON only.` }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            const cleanJson = rawText.replace(/```(?:json)?\n?/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            parsed._providerUsed = 'gemini';
            return parsed;
          } else {
            const err = await res.json();
            lastError = err.error?.message || `HTTP ${res.status}`;
          }
        } catch (e: any) {
          lastError = e?.message;
        }
      }
      console.warn('Gemini call failed:', lastError);
      const fallback = generateHeuristicPlan(prompt, existingNodes);
      fallback._providerUsed = 'smart_mock';
      fallback._error = lastError || 'Gemini API call failed';
      return fallback;
    } catch (e: any) {
      console.warn('Gemini call failed, falling back to smart synthesis:', e);
      const fallback = generateHeuristicPlan(prompt, existingNodes);
      fallback._providerUsed = 'smart_mock';
      fallback._error = e?.message || 'Gemini API call failed';
      return fallback;
    }
  }

  // 3. Anthropic Integration
  if (config.provider === 'anthropic' && config.apiKey) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey.trim(),
          'anthropic-version': '2023-06-01',
          'dangerously-allow-browser': 'true',
        },
        body: JSON.stringify({
          model: config.model || 'claude-3-5-sonnet-20241022',
          max_tokens: 1200,
          system: systemInstruction,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Anthropic API error');
      }

      const data = await res.json();
      const text = data.content?.[0]?.text || '{}';
      const cleanJson = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      const parsed = JSON.parse(cleanJson);
      parsed._providerUsed = 'anthropic';
      return parsed;
    } catch (e: any) {
      console.warn('Anthropic call failed, falling back to smart synthesis:', e);
      const fallback = generateHeuristicPlan(prompt, existingNodes);
      fallback._providerUsed = 'smart_mock';
      fallback._error = e?.message || 'Anthropic API call failed';
      return fallback;
    }
  }

  // 4. Smart Local Dynamic Synthesis (Heuristic AI Engine)
  const plan = generateHeuristicPlan(prompt, existingNodes);
  plan._providerUsed = 'smart_mock';
  return plan;
}

function generateHeuristicPlan(prompt: string, existingNodes: CanvasNode[]): GeneratedPlan {
  const p = prompt.toLowerCase();

  // 1. Direct Note / Sticky Creation: "add note: XYZ", "create note ...", "note: ..."
  const noteMatch = prompt.match(/^(?:add|create|new)?\s*(?:note|sticky|card|idea)[:\s]+(.+)/i);
  if (noteMatch && noteMatch[1]) {
    const rawContent = noteMatch[1].trim();
    const parts = rawContent.split(/[-–—|:\n]/);
    const title = parts[0]?.trim() || 'New Note';
    const body = parts.slice(1).join(' ').trim() || `Captured: "${rawContent}"`;
    return {
      summary: `Created note: "${title}"`,
      nodes: [
        {
          title,
          body,
          color: 'butter',
          nodeType: 'default',
        },
      ],
      links: [],
    };
  }

  // 2. Database Table / ERD / Schema Requests: "table users", "schema for orders", "database model", "sql"
  if (/\b(?:table|schema|database|model|entity|erd|sql)\b/i.test(p)) {
    const tablesFound: string[] = [];
    const tableCandidates = ['users', 'orders', 'products', 'customers', 'invoices', 'workspaces', 'organizations', 'payments', 'posts', 'comments', 'sessions', 'audit_logs', 'items'];
    tableCandidates.forEach(tbl => {
      if (p.includes(tbl)) tablesFound.push(tbl);
    });

    if (tablesFound.length === 0) {
      // Try to extract a word right after 'table' or 'schema'
      const match = p.match(/(?:table|schema|model|entity)\s+(?:for\s+)?([a-zA-Z0-9_]+)/i);
      tablesFound.push(match ? match[1] : 'entities');
    }

    const nodes: GeneratedPlan['nodes'] = [];
    const links: GeneratedPlan['links'] = [];

    tablesFound.forEach((tbl, idx) => {
      const isUserLike = /user|customer|account|member/i.test(tbl);
      const isOrderLike = /order|invoice|payment|transaction/i.test(tbl);

      const fields = [
        { id: '1', name: 'id', type: 'UUID', isPrimaryKey: true },
        isUserLike
          ? { id: '2', name: 'email', type: 'VARCHAR(255)', isNullable: false }
          : isOrderLike
          ? { id: '2', name: 'user_id', type: 'UUID', isForeignKey: true }
          : { id: '2', name: 'name', type: 'VARCHAR(128)', isNullable: false },
        isOrderLike
          ? { id: '3', name: 'amount', type: 'DECIMAL(10,2)', isNullable: false }
          : { id: '3', name: 'status', type: 'VARCHAR(50)', isNullable: false },
        { id: '4', name: 'created_at', type: 'TIMESTAMP', isNullable: false },
      ];

      nodes.push({
        title: tbl,
        body: `Relational 3NF SQL table with typed primary and foreign key constraints.`,
        color: idx % 2 === 0 ? 'butter' : 'slate',
        nodeType: 'table',
        fields,
      });
    });

    if (nodes.length >= 2) {
      links.push({
        sourceTitle: nodes[0].title,
        targetTitle: nodes[1].title,
        label: '1:N references',
      });
    }

    return {
      summary: `Created ${nodes.length} relational SQL table${nodes.length > 1 ? 's' : ''} (${tablesFound.join(', ')})`,
      nodes,
      links,
    };
  }

  // 3. Tech Stack / Microservices Architecture: "nextjs, redis, postgres, kafka, docker"
  const TECH_MAP: Record<string, { name: string; type: string; role: string }> = {
    nextjs: { name: 'Next.js 15 App', type: 'nextjs', role: 'Fullstack Serverless Edge Web UI' },
    react: { name: 'React Frontend', type: 'react', role: 'Client-side SPA component tree' },
    tailwind: { name: 'Tailwind CSS', type: 'tailwind', role: 'Modern utility-first responsive design' },
    typescript: { name: 'TypeScript', type: 'typescript', role: 'End-to-end typed contract layer' },
    python: { name: 'Python Service', type: 'python', role: 'Data processing & async workers' },
    postgres: { name: 'PostgreSQL DB', type: 'postgres', role: 'Primary relational ACID store' },
    redis: { name: 'Redis Cache', type: 'redis', role: 'In-memory fast state & rate limiting' },
    kafka: { name: 'Apache Kafka', type: 'kafka', role: 'Distributed high-throughput event broker' },
    docker: { name: 'Docker Container', type: 'docker', role: 'Reproducible microservice packaging' },
    kubernetes: { name: 'Kubernetes Pods', type: 'kubernetes', role: 'Autoscaling container orchestrator' },
    aws: { name: 'AWS Cloud', type: 'aws', role: 'Scalable cloud infrastructure' },
    firebase: { name: 'Firebase', type: 'firebase', role: 'Real-time database and user authentication' },
    supabase: { name: 'Supabase', type: 'supabase', role: 'Managed PostgreSQL with Row Level Security' },
    stripe: { name: 'Stripe Billing', type: 'stripe', role: 'Secure checkout and webhook handling' },
    openai: { name: 'OpenAI GPT-4o', type: 'openai', role: 'Frontier reasoning and embeddings' },
    gemini: { name: 'Google Gemini', type: 'gemini', role: 'Multimodal contextual intelligence' },
    claude: { name: 'Anthropic Claude', type: 'claude', role: 'Autonomous agentic workflow synthesis' },
    netlify: { name: 'Netlify Edge', type: 'netlify', role: 'Global instant deployment CDN' },
    graphql: { name: 'GraphQL Gateway', type: 'graphql', role: 'Federated schema API layer' },
    github: { name: 'GitHub Actions', type: 'github', role: 'CI/CD testing and build deployment' },
  };

  const detectedTech: string[] = [];
  Object.keys(TECH_MAP).forEach(techKey => {
    if (p.includes(techKey)) detectedTech.push(techKey);
  });

  if (detectedTech.length >= 2) {
    const nodes: GeneratedPlan['nodes'] = detectedTech.map((key, i) => {
      const def = TECH_MAP[key];
      return {
        title: def.name,
        body: def.role,
        color: (['butter', 'mint', 'slate', 'sage', 'coral', 'lavender'] as NoteColor[])[i % 6],
        nodeType: 'logo',
        logoType: def.type,
      };
    });

    const links: GeneratedPlan['links'] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      links.push({
        sourceTitle: nodes[i].title,
        targetTitle: nodes[i + 1].title,
        label: i === 0 ? 'queries' : i === 1 ? 'streams to' : 'persists in',
      });
    }

    return {
      summary: `Synthesized architecture with ${detectedTech.length} connected technology nodes`,
      nodes,
      links,
    };
  }

  // 4. Checklist / Task / Sprint: "todo", "task", "checklist", "sprint"
  if (/\b(?:task|todo|checklist|sprint|backlog|steps)\b/i.test(p)) {
    return {
      summary: `Created sprint task checklist for: "${prompt.slice(0, 35)}"`,
      nodes: [
        {
          title: `Action Plan: ${prompt.slice(0, 25)}`,
          body: `Interactive checklist generated by WebMCP agent.`,
          color: 'butter',
          nodeType: 'task',
          tasks: [
            { text: 'Define system specifications and API contracts', done: true },
            { text: 'Implement database models and migration scripts', done: false },
            { text: 'Connect frontend client to backend endpoints', done: false },
            { text: 'Run integration test suite & deploy preview', done: false },
          ],
        },
      ],
      links: [],
    };
  }

  // 5. Decision / Gate / Conditional: "decision", "if", "gate", "condition", "validator"
  if (/\b(?:decision|diamond|gate|condition|validator|check)\b/i.test(p)) {
    const decisionTitle = prompt.replace(/decision|gate|check/gi, '').trim() || 'Payload Valid?';
    return {
      summary: `Created decision gate logic for: "${prompt.slice(0, 35)}"`,
      nodes: [
        {
          title: 'Incoming Request',
          body: 'Payload received from client application.',
          color: 'butter',
          nodeType: 'default',
        },
        {
          title: decisionTitle,
          body: 'Deterministic validation rule gate.',
          color: 'coral',
          nodeType: 'shape',
          shapeType: 'diamond',
        },
        {
          title: 'Execute Action',
          body: 'Condition passed: proceed to database mutation.',
          color: 'sage',
          nodeType: 'default',
        },
      ],
      links: [
        { sourceTitle: 'Incoming Request', targetTitle: decisionTitle, label: 'evaluates' },
        { sourceTitle: decisionTitle, targetTitle: 'Execute Action', label: 'if true' },
      ],
    };
  }

  // 6. Pros & Cons / Tradeoffs
  if (p.includes('pro') || p.includes('con') || p.includes('tradeoff') || p.includes('evaluate')) {
    return {
      summary: `Evaluated trade-offs for: "${prompt.slice(0, 40)}"`,
      nodes: [
        {
          title: `Advantage: Rapid Scale`,
          body: `Direct alignment with emerging developer workflows and high leverage velocity.`,
          color: 'sage',
        },
        {
          title: `Advantage: Low Friction`,
          body: `Minimal configuration required to realize first-session value.`,
          color: 'mint',
        },
        {
          title: `Risk: Ecosystem Adoption`,
          body: `Dependent on external platform adoption timeline and standard support.`,
          color: 'coral',
        },
        {
          title: `Mitigation: Graceful Fallbacks`,
          body: `Provide local emulation ensuring 100% utility across all environments.`,
          color: 'lavender',
        },
      ],
      links: [
        { sourceTitle: 'Advantage: Rapid Scale', targetTitle: 'Risk: Ecosystem Adoption', label: 'counters' },
        { sourceTitle: 'Risk: Ecosystem Adoption', targetTitle: 'Mitigation: Graceful Fallbacks', label: 'mitigated by' },
      ],
    };
  }

  // 7. General Custom Task Decomposition:
  // Breaks any user task into 3 clean, sequential, domain-specific execution stages!
  const cleanPrompt = prompt.replace(/[^\w\s-]/g, '').trim();
  const words = cleanPrompt.split(/\s+/).filter(w => w.length > 2);
  const coreSubject = words.slice(0, 4).join(' ') || 'Architecture Task';

  return {
    summary: `Structured execution plan for "${prompt.slice(0, 40)}"`,
    nodes: [
      {
        title: `1. Input: ${coreSubject}`,
        body: `Initial state, trigger conditions, and context parameters for: ${prompt}.`,
        color: 'butter',
        nodeType: 'default',
      },
      {
        title: `2. Execution Engine`,
        body: `Core business logic, transformation pipeline, and validation rules.`,
        color: 'slate',
        nodeType: 'agent',
      },
      {
        title: `3. Delivery & Output`,
        body: `Final state persistence, notification dispatch, and UI rendering feedback.`,
        color: 'mint',
        nodeType: 'default',
      },
    ],
    links: [
      { sourceTitle: `1. Input: ${coreSubject}`, targetTitle: `2. Execution Engine`, label: 'feeds into' },
      { sourceTitle: `2. Execution Engine`, targetTitle: `3. Delivery & Output`, label: 'produces' },
    ],
  };
}
