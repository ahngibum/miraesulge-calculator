import { POLICY } from './start_params.js';

/**
 * 수입 계산 로직 모듈
 */

export const IncomeLogic = {
    // 1. 기초연금 계산
    // monthlyPensionSum: 공적연금(국민+공무원 등) 월 수령액 합계 (만원)
    // monthlyLabor: 월 근로소득 (만원)
    // monthlyNP: 월 국민연금액 (만원)
    // estate: 부동산 자산 (만원)
    // cash: 현금 자산 (만원)
    // location: 거주지 ('수도권', '광역시', 등)
    // recipientCount: 수급 대상자 수 (0, 1, 2)
    calcBasicPension: function (monthlyPensionSum, monthlyLabor, monthlyNP, estate, cash, location, recipientCount) {
        if (recipientCount === 0) return 0;

        // 근로소득 공제 (최대 112만원 + 30% 추가 공제는 로직 단순화를 위해 112만원 초과분 70% 반영으로 처리)
        // 원본 로직: monthlyLabor > 112 ? (monthlyLabor - 112) * 0.7 : 0
        let laborIncomeEval = (monthlyLabor > POLICY.COMMON.LABOR_DEDUCTION_LIMIT)
            ? (monthlyLabor - POLICY.COMMON.LABOR_DEDUCTION_LIMIT) * 0.7
            : 0;
        if (laborIncomeEval < 0) laborIncomeEval = 0;

        // 재산 공제
        let estateDeduction = POLICY.BASIC_PENSION.DEDUCTION.VAL_OTHER;
        if (location === POLICY.BASIC_PENSION.DEDUCTION.CAPITAL) estateDeduction = POLICY.BASIC_PENSION.DEDUCTION.VAL_CAPITAL;
        else if (location === POLICY.BASIC_PENSION.DEDUCTION.METRO) estateDeduction = POLICY.BASIC_PENSION.DEDUCTION.VAL_METRO;

        let estatePart = Math.max(0, estate - estateDeduction);
        let cashPart = Math.max(0, cash - 2000); // 금융재산 2000만원 기본 공제

        // 소득환산율: 연 4%
        let propertyIncome = (estatePart + cashPart) * 0.04 / 12;

        // 소득인정액 (원 단위 계산 후 만원 단위 비교를 위해 10000 곱함)
        let recognizedIncomeWon = (monthlyPensionSum + laborIncomeEval + propertyIncome) * POLICY.COMMON.UNIT;

        // 선정기준액 초과 시 지급 제외
        if (recognizedIncomeWon > POLICY.BASIC_PENSION.THRESHOLD_COUPLE) return 0;

        // 기초연금 산정
        let individualPension = POLICY.BASIC_PENSION.P_VALUE;

        // 국민연금 연계 감액 (국민연금액이 기초연금액의 1.5배 초과 시 최대 50% 감액)
        if (monthlyNP * POLICY.COMMON.UNIT > (POLICY.BASIC_PENSION.P_VALUE * 1.5)) {
            individualPension = individualPension * 0.5;
        }

        // 부부 감액 (2인 수급 시 20% 감액)
        if (recipientCount === 2) {
            return (individualPension * 0.8 * 2) / POLICY.COMMON.UNIT;
        } else {
            return individualPension / POLICY.COMMON.UNIT;
        }
    },

    // 2. 근로소득 계산 (임금피크제 등 단순화된 감소 로직 적용 가능)
    // 현재는 외부 엔진에서 감소 로직 처리 후 값만 받아옴. 필요 시 이곳으로 로직 이동 추천.
    calcLaborIncome: function (currentYearIncome) {
        return Math.max(0, currentYearIncome);
    },

    // 3. 연금 수령액 계산 유틸리티
    // type: 'early'(조기), 'normal'(정상)
    // pType: 'h'(남편), 'w'(아내)
    getPensionAmount: function (amt, startYear, duration, type, isNational, currentYear) {
        if (!amt || amt === 0) return 0;

        // 조기 수령 시 70% (5년 조기 기준 - 추후 연 단위 디테일 추가 가능)
        let finalAmt = Number(amt);
        if (isNational && type === 'early') {
            finalAmt *= 0.7;
        }

        // 수령 기간 체크
        if (currentYear >= startYear) {
            if (duration === 0) return finalAmt; // 평생 수령
            if (currentYear < startYear + Number(duration)) return finalAmt; // 기간 한정 수령
        }
        return 0;
    }
};
