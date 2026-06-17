'use client';

import { useState } from 'react';
import type { ChipOption } from '@/app/lib/constants/onboarding';

interface ChipsInputProps {
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
  allowCustom?: boolean;
}

export default function ChipsInput({ options, value, onChange, allowCustom }: ChipsInputProps) {
  const [customVal, setCustomVal] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const isCustomSelected = value && !options.find(o => o.value === value);

  function handleChipClick(chipValue: string) {
    setShowCustom(false);
    onChange(chipValue);
  }

  function handleCustomSubmit() {
    if (customVal.trim()) {
      onChange(customVal.trim());
    }
  }

  return (
    <div className="px-4">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleChipClick(opt.value)}
            className={`px-5 py-3 rounded-lg text-sm font-medium border transition-all ${
              value === opt.value
                ? 'bg-teal-500 text-white border-teal-500'
                : 'bg-white text-gray-700 border-gray-200 hover:border-teal-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
        {allowCustom && (
          <button
            onClick={() => setShowCustom(true)}
            className={`px-5 py-3 rounded-lg text-sm font-medium border transition-all ${
              isCustomSelected
                ? 'bg-teal-500 text-white border-teal-500'
                : 'bg-white text-gray-500 border-gray-200 hover:border-teal-400'
            }`}
          >
            {isCustomSelected ? value : '직접 입력'}
          </button>
        )}
      </div>
      {showCustom && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={customVal}
            onChange={e => setCustomVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCustomSubmit()}
            placeholder="직접 입력하세요"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500"
            autoFocus
          />
          <button
            onClick={handleCustomSubmit}
            className="px-4 py-3 bg-teal-500 text-white rounded-lg text-sm font-medium"
          >
            확인
          </button>
        </div>
      )}
    </div>
  );
}
