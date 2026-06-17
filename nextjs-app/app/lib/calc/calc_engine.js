/**
 * 미래설계 계산 엔진
 * 입력: { birth_year, net_worth, monthly_income, monthly_expense, married, income_type, spouse_income, retirement_age }
 */

const CURRENT_YEAR = new Date().getFullYear();
const ANNUAL_RETURN = 0.05;
const INFLATION = 0.025;

function getAge(birth_year) {
  return CURRENT_YEAR - (birth_year || 1985);
}

function fvAnnuity(monthly, rate, months) {
  if (rate <= 0) return monthly * months;
  return monthly * ((Math.pow(1 + rate, months) - 1) / rate);
}

function fvLump(principal, annualRate, years) {
  return principal * Math.pow(1 + annualRate, years);
}

// A-1: 60대에 순자산 10억 만들기
export function target_wealth_10eok(inputs) {
  const { birth_year, net_worth = 0, monthly_income = 0, monthly_expense = 0, spouse_income = 0 } = inputs;
  const age = getAge(birth_year);
  const targetAge = 60;
  const yearsLeft = Math.max(targetAge - age, 0);
  const targetWealth = 100000;
  const totalIncome = monthly_income + (spouse_income || 0);
  const monthlySavings = Math.max(totalIncome - monthly_expense, 0);
  const r = ANNUAL_RETURN / 12;
  const months = yearsLeft * 12;
  const projectedWealth = Math.round(fvLump(net_worth, ANNUAL_RETURN, yearsLeft) + fvAnnuity(monthlySavings, r, months));
  const gap = Math.max(targetWealth - projectedWealth, 0);
  const additionalMonthlySavings = gap > 0 && r > 0
    ? Math.round(gap / ((Math.pow(1 + r, months) - 1) / r))
    : 0;
  const achievable = projectedWealth >= targetWealth;
  return {
    card_id: 'a-1', age, years_left: yearsLeft,
    projected_wealth: projectedWealth, target_wealth: targetWealth,
    monthly_savings: monthlySavings, additional_monthly_savings: additionalMonthlySavings,
    achievable, gap,
    summary: achievable
      ? `현재 페이스로 ${targetAge}세에 약 ${Math.round(projectedWealth / 10000)}억원을 모을 수 있어요.`
      : `목표까지 월 ${additionalMonthlySavings.toLocaleString()}만원 더 저축이 필요해요.`,
  };
}

// A-2: FIRE 조기은퇴
export function fire_retirement(inputs) {
  const { birth_year, net_worth = 0, monthly_income = 0, monthly_expense = 0, spouse_income = 0, retirement_age = 50 } = inputs;
  const age = getAge(birth_year);
  const fireNumber = monthly_expense * 12 * 25;
  const monthlySavings = Math.max(monthly_income + (spouse_income || 0) - monthly_expense, 0);
  let years_needed = 0, wealth = net_worth;
  while (wealth < fireNumber && years_needed < 100) {
    wealth = wealth * (1 + ANNUAL_RETURN) + monthlySavings * 12;
    years_needed++;
  }
  const fire_age = age + years_needed;
  const achievable = fire_age <= retirement_age;
  return {
    card_id: 'a-2', age, fire_number: Math.round(fireNumber), years_needed, fire_age,
    monthly_savings: monthlySavings, target_retirement_age: retirement_age,
    achievable, gap_years: Math.max(fire_age - retirement_age, 0),
    summary: achievable
      ? `${fire_age}세에 FIRE 달성 가능해요! 목표보다 ${retirement_age - fire_age}년 빨라요.`
      : `현재 페이스로는 ${fire_age}세에 FIRE 가능해요. 목표보다 ${fire_age - retirement_age}년 늦어요.`,
  };
}

