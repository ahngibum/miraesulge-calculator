import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-WDHD5J3V';
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-Z1T5GDGTWV';

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
      <head>
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      </head>
      <body className={`min-h-full flex flex-col ${notoSansKR.className}`}>
        <noscript>
          <iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} />
        </noscript>
        {children}
      </body>
    </html>
  );
}
