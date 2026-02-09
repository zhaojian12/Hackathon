# Hackathon - 去中心化交易平台

一个支持多钱包的去中心化交易平台，基于 Conflux 区块链构建。

## ✨ 特性

### 🔐 钱包支持
- **Fluent Wallet** - Conflux 原生

### 🌐 多网络支持
- **Conflux eSpace Testnet** - 用于 MetaMask/OKX
- **Conflux Core Testnet** - 用于 Fluent

### 🎯 核心功能
- ✅ 创建去中心化交易
- ✅ 接受和管理交易
- ✅ 自动托管和释放资金
- ✅ 多语言支持（中文/英文/繁体中文）
- ✅ 实时余额显示
- ✅ 交易状态追踪

## 🚀 快速开始

### 前置要求
- Node.js 16+
- npm 或 yarn
- 任一支持的钱包扩展

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd Hackathon/frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

应用将在 http://localhost:5173 启动

### 详细指南
- 📖 [快速开始指南](./frontend/QUICKSTART.md)
- 📖 [快速开始（中文）](./frontend/快速开始.md)
- 📖 [完整安装指南](./frontend/INSTALLATION.md)

## 📚 文档

### 用户文档
- [快速开始](./frontend/QUICKSTART.md) - 5 分钟上手指南
- [快速开始（中文）](./frontend/快速开始.md) - 中文版快速指南
- [安装指南](./frontend/INSTALLATION.md) - 详细安装步骤

### 开发文档
- [钱包集成](./frontend/WALLET_INTEGRATION.md) - 技术实现详解
- [项目总结](./MULTI_WALLET_SUMMARY.md) - 架构和变更说明
- [更新日志](./CHANGELOG.md) - 版本历史

## 🏗️ 项目结构

```
Hackathon/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/      # React 组件
│   │   ├── config/          # 配置文件
│   │   ├── contracts/       # 合约 ABI
│   │   ├── locales/         # 国际化文件
│   │   ├── App.tsx          # 主应用
│   │   └── AppContext.tsx   # 应用上下文
│   ├── QUICKSTART.md        # 快速开始
│   ├── INSTALLATION.md      # 安装指南
│   └── WALLET_INTEGRATION.md # 钱包集成文档
├── backend/                 # 后端（智能合约）
│   ├── contracts/           # Solidity 合约
│   └── scripts/             # 部署脚本
├── MULTI_WALLET_SUMMARY.md  # 项目总结
└── CHANGELOG.md             # 更新日志
```

## 🔧 技术栈

### 前端
- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Wagmi** - EVM 钱包连接
- **js-conflux-sdk** - Conflux SDK
- **React i18next** - 国际化

### 区块链
- **Conflux eSpace** - EVM 兼容层
- **Conflux Core** - 原生 Conflux 链
- **Solidity** - 智能合约语言

## 🎮 使用方法

### 1. 连接钱包
1. 点击 "Connect Wallet" 按钮
2. 选择你的钱包（自动检测）
3. 授权连接并切换网络

### 2. 创建交易
1. 填写交易信息
2. 选择代币类型
3. 输入金额和接收地址
4. 点击 "创建交易"

### 3. 管理交易
- **接受交易**：作为接收方确认
- **取消交易**：作为创建者取消
- **完成交易**：双方确认后完成

## 🌍 支持的网络

### Conflux eSpace Testnet
- **Chain ID**: 71
- **RPC**: https://evmtestnet.confluxrpc.com
- **浏览器**: https://evmtestnet.confluxscan.io
- **水龙头**: https://efaucet.confluxnetwork.org/

### Conflux Core Testnet
- **Network ID**: 1
- **RPC**: https://test.confluxrpc.com
- **浏览器**: https://testnet.confluxscan.io
- **水龙头**: https://faucet.confluxnetwork.org/

## 🔐 安全性

- ✅ 仅支持测试网络
- ✅ 智能合约托管资金
- ✅ 用户完全控制私钥
- ✅ 开源可审计

## 🤝 贡献

欢迎贡献！请查看我们的贡献指南。

## 📄 许可证

MIT License

## 🆘 支持

遇到问题？
1. 查看 [快速开始指南](./frontend/QUICKSTART.md)
2. 阅读 [常见问题](./frontend/INSTALLATION.md#故障排除)
3. 提交 GitHub Issue

## 🙏 致谢

- Conflux Network
- AttentionLive 项目（参考实现）
- 开源社区

---

**注意**：本项目仅用于测试环境，请勿在主网使用真实资产。
