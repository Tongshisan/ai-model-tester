import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatWindow } from './components/ChatWindow/ChatWindow';
import { ImagePanel } from './components/ImagePanel/ImagePanel';
import { SettingsModal } from './components/SettingsModal/SettingsModal';
import { useChatStore } from './store/chatStore';
import { Bot, Sparkles } from 'lucide-react';

function App() {
  const { currentChatId, chats, fetchChats } = useChatStore();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const currentChat = chats.find(c => c.id === currentChatId);

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar onOpenSettings={() => setShowSettings(true)} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {currentChat ? (
          currentChat.type === 'text' ? (
            <ChatWindow chatId={currentChat.id} />
          ) : (
            <ImagePanel chatId={currentChat.id} />
          )
        ) : (
          <WelcomeScreen onOpenSettings={() => setShowSettings(true)} />
        )}
      </main>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

function WelcomeScreen({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
        <Bot size={36} className="text-white" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-3">AI Model Tester</h1>
      <p className="text-gray-400 text-lg mb-8 max-w-md">
        Test and compare AI models for text chat and image generation in one place.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mb-8">
        {[
          { label: 'Text Chat', desc: 'GPT-4o, Claude, Gemini, DeepSeek...', color: 'from-blue-600/20 to-blue-800/20 border-blue-500/20' },
          { label: 'Text to Image', desc: 'DALL-E 3, CogView, Wanx, Imagen...', color: 'from-purple-600/20 to-purple-800/20 border-purple-500/20' },
          { label: 'Image Edit', desc: 'Edit existing images with AI prompts', color: 'from-pink-600/20 to-pink-800/20 border-pink-500/20' },
        ].map(item => (
          <div key={item.label} className={`bg-gradient-to-br ${item.color} border rounded-xl p-4 text-left`}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-indigo-400" />
              <span className="text-sm font-semibold text-white">{item.label}</span>
            </div>
            <p className="text-xs text-gray-400">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <p className="text-gray-500 text-sm">
          Click <span className="text-indigo-400 font-medium">+ New Chat</span> in the sidebar to get started.
        </p>
      </div>
      <button
        onClick={onOpenSettings}
        className="mt-4 text-sm text-gray-600 hover:text-gray-400 underline transition-colors"
      >
        Configure API Keys first →
      </button>
    </div>
  );
}

export default App;
