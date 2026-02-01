# 安装和运行指南

## 快速开始

### 1. 安装依赖

```bash
cd Hackathon/frontend
npm install
```

这将安装以下新增的依赖：
- `wagmi@^2.15.3` - EVM 钱包连接库
- `viem@^2.21.66` - 以太坊交互库
- `@tanstack/react-query@^5.62.14` - 状态管理库

### 2. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:5173 启动

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产构建

```bash
npm run preview
```

## 钱包准备

### 安装钱包扩展

根据你的需求，安装以下任一钱包：

#### MetaMask（推荐）
1. 访问 https://metamask.io/
2. 下载并安装浏览器扩展
3. 创建或导入钱包

#### OKX Wallet
1. 访问 https://www.okx.com/web3
2. 下载并安装浏览器扩展
3. 创建或导入钱包

#### Fluent Wallet（Conflux 原生）
1. 访问 https://fluentwallet.com/
2. 下载并安装浏览器扩展
3. 创建或导入钱包

### 配置网络

#### 对于 MetaMask/OKX 钱包

应用会自动提示添加 Conflux eSpace 测试网，或者你可以手动添加：

**网络名称**: Conflux eSpace Testnet
**RPC URL**: https://evmtestnet.confluxrpc.com
**Chain ID**: 71
**货币符号**: CFX
**区块浏览器**: https://evmtestnet.confluxscan.io

#### 对于 Fluent 钱包

1. 打开 Fluent 钱包
2. 切换到 Conflux 测试网
3. 确保网络 ID 为 1

## 获取测试代币

### Conflux eSpace 测试网（MetaMask/OKX）
访问水龙头获取测试 CFX：
- https://efaucet.confluxnetwork.org/

### Conflux Core 测试网（Fluent）
访问水龙头获取测试 CFX：
- https://faucet.confluxnetwork.org/

## 验证安装

1. 启动开发服务器
2. 打开浏览器访问 http://localhost:5173
3. 点击 "Connect Wallet" 按钮
4. 选择你的钱包并授权连接
5. 确认钱包已连接并显示余额

## 故障排除

### 问题：npm install 失败

**解决方案**:
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 问题：钱包连接失败

**检查清单**:
1. 确认钱包扩展已安装并启用
2. 确认钱包已解锁
3. 确认网络配置正确
4. 检查浏览器控制台是否有错误信息

### 问题：多个钱包冲突

**解决方案**:
- 系统会自动选择优先级最高的钱包
- 如需使用特定钱包，可以临时禁用其他钱包扩展
- 优先级顺序：OKX > MetaMask > Fluent

### 问题：网络切换失败

**解决方案**:
1. 手动在钱包中切换到正确的网络
2. 如果网络不存在，使用上面的配置手动添加
3. 刷新页面重新连接

## 开发建议

### 调试模式

打开浏览器开发者工具（F12），查看控制台输出：
- 🔍 表示钱包检测信息
- ✅ 表示成功操作
- ❌ 表示错误信息

### 热重载

Vite 支持热模块替换（HMR），修改代码后会自动刷新页面。

### TypeScript 检查

```bash
npm run lint
```

## 下一步

- 阅读 [WALLET_INTEGRATION.md](./WALLET_INTEGRATION.md) 了解钱包集成详情
- 查看 [README.md](./README.md) 了解项目功能
- 开始使用应用创建和管理交易！
