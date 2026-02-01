# 快速开始指南

## 🚀 5 分钟快速上手

### 步骤 1: 安装依赖

```bash
cd Hackathon/frontend
npm install
```

### 步骤 2: 启动应用

```bash
npm run dev
```

应用将在 http://localhost:5173 启动

### 步骤 3: 安装钱包（选择其一）

#### 选项 A: MetaMask（推荐）
1. 访问 https://metamask.io/
2. 点击 "Download" 安装浏览器扩展
3. 创建新钱包或导入现有钱包

#### 选项 B: OKX Wallet
1. 访问 https://www.okx.com/web3
2. 下载并安装浏览器扩展
3. 创建新钱包或导入现有钱包

#### 选项 C: Fluent Wallet
1. 访问 https://fluentwallet.com/
2. 下载并安装浏览器扩展
3. 创建新钱包或导入现有钱包

### 步骤 4: 连接钱包

1. 打开应用 http://localhost:5173
2. 点击右上角的 "Connect Wallet" 按钮
3. 在钱包扩展中点击 "连接" 或 "Connect"
4. 如果提示切换网络，点击 "切换网络" 或 "Switch Network"

### 步骤 5: 获取测试代币

#### 对于 MetaMask/OKX 用户
1. 访问 https://efaucet.confluxnetwork.org/
2. 输入你的钱包地址
3. 点击 "Claim" 获取测试 CFX

#### 对于 Fluent 用户
1. 访问 https://faucet.confluxnetwork.org/
2. 输入你的钱包地址
3. 点击 "Claim" 获取测试 CFX

## ✅ 验证安装

连接成功后，你应该看到：
- ✅ 钱包地址显示在右上角（例如：0x1234...5678）
- ✅ CFX 余额显示（例如：10.0000 CFX）
- ✅ 钱包类型图标（🦊 OKX、🦊 MetaMask 或 💧 Fluent）

## 🎯 开始使用

现在你可以：
1. **创建交易**: 在左侧面板填写交易信息
2. **查看交易**: 在右侧面板查看所有交易
3. **管理交易**: 接受、取消或完成交易

## 🔧 常见问题

### Q: 钱包连接失败？
**A**: 检查以下几点：
- 钱包扩展是否已安装并启用
- 钱包是否已解锁
- 浏览器是否允许弹出窗口

### Q: 看不到余额？
**A**: 
- 确认已连接到正确的网络
- 访问水龙头获取测试代币
- 刷新页面重新连接

### Q: 多个钱包冲突？
**A**: 
- 系统会自动选择优先级最高的钱包
- 如需使用特定钱包，可临时禁用其他钱包扩展

## 📚 更多信息

- 详细技术文档：[WALLET_INTEGRATION.md](./WALLET_INTEGRATION.md)
- 完整安装指南：[INSTALLATION.md](./INSTALLATION.md)
- 项目总结：[../MULTI_WALLET_SUMMARY.md](../MULTI_WALLET_SUMMARY.md)

## 🆘 需要帮助？

如果遇到问题：
1. 查看浏览器控制台（F12）的错误信息
2. 阅读上述文档
3. 检查钱包和网络配置

---

**祝你使用愉快！** 🎉
