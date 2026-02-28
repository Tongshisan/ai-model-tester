import type { Message } from "../types";

const CHAT_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const IMAGE_URL =
  "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis";

export async function qwenChat(
  messages: Message[],
  model: string,
  apiKey: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const msgs = messages.map((m) => ({ role: m.role, content: m.content }));

  const res = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages: msgs, stream: true }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? `Qwen API error: ${res.status}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let full = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") break;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content ?? "";
        full += delta;
        onChunk(delta);
      } catch {
        // skip malformed
      }
    }
  }
  return full;
}

export async function qwenGenerateImage(
  prompt: string,
  apiKey: string,
): Promise<string> {
  // Submit task
  const submitRes = await fetch(IMAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-DashScope-Async": "enable",
    },
    body: JSON.stringify({
      model: "wanx-v1",
      input: { prompt },
      parameters: { size: "1024*1024", n: 1 },
    }),
  });

  if (!submitRes.ok) {
    const err = await submitRes.json();
    throw new Error(err.message ?? "Qwen image generation failed");
  }

  const submitData = await submitRes.json();
  const taskId = submitData.output?.task_id;
  if (!taskId) throw new Error("No task ID returned");

  // Poll for result
  const pollUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const pollRes = await fetch(pollUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const pollData = await pollRes.json();
    const status = pollData.output?.task_status;
    if (status === "SUCCEEDED") {
      const url = pollData.output?.results?.[0]?.url;
      if (!url) throw new Error("No image URL in result");
      return url;
    }
    if (status === "FAILED") {
      throw new Error(pollData.output?.message ?? "Image generation failed");
    }
  }
  throw new Error("Image generation timed out");
}
