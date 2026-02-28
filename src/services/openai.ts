import OpenAI from "openai";
import type { Message } from "../types";

function getClient(apiKey: string) {
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

export async function openaiChat(
  messages: Message[],
  model: string,
  apiKey: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const client = getClient(apiKey);

  const msgs: OpenAI.Chat.ChatCompletionMessageParam[] = messages.map((m) => {
    if (m.image_url && m.role === "user") {
      return {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: m.image_url } },
          { type: "text", text: m.content },
        ],
      };
    }
    return {
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    };
  });

  const stream = await client.chat.completions.create(
    {
      model,
      messages: msgs,
      stream: true,
    },
    { signal },
  );

  let full = "";
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? "";
    full += delta;
    onChunk(delta);
  }
  return full;
}

export async function openaiGenerateImage(
  prompt: string,
  apiKey: string,
): Promise<string> {
  const client = getClient(apiKey);
  const res = await client.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
  });
  const url = res.data?.[0]?.url;
  if (!url) throw new Error("No image URL returned");
  return url;
}

export async function openaiEditImage(
  imageBase64: string,
  maskBase64: string | null,
  prompt: string,
  apiKey: string,
): Promise<string> {
  const client = getClient(apiKey);

  function base64ToFile(b64: string, name: string): File {
    const arr = b64.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
    return new File([u8arr], name, { type: mime });
  }

  const imageFile = base64ToFile(imageBase64, "image.png");

  const params: OpenAI.Images.ImageEditParams = {
    model: "dall-e-2",
    image: imageFile,
    prompt,
    n: 1,
    size: "1024x1024",
  };

  if (maskBase64) {
    params.mask = base64ToFile(maskBase64, "mask.png");
  }

  const res = await client.images.edit(params);
  const url = res.data?.[0]?.url;
  if (!url) throw new Error("No image URL returned");
  return url;
}
