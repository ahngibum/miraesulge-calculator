'use client';

interface CompanionBarProps {
  ment: string;
}

export default function CompanionBar({ ment }: CompanionBarProps) {
  return (
    <div className="flex items-start gap-2 px-4 py-3 bg-teal-50 rounded-xl mx-4 mb-4">
      <span className="text-lg shrink-0">🤖</span>
      <p className="text-sm text-teal-800 leading-relaxed">{ment}</p>
    </div>
  );
}
