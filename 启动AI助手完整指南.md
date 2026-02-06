# Hackathon AI 助手 - 完整启动指南

## 🎯 目标

将 Hackathon 项目的 AI 助手从 OpenAI 切换到 Ollama 本地推理引擎，实现：
- ✅ 零 API 成本
- ✅ 本地推理，保护隐私
- ✅ 快速响应（5-15 秒）
- ✅ 中文友好

## 📋 准备工作清单

### 必需软件
- [ ] Python 3.8 或更高版本
- [ ] pip 包管理器
- [ ] Ollama（AI 推理引擎）
- [ ] 8GB+ 内存（推荐 16GB）
- [ ] 10GB+ 可用磁盘空间

### 可选（提升性能）
- [ ] NVIDIA GPU + CUDA 驱动
- [ ] AMD GPU + ROCm 驱动
- [ ] Apple Silicon（自动支持）

## 🚀 完整安装步骤

### 第一步：安装 Ollama

#### Windows 用户
1. 访问 https://ollama.com/download/windows
2. 下载安装程序
3. 运行安装程序，使用默认选项
4. 安装完成后，Ollama 会自动启动

#### macOS 用户
```bash
# 使用 Homebrew 安装
brew install ollama

# 启动服务
ollama serve
```

#### Linux 用户
```bash
# 一键安装
curl -fsSL https://ollama.com/install.sh | sh

# 启动服务
ollama serve
```

### 第二步：下载 AI 模型

打开终端/命令提示符，运行：

```bash
# 推荐：Qwen2.5（中文友好，速度快）
ollama pull qwen2.5:7b
```

**其他可选模型：**
```bash
# DeepSeek Coder（代码相关问题更好）
ollama pull deepseek-coder:6.7b

# Llama 3.1（通用对话）
ollama pull llama3.1:8b

# Mistral（轻量级，适合低配置）
ollama pull mistral:7b
```

**下载时间：** 约 5-10 分钟（取决于网速）

### 第三步：环境检查

```bash
# 进入后端目录
cd Hackathon/backend

# 运行环境检查脚本
python check_setup.py
```

**预期输出：**
```
========================================
  Hackathon AI 助手环境检查
========================================

🐍 检查 Python...
   ✅ Python 版本符合要求 (3.8+)

📦 检查 pip...
   ✅ pip 可用

🤖 检查 Ollama...
   ✅ Ollama 已安装

🔌 检查 Ollama 服务...
   ✅ Ollama 服务正在运行

📚 检查 Ollama 模型...
   ✅ 找到推荐模型: qwen2.5:7b

📋 检查 Python 依赖...
   ✅ Flask
   ✅ Flask-CORS
   ✅ requests

🔌 检查端口 8000...
   ✅ 端口 8000 可用

========================================
  检查总结
========================================

总计: 7/7 项检查通过

🎉 所有检查通过！可以启动服务器了。
```

**如果有错误：** 根据提示解决问题后重新运行检查。

### 第四步：启动后端服务

#### 方法 1：使用启动脚本（推荐）

**Windows:**
```bash
cd Hackathon\backend
start_server.bat
```

**macOS/Linux:**
```bash
cd Hackathon/backend
chmod +x start_server.sh
./start_server.sh
```

#### 方法 2：手动启动

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

**预期输出：**
```
============================================================
Hackathon AI 助手服务器
推理引擎: Ollama
模型: qwen2.5:7b
API: http://localhost:11434/api/generate
============================================================

============================================================
🚀 Hackathon AI 助手服务器启动成功！
============================================================
📡 API 地址: http://localhost:8000
🔗 健康检查: http://localhost:8000/health
💬 对话接口: http://localhost:8000/v1/assistant/chat
============================================================

🔍 检查 Ollama 服务状态...
✅ Ollama 服务正常运行
✅ 模型 qwen2.5:7b 已就绪

============================================================
服务器运行中... 按 Ctrl+C 停止
============================================================

 * Serving Flask app 'ai_assistant_server'
 * Running on http://0.0.0.0:8000
```

### 第五步：测试 API

#### 测试 1：健康检查

打开浏览器访问：http://localhost:8000/health

**预期响应：**
```json
{
  "status": "ok",
  "engine": "Ollama",
  "model": "qwen2.5:7b",
  "ollama_status": "running",
  "timestamp": "2026-02-06T10:30:00"
}
```

#### 测试 2：运行测试脚本

打开新的终端窗口：

```bash
cd Hackathon/backend
python test_api.py
```

**预期输出：**
```
============================================================
Hackathon AI 助手 API 测试
============================================================

测试 1: 健康检查
============================================================
状态码: 200
响应: {
  "status": "ok",
  "engine": "Ollama",
  "model": "qwen2.5:7b",
  "ollama_status": "running"
}

✅ 健康检查通过

测试 2: AI 对话 - 你好，请介绍一下 Hackathon 平台
============================================================
状态码: 200

问题: 你好，请介绍一下 Hackathon 平台

回答:
您好！Hackathon 是一个基于 Conflux 区块链的去中心化交易平台...

推理时间: 8.5 秒
模型: qwen2.5:7b
```

#### 测试 3：使用 curl

```bash
# 测试对话
curl -X POST http://localhost:8000/v1/assistant/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"如何连接钱包？"}]}'
```

## 🎨 前端集成（可选）

