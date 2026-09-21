'use client';

import '@rainbow-me/rainbowkit/styles.css';

import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { State } from 'wagmi';
import { WagmiProvider } from 'wagmi';
import { useState, type ReactNode } from 'react';
import { wagmiConfig } from '@/lib/wagmi';
import { WalletSessionProvider } from '@/components/wallet-session';

export function Providers({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          coolMode
          modalSize="compact"
          theme={darkTheme({
            accentColor: '#fff200',
            accentColorForeground: '#090b12',
            borderRadius: 'medium',
            overlayBlur: 'small',
          })}
        >
          <WalletSessionProvider>{children}</WalletSessionProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
