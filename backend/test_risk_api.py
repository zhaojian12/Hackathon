"""
风险评估 API 测试脚本
"""
import requests
import json
from datetime import datetime

API_URL = "http://localhost:8001"

def test_health():
    """测试健康检查接口"""
    print("\n" + "="*60)
    print("测试 1: 健康检查")
    print("="*60)
    
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return False

def test_low_risk():
    """测试低风险交易"""
    print("\n" + "="*60)
    print("测试 2: 低风险交易")
    print("="*60)
    
    data = {
        "amount": "500",
        "description": "购买全新 iPhone 15 Pro，包装完好",
        "buyer_address": "0x1234567890abcdef1234567890abcdef12345678",
        "seller_address": "0xabcdef1234567890abcdef1234567890abcdef12"
    }
    
    print(f"请求数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
    
    try:
        response = requests.post(
            f"{API_URL}/api/risk/assess",
            json=data,
            timeout=60
        )
        print(f"\n状态码: {response.status_code}")
        result = response.json()
        print(f"响应: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
        print(f"\n✅ 风险评分: {result['risk_score']}")
        print(f"✅ 风险等级: {result['risk_level_text']}")
        print(f"✅ 建议: {result['recommendation']}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return False

def test_high_risk():
    """测试高风险交易"""
    print("\n" + "="*60)
    print("测试 3: 高风险交易")
    print("="*60)
    
    data = {
        "amount": "50000",
        "description": "urgent investment opportunity guaranteed 100% profit bitcoin",
        "buyer_address": "0x0000000000000000000000000000000000000001",
        "seller_address": "0x0000000000000000000000000000000000000002"
    }
    
    print(f"请求数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
    
    try:
        response = requests.post(
            f"{API_URL}/api/risk/assess",
            json=data,
            timeout=60
        )
        print(f"\n状态码: {response.status_code}")
        result = response.json()
        print(f"响应: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
        print(f"\n⚠️  风险评分: {result['risk_score']}")
        print(f"⚠️  风险等级: {result['risk_level_text']}")
        print(f"⚠️  建议: {result['recommendation']}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return False

def test_medium_risk():
    """测试中风险交易"""
    print("\n" + "="*60)
    print("测试 4: 中风险交易")
    print("="*60)
    
    data = {
        "amount": "5000",
        "description": "二手车交易",
        "buyer_address": "0x1234567890abcdef1234567890abcdef12345678",
        "seller_address": "0xabcdef1234567890abcdef1234567890abcdef12"
    }
    
    print(f"请求数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
    
    try:
        response = requests.post(
            f"{API_URL}/api/risk/assess",
            json=data,
            timeout=60
        )
        print(f"\n状态码: {response.status_code}")
        result = response.json()
        print(f"响应: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
        print(f"\n⚠️  风险评分: {result['risk_score']}")
        print(f"⚠️  风险等级: {result['risk_level_text']}")
        print(f"⚠️  建议: {result['recommendation']}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return False

def main():
    print("\n" + "="*60)
    print("🛡️  风险评估 API 测试")
    print("="*60)
    print(f"API 地址: {API_URL}")
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 运行测试
    results = []
    results.append(("健康检查", test_health()))
    results.append(("低风险交易", test_low_risk()))
    results.append(("高风险交易", test_high_risk()))
    results.append(("中风险交易", test_medium_risk()))
    
    # 输出测试结果
    print("\n" + "="*60)
    print("测试结果汇总")
    print("="*60)
    
    for name, passed in results:
        status = "✅ 通过" if passed else "❌ 失败"
        print(f"{name}: {status}")
    
    total = len(results)
    passed = sum(1 for _, p in results if p)
    print(f"\n总计: {passed}/{total} 通过")
    
    if passed == total:
        print("\n🎉 所有测试通过！")
    else:
        print(f"\n⚠️  {total - passed} 个测试失败")
    
    print("="*60 + "\n")

if __name__ == '__main__':
    main()