如果需要在前端添加 AI 助手界面，参考：
- `frontend/AI_ASSISTANT_SETUP.md` - 详细集成指南
- 包含完整的 React 组件代码
- 包含样式和交互示例

## 🔧 配置选项

### 切换模型

编辑 `backend/.env` 文件（从 `.env.example` 复制）：

```env
# 使用不同的模型
MODEL_NAME=deepseek-coder:6.7b

# 或者
MODEL_NAME=llama3.1:8b
```

### 修改端口

```env
PORT=8001
```

### 调整推理参数

编辑 `ai_assistant_server.py`：

```python
"options": {
    "temperature": 0.7,      # 0.0-1.0，越低越确定
    "num_predict": 800,      # 最大生成长度
    "top_p": 0.9,           # 核采样
    "top_k": 40             # Top-K 采样
}
```

## 🐛 常见问题解决

### 问题 1: Ollama 服务未运行

**症状：**
```
❌ 错误: 无法连接到 Ollama
```

**解决方案：**
```bash
# 启动 Ollama
ollama serve

# 或者在 Windows 上双击 Ollama 图标
```

### 问题 2: 模型未找到

**症状：**
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

**症状：**
```
❌ 推理超时（120秒）
```

**解决方案：**
1. 使用更小的模型：`ollama pull mistral:7b`
2. 确保有足够内存（8GB+）
3. 关闭其他占用内存的程序
4. 如果有 GPU，确保驱动正确安装

### 问题 4: 端口被占用

**症状：**
```
❌ Address already in use
```

**解决方案：**

**Windows:**
```bash
# 查找占用端口的进程
netstat -ano | findstr :8000

# 结束进程
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# 查找占用端口的进程
lsof -i :8000

# 结束进程
kill -9 <PID>
```

或者修改 `.env` 中的端口。

### 问题 5: Python 依赖安装失败

**解决方案：**
```bash
# 升级 pip
python -m pip install --upgrade pip

# 使用国内镜像（中国用户）
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

## 📊 性能优化建议

### 1. 使用 GPU 加速

Ollama 会自动检测并使用 GPU。确保已安装：
- **NVIDIA GPU**: CUDA 驱动
- **AMD GPU**: ROCm 驱动
- **Apple Silicon**: 自动支持

### 2. 选择合适的模型

| 模型 | 大小 | 内存需求 | 速度 | 适用场景 |
|------|------|----------|------|----------|
| mistral:7b | 4GB | 8GB | 快 | 低配置 |
| qwen2.5:7b | 4.5GB | 8GB | 中 | 中文对话 |
| deepseek-coder:6.7b | 4GB | 8GB | 中 | 代码问题 |
| llama3.1:8b | 4.7GB | 16GB | 慢 | 通用对话 |

### 3. 调整系统设置

**Windows:**
- 设置环境变量 `OLLAMA_NUM_PARALLEL=2` 允许并发请求
- 设置 `OLLAMA_MAX_LOADED_MODELS=2` 同时加载多个模型

**macOS/Linux:**
```bash
export OLLAMA_NUM_PARALLEL=2
export OLLAMA_MAX_LOADED_MODELS=2
```

## 📚 相关文档

### 项目文档
- [后端 README](./backend/README.md) - 完整的后端文档
- [快速开始](./backend/快速开始.md) - 中文快速指南
- [前端集成](./frontend/AI_ASSISTANT_SETUP.md) - 前端集成指南
- [集成总结](./AI_ASSISTANT_INTEGRATION.md) - 技术总结

### 外部资源
- [Ollama 官网](https://ollama.com/)
- [Ollama GitHub](https://github.com/ollama/ollama)
- [Ollama 模型库](https://ollama.com/library)
- [Flask 文档](https://flask.palletsprojects.com/)

## ✅ 验收清单

完成以下所有项目即表示安装成功：

- [ ] Ollama 已安装并运行
- [ ] 至少一个 AI 模型已下载
- [ ] 环境检查脚本全部通过
- [ ] 后端服务器成功启动
- [ ] 健康检查接口返回正常
- [ ] 测试脚本运行成功
- [ ] AI 对话功能正常工作

## 🎉 下一步

1. **集成到前端**
   - 参考 `frontend/AI_ASSISTANT_SETUP.md`
   - 创建 AI 助手组件
   - 测试完整流程

2. **自定义配置**
   - 调整模型参数
   - 优化提示词
   - 添加新功能

3. **部署到生产**
   - 使用 Gunicorn/uWSGI
   - 配置反向代理
   - 添加监控和日志

## 💡 提示

- 首次推理会较慢（10-20 秒），因为需要加载模型
- 模型会在内存中保留 5 分钟，频繁使用时速度更快
- 可以同时运行多个模型，但会占用更多内存
- 定期更新 Ollama 和模型以获得最佳性能

## 🤝 获取帮助

如果遇到问题：
1. 查看本文档的"常见问题解决"部分
2. 运行 `python check_setup.py` 诊断问题
3. 查看 `backend/README.md` 获取详细信息
4. 提交 GitHub Issue

---

**开发完成 ✅ | 版本 v1.0.0 | 2026-02-06**

**参考项目**: coconut-RustSentinel  
**技术栈**: Flask + Ollama + Qwen2.5  
**开发者**: Kiro AI Assistant