// A-3: 내 집 마련
export function home_purchase(inputs) {
  const { birth_year, net_worth = 0, monthly_income = 0, monthly_expense = 0, spouse_income = 0,
    target_home_price = 50000 } = inputs;
  const age = getAge(birth_year);
  const selfFundNeeded = target_home_price * 0.2;
  const currentSavings = Math.min(net_worth * 0.5, selfFundNeeded);
  const gap = Math.max(selfFundNeeded - currentSavings, 0);
  const monthlySavings = Math.max(monthly_income + (spouse_income || 0) - monthly_expense, 0);
  const months_needed = monthlySavings > 0 ? Math.ceil(gap / monthlySavings) : 999;
  const years_needed = Math.ceil(months_needed / 12);
  const achievable_age = age + years_needed;
  const achievable = achievable_age <= 45;
  return {
    card_id: 'a-3', age, target_home_price, self_fund_needed: Math.round(selfFundNeeded),
    gap: Math.round(gap), months_needed, years_needed, achievable_age, achievable,
    monthly_savings_needed: monthlySavings > 0 ? Math.round(gap / months_needed) : 0,
    summary: achievable
      ? `${achievable_age}세에 내 집 마련이 가능해요!`
      : `현재 저축 속도로는 ${achievable_age}세에 가능해요. 월 저축을 늘려보세요.`,
  };
}

// A-4: 은퇴 후 월 생활비 확보
export function retirement_monthly_income(inputs) {
  const { birth_year, net_worth = 0, monthly_income = 0, monthly_expense = 0, spouse_income = 0,
    retirement_age = 65, target_monthly_pension = 300 } = inputs;
  const age = getAge(birth_year);
  const yearsToRetirement = Math.max(retirement_age - age, 0);
  const requiredRetirementAsset = target_monthly_pension * 12 * 25;
  const monthlySavings = Math.max(monthly_income + (spouse_income || 0) - monthly_expense, 0);
  const r = ANNUAL_RETURN / 12;
  const months = yearsToRetirement * 12;
  const projectedAsset = Math.round(fvLump(net_worth, ANNUAL_RETURN, yearsToRetirement) + fvAnnuity(monthlySavings, r, months));
  const gap = Math.max(requiredRetirementAsset - projectedAsset, 0);
  const achievable = projectedAsset >= requiredRetirementAsset;
  return {
    card_id: 'a-4', age, retirement_age, target_monthly_pension,
    required_retirement_asset: Math.round(requiredRetirementAsset),
    projected_asset_at_retirement: projectedAsset,
    gap: Math.round(gap), achievable,
    monthly_savings_needed: gap > 0 && r > 0 ? Math.round(gap / ((Math.pow(1 + r, months) - 1) / r)) : 0,
    summary: achievable
      ? `${retirement_age}세에 월 ${target_monthly_pension}만원 생활 유지 가능해요!`
      : `목표 달성을 위해 자산이 ${Math.round(gap / 10000)}억원 더 필요해요.`,
  };
}

// A-5: 자녀 교육비
export function education_fund(inputs) {
  const { birth_year, net_worth = 0, monthly_income = 0, monthly_expense = 0, spouse_income = 0,
    child_age = 0, target_education_amount = 10000 } = inputs;
  const age = getAge(birth_year);
  const years_to_college = Math.max(18 - child_age, 0);
  const monthlySavings = Math.max(monthly_income + (spouse_income || 0) - monthly_expense, 0);
  const r = ANNUAL_RETURN / 12;
  const months = years_to_college * 12;
  const projected_fund = Math.round(fvLump(net_worth * 0.3, ANNUAL_RETURN, years_to_college) + fvAnnuity(monthlySavings * 0.2, r, months));
  const gap = Math.max(target_education_amount - projected_fund, 0);
  const achievable = projected_fund >= target_education_amount;
  return {
    card_id: 'a-5', age, child_age, years_to_college, target_education_amount,
    projected_fund, gap, achievable,
    monthly_savings_needed: gap > 0 && months > 0 ? Math.round(gap / months) : 0,
    summary: achievable
      ? `현재 페이스로 교육비 ${target_education_amount.toLocaleString()}만원을 준비할 수 있어요.`
      : `${years_to_college}년 안에 월 ${gap > 0 && months > 0 ? Math.round(gap / months).toLocaleString() : 0}만원 더 저축하면 돼요.`,
  };
}

