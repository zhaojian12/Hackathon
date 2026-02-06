"""
Hackathon AI 助手服务器 - 使用 Ollama 本地推理
基于 coconut-RustSentinel 的实现，适配 Hackathon 项目
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Ollama API 配置
OLLAMA_API = os.getenv("OLLAMA_API", "http://localhost:11434/api/generate")
MODEL_NAME = os.getenv("MODEL_NAME", "qwen2.5:7b")

print("=" * 60)
print("Hackathon AI 助手服务器")
print(f"推理引擎: Ollama")
print(f"模型: {MODEL_NAME}")
print(f"API: {OLLAMA_API}")
print("=" * 60)

@app.route('/health', methods=['GET'])
def health():
    """健康检查接口"""
    # 检查 Ollama 是否运行
    try:
        response = requests.get("http://localhost:11434", timeout=2)
        ollama_status = "running" if response.status_code == 200 else "error"
    except:
        ollama_status = "not running"
    
    return jsonify({
        "status": "ok",
        "engine": "Ollama",
        "model": MODEL_NAME,
        "ollama_status": ollama_status,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/v1/assistant/chat', methods=['POST'])
def assistant_chat():
    """
    AI 助手对话接口
    用于回答用户关于 Hackathon 去中心化交易平台的问题
    """
    data = request.json
    messages = data.get('messages', [])
    
    if not messages:
        return jsonify({"error": "消息不能为空"}), 400
    
    # 构建 Hackathon 平台专用提示词
    system_prompt = """你是 Hackathon 去中心化交易平台的智能客服助手。请用简洁、友好、专业的中文回答用户问题。

# Hackathon 平台介绍
Hackathon 是一个基于 Conflux 区块链的去中心化交易平台，支持多钱包连接和安全的点对点交易。

# 主要功能
1. **多钱包支持**
   - MetaMask（狐狸钱包）- EVM 兼容
   - OKX Wallet - EVM 兼容  
   - Fluent Wallet - Conflux 原生钱包

2. **多网络支持**
   - Conflux eSpace Testnet（用于 MetaMask/OKX）
   - Conflux Core Testnet（用于 Fluent）

3. **核心交易功能**
   - 创建去中心化交易
   - 接受和管理交易
   - 自动托管和释放资金
   - 交易状态实时追踪

4. **多语言支持**
   - 中文（简体）
   - English（英文）
   - 繁體中文（繁体中文）

# 使用流程（详细步骤）

## 1. 连接钱包
- 点击页面右上角"Connect Wallet"按钮
- 系统会自动检测已安装的钱包
- 选择你的钱包（MetaMask/OKX/Fluent）
- 在钱包弹窗中授权连接
- 如果网络不正确，系统会提示切换到测试网

## 2. 创建交易
- 填写交易信息：
  * 接收方地址（对方钱包地址）
  * 代币类型（CFX 或其他支持的代币）
  * 交易金额
  * 交易描述（可选）
- 点击"创建交易"按钮
- 在钱包中确认交易
- 等待区块链确认（通常 3-10 秒）

## 3. 接受交易
- 作为接收方，在交易列表中找到待接受的交易
- 点击"接受交易"按钮
- 在钱包中确认
- 资金会被智能合约托管

## 4. 完成交易
- 双方确认交易完成后
- 点击"完成交易"按钮
- 资金会自动从托管释放到接收方

## 5. 取消交易
- 只有创建者可以取消未接受的交易
- 点击"取消交易"按钮
- 资金会退回到创建者账户

# 支持的网络详情

## Conflux eSpace Testnet（用于 MetaMask/OKX）
- Chain ID: 71
- RPC URL: https://evmtestnet.confluxrpc.com
- 区块浏览器: https://evmtestnet.confluxscan.io
- 测试币水龙头: https://efaucet.confluxnetwork.org/

## Conflux Core Testnet（用于 Fluent）
- Network ID: 1
- RPC URL: https://test.confluxrpc.com
- 区块浏览器: https://testnet.confluxscan.io
- 测试币水龙头: https://faucet.confluxnetwork.org/

# 常见问题解答

**Q: 如何获取测试币？**
A: 访问对应网络的水龙头网站，输入你的钱包地址即可免费领取测试币。eSpace 用户访问 https://efaucet.confluxnetwork.org/，Core 用户访问 https://faucet.confluxnetwork.org/

**Q: 交易需要多长时间确认？**
A: Conflux 网络确认速度很快，通常 3-10 秒即可完成一笔交易。

**Q: 交易费用是多少？**
A: 在测试网上，交易费用（Gas Fee）非常低，通常不到 0.001 CFX。测试币可以免费从水龙头获取。

**Q: 支持哪些代币？**
A: 目前主要支持 CFX（Conflux 原生代币）。未来会支持更多 ERC-20 代币。

**Q: 资金安全吗？**
A: 所有资金由智能合约托管，只有在双方确认后才会释放。你的私钥始终由你自己控制，平台无法访问。

**Q: 可以在主网使用吗？**
A: 目前仅支持测试网。请勿在主网使用真实资产，这是一个演示项目。

**Q: 如何切换语言？**
A: 点击页面右上角的语言切换按钮，可以在中文、英文、繁体中文之间切换。

