import type { Message, Provider } from '../types';
import { getApiKeys } from '../lib/localStorage';
import { openaiChat, openaiGenerateImage, openaiEditImage } from './openai';
import { anthropicChat } from './anthropic';
import { geminiChat, geminiGenerateImage } from './gemini';
import { deepseekChat } from './deepseek';
import { zhipuChat, zhipuGenerateImage } from './zhipu';
import { qwenChat, qwenGenerateImage } from './qwen';

function getKey(provider: Provider): string {
  const keys = getApiKeys();
  const key = keys[provider];
  if (!key) throw new Error(`Missing API key for ${provider}. Please configure it in Settings.`);
  return key;
}

export async function sendChatMessage(
  messages: Message[],
  provider: Provider,
  model: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const key = getKey(provider);
  switch (provider) {
    case 'openai':
      return openaiChat(messages, model, key, onChunk, signal);
    case 'anthropic':
      return anthropicChat(messages, model, key, onChunk, signal);
    case 'google':
      return geminiChat(messages, model, key, onChunk, signal);
    case 'deepseek':
      return deepseekChat(messages, model, key, onChunk, signal);
    case 'zhipu':
      return zhipuChat(messages, model, key, onChunk, signal);
    case 'qwen':
      return qwenChat(messages, model, key, onChunk, signal);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export async function generateImage(
  prompt: string,
  provider: Provider,
): Promise<string> {
  const key = getKey(provider);
  switch (provider) {
    case 'openai':
      return openaiGenerateImage(prompt, key);
    case 'google':
      return geminiGenerateImage(prompt, key);
    case 'zhipu':
      return zhipuGenerateImage(prompt, key);
    case 'qwen':
      return qwenGenerateImage(prompt, key);
    default:
      throw new Error(`Provider ${provider} does not support image generation`);
  }
}

export async function editImage(
  imageBase64: string,
  maskBase64: string | null,
  prompt: string,
  provider: Provider,
): Promise<string> {
  const key = getKey(provider);
  switch (provider) {
    case 'openai':
      return openaiEditImage(imageBase64, maskBase64, prompt, key);
    default:
      throw new Error(`Provider ${provider} does not support image editing via API`);
  }
}