// A-6: 비상금 만들기
export function emergency_fund(inputs) {
  const { monthly_expense = 0, net_worth = 0, monthly_income = 0, monthly_savings_for_emergency = 0 } = inputs;
  const target = monthly_expense * 6;
  const current = Math.min(net_worth * 0.1, target);
  const gap = Math.max(target - current, 0);
  const monthly = monthly_savings_for_emergency || Math.max(monthly_income - monthly_expense, 0) * 0.3;
  const months_to_goal = monthly > 0 ? Math.ceil(gap / monthly) : 999;
  const achievable = months_to_goal <= 24;
  return {
    card_id: 'a-6', target_emergency_fund: Math.round(target),
    current_emergency_savings: Math.round(current), gap: Math.round(gap),
    months_to_goal, achievable,
    summary: achievable
      ? `${months_to_goal}개월이면 6개월치 비상금 ${Math.round(target).toLocaleString()}만원을 만들 수 있어요.`
      : `월 저축을 늘려서 비상금 ${Math.round(target).toLocaleString()}만원을 먼저 확보해요.`,
  };
}

// A-7: 여행 다니면서 노후 준비
export function travel_retirement(inputs) {
  const { birth_year, net_worth = 0, monthly_income = 0, monthly_expense = 0,
    spouse_income = 0, retirement_age = 50, monthly_travel_budget = 50 } = inputs;
  const adjustedExpense = monthly_expense + monthly_travel_budget;
  const fireNumber = adjustedExpense * 12 * 25;
  const monthlySavings = Math.max(monthly_income + (spouse_income || 0) - adjustedExpense, 0);
  const age = getAge(birth_year);
  let years_needed = 0, wealth = net_worth;
  while (wealth < fireNumber && years_needed < 100) {
    wealth = wealth * (1 + ANNUAL_RETURN) + monthlySavings * 12;
    years_needed++;
  }
  const fire_age = age + years_needed;
  const achievable = fire_age <= retirement_age;
  return {
    card_id: 'a-7', age, monthly_travel_budget, adjusted_fire_number: Math.round(fireNumber),
    fire_age, years_needed, achievable, gap_years: Math.max(fire_age - retirement_age, 0),
    summary: achievable
      ? `여행비 포함해도 ${fire_age}세에 은퇴 가능해요!`
      : `여행비 포함 시 ${fire_age}세 은퇴 가능해요. 목표보다 ${fire_age - retirement_age}년 늦어요.`,
  };
}

// A-8: 창업 자금 준비
export function startup_fund(inputs) {
  const { birth_year, net_worth = 0, monthly_income = 0, monthly_expense = 0,
    spouse_income = 0, target_startup_amount = 5000, target_years = 5 } = inputs;
  const age = getAge(birth_year);
  const gap = Math.max(target_startup_amount - net_worth * 0.3, 0);
  const months = target_years * 12;
  const monthly_needed = months > 0 ? Math.ceil(gap / months) : 0;
  const monthlySavings = Math.max(monthly_income + (spouse_income || 0) - monthly_expense, 0);
  const achievable = monthlySavings >= monthly_needed;
  return {
    card_id: 'a-8', age, target_amount: target_startup_amount, gap: Math.round(gap),
    months_needed: months, monthly_savings_needed: monthly_needed, achievable,
    summary: achievable
      ? `${target_years}년 안에 창업 자금 ${target_startup_amount.toLocaleString()}만원 마련 가능해요!`
      : `월 ${monthly_needed.toLocaleString()}만원 저축하면 ${target_years}년 후 창업 자금이 준비돼요.`,
  };
}

