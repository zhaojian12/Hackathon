# 智能风险评估系统使用指南

## 📋 功能概述

智能风险评估系统是 Hackathon 项目的核心功能之一，使用 AI 技术对交易进行实时风险分析和预警。

### 主要功能

1. **实时风险评分** (0-100分)
   - 低风险 (0-29分): 绿色标识
   - 中风险 (30-59分): 黄色标识
   - 高风险 (60-100分): 红色标识

2. **多维度风险分析**
   - 交易金额风险评估
   - 诈骗关键词检测
   - 地址格式验证
   - 交易描述完整性检查
   - AI 深度语义分析

3. **智能建议**
   - 是否建议继续交易
   - 建议的托管时长（3-14天）
   - 详细的风险原因说明

## 🚀 快速开始

### 1. 启动后端服务

#### Windows 用户
```bash
cd Hackathon/backend
start_risk_api.bat
```

#### Linux/Mac 用户
```bash
cd Hackathon/backend
chmod +x start_risk_api.sh
./start_risk_api.sh
```

#### 手动启动
```bash
cd Hackathon/backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python risk_assessment_api.py
```

服务将在 `http://localhost:8001` 启动

### 2. 启动前端

```bash
cd Hackathon/frontend
npm run dev
```

前端将在 `http://localhost:5173` 启动

### 3. 使用风险评估功能

1. 打开浏览器访问 `http://localhost:5173`
2. 跳过启动页面进入主界面
3. 点击顶部导航栏的 **"风险评估"** 按钮
4. 填写交易信息：
   - 交易金额
   - 交易描述
   - 买家地址
   - 卖家地址
5. 点击 **"分析风险"** 按钮
6. 查看详细的风险评估报告

## 📊 风险评估算法

### 评分规则

1. **金额风险** (0-70分)
   - < 100 cUSD: 10分
   - 100-1000 cUSD: 20分
   - 1000-10000 cUSD: 40分
   - > 10000 cUSD: 70分

2. **关键词检测** (0-50分)
   - 每检测到一个诈骗关键词: +15分
   - 最高累计: 50分

3. **地址风险** (0-60分)
   - 地址格式异常: 60分
   - 可疑新地址: 50分
   - 地址为空: 30分

4. **描述完整性** (0-20分)
   - 描述过于简单或为空: 20分

5. **AI 深度分析**
   - 使用 Ollama + Qwen3 模型
   - 语义理解和风险识别
   - 提供专业的风险分析意见

### 诈骗关键词库

系统内置了常见的诈骗关键词，包括：
- 紧急类: urgent, 紧急, 立即, 马上
- 投资类: investment, 投资, 返利, 回报
- 奖品类: lottery, 彩票, 中奖, prize
- 金融类: loan, 贷款, credit, 信用
- 加密货币类: bitcoin, crypto, 虚拟币

## 🔧 技术架构

### 后端 (Python + Flask)

```
Hackathon/backend/
├── risk_assessment_api.py    # 风险评估 API 服务
├── start_risk_api.sh         # Linux/Mac 启动脚本
└── start_risk_api.bat         # Windows 启动脚本
```

**技术栈:**
- Flask: Web 框架
- Flask-CORS: 跨域支持
- Ollama: 本地 AI 推理引擎
- Qwen3: 中文大语言模型

### 前端 (React + TypeScript)

```
Hackathon/frontend/src/
├── components/
│   ├── RiskAssessment.tsx     # 风险评估主组件
│   └── RiskAssessment.css     # 样式文件
└── locales/
    ├── zh-CN.json             # 简体中文
    ├── zh-TW.json             # 繁体中文
    └── en.json                # 英文
```

**技术栈:**
- React 19
- TypeScript
- i18next: 国际化
- CSS3: 现代化 UI

## 🌐 API 接口

### 健康检查

```http
GET http://localhost:8001/health
```

