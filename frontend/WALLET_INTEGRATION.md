# 多钱包集成说明

本项目已集成多钱包支持，兼容以下钱包：

## 支持的钱包

### 1. MetaMask（狐狸钱包）
- **类型**: EVM 兼容钱包
- **下载**: https://metamask.io/
- **支持网络**: Conflux eSpace Testnet (Chain ID: 71)

### 2. OKX Wallet（OKX 钱包）
- **类型**: EVM 兼容钱包
- **下载**: https://www.okx.com/web3
- **支持网络**: Conflux eSpace Testnet (Chain ID: 71)

### 3. Fluent Wallet（Conflux 原生钱包）
- **类型**: Conflux 原生钱包
- **下载**: https://fluentwallet.com/
- **支持网络**: Conflux Core Testnet

## 技术实现

### 架构设计

项目使用了混合架构，同时支持：
- **Wagmi**: 用于 EVM 兼容钱包（MetaMask、OKX）
- **js-conflux-sdk**: 用于 Conflux 原生钱包（Fluent）

### 钱包检测逻辑

```typescript
const detectWalletType = () => {
    // 1. 检测 OKX 钱包
    if (window.okxwallet) return 'okx';
    
    // 2. 检测 MetaMask
    if (window.ethereum?.isMetaMask) return 'metamask';
    
    // 3. 处理多钱包冲突
    if (window.ethereum?.providers?.length) {
        // 优先选择 MetaMask
        const metamaskProvider = window.ethereum.providers.find(
            (p: any) => p.isMetaMask && !p.isOkxWallet
        );
        if (metamaskProvider) return 'metamask';
    }
    
    // 4. 检测 Fluent 钱包
    if (window.conflux?.isFluent) return 'fluent';
    
    return null;
};
```

### 网络配置

#### Conflux eSpace Testnet (EVM 兼容)
- **Chain ID**: 71 (0x47)
- **RPC URL**: https://evmtestnet.confluxrpc.com
- **浏览器**: https://evmtestnet.confluxscan.io
- **原生代币**: CFX

#### Conflux Core Testnet (Fluent 钱包)
- **Network ID**: 1
- **RPC URL**: https://test.confluxrpc.com
- **浏览器**: https://testnet.confluxscan.io
- **原生代币**: CFX

## 使用方法

### 1. 安装依赖

```bash
cd Hackathon/frontend
npm install
```

新增的依赖包括：
- `wagmi`: EVM 钱包连接库
- `viem`: 以太坊交互库
- `@tanstack/react-query`: 状态管理

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 连接钱包

1. 点击页面上的 "Connect Wallet" 按钮
2. 系统会自动检测已安装的钱包
3. 根据检测到的钱包类型，自动选择合适的连接方式
4. 如果是 EVM 钱包（MetaMask/OKX），会自动提示切换到 Conflux eSpace 测试网

### 4. 多钱包冲突处理

如果同时安装了多个钱包扩展，系统会：
1. 优先使用 OKX 钱包（如果检测到 `window.okxwallet`）
2. 其次使用 MetaMask（从 `window.ethereum.providers` 中筛选）
3. 最后使用 Fluent 钱包（Conflux 原生）

## 代码结构

```
Hackathon/frontend/src/
├── config/
│   └── wagmi.ts              # Wagmi 配置（EVM 钱包）
├── components/
│   └── ConnectWallet.tsx     # 钱包连接组件
├── AppContext.tsx            # 应用上下文（包含钱包逻辑）
└── App.tsx                   # 主应用组件
```

## 关键文件说明

### `config/wagmi.ts`
配置 Wagmi 以支持 Conflux eSpace 测试网：
- 定义链配置
- 配置 RPC 端点
- 设置 injected 连接器

### `AppContext.tsx`
核心钱包逻辑：
- 钱包类型检测
- 多钱包连接处理
- 网络切换逻辑
- 余额查询

### `ConnectWallet.tsx`
UI 组件：
- 显示连接状态
- 显示钱包类型图标
- 显示账户地址和余额

## 测试建议

### 测试场景 1: 单一钱包
1. 只安装 MetaMask
2. 连接钱包
3. 验证自动切换到 Conflux eSpace 测试网

### 测试场景 2: 多钱包共存
1. 同时安装 MetaMask 和 OKX 钱包
2. 连接钱包
3. 验证系统正确识别并使用预期的钱包

### 测试场景 3: Fluent 钱包
1. 安装 Fluent 钱包
2. 连接钱包
3. 验证使用 Conflux Core 测试网

## 常见问题

### Q: 为什么需要同时支持 EVM 和 Conflux 原生？
A: Conflux 有两个空间：
- **Core Space**: 原生 Conflux 链，使用 Fluent 钱包
- **eSpace**: EVM 兼容空间，使用 MetaMask/OKX 等 EVM 钱包

### Q: 如何添加新的钱包支持？
A: 在 `detectWalletType()` 函数中添加新的检测逻辑，并在 `connectWallet()` 中添加相应的连接处理。

### Q: 多钱包冲突如何解决？
A: 系统会按优先级选择：OKX > MetaMask > Fluent。可以在 `detectWalletType()` 中调整优先级。

## 参考资源

- [Wagmi 文档](https://wagmi.sh/)
- [Conflux 文档](https://doc.confluxnetwork.org/)
- [MetaMask 文档](https://docs.metamask.io/)
- [OKX Wallet 文档](https://www.okx.com/web3/build/docs/sdks/chains/evm/provider)
