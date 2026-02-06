"""
信用评分 API 测试脚本
"""
import requests
import json
from datetime import datetime

API_URL = "http://localhost:8003"

def test_health():
    """测试健康检查"""
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

def test_excellent_user():
    """测试优秀用户"""
    print("\n" + "="*60)
    print("测试 2: 优秀用户信用分析")
    print("="*60)
    
    data = {
        "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
    }
    
    print(f"请求数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
    
    try:
        response = requests.post(
            f"{API_URL}/api/credit/analyze",
            json=data,
            timeout=60
        )
        print(f"\n状态码: {response.status_code}")
        result = response.json()
        print(f"响应: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
        print(f"\n✅ 信用评分: {result['credit_score']}/1000")
        print(f"✅ 信用等级: {result['credit_level']['name']}")
        print(f"✅ 用户标签: {', '.join(result['user_tags'])}")
        print(f"✅ 是否推荐: {'是' if result['trading_advice']['recommended'] else '否'}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return False

def test_novice_user():
    """测试新手用户"""
    print("\n" + "="*60)
    print("测试 3: 新手用户信用分析")
    print("="*60)
    
    data = {
        "address": "0x0000000000000000000000000000000000000001"
    }
    
    print(f"请求数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
    
    try:
        response = requests.post(
            f"{API_URL}/api/credit/analyze",
            json=data,
            timeout=60
        )
        print(f"\n状态码: {response.status_code}")
        result = response.json()
        print(f"响应: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
        print(f"\n✅ 信用评分: {result['credit_score']}/1000")
        print(f"✅ 信用等级: {result['credit_level']['name']}")
        print(f"✅ 用户标签: {', '.join(result['user_tags'])}")
        print(f"✅ 是否推荐: {'是' if result['trading_advice']['recommended'] else '否'}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return False

def test_compare_users():
    """测试用户对比"""
    print("\n" + "="*60)
    print("测试 4: 用户信用对比")
    print("="*60)
    
    data = {
        "address1": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        "address2": "0x0000000000000000000000000000000000000001"
    }
    
    print(f"请求数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
    
    try:
        response = requests.post(
            f"{API_URL}/api/credit/compare",
            json=data,
            timeout=60
        )
        print(f"\n状态码: {response.status_code}")
        result = response.json()
        print(f"响应: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
        print(f"\n✅ 用户1评分: {result['user1']['score']} ({result['user1']['level']})")
        print(f"✅ 用户2评分: {result['user2']['score']} ({result['user2']['level']})")
        print(f"✅ 评分差距: {result['score_diff']}")
        print(f"✅ 推荐结论: {result['recommendation']}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return False

def main():
    print("\n" + "="*60)
    print("🏆 信用评分 API 测试")
    print("="*60)
    print(f"API 地址: {API_URL}")
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 运行测试
    results = []
    results.append(("健康检查", test_health()))
    results.append(("优秀用户", test_excellent_user()))
    results.append(("新手用户", test_novice_user()))
    results.append(("用户对比", test_compare_users()))
    
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
