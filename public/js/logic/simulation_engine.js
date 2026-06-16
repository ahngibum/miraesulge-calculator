import { IncomeLogic } from './income_logic.js';
import { ExpenseLogic } from './expense_logic.js';

/**
 * 시뮬레이션 엔진 (Core Logic)
 * - 입력을 받아 연도별 자산 흐름을 시뮬레이션하고 결과를 반환
 */

export const SimulationEngine = {
    run: function (data) {
        const getNum = (v) => isNaN(Number(v)) ? 0 : Number(v);
        const currentYear = new Date().getFullYear();
        const hBirth = getNum(data.h_year);
        const wBirth = getNum(data.w_year);
        const hAgeNow = currentYear - hBirth;
        const location = data.location || '수도권';

        const housingType = data.housingType || 'owned';
        const initialMonthlyRent = getNum(data.monthlyRentCost);

        const targetRetirementAge = getNum(data.target_retirement_age) || 65;
        const currentMonthlyIncome = getNum(data.current_income);
        const minMonthlyIncome = 250;

        const startAge = hAgeNow;
        const endAge = 85;

        // 시나리오 정의
        const cases = [
            { name: "Case 1 (은퇴/정상/유지)", pension: 'normal', liquid: false },
            { name: "Case 2 (은퇴/조기/유지)", pension: 'early', liquid: false },
            { name: "Case 3 (은퇴/정상/유동)", pension: 'normal', liquid: true },
            { name: "Case 4 (은퇴/조기/유동)", pension: 'early', liquid: true },
            { name: "Case 5 (근로/정상/유지)", pension: 'normal', liquid: false },
            { name: "Case 6 (근로/조기/유지)", pension: 'early', liquid: false },
            { name: "Case 7 (근로/정상/유동)", pension: 'normal', liquid: true },
            { name: "Case 8 (근로/조기/유동)", pension: 'early', liquid: true }
        ];

        return cases.map((opt, idx) => {
            let cash = getNum(data.cash_asset);
            let estate = getNum(data.real_estate);
            let currentMonthlyRent = initialMonthlyRent;

            let hasLiq = false;
            let isHomePension = false;
            let status = {};
            let min = cash;
            let max = startAge - 1;
            let minAfter60 = null;
            let yearlyLog = [];

            const targetPensionAge = (opt.pension === 'early') ? 60 : 65;

            for (let age = startAge; age <= endAge; age++) {
                let thisYear = currentYear + (age - startAge);
                let startCash = cash;

                let yearlyNet = 0;
                let totalIncome = 0;
                let yearlyExpense = 0;

                let incLabor = 0;
                let incNP = 0, incRP = 0, incPP = 0, incHome = 0, incBasic = 0;
                let healthResult = { fee: 0, status: '-' };

                // 1. 은퇴 및 근로소득 계산
                const isRetired = (age >= targetRetirementAge);

                if (!isRetired) {
                    let calculatedMonthlyIncome = currentMonthlyIncome;
                    // 임금 피크제 적용 (60세부터 소득 감소)
                    if (currentMonthlyIncome > minMonthlyIncome && age >= 60) {
                        const decayStartAge = Math.max(60, hAgeNow);
                        const decayEndAge = targetRetirementAge - 1;
                        if (decayEndAge > decayStartAge) {
                            const dropPerYear = (currentMonthlyIncome - minMonthlyIncome) / (decayEndAge - decayStartAge);
                            calculatedMonthlyIncome = currentMonthlyIncome - (dropPerYear * (age - decayStartAge));
                        } else {
                            calculatedMonthlyIncome = (age === decayEndAge) ? minMonthlyIncome : currentMonthlyIncome;
                        }
                    }
                    incLabor = IncomeLogic.calcLaborIncome(calculatedMonthlyIncome * 12);
                } else {
                    incLabor = 0;
                }

                // 2. 지출 계산
                let baseMonthlyExpense = isRetired ? getNum(data.retirement_living_cost) : getNum(data.current_expense);
                yearlyExpense = (baseMonthlyExpense * 12) + (currentMonthlyRent * 12);

                // 3. 자산 재조정 (55세 미만)
                if (age < 55 && estate < 100000) {
                    if (cash >= estate * 1.5) {
                        let transferAmt = cash * 0.5;
                        cash -= transferAmt;
                        estate += transferAmt;
                    }
                }

                // 4. 자산 유동화 로직
                // (이 부분은 로직이 복잡하여 현재 엔진 내에 두되, 추후 AssetLogic 등으로 분리 가능)
                if (opt.liquid && !hasLiq && ((age < targetPensionAge && cash < 5000) || age === targetPensionAge)) {
                    let liqAmt = 0;
                    if (housingType === 'owned') {
                        let target = estate * 0.5;
                        let limit = estate - 10000;
                        if (limit > 0) liqAmt = Math.min(target, limit);
                    } else if (housingType === 'jeonse') {
                        let target = estate * 0.5;
                        let limit = estate - 10000;
                        if (limit > 0) liqAmt = Math.min(target, limit);
                    } else if (housingType === 'wolse') {
                        let target = estate * 0.5;
                        let limit = estate - 2000;
                        if (limit > 0) {
                            liqAmt = Math.min(target, limit);
                            if (liqAmt > 0) currentMonthlyRent += (liqAmt * 0.05) / 12;
                        }
                    }

                    if (liqAmt > 0) {
                        cash += liqAmt;
                        estate -= liqAmt;
                        hasLiq = true;
                        if (housingType === 'owned') isHomePension = true;
                    }
                }

                if (!opt.liquid && housingType === 'owned' && age >= 60 && cash < 2000) { isHomePension = true; }
                if (opt.liquid && housingType === 'owned' && age >= targetPensionAge) { isHomePension = true; }
                if (isHomePension && housingType === 'owned') incHome = estate * 0.024;

                // 5. 연금 수령 (IncomeLogic 활용)
                const getP = (amt, offset, dur, type, isNat, pType) => {
                    let sAge = targetPensionAge;
                    let birth = (pType === 'h' ? hBirth : wBirth);
                    let startYear = birth + sAge; // 연금 개시 연도
                    return IncomeLogic.getPensionAmount(amt, startYear, dur, type, isNat, thisYear);
                };

                incNP = (getP(data.h_np_amt, 0, 0, opt.pension, true, 'h') + getP(data.w_np_amt, 0, 0, opt.pension, true, 'w')) * 12;
                incRP = (getP(data.h_rp_amt, 0, data.h_rp_dur, 'n', false, 'h') + getP(data.w_rp_amt, 0, data.w_rp_dur, 'n', false, 'w')) * 12;
                incPP = (getP(data.h_pp_amt, 0, data.h_pp_dur, 'n', false, 'h') + getP(data.w_pp_amt, 0, data.w_pp_dur, 'n', false, 'w')) * 12;

                // 기초연금
                if (age >= 65) {
                    let recCount = ((thisYear - hBirth >= 65 ? 1 : 0) + (thisYear - wBirth >= 65 ? 1 : 0));
                    let basicPension = IncomeLogic.calcBasicPension((incNP + incRP + incPP) / 12, incLabor / 12, incNP / 12, estate, cash, location, recCount);
                    incBasic = basicPension * 12;
                } else {
                    incBasic = 0;
                }

                // 6. 건보료 (ExpenseLogic 활용)
                healthResult = ExpenseLogic.calcHealthInsurance(incNP, incLabor, estate);

                totalIncome = incLabor + incNP + incRP + incPP + incHome + incBasic;
                yearlyNet = totalIncome - yearlyExpense - (healthResult.fee * 12); // 건보료 차감

                // 자산 업데이트
                cash += yearlyNet;
                min = Math.min(min, cash);
                status[age] = cash >= 0 ? 'O' : 'X';
                if (cash >= 0) max = age;

                if (age >= 60) {
                    if (minAfter60 === null || cash < minAfter60) {
                        minAfter60 = cash;
                    }
                }

                yearlyLog.push({
                    age: age, estate: estate, startCash: startCash, endCash: cash,
                    incomes: { total: totalIncome, labor: incLabor, np: incNP, rp: incRP, pp: incPP, home: incHome, basic: incBasic },
                    expense: yearlyExpense,
                    healthIns: healthResult,
                    isRetired: isRetired
                });
            }

            let finalInheritance = (minAfter60 !== null) ? minAfter60 : min;

            return {
                id: idx + 1, name: opt.name, config: opt,
                status: status,
                isInheritanceSafe: min >= 0,
                finalAmount: Math.floor(finalInheritance),
                maxAge: max,
                isAllSafe: (max >= 85 && min >= 0),
                log: yearlyLog
            };
        });
    }
};
