# 智能争议仲裁助手使用指南

## 📋 功能概述

智能争议仲裁助手是一个基于 AI 的交易纠纷分析和仲裁建议系统，帮助平台快速、公正地处理买卖双方的争议。

### 核心功能

1. **多维度证据分析**
   - 文字证据分析
   - 图片证据识别
   - 物流信息验证
   - 聊天记录分析

2. **智能责任判定**
   - 卖家责任
   - 买家责任
   - 双方责任
   - 责任不明确

3. **处理方案建议**
   - 全额退款给买家
   - 部分退款
   - 正常放款给卖家
   - 延长托管期
   - 需要人工深度审核

4. **置信度评分** (30-95%)
   - 高置信度 (80%+): 建议直接执行
   - 中置信度 (60-79%): 建议人工复核
   - 低置信度 (<60%): 需要深度审核

## 🚀 快速开始

### 1. 启动后端服务

#### Windows 用户
```bash
cd Hackathon/backend
start_dispute_api.bat
```

#### Linux/Mac 用户
```bash
cd Hackathon/backend
chmod +x start_dispute_api.sh
./start_dispute_api.sh
```

#### 手动启动
```bash
cd Hackathon/backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python dispute_arbitration_api.py
```

服务将在 `http://localhost:8002` 启动

### 2. 启动前端

```bash
cd Hackathon/frontend
npm run dev
```

### 3. 使用争议仲裁功能

1. 打开浏览器访问 `http://localhost:5173`
2. 点击顶部导航栏的 **"⚖️ 争议仲裁"** 按钮
3. 填写争议信息：
   - 交易金额和描述
   - 选择争议类型
   - 填写买家主张和卖家回应
   - 添加聊天记录
   - 上传双方证据
4. 点击 **"🔍 开始仲裁分析"** 按钮
5. 查看详细的仲裁建议报告

## 📊 争议类型

系统支持以下争议类型：

1. **未收到商品** (`not_received`)
   - 买家声称未收到商品
   - 需要卖家提供物流证明

2. **商品与描述不符** (`not_as_described`)
   - 商品质量、规格与描述不一致
   - 需要双方提供证据对比

3. **商品损坏** (`damaged`)
   - 商品在运输过程中损坏
   - 需要判断责任方（卖家/快递）

4. **假货/仿品** (`fake`)
   - 商品真伪争议
   - 需要专业鉴定

5. **卖家未发货** (`seller_no_ship`)
   - 卖家长时间未发货
   - 需要卖家说明原因

6. **买家未付款** (`buyer_no_pay`)
   - 买家未按约定付款
   - 较少见（托管系统已预防）

7. **其他争议** (`other`)
   - 其他类型的纠纷

## 🧪 测试用例

### 测试用例 1: 卖家未发货（高置信度）

```
交易金额: 1000
交易描述: 购买 iPhone 15 Pro
争议类型: 卖家未发货
买家主张: 已经付款 3 天了，卖家一直说马上发货，但是没有任何物流信息
卖家回应: 最近比较忙，会尽快发货的
聊天记录:
  买家: 什么时候发货？
  卖家: 马上发货
  买家: 已经 3 天了
  卖家: 再等等
买家证据:
  - 文字: 付款凭证截图
  - 文字: 聊天记录截图
卖家证据: (无)
```

**预期结果:**
- 责任方: 卖家责任
- 处理方案: 全额退款给买家
- 置信度: 85%
- 理由: 卖家未提供发货证明

---

### 测试用例 2: 商品损坏（中置信度）

```
交易金额: 2000
交易描述: 购买笔记本电脑
争议类型: 商品损坏
买家主张: 收到的笔记本电脑屏幕有裂痕，包装也有明显破损
卖家回应: 发货时检查过，完好无损，可能是快递的问题
聊天记录:
  买家: 收到货了，但是屏幕裂了
  卖家: 不可能，我发货时检查过的
  买家: 我有照片证据
  卖家: 那可能是快递的问题
买家证据:
  - 图片: 屏幕裂痕照片
  - 图片: 包装破损照片
  - 文字: 开箱视频
卖家证据:
  - 图片: 发货前检查照片
  - 物流: SF1234567890
```

