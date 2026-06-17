'use client';

import { useRouter } from 'next/navigation';
import { ROAD_A_CARDS } from '@/app/lib/constants/road-cards';
import { useState } from 'react';

interface Props {
  userAge: number;
  queryString: string;
}

export default function RoadCardList({ userAge, queryString }: Props) {
  const router = useRouter();
  const [dimmedModal, setDimmedModal] = useState<string | null>(null);
  const [pendingCardId, setPendingCardId] = useState<string | null>(null);

  function handleCardClick(cardId: string, inRange: boolean) {
    if (inRange) {
      router.push(`/calculator/${cardId}?${queryString}`);
    } else {
      setPendingCardId(cardId);
      setDimmedModal(cardId);
    }
  }

  function confirmDimmed() {
    if (pendingCardId) {
      router.push(`/calculator/${pendingCardId}?${queryString}`);
    }
    setDimmedModal(null);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 px-4 pb-8">
        {ROAD_A_CARDS.map(card => {
          const inRange = userAge >= card.ageMin && userAge <= card.ageMax;
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id, inRange)}
              className={`w-full text-left rounded-2xl border p-4 transition-all ${
                inRange
                  ? 'bg-white border-gray-200 shadow-sm hover:border-teal-500 hover:shadow-md'
                  : 'bg-gray-50 border-gray-100 opacity-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{card.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm leading-snug">{card.title}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{card.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {card.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {dimmedModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setDimmedModal(null)}>
          <div
            className="w-full bg-white rounded-t-3xl p-6 pb-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-6">
              <span className="text-2xl">🤖</span>
              <p className="text-sm text-gray-700 leading-relaxed bg-teal-50 rounded-2xl px-4 py-3">
                이 카드는 현재 나이 범위와 조금 맞지 않을 수 있어요.<br />
                그래도 한번 살펴볼까요?
              </p>
            </div>
            <button
              onClick={confirmDimmed}
              className="w-full py-4 rounded-xl bg-teal-500 text-white font-medium mb-3"
            >
              그래도 볼게요
            </button>
            <button
              onClick={() => setDimmedModal(null)}
              className="w-full py-3 text-sm text-gray-500"
            >
              다른 카드 볼게요
            </button>
          </div>
        </div>
      )}
    </>
  );
}
