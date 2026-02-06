# Hackathon AI 助手后端

基于 Ollama 的本地 AI 助手服务，为 Hackathon 去中心化交易平台提供智能客服功能。

## ✨ 特性

- 🤖 **本地推理**：使用 Ollama 在本地运行 AI 模型，保护隐私
- 🚀 **快速响应**：通常 5-15 秒内完成回答
- 💰 **零成本**：无需 API 密钥，完全免费
- 🌐 **OpenAI 兼容**：提供 OpenAI 格式的 API 接口
- 🔧 **易于配置**：支持多种开源模型

## 📋 前置要求

### 1. 安装 Python
- Python 3.8 或更高版本
- pip 包管理器

### 2. 安装 Ollama

**Windows:**
```bash
# 下载并安装
https://ollama.com/download/windows
```

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 3. 拉取 AI 模型

推荐使用 Qwen2.5（默认）：
```bash
ollama pull qwen2.5:7b
```

其他可选模型：
```bash
# DeepSeek Coder（适合代码相关问题）
ollama pull deepseek-coder:6.7b

# Llama 3.1（通用对话）
ollama pull llama3.1:8b

# Mistral（轻量级）
ollama pull mistral:7b
```

## 🚀 快速开始

### 环境检查（推荐）

在启动服务器之前，建议先运行环境检查脚本：

```bash
cd Hackathon/backend
python check_setup.py
```

这会检查：
- ✅ Python 版本
- ✅ Ollama 安装和服务状态
- ✅ 已安装的模型
- ✅ Python 依赖
- ✅ 端口可用性

### Windows

1. **启动 Ollama 服务**（如果未自动启动）
```bash
ollama serve
```

2. **运行启动脚本**
```bash
cd Hackathon/backend
start_server.bat
```

### macOS/Linux

1. **启动 Ollama 服务**
```bash
ollama serve
```

2. **运行启动脚本**
```bash
cd Hackathon/backend
chmod +x start_server.sh
./start_server.sh
```

### 手动启动

```bash
# 1. 创建虚拟环境
python -m venv venv

# 2. 激活虚拟环境
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 3. 安装依赖
pip install -r requirements.txt

# 4. 启动服务器
python ai_assistant_server.py
```

## 🔧 配置

### 环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

可配置项：
```env
# Ollama API 地址
OLLAMA_API=http://localhost:11434/api/generate

# 使用的模型名称
MODEL_NAME=qwen2.5:7b

# 服务器配置
HOST=0.0.0.0
PORT=8000
```

### 切换模型

修改 `.env` 文件中的 `MODEL_NAME`，或在启动时设置环境变量：

```bash
# Windows
set MODEL_NAME=deepseek-coder:6.7b
python ai_assistant_server.py

# macOS/Linux
MODEL_NAME=deepseek-coder:6.7b python ai_assistant_server.py
```

## 📡 API 接口

### 1. 健康检查
```http
GET http://localhost:8000/health
```

响应：
```json
{
  "status": "ok",
  "engine": "Ollama",
  "model": "qwen2.5:7b",
  "ollama_status": "running",
  "timestamp": "2026-02-06T10:30:00"
}
```

### 2. AI 助手对话
```http
POST http://localhost:8000/v1/assistant/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "如何连接钱包？"
    }
  ]
}
```

响应：
```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "连接钱包的步骤如下：\n1. 点击页面右上角..."
    },
    "finish_reason": "stop"
  }],
  "model": "qwen2.5:7b",
  "inference_time": 8.5
}
```

### 3. OpenAI 兼容接口
```http
POST http://localhost:8000/v1/chat/completions
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "什么是去中心化交易？"
    }
  ]
}
```

## 🧪 测试

### 使用 curl 测试

```bash
# 健康检查
curl http://localhost:8000/health

# AI 对话
curl -X POST http://localhost:8000/v1/assistant/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "如何获取测试币？"}
    ]
  }'
```

### 使用 Python 测试

```python
import requests

response = requests.post(
    "http://localhost:8000/v1/assistant/chat",
    json={
        "messages": [
            {"role": "user", "content": "交易需要多长时间？"}
        ]
    }
)

print(response.json()["choices"][0]["message"]["content"])
```

## 🔍 故障排除

### 问题 1: Ollama 服务未运行
```
❌ 错误: 无法连接到 Ollama 服务
```

**解决方案：**
```bash
# 启动 Ollama
ollama serve

# 或者在 Windows 上双击 Ollama 图标
```

### 问题 2: 模型未找到
```
⚠️ 警告: 模型 qwen2.5:7b 未找到
```

**解决方案：**
```bash
# 拉取模型
ollama pull qwen2.5:7b

# 查看已安装的模型
ollama list
```

### 问题 3: 推理超时
```
❌ 推理超时（120秒）
```

**解决方案：**
- 使用更小的模型（如 `mistral:7b`）
- 确保有足够的内存（建议 8GB+）
- 如果有 GPU，确保 Ollama 正确使用 GPU

### 问题 4: 端口被占用
```
❌ Address already in use
```

**解决方案：**
```bash
# 修改 .env 中的 PORT
PORT=8001

# 或者找到并关闭占用端口的进程
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :8000
kill -9 <PID>
```

## 📊 性能优化

### 1. 使用 GPU 加速

Ollama 会自动检测并使用 GPU。确保已安装：
- NVIDIA GPU: CUDA 驱动
- AMD GPU: ROCm 驱动
- Apple Silicon: 自动支持

### 2. 调整模型大小

根据硬件选择合适的模型：
- **8GB RAM**: `mistral:7b`, `qwen2.5:7b`
- **16GB RAM**: `llama3.1:8b`, `deepseek-coder:6.7b`
- **32GB+ RAM**: 更大的模型

### 3. 优化推理参数

在 `ai_assistant_server.py` 中调整：
```python
"options": {
    "temperature": 0.7,      # 降低可提高一致性
    "num_predict": 800,      # 减少可加快速度
    "top_p": 0.9,
    "top_k": 40
}
```

## 🔗 集成到前端

在前端项目中调用 AI 助手：

```typescript
// src/services/aiService.ts
export async function askAI(question: string) {
  const response = await fetch('http://localhost:8000/v1/assistant/chat', {
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
  
  const data = await response.json();
  return data.choices[0].message.content;
}
```

## 📚 相关资源

- [Ollama 官网](https://ollama.com/)
- [Ollama 模型库](https://ollama.com/library)
- [Flask 文档](https://flask.palletsprojects.com/)
- [Hackathon 项目文档](../README.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**注意**：本服务仅用于开发和测试环境。生产环境请考虑使用专业的 AI 服务。
