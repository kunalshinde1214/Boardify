'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'ok' | 'warn' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3600) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#1D1A16] shadow-[3px_3px_0_#1D1A16] text-xs font-semibold max-w-[90vw] animate-note-pop ${
              t.type === 'ok'
                ? 'bg-[#DCEBC8] text-[#1D1A16]'
                : t.type === 'warn'
                ? 'bg-[#FFD8C7] text-[#1D1A16]'
                : 'bg-[#1D1A16] text-[#F4EFE4]'
            }`}
          >
            {t.type === 'ok' && <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />}
            {t.type === 'warn' && <AlertCircle className="w-4 h-4 text-[#E24E1B] flex-shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-[#FFE9A8] flex-shrink-0" />}
            <span>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-2 hover:opacity-75 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showToast: (msg: string) => console.log('Toast:', msg),
    };
  }
  return ctx;
}
