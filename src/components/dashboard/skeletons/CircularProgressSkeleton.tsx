
import { Skeleton } from '@/components/ui/skeleton';

interface CircularProgressSkeletonProps {
  size?: number;
  showLabel?: boolean;
}

export const CircularProgressSkeleton = ({ 
  size = 120, 
  showLabel = true 
}: CircularProgressSkeletonProps) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <Skeleton 
        className="rounded-full" 
        style={{ width: size, height: size }} 
      />
      {showLabel && <Skeleton className="h-4 w-20" />}
    </div>
  );
};
