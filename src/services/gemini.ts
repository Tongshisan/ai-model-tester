import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Message } from '../types';

export async function geminiChat(
  messages: Message[],
  model: string,
  apiKey: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const genModel = genAI.getGenerativeModel({ model });

  const history = messages.slice(0, -1)
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: m.image_url
        ? [
            { text: m.content },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: m.image_url.split(',')[1] ?? m.image_url,
              },
            },
          ]
        : [{ text: m.content }],
    }));

  const chat = genModel.startChat({ history });
  const lastMsg = messages[messages.length - 1];

  const parts = lastMsg.image_url
    ? [
        { text: lastMsg.content },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: lastMsg.image_url.includes(',')
              ? lastMsg.image_url.split(',')[1]
              : lastMsg.image_url,
          },
        },
      ]
    : lastMsg.content;

  const result = await chat.sendMessageStream(parts);

  let full = '';
  for await (const chunk of result.stream) {
    if (signal?.aborted) break;
    const delta = chunk.text();
    full += delta;
    onChunk(delta);
  }
  return full;
}

export async function geminiGenerateImage(
  prompt: string,
  apiKey: string
): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1 },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? 'Gemini image generation failed');
  }
  const data = await res.json();
  const b64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error('No image data returned');
  return `data:image/png;base64,${b64}`;
}
