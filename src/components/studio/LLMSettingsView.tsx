'use client';

import React, { useState, useEffect } from 'react';
import { LLMConfig, getLLMConfig, saveLLMConfig } from '@/lib/llm-client';
import { Key, Sparkles, Check, Info } from 'lucide-react';
import { useToast } from '../ui/ToastProvider';

export function LLMSettingsView() {
  const [provider, setProvider] = useState<LLMConfig['provider']>('smart_mock');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const cfg = getLLMConfig();
    setProvider(cfg.provider || 'smart_mock');
    setApiKey(cfg.apiKey || '');
    setModel(cfg.model || '');
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveLLMConfig({
      provider,
      apiKey: apiKey.trim(),
      model: model.trim() || undefined,
    });
    showToast('AI Provider settings saved!', 'ok');
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 text-left">
      <div className="p-3 rounded-xl bg-[#FFFDF6] border border-[#1D1A16] shadow-sm space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-xs text-[#1D1A16]">
          <Key className="w-3.5 h-3.5 text-[#E24E1B]" />
          <span>Dynamic Live LLM Engine</span>
        </div>
        <p className="text-[11px] text-[#6B6353] leading-relaxed">
          Connect your API key to generate completely custom notes, frameworks, and wires for any topic directly inside standard browsers.
        </p>
      </div>

      {/* Provider selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B6353] font-mono">
          AI Provider
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'smart_mock', label: 'Built-in Smart AI', desc: 'Zero setup / instant' },
            { id: 'openai', label: 'OpenAI', desc: 'GPT-4o mini' },
            { id: 'gemini', label: 'Google Gemini', desc: '1.5 Flash' },
            { id: 'anthropic', label: 'Anthropic', desc: 'Claude 3.5 Sonnet' },
          ].map(p => (
            <button
              type="button"
              key={p.id}
              onClick={() => setProvider(p.id as any)}
              className={`p-2 rounded-xl text-left border transition-all ${
                provider === p.id
                  ? 'border-[#E24E1B] bg-[#FFD8C7]/30 ring-1 ring-[#E24E1B]'
                  : 'border-[#DCD4C2] bg-[#FFFDF6] hover:bg-[#F4EFE4]'
              }`}
            >
              <div className="font-bold text-xs text-[#1D1A16]">{p.label}</div>
              <div className="text-[10px] text-[#6B6353]">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* API Key Input if not smart_mock */}
      {provider !== 'smart_mock' && (
        <div className="space-y-3 p-3 rounded-xl bg-[#FFFDF6] border border-[#DCD4C2] animate-note-pop">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#1D1A16] flex items-center justify-between">
              <span>{provider.toUpperCase()} API Key</span>
              <span className="text-[10px] text-[#6B6353] font-normal">Stored locally</span>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={
                provider === 'openai'
                  ? 'sk-...'
                  : provider === 'gemini'
                  ? 'AIzaSy...'
                  : 'sk-ant-...'
              }
              className="w-full text-xs px-3 py-2 rounded-lg bg-[#F4EFE4] border border-[#1D1A16]/30 font-mono outline-none focus:border-[#E24E1B]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#1D1A16]">Custom Model (Optional)</label>
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder={
                provider === 'openai'
                  ? 'gpt-4o-mini'
                  : provider === 'gemini'
                  ? 'gemini-2.0-flash'
                  : 'claude-3-5-sonnet-20241022'
              }
              className="w-full text-xs px-3 py-2 rounded-lg bg-[#F4EFE4] border border-[#1D1A16]/30 font-mono outline-none focus:border-[#E24E1B]"
            />
          </div>
        </div>
      )}

      {/* Security Note */}
      <div className="p-2.5 rounded-lg bg-[#F4EFE4] border border-[#DCD4C2] flex items-start gap-2 text-[10px] text-[#6B6353]">
        <Info className="w-3.5 h-3.5 text-[#E24E1B] flex-shrink-0 mt-0.5" />
        <span>Keys stay 100% in your local browser storage and are dispatched directly to the model endpoint.</span>
      </div>

      <button
        type="submit"
        className="w-full py-2.5 rounded-xl bg-[#E24E1B] text-white font-bold text-xs border border-[#1D1A16] shadow-[2px_2px_0_#1D1A16] hover:bg-[#B33A10] transition-colors flex items-center justify-center gap-1.5"
      >
        <Check className="w-3.5 h-3.5" />
        <span>Save AI Settings</span>
      </button>
    </form>
  );
}
