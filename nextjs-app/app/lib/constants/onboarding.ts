export type QuestionType = 'birth_year' | 'chips' | 'range';

export interface ChipOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  companionMent: string;
  options?: ChipOption[];
  allowCustom?: boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  defaultValue?: number;
  dependsOn?: { questionId: string; value: string | string[] };
  skipLabel?: string;
}

export const ONBOARDING_QUESTIONS: Question[] = [
  {
    id: 'birth_year',
    type: 'birth_year',
    question: '먼저 출생연도를 알려주세요.',
    companionMent: '정확한 나이로 딱 맞는 계획을 세워드릴게요.',
  },
  {
    id: 'married',
    type: 'chips',
    question: '현재 혼인 상태를 알려주세요.',
    companionMent: '가족 구성에 따라 필요한 준비가 달라요.',
    options: [
      { value: 'married', label: '기혼' },
      { value: 'single', label: '미혼' },
      { value: 'divorced', label: '이혼·사별' },
    ],
  },
  {
    id: 'income_type',
    type: 'chips',
    question: '맞벌이인가요, 외벌이인가요?',
    companionMent: '소득 구조에 따라 노후 준비 전략이 달라요.',
    options: [
      { value: 'dual', label: '맞벌이' },
      { value: 'single_income', label: '외벌이' },
    ],
    dependsOn: { questionId: 'married', value: 'married' },
  },
  {
    id: 'single_future_plan',
    type: 'chips',
    question: '혹시 배우자가 있을 경우도 같이 볼까요?',
    companionMent: '미래 계획에 맞춰 시뮬레이션도 가능해요.',
    options: [
      { value: 'yes', label: '네, 같이 볼게요' },
      { value: 'no', label: '아니요, 괜찮아요' },
    ],
    dependsOn: { questionId: 'married', value: 'single' },
  },
  {
    id: 'monthly_income',
    type: 'range',
    question: '현재 월 소득(세후)이 얼마인가요?',
    companionMent: '실제 손에 쥐는 금액 기준이에요.',
    min: 100,
    max: 1500,
    step: 10,
    unit: '만원',
    defaultValue: 350,
    allowCustom: true,
  },
  {
    id: 'spouse_income',
    type: 'range',
    question: '배우자의 월 소득(세후)은 얼마인가요?',
    companionMent: '합산 소득으로 더 정확하게 계산돼요.',
    min: 100,
    max: 1500,
    step: 10,
    unit: '만원',
    defaultValue: 300,
    allowCustom: true,
    dependsOn: { questionId: 'income_type', value: 'dual' },
  },
  {
    id: 'monthly_expense',
    type: 'range',
    question: '한 달 생활비는 얼마나 쓰시나요?',
    companionMent: '고정비 + 변동비를 합쳐서 생각해보세요.',
    min: 100,
    max: 1000,
    step: 10,
    unit: '만원',
    defaultValue: 250,
    allowCustom: true,
  },
  {
    id: 'net_worth',
    type: 'range',
    question: '현재 순자산(자산 - 부채)은 얼마인가요?',
    companionMent: '예금, 투자, 부동산 등 모두 포함이에요.',
    min: 0,
    max: 200000,
    step: 500,
    unit: '만원',
    defaultValue: 5000,
    allowCustom: true,
  },
  {
    id: 'retirement_age',
    type: 'chips',
    question: '몇 살쯤 은퇴하고 싶으세요?',
    companionMent: '목표 은퇴 나이를 기준으로 계획을 세울게요.',
    options: [
      { value: '55', label: '55세' },
      { value: '60', label: '60세' },
      { value: '65', label: '65세' },
      { value: '70', label: '70세' },
    ],
    allowCustom: true,
  },
];

export const SKIP_LABEL = '잘 모르겠어요 — 나중에 입력할게요';
