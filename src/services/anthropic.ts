import Anthropic from '@anthropic-ai/sdk';
import type { Message } from '../types';

export async function anthropicChat(
  messages: Message[],
  model: string,
  apiKey: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const msgs: Anthropic.MessageParam[] = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.image_url
        ? [
            {
              type: 'image' as const,
              source: {
                type: 'url' as const,
                url: m.image_url,
              },
            },
            { type: 'text' as const, text: m.content },
          ]
        : m.content,
    }));

  const systemMsg = messages.find(m => m.role === 'system')?.content;

  const stream = await client.messages.stream({
    model,
    max_tokens: 4096,
    system: systemMsg,
    messages: msgs,
  });

  if (signal) {
    signal.addEventListener('abort', () => stream.abort());
  }

  let full = '';
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      const delta = event.delta.text;
      full += delta;
      onChunk(delta);
    }
  }
  return full;
}
