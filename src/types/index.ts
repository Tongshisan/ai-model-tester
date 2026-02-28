export type ChatType = "text" | "image";

export type Provider =
  | "openai"
  | "anthropic"
  | "google"
  | "deepseek"
  | "zhipu"
  | "qwen";

export type MessageRole = "user" | "assistant" | "system";

export interface ModelConfig {
  id: string;
  name: string;
  provider: Provider;
  type: ChatType[];
  supportsImageInput?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  type: ChatType;
  provider: Provider;
  model: string;
  system_prompt?: string;
  created_at: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: MessageRole;
  content: string;
  image_url?: string;
  created_at: string;
}

export interface ApiKeys {
  openai?: string;
  anthropic?: string;
  google?: string;
  deepseek?: string;
  zhipu?: string;
  qwen?: string;
}

export const MODELS: ModelConfig[] = [
  // Text models
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    type: ["text"],
    supportsImageInput: true,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    type: ["text"],
    supportsImageInput: true,
  },
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    type: ["text"],
    supportsImageInput: true,
  },
  {
    id: "claude-3-haiku-20240307",
    name: "Claude 3 Haiku",
    provider: "anthropic",
    type: ["text"],
    supportsImageInput: true,
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    type: ["text"],
    supportsImageInput: true,
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "google",
    type: ["text"],
    supportsImageInput: true,
  },
  {
    id: "deepseek-chat",
    name: "DeepSeek Chat",
    provider: "deepseek",
    type: ["text"],
  },
  {
    id: "deepseek-reasoner",
    name: "DeepSeek Reasoner",
    provider: "deepseek",
    type: ["text"],
  },
  {
    id: "glm-4-plus",
    name: "GLM-4 Plus",
    provider: "zhipu",
    type: ["text"],
    supportsImageInput: true,
  },
  { id: "glm-4-flash", name: "GLM-4 Flash", provider: "zhipu", type: ["text"] },
  { id: "qwen-max", name: "Qwen Max", provider: "qwen", type: ["text"] },
  { id: "qwen-plus", name: "Qwen Plus", provider: "qwen", type: ["text"] },
  // Image models
  { id: "dall-e-3", name: "DALL-E 3", provider: "openai", type: ["image"] },
  {
    id: "cogview-3-plus",
    name: "CogView-3 Plus",
    provider: "zhipu",
    type: ["image"],
  },
  { id: "wanx-v1", name: "Wanx v1", provider: "qwen", type: ["image"] },
];

export const PROVIDER_NAMES: Record<Provider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  deepseek: "DeepSeek",
  zhipu: "智谱 AI",
  qwen: "通义千问",
};

export const PROVIDER_COLORS: Record<Provider, string> = {
  openai: "bg-emerald-600",
  anthropic: "bg-orange-600",
  google: "bg-blue-600",
  deepseek: "bg-indigo-600",
  zhipu: "bg-purple-600",
  qwen: "bg-cyan-600",
};
