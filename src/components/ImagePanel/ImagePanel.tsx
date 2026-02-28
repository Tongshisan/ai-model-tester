import React, { useState, useRef } from 'react';
import { Wand2, Upload, X, Download, Loader2, AlertCircle, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { generateImage, editImage } from '../../services';
import { MODELS, PROVIDER_NAMES, PROVIDER_COLORS } from '../../types';
import type { Provider } from '../../types';
import { ModelSelector } from '../ModelSelector/ModelSelector';

interface Props {
  chatId: string;
}

type ImageMode = 'generate' | 'edit';

const IMAGE_PROVIDERS: Provider[] = ['openai', 'zhipu', 'qwen', 'google'];

export function ImagePanel({ chatId }: Props) {
  const { chats, messages, addMessage } = useChatStore();
  const chat = chats.find(c => c.id === chatId);

  const [mode, setMode] = useState<ImageMode>('generate');
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const currentModel = MODELS.find(m => m.id === chat?.model);
  const supportedByProvider = chat ? IMAGE_PROVIDERS.includes(chat.provider) : false;
  const supportsEdit = chat?.provider === 'openai';

  function handleModelChange(provider: Provider, model: string) {
    useChatStore.setState(s => ({
      chats: s.chats.map(c => c.id === chatId ? { ...c, provider, model } : c),
    }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  async function handleGenerate() {
    if (!prompt.trim() || !chat) return;
    setLoading(true);
    setError(null);

    try {
      let resultUrl: string;

      if (mode === 'edit' && uploadedImage) {
        if (!supportsEdit) {
          throw new Error(`${PROVIDER_NAMES[chat.provider]} does not support image editing via API. Please use OpenAI.`);
        }
        resultUrl = await editImage(uploadedImage, null, prompt, chat.provider);
      } else {
        if (!supportedByProvider) {
          throw new Error(`${PROVIDER_NAMES[chat.provider]} does not support image generation. Please select OpenAI, 智谱 AI, 通义千问, or Google.`);
        }
        resultUrl = await generateImage(prompt, chat.provider);
      }

      setGeneratedImages(prev => [resultUrl, ...prev]);

      // Save to chat history
      await addMessage({ chat_id: chatId, role: 'user', content: prompt });
      await addMessage({
        chat_id: chatId,
        role: 'assistant',
        content: mode === 'edit' ? `Image edited with prompt: "${prompt}"` : `Generated: "${prompt}"`,
        image_url: resultUrl,
      });

    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(url: string, index: number) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `ai-image-${Date.now()}-${index}.png`;
      a.click();
    } catch {
      // If CORS blocked, open in new tab
      window.open(url, '_blank');
    }
  }

  // Show history images from messages
  const historyImages = messages
    .filter(m => m.role === 'assistant' && m.image_url)
    .map(m => ({ url: m.image_url!, prompt: m.content }))
    .reverse();

  const allImages = [
    ...generatedImages.map(url => ({ url, prompt })),
    ...historyImages.filter(h => !generatedImages.includes(h.url)),
  ];

  if (!chat) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-200">{chat.title}</h2>
        </div>
        <ModelSelector
          type="image"
          selectedModel={chat.model}
          selectedProvider={chat.provider}
          onChange={handleModelChange}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Mode tabs */}
        <div className="flex gap-1 bg-gray-800 rounded-xl p-1 w-fit">
          {([['generate', 'Text to Image', Wand2], ['edit', 'Image to Image', RefreshCw]] as const).map(([m, label, Icon]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Upload area (only in edit mode) */}
        {mode === 'edit' && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Source Image</label>
            {uploadedImage ? (
              <div className="relative inline-block">
                <img src={uploadedImage} alt="Source" className="max-h-48 rounded-xl border border-gray-700" />
                <button
                  onClick={() => setUploadedImage(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-gray-700 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-xl p-8 flex flex-col items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <Upload size={24} />
                <span className="text-sm">Click to upload source image</span>
                <span className="text-xs text-gray-600">PNG, JPG, WebP</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            {!supportsEdit && (
              <p className="mt-2 text-xs text-yellow-500 flex items-center gap-1">
                <AlertCircle size={12} />
                Image editing is only supported by OpenAI (DALL-E 2). Currently selected: {PROVIDER_NAMES[chat.provider]}.
              </p>
            )}
          </div>
        )}

        {/* Prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            {mode === 'edit' ? 'Edit Instructions' : 'Image Prompt'}
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={
              mode === 'edit'
                ? 'Describe how to edit the image...'
                : 'Describe the image you want to generate...'
            }
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
          />
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim() || (mode === 'edit' && !uploadedImage)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-6 py-3 font-medium transition-colors"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Generating...</>
          ) : (
            <><Wand2 size={18} /> {mode === 'edit' ? 'Edit Image' : 'Generate Image'}</>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Results */}
        {allImages.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Generated Images</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allImages.map((img, i) => (
                <div key={i} className="group relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                  <img
                    src={img.url}
                    alt={`Generated ${i + 1}`}
                    className="w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-3 w-full">
                      <p className="text-xs text-gray-300 line-clamp-2 mb-2">{img.prompt}</p>
                      <button
                        onClick={() => handleDownload(img.url, i)}
                        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Download size={12} />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {allImages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-4">
              <ImageIcon size={28} className="text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Generate an Image</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              Enter a prompt above and click "Generate Image" to create AI-generated images with{' '}
              <span className="text-gray-300">{currentModel?.name ?? chat.model}</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
