import React, { useState } from 'react';
import { Plus, MessageSquare, Image, Settings, Bot, MoreHorizontal, Trash2 } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { MODELS, PROVIDER_COLORS } from '../../types';
import type { Chat } from '../../types';
import { NewChatModal } from './NewChatModal';
import { ChatSettingsModal } from './ChatSettingsModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
  onOpenSettings: () => void;
}

export function Sidebar({ onOpenSettings }: Props) {
  const { chats, currentChatId, selectChat, deleteChat } = useChatStore();
  const [showNewChat, setShowNewChat] = useState(false);
  const [settingsChat, setSettingsChat] = useState<Chat | null>(null);

  async function handleDelete(id: string) {
    await deleteChat(id);
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">AI Model Tester</h1>
            <p className="text-xs text-gray-500">Multi-model playground</p>
          </div>
        </div>
        <button
          onClick={() => setShowNewChat(true)}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2">
        {chats.length === 0 ? (
          <div className="text-center text-gray-600 text-sm mt-8 px-4">
            <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
            <p>No chats yet.</p>
            <p>Click "New Chat" to start.</p>
          </div>
        ) : (
          chats.map(chat => {
            const model = MODELS.find(m => m.id === chat.model);
            return (
              <div
                key={chat.id}
                onClick={() => selectChat(chat.id)}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer mb-1 transition-colors border outline-none ${currentChatId === chat.id
                  ? 'bg-indigo-600/20 border-indigo-500/30'
                  : 'border-transparent hover:bg-gray-800'
                  }`}
              >
                <div className={`w-6 h-6 rounded flex-shrink-0 flex items-center justify-center ${chat.type === 'image' ? 'bg-purple-600/20' : 'bg-blue-600/20'
                  }`}>
                  {chat.type === 'image'
                    ? <Image size={12} className="text-purple-400" />
                    : <MessageSquare size={12} className="text-blue-400" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 truncate">{chat.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${PROVIDER_COLORS[chat.provider]}`} />
                    <span className="text-xs text-gray-500 truncate">
                      {model?.name ?? chat.model}
                    </span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={e => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-all flex-shrink-0"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="right"
                    align="start"
                    className="bg-gray-800 border-gray-700 text-gray-200 min-w-[140px]"
                  >
                    <DropdownMenuItem
                      className="focus:bg-gray-700 focus:text-gray-100 cursor-pointer"
                      onSelect={() => setSettingsChat(chat)}
                    >
                      <Settings size={14} />
                      设置
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem
                      variant="destructive"
                      className="cursor-pointer"
                      onSelect={() => handleDelete(chat.id)}
                    >
                      <Trash2 size={14} />
                      删除对话
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200 text-sm transition-colors"
        >
          <Settings size={16} />
          API Keys Settings
        </button>
      </div>

      {showNewChat && (
        <NewChatModal onClose={() => setShowNewChat(false)} />
      )}

      {settingsChat && (
        <ChatSettingsModal
          chat={settingsChat}
          onClose={() => setSettingsChat(null)}
        />
      )}
    </aside>
  );
}
