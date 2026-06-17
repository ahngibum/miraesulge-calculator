import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ROAD_A_CARDS } from '@/app/lib/constants/road-cards';
import CardPageClient from './CardPageClient';

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
    openGraph: { title: card.title, description: card.description, type: 'website' },
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
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CardPageClient card={card} />
    </>
  );
}
