'use client';

import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { formatEther, type Hex } from 'viem';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { useWalletSession } from '@/components/wallet-session';
import { PAC_BOOM_ADDRESS, pacBoomAbi } from '@/lib/contracts';

export function ClaimModal({ score, onClose }: { score: number; onClose: () => void }) {
  const { isConnected } = useAccount();
  const session = useWalletSession();
  const [message, setMessage] = useState<string | null>(null);
  const { data: entryFee = 0n } = useReadContract({
    address: PAC_BOOM_ADDRESS,
    abi: pacBoomAbi,
    functionName: 'getEntryFee',
  });
  const { data: hash, isPending, reset, writeContractAsync } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  const shareUrl = useMemo(
    () => `https://twitter.com/intent/tweet?text=${encodeURIComponent(`I scored ${score.toLocaleString()} in PacBoom!`)}&hashtags=PacBoom,Blast`,
    [score],
  );

  async function claim() {
    setMessage(null);
    try {
      const verified = await fetch('/verify-score', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score }),
      });
      if (!verified.ok) throw new Error('The score could not be verified.');
      const { score: verifiedScore } = await verified.json();

      const signed = await fetch('/getSignature', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: verifiedScore }),
      });
      if (!signed.ok) throw new Error('The claim signature could not be created.');
      const payload = await signed.json();

      await writeContractAsync({
        address: PAC_BOOM_ADDRESS,
        abi: pacBoomAbi,
        functionName: 'claimPoints',
        args: [BigInt(payload.score), BigInt(payload.timestamp), payload.signature as Hex],
        value: entryFee,
      });
    } catch (reason) {
      reset();
      const rejected = reason instanceof Error && /reject|denied|cancel/i.test(reason.message);
      setMessage(rejected ? 'Transaction rejected. Your score is safe — you can try again.' : reason instanceof Error ? reason.message : 'Claim failed. Please try again.');
    }
  }

  const visibleMessage = message ?? (receipt.isError ? 'The transaction failed. You can try again without closing this window.' : null);

  return createPortal(
    <div className="modal-backdrop" role="presentation">
      <section className="game-modal" role="dialog" aria-modal="true" aria-labelledby="game-over-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" aria-label="Close" onClick={onClose}>×</button>
        <div className="modal-brand"><Image src="/img/logo.gif" alt="PacBoom" width={180} height={72} unoptimized /></div>
        <h2 id="game-over-title">Game over</h2>
        <div className="final-score"><span>Your score</span><strong>{score.toLocaleString()}</strong></div>

        <div className="modal-actions">
          <a className="button secondary" href={shareUrl} target="_blank" rel="noreferrer">Share on X</a>
          {isConnected && session.status === 'authenticated' ? (
            <button className="button primary" type="button" disabled={isPending || receipt.isLoading} onClick={() => void claim()}>
              {isPending ? 'Confirm in wallet…' : receipt.isLoading ? 'Confirming…' : receipt.isSuccess ? 'Points claimed' : 'Claim PB points'}
            </button>
          ) : (
            <p className="modal-hint">Connect and sign in before your next run to claim points.</p>
          )}
        </div>
        {entryFee > 0n && <p className="fee-line">Entry fee: {formatEther(entryFee)} ETH</p>}
        {hash && <a className="tx-link" href={`https://blastscan.io/tx/${hash}`} target="_blank" rel="noreferrer">View transaction ↗</a>}
        {visibleMessage && <p className="form-error">{visibleMessage}</p>}
      </section>
    </div>,
    document.body,
  );
}
