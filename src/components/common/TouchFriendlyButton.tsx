
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TouchFriendlyButtonProps extends ButtonProps {
  touchOptimized?: boolean;
}

export const TouchFriendlyButton = ({ 
  className, 
  touchOptimized = true, 
  size,
  ...props 
}: TouchFriendlyButtonProps) => {
  const touchClasses = touchOptimized ? 'min-h-[44px] min-w-[44px] touch-manipulation' : '';
  
  return (
    <Button
      className={cn(touchClasses, className)}
      size={size}
      {...props}
    />
  );
};
