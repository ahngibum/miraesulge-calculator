import { Suspense } from 'react';
import ResultClient from './ResultClient';

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><p className="text-gray-400">계산 중...</p></div>}>
      <ResultClient />
    </Suspense>
  );
}
