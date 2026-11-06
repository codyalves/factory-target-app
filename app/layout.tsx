import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { company } from '@/lib/company';
import { Footer } from './components/footer';
import './globals.css';

export const metadata: Metadata = {
  title: company.name,
  description: company.tagline,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
