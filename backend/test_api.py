"""
AI 助手 API 测试脚本
用于验证服务器是否正常工作
"""
import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_health():
    """测试健康检查接口"""
    print("\n" + "="*60)
    print("测试 1: 健康检查")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ 错误: {e}")
        return False

def test_assistant_chat(question):
    """测试 AI 助手对话"""
    print("\n" + "="*60)
    print(f"测试 2: AI 对话 - {question}")
    print("="*60)
    
    try:
        start_time = time.time()
        
        response = requests.post(
            f"{BASE_URL}/v1/assistant/chat",
            json={
                "messages": [
                    {"role": "user", "content": question}
                ]
            },
            timeout=120
        )
        
        elapsed_time = time.time() - start_time
        
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            answer = data["choices"][0]["message"]["content"]
            print(f"\n问题: {question}")
            print(f"\n回答:\n{answer}")
            print(f"\n推理时间: {elapsed_time:.2f} 秒")
            print(f"模型: {data.get('model', 'unknown')}")
            return True
        else:
            print(f"❌ 错误: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ 错误: {e}")
        return False

def test_multiple_questions():
    """测试多个问题"""
    questions = [
        "如何连接钱包？",
        "如何获取测试币？",
        "交易需要多长时间？",
        "支持哪些钱包？",
        "什么是去中心化交易？"
    ]
    
    print("\n" + "="*60)
    print("测试 3: 多个问题测试")
    print("="*60)
    
    success_count = 0
    total_time = 0
    
    for i, question in enumerate(questions, 1):
        print(f"\n[{i}/{len(questions)}] 问题: {question}")
        
        try:
            start_time = time.time()
            
            response = requests.post(
                f"{BASE_URL}/v1/assistant/chat",
                json={
                    "messages": [
                        {"role": "user", "content": question}
                    ]
                },
                timeout=120
            )
            
            elapsed_time = time.time() - start_time
            total_time += elapsed_time
            
            if response.status_code == 200:
                data = response.json()
                answer = data["choices"][0]["message"]["content"]
                print(f"✅ 成功 ({elapsed_time:.2f}秒)")
                print(f"回答: {answer[:100]}...")
                success_count += 1
            else:
                print(f"❌ 失败: {response.status_code}")
                
        except Exception as e:
            print(f"❌ 错误: {e}")
    
    print("\n" + "="*60)
    print(f"测试完成: {success_count}/{len(questions)} 成功")
    print(f"平均响应时间: {total_time/len(questions):.2f} 秒")
    print("="*60)

def main():
    print("\n" + "="*60)
    print("Hackathon AI 助手 API 测试")
    print("="*60)
    
    # 测试 1: 健康检查
    if not test_health():
        print("\n❌ 健康检查失败，请确保服务器正在运行")
        print("   启动命令: python ai_assistant_server.py")
        return
    
    print("\n✅ 健康检查通过")
    
    # 测试 2: 单个问题
    test_assistant_chat("你好，请介绍一下 Hackathon 平台")
    
    # 测试 3: 多个问题
    print("\n是否继续测试多个问题？(y/n)")
    choice = input().strip().lower()
    
    if choice == 'y':
        test_multiple_questions()
    
    print("\n" + "="*60)
    print("测试完成！")
    print("="*60)

if __name__ == "__main__":
    main()