**响应:**
```json
{
  "status": "ok",
  "service": "Risk Assessment API",
  "timestamp": "2026-02-06T10:30:00"
}
```

### 风险评估

```http
POST http://localhost:8001/api/risk/assess
Content-Type: application/json

{
  "amount": "1000",
  "description": "购买二手笔记本电脑",
  "buyer_address": "0x1234567890abcdef1234567890abcdef12345678",
  "seller_address": "0xabcdef1234567890abcdef1234567890abcdef12"
}
```

**响应:**
```json
{
  "risk_score": 25,
  "risk_level": "low",
  "risk_level_text": "低风险",
  "risk_reasons": [
    "未发现明显风险因素",
    "AI 分析: 交易描述清晰，金额合理"
  ],
  "recommendation": "建议继续交易",
  "should_continue": true,
  "suggested_escrow_days": 3,
  "timestamp": "2026-02-06T10:30:00"
}
```

## 🎨 UI 设计特点

1. **现代化设计**
   - 深色主题
   - 玻璃态效果 (Glassmorphism)
   - 流畅的动画过渡

2. **直观的视觉反馈**
   - 风险等级颜色编码
   - 动态评分圆环
   - 渐变色徽章

3. **响应式布局**
   - 桌面端: 双栏布局
   - 移动端: 单栏自适应

4. **多语言支持**
   - 中文（简体）
   - 中文（繁体）
   - English

## 🔍 使用场景

### 场景 1: 正常交易
```
金额: 500 cUSD
描述: 购买全新 iPhone 15 Pro
结果: 低风险 (15分) - 建议继续
```

### 场景 2: 可疑交易
```
金额: 50000 cUSD
描述: urgent investment opportunity guaranteed profit
结果: 高风险 (85分) - 不建议继续
```

### 场景 3: 中等风险
```
金额: 5000 cUSD
描述: 二手车交易
结果: 中风险 (45分) - 建议谨慎交易，延长托管
```

## 🛠️ 故障排除

### 问题 1: 无法连接到风险评估服务

**解决方案:**
1. 确认后端服务已启动
2. 检查端口 8001 是否被占用
3. 查看后端日志输出

### 问题 2: AI 分析失败

**解决方案:**
1. 确认 Ollama 服务正在运行: `ollama serve`
2. 确认模型已下载: `ollama pull qwen3:4b-instruct-2507-q4_K_M`
3. 检查 Ollama API 地址配置

### 问题 3: 前端显示错误

**解决方案:**
1. 检查浏览器控制台错误信息
2. 确认前端和后端都在运行
3. 清除浏览器缓存重试

## 📈 未来优化方向

1. **历史记录分析**
   - 记录用户历史交易
   - 基于历史行为评估信用

2. **区块链数据集成**
   - 查询地址历史交易记录
   - 分析链上行为模式

3. **机器学习模型**
   - 训练专门的风险识别模型
   - 持续学习和优化

4. **实时预警**
   - WebSocket 实时通知
   - 风险等级变化提醒

5. **社区评分**
   - 用户信誉系统
   - 社区举报机制

## 📝 开发者注意事项

1. **API 超时设置**
   - AI 分析超时: 30秒
   - 建议在生产环境增加超时时间

2. **并发处理**
   - 当前版本为单线程
   - 高并发场景需要使用 Gunicorn 等 WSGI 服务器

3. **安全性**
   - 生产环境需要添加 API 认证
   - 限制请求频率防止滥用

4. **性能优化**
   - 考虑缓存常见查询结果
   - 使用异步处理提高响应速度

## 📞 技术支持

如有问题，请查看：
- 项目 README: `Hackathon/README.md`
- AI 助手配置: `Hackathon/AI_ASSISTANT_INTEGRATION.md`
- 后端文档: `Hackathon/backend/README.md`

---

**版本:** 1.0.0  
**更新日期:** 2026-02-06  
**作者:** Hackathon Team
