# AI Model Tester

A playground for testing and comparing AI models across text chat and image generation tasks.

## Features

- **Text Chat**: Streaming chat with GPT-4o, Claude 3.5, Gemini 1.5 Pro, DeepSeek, GLM-4, Qwen
- **Image Generation**: Text-to-image with DALL-E 3, CogView-3, Wanx, Imagen
- **Image Editing**: Edit existing images with prompts (DALL-E 2)
- **Per-chat model switching**: Switch AI models for every new conversation
- **Chat history**: Saved to Supabase (or browser localStorage if not configured)
- **No login required**

## Supported Providers

| Provider  | Text                              | Image Gen      | Image Edit |
| --------- | --------------------------------- | -------------- | ---------- |
| OpenAI    | GPT-4o, GPT-4o Mini               | DALL-E 3       | DALL-E 2 ✓ |
| Anthropic | Claude 3.5 Sonnet, Claude 3 Haiku | —              | —          |
| Google    | Gemini 1.5 Pro, Flash             | Imagen 3       | —          |
| DeepSeek  | deepseek-chat, deepseek-reasoner  | —              | —          |
| 智谱 AI   | GLM-4 Plus, GLM-4 Flash           | CogView-3 Plus | —          |
| 通义千问  | Qwen Max, Qwen Plus               | Wanx v1        | —          |

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/Tongshisan/ai-model-tester.git
cd ai-model-tester
npm install
```

### 2. Configure Supabase (Optional)

If you want cloud-synced chat history:

1. Create a free project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/migrations/001_initial.sql` in Supabase SQL Editor
3. Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

If not configured, chat history is saved to browser localStorage.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Add API Keys

Click **"API Keys Settings"** in the sidebar and enter your API keys for the providers you want to use. Keys are stored only in your browser's localStorage.

- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Anthropic Console](https://console.anthropic.com/settings/keys)
- [Google AI Studio](https://aistudio.google.com/app/apikey)
- [DeepSeek Platform](https://platform.deepseek.com/api_keys)
- [智谱 AI](https://open.bigmodel.cn/usercenter/apikeys)
- [通义千问 / DashScope](https://dashscope.console.aliyun.com/apiKey)

## Development

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```
