'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

type WalletSession = {
  status: SessionStatus;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
};

const SessionContext = createContext<WalletSession | null>(null);
const LOGIN_MESSAGE =
  'Welcome to PacBoom! Sign this message to save scores and claim PAC BOOM points. This request does not trigger a blockchain transaction.';

export function WalletSessionProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isConnected || !address) {
      setStatus('unauthenticated');
      return;
    }

    setStatus('loading');
    try {
      const response = await fetch('/verify-jwt', {
        method: 'POST',
        credentials: 'include',
      });
      const data = response.ok ? await response.json() : null;
      setStatus(
        data?.userAddress?.toLowerCase() === address.toLowerCase()
          ? 'authenticated'
          : 'unauthenticated',
      );
    } catch {
      setStatus('unauthenticated');
    }
  }, [address, isConnected]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const signIn = useCallback(async () => {
    if (!address) return;
    setError(null);
    setStatus('loading');
    try {
      const signature = await signMessageAsync({ message: LOGIN_MESSAGE });
      const response = await fetch('/loginOrSaveUser', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: address, message: LOGIN_MESSAGE, signature }),
      });
      if (!response.ok) throw new Error('Wallet authentication failed.');
      setStatus('authenticated');
    } catch (reason) {
      setStatus('unauthenticated');
      setError(reason instanceof Error ? reason.message : 'Unable to sign in.');
    }
  }, [address, signMessageAsync]);

  const signOut = useCallback(async () => {
    try {
      await fetch('/logoutUser', { method: 'POST', credentials: 'include' });
    } finally {
      disconnect();
      setStatus('unauthenticated');
    }
  }, [disconnect]);

  const value = useMemo(
    () => ({ status, signIn, signOut, error }),
    [status, signIn, signOut, error],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useWalletSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useWalletSession must be used inside WalletSessionProvider');
  return session;
}
