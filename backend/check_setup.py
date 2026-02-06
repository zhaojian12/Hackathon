"""
环境检查脚本
检查 Hackathon AI 助手所需的所有依赖和配置
"""
import sys
import subprocess
import platform

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)

def check_python():
    """检查 Python 版本"""
    print("\n🐍 检查 Python...")
    version = sys.version_info
    print(f"   Python 版本: {version.major}.{version.minor}.{version.micro}")
    
    if version.major >= 3 and version.minor >= 8:
        print("   ✅ Python 版本符合要求 (3.8+)")
        return True
    else:
        print("   ❌ Python 版本过低，需要 3.8+")
        return False

def check_pip():
    """检查 pip"""
    print("\n📦 检查 pip...")
    try:
        result = subprocess.run(
            ["pip", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            print(f"   {result.stdout.strip()}")
            print("   ✅ pip 可用")
            return True
        else:
            print("   ❌ pip 不可用")
            return False
    except Exception as e:
        print(f"   ❌ pip 检查失败: {e}")
        return False

def check_ollama():
    """检查 Ollama"""
    print("\n🤖 检查 Ollama...")
    try:
        result = subprocess.run(
            ["ollama", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            print(f"   {result.stdout.strip()}")
            print("   ✅ Ollama 已安装")
            return True
        else:
            print("   ❌ Ollama 未安装")
            return False
    except FileNotFoundError:
        print("   ❌ Ollama 未安装")
        print("   安装方法:")
        if platform.system() == "Windows":
            print("   - 访问 https://ollama.com/download/windows")
        elif platform.system() == "Darwin":
            print("   - brew install ollama")
        else:
            print("   - curl -fsSL https://ollama.com/install.sh | sh")
        return False
    except Exception as e:
        print(f"   ❌ Ollama 检查失败: {e}")
        return False

def check_ollama_service():
    """检查 Ollama 服务是否运行"""
    print("\n🔌 检查 Ollama 服务...")
    try:
        import requests
        response = requests.get("http://localhost:11434", timeout=2)
        if response.status_code == 200:
            print("   ✅ Ollama 服务正在运行")
            return True
        else:
            print("   ⚠️  Ollama 服务响应异常")
            return False
    except:
        print("   ❌ Ollama 服务未运行")
        print("   启动方法: ollama serve")
        return False

def check_ollama_models():
    """检查已安装的模型"""
    print("\n📚 检查 Ollama 模型...")
    try:
        result = subprocess.run(
            ["ollama", "list"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            output = result.stdout.strip()
            if output:
                print("   已安装的模型:")
                for line in output.split('\n')[1:]:  # 跳过标题行
                    if line.strip():
                        print(f"   - {line.split()[0]}")
                
                # 检查推荐模型
                recommended = ["qwen2.5:7b", "deepseek-coder:6.7b", "llama3.1:8b"]
                found = False
                for model in recommended:
                    if model in output:
                        print(f"   ✅ 找到推荐模型: {model}")
                        found = True
                        break
                
                if not found:
                    print("   ⚠️  未找到推荐模型")
                    print("   建议安装: ollama pull qwen2.5:7b")
                
                return True
            else:
                print("   ⚠️  未安装任何模型")
                print("   建议安装: ollama pull qwen2.5:7b")
                return False
        else:
            print("   ❌ 无法获取模型列表")
            return False
    except Exception as e:
        print(f"   ❌ 模型检查失败: {e}")
        return False

def check_dependencies():
    """检查 Python 依赖"""
    print("\n📋 检查 Python 依赖...")
    
    required = {
        "flask": "Flask",
        "flask_cors": "Flask-CORS",
        "requests": "requests"
    }
    
    all_installed = True
    for module, name in required.items():
        try:
            __import__(module)
            print(f"   ✅ {name}")
        except ImportError:
            print(f"   ❌ {name} 未安装")
            all_installed = False
    
    if not all_installed:
        print("\n   安装方法: pip install -r requirements.txt")
    
    return all_installed

def check_port():
    """检查端口是否可用"""
    print("\n🔌 检查端口 8000...")
    try:
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('localhost', 8000))
        sock.close()
        
        if result == 0:
            print("   ⚠️  端口 8000 已被占用")
            print("   可以修改 .env 中的 PORT 配置")
            return False
        else:
            print("   ✅ 端口 8000 可用")
            return True
    except Exception as e:
        print(f"   ⚠️  端口检查失败: {e}")
        return True  # 假设可用

def print_summary(results):
    """打印总结"""
    print_header("检查总结")
    
    total = len(results)
    passed = sum(results.values())
    
    print(f"\n总计: {passed}/{total} 项检查通过\n")
    
    for check, status in results.items():
        icon = "✅" if status else "❌"
        print(f"{icon} {check}")
    
    if passed == total:
        print("\n🎉 所有检查通过！可以启动服务器了。")
        print("\n启动命令:")
        if platform.system() == "Windows":
            print("   start_server.bat")
        else:
            print("   ./start_server.sh")
    else:
        print("\n⚠️  部分检查未通过，请先解决上述问题。")
        print("\n详细文档:")
        print("   - backend/README.md")
        print("   - backend/快速开始.md")

def main():
    print_header("Hackathon AI 助手环境检查")
    print(f"\n操作系统: {platform.system()} {platform.release()}")
    print(f"架构: {platform.machine()}")
    
    results = {
        "Python 3.8+": check_python(),
        "pip": check_pip(),
        "Ollama 安装": check_ollama(),
        "Ollama 服务": check_ollama_service(),
        "Ollama 模型": check_ollama_models(),
        "Python 依赖": check_dependencies(),
        "端口 8000": check_port()
    }
    
    print_summary(results)

if __name__ == "__main__":
    main()
