import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, Check } from 'lucide-react';
import type { Message } from '../../types';
import { useState } from 'react';

interface Props {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  async function handleCopy() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${
        isUser ? 'bg-indigo-600' : 'bg-gray-700'
      }`}>
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-gray-300" />}
      </div>

      {/* Content */}
      <div className={`group max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Image preview for user uploads */}
        {message.image_url && (
          <div className="mb-2">
            <img
              src={message.image_url}
              alt="Uploaded"
              className="max-w-xs rounded-lg border border-gray-700"
            />
          </div>
        )}

        {message.content && (
          <div className={`relative rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-sm'
              : 'bg-gray-800 text-gray-100 rounded-tl-sm'
          }`}>
            {isUser ? (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            ) : (
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
                {isStreaming && (
                  <span className="inline-block w-1.5 h-4 bg-gray-400 animate-pulse ml-0.5" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Copy button for assistant */}
        {!isUser && !isStreaming && message.content && (
          <button
            onClick={handleCopy}
            className="mt-1 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-all"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  );
}
