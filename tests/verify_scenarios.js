import { SimulationEngine } from '../public/js/logic/simulation_engine.js';
import fs from 'fs';
import path from 'path';

/**
 * 시나리오 검증 스크립트
 * - 다양한 페르소나에 대한 시뮬레이션을 실행하고 결과를 CSV로 저장하여 로직 정확성을 검증함.
 */

// 1. 공통 유틸리티
const formatCurrency = (val) => Math.round(val).toLocaleString();

const runTest = (scenarioName, inputData) => {
    console.log(`\n[Test] Running Scenario: ${scenarioName}`);

    // 시뮬레이션 실행
    const results = SimulationEngine.run(inputData);

    // 결과 중 가장 일반적인 케이스(Case 1: 은퇴/정상/유지)만 추출하여 로그 분석
    const targetCase = results.find(r => r.name.includes("Case 1"));
    if (!targetCase) {
        console.error("Case 1 not found!");
        return;
    }

    // CSV 헤더
    let csvContent = "Age,Estate,Cash,TotalIncome,Labor,NationalPension,RetirementPension,PersonalPension,BasicPension,Expense,NetIncome,HealthFee\n";

    targetCase.log.forEach(row => {
        const d_health = row.healthIns ? row.healthIns.fee : 0;
        const line = [
            row.age,
            Math.round(row.estate),
            Math.round(row.endCash),
            Math.round(row.incomes.total),
            Math.round(row.incomes.labor),
            Math.round(row.incomes.np),
            Math.round(row.incomes.rp),
            Math.round(row.incomes.pp),
            Math.round(row.incomes.basic),
            Math.round(row.expense),
            Math.round(row.incomes.total - row.expense - (d_health * 12)),
            Math.round(d_health)
        ].join(",");
        csvContent += line + "\n";
    });

    // 파일 저장
    const fileName = `verification_${scenarioName.replace(/\s/g, '_')}.csv`;
    const savedPath = path.join('tests', fileName);

    // tests 폴더 없으면 생성
    if (!fs.existsSync('tests')) fs.mkdirSync('tests');

    fs.writeFileSync(savedPath, csvContent, 'utf8');
    console.log(`✅ Report saved to: ${savedPath}`);

    // 간단 검증 (자산이 NaN이 아닌지)
    const lastRow = targetCase.log[targetCase.log.length - 1];
    if (isNaN(lastRow.endCash)) {
        console.error("❌ Test Failed: Final cash is NaN");
    } else {
        console.log(`   Final Cash at 85: ${formatCurrency(lastRow.endCash)} 만원`);
    }
};

// 2. 시나리오 정의

// Scenario A: 30세 사회초년생 (자산 적음, 소득 있음)
const scenarioA = {
    h_year: 1994, w_year: 1994, // 30세
    location: '수도권', housingType: 'wolse', monthlyRentCost: 50,
    real_estate: 0, cash_asset: 5000,
    current_income: 300, current_expense: 200,
    target_retirement_age: 60, retirement_living_cost: 200,
    h_np_amt: 100, w_np_amt: 100 // 예상 연금
};

// Scenario B: 50세 과장님 (집 있음, 자녀 교육비 등 지출 많음)
const scenarioB = {
    h_year: 1974, w_year: 1976, // 50세
    location: '수도권', housingType: 'owned', monthlyRentCost: 0,
    real_estate: 80000, cash_asset: 10000,
    current_income: 600, current_expense: 500,
    target_retirement_age: 60, retirement_living_cost: 300,
    h_np_amt: 150, w_np_amt: 0
};

// 실행
runTest("Young_Professional", scenarioA);
runTest("Middle_Aged_Manager", scenarioB);
