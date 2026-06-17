'use client';

import { useState } from 'react';

interface BirthYearInputProps {
  value: string;
  onChange: (value: string) => void;
}

const CURRENT_YEAR = new Date().getFullYear();

export default function BirthYearInput({ value, onChange }: BirthYearInputProps) {
  const [inputVal, setInputVal] = useState(value || '');

  const birthYear = parseInt(inputVal);
  const age = !isNaN(birthYear) && birthYear > 1900 && birthYear <= CURRENT_YEAR
    ? CURRENT_YEAR - birthYear
    : null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, '').slice(0, 4);
    setInputVal(v);
    if (v.length === 4) onChange(v);
  }

  return (
    <div className="px-4">
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          placeholder="예: 1990"
          value={inputVal}
          onChange={handleChange}
          maxLength={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-4 text-2xl font-medium text-center text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">년생</span>
      </div>
      {age !== null && (
        <p className="text-center text-sm text-teal-700 mt-2 font-medium">
          만 {age}세이시군요! 👋
        </p>
      )}
    </div>
  );
}
