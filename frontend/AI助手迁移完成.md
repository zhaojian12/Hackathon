# Hackathon 前端 AI 助手迁移完成

## ✅ 已完成的修改

### 1. 创建新的 AI 服务模块

**文件**: `src/lib/ai-service.ts`

替代了原来的 `coze-api.ts`，使用本地 Ollama 后端：

```typescript
// 旧的 Coze API
import { sendCozeMessageStream } from '../lib/coze-api';

// 新的本地 AI 服务
import { sendAIMessageStream, type AIMessage } from '../lib/ai-service';
```

**主要功能**:
- ✅ `sendAIMessage()` - 发送消息（非流式）
- ✅ `sendAIMessageStream()` - 发送消息（流式）
- ✅ `checkAIServiceHealth()` - 健康检查
- ✅ 支持对话历史管理
- ✅ 模拟流式输出效果

### 2. 更新 PopupAssistant 组件

**文件**: `src/components/PopupAssistant.tsx`

**主要修改**:
- ✅ 导入新的 AI 服务模块
- ✅ 移除 Coze 相关的 userId 和 conversation_id
- ✅ 添加对话历史管理 (`conversationHistory`)
- ✅ 更新快速问题为中文
- ✅ 更新占位符文本为中文
- ✅ 更新 "Powered by" 文本为 "Ollama (本地推理)"
- ✅ 更新欢迎消息为中文

### 3. 更新环境变量

**文件**: `.env`

```env
# 新配置
VITE_AI_API_URL=http://localhost:8000

# 旧配置（已注释）
# VITE_COZE_API_TOKEN=...
# VITE_COZE_BOT_ID=...
```

## 📊 对比

### API 调用对比

**旧的 Coze API**:
```typescript
await sendCozeMessageStream(
  userMessage,
  userId,
  (chunk: string) => {
    // 处理流式响应
  }
);
```

**新的本地 AI 服务**:
```typescript
await sendAIMessageStream(
  userMessage,
  conversationHistory,
  (chunk: string) => {
    // 处理流式响应
  }
);
```

### 主要区别

| 特性 | Coze API | 本地 Ollama |
|------|----------|-------------|
| **API 地址** | https://api.coze.cn | http://localhost:8000 |
| **认证** | 需要 API Token | 无需认证 |
| **会话管理** | conversation_id | 对话历史数组 |
| **成本** | 按使用付费 | 完全免费 |
| **隐私** | 云端处理 | 本地处理 |
| **网络依赖** | 需要互联网 | 仅本地 |

## 🚀 使用方法

### 1. 启动后端服务

```bash
cd Hackathon/backend
python check_setup.py  # 检查环境
start_server.bat        # Windows
./start_server.sh       # macOS/Linux
```

### 2. 启动前端服务

```bash
cd Hackathon/frontend
npm run dev
```

### 3. 测试 AI 助手

1. 打开浏览器访问 http://localhost:5173
2. 点击右下角的 AI 助手按钮
3. 尝试发送问题或点击快速问题

## 🔧 配置选项

### 修改 API 地址

如果后端运行在不同的端口，修改 `.env` 文件：

```env
VITE_AI_API_URL=http://localhost:8001
```

### 自定义快速问题

编辑 `src/components/PopupAssistant.tsx`：

```typescript
const quickActions = [
  '你的问题 1',
  '你的问题 2',
  '你的问题 3',
  '你的问题 4'
];
```

### 自定义欢迎消息

```typescript
const [messages, setMessages] = useState<Message[]>([
  { id: 1, text: '你的欢迎消息', sender: 'assistant' }
]);
```

## 🐛 故障排除

### 问题 1: AI 服务连接失败

**症状**: 控制台显示 "AI 服务请求失败"

**解决方案**:
1. 确保后端服务正在运行
2. 检查 `.env` 中的 `VITE_AI_API_URL` 配置
3. 访问 http://localhost:8000/health 验证后端状态

### 问题 2: CORS 错误

**症状**: 浏览器控制台显示 CORS 错误

**解决方案**:
后端已配置 CORS，确保：
1. 后端服务正在运行
2. 使用正确的 API 地址
3. 前端和后端都在本地运行

### 问题 3: 响应缓慢

**症状**: AI 回答需要很长时间

**解决方案**:
1. 首次推理会较慢（10-20 秒），后续会快很多
2. 使用更小的模型（如 `mistral:7b`）
3. 确保有足够内存（8GB+）

### 问题 4: 环境变量不生效

**症状**: 修改 `.env` 后没有变化

**解决方案**:
```bash
# 重启开发服务器
npm run dev
```

## 📝 代码示例

### 基本用法

```typescript
import { sendAIMessage } from '../lib/ai-service';

// 发送单个消息
const response = await sendAIMessage('如何连接钱包？');
console.log(response);
```

### 流式响应

```typescript
import { sendAIMessageStream } from '../lib/ai-service';

// 流式发送消息
await sendAIMessageStream(
  '交易需要多长时间？',
  [],
  (chunk) => {
    console.log('收到片段:', chunk);
  }
);
```

### 带对话历史

```typescript
import { sendAIMessage, type AIMessage } from '../lib/ai-service';

const history: AIMessage[] = [
  { role: 'user', content: '你好' },
  { role: 'assistant', content: '你好！有什么可以帮您？' }
];

const response = await sendAIMessage('如何获取测试币？', history);
```

### 健康检查

```typescript
import { checkAIServiceHealth } from '../lib/ai-service';

const isHealthy = await checkAIServiceHealth();
if (isHealthy) {
  console.log('AI 服务正常');
} else {
  console.log('AI 服务不可用');
}
```

## 🔄 回退到 Coze API（如需要）

如果需要回退到 Coze API：

1. **恢复导入**:
```typescript
import { sendCozeMessageStream } from '../lib/coze-api';
```

2. **恢复环境变量**:
```env
VITE_COZE_API_TOKEN=pat_WJ5FR3tNmpJzbEZEBag90ZaSiwcnLfjXYA0EU0P9In2TbYdTn69jT3mQSx6ARU6W
VITE_COZE_BOT_ID=7601931254321381422
```

3. **恢复组件代码**:
```typescript
const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`);

await sendCozeMessageStream(
  userMessage,
  userId,
  (chunk: string) => {
    // ...
  }
);
```

## 📚 相关文档

- [AI 助手后端文档](../backend/README.md)
- [完整启动指南](../启动AI助手完整指南.md)
- [前端集成指南](./AI_ASSISTANT_SETUP.md)
- [技术总结](../AI_ASSISTANT_INTEGRATION.md)

## ✅ 验收清单

- [x] 创建新的 AI 服务模块
- [x] 更新 PopupAssistant 组件
- [x] 更新环境变量配置
- [x] 移除 Coze API 依赖
- [x] 添加对话历史管理
- [x] 更新为中文界面
- [x] 测试基本功能

## 🎯 下一步

1. ✅ 启动后端服务
2. ✅ 启动前端服务
3. ✅ 测试 AI 对话功能
4. ⏳ 根据需要调整快速问题
5. ⏳ 优化用户体验

---

**迁移完成 ✅ | 版本 v1.0.0 | 2026-02-06**

**从**: Coze API (https://api.coze.cn)  
**到**: 本地 Ollama (http://localhost:8000)  
**开发者**: Kiro AI Assistant
