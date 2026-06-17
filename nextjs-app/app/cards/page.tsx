import { Suspense } from 'react';
import CardsPageClient from './CardsPageClient';

export const metadata = {
  title: '미래 설계 카드 선택 | 미래설계계산기',
  description: '나에게 맞는 미래 설계 카드를 선택해보세요.',
};

export default function CardsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CardsPageClient />
    </Suspense>
  );
}
