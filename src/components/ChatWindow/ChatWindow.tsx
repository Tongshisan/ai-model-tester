import React, { useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '../../store/chatStore';
import { sendChatMessage } from '../../services';
import { MODELS, PROVIDER_NAMES } from '../../types';
import type { Provider } from '../../types';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { ModelSelector } from '../ModelSelector/ModelSelector';
import { MessageSquare, AlertCircle } from 'lucide-react';

interface Props {
  chatId: string;
}

export function ChatWindow({ chatId }: Props) {
  const {
    messages,
    chats,
    streaming,
    error,
    addMessage,
    appendStreamChunk,
    finalizeStream,
    setStreaming,
    setError,
    updateChatTitle,
  } = useChatStore();

  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chat = chats.find(c => c.id === chatId);
  const currentModel = MODELS.find(m => m.id === chat?.model);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleModelChange(provider: Provider, model: string) {
    const { updateChatTitle, chats } = useChatStore.getState();
    // Update chat's provider and model in store
    useChatStore.setState(s => ({
      chats: s.chats.map(c => c.id === chatId ? { ...c, provider, model } : c),
    }));
  }

  async function handleSend(text: string, imageBase64?: string) {
    if (!chat) return;
    setError(null);

    // Add user message
    const userMsg = await addMessage({
      chat_id: chatId,
      role: 'user',
      content: text,
      image_url: imageBase64,
    });

    // Auto-set title after first user message
    if (messages.length === 0 && text) {
      const title = text.slice(0, 40) + (text.length > 40 ? '...' : '');
      await updateChatTitle(chatId, title);
    }

    setStreaming(true);
    abortRef.current = new AbortController();

    try {
      const history = [...messages, userMsg];
      let full = '';

      await sendChatMessage(
        history,
        chat.provider,
        chat.model,
        (chunk) => {
          appendStreamChunk(chunk);
          full += chunk;
        },
        abortRef.current.signal,
      );

      await finalizeStream(chatId, full);
    } catch (e: unknown) {
      const err = e as Error;
      if (err.name === 'AbortError') {
        // User stopped streaming
        const { messages: currentMsgs } = useChatStore.getState();
        const streamingMsg = currentMsgs.find(m => m.id === '__streaming__');
        if (streamingMsg) {
          await finalizeStream(chatId, streamingMsg.content);
        }
      } else {
        setError(err.message ?? 'An error occurred');
        setStreaming(false);
      }
    }
  }

  function handleStop() {
    abortRef.current?.abort();
  }

  const isStreamingMsg = (msgId: string) => msgId === '__streaming__' && streaming;

  if (!chat) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-200 truncate max-w-xs">{chat.title}</h2>
          {streaming && (
            <span className="flex items-center gap-1.5 text-xs text-indigo-400">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
              Generating...
            </span>
          )}
        </div>
        <ModelSelector
          type={chat.type}
          selectedModel={chat.model}
          selectedProvider={chat.provider}
          onChange={handleModelChange}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare size={28} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Start a Conversation</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              You're chatting with <span className="text-gray-300">{currentModel?.name}</span>{' '}
              from <span className="text-gray-300">{PROVIDER_NAMES[chat.provider]}</span>.
              Send a message to begin.
            </p>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={isStreamingMsg(msg.id)}
            />
          ))
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onStop={handleStop}
        streaming={streaming}
        supportsImages={currentModel?.supportsImageInput}
      />
    </div>
  );
}
