import type { Message } from '../types';

const BASE_URL = 'https://api.deepseek.com';

export async function deepseekChat(
  messages: Message[],
  model: string,
  apiKey: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const msgs = messages.map(m => ({ role: m.role, content: m.content }));

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages: msgs, stream: true }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? `DeepSeek API error: ${res.status}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') break;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content ?? '';
        full += delta;
        onChunk(delta);
      } catch {
        // skip malformed lines
      }
    }
  }

  return full;
}
