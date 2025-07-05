import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CompactMetricCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
  onClick?: () => void;
  loading?: boolean;
  className?: string;
}

export const CompactMetricCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
  onClick,
  loading = false,
  className = ''
}: CompactMetricCardProps) => {
  if (loading) {
    return (
      <Card className={`h-20 cursor-pointer hover:shadow-md transition-shadow ${className}`}>
        <CardContent className="p-4 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-6 w-12 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`h-20 cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-4 h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              <Icon className={`h-8 w-8 ${color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-600 mb-1">{title}</p>
              <p className="text-lg font-bold text-slate-800 mb-1 truncate">{value}</p>
              <p className="text-xs text-slate-500 truncate">{subtitle}</p>
            </div>
          </div>
          <div className="flex-shrink-0 ml-2">
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};