import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Puppy ID - Complete Pet Identity & Management Platform',
  description: 'Give your pet a digital identity. Instant public QR profile, lost pet mode, vaccination tracking, expense management, and reminders.',
  keywords: 'Pet ID, QR Pet Tag, Digital Pet Profile, Lost Pet Finder, Pet Management SaaS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <body className="bg-cream-100 text-slate-800 antialiased min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
