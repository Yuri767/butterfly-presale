'use client';

import dynamic from 'next/dynamic';
import { useWallet } from '@solana/wallet-adapter-react';

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export default function WalletButton() {
  const { publicKey } = useWallet();

  return (
    <WalletMultiButtonDynamic
      style={{
        background: 'linear-gradient(135deg, #c850c0, #ffcc70)',
        color: '#000',
        padding: '12px 24px',
        fontWeight: 'bold',
        borderRadius: '8px',
        fontSize: '1rem',
      }}
    />
  );
}
