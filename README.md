# WIS Pay - 下一代去中心化跨境支付平台

WIS Pay 是一个基于 Conflux 区块链构建的创新型跨境支付与贸易融资平台。我们致力于消除传统跨境支付的痛点，通过结合 **EIP-7702 无感钱包** 技术与 **链上合规流程**，为全球中小企业提供即时、低成本且合规的资金结算体验。

## ✨ 核心特性

### 🔐 EIP-7702 无感钱包 (Invisible Wallet)
打破 Web2 与 Web3 的界限，用户无需管理复杂的助记词或私钥。
- **社交登录**：支持 Google, Apple ID, 手机号验证码直接登录。
- **账户抽象**：自动为用户生成并管理链上账户，体验如传统 App 般丝滑。
- **零 Gas 费体验**：通过代付机制，用户无需持有原生代币即可发起交易。

### 🛡️ 全流程合规 (Compliance Flow)
专为跨境贸易设计的合规架构，确保资金流转符合监管要求。
- **KYC/AML 集成**：内置身份验证与反洗钱筛查流程。
- **白名单机制**：只有通过验证的实体才能参与特定的贸易活动。
- **链上审计**：每一笔交易都可追踪、可审计，满足审计需求。

### 💰 供应链金融 (Supply Chain Financing)
释放供应链中的流动性，解决中小企业融资难问题。
- **基于信用的融资**：利用链上交易历史作为信用凭证，快速获取贷款。
- **订单融资**：支持基于采购订单 (PO) 的提前放款。
- **透明费率**：智能合约自动执行还款，费率透明不可篡改。

### 💱 多币种实时结算
- 支持 **CFX**, **CNH** (离岸人民币), **USDT**, **USDC** 等主流资产。
- 集成 Chainlink 预言机获取实时汇率，确保兑换价格公正透明。

### ⭐ 商户信誉系统
- 每一笔成功的交易都会增加商户的链上信誉分。
- 透明的评价机制，帮助买家筛选优质供应商。

## 🏗️ 系统架构

### 前端技术栈
- **核心框架**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **语言**: TypeScript
- **Web3 集成**: [Wagmi](https://wagmi.sh/) + [Viem](https://viem.sh/)
- **UI 组件**: Lucide React (图标), 自定义 Glassmorphism 设计风格
- **国际化**: i18next (支持 中文/英文/繁体)

### 区块链后端
- **网络**: Conflux eSpace (EVM 兼容)
- **智能合约**: Solidity
- **开发框架**: Hardhat
- **关键标准**: ERC-20, EIP-7702 (账户抽象)

## 🚀 快速开始

### 前置要求
- Node.js 18+
- Node.js 18+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd Hackathon
   ```

2. **前端启动**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   应用将在 `http://localhost:5173` 启动。

3. **后端部署 (可选)**
   如果您需要本地部署合约：
   ```bash
   cd backend
   npm install
   npx hardhat node
   # 在新终端窗口部署合约
   npx hardhat run scripts/deploy.js --network localhost
   ```

## 📂 项目结构

```
Hackathon/
├── frontend/                 # React 前端应用
│   ├── src/
│   │   ├── components/      # 核心组件 (Dashboard, TradeList, AuthScreen 等)
│   │   ├── contracts/       # 合约 ABI 与地址配置
│   │   ├── locales/         # 多语言文件
│   │   └── ...
│   ├── public/              # 静态资源
│   └── ...
├── backend/                  # 智能合约与部署脚本
│   ├── contracts/           # Solidity 源码 (Escrow, Trade, Token)
│   ├── scripts/             # 部署脚本
│   └── test/                # 合约测试
└── README.md                # 项目文档
```

## 🤝 贡献指南

欢迎提交 Issue 或 Pull Request 来改进 WIS Pay！

## 📄 许可证

MIT License

---

**注意**：本项目为 Hackathon 参赛作品，目前部署于 Conflux eSpace 测试网，请勿用于真实资产交易。
