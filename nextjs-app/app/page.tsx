import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '미래설계계산기 — 노후준비 AI 재무코치',
  description: '나의 나이, 소득, 자산을 입력하면 AI가 맞춤 노후 계획을 제안해드려요. 지금 바로 시작해보세요.',
  keywords: ['노후준비', '재무계획', '은퇴설계', 'FIRE', '자산관리'],
};

export default function HomePage() {
  return (
    <main className="min-h-full bg-white flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-6">🌱</div>
        <h1 className="text-3xl font-medium text-gray-800 mb-3 leading-tight">
          미래설계계산기
        </h1>
        <p className="text-gray-500 text-base mb-2 leading-relaxed">
          노후준비 AI 재무코치
        </p>
        <p className="text-gray-400 text-sm mb-10 leading-relaxed">
          나의 나이·소득·자산을 입력하면<br />
          맞춤 노후 계획을 제안해드려요.
        </p>

        <Link
          href="/onboarding"
          className="block w-full py-4 bg-teal-500 text-white rounded-xl font-medium text-base hover:bg-teal-600 transition-colors"
        >
          지금 시작하기
        </Link>

        <p className="text-xs text-gray-400 mt-4">
          약 3분이면 완성돼요 · 개인정보 저장 없음
        </p>
      </div>
    </main>
  );
}
