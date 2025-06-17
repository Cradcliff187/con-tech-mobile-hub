
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

export const LoadingSpinner = ({ size = 'md', className, text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <div 
        className={cn(
          'animate-spin rounded-full border-2 border-slate-300 border-t-slate-600',
          sizeClasses[size]
        )} 
      />
      {text && <span className="text-slate-600">{text}</span>}
    </div>
  );
};
