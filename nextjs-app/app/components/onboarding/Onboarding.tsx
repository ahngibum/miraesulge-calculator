'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ONBOARDING_QUESTIONS, SKIP_LABEL } from '@/app/lib/constants/onboarding';
import ProgressBar from './ProgressBar';
import CompanionBar from './CompanionBar';
import BirthYearInput from './BirthYearInput';
import ChipsInput from './ChipsInput';
import RangeInput from './RangeInput';

type Answers = Record<string, string | number>;

function isQuestionVisible(qId: string, answers: Answers): boolean {
  const q = ONBOARDING_QUESTIONS.find(q => q.id === qId);
  if (!q?.dependsOn) return true;
  const dep = q.dependsOn;
  const depAnswer = answers[dep.questionId];
  if (Array.isArray(dep.value)) return dep.value.includes(String(depAnswer));
  return String(depAnswer) === dep.value;
}

export default function Onboarding() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);

  const visibleQuestions = useMemo(
    () => ONBOARDING_QUESTIONS.filter(q => isQuestionVisible(q.id, answers)),
    [answers]
  );

  const currentQ = visibleQuestions[stepIndex];
  const total = visibleQuestions.length;

  function handleAnswer(value: string | number) {
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
  }

  function handleNext() {
    if (stepIndex < visibleQuestions.length - 1) {
      setStepIndex(i => i + 1);
    } else {
      const params = new URLSearchParams();
      Object.entries(answers).forEach(([k, v]) => params.set(k, String(v)));
      router.push(`/calculator/a-1?${params.toString()}`);
    }
  }

  function handleBack() {
    if (stepIndex > 0) setStepIndex(i => i - 1);
  }

  function handleSkip() {
    handleNext();
  }

  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;
  const canProceed = currentAnswer !== undefined && currentAnswer !== '';

  if (!currentQ) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ProgressBar current={stepIndex + 1} total={total} />

      <div className="flex-1 flex flex-col pt-2 pb-8">
        <CompanionBar ment={currentQ.companionMent} />

        <div className="px-4 mb-6">
          <h2 className="text-xl font-medium text-gray-800 leading-snug">{currentQ.question}</h2>
        </div>

        <div className="flex-1">
          {currentQ.type === 'birth_year' && (
            <BirthYearInput
              value={String(currentAnswer ?? '')}
              onChange={handleAnswer}
            />
          )}
          {currentQ.type === 'chips' && currentQ.options && (
            <ChipsInput
              options={currentQ.options}
              value={String(currentAnswer ?? '')}
              onChange={handleAnswer}
              allowCustom={currentQ.allowCustom}
            />
          )}
          {currentQ.type === 'range' && (
            <RangeInput
              min={currentQ.min!}
              max={currentQ.max!}
              step={currentQ.step!}
              unit={currentQ.unit!}
              value={Number(currentAnswer ?? currentQ.defaultValue ?? currentQ.min)}
              onChange={handleAnswer}
              allowCustom={currentQ.allowCustom}
            />
          )}
        </div>

        <div className="px-4 mt-8 space-y-3">
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="w-full py-4 rounded-xl bg-teal-500 text-white font-medium text-base disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {stepIndex < total - 1 ? '다음' : '결과 보기'}
          </button>

          <button
            onClick={handleSkip}
            className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            {SKIP_LABEL}
          </button>

          {stepIndex > 0 && (
            <button
              onClick={handleBack}
              className="w-full py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← 이전으로
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
