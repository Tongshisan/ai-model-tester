import React, { useState } from 'react';
import { X, MessageSquare, Image } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import type { ChatType, Provider } from '../../types';
import { MODELS, PROVIDER_NAMES, PROVIDER_COLORS } from '../../types';

interface Props {
  onClose: () => void;
}

export function NewChatModal({ onClose }: Props) {
  const [type, setType] = useState<ChatType>('text');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [selectedProvider, setSelectedProvider] = useState<Provider>('openai');
  const { createChat } = useChatStore();

  const filteredModels = MODELS.filter(m => m.type.includes(type));

  function handleModelChange(modelId: string) {
    const m = MODELS.find(m => m.id === modelId);
    if (m) {
      setSelectedModel(m.id);
      setSelectedProvider(m.provider);
    }
  }

  async function handleCreate() {
    await createChat(type, selectedProvider, selectedModel);
    onClose();
  }

  // Reset to default model when type changes
  function handleTypeChange(t: ChatType) {
    setType(t);
    const defaults: Record<ChatType, string> = { text: 'gpt-4o', image: 'dall-e-3' };
    const defaultModel = MODELS.find(m => m.id === defaults[t]);
    if (defaultModel) {
      setSelectedModel(defaultModel.id);
      setSelectedProvider(defaultModel.provider);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">New Chat</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Chat Type */}
        <div className="mb-5">
          <label className="text-sm font-medium text-gray-400 mb-2 block">Chat Type</label>
          <div className="grid grid-cols-2 gap-2">
            {([['text', 'Text Chat', MessageSquare], ['image', 'Image Generation', Image]] as const).map(([t, label, Icon]) => (
              <button
                key={t}
                onClick={() => handleTypeChange(t)}
                className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${type === t
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'border-gray-700 hover:border-gray-600 text-gray-400 hover:text-gray-200'
                  }`}
              >
                <Icon size={16} />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Model Selection */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-400 mb-2 block">Select Model</label>
          <div className="space-y-1 max-h-56 overflow-y-auto">
            {filteredModels.map(m => (
              <button
                key={m.id}
                onClick={() => handleModelChange(m.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${selectedModel === m.id
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-gray-800 text-gray-300'
                  }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${PROVIDER_COLORS[m.provider]}`} />
                <span className="flex-1 text-left">{m.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${selectedModel === m.id ? 'bg-white/20 text-white' : 'bg-gray-700 text-gray-500'
                  }`}>
                  {PROVIDER_NAMES[m.provider]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 font-medium transition-colors"
        >
          Start Chat
        </button>
      </div>
    </div>
  );
}
