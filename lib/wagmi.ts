import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { cookieStorage, createStorage, http } from 'wagmi';
import { blast } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'PacBoom',
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'pacboom-local-development',
  chains: [blast],
  transports: {
    [blast.id]: http(process.env.NEXT_PUBLIC_BLAST_RPC_URL ?? 'https://rpc.blast.io'),
  },
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
