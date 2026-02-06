"""
争议仲裁 API 测试脚本
"""
import requests
import json
from datetime import datetime

API_URL = "http://localhost:8002"

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

def test_seller_no_ship():
    """测试场景 1: 卖家未发货"""
    print("\n" + "="*60)
    print("测试 2: 卖家未发货争议")
    print("="*60)
    
    data = {
        "amount": "1000",
        "description": "购买 iPhone 15 Pro",
        "dispute_type": "seller_no_ship",
        "buyer_claim": "已经付款 3 天了，卖家一直说马上发货，但是没有任何物流信息",
        "seller_response": "最近比较忙，会尽快发货的",
        "chat_history": [
            "买家: 什么时候发货？",
            "卖家: 马上发货",
            "买家: 已经 3 天了",
            "卖家: 再等等"
        ],
        "buyer_evidence": [
            {"type": "text", "content": "付款凭证截图"},
            {"type": "text", "content": "聊天记录截图"}
        ],
        "seller_evidence": []
    }
    
    print(f"请求数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
    
    try:
        response = requests.post(
            f"{API_URL}/api/dispute/analyze",
            json=data,
            timeout=60
        )
        print(f"\n状态码: {response.status_code}")
        result = response.json()
        print(f"响应: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
        print(f"\n✅ 案件编号: {result['case_id']}")
        print(f"✅ 责任方: {result['responsibility_text']}")
        print(f"✅ 处理方案: {result['resolution_text']}")
        print(f"✅ 置信度: {result['confidence']}%")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return False

def test_damaged_goods():
    """测试场景 2: 商品损坏"""
    print("\n" + "="*60)
    print("测试 3: 商品损坏争议")
    print("="*60)
    
    data = {
        "amount": "2000",
        "description": "购买笔记本电脑",
        "dispute_type": "damaged",
        "buyer_claim": "收到的笔记本电脑屏幕有裂痕，包装也有明显破损，怀疑是运输过程中损坏的",
        "seller_response": "发货时检查过，完好无损，可能是快递的问题",
        "chat_history": [
            "买家: 收到货了，但是屏幕裂了",
            "卖家: 不可能，我发货时检查过的",
            "买家: 我有照片证据",
            "卖家: 那可能是快递的问题"
        ],
        "buyer_evidence": [
            {"type": "image", "content": "屏幕裂痕照片"},
            {"type": "image", "content": "包装破损照片"},
            {"type": "text", "content": "开箱视频"}
        ],
        "seller_evidence": [
            {"type": "image", "content": "发货前检查照片"},
            {"type": "tracking", "content": "物流单号: SF1234567890"}
        ]
    }
    
    print(f"请求数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
    
    try:
        response = requests.post(
            f"{API_URL}/api/dispute/analyze",
            json=data,
            timeout=60
        )
        print(f"\n状态码: {response.status_code}")
        result = response.json()
        print(f"响应: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
        print(f"\n✅ 案件编号: {result['case_id']}")
        print(f"✅ 责任方: {result['responsibility_text']}")
        print(f"✅ 处理方案: {result['resolution_text']}")
        print(f"✅ 置信度: {result['confidence']}%")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return False

def test_not_as_described():
    """测试场景 3: 商品与描述不符"""
    print("\n" + "="*60)
    print("测试 4: 商品与描述不符")
    print("="*60)
    
    data = {
        "amount": "5000",
        "description": "全新 iPhone 15 Pro 256GB",
        "dispute_type": "not_as_described",
        "buyer_claim": "卖家说是全新未拆封，但收到的是激活过的，而且有使用痕迹",
        "seller_response": "我卖的就是全新的，可能是买家自己激活后想退货",
        "chat_history": [
            "买家: 这个是全新的吗？",
            "卖家: 保证全新未拆封",
            "买家: 收到了，已经激活过了",
            "卖家: 不可能，肯定是你自己激活的"
        ],
        "buyer_evidence": [
            {"type": "image", "content": "激活日期截图"},
            {"type": "image", "content": "使用痕迹照片"},
            {"type": "text", "content": "苹果官网查询记录"}
        ],
        "seller_evidence": [
            {"type": "text", "content": "我是正规渠道进货的"}
        ]
    }
    
    print(f"请求数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
    
    try:
        response = requests.post(
            f"{API_URL}/api/dispute/analyze",
            json=data,
            timeout=60
        )
        print(f"\n状态码: {response.status_code}")
        result = response.json()
        print(f"响应: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
        print(f"\n✅ 案件编号: {result['case_id']}")
        print(f"✅ 责任方: {result['responsibility_text']}")
        print(f"✅ 处理方案: {result['resolution_text']}")
        print(f"✅ 置信度: {result['confidence']}%")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        return False

def main():
    print("\n" + "="*60)
    print("⚖️  争议仲裁 API 测试")
    print("="*60)
    print(f"API 地址: {API_URL}")
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 运行测试
    results = []
    results.append(("健康检查", test_health()))
    results.append(("卖家未发货", test_seller_no_ship()))
    results.append(("商品损坏", test_damaged_goods()))
    results.append(("商品与描述不符", test_not_as_described()))
    
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