// A-10: 대출 상환 효과
export function debt_paydown(inputs) {
  const { birth_year, net_worth = 0, monthly_income = 0, monthly_expense = 0,
    spouse_income = 0, retirement_age = 60,
    loan_balance = 10000, loan_interest_rate = 4.5, monthly_payment = 50 } = inputs;
  const age = getAge(birth_year);
  const yearsToRetirement = Math.max(retirement_age - age, 0);
  const payoff_months = monthly_payment > 0 ? Math.ceil(loan_balance / monthly_payment) : 999;
  const payoff_age = age + Math.ceil(payoff_months / 12);
  const monthlySavings = Math.max(monthly_income + (spouse_income || 0) - monthly_expense, 0);
  const r = ANNUAL_RETURN / 12;
  const months = yearsToRetirement * 12;
  const wealth_without_payoff = Math.round(fvLump(net_worth, ANNUAL_RETURN, yearsToRetirement) + fvAnnuity(monthlySavings, r, months));
  const extraSavings = monthlySavings + monthly_payment;
  const wealth_with_payoff = Math.round(fvLump(net_worth + loan_balance * 0.3, ANNUAL_RETURN, yearsToRetirement) + fvAnnuity(extraSavings, r, months));
  return {
    card_id: 'a-10', age, loan_balance, payoff_months, payoff_age,
    wealth_without_payoff, wealth_with_payoff,
    difference: Math.max(wealth_with_payoff - wealth_without_payoff, 0),
    achievable: true,
    summary: `대출을 먼저 갚으면 ${retirement_age}세에 약 ${Math.round(Math.max(wealth_with_payoff - wealth_without_payoff, 0) / 10000)}억원 더 모을 수 있어요.`,
  };
}

// A-11: 집 다운사이징
export function downsizing(inputs) {
  const { birth_year, retirement_age = 65, net_worth = 5000,
    current_home_value = 30000, target_home_value } = inputs;
  const age = getAge(birth_year);
  const reducedHome = target_home_value || Math.round(current_home_value * 0.6);
  const cash = Math.max(current_home_value - reducedHome, 0);
  const monthly_income_from_investment = Math.round(cash * 0.04 / 12);
  return {
    card_id: 'a-11', age, current_home_value, reduced_home_value: reducedHome,
    cash_amount: cash, monthly_income_from_investment,
    new_monthly_cash_flow: monthly_income_from_investment,
    achievable: cash > 0,
    summary: `집을 줄이면 ${cash.toLocaleString()}만원 현금화 → 월 ${monthly_income_from_investment.toLocaleString()}만원 추가 소득이 생겨요.`,
  };
}

// A-12: 결혼 자금 준비
export function wedding_fund(inputs) {
  const { birth_year, net_worth = 0, monthly_income = 0, monthly_expense = 0,
    spouse_income = 0, target_wedding_amount = 5000, target_years = 3 } = inputs;
  const age = getAge(birth_year);
  const gap = Math.max(target_wedding_amount - net_worth * 0.3, 0);
  const months = target_years * 12;
  const monthly_needed = months > 0 ? Math.ceil(gap / months) : 0;
  const monthlySavings = Math.max(monthly_income + (spouse_income || 0) - monthly_expense, 0);
  const achievable = monthlySavings >= monthly_needed;
  return {
    card_id: 'a-12', age, target_amount: target_wedding_amount, gap: Math.round(gap),
    months_needed: months, monthly_savings_needed: monthly_needed, achievable,
    summary: achievable
      ? `${target_years}년 안에 결혼 자금 ${target_wedding_amount.toLocaleString()}만원 마련 가능해요!`
      : `월 ${monthly_needed.toLocaleString()}만원 저축하면 ${target_years}년 후 결혼 자금이 준비돼요.`,
  };
}

