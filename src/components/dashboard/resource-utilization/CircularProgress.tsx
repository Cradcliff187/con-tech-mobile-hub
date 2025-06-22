
import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
  value: string;
}

const getColor = (rate: number) => {
  if (rate >= 85) return 'stroke-green-500';
  if (rate >= 70) return 'stroke-yellow-500';
  return 'stroke-red-500';
};

export const CircularProgress = ({ 
  percentage, 
  size = 120, 
  strokeWidth = 8, 
  color = 'text-blue-600',
  label,
  value 
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-slate-200"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-500 ${getColor(percentage)}`}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-800">{percentage}%</span>
          <span className="text-sm font-medium text-slate-600">{value}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-slate-600 text-center">{label}</span>
    </div>
  );
};
