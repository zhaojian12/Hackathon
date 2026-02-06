#!/bin/bash

echo "========================================"
echo "Hackathon AI 助手服务器启动脚本"
echo "========================================"
echo ""

# 检查 Python 是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 Python3"
    echo "   请先安装 Python 3.8+"
    exit 1
fi

# 检查是否在虚拟环境中
if [ -z "$VIRTUAL_ENV" ]; then
    echo "📦 检查虚拟环境..."
    if [ ! -d "venv" ]; then
        echo "创建虚拟环境..."
        python3 -m venv venv
    fi
    echo "激活虚拟环境..."
    source venv/bin/activate
fi

# 安装依赖
echo ""
echo "📦 安装 Python 依赖..."
pip install -r requirements.txt

# 检查 Ollama 是否运行
echo ""
echo "🔍 检查 Ollama 服务..."
if ! curl -s http://localhost:11434 > /dev/null 2>&1; then
    echo "⚠️  警告: Ollama 服务未运行"
    echo "   请先启动 Ollama: ollama serve"
    echo "   或者拉取模型: ollama pull qwen2.5:7b"
    echo ""
    read -p "是否继续启动服务器？ (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 启动服务器
echo ""
echo "🚀 启动 AI 助手服务器..."
echo "========================================"
python3 ai_assistant_server.py
