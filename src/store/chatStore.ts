import { create } from "zustand";
import type { Chat, Message, ChatType, Provider } from "../types";
import {
  isSupabaseConfigured,
  dbGetChats,
  dbCreateChat,
  dbDeleteChat,
  dbUpdateChat,
  dbGetMessages,
  dbCreateMessage,
} from "../lib/supabase";
import {
  localGetChats,
  localSaveChats,
  localGetMessages,
  localSaveMessages,
  localDeleteChat,
} from "../lib/localStorage";

interface ChatStore {
  chats: Chat[];
  currentChatId: string | null;
  messages: Message[];
  loading: boolean;
  streaming: boolean;
  error: string | null;

  fetchChats: () => Promise<void>;
  createChat: (
    type: ChatType,
    provider: Provider,
    model: string,
  ) => Promise<Chat>;
  selectChat: (id: string) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  updateChatTitle: (id: string, title: string) => Promise<void>;
  updateChat: (id: string, updates: Partial<Chat>) => Promise<void>;
  addMessage: (msg: Omit<Message, "id" | "created_at">) => Promise<Message>;
  appendStreamChunk: (chunk: string) => void;
  finalizeStream: (chatId: string, fullText: string) => Promise<void>;
  setStreaming: (v: boolean) => void;
  setError: (err: string | null) => void;
  clearMessages: () => void;
}

function generateId() {
  return crypto.randomUUID();
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  currentChatId: null,
  messages: [],
  loading: false,
  streaming: false,
  error: null,

  fetchChats: async () => {
    set({ loading: true });
    try {
      const chats = isSupabaseConfigured ? await dbGetChats() : localGetChats();
      set({ chats, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  createChat: async (type, provider, model) => {
    const newChat: Chat = {
      id: generateId(),
      title: "New Chat",
      type,
      provider,
      model,
      created_at: new Date().toISOString(),
    };

    let created: Chat;
    if (isSupabaseConfigured) {
      created = await dbCreateChat({
        title: newChat.title,
        type,
        provider,
        model,
      });
    } else {
      created = newChat;
      const chats = [created, ...get().chats];
      localSaveChats(chats);
    }

    set((s) => ({
      chats: [created, ...s.chats],
      currentChatId: created.id,
      messages: [],
    }));
    return created;
  },

  selectChat: async (id) => {
    set({ currentChatId: id, messages: [], loading: true });
    try {
      const msgs = isSupabaseConfigured
        ? await dbGetMessages(id)
        : localGetMessages(id);
      set({ messages: msgs, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  deleteChat: async (id) => {
    if (isSupabaseConfigured) {
      await dbDeleteChat(id);
    } else {
      localDeleteChat(id);
    }
    const chats = get().chats.filter((c) => c.id !== id);
    const currentChatId =
      get().currentChatId === id ? null : get().currentChatId;
    set({
      chats,
      currentChatId,
      messages: currentChatId === null ? [] : get().messages,
    });
  },

  updateChatTitle: async (id, title) => {
    if (isSupabaseConfigured) {
      await dbUpdateChat(id, { title });
    } else {
      const chats = get().chats.map((c) => (c.id === id ? { ...c, title } : c));
      localSaveChats(chats);
    }
    set((s) => ({
      chats: s.chats.map((c) => (c.id === id ? { ...c, title } : c)),
    }));
  },

  updateChat: async (id, updates) => {
    if (isSupabaseConfigured) {
      await dbUpdateChat(id, updates as Record<string, unknown>);
    } else {
      const chats = get().chats.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      );
      localSaveChats(chats);
    }
    set((s) => ({
      chats: s.chats.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  },

  addMessage: async (msgData) => {
    const newMsg: Message = {
      ...msgData,
      id: generateId(),
      created_at: new Date().toISOString(),
    };

    let saved: Message;
    if (isSupabaseConfigured) {
      saved = await dbCreateMessage(msgData);
    } else {
      saved = newMsg;
      const all = [...get().messages, saved];
      localSaveMessages(msgData.chat_id, all);
    }

    set((s) => ({ messages: [...s.messages, saved] }));
    return saved;
  },

  appendStreamChunk: (chunk) => {
    set((s) => {
      const messages = [...s.messages];
      const last = messages[messages.length - 1];
      if (last && last.role === "assistant" && last.id === "__streaming__") {
        messages[messages.length - 1] = {
          ...last,
          content: last.content + chunk,
        };
      } else {
        messages.push({
          id: "__streaming__",
          chat_id: s.currentChatId ?? "",
          role: "assistant",
          content: chunk,
          created_at: new Date().toISOString(),
        });
      }
      return { messages };
    });
  },

  finalizeStream: async (chatId, fullText) => {
    const saved = await (isSupabaseConfigured
      ? dbCreateMessage({
          chat_id: chatId,
          role: "assistant",
          content: fullText,
        })
      : Promise.resolve({
          id: generateId(),
          chat_id: chatId,
          role: "assistant" as const,
          content: fullText,
          created_at: new Date().toISOString(),
        }));

    if (!isSupabaseConfigured) {
      const all = get()
        .messages.filter((m) => m.id !== "__streaming__")
        .concat(saved);
      localSaveMessages(chatId, all);
    }

    set((s) => ({
      messages: s.messages.map((m) => (m.id === "__streaming__" ? saved : m)),
      streaming: false,
    }));
  },

  setStreaming: (v) => set({ streaming: v }),
  setError: (err) => set({ error: err }),
  clearMessages: () => set({ messages: [] }),
}));