// A-14: 출산 준비
export function birth_prep(inputs) {
  const { birth_year, net_worth = 0, monthly_income = 0, monthly_expense = 0,
    spouse_income = 0, months_until_birth = 9 } = inputs;
  const age = getAge(birth_year);
  const estimated_birth_cost = 3000;
  const monthlySavings = Math.max(monthly_income + (spouse_income || 0) - monthly_expense, 0);
  const current_available = Math.min(net_worth * 0.2, estimated_birth_cost);
  const gap = Math.max(estimated_birth_cost - current_available, 0);
  const monthly_needed = months_until_birth > 0 ? Math.ceil(gap / months_until_birth) : gap;
  const achievable = monthlySavings >= monthly_needed;
  return {
    card_id: 'a-14', age, estimated_birth_cost, current_available_savings: Math.round(current_available),
    gap: Math.round(gap), months_until_birth, monthly_savings_needed: monthly_needed, achievable,
    summary: achievable
      ? `${months_until_birth}개월 안에 출산 준비 자금 ${estimated_birth_cost.toLocaleString()}만원을 마련할 수 있어요!`
      : `월 ${monthly_needed.toLocaleString()}만원씩 저축하면 출산 전에 준비 완료해요.`,
  };
}

// A-15: 자녀에게 남기기
export function legacy_fund(inputs) {
  const { birth_year, net_worth = 0, monthly_income = 0, monthly_expense = 0,
    spouse_income = 0, retirement_age = 65, life_expectancy = 85,
    monthly_expense_in_retirement } = inputs;
  const age = getAge(birth_year);
  const yearsToRetirement = Math.max(retirement_age - age, 0);
  const retirementExpense = monthly_expense_in_retirement || monthly_expense * 0.8;
  const monthlySavings = Math.max(monthly_income + (spouse_income || 0) - monthly_expense, 0);
  const r = ANNUAL_RETURN / 12;
  const asset_at_retirement = Math.round(fvLump(net_worth, ANNUAL_RETURN, yearsToRetirement) + fvAnnuity(monthlySavings, r, yearsToRetirement * 12));
  const retirementYears = Math.max(life_expectancy - retirement_age, 0);
  const total_retirement_expense = Math.round(retirementExpense * 12 * retirementYears);
  const legacy_amount = Math.max(asset_at_retirement - total_retirement_expense, 0);
  return {
    card_id: 'a-15', age, asset_at_retirement, total_retirement_expense,
    legacy_amount, can_leave_legacy: legacy_amount > 0,
    achievable: legacy_amount > 0,
    summary: legacy_amount > 0
      ? `노후를 충분히 쓰고도 약 ${Math.round(legacy_amount / 10000)}억원을 남길 수 있어요.`
      : `노후 자금이 부족해요. 저축을 늘리면 자녀에게도 남길 수 있어요.`,
  };
}

// A-16: 퇴직금 수령 방식
export function retirement_severance(inputs) {
  const { birth_year, monthly_income = 0, retirement_age = 60,
    severance_amount = 10000 } = inputs;
  const age = getAge(birth_year);
  const taxRate = 0.165;
  const lump_sum_after_tax = Math.round(severance_amount * (1 - taxRate * 0.3));
  const retirementYears = Math.max(85 - retirement_age, 0);
  const monthly_pension_from_irp = retirementYears > 0 ? Math.round(severance_amount / (retirementYears * 12)) : 0;
  const tax_saving = Math.round(severance_amount * taxRate * 0.3);
  return {
    card_id: 'a-16', age, severance_amount, lump_sum_after_tax,
    monthly_pension_from_irp, tax_saving, achievable: true,
    summary: `IRP로 이전하면 매월 ${monthly_pension_from_irp.toLocaleString()}만원 + 세금 ${tax_saving.toLocaleString()}만원 절약이에요.`,
  };
}

