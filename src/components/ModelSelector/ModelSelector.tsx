import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ChatType, ModelConfig, Provider } from '../../types';
import { MODELS, PROVIDER_NAMES, PROVIDER_COLORS } from '../../types';

interface Props {
  type: ChatType;
  selectedModel: string;
  selectedProvider: Provider;
  onChange: (provider: Provider, model: string) => void;
}

export function ModelSelector({ type, selectedModel, selectedProvider, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filteredModels = MODELS.filter(m => m.type.includes(type));
  const currentModel = filteredModels.find(m => m.id === selectedModel);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const grouped = filteredModels.reduce<Record<Provider, ModelConfig[]>>((acc, m) => {
    if (!acc[m.provider]) acc[m.provider] = [];
    acc[m.provider].push(m);
    return acc;
  }, {} as Record<Provider, ModelConfig[]>);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-3 py-1.5 text-sm transition-colors"
      >
        <span className={`w-2 h-2 rounded-full ${PROVIDER_COLORS[selectedProvider]}`} />
        <span className="text-gray-200">{currentModel?.name ?? selectedModel}</span>
        <span className="text-gray-500 text-xs">({PROVIDER_NAMES[selectedProvider]})</span>
        <ChevronDown size={14} className="text-gray-400" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2 max-h-80 overflow-y-auto">
            {(Object.entries(grouped) as [Provider, ModelConfig[]][]).map(([provider, models]) => (
              <div key={provider} className="mb-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {PROVIDER_NAMES[provider]}
                </div>
                {models.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onChange(m.provider, m.id);
                      setOpen(false);
                    }}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      m.id === selectedModel
                        ? 'bg-indigo-600 text-white'
                        : 'hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PROVIDER_COLORS[m.provider]}`} />
                    {m.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
