import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IDFB ERP',
  description: 'Türk KOBİ’leri için kurumsal ERP platformu',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
