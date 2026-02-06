#!/bin/bash

echo "========================================"
echo "Starting Risk Assessment API Server"
echo "========================================"
echo ""

# 激活虚拟环境
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "Virtual environment activated"
else
    echo "Warning: Virtual environment not found"
    echo "Please run: python -m venv venv"
    exit 1
fi

# 检查 Ollama 是否运行
echo ""
echo "Checking Ollama service..."
if ! curl -s http://localhost:11434 > /dev/null 2>&1; then
    echo ""
    echo "WARNING: Ollama service is not running!"
    echo "Please start Ollama first: ollama serve"
    echo ""
    read -p "Press Enter to continue anyway..."
fi

# 启动风险评估 API
echo ""
echo "Starting Risk Assessment API on port 8001..."
echo ""
python risk_assessment_api.py
