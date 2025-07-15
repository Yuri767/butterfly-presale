import '../styles/globals.css';
import { ReactNode } from 'react';
import WalletProviderWrapper from '../components/WalletProviderWrapper';

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <head />
            <body>
                <WalletProviderWrapper>
                    {children}
                </WalletProviderWrapper>
            </body>
        </html>
    );
}