**预期结果:**
- 责任方: 卖家责任
- 处理方案: 部分退款
- 置信度: 70%
- 理由: 买家提供了损坏证据，建议部分退款

---

### 测试用例 3: 商品与描述不符（中等置信度）

```
交易金额: 5000
交易描述: 全新 iPhone 15 Pro 256GB
争议类型: 商品与描述不符
买家主张: 卖家说是全新未拆封，但收到的是激活过的，而且有使用痕迹
卖家回应: 我卖的就是全新的，可能是买家自己激活后想退货
聊天记录:
  买家: 这个是全新的吗？
  卖家: 保证全新未拆封
  买家: 收到了，已经激活过了
  卖家: 不可能，肯定是你自己激活的
买家证据:
  - 图片: 激活日期截图
  - 图片: 使用痕迹照片
  - 文字: 苹果官网查询记录
卖家证据:
  - 文字: 我是正规渠道进货的
```

**预期结果:**
- 责任方: 卖家责任
- 处理方案: 部分退款
- 置信度: 65%
- 理由: 买家提供证据，卖家未反驳

## 🔍 仲裁算法原理

### 1. 证据完整性分析

```python
# 检查证据类型
has_image = 提供了图片证据 → 降低风险 -10分
has_text = 提供了文字说明 → 基础要求
has_tracking = 提供了物流信息 → 降低风险 -15分

# 缺少证据
no_image → 增加风险 +15分
no_tracking → 增加风险 +10分
```

### 2. 聊天记录分析

```python
# 威胁性语言检测
threat_keywords = ["投诉", "举报", "律师", "起诉"]
found_threats → 风险 +20分

# 拒绝沟通检测
refuse_keywords = ["不管", "不理", "拉黑"]
found_refuse → 风险 +15分

# 承诺性语言
promise_keywords = ["保证", "承诺", "一定"]
found_promises → 记录但不加分
```

### 3. 规则引擎判断

```python
# 规则 1: 卖家未发货
if dispute_type == "seller_no_ship" and no_tracking:
    责任方 = "卖家"
    处理方案 = "全额退款"
    置信度 = 85%

# 规则 2: 商品损坏
if dispute_type == "damaged" and buyer_has_image:
    责任方 = "卖家"
    处理方案 = "部分退款"
    置信度 = 70%

# 规则 3: 未收到商品
if dispute_type == "not_received":
    if seller_has_tracking:
        责任方 = "不明确"
        处理方案 = "人工审核"
        置信度 = 50%
    else:
        责任方 = "卖家"
        处理方案 = "全额退款"
        置信度 = 80%
```

### 4. AI 深度分析

```python
# 使用 Ollama + Qwen3 模型
prompt = """
你是专业的电商纠纷仲裁专家。
请分析以下争议案件：
- 交易信息
- 双方主张
- 证据情况
- 聊天记录

给出你的专业判断。
"""

# AI 分析结果作为补充参考
ai_analysis → 添加到详细理由中
```

### 5. 置信度计算

```python
# 基础置信度（来自规则引擎）
base_confidence = rule_judgment["confidence"]

# 证据差距调整
evidence_gap = abs(buyer_evidence_score - seller_evidence_score)
confidence_adjustment = -evidence_gap * 0.5

# 最终置信度
final_confidence = clamp(
    base_confidence + confidence_adjustment,
    min=30,
    max=95
)
```

## 🎨 前端界面设计

### 左侧：信息输入区

1. **基础信息**
   - 交易金额
   - 交易描述
   - 争议类型（下拉选择）

2. **双方陈述**
   - 买家主张（文本框）
   - 卖家回应（文本框）

3. **聊天记录**
   - 多行文本输入
   - 每行一条消息

4. **证据管理**
   - 买家证据列表
   - 卖家证据列表
   - 支持添加/删除证据
   - 证据类型：文字/图片/物流

### 右侧：仲裁结果展示

1. **案件编号**
   - 格式: CASE-YYYYMMDDHHMMSS

