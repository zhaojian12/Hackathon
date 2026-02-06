@echo off
echo ========================================
echo Starting Dispute Arbitration API Server
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

REM 启动争议仲裁 API
echo.
echo Starting Dispute Arbitration API on port 8002...
echo.
python dispute_arbitration_api.py

pause
