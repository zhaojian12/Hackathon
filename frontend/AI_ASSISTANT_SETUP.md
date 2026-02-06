# Hackathon 前端 AI 助手集成指南

本文档说明如何在 Hackathon 前端项目中集成 AI 助手功能。

## 📋 前置要求

1. ✅ 后端 AI 服务器已启动（见 `../backend/README.md`）
2. ✅ 前端项目已安装依赖

## 🚀 快速集成

### 1. 创建 AI 服务

创建 `src/services/aiService.ts`：

```typescript
// src/services/aiService.ts
const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  choices: Array<{
    message: AIMessage;
    finish_reason: string;
  }>;
  model: string;
  inference_time: number;
}

/**
 * 向 AI 助手发送问题
 */
export async function askAI(question: string): Promise<string> {
  try {
    const response = await fetch(`${AI_API_URL}/v1/assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: question }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`AI 服务错误: ${response.status}`);
    }

    const data: AIResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI 请求失败:', error);
    throw error;
  }
}

/**
 * 多轮对话
 */
export async function chatWithAI(messages: AIMessage[]): Promise<string> {
  try {
    const response = await fetch(`${AI_API_URL}/v1/assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      throw new Error(`AI 服务错误: ${response.status}`);
    }

    const data: AIResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI 请求失败:', error);
    throw error;
  }
}

/**
 * 检查 AI 服务状态
 */
export async function checkAIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${AI_API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
```

### 2. 创建 AI 助手组件

创建 `src/components/AIAssistant.tsx`：

```typescript
// src/components/AIAssistant.tsx
import { useState, useRef, useEffect } from 'react';
import { askAI, AIMessage } from '../services/aiService';

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 快速问题
  const quickQuestions = [
    '如何连接钱包？',
    '如何获取测试币？',
    '交易需要多长时间？',
    '支持哪些钱包？'
  ];

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (question?: string) => {
    const userMessage = question || input.trim();
    if (!userMessage || isLoading) return;

    // 添加用户消息
    const newMessages: AIMessage[] = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // 调用 AI
      const answer = await askAI(userMessage);
      
      // 添加 AI 回答
      setMessages([
        ...newMessages,
        { role: 'assistant', content: answer }
      ]);
    } catch (error) {
      console.error('AI 请求失败:', error);
      setMessages([
        ...newMessages,
        { 
          role: 'assistant', 
          content: '抱歉，AI 服务暂时不可用。请稍后再试。' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 浮动按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* 对话窗口 */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-50">
          {/* 标题栏 */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <h3 className="font-bold">AI 助手</h3>
            <p className="text-sm opacity-90">有什么可以帮您？</p>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <p className="mb-4">👋 您好！我是 Hackathon 智能助手</p>
                <p className="text-sm">您可以问我关于平台的任何问题</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">正在思考...</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 快速问题 */}
          {messages.length === 0 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">快速问题：</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                    disabled={isLoading}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 输入框 */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="输入您的问题..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

### 3. 添加到主应用

在 `src/App.tsx` 中添加 AI 助手：

```typescript
import { AIAssistant } from './components/AIAssistant';

function App() {
  return (
    <div className="App">
      {/* 现有内容 */}
      
      {/* AI 助手 */}
      <AIAssistant />
    </div>
  );
}
```

### 4. 配置环境变量

在 `.env` 文件中添加：

```env
# AI 助手 API 地址
VITE_AI_API_URL=http://localhost:8000
```

## 🎨 样式优化（可选）

如果使用 Tailwind CSS，确保配置文件包含所需的类：

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 🧪 测试集成

### 1. 启动后端服务

```bash
cd ../backend
python ai_assistant_server.py
```

### 2. 启动前端服务

```bash
npm run dev
```

### 3. 测试功能

1. 打开浏览器访问 http://localhost:5173
2. 点击右下角的 AI 助手按钮
3. 尝试发送问题或点击快速问题

## 📱 移动端适配

添加响应式样式：

```typescript
// 修改 AIAssistant 组件的窗口样式
<div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] ...">
```

## 🔧 高级功能

### 1. 添加打字机效果

```typescript
const [displayedText, setDisplayedText] = useState('');

useEffect(() => {
  if (currentAnswer) {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(currentAnswer.slice(0, i));
      i++;
      if (i > currentAnswer.length) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }
}, [currentAnswer]);
```

### 2. 添加语音输入

```typescript
const startVoiceInput = () => {
  const recognition = new (window as any).webkitSpeechRecognition();
  recognition.lang = 'zh-CN';
  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    setInput(transcript);
  };
  recognition.start();
};
```

### 3. 保存对话历史

```typescript
// 保存到 localStorage
useEffect(() => {
  localStorage.setItem('ai_chat_history', JSON.stringify(messages));
}, [messages]);

// 加载历史
useEffect(() => {
  const saved = localStorage.getItem('ai_chat_history');
  if (saved) setMessages(JSON.parse(saved));
}, []);
```

## 🐛 故障排除

### 问题 1: CORS 错误

**解决方案：** 后端已配置 CORS，确保后端服务正在运行。

### 问题 2: 连接超时

**解决方案：** 增加超时时间或使用更小的模型。

### 问题 3: 样式不显示

**解决方案：** 确保 Tailwind CSS 已正确配置。

## 📚 相关资源

- [后端 API 文档](../backend/README.md)
- [React 文档](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**集成完成 ✅ | 版本 v1.0.0 | 2026-02-06**
