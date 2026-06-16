/**
 * 기준 변수 및 정부 정책 파라미터 (v1.0)
 * - 변하지 않는 상수나, 매년 갱신되는 정책 수치들을 관리함.
 */

export const POLICY = {
  // [기초연금 관련]
  BASIC_PENSION: {
    P_VALUE: 343790, // 단독가구 기준액 (2024년 기준, 추후 업데이트 필요)
    THRESHOLD_COUPLE: 3420000, // 부부가구 소득인정액 기준
    DEDUCTION: {
      CAPITAL: '수도권',
      METRO: '광역시',
      OTHER: '기타',
      VAL_CAPITAL: 13500, // 수도권 공제액 (만원)
      VAL_METRO: 8500,
      VAL_OTHER: 7250
    }
  },

  // [건강보험료 관련]
  HEALTH_INS: {
    INCOME_RATE: 0.0709, // 소득월액 보험료율
    CARE_RATE: 0.1281, // 장기요양 보험료율
    PROPERTY_SCORE_FACTOR: 208.4, // 재산 점수당 금액
    DEP_INCOME_LIMIT: 2000, // 피부양자 탈락 소득 기준 (만원)
    DEP_PROPERTY_LIMIT: 54000, // 피부양자 탈락 재산 기준 (과세표준, 만원) -> 9억(시세 15억)
    PROPERTY_TAX_RATIO: 0.6 // 공시지가(시세) 대비 과세표준 비율
  },

  // [기타]
  COMMON: {
    UNIT: 10000, // 만원 단위
    LABOR_DEDUCTION_LIMIT: 112 // 근로소득 기본공제액 (만원) - 기초연금 산정 시 사용
  }
};
