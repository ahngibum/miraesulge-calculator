'use client';

import { useSearchParams } from 'next/navigation';
import RoadCardList from '@/app/components/cards/RoadCardList';

export default function CardsPageClient() {
  const searchParams = useSearchParams();
  const birthYear = Number(searchParams.get('birth_year') ?? 0);
  const currentYear = new Date().getFullYear();
  const userAge = birthYear > 1900 ? currentYear - birthYear : 35;
  const queryString = searchParams.toString();

  return (
    <div className="min-h-full bg-white flex flex-col">
      <div className="px-4 pt-8 pb-4">
        <p className="text-xs text-teal-600 font-medium mb-1">STEP 2</p>
        <h1 className="text-xl font-semibold text-gray-900 leading-snug">
          어떤 미래를 설계하고 싶으세요?
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {userAge > 0 ? `만 ${userAge}세 기준으로 ` : ''}맞는 카드를 골라보세요.
        </p>
      </div>

      <div className="flex items-start gap-3 px-4 mb-4">
        <span className="text-xl">🤖</span>
        <p className="text-sm text-gray-700 bg-teal-50 rounded-2xl px-4 py-3 leading-relaxed">
          흐린 카드는 현재 나이와 조금 맞지 않을 수 있어요.<br />
          그래도 클릭해서 볼 수 있어요!
        </p>
      </div>

      <RoadCardList userAge={userAge} queryString={queryString} />
    </div>
  );
}