// A-17: 노후 의료비
export function healthcare_fund(inputs) {
  const { birth_year, net_worth = 0, monthly_income = 0, monthly_expense = 0,
    spouse_income = 0, retirement_age = 65 } = inputs;
  const age = getAge(birth_year);
  const lifeExpectancy = 85;
  const estimated_healthcare_total = Math.round(monthly_expense * 0.15 * 12 * (lifeExpectancy - 65));
  const yearsToRetirement = Math.max(retirement_age - age, 0);
  const monthlySavings = Math.max(monthly_income + (spouse_income || 0) - monthly_expense, 0);
  const r = ANNUAL_RETURN / 12;
  const current_health_fund = Math.round(fvAnnuity(monthlySavings * 0.1, r, yearsToRetirement * 12));
  const gap = Math.max(estimated_healthcare_total - current_health_fund, 0);
  return {
    card_id: 'a-17', age, estimated_healthcare_total, current_health_fund,
    monthly_healthcare_savings_needed: yearsToRetirement > 0 ? Math.round(gap / (yearsToRetirement * 12)) : 0,
    gap: Math.round(gap), achievable: current_health_fund >= estimated_healthcare_total,
    summary: `65세 이후 예상 의료비는 약 ${Math.round(estimated_healthcare_total / 10000)}억원이에요. 지금부터 준비해요.`,
  };
}

// A-18: 자녀 지원 후 내 노후
export function child_support_and_retirement(inputs) {
  const { birth_year, net_worth = 0, monthly_income = 0, monthly_expense = 0,
    spouse_income = 0, retirement_age = 65,
    child_support_amount = 5000, child_support_age = 55 } = inputs;
  const age = getAge(birth_year);
  const yearsToRetirement = Math.max(retirement_age - age, 0);
  const monthlySavings = Math.max(monthly_income + (spouse_income || 0) - monthly_expense, 0);
  const r = ANNUAL_RETURN / 12;
  const asset_before = Math.round(fvLump(net_worth, ANNUAL_RETURN, yearsToRetirement) + fvAnnuity(monthlySavings, r, yearsToRetirement * 12));
  const asset_after = Math.max(asset_before - child_support_amount, 0);
  const monthly_pension = Math.round(asset_after * 0.04 / 12);
  return {
    card_id: 'a-18', age, child_support_amount, asset_before_support: asset_before,
    asset_after_support: asset_after, monthly_pension_possible: monthly_pension,
    impact_on_retirement: child_support_amount,
    achievable: asset_after > 0,
    summary: `자녀에게 ${child_support_amount.toLocaleString()}만원 지원 후에도 노후 자금 ${Math.round(asset_after / 10000)}억원이 남아요.`,
  };
}

// A-19: 수익률별 비교
export function return_comparison(inputs) {
  const { birth_year, net_worth = 0, monthly_income = 0, monthly_expense = 0,
    spouse_income = 0 } = inputs;
  const age = getAge(birth_year);
  const targetAge = 60;
  const yearsLeft = Math.max(targetAge - age, 0);
  const monthlySavings = Math.max(monthly_income + (spouse_income || 0) - monthly_expense, 0);
  const rates = [0.04, 0.06, 0.08, 0.10];
  const scenarios = rates.map(rate => {
    const r = rate / 12;
    const months = yearsLeft * 12;
    const projected = Math.round(fvLump(net_worth, rate, yearsLeft) + fvAnnuity(monthlySavings, r, months));
    return { rate: Math.round(rate * 100), projected_wealth: projected, achievable_10eok: projected >= 100000 };
  });
  return {
    card_id: 'a-19', age, scenarios, recommended_rate: 6, achievable: scenarios[1].achievable_10eok,
    summary: `연 6% 기준으로 ${targetAge}세에 약 ${Math.round(scenarios[1].projected_wealth / 10000)}억원이 예상돼요.`,
  };
}

// A-20: 절세 전략
export function tax_saving(inputs) {
  const { birth_year, monthly_income = 0 } = inputs;
  const age = getAge(birth_year);
  const annualIncome = monthly_income * 12;
  const irp_limit = Math.min(annualIncome, 9000000);
  const irp_tax_saving_annual = Math.round(irp_limit * 0.165);
  const isa_benefit_annual = Math.round(20000000 * 0.154 / 5);
  const pension_limit = 6000000;
  const pension_saving_tax_saving = Math.round(pension_limit * 0.165);
  const total = irp_tax_saving_annual + isa_benefit_annual + pension_saving_tax_saving;
  const recommended_monthly = Math.round((irp_limit + 20000000 / 5 + pension_limit) / 12);
  return {
    card_id: 'a-20', age, irp_tax_saving_annual, isa_benefit_annual, pension_saving_tax_saving,
    total_annual_saving: total, recommended_monthly_contribution: recommended_monthly,
    achievable: true,
    summary: `IRP·ISA·연금저축으로 연간 최대 ${Math.round(total / 10000)}억원 절세할 수 있어요.`,
  };
}

