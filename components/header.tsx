'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useWalletSession } from '@/components/wallet-session';

const links = [
  ['/', 'Play'],
  ['/myaccount', 'Account'],
  ['/about', 'About'],
  ['/leaderboard', 'Leaders'],
] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const session = useWalletSession();

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="PacBoom home">
        <Image src="/img/logo.png" alt="PacBoom" width={154} height={62} priority />
      </Link>

      <button
        type="button"
        className="menu-button"
        aria-label="Toggle navigation"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
      </button>

      <nav className={open ? 'primary-nav is-open' : 'primary-nav'} aria-label="Main navigation">
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className={pathname === href || (href === '/' && pathname === '/index') ? 'active' : ''}
            onClick={() => setOpen(false)}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="wallet-actions">
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
            const ready = mounted;
            const connected = ready && account && chain;
            if (!connected) {
              return (
                <button className="wallet-button" type="button" onClick={openConnectModal}>
                  Connect wallet
                </button>
              );
            }
            if (chain.unsupported) {
              return (
                <button className="wallet-button danger" type="button" onClick={openChainModal}>
                  Wrong network
                </button>
              );
            }
            if (session.status !== 'authenticated') {
              return (
                <button
                  className="wallet-button"
                  type="button"
                  onClick={() => void session.signIn()}
                  disabled={session.status === 'loading'}
                >
                  {session.status === 'loading' ? 'Checking…' : 'Sign in'}
                </button>
              );
            }
            return (
              <button className="wallet-button connected" type="button" onClick={openAccountModal}>
                <span className="status-dot" /> {account.displayName}
              </button>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
}
