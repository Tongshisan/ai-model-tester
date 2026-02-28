import type { Message } from '../types';

const BASE_URL = 'https://open.bigmodel.cn/api/paas/v4';

export async function zhipuChat(
  messages: Message[],
  model: string,
  apiKey: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const msgs = messages.map(m => ({
    role: m.role,
    content: m.image_url
      ? [
          { type: 'image_url', image_url: { url: m.image_url } },
          { type: 'text', text: m.content },
        ]
      : m.content,
  }));

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
    throw new Error(err.error?.message ?? `Zhipu API error: ${res.status}`);
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
        // skip malformed
      }
    }
  }
  return full;
}

export async function zhipuGenerateImage(
  prompt: string,
  apiKey: string
): Promise<string> {
  const res = await fetch(`${BASE_URL}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: 'cogview-3-plus', prompt }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? 'Zhipu image generation failed');
  }

  const data = await res.json();
  const url = data.data?.[0]?.url;
  if (!url) throw new Error('No image URL returned');
  return url;
}
