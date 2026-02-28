import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { getApiKeys, setApiKeys } from '../../lib/localStorage';
import type { Provider } from '../../types';
import { PROVIDER_NAMES, PROVIDER_COLORS } from '../../types';
import { isSupabaseConfigured } from '../../lib/supabase';

interface Props {
  onClose: () => void;
}

const PROVIDERS: Provider[] = ['openai', 'anthropic', 'google', 'deepseek', 'zhipu', 'qwen'];

const PROVIDER_PLACEHOLDERS: Record<Provider, string> = {
  openai: 'sk-...',
  anthropic: 'sk-ant-...',
  google: 'AIza...',
  deepseek: 'sk-...',
  zhipu: 'Your GLM API Key',
  qwen: 'sk-...',
};

const PROVIDER_LINKS: Record<Provider, string> = {
  openai: 'https://platform.openai.com/api-keys',
  anthropic: 'https://console.anthropic.com/settings/keys',
  google: 'https://aistudio.google.com/app/apikey',
  deepseek: 'https://platform.deepseek.com/api_keys',
  zhipu: 'https://open.bigmodel.cn/usercenter/apikeys',
  qwen: 'https://dashscope.console.aliyun.com/apiKey',
};

export function SettingsModal({ onClose }: Props) {
  const [keys, setKeys] = useState(getApiKeys());
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  function toggleShow(provider: string) {
    setShowKeys(s => ({ ...s, [provider]: !s[provider] }));
  }

  function handleSave() {
    setApiKeys(keys);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-white">Settings</h2>
            <p className="text-sm text-gray-500 mt-0.5">Keys are stored locally in your browser only.</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          {/* Supabase status */}
          <div className={`flex items-center gap-2 p-3 rounded-lg mb-6 text-sm ${
            isSupabaseConfigured
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
          }`}>
            {isSupabaseConfigured
              ? <><CheckCircle size={16} /> Supabase connected — chat history will be saved to cloud</>
              : <><AlertCircle size={16} /> Supabase not configured — chat history saved locally only</>
            }
          </div>

          {/* API Keys */}
          <div className="space-y-4">
            {PROVIDERS.map(provider => (
              <div key={provider}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <span className={`w-2 h-2 rounded-full ${PROVIDER_COLORS[provider]}`} />
                    {PROVIDER_NAMES[provider]}
                  </label>
                  <a
                    href={PROVIDER_LINKS[provider]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Get API Key →
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showKeys[provider] ? 'text' : 'password'}
                    value={keys[provider] ?? ''}
                    onChange={e => setKeys(k => ({ ...k, [provider]: e.target.value }))}
                    placeholder={PROVIDER_PLACEHOLDERS[provider]}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 pr-10 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    onClick={() => toggleShow(provider)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showKeys[provider] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-800 flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 font-medium transition-colors"
          >
            {saved ? (
              <><CheckCircle size={16} /> Saved!</>
            ) : 'Save Keys'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-700 hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
