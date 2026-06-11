import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChatWave — Talk to Strangers Anonymously',
  description: 'Connect with random strangers instantly. No login required.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