2. **责任判定**
   - 颜色编码
   - 卖家责任：红色
   - 买家责任：橙色
   - 双方责任：紫色
   - 不明确：灰色

3. **处理方案**
   - 清晰的文字说明

4. **置信度评分**
   - 进度条可视化
   - 颜色编码
   - 高 (80%+): 绿色
   - 中 (60-79%): 橙色
   - 低 (<60%): 红色

5. **详细理由**
   - 规则判断
   - 证据分析
   - 聊天分析
   - AI 分析

6. **证据汇总**
   - 买家证据数量
   - 卖家证据数量
   - 聊天记录条数

7. **操作建议**
   - 具体的执行建议
   - 风险提示

## 🔧 技术架构

### 后端 (Python + Flask)

```
Hackathon/backend/
├── dispute_arbitration_api.py    # 争议仲裁 API
├── start_dispute_api.bat         # Windows 启动脚本
└── test_dispute_api.py           # API 测试脚本
```

**核心模块:**
- `analyze_chat_history()`: 聊天记录分析
- `analyze_evidence()`: 证据完整性分析
- `rule_based_judgment()`: 规则引擎判断
- `ai_deep_analysis()`: AI 深度分析
- `generate_recommendations()`: 生成操作建议

### 前端 (React + TypeScript)

```
Hackathon/frontend/src/components/
├── DisputeArbitration.tsx        # 主组件
└── DisputeArbitration.css        # 样式文件
```

**核心功能:**
- 表单数据管理
- 证据动态添加/删除
- API 请求处理
- 结果可视化展示

## 📡 API 接口

### 健康检查

```http
GET http://localhost:8002/health
```

### 争议分析

```http
POST http://localhost:8002/api/dispute/analyze
Content-Type: application/json

{
  "amount": "1000",
  "description": "购买 iPhone",
  "dispute_type": "seller_no_ship",
  "buyer_claim": "卖家未发货",
  "seller_response": "会尽快发货",
  "chat_history": ["买家: 什么时候发货？", "卖家: 马上"],
  "buyer_evidence": [
    {"type": "text", "content": "付款凭证"}
  ],
  "seller_evidence": []
}
```

**响应:**
```json
{
  "case_id": "CASE-20260206150000",
  "responsibility": "seller",
  "responsibility_text": "卖家责任",
  "resolution": "full_refund",
  "resolution_text": "全额退款给买家",
  "confidence": 85,
  "detailed_reasons": [
    "📋 规则判断: 卖家未提供发货证明",
    "🔍 买家证据: ✅ 提供了文字说明; ⚠️ 缺少图片证据",
    "🤖 AI 分析: 卖家明显违约，建议全额退款"
  ],
  "evidence_summary": {
    "buyer_evidence_count": 1,
    "seller_evidence_count": 0,
    "chat_messages_count": 2
  },
  "recommendations": [
    "置信度高，建议直接执行仲裁决定"
  ]
}
```

### 获取争议类型

```http
GET http://localhost:8002/api/dispute/types
```

## 🚀 未来优化方向

1. **多模态 AI 集成**
   - 图片识别（GPT-4V / Claude 3）
   - 自动识别商品真伪
   - 分析损坏程度

2. **区块链存证**
   - 将仲裁结果上链
   - 不可篡改的证据记录
   - 透明的仲裁历史

3. **机器学习优化**
   - 基于历史案例训练模型
   - 提高判断准确率
   - 自动学习新型诈骗模式

4. **多语言支持**
   - 国际化仲裁服务
   - 自动翻译功能

5. **视频通话集成**
   - 在线调解功能
   - 实时沟通记录

## 📝 注意事项

1. **AI 辅助，人工决策**
   - AI 仅提供建议，最终决策需人工复核
   - 高风险案件必须人工审核

2. **证据真实性**
   - 系统无法验证证据真伪
   - 需要配合其他验证手段

3. **隐私保护**
   - 敏感信息需要脱敏处理
   - 遵守数据保护法规

4. **法律合规**
   - 仲裁建议不具法律效力
   - 重大争议需走法律程序

---

**版本:** 1.0.0  
**更新日期:** 2026-02-06  
**作者:** Hackathon Team
