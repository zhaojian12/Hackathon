import { http, createConfig } from 'wagmi';
import { confluxESpace } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Conflux eSpace 测试网配置
const confluxESpaceTestnet = {
  id: 71,
  name: 'Conflux eSpace Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'CFX',
    symbol: 'CFX',
  },
  rpcUrls: {
    default: { http: ['https://evmtestnet.confluxrpc.com'] },
    public: { http: ['https://evmtestnet.confluxrpc.com'] },
  },
  blockExplorers: {
    default: { name: 'ConfluxScan', url: 'https://evmtestnet.confluxscan.io' },
  },
  testnet: true,
} as const;

// 仅使用 injected 连接器（支持 MetaMask、OKX 等）
const connectors = [
  injected({
    shimDisconnect: true,
  }),
];

// 配置 Wagmi
export const wagmiConfig = createConfig({
  chains: [confluxESpaceTestnet],
  connectors,
  transports: {
    [confluxESpaceTestnet.id]: http('https://evmtestnet.confluxrpc.com'),
  },
  ssr: false,
});