**Q: 钱包连接失败怎么办？**
A: 
1. 确保已安装对应的钱包扩展
2. 检查钱包是否已解锁
3. 尝试刷新页面重新连接
4. 确保网络连接正常

**Q: 交易卡住了怎么办？**
A: 
1. 检查区块浏览器确认交易状态
2. 如果交易失败，可以重试
3. 确保钱包中有足够的 Gas Fee

# 技术栈
- 前端: React 19 + TypeScript + Vite
- 区块链: Conflux eSpace + Conflux Core
- 钱包连接: Wagmi (EVM) + js-conflux-sdk (Core)
- 智能合约: Solidity

# 回答规则
1. 直接、准确地回答问题，给出具体步骤和数字
2. 如果问题涉及操作步骤，按顺序列出
3. 提供相关的链接和资源
4. 保持友好、专业的语气
5. 每个回答控制在 150-300 字以内
6. 如果问题超出范围，建议用户查看文档或联系技术支持"""
    
    # 构建完整的对话提示词
    prompt = f"System: {system_prompt}\n\n"
    
    for msg in messages:
        role = msg.get('role', '')
        content = msg.get('content', '')
        if role == 'user':
            prompt += f"User: {content}\n\n"
        elif role == 'assistant':
            prompt += f"Assistant: {content}\n\n"
    
    prompt += "请用中文简洁、专业地回答用户的问题。\n\nAssistant: "
    
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] 收到 AI 助手请求")
    print(f"问题长度: {len(messages[-1].get('content', ''))} 字符")
    print("开始推理...")
    
    start_time = time.time()
    
    try:
        # 调用 Ollama API
        response = requests.post(
            OLLAMA_API,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,      # 对话使用适中的温度
                    "num_predict": 800,      # 限制回答长度
                    "top_p": 0.9,
                    "top_k": 40
                }
            },
            timeout=120  # 2 分钟超时
        )
        
        inference_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            assistant_response = result.get('response', '').strip()
            
            print(f"✅ 推理完成，耗时: {inference_time:.2f} 秒")
            print(f"响应长度: {len(assistant_response)} 字符")
            
            return jsonify({
                "choices": [{
                    "message": {
                        "role": "assistant",
                        "content": assistant_response
                    },
                    "finish_reason": "stop"
                }],
                "usage": {
                    "prompt_tokens": len(prompt),
                    "completion_tokens": len(assistant_response),
                    "total_tokens": len(prompt) + len(assistant_response)
                },
                "model": MODEL_NAME,
                "inference_time": round(inference_time, 2)
            })
        else:
            error_msg = f"Ollama API 错误: {response.status_code}"
            print(f"❌ {error_msg}")
            return jsonify({"error": error_msg}), 500
            
    except requests.exceptions.Timeout:
        error_msg = "推理超时（120秒），请稍后重试"
        print(f"❌ {error_msg}")
        return jsonify({"error": error_msg}), 504
    except requests.exceptions.ConnectionError:
        error_msg = "无法连接到 Ollama 服务，请确保 Ollama 正在运行"
        print(f"❌ {error_msg}")
        return jsonify({"error": error_msg}), 503
    except Exception as e:
        error_msg = f"服务器错误: {str(e)}"
        print(f"❌ {error_msg}")
        return jsonify({"error": error_msg}), 500

@app.route('/v1/chat/completions', methods=['POST'])
def chat_completions():
    """
    OpenAI 兼容的聊天接口
    可以用于其他需要 OpenAI API 格式的场景
    """
    return assistant_chat()

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 Hackathon AI 助手服务器启动成功！")
    print("="*60)
    print(f"📡 API 地址: http://localhost:8000")
    print(f"🔗 健康检查: http://localhost:8000/health")
    print(f"💬 对话接口: http://localhost:8000/v1/assistant/chat")
    print("="*60)
    
    # 检查 Ollama 是否运行
    print("\n🔍 检查 Ollama 服务状态...")
    try:
        response = requests.get("http://localhost:11434", timeout=2)
        if response.status_code == 200:
            print("✅ Ollama 服务正常运行")
            
            # 尝试获取模型列表
            try:
                models_response = requests.get("http://localhost:11434/api/tags", timeout=2)
                if models_response.status_code == 200:
                    models = models_response.json().get('models', [])
                    model_names = [m.get('name', '') for m in models]
                    
                    if MODEL_NAME in model_names:
                        print(f"✅ 模型 {MODEL_NAME} 已就绪")
                    else:
                        print(f"⚠️  警告: 模型 {MODEL_NAME} 未找到")
                        print(f"   可用模型: {', '.join(model_names) if model_names else '无'}")
                        print(f"   请运行: ollama pull {MODEL_NAME}")
            except:
                pass
        else:
            print("⚠️  警告: Ollama 服务响应异常")
    except:
        print("❌ 错误: 无法连接到 Ollama")
        print("   请确保 Ollama 正在运行")
        print("   启动命令: ollama serve")
        print(f"   拉取模型: ollama pull {MODEL_NAME}")
    
    print("\n" + "="*60)
    print("服务器运行中... 按 Ctrl+C 停止")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=8000, debug=False)
