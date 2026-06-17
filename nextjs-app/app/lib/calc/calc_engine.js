/**
 * 미래설계 계산 엔진
 * 입력: { birth_year, net_worth, monthly_income, monthly_expense, married, income_type, spouse_income, retirement_age }
 * 출력: 슬롯 치환용 결과 객체
 */

const CURRENT_YEAR = new Date().getFullYear();
const ANNUAL_RETURN = 0.05; // 기본 연 수익률 5%
const INFLATION = 0.025;    // 물가상승률 2.5%

function getAge(birth_year) {
  return CURRENT_YEAR - birth_year;
}

/**
 * A-1: 60대에 순자산 10억 만들기
 */
export function target_wealth_10eok(inputs) {
  const {
    birth_year,
    net_worth = 0,
    monthly_income = 0,
    monthly_expense = 0,
    spouse_income = 0,
  } = inputs;

  const age = getAge(birth_year);
  const targetAge = 60;
  const yearsLeft = Math.max(targetAge - age, 0);
  const targetWealth = 100000; // 10억 (만원 단위)

  const totalMonthlyIncome = monthly_income + spouse_income;
  const monthlySavings = Math.max(totalMonthlyIncome - monthly_expense, 0);

  // 현재 순자산을 연복리로 운용
  const grownNetWorth = net_worth * Math.pow(1 + ANNUAL_RETURN, yearsLeft);

  // 매월 저축 미래가치 (FV of annuity)
  const monthlyReturn = ANNUAL_RETURN / 12;
  const fvSavings = monthlyReturn > 0
    ? monthlySavings * ((Math.pow(1 + monthlyReturn, yearsLeft * 12) - 1) / monthlyReturn)
    : monthlySavings * yearsLeft * 12;

  const projectedWealth = Math.round(grownNetWorth + fvSavings);
  const gap = targetWealth - projectedWealth;

  // 목표 달성을 위한 추가 월 저축액
  const additionalMonthlySavings = gap > 0 && monthlyReturn > 0
    ? Math.round(gap / ((Math.pow(1 + monthlyReturn, yearsLeft * 12) - 1) / monthlyReturn))
    : 0;

  const achievable = projectedWealth >= targetWealth;

  return {
    card_id: 'a-1',
    age,
    years_left: yearsLeft,
    projected_wealth: projectedWealth,
    target_wealth: targetWealth,
    monthly_savings: monthlySavings,
    additional_monthly_savings: additionalMonthlySavings,
    achievable,
    gap: Math.max(gap, 0),
    summary: achievable
      ? `현재 페이스로 ${targetAge}세에 약 ${projectedWealth.toLocaleString()}만원을 모을 수 있어요.`
      : `목표까지 월 ${additionalMonthlySavings.toLocaleString()}만원 더 저축이 필요해요.`,
  };
}

/**
 * A-2: FIRE 조기은퇴
 * 25배 룰 기반: 연간 생활비 × 25 = 필요 자산
 */
export function fire_retirement(inputs) {
  const {
    birth_year,
    net_worth = 0,
    monthly_income = 0,
    monthly_expense = 0,
    spouse_income = 0,
    retirement_age = 50,
  } = inputs;

  const age = getAge(birth_year);
  const annualExpense = monthly_expense * 12;
  const fireNumber = annualExpense * 25; // 4% 인출 룰

  const totalMonthlyIncome = monthly_income + spouse_income;
  const monthlySavings = Math.max(totalMonthlyIncome - monthly_expense, 0);
  const monthlyReturn = ANNUAL_RETURN / 12;

  // 현재 자산 + 매월 저축으로 FIRE 목표 달성까지 걸리는 기간 계산
  let years_needed = 0;
  let wealth = net_worth;
  while (wealth < fireNumber && years_needed < 100) {
    wealth = wealth * (1 + ANNUAL_RETURN) + monthlySavings * 12;
    years_needed++;
  }

  const fire_age = age + years_needed;
  const achievable = fire_age <= retirement_age;

  return {
    card_id: 'a-2',
    age,
    fire_number: Math.round(fireNumber),
    years_needed,
    fire_age,
    monthly_savings: monthlySavings,
    target_retirement_age: retirement_age,
    achievable,
    gap_years: Math.max(fire_age - retirement_age, 0),
    summary: achievable
      ? `${fire_age}세에 FIRE 달성 가능해요! 목표보다 ${retirement_age - fire_age}년 빨라요.`
      : `현재 페이스로는 ${fire_age}세에 FIRE 가능해요. 목표보다 ${fire_age - retirement_age}년 늦어요.`,
  };
}

/**
 * 카드 ID에 따라 적절한 계산 함수 실행
 */
export function runCalc(cardId, inputs) {
  switch (cardId) {
    case 'a-1': return target_wealth_10eok(inputs);
    case 'a-2': return fire_retirement(inputs);
    default: return null;
  }
}
