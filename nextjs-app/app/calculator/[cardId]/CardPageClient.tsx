'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import type { RoadCard } from '@/app/lib/constants/road-cards';

function CardPageInner({ card }: { card: RoadCard }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasOnboardingData = searchParams.has('birth_year') || searchParams.has('monthly_income');
  const queryString = searchParams.toString();

  function handleCalculate() {
    if (hasOnboardingData) {
      router.push(`/calculator/${card.id}/result?${queryString}`);
    } else {
      router.push(`/onboarding`);
    }
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center px-4 py-10">
      <div className="max-w-md w-full">
        <button onClick={() => router.push(hasOnboardingData ? `/cards?${queryString}` : '/onboarding')}
          className="text-sm text-teal-600 hover:underline mb-6 inline-block">
          ← 다른 카드 보기
        </button>

        <div className="text-5xl mb-4">{card.emoji}</div>
        <h1 className="text-2xl font-medium text-gray-800 mb-2">{card.title}</h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">{card.description}</p>

        <div className="flex flex-wrap gap-2 mb-8">
          {card.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">
              #{tag}
            </span>
          ))}
        </div>

        <div className="bg-teal-50 rounded-xl p-5 mb-6">
          <p className="text-sm text-teal-800 leading-relaxed">
            {hasOnboardingData
              ? '🤖 입력한 정보로 바로 계산해드릴게요!'
              : '🤖 정확한 계산을 위해 먼저 내 정보를 입력해주세요.'}
          </p>
        </div>

        <button
          onClick={handleCalculate}
          className="block w-full py-4 bg-teal-500 text-white rounded-xl font-medium text-base text-center hover:bg-teal-600 transition-colors"
        >
          {hasOnboardingData ? '지금 바로 계산하기' : '내 정보 입력하고 계산하기'}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          대상 연령: {card.ageMin === 0 && card.ageMax === 999 ? '전 연령' : `${card.ageMin}세 ~ ${card.ageMax}세`}
        </p>
      </div>
    </main>
  );
}

export default function CardPageClient({ card }: { card: RoadCard }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CardPageInner card={card} />
    </Suspense>
  );
}
