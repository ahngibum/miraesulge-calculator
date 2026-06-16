import { POLICY } from './start_params.js';

/**
 * 지출 계산 로직 모듈
 */

export const ExpenseLogic = {
    // 1. 건강보험료 계산 (지역가입자 전환 시)
    calcHealthInsurance: function (annualPension, annualLabor, propertyMarketValue) {
        const totalAnnualIncome = annualPension + annualLabor;
        const taxBase = propertyMarketValue * POLICY.HEALTH_INS.PROPERTY_TAX_RATIO; // 과세표준

        // 피부양자 자격 체크
        let isDependent = true;

        // 소득 요건 (연 2000만원 초과)
        if (totalAnnualIncome > POLICY.HEALTH_INS.DEP_INCOME_LIMIT) isDependent = false;

        // 재산 요건
        if (taxBase > 90000) isDependent = false; // 과표 9억 초과 (시세 약 15억)
        if (taxBase > POLICY.HEALTH_INS.DEP_PROPERTY_LIMIT && totalAnnualIncome > 1000) isDependent = false; // 과표 5.4억 초과 & 소득 1000만원 초과

        if (isDependent) return { fee: 0, status: '피부양자 (자녀 등재)' };

        // 지역가입자 보험료 계산
        // 소득 점수 (연금 50% + 근로 100%)
        const scoreIncome = (annualPension * 0.5) + annualLabor;
        const incomePremium = (scoreIncome * POLICY.COMMON.UNIT * POLICY.HEALTH_INS.INCOME_RATE) / 12;

        // 재산 점수 (간이 로직: 과표 5000만원 공제 후 나머지 금액에 대해 등급별 점수 부여 근사치)
        const targetProperty = Math.max(0, taxBase - 5000);
        let propertyScore = 0;
        if (targetProperty > 0) {
            // 원본 로직 근사: propertyScore = Math.floor(targetProperty / 100 * 1.8 + 20); 
            // 실제 건보료 점수표는 복잡하지만 여기서는 기존 로직 유지
            propertyScore = Math.floor(targetProperty / 100 * 1.8 + 20);
        }
        const propertyPremium = propertyScore * POLICY.HEALTH_INS.PROPERTY_SCORE_FACTOR;

        const healthPremium = incomePremium + propertyPremium;
        const carePremium = healthPremium * POLICY.HEALTH_INS.CARE_RATE;

        // 10원 단위 절사
        const totalMonthlyFee = Math.floor((healthPremium + carePremium) / 10) * 10;

        return { fee: totalMonthlyFee / POLICY.COMMON.UNIT, status: '지역가입자 전환' };
    },

    // 2. 생활비 계산 (향후 물가상승률 적용 가능)
    calcLivingCost: function (baseCost, inflationRate = 0, yearsPassed = 0) {
        // 복리 적용: baseCost * (1 + rate)^years
        if (inflationRate === 0) return baseCost;
        return baseCost * Math.pow(1 + inflationRate, yearsPassed);
    }
};
