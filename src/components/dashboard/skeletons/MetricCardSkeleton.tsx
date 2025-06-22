
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface MetricCardSkeletonProps {
  showSubtitle?: boolean;
  showProgress?: boolean;
  className?: string;
}

export const MetricCardSkeleton = ({ 
  showSubtitle = true, 
  showProgress = false,
  className 
}: MetricCardSkeletonProps) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <Skeleton className="h-8 w-16" />
            {showSubtitle && <Skeleton className="h-4 w-12" />}
          </div>
          {showProgress && <Skeleton className="h-2 w-full" />}
          {showSubtitle && <Skeleton className="h-3 w-24" />}
        </div>
      </CardContent>
    </Card>
  );
};
