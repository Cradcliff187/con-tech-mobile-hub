
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CheckCircle, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';

interface BudgetData {
  totalBudget: number;
  currentSpend: number;
  projectedTotal: number;
  variance: number;
  lastUpdated?: Date;
}

// Mock data - in a real app, this would come from props or a hook
const mockBudgetData: BudgetData = {
  totalBudget: 2500000, // $2.5M
  currentSpend: 1875000, // $1.875M (75% spent)
  projectedTotal: 2450000, // $2.45M (under budget)
  variance: 50000, // $50k under budget (2% variance)
  lastUpdated: new Date('2024-06-20')
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const getBudgetStatus = (variance: number, totalBudget: number) => {
  const variancePercentage = (variance / totalBudget) * 100;
  
  if (variancePercentage > 5) {
    return {
      status: 'under',
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle,
      label: 'Under Budget'
    };
  } else if (variancePercentage >= -5) {
    return {
      status: 'on',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: AlertTriangle,
      label: 'On Budget'
    };
  } else {
    return {
      status: 'over',
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: XCircle,
      label: 'Over Budget'
    };
  }
};

export const BudgetTracker = () => {
  const data = mockBudgetData;

  // Calculate derived values
  const spentPercentage = Math.round((data.currentSpend / data.totalBudget) * 100);
  const variancePercentage = Math.round((data.variance / data.totalBudget) * 100);
  const budgetStatus = getBudgetStatus(data.variance, data.totalBudget);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          Budget Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Spend vs Total Budget */}
          <div className="p-4 rounded-lg border bg-slate-50 border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Current Spend</h3>
              <Badge variant="secondary" className="text-xs">
                {spentPercentage}%
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-800">
                  {formatCurrency(data.currentSpend)}
                </span>
              </div>
              <div className="text-sm text-slate-500">
                of {formatCurrency(data.totalBudget)} total budget
              </div>
            </div>
          </div>

          {/* Budget Progress */}
          <div className="p-4 rounded-lg border bg-slate-50 border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Budget Progress</h3>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-800">
                  {spentPercentage}%
                </span>
                <span className="text-sm text-slate-500">utilized</span>
              </div>
              <Progress 
                value={spentPercentage} 
                className="h-3"
              />
              <p className="text-xs text-slate-500">
                Last updated: {data.lastUpdated?.toLocaleDateString() || 'N/A'}
              </p>
            </div>
          </div>

          {/* Projected Total Cost */}
          <div className="p-4 rounded-lg border bg-slate-50 border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Projected Total</h3>
              <budgetStatus.icon className={`h-4 w-4 ${budgetStatus.color}`} />
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-800">
                  {formatCurrency(data.projectedTotal)}
                </span>
              </div>
              <div className="text-sm text-slate-500">
                Estimated project completion cost
              </div>
            </div>
          </div>

          {/* Budget Variance */}
          <div className={`p-4 rounded-lg border ${budgetStatus.bg} ${budgetStatus.border}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Budget Variance</h3>
              <budgetStatus.icon className={`h-4 w-4 ${budgetStatus.color}`} />
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${budgetStatus.color}`}>
                  {data.variance >= 0 ? '+' : ''}{formatCurrency(data.variance)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  className={`text-xs ${budgetStatus.color}`}
                  variant="secondary"
                >
                  {budgetStatus.label}
                </Badge>
                <span className="text-sm text-slate-500">
                  ({variancePercentage >= 0 ? '+' : ''}{variancePercentage}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
