import { Star } from 'lucide-react';

interface LeadScoreIndicatorProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'default';
}

export const LeadScoreIndicator = ({ score, maxScore = 100, size = 'default' }: LeadScoreIndicatorProps) => {
  const percentage = Math.min((score / maxScore) * 100, 100);
  const iconSize = size === 'sm' ? 14 : 16;
  
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 80) return 'Hot';
    if (percentage >= 60) return 'Warm';
    if (percentage >= 40) return 'Cool';
    return 'Cold';
  };

  return (
    <div className="flex items-center gap-2">
      <Star 
        size={iconSize} 
        className={`${getScoreColor(percentage)} fill-current`}
      />
      <div className="flex items-center gap-1">
        <span className={`text-sm font-medium ${getScoreColor(percentage)}`}>
          {score}
        </span>
        <span className={`text-xs ${getScoreColor(percentage)} opacity-75`}>
          ({getScoreLabel(percentage)})
        </span>
      </div>
    </div>
  );
};