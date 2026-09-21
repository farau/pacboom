'use client';

import Image from 'next/image';
import { zeroAddress } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import { useWalletSession } from '@/components/wallet-session';
import { PAC_NUB_ADDRESS, pacNubAbi } from '@/lib/contracts';

export function AccountDashboard() {
  const { address, isConnected } = useAccount();
  const session = useWalletSession();
  const { data: nubs = [], isLoading } = useReadContract({
    address: PAC_NUB_ADDRESS,
    abi: pacNubAbi,
    functionName: 'tokensOwnedBy',
    args: [address ?? zeroAddress],
    query: { enabled: Boolean(address) },
  });
  const selected = nubs[0];

  async function connectDiscord() {
    const response = await fetch('/auth/discord');
    if (!response.ok) return;
    const { redirectUrl } = await response.json();
    window.location.assign(redirectUrl);
  }

  if (!isConnected) return <section className="panel full"><p className="empty-state">Connect a wallet to open your player profile.</p></section>;

  return (
    <div className="panel-grid">
      <section className="panel">
        <p className="eyebrow">Wallet</p>
        <h2>{address?.slice(0, 8)}…{address?.slice(-6)}</h2>
        <p>Session: <strong>{session.status}</strong></p>
        {session.status !== 'authenticated' ? (
          <button className="button primary" type="button" onClick={() => void session.signIn()}>Sign in securely</button>
        ) : (
          <button className="button secondary" type="button" onClick={() => void session.signOut()}>Disconnect</button>
        )}
        {session.error && <p className="form-error">{session.error}</p>}
      </section>
      <section className="panel">
        <p className="eyebrow">Social identity</p>
        <h2>Community access</h2>
        <p>Link X and Discord to unlock identity features and community roles.</p>
        <div className="form-row">
          <a className="button secondary" href="/auth/twitter">Link X</a>
          <button className="button secondary" type="button" onClick={() => void connectDiscord()}>Link Discord</button>
        </div>
      </section>
      <section className="panel full">
        <p className="eyebrow">PacNub collection</p>
        <div className="page-grid" style={{ width: '100%', alignItems: 'center' }}>
          <div>
            <h2>{isLoading ? 'Reading Blast…' : `${nubs.length} PacNub${nubs.length === 1 ? '' : 's'} found`}</h2>
            <p>Your first owned PacNub becomes the active arcade skin. Ownership is read through wagmi and viem without direct browser-provider calls.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Image
              src={selected === undefined ? '/img/nub/null.png' : `/img/nub/${Number(selected) % 16}.png`}
              alt="Selected PacNub"
              width={240}
              height={240}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
