@echo off
chcp 65001 >nul
echo ========================================
echo Hackathon AI 助手服务器启动脚本
echo ========================================
echo.

REM 检查 Python 是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 Python
    echo    请先安装 Python 3.8+
    pause
    exit /b 1
)

REM 检查是否在虚拟环境中
if not defined VIRTUAL_ENV (
    echo 📦 检查虚拟环境...
    if not exist venv (
        echo 创建虚拟环境...
        python -m venv venv
    )
    echo 激活虚拟环境...
    call venv\Scripts\activate.bat
)

REM 安装依赖
echo.
echo 📦 安装 Python 依赖...
pip install -r requirements.txt

REM 检查 Ollama 是否运行
echo.
echo 🔍 检查 Ollama 服务...
curl -s http://localhost:11434 >nul 2>&1
if errorlevel 1 (
    echo ⚠️  警告: Ollama 服务未运行
    echo    请先启动 Ollama: ollama serve
    echo    或者拉取模型: ollama pull qwen2.5:7b
    echo.
    echo 是否继续启动服务器？ (Y/N)
    set /p continue=
    if /i not "%continue%"=="Y" exit /b 1
)

REM 启动服务器
echo.
echo 🚀 启动 AI 助手服务器...
echo ========================================
python ai_assistant_server.py

pause
