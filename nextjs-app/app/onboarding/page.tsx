import type { Metadata } from 'next';
import Onboarding from '@/app/components/onboarding/Onboarding';

export const metadata: Metadata = {
  title: '내 정보 입력 | 미래설계계산기',
  description: '나의 나이, 소득, 자산을 입력해 맞춤 노후 계획을 받아보세요.',
};

export default function OnboardingPage() {
  return <Onboarding />;
}
