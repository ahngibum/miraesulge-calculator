import { SimulationEngine } from './js/logic/simulation_engine.js';
import { IncomeLogic } from './js/logic/income_logic.js';
import { ExpenseLogic } from './js/logic/expense_logic.js';

/**
 * [MyAICFO] 노후준비 통합 시뮬레이션 엔진 (Facade for v1.0 Modular Architecture)
 * - 기존 calculator.js의 역할을 대신하며, 실제 로직은 js/logic/ 폴더 내 모듈을 사용함.
 * - 하위 호환성을 위해 window 객체에 기존과 동일한 이름으로 바인딩함.
 */

const MyAICFO_Engine = {
    // Core Function
    runSimulation: SimulationEngine.run,

    // Exposed for legacy direct calls if any
    calculateBasicPension: IncomeLogic.calcBasicPension,
    calculateHealthInsurance: ExpenseLogic.calcHealthInsurance
};

// Global Exposure for Browser
if (typeof window !== 'undefined') {
    window.MyAICFO_Engine = MyAICFO_Engine;
    console.log("[System] Modular Simulation Engine Loaded.");
}

// Export for Node.js Testing
export { MyAICFO_Engine };