# 更新日志 (Changelog)

## [2.0.0] - 2026-02-02

### 🎉 重大更新：多钱包支持

本次更新为项目添加了完整的多钱包支持，参考 AttentionLive 项目实现。

### ✨ 新增功能

#### 钱包支持
- ✅ **OKX 钱包**：支持 OKX 浏览器扩展钱包
- ✅ **MetaMask**：支持 MetaMask（狐狸钱包）
- ✅ **Fluent 钱包**：保留原有 Conflux 原生钱包支持

#### 自动化功能
- ✅ **自动钱包检测**：智能识别已安装的钱包类型
- ✅ **自动网络切换**：连接时自动切换到正确的测试网
- ✅ **自动网络添加**：如果网络不存在，自动添加配置
- ✅ **多钱包冲突处理**：智能处理多个钱包扩展共存的情况

#### 用户体验
- ✅ **钱包类型显示**：连接后显示钱包类型图标
- ✅ **余额实时显示**：自动查询并显示 CFX 余额
- ✅ **友好错误提示**：清晰的错误信息和解决建议
- ✅ **加载状态指示**：连接过程中的加载动画

### 🔧 技术改进

#### 新增依赖
```json
{
  "@tanstack/react-query": "^5.62.14",
  "viem": "^2.21.66",
  "wagmi": "^2.15.3"
}
```

#### 新增文件
- `src/config/wagmi.ts` - Wagmi 配置文件
- `WALLET_INTEGRATION.md` - 钱包集成技术文档
- `INSTALLATION.md` - 安装和运行指南
- `QUICKSTART.md` - 快速开始指南（英文）
- `快速开始.md` - 快速开始指南（中文）
- `MULTI_WALLET_SUMMARY.md` - 项目更新总结

#### 更新文件
- `src/AppContext.tsx` - 添加多钱包支持逻辑
- `src/components/ConnectWallet.tsx` - 更新 UI 显示
- `package.json` - 添加新依赖

### 🏗️ 架构变更

#### 混合架构
```
应用层
  ├── Wagmi (EVM 钱包)
  │   ├── MetaMask
  │   └── OKX
  └── js-conflux-sdk (Conflux 原生)
      └── Fluent
```

#### 钱包检测优先级
1. OKX 钱包 (`window.okxwallet`)
2. MetaMask (`window.ethereum.isMetaMask`)
3. 多钱包处理 (`window.ethereum.providers`)
4. Fluent 钱包 (`window.conflux.isFluent`)

### 🌐 网络支持

#### Conflux eSpace Testnet (新增)
- **Chain ID**: 71 (0x47)
- **RPC**: https://evmtestnet.confluxrpc.com
- **适用钱包**: MetaMask, OKX
- **浏览器**: https://evmtestnet.confluxscan.io

#### Conflux Core Testnet (保留)
- **Network ID**: 1
- **RPC**: https://test.confluxrpc.com
- **适用钱包**: Fluent
- **浏览器**: https://testnet.confluxscan.io

### 📚 文档更新

#### 新增文档
1. **技术文档**
   - `WALLET_INTEGRATION.md` - 详细的技术实现说明
   - `MULTI_WALLET_SUMMARY.md` - 项目架构和变更总结

2. **用户指南**
   - `INSTALLATION.md` - 完整的安装步骤
   - `QUICKSTART.md` - 5 分钟快速上手（英文）
   - `快速开始.md` - 5 分钟快速上手（中文）

3. **开发文档**
   - 代码注释增强
   - 类型定义完善
   - 调试日志优化

### 🐛 问题修复

- 修复多钱包冲突导致的连接失败
- 修复网络切换时的状态不同步
- 修复余额显示延迟问题
- 优化错误处理逻辑

### 🔒 安全性

- ✅ 所有钱包操作都经过用户授权
- ✅ 私钥和助记词不会被应用访问
- ✅ 仅支持测试网络，避免真实资产风险
- ✅ 完善的错误处理，防止意外操作

### ⚡ 性能优化

- 减少不必要的 RPC 调用
- 优化钱包检测逻辑
- 改进状态管理效率
- 添加请求缓存机制

### 🎨 UI/UX 改进

- 钱包类型图标显示
  - 🦊 OKX 钱包
  - 🦊 MetaMask
  - 💧 Fluent 钱包
- 连接状态视觉反馈
- 加载动画优化
- 错误提示美化

### 📦 依赖更新

#### 新增
- `wagmi@^2.15.3` - EVM 钱包连接框架
- `viem@^2.21.66` - 以太坊交互库
- `@tanstack/react-query@^5.62.14` - 状态管理

#### 保留
- `js-conflux-sdk@^2.5.1` - Conflux SDK
- `react@^19.2.0` - React 框架
- `react-i18next@^16.5.4` - 国际化支持

### 🔄 向后兼容性

- ✅ 完全兼容原有 Fluent 钱包功能
- ✅ 不影响现有合约交互逻辑
- ✅ 保留所有原有 API 接口
- ✅ 无需修改现有业务代码

### 📝 迁移指南

#### 从 v1.x 升级到 v2.0

1. **安装新依赖**
   ```bash
   npm install
   ```

2. **无需代码修改**
   - 原有功能完全兼容
   - 自动支持新钱包

3. **测试验证**
   - 测试 Fluent 钱包连接
   - 测试新钱包（MetaMask/OKX）
   - 验证交易功能正常

### 🎯 未来计划

#### v2.1.0 (计划中)
- [ ] 添加钱包选择器 UI
- [ ] 支持账户切换监听
- [ ] 支持网络切换监听
- [ ] 添加断开连接功能

#### v2.2.0 (计划中)
- [ ] 支持 WalletConnect
- [ ] 支持 Coinbase Wallet
- [ ] 添加钱包连接教程
- [ ] 多语言支持增强

#### v3.0.0 (远期规划)
- [ ] 主网支持
- [ ] 更多链支持
- [ ] 高级交易功能
- [ ] 移动端适配

### 🙏 致谢

感谢 AttentionLive 项目提供的参考实现。

### 📞 支持

- 📖 查看文档：`frontend/WALLET_INTEGRATION.md`
- 🚀 快速开始：`frontend/QUICKSTART.md`
- 🐛 报告问题：GitHub Issues

---

## [1.0.0] - 2026-01-XX

### 初始版本

- ✅ 基础交易功能
- ✅ Fluent 钱包支持
- ✅ Conflux Core 测试网
- ✅ 国际化支持（中文/英文/繁体中文）
- ✅ 基础 UI 组件

---

**注意**：本项目仅用于测试环境，请勿在主网使用。
