import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { Providers } from '@/components/providers';
import { SiteSoundtrack } from '@/components/site-soundtrack';
import { Starfield } from '@/components/starfield';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'PacBoom — Play. Score. Earn.',
    template: '%s · PacBoom',
  },
  description: 'An onchain arcade game powered by Blast.',
  manifest: '/manifest.json',
  icons: { icon: '/img/icon.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#07080d',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Starfield />
        <Providers>
          <div className="site-shell">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
          <SiteSoundtrack />
        </Providers>
      </body>
    </html>
  );
}
