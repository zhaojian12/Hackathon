"""
智能身份信用评分系统 API
基于链上行为和交易历史的信用评估
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Ollama API 配置
OLLAMA_API = os.getenv("OLLAMA_API", "http://localhost:11434/api/generate")
MODEL_NAME = os.getenv("MODEL_NAME", "qwen3:4b-instruct-2507-q4_K_M")

# 信用等级定义
CREDIT_LEVELS = {
    "novice": {"name": "新手", "min": 0, "max": 299, "color": "#6b7280"},
    "normal": {"name": "普通", "min": 300, "max": 599, "color": "#3b82f6"},
    "good": {"name": "优秀", "min": 600, "max": 799, "color": "#10b981"},
    "excellent": {"name": "卓越", "min": 800, "max": 1000, "color": "#f59e0b"}
}

# 用户标签库
USER_TAGS = {
    "positive": [
        "守信用", "响应快", "描述准确", "包装完好", "发货及时",
        "沟通顺畅", "态度友好", "专业卖家", "优质买家", "长期活跃"
    ],
    "negative": [
        "响应慢", "描述不符", "包装简陋", "发货延迟",
        "沟通困难", "态度恶劣", "新手卖家", "冲动买家", "不活跃"
    ],
    "neutral": [
        "偶尔交易", "中等活跃", "普通用户", "观望中"
    ]
}

def simulate_transaction_history(address):
    """
    模拟交易历史数据
    实际应用中应该从区块链或数据库查询
    """
    # 基于地址生成伪随机但一致的数据
    seed = int(address[-8:], 16) % 10000
    random.seed(seed)
    
    # 账户年龄（天）
    account_age_days = random.randint(1, 730)
    
    # 交易统计
    total_transactions = random.randint(0, 200)
    completed_transactions = int(total_transactions * random.uniform(0.7, 1.0))
    cancelled_transactions = total_transactions - completed_transactions
    
    # 作为买家和卖家的交易
    buyer_transactions = int(total_transactions * random.uniform(0.3, 0.7))
    seller_transactions = total_transactions - buyer_transactions
    
    # 交易金额
    total_volume = random.uniform(0, 100000)
    avg_transaction_value = total_volume / max(total_transactions, 1)
    
    # 纠纷记录
    disputes_initiated = random.randint(0, max(total_transactions // 20, 1))
    disputes_won = int(disputes_initiated * random.uniform(0.3, 0.8))
    disputes_lost = disputes_initiated - disputes_won
    
    # 评价统计
    positive_reviews = int(completed_transactions * random.uniform(0.6, 0.95))
    negative_reviews = int(completed_transactions * random.uniform(0, 0.1))
    neutral_reviews = completed_transactions - positive_reviews - negative_reviews
    
    # 响应时间（小时）
    avg_response_time = random.uniform(0.5, 48)
    
    # 最后活跃时间
    last_active_days = random.randint(0, 90)
    
    return {
        "address": address,
        "account_age_days": account_age_days,
        "total_transactions": total_transactions,
        "completed_transactions": completed_transactions,
        "cancelled_transactions": cancelled_transactions,
        "buyer_transactions": buyer_transactions,
        "seller_transactions": seller_transactions,
        "total_volume": round(total_volume, 2),
        "avg_transaction_value": round(avg_transaction_value, 2),
        "disputes_initiated": disputes_initiated,
        "disputes_won": disputes_won,
        "disputes_lost": disputes_lost,
        "positive_reviews": positive_reviews,
        "negative_reviews": negative_reviews,
        "neutral_reviews": neutral_reviews,
        "avg_response_time": round(avg_response_time, 2),
        "last_active_days": last_active_days
    }

def calculate_credit_score(history):
    """
    计算信用评分 (0-1000)
    """
    score = 500  # 基础分
    
    # 1. 账户年龄加分 (0-100分)
    age_score = min(history["account_age_days"] / 365 * 100, 100)
    score += age_score * 0.15
    
    # 2. 交易完成率 (0-200分)
    if history["total_transactions"] > 0:
        completion_rate = history["completed_transactions"] / history["total_transactions"]
        score += completion_rate * 200 * 0.25
    
    # 3. 交易量加分 (0-150分)
    transaction_score = min(history["total_transactions"] / 100 * 150, 150)
    score += transaction_score * 0.20
    
    # 4. 交易金额加分 (0-100分)
    volume_score = min(history["total_volume"] / 50000 * 100, 100)
    score += volume_score * 0.10
    
    # 5. 评价得分 (0-200分)
    total_reviews = history["positive_reviews"] + history["negative_reviews"] + history["neutral_reviews"]
    if total_reviews > 0:
        positive_rate = history["positive_reviews"] / total_reviews
        review_score = positive_rate * 200
        score += review_score * 0.20
    
    # 6. 纠纷率扣分 (0-150分)
    if history["total_transactions"] > 0:
        dispute_rate = history["disputes_initiated"] / history["total_transactions"]
        dispute_penalty = dispute_rate * 150
        score -= dispute_penalty
    
    # 7. 响应速度加分 (0-50分)
    if history["avg_response_time"] < 1:
        response_score = 50
    elif history["avg_response_time"] < 6:
        response_score = 30
    elif history["avg_response_time"] < 24:
        response_score = 10
    else:
        response_score = 0
    score += response_score * 0.05
    
    # 8. 活跃度加分 (0-50分)
    if history["last_active_days"] < 7:
        activity_score = 50
    elif history["last_active_days"] < 30:
        activity_score = 30
    elif history["last_active_days"] < 90:
        activity_score = 10
    else:
        activity_score = 0
    score += activity_score * 0.05
    
    # 确保分数在 0-1000 范围内
    final_score = max(0, min(1000, int(score)))
    
    return final_score

def get_credit_level(score):
    """根据评分获取信用等级"""
    for level_key, level_info in CREDIT_LEVELS.items():
        if level_info["min"] <= score <= level_info["max"]:
            return level_key, level_info["name"], level_info["color"]
    return "novice", "新手", "#6b7280"

def generate_user_tags(history, score):
    """生成用户画像标签"""
    tags = []
    
    # 基于交易量
    if history["total_transactions"] > 100:
        tags.append("长期活跃")
    elif history["total_transactions"] > 50:
        tags.append("中等活跃")
    elif history["total_transactions"] < 10:
        tags.append("新手用户")
    
    # 基于完成率
    if history["total_transactions"] > 0:
        completion_rate = history["completed_transactions"] / history["total_transactions"]
        if completion_rate > 0.95:
            tags.append("守信用")
        elif completion_rate < 0.7:
            tags.append("取消率高")
    
    # 基于评价
    total_reviews = history["positive_reviews"] + history["negative_reviews"] + history["neutral_reviews"]
    if total_reviews > 0:
        positive_rate = history["positive_reviews"] / total_reviews
        if positive_rate > 0.9:
            tags.append("好评如潮")
        elif positive_rate < 0.6:
            tags.append("差评较多")
    
    # 基于响应速度
    if history["avg_response_time"] < 1:
        tags.append("响应快")
    elif history["avg_response_time"] > 24:
        tags.append("响应慢")
    
    # 基于角色
    if history["seller_transactions"] > history["buyer_transactions"] * 2:
        tags.append("专业卖家")
    elif history["buyer_transactions"] > history["seller_transactions"] * 2:
        tags.append("活跃买家")
    else:
        tags.append("买卖均衡")
    
    # 基于纠纷
    if history["disputes_initiated"] == 0:
        tags.append("零纠纷")
    elif history["disputes_initiated"] > 5:
        tags.append("纠纷较多")
    
    # 基于活跃度
    if history["last_active_days"] < 7:
        tags.append("最近活跃")
    elif history["last_active_days"] > 90:
        tags.append("不活跃")
    
    # 基于信用分
    if score >= 800:
        tags.append("信用卓越")
    elif score >= 600:
        tags.append("信用优秀")
    
    return tags[:8]  # 最多返回 8 个标签

def generate_trading_advice(history, score, level_name):
    """生成交易建议"""
    advice = {
        "recommended": False,
        "confidence": 0,
        "reasons": [],
        "suggestions": []
    }
    
    # 基于信用分判断
    if score >= 700:
        advice["recommended"] = True
        advice["confidence"] = min(95, 60 + (score - 700) / 3)
        advice["reasons"].append(f"✅ 信用评分优秀 ({score}/1000)")
    elif score >= 500:
        advice["recommended"] = True
        advice["confidence"] = 50 + (score - 500) / 4
        advice["reasons"].append(f"⚠️ 信用评分中等 ({score}/1000)")
    else:
        advice["recommended"] = False
        advice["confidence"] = 30
        advice["reasons"].append(f"❌ 信用评分较低 ({score}/1000)")
    
    # 基于交易历史
    if history["total_transactions"] > 50:
        advice["reasons"].append(f"✅ 交易经验丰富 ({history['total_transactions']} 笔)")
    elif history["total_transactions"] < 10:
        advice["reasons"].append(f"⚠️ 交易经验较少 ({history['total_transactions']} 笔)")
        advice["confidence"] -= 10
    
    # 基于完成率
    if history["total_transactions"] > 0:
        completion_rate = history["completed_transactions"] / history["total_transactions"]
        if completion_rate > 0.9:
            advice["reasons"].append(f"✅ 完成率高 ({completion_rate*100:.1f}%)")
        elif completion_rate < 0.7:
            advice["reasons"].append(f"❌ 完成率低 ({completion_rate*100:.1f}%)")
            advice["recommended"] = False
            advice["confidence"] -= 20
    
    # 基于纠纷率
    if history["total_transactions"] > 0:
        dispute_rate = history["disputes_initiated"] / history["total_transactions"]
        if dispute_rate == 0:
            advice["reasons"].append("✅ 零纠纷记录")
        elif dispute_rate > 0.1:
            advice["reasons"].append(f"❌ 纠纷率较高 ({dispute_rate*100:.1f}%)")
            advice["recommended"] = False
            advice["confidence"] -= 15
    
    # 生成建议
    if advice["recommended"]:
        if score >= 800:
            advice["suggestions"].append("强烈推荐与该用户交易")
            advice["suggestions"].append("可以考虑大额交易")
        elif score >= 600:
            advice["suggestions"].append("推荐与该用户交易")
            advice["suggestions"].append("建议中小额交易")
        else:
            advice["suggestions"].append("可以尝试交易")
            advice["suggestions"].append("建议小额交易测试")
            advice["suggestions"].append("注意保留交易证据")
    else:
        advice["suggestions"].append("不建议与该用户交易")
        advice["suggestions"].append("如需交易，请特别谨慎")
        advice["suggestions"].append("建议使用风险评估功能")
        advice["suggestions"].append("延长托管时间")
    
    # 通用建议
    if history["last_active_days"] > 30:
        advice["suggestions"].append(f"注意：用户 {history['last_active_days']} 天未活跃")
    
    advice["confidence"] = max(10, min(95, int(advice["confidence"])))
    
    return advice

def ai_user_analysis(history, score, tags):
    """AI 深度用户分析"""
    try:
        prompt = f"""你是一个专业的信用分析师。请分析以下用户的交易行为：

