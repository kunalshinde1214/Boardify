'use client';

import { CanvasNode, CanvasEdge, NoteColor } from './types';

export interface LLMConfig {
  provider: 'openai' | 'gemini' | 'anthropic' | 'smart_mock';
  apiKey?: string;
  model?: string;
}

export interface GeneratedPlan {
  summary: string;
  nodes: {
    title: string;
    body: string;
    color: NoteColor;
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
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
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
    .slice(0, 15)
    .map(n => `- [${n.id}] "${n.title}": ${n.body}`)
    .join('\n');

  const systemInstruction = `You are a spatial whiteboard strategy architect for Boardify.
The user is working on an infinite canvas with sticky notes and directional connection wires.
Existing board context:
${contextNotes || '(Board is empty)'}

User Request: "${prompt}"

Return ONLY a JSON object with this exact structure:
{
  "summary": "Short 1-sentence description of what was created",
  "nodes": [
    {
      "title": "Short punchy title (under 5 words)",
      "body": "Clear actionable description (1-2 sentences)",
      "color": "butter" | "sage" | "coral" | "slate" | "lavender" | "mint"
    }
  ],
  "links": [
    {
      "sourceTitle": "Exact title of source note",
      "targetTitle": "Exact title of target note",
      "label": "relationship label (e.g. 'drives', 'depends on', 'expands', 'pro', 'con')"
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
      return JSON.parse(content);
    } catch (e: any) {
      console.warn('OpenAI call failed, falling back to smart synthesis:', e);
    }
  }

  // 2. Google Gemini Integration
  if (config.provider === 'gemini' && config.apiKey) {
    try {
      let rawModel = (config.model || 'gemini-2.0-flash').trim().replace(/^models\//, '');
      const modelsToTry = [rawModel, 'gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-1.5-flash', 'gemini-pro'];
      const uniqueModels = Array.from(new Set(modelsToTry));

      let lastError = null;
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
            return JSON.parse(cleanJson);
          } else {
            const err = await res.json();
            lastError = err.error?.message || `HTTP ${res.status}`;
          }
        } catch (e: any) {
          lastError = e?.message;
        }
      }
      throw new Error(lastError || 'Gemini API failed');
    } catch (e: any) {
      console.warn('Gemini call failed, falling back to smart synthesis:', e);
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
      return JSON.parse(cleanJson);
    } catch (e: any) {
      console.warn('Anthropic call failed, falling back to smart synthesis:', e);
    }
  }

  // 4. Smart Local Dynamic Synthesis (Heuristic AI Engine)
  return generateHeuristicPlan(prompt, existingNodes);
}

function generateHeuristicPlan(prompt: string, existingNodes: CanvasNode[]): GeneratedPlan {
  const p = prompt.toLowerCase();

  // If prompt looks like pros/cons
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

  // If prompt is SWOT
  if (p.includes('swot') || p.includes('matrix')) {
    return {
      summary: `Generated 4-quadrant strategic matrix for: "${prompt.slice(0, 40)}"`,
      nodes: [
        { title: 'STRENGTHS', body: 'Unique protocol architecture, sub-20ms latency, zero-setup onboarding.', color: 'sage' },
        { title: 'WEAKNESSES', body: 'Early-stage standard awareness requiring clear developer onboarding guides.', color: 'coral' },
        { title: 'OPPORTUNITIES', body: 'Chrome and OpenAI pushing WebMCP as the default browser agent protocol.', color: 'mint' },
        { title: 'THREATS', body: 'Incumbent tools attempting proprietary walled-garden copycats.', color: 'butter' },
      ],
      links: [
        { sourceTitle: 'STRENGTHS', targetTitle: 'OPPORTUNITIES', label: 'leverages' },
        { sourceTitle: 'WEAKNESSES', targetTitle: 'THREATS', label: 'vulnerable to' },
      ],
    };
  }

  // Default: Dynamic Topic Expansion based on user's words
  const words = prompt.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  const topic = words.slice(0, 3).join(' ') || 'Strategic Initiative';

  return {
    summary: `Structured strategic breakdown for "${prompt.slice(0, 40)}"`,
    nodes: [
      {
        title: `Core: ${topic}`,
        body: `Primary anchor thesis and value driver for ${prompt}.`,
        color: 'butter',
      },
      {
        title: `Channel & Distribution`,
        body: `Direct community distribution, developer documentation, and viral export loops.`,
        color: 'slate',
      },
      {
        title: `Technical Execution`,
        body: `Sub-20ms client execution, resilient Firebase synchronization, and typed schema validation.`,
        color: 'mint',
      },
      {
        title: `Competitive Advantage`,
        body: `Standard WebMCP native bridge vs legacy screen-scraping competitors.`,
        color: 'sage',
      },
    ],
    links: [
      { sourceTitle: `Core: ${topic}`, targetTitle: `Channel & Distribution`, label: 'reaches via' },
      { sourceTitle: `Core: ${topic}`, targetTitle: `Technical Execution`, label: 'built with' },
      { sourceTitle: `Technical Execution`, targetTitle: `Competitive Advantage`, label: 'enables' },
    ],
  };
}
