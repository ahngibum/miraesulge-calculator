import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ROAD_A_CARDS } from '@/app/lib/constants/road-cards';

interface Props {
  params: Promise<{ cardId: string }>;
}

export async function generateStaticParams() {
  return ROAD_A_CARDS.map(card => ({ cardId: card.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cardId } = await params;
  const card = ROAD_A_CARDS.find(c => c.id === cardId);
  if (!card) return { title: '미래설계계산기' };

  return {
    title: `${card.title} | 미래설계계산기`,
    description: card.description,
    keywords: card.tags,
    openGraph: {
      title: card.title,
      description: card.description,
      type: 'website',
    },
  };
}

export default async function CalculatorCardPage({ params }: Props) {
  const { cardId } = await params;
  const card = ROAD_A_CARDS.find(c => c.id === cardId);
  if (!card) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: card.title,
    description: card.description,
    applicationCategory: 'FinanceApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-white flex flex-col items-center px-4 py-10">
        <div className="max-w-md w-full">
          <Link href="/onboarding" className="text-sm text-teal-600 hover:underline mb-6 inline-block">
            ← 다른 카드 보기
          </Link>

          <div className="text-5xl mb-4">{card.emoji}</div>
          <h1 className="text-2xl font-medium text-gray-800 mb-2">{card.title}</h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">{card.description}</p>

          <div className="flex flex-wrap gap-2 mb-8">
            {card.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="bg-teal-50 rounded-xl p-5 mb-6">
            <p className="text-sm text-teal-800 leading-relaxed">
              🤖 정확한 계산을 위해 먼저 내 정보를 입력해주세요.
            </p>
          </div>

          <Link
            href="/onboarding"
            className="block w-full py-4 bg-teal-500 text-white rounded-xl font-medium text-base text-center hover:bg-teal-600 transition-colors"
          >
            내 정보 입력하고 계산하기
          </Link>

          <p className="text-xs text-gray-400 text-center mt-3">
            대상 연령: {card.ageMin === 0 && card.ageMax === 999 ? '전 연령' : `${card.ageMin}세 ~ ${card.ageMax}세`}
          </p>
        </div>
      </main>
    </>
  );
}
