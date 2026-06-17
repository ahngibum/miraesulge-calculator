'use client';

import { useState } from 'react';

interface RangeInputProps {
  min: number;
  max: number;
  step: number;
  unit: string;
  value: number;
  onChange: (value: number) => void;
  allowCustom?: boolean;
}

export default function RangeInput({ min, max, step, unit, value, onChange, allowCustom }: RangeInputProps) {
  const [customMode, setCustomMode] = useState(false);
  const [customVal, setCustomVal] = useState(String(value));

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(Number(e.target.value));
  }

  function handleCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setCustomVal(raw);
    const n = parseInt(raw);
    if (!isNaN(n)) onChange(n);
  }

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="px-4">
      <div className="text-center mb-4">
        {customMode ? (
          <div className="flex items-center justify-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={customVal}
              onChange={handleCustomChange}
              onBlur={() => setCustomMode(false)}
              className="w-36 border border-teal-500 rounded-lg px-3 py-2 text-2xl font-bold text-center text-gray-800 focus:outline-none"
              autoFocus
            />
            <span className="text-lg text-gray-600">{unit}</span>
          </div>
        ) : (
          <button
            onClick={() => { setCustomMode(true); setCustomVal(String(value)); }}
            className="text-3xl font-bold text-teal-700 underline decoration-dotted"
          >
            {value.toLocaleString()}
            <span className="text-xl ml-1 text-gray-600">{unit}</span>
          </button>
        )}
        {allowCustom && !customMode && (
          <p className="text-xs text-gray-400 mt-1">숫자를 눌러 직접 입력</p>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(Math.max(value, min), max)}
        onChange={handleSlider}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #1D9E75 ${pct}%, #e5e7eb ${pct}%)`,
        }}
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{min.toLocaleString()}{unit}</span>
        <span>{max.toLocaleString()}{unit}+</span>
      </div>
    </div>
  );
}
