'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { runCalc } from '@/app/lib/calc/calc_engine';
import { ROAD_A_CARDS } from '@/app/lib/constants/road-cards';

function parseInputs(searchParams: URLSearchParams) {
  return {
    birth_year: Number(searchParams.get('birth_year') || 1985),
    net_worth: Number(searchParams.get('net_worth') || 0),
    monthly_income: Number(searchParams.get('monthly_income') || 0),
    monthly_expense: Number(searchParams.get('monthly_expense') || 0),
    spouse_income: Number(searchParams.get('spouse_income') || 0),
    retirement_age: Number(searchParams.get('retirement_age') || 60),
    married: searchParams.get('married') || '',
    income_type: searchParams.get('income_type') || '',
  };
}

function fmt(n: number, unit = '만원') {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}억${unit === '만원' ? '' : unit}`;
  return `${n.toLocaleString()}${unit}`;
}

function MetricCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 text-center ${highlight ? 'bg-teal-500 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <p className={`text-xs mb-1 ${highlight ? 'text-teal-100' : 'text-gray-500'}`}>{label}</p>
      <p className={`text-xl font-bold ${highlight ? 'text-white' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function AchievableBadge({ achievable, message }: { achievable: boolean; message?: string }) {
  return (
    <div className={`rounded-xl px-4 py-3 flex items-center gap-2 ${achievable ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
      <span>{achievable ? '✅' : '⚠️'}</span>
      <p className="text-sm font-medium">{message || (achievable ? '현재 페이스로 달성 가능해요' : '조금 더 노력이 필요해요')}</p>
    </div>
  );
}

function ResultMetrics({ result }: { result: Record<string, unknown> }) {
  const cardId = result.card_id as string;
  const achievable = result.achievable as boolean;

  if (cardId === 'a-1') {
    return (
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="예상 자산 (60세)" value={fmt(result.projected_wealth as number)} highlight />
        <MetricCard label="목표 자산" value={fmt(result.target_wealth as number)} />
        <MetricCard label="부족 금액" value={fmt(result.gap as number)} />
        <MetricCard label="추가 필요 월 저축" value={fmt(result.additional_monthly_savings as number)} />
      </div>
    );
  }
  if (cardId === 'a-2') {
    return (
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="FIRE 달성 나이" value={`${result.fire_age}세`} highlight />
        <MetricCard label="필요 자산 (FIRE Number)" value={fmt(result.fire_number as number)} />
        <MetricCard label="목표 은퇴 나이" value={`${result.target_retirement_age}세`} />
        <MetricCard label="목표 대비 차이" value={`${result.gap_years}년 ${achievable ? '빠름' : '늦음'}`} />
      </div>
    );
  }
  if (cardId === 'a-19') {
    const scenarios = result.scenarios as Array<{ rate: number; projected_wealth: number; achievable_10eok: boolean }>;
    return (
      <div className="space-y-2">
        {scenarios.map(s => (
          <div key={s.rate} className={`rounded-xl p-3 flex items-center justify-between ${s.achievable_10eok ? 'bg-teal-50' : 'bg-gray-50'}`}>
            <span className="text-sm font-medium text-gray-700">연 {s.rate}%</span>
            <span className={`text-sm font-bold ${s.achievable_10eok ? 'text-teal-700' : 'text-gray-500'}`}>{fmt(s.projected_wealth)}</span>
            {s.achievable_10eok && <span className="text-xs text-teal-500">10억 달성 ✓</span>}
          </div>
        ))}
      </div>
    );
  }
  if (cardId === 'a-20') {
    return (
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="IRP 절세 (연)" value={fmt(result.irp_tax_saving_annual as number)} highlight />
        <MetricCard label="ISA 절세 (연)" value={fmt(result.isa_benefit_annual as number)} />
        <MetricCard label="연금저축 절세 (연)" value={fmt(result.pension_saving_tax_saving as number)} />
        <MetricCard label="총 절세액 (연)" value={fmt(result.total_annual_saving as number)} />
      </div>
    );
  }

  // 범용 표시: summary만 크게 + achievable badge
  const primaryKeys = ['projected_wealth', 'fire_number', 'target_amount', 'cash_amount',
    'estimated_birth_cost', 'required_retirement_asset', 'asset_at_retirement',
    'lump_sum_after_tax', 'estimated_healthcare_total', 'asset_after_support',
    'current_projected_wealth', 'monthly_increase'];
  const secondaryKeys = ['gap', 'monthly_savings_needed', 'months_needed', 'years_needed',
    'achievable_age', 'payoff_age', 'months_to_goal', 'monthly_income_from_investment',
    'tax_saving', 'legacy_amount', 'difference', 'annual_increase'];

  const primaryEntries = primaryKeys.filter(k => result[k] !== undefined && result[k] !== null && (result[k] as number) > 0);
  const secondaryEntries = secondaryKeys.filter(k => result[k] !== undefined && result[k] !== null && (result[k] as number) > 0);

  const labelMap: Record<string, string> = {
    projected_wealth: '예상 자산', fire_number: 'FIRE 목표 자산', target_amount: '목표 금액',
    cash_amount: '현금화 금액', estimated_birth_cost: '예상 출산 비용',
    required_retirement_asset: '필요 노후 자산', asset_at_retirement: '은퇴 시 자산',
    lump_sum_after_tax: '세후 일시금', estimated_healthcare_total: '예상 의료비 총액',
    asset_after_support: '지원 후 노후 자산', current_projected_wealth: '현재 예상 자산',
    monthly_increase: '월 건보료 증가',
    gap: '부족 금액', monthly_savings_needed: '필요 월 저축', months_needed: '필요 기간(개월)',
    years_needed: '필요 기간(년)', achievable_age: '달성 가능 나이', payoff_age: '대출 완제 나이',
    months_to_goal: '목표까지 개월', monthly_income_from_investment: '월 추가 소득',
    tax_saving: '절세 금액', legacy_amount: '자녀에게 남기는 금액',
    difference: '차이 금액', annual_increase: '연간 증가',
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {primaryEntries.slice(0, 2).map((k, i) => (
        <MetricCard key={k} label={labelMap[k] || k} value={fmt(result[k] as number)} highlight={i === 0} />
      ))}
      {secondaryEntries.slice(0, 2).map(k => (
        <MetricCard key={k} label={labelMap[k] || k}
          value={k.includes('age') || k.includes('나이') ? `${result[k]}세` : k.includes('월') || k.includes('month') ? `${result[k]}개월` : k.includes('년') || k.includes('year') ? `${result[k]}년` : fmt(result[k] as number)} />
      ))}
    </div>
  );
}

export default function ResultClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawCardId = params.cardId;
  const cardId = Array.isArray(rawCardId) ? rawCardId[0] : (rawCardId ?? '');
  const card = ROAD_A_CARDS.find(c => c.id === cardId);

  const baseInputs = useMemo(() => parseInputs(searchParams), [searchParams]);
  const [adjustedSavings, setAdjustedSavings] = useState<number | null>(null);

  const inputs = useMemo(() => {
    if (adjustedSavings === null) return baseInputs;
    const extra = adjustedSavings - Math.max(baseInputs.monthly_income - baseInputs.monthly_expense, 0);
    return { ...baseInputs, monthly_income: baseInputs.monthly_income + Math.max(extra, 0) };
  }, [baseInputs, adjustedSavings]);

  const result = useMemo(() => {
    try { return runCalc(cardId, inputs); } catch { return null; }
  }, [cardId, inputs]);

  const currentMonthlySavings = Math.max(baseInputs.monthly_income - baseInputs.monthly_expense, 0);
  const queryString = searchParams.toString();

  if (!card) return <div className="p-8 text-center text-gray-400">카드를 찾을 수 없어요.</div>;

  if (!result) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="text-4xl mb-4">{card.emoji}</div>
        <h1 className="text-lg font-semibold text-gray-800 mb-2">{card.title}</h1>
        <div className="bg-teal-50 rounded-xl p-4 mb-6 text-sm text-teal-800">🤖 이 계산기는 곧 준비될 예정이에요!</div>
        <button onClick={() => router.push(`/cards?${queryString}`)} className="w-full max-w-sm py-4 bg-teal-500 text-white rounded-xl font-medium">다른 카드 볼게요</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-4 pt-6 pb-2 flex items-center gap-2">
        <button onClick={() => router.back()} className="text-sm text-gray-400">← 뒤로</button>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{card.emoji}</span>
          <h1 className="text-lg font-semibold text-gray-900">{card.title}</h1>
        </div>
      </div>

      {/* 동반자 멘트 */}
      <div className="flex items-start gap-3 px-4 mb-5">
        <span className="text-xl">🤖</span>
        <div className="bg-teal-50 rounded-2xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
          {result.summary as string}
        </div>
      </div>

      {/* 핵심 수치 */}
      <div className="px-4 mb-5">
        <ResultMetrics result={result as Record<string, unknown>} />
      </div>

      {/* 달성 여부 배지 */}
      <div className="px-4 mb-5">
        <AchievableBadge achievable={result.achievable as boolean} />
      </div>

      {/* 슬라이더: 월 저축 조정 */}
      {currentMonthlySavings > 0 && (
        <div className="px-4 mb-5">
          <p className="text-sm font-medium text-gray-700 mb-2">월 저축액을 조정해보세요</p>
          <input
            type="range"
            min={0}
            max={Math.max(currentMonthlySavings * 3, 300)}
            step={10}
            value={adjustedSavings ?? currentMonthlySavings}
            onChange={e => setAdjustedSavings(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
            style={{
              background: `linear-gradient(to right, #1D9E75 ${Math.round(((adjustedSavings ?? currentMonthlySavings) / Math.max(currentMonthlySavings * 3, 300)) * 100)}%, #e5e7eb ${Math.round(((adjustedSavings ?? currentMonthlySavings) / Math.max(currentMonthlySavings * 3, 300)) * 100)}%)`,
            }}
          />
          <p className="text-xs text-teal-600 text-right mt-1">월 {(adjustedSavings ?? currentMonthlySavings).toLocaleString()}만원</p>
        </div>
      )}

      {/* 면책 문구 */}
      <div className="px-4 mb-6">
        <p className="text-xs text-gray-400 leading-relaxed">
          현재 입력값 기준 시뮬레이션입니다. 실제 투자 결과나 세금 계산과 다를 수 있으며, 투자 권유가 아닙니다.
        </p>
      </div>

      {/* 하단 버튼 */}
      <div className="px-4 pb-10 space-y-3">
        <button
          onClick={() => router.push(`/cards?${queryString}`)}
          className="w-full py-4 bg-teal-500 text-white rounded-xl font-medium"
        >
          다른 카드도 볼게요
        </button>
        <button
          onClick={() => router.push('/onboarding')}
          className="w-full py-3 text-sm text-gray-500"
        >
          처음부터 다시
        </button>
      </div>
    </div>
  );
}
