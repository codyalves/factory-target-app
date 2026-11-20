import type { Metadata } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { company } from '@/lib/company';
import { Footer } from './components/footer';
import './globals.css';

// Archivo, with its width axis; committed to the repository so builds never need the network.
const archivo = localFont({
  src: './fonts/archivo-wdth.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-archivo',
  declarations: [{ prop: 'font-stretch', value: '62% 125%' }],
});

export const metadata: Metadata = {
  title: company.name,
  description: company.tagline,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
