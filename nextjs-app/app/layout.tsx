import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';

const notoSansKR = Noto_Sans_KR({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '미래설계계산기 — 노후준비 AI 재무코치',
  description: '나의 나이, 소득, 자산을 입력하면 AI가 맞춤 노후 계획을 제안해드려요.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} h-full`}>
      <body className={`min-h-full flex flex-col ${notoSansKR.className}`}>
        {children}
      </body>
    </html>
  );
}
