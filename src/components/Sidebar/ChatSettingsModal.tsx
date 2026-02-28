import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import type { Chat } from '../../types';

interface Props {
  chat: Chat;
  onClose: () => void;
}

export function ChatSettingsModal({ chat, onClose }: Props) {
  const { updateChat, deleteChat } = useChatStore();
  const [title, setTitle] = useState(chat.title);
  const [systemPrompt, setSystemPrompt] = useState(chat.system_prompt ?? '');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateChat(chat.id, {
      title: title.trim() || chat.title,
      system_prompt: systemPrompt.trim() || undefined,
    });
    setSaving(false);
    onClose();
  }

  async function handleDelete() {
    await deleteChat(chat.id);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">对话设置</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Title */}
        <div className="mb-5">
          <label className="text-sm font-medium text-gray-400 mb-2 block">对话名称</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="输入对话名称"
            className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder-gray-600"
          />
        </div>

        {/* System Prompt */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-400 mb-1 block">System Prompt</label>
          <p className="text-xs text-gray-600 mb-2">设置后将作为系统指令在每次对话开始时发送给模型</p>
          <textarea
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            placeholder="例如：你是一个专业的代码审查助手，请用中文回复..."
            rows={5}
            className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder-gray-600 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl py-2.5 font-medium text-sm transition-colors"
          >
            {saving ? '保存中...' : '保存'}
          </button>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-700 hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 text-sm font-medium transition-colors"
            >
              <Trash2 size={14} />
              删除
            </button>
          ) : (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
            >
              确认删除
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