// A-b1: 배우자 사망 시나리오
export function spouse_death_scenario(inputs) {
  const { birth_year, net_worth = 0, monthly_income = 0, monthly_expense = 0,
    spouse_income = 0, retirement_age = 65 } = inputs;
  const age = getAge(birth_year);
  const yearsToRetirement = Math.max(retirement_age - age, 0);
  const r = ANNUAL_RETURN / 12;
  const months = yearsToRetirement * 12;
  const normalSavings = Math.max(monthly_income + (spouse_income || 0) - monthly_expense, 0);
  const soloSavings = Math.max(monthly_income - monthly_expense * 0.7, 0);
  const current_projected = Math.round(fvLump(net_worth, ANNUAL_RETURN, yearsToRetirement) + fvAnnuity(normalSavings, r, months));
  const solo_projected = Math.round(fvLump(net_worth, ANNUAL_RETURN, yearsToRetirement) + fvAnnuity(soloSavings, r, months));
  const difference = current_projected - solo_projected;
  return {
    card_id: 'a-b1', age, current_projected_wealth: current_projected,
    solo_projected_wealth: solo_projected, difference: Math.max(difference, 0),
    achievable: solo_projected > 0,
    gap: Math.max(difference, 0),
    summary: `배우자 소득 없이도 ${retirement_age}세에 약 ${Math.round(solo_projected / 10000)}억원이 예상돼요.`,
  };
}

// A-b2: 퇴직 후 건강보험료
export function health_insurance_cost(inputs) {
  const { birth_year, monthly_income = 0, net_worth = 0, retirement_age = 60 } = inputs;
  const age = getAge(birth_year);
  const current_monthly_premium = Math.round(monthly_income * 0.0709 / 2);
  const propertyScore = Math.round(net_worth / 100000 * 95.25);
  const incomeScore = 0;
  const estimated_local_premium = Math.round((propertyScore + incomeScore) * 208.4);
  const monthly_increase = Math.max(estimated_local_premium - current_monthly_premium, 0);
  return {
    card_id: 'a-b2', age, current_monthly_premium, estimated_local_premium,
    monthly_increase, annual_increase: monthly_increase * 12,
    achievable: true,
    summary: `퇴직 후 건보료가 월 ${monthly_increase.toLocaleString()}원 (연 ${Math.round(monthly_increase * 12 / 10000)}만원) 늘어날 수 있어요.`,
  };
}

export function runCalc(cardId, inputs) {
  switch (cardId) {
    case 'a-1':  return target_wealth_10eok(inputs);
    case 'a-2':  return fire_retirement(inputs);
    case 'a-3':  return home_purchase(inputs);
    case 'a-4':  return retirement_monthly_income(inputs);
    case 'a-5':  return education_fund(inputs);
    case 'a-6':  return emergency_fund(inputs);
    case 'a-7':  return travel_retirement(inputs);
    case 'a-8':  return startup_fund(inputs);
    case 'a-10': return debt_paydown(inputs);
    case 'a-11': return downsizing(inputs);
    case 'a-12': return wedding_fund(inputs);
    case 'a-14': return birth_prep(inputs);
    case 'a-15': return legacy_fund(inputs);
    case 'a-16': return retirement_severance(inputs);
    case 'a-17': return healthcare_fund(inputs);
    case 'a-18': return child_support_and_retirement(inputs);
    case 'a-19': return return_comparison(inputs);
    case 'a-20': return tax_saving(inputs);
    case 'a-b1': return spouse_death_scenario(inputs);
    case 'a-b2': return health_insurance_cost(inputs);
    default:     return null;
  }
}
