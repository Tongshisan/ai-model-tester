import React, { useRef, useState } from 'react';
import { Send, Square, Paperclip, X } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';

interface Props {
  onSend: (text: string, imageBase64?: string) => void;
  onStop: () => void;
  streaming: boolean;
  disabled?: boolean;
  supportsImages?: boolean;
}

export function ChatInput({ onSend, onStop, streaming, disabled, supportsImages }: Props) {
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    if ((!text.trim() && !imagePreview) || streaming) return;
    onSend(text.trim(), imagePreview ?? undefined);
    setText('');
    setImagePreview(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="p-4 border-t border-gray-800">
      {/* Image preview */}
      {imagePreview && (
        <div className="relative inline-block mb-3">
          <img src={imagePreview} alt="Preview" className="h-20 rounded-lg border border-gray-700" />
          <button
            onClick={() => setImagePreview(null)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={10} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 focus-within:border-indigo-500 transition-colors">
        {supportsImages && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={disabled || streaming}
              className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0 mb-0.5 disabled:opacity-40"
              title="Attach image"
            >
              <Paperclip size={18} />
            </button>
          </>
        )}

        <TextareaAutosize
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
          disabled={disabled || streaming}
          minRows={1}
          maxRows={6}
          className="flex-1 bg-transparent text-gray-100 placeholder-gray-600 text-sm resize-none focus:outline-none disabled:opacity-50"
        />

        {streaming ? (
          <button
            onClick={onStop}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            title="Stop generation"
          >
            <Square size={14} />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={(!text.trim() && !imagePreview) || disabled}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send size={14} />
          </button>
        )}
      </div>
      <p className="text-xs text-gray-700 text-center mt-2">
        AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}
