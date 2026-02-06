@echo off
echo ========================================
echo Starting Credit Score API Server
echo ========================================
echo.

REM 激活虚拟环境
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
    echo Virtual environment activated
) else (
    echo Warning: Virtual environment not found
    echo Please run: python -m venv venv
    pause
    exit /b 1
)

REM 检查 Ollama 是否运行
echo.
echo Checking Ollama service...
curl -s http://localhost:11434 >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Ollama service is not running!
    echo Please start Ollama first: ollama serve
    echo.
    pause
)

REM 启动信用评分 API
echo.
echo Starting Credit Score API on port 8003...
echo.
python credit_score_api.py

pause