【基础信息】
账户年龄: {history['account_age_days']} 天
信用评分: {score}/1000

【交易统计】
总交易: {history['total_transactions']} 笔
完成交易: {history['completed_transactions']} 笔
取消交易: {history['cancelled_transactions']} 笔
完成率: {history['completed_transactions']/max(history['total_transactions'],1)*100:.1f}%

【角色分布】
作为买家: {history['buyer_transactions']} 笔
作为卖家: {history['seller_transactions']} 笔

【交易金额】
总交易额: {history['total_volume']:.2f} cUSD
平均交易: {history['avg_transaction_value']:.2f} cUSD

【纠纷记录】
发起纠纷: {history['disputes_initiated']} 次
胜诉: {history['disputes_won']} 次
败诉: {history['disputes_lost']} 次

【评价情况】
好评: {history['positive_reviews']} 个
差评: {history['negative_reviews']} 个
中评: {history['neutral_reviews']} 个

【用户标签】
{', '.join(tags)}

请从以下角度分析（100字以内）：
1. 用户的交易风格和特点
2. 可信度评估
3. 潜在风险点

请用简洁的中文回答。"""

        response = requests.post(
            OLLAMA_API,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "num_predict": 200
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            ai_analysis = response.json().get('response', '').strip()
            print(f"✅ AI 分析完成")
            return ai_analysis
        else:
            return "AI 分析暂时不可用"
            
    except Exception as e:
        print(f"⚠️  AI 分析失败: {str(e)}")
        return "AI 分析失败"

@app.route('/health', methods=['GET'])
def health():
    """健康检查"""
    return jsonify({
        "status": "ok",
        "service": "Credit Score API",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/credit/analyze', methods=['POST'])
def analyze_credit():
    """
    信用分析接口
    输入：用户地址
    输出：信用评分、等级、标签、交易建议
    """
    data = request.json
    address = data.get('address', '')
    
    if not address:
        return jsonify({"error": "地址不能为空"}), 400
    
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] 收到信用分析请求")
    print(f"地址: {address}")
    
    # 1. 获取交易历史（模拟数据）
    history = simulate_transaction_history(address)
    
    # 2. 计算信用评分
    score = calculate_credit_score(history)
    
    # 3. 获取信用等级
    level_key, level_name, level_color = get_credit_level(score)
    
    # 4. 生成用户标签
    tags = generate_user_tags(history, score)
    
    # 5. 生成交易建议
    advice = generate_trading_advice(history, score, level_name)
    
    # 6. AI 深度分析
    ai_analysis = ai_user_analysis(history, score, tags)
    
    # 7. 构建响应
    result = {
        "address": address,
        "credit_score": score,
        "credit_level": {
            "key": level_key,
            "name": level_name,
            "color": level_color
        },
        "user_tags": tags,
        "transaction_stats": {
            "account_age_days": history["account_age_days"],
            "total_transactions": history["total_transactions"],
            "completed_transactions": history["completed_transactions"],
            "completion_rate": round(history["completed_transactions"] / max(history["total_transactions"], 1) * 100, 1),
            "total_volume": history["total_volume"],
            "avg_transaction_value": history["avg_transaction_value"],
            "disputes_initiated": history["disputes_initiated"],
            "positive_reviews": history["positive_reviews"],
            "negative_reviews": history["negative_reviews"],
            "avg_response_time": history["avg_response_time"],
            "last_active_days": history["last_active_days"]
        },
        "trading_advice": advice,
        "ai_analysis": ai_analysis,
        "timestamp": datetime.now().isoformat()
    }
    
    print(f"✅ 信用分析完成: {level_name} ({score}分)")
    
    return jsonify(result)

@app.route('/api/credit/compare', methods=['POST'])
def compare_users():
    """
    对比两个用户的信用
    """
    data = request.json
    address1 = data.get('address1', '')
    address2 = data.get('address2', '')
    
    if not address1 or not address2:
        return jsonify({"error": "需要提供两个地址"}), 400
    
    # 分析两个用户
    history1 = simulate_transaction_history(address1)
    score1 = calculate_credit_score(history1)
    level1_key, level1_name, _ = get_credit_level(score1)
    
    history2 = simulate_transaction_history(address2)
    score2 = calculate_credit_score(history2)
    level2_key, level2_name, _ = get_credit_level(score2)
    
    # 对比结果
    comparison = {
        "user1": {
            "address": address1,
            "score": score1,
            "level": level1_name
        },
        "user2": {
            "address": address2,
            "score": score2,
            "level": level2_name
        },
        "score_diff": abs(score1 - score2),
        "better_user": address1 if score1 > score2 else address2,
        "recommendation": "用户1更可信" if score1 > score2 else "用户2更可信" if score2 > score1 else "两者信用相当"
    }
    
    return jsonify(comparison)

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🏆 智能身份信用评分系统 API 启动")
    print("="*60)
    print(f"📡 API 地址: http://localhost:8003")
    print(f"🔗 健康检查: http://localhost:8003/health")
    print(f"🏆 信用分析: http://localhost:8003/api/credit/analyze")
    print(f"⚖️  用户对比: http://localhost:8003/api/credit/compare")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=8003, debug=False)
