import { createClient } from "@supabase/supabase-js";
import type { Chat, Message } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function dbGetChats(): Promise<Chat[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function dbCreateChat(
  chat: Omit<Chat, "id" | "created_at">,
): Promise<Chat> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("chats")
    .insert(chat)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function dbUpdateChat(
  id: string,
  updates: Partial<Chat>,
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("chats").update(updates).eq("id", id);
  if (error) throw error;
}

export async function dbDeleteChat(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("chats").delete().eq("id", id);
  if (error) throw error;
}

export async function dbGetMessages(chatId: string): Promise<Message[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function dbCreateMessage(
  message: Omit<Message, "id" | "created_at">,
): Promise<Message> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("messages")
    .insert(message)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function dbDeleteMessages(chatId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("chat_id", chatId);
  if (error) throw error;
}
