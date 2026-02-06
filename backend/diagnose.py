"""
Ollama 连接诊断脚本
快速诊断 Ollama API 404 错误
"""
import requests
import json
import os
from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv()

print("=" * 60)
print("Ollama 连接诊断")
print("=" * 60)

# 1. 检查 Ollama 服务是否运行
print("\n1️⃣ 检查 Ollama 服务...")
try:
    response = requests.get("http://localhost:11434", timeout=2)
    if response.status_code == 200:
        print("   ✅ Ollama 服务正在运行")
    else:
        print(f"   ⚠️  Ollama 服务响应异常: {response.status_code}")
except Exception as e:
    print(f"   ❌ 无法连接到 Ollama 服务")
    print(f"   错误: {e}")
    print("\n   解决方案:")
    print("   1. 启动 Ollama: ollama serve")
    print("   2. 或者在 Windows 上双击 Ollama 图标")
    exit(1)

# 2. 检查已安装的模型
print("\n2️⃣ 检查已安装的模型...")
try:
    response = requests.get("http://localhost:11434/api/tags", timeout=5)
    if response.status_code == 200:
        data = response.json()
        models = data.get('models', [])
        
        if models:
            print(f"   ✅ 找到 {len(models)} 个模型:")
            for model in models:
                name = model.get('name', 'unknown')
                size = model.get('size', 0) / (1024**3)  # 转换为 GB
                print(f"      - {name} ({size:.2f} GB)")
        else:
            print("   ⚠️  未安装任何模型")
            print("\n   解决方案:")
            print("   ollama pull qwen2.5:7b")
    else:
        print(f"   ❌ 获取模型列表失败: {response.status_code}")
except Exception as e:
    print(f"   ❌ 检查模型失败: {e}")

# 3. 测试 generate API
print("\n3️⃣ 测试 Ollama generate API...")
# 从环境变量读取模型名称
test_model = os.getenv("MODEL_NAME", "qwen3:4b-instruct-2507-q4_K_M")

try:
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": test_model,
            "prompt": "你好",
            "stream": False
        },
        timeout=30
    )
    
    if response.status_code == 200:
        print(f"   ✅ API 测试成功")
        result = response.json()
        print(f"   响应: {result.get('response', '')[:50]}...")
    elif response.status_code == 404:
        print(f"   ❌ 404 错误 - 模型 '{test_model}' 未找到")
        print("\n   解决方案:")
        print(f"   ollama pull {test_model}")
        print("\n   或者使用其他已安装的模型，修改 .env 文件:")
        print("   MODEL_NAME=你的模型名称")
    else:
        print(f"   ❌ API 测试失败: {response.status_code}")
        print(f"   响应: {response.text}")
        
except requests.exceptions.Timeout:
    print(f"   ⚠️  请求超时（30秒）")
    print("   模型可能正在加载，请稍后再试")
except Exception as e:
    print(f"   ❌ API 测试失败: {e}")

# 4. 检查环境变量
print("\n4️⃣ 检查环境变量...")
ollama_api = os.getenv("OLLAMA_API", "http://localhost:11434/api/generate")
model_name = os.getenv("MODEL_NAME", "qwen3:4b-instruct-2507-q4_K_M")

print(f"   OLLAMA_API: {ollama_api}")
print(f"   MODEL_NAME: {model_name}")

# 检查 .env 文件是否存在
if os.path.exists(".env"):
    print(f"   ✅ .env 文件存在")
else:
    print(f"   ⚠️  .env 文件不存在")

# 5. 提供解决方案
print("\n" + "=" * 60)
print("诊断完成")
print("=" * 60)

print("\n📋 常见解决方案:")
print("\n1. 如果 Ollama 服务未运行:")
print("   ollama serve")

print("\n2. 如果模型未安装:")
print("   ollama pull qwen2.5:7b")
print("   或者:")
print("   ollama pull deepseek-coder:6.7b")
print("   ollama pull llama3.1:8b")

print("\n3. 如果想使用其他模型:")
print("   创建 .env 文件:")
print("   MODEL_NAME=你的模型名称")

print("\n4. 查看所有可用模型:")
print("   ollama list")

print("\n5. 测试 Ollama:")
print("   ollama run qwen2.5:7b")
print("   然后输入: 你好")

print("\n" + "=" * 60)
