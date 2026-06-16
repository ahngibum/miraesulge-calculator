import { SimulationEngine } from './simulation_engine.js';

/**
 * AI 다중 생존 전략 최적화 엔진 (Multi-Strategy Optimizer)
 * - 사용자 상황을 분석하여 3가지(절약형, 자산활용형, 활동형) 독립적인 생존 플랜을 제안함.
 */

export const Optimizer = {
    // 목표: 85세까지(혹은 기본 수명까지) 현금 잔고 >= 0 유지
    findAllSolutions: function (initialInput) {
        const solutions = [];

        // 0. 기본 상태 진단 (Case 1 기준)
        const baseResult = SimulationEngine.run(initialInput);
        const baseCaseIndex = 0; // Case 1: 은퇴/정상/유지
        const baseCase = baseResult[baseCaseIndex];

        if (baseCase.isAllSafe) {
            return {
                status: 'SAFE',
                message: "현재 상태로도 충분히 안정적인 노후가 예상됩니다.",
                strategies: []
            };
        }

        // ==========================================
        // Method A: "알뜰형" (Frugal Plan)
        // - 전략: 자산 유동화 X, 추가 소득 X -> 오직 지출만 줄임
        // ==========================================
        let planA = null;
        for (let cutRate = 0.05; cutRate <= 0.40; cutRate += 0.05) { // 최대 40%까지 감축 시도
            let reducedExpense = Math.floor(Number(initialInput.retirement_living_cost) * (1 - cutRate));
            let tryInput = { ...initialInput, retirement_living_cost: reducedExpense };

            // Case 1으로 재검증
            let tryResult = SimulationEngine.run(tryInput)[baseCaseIndex];
            if (tryResult.isAllSafe) {
                planA = {
                    type: 'A',
                    title: 'A안: 알뜰형 (지출 절감)',
                    summary: `월 생활비를 ${reducedExpense}만원으로 맞취보세요.`,
                    description: `현재 ${initialInput.retirement_living_cost}만원에서 **${Math.round(cutRate * 100)}% 줄이면** 가진 자산만으로 평생 안전합니다.`,
                    input: tryInput,
                    targetScenarioId: 1
                };
                break;
            }
        }
        if (planA) solutions.push(planA);


        // ==========================================
        // Method B: "자산 활용형" (Asset Rich Plan)
        // - 전략: 지출 유지, 추가 소득 X -> 주택연금 등 자산 유동화
        // ==========================================
        let planB = null;
        if (Number(initialInput.real_estate) > 0) {
            // Case 3: 주택연금 활용 시나리오 체크
            let liqScenarioId = 3;
            let liqResult = SimulationEngine.run(initialInput).find(r => r.id === liqScenarioId);

            if (liqResult && liqResult.isAllSafe) {
                planB = {
                    type: 'B',
                    title: 'B안: 자산 활용형 (주택연금)',
                    summary: '집을 활용해 생활비를 충당하세요.',
                    description: `생활비를 줄이지 않고, **주택연금**에 가입하면 부족한 현금 흐름이 해결됩니다.`,
                    input: initialInput, // 입력값 변경 없음 (시나리오만 변경)
                    targetScenarioId: 3
                };
            }
            // 추후: 주택연금으로도 부족하면 '다운사이징' 로직 추가 가능
        }
        if (planB) solutions.push(planB);


        // ==========================================
        // Method C: "활동형" (Active Income Plan)
        // - 전략: 지출 유지, 자산 보존 -> 은퇴 초기 추가 소득 확보
        // ==========================================
        let planC = null;
        // 이미 1, 2안이 나왔더라도 옵션 제공을 위해 계산
        // "현금 자산"을 추가하는 방식으로 시뮬레이션 (은퇴 전까지 모으거나, 은퇴 후 버는 돈의 총합)

        let requiredTotalIncome = 0;
        const step = 2000; // 2천만원 단위 증가
        const maxAdd = 50000; // 최대 5억까지 시도

        for (let addedCash = step; addedCash <= maxAdd; addedCash += step) {
            let tryInput = {
                ...initialInput,
                cash_asset: Number(initialInput.cash_asset) + addedCash
            };

            // Case 1 기준 검증 (자산 보존이 목표이므로)
            let tryResult = SimulationEngine.run(tryInput)[baseCaseIndex];

            if (tryResult.isAllSafe) {
                requiredTotalIncome = addedCash;
                planC = {
                    type: 'C',
                    title: 'C안: 활동형 (추가 소득)',
                    summary: `총 ${Math.round(addedCash / 10000)}억원을 더 확보하세요.`,
                    description: `생활 수준을 유지하고 집도 지키려면, 은퇴 전후로 **총 ${Number(addedCash).toLocaleString()}만원**을 더 벌어야 합니다.`,
                    input: tryInput,
                    targetScenarioId: 1
                };
                break;
            }
        }
        if (planC) solutions.push(planC);

        return {
            status: solutions.length > 0 ? 'SOLVED' : 'FAILED',
            message: solutions.length > 0 ? "AI가 3가지 맞춤형 생존 전략을 찾았습니다." : "현재 조건으로는 해결이 매우 어렵습니다. 전문가 상담이 필요합니다.",
            strategies: solutions
        };
    }
};
