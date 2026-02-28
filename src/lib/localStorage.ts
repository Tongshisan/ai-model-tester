import type { ApiKeys, Chat, Message } from "../types";

const KEYS = {
  API_KEYS: "ai-model-tester:api-keys",
  LOCAL_CHATS: "ai-model-tester:local-chats",
  LOCAL_MESSAGES: "ai-model-tester:local-messages",
};

export function getApiKeys(): ApiKeys {
  try {
    const raw = localStorage.getItem(KEYS.API_KEYS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setApiKeys(keys: ApiKeys): void {
  localStorage.setItem(KEYS.API_KEYS, JSON.stringify(keys));
}

// Local fallback storage when Supabase is not configured
export function localGetChats(): Chat[] {
  try {
    const raw = localStorage.getItem(KEYS.LOCAL_CHATS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function localSaveChats(chats: Chat[]): void {
  localStorage.setItem(KEYS.LOCAL_CHATS, JSON.stringify(chats));
}

export function localGetMessages(chatId: string): Message[] {
  try {
    const raw = localStorage.getItem(`${KEYS.LOCAL_MESSAGES}:${chatId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function localSaveMessages(chatId: string, messages: Message[]): void {
  localStorage.setItem(
    `${KEYS.LOCAL_MESSAGES}:${chatId}`,
    JSON.stringify(messages),
  );
}

export function localDeleteChat(chatId: string): void {
  const chats = localGetChats().filter((c) => c.id !== chatId);
  localSaveChats(chats);
  localStorage.removeItem(`${KEYS.LOCAL_MESSAGES}:${chatId}`);
}
