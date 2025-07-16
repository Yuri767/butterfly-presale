'use client';

import { useEffect, useState } from 'react';
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

const RECIPIENT = new PublicKey('FM7huQouPgKmAVkEatSWA9x7aW8ArmbjSNosR62ctdyr');
const MAX_RAISE_SOL = 10_000;
const STORAGE_KEY = 'fly_totalRaised';

export default function Presale() {
  const { publicKey, sendTransaction, connected } = useWallet();
  const connection = new Connection('https://api.mainnet-beta.solana.com');

  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [successPopup, setSuccessPopup] = useState(false);
  const [raised, setRaised] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? parseFloat(saved) : 0;
    }
    return 0;
  });

  const gradient = 'linear-gradient(90deg,#d946ef,#ec4899,#fbbf24)';

  const updateRaised = (delta: number) => {
    setRaised(prev => {
      const newTotal = prev + delta;
      localStorage.setItem(STORAGE_KEY, newTotal.toString());
      return newTotal;
    });
  };

  const buyFLY = async () => {
    setError('');
    setSuccessPopup(false);

    const sol = parseFloat(amount);
    if (!publicKey) {
      setError('Connect wallet first.');
      return;
    }
    if (isNaN(sol) || sol < 0.1 || sol > 50) {
      setError('Min 0.1 / Max 50 SOL.');
      return;
    }

    try {
      const balance = await connection.getBalance(publicKey);
      if (balance < sol * LAMPORTS_PER_SOL) {
        setError('Insufficient SOL balance.');
        return;
      }

      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: RECIPIENT,
          lamports: sol * LAMPORTS_PER_SOL,
        })
      );

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, 'confirmed');

      updateRaised(sol);
      setAmount('');
      setSuccessPopup(true);
    } catch (e) {
      console.error(e);
      setError('Transaction failed.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: gradient,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        color: '#fff',
      }}
    >
      <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem' }}>
        Butterfly $FLY Presale Portal
      </h1>

      <WalletMultiButtonDynamic
        style={{
          background: gradient,
          color: '#fff',
          fontWeight: 'bold',
          borderRadius: 8,
          padding: '10px 20px',
          marginBottom: '1.2rem',
        }}
      />

      {connected && (
        <>
          <input
            type="number"
            placeholder="Amount (SOL)"
            value={amount}
            min={0.1}
            max={50}
            step={0.01}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 6,
              border: 'none',
              width: 220,
              textAlign: 'center',
              marginBottom: 8,
            }}
          />
          {error && <p style={{ color: '#ffbbbb', marginBottom: 6 }}>{error}</p>}

          <button
            onClick={buyFLY}
            style={{
              background: gradient,
              color: '#fff',
              fontWeight: 'bold',
              padding: '10px 24px',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            Buy FLY
          </button>

          <div style={{ width: '80%', maxWidth: 420, marginTop: 24 }}>
            <p style={{ marginBottom: 6, fontWeight: 600 }}>
              Total Raised: {raised.toFixed(2)} SOL / {MAX_RAISE_SOL.toLocaleString()} SOL
            </p>
            <div
              style={{
                width: '100%',
                height: 14,
                background: 'rgba(255,255,255,0.25)',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min((raised / MAX_RAISE_SOL) * 100, 100)}%`,
                  height: '100%',
                  background: gradient,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        </>
      )}

      {successPopup && (
        <div
          onClick={() => setSuccessPopup(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            zIndex: 9999,
          }}
        >
          Transaction Completed
        </div>
      )}
    </div>
  );
}
