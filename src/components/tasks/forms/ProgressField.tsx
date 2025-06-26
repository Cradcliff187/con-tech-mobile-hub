
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Task } from '@/types/database';

interface ProgressFieldProps {
  progress: number;
  setProgress: (value: number) => void;
  status: Task['status'];
  disabled?: boolean;
}

export const ProgressField: React.FC<ProgressFieldProps> = ({
  progress,
  setProgress,
  status,
  disabled = false
}) => {
  const handleSliderChange = (values: number[]) => {
    setProgress(values[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
    setProgress(value);
  };

  // Determine if progress should be locked based on status
  const isProgressLocked = status === 'not-started' || status === 'completed';
  const effectiveDisabled = disabled || isProgressLocked;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">
          Progress
        </label>
        <span className="text-sm text-slate-500" aria-live="polite">
          {progress}%
        </span>
      </div>
      
      {/* Visual Progress Bar */}
      <Progress 
        value={progress} 
        className="h-2 bg-slate-100"
        aria-label={`Task progress: ${progress} percent complete`}
      />
      
      {/* Slider Input */}
      <div className="px-1">
        <Slider
          value={[progress]}
          onValueChange={handleSliderChange}
          max={100}
          min={0}
          step={5}
          disabled={effectiveDisabled}
          className="w-full"
          aria-label="Progress slider"
        />
      </div>
      
      {/* Numeric Input */}
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="0"
          max="100"
          value={progress}
          onChange={handleInputChange}
          disabled={effectiveDisabled}
          className="w-20 text-center focus:ring-2 focus:ring-blue-300"
          aria-label="Progress percentage"
        />
        <span className="text-sm text-slate-500">%</span>
        {isProgressLocked && (
          <span className="text-xs text-slate-400 ml-2">
            {status === 'not-started' ? 'Auto-set to 0%' : 'Auto-set to 100%'}
          </span>
        )}
      </div>
    </div>
  );
};
