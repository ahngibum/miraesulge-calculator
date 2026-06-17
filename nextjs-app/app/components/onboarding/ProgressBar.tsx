'use client';

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const remaining = total - current;

  return (
    <div className="w-full px-4 py-3">
      <p className="text-xs text-teal-700 font-medium mb-1">
        {remaining > 0 ? `${remaining}개 질문이 남았어요` : '마지막 질문이에요!'}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 shrink-0">{current}/{total}</span>
        <div className="flex gap-1 flex-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < current ? 'bg-teal-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
