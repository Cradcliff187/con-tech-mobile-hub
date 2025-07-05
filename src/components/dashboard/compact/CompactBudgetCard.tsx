import React from 'react';
import { DollarSign } from 'lucide-react';
import { useBudgetTracking } from '@/hooks/useBudgetTracking';
import { CompactMetricCard } from './CompactMetricCard';

interface CompactBudgetCardProps {
  onClick?: () => void;
  className?: string;
}

// Same formatting function as BudgetTracker
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const CompactBudgetCard = ({ onClick, className }: CompactBudgetCardProps) => {
  const { metrics, loading, error } = useBudgetTracking();

  if (loading) {
    return (
      <CompactMetricCard
        icon={DollarSign}
        title="Budget"
        value=""
        subtitle=""
        color="text-slate-500"
        onClick={onClick}
        loading={true}
        className={className}
      />
    );
  }

  if (error || !metrics) {
    return (
      <CompactMetricCard
        icon={DollarSign}
        title="Budget"
        value="N/A"
        subtitle="Data unavailable"
        color="text-slate-500"
        onClick={onClick}
        className={className}
      />
    );
  }

  // Calculate derived values (same logic as BudgetTracker)
  const spentPercentage = metrics.totalBudget > 0 
    ? Math.round((metrics.currentSpend / metrics.totalBudget) * 100) 
    : 0;

  // Color coding based on spending percentage
  const color = spentPercentage <= 70 
    ? 'text-green-600' 
    : spentPercentage <= 85
    ? 'text-orange-600'
    : 'text-red-600';

  const subtitle = `${spentPercentage}% of budget`;

  return (
    <CompactMetricCard
      icon={DollarSign}
      title="Budget"
      value={formatCurrency(metrics.currentSpend)}
      subtitle={subtitle}
      color={color}
      onClick={onClick}
      className={className}
    />
  );
};