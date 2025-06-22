
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface BurnRateChartProps {
  data: Array<{
    date: string;
    dailySpend: number;
    cumulativeSpend: number;
    budgetLine: number;
  }>;
  metrics?: {
    totalSpent: number;
    totalBudget: number;
    avgDailyBurn: number;
    remainingBudget: number;
    daysToComplete: number | null;
    isOverBudget: boolean;
    burnRateVariance: number;
  } | null;
}

export const BurnRateChart = ({ data, metrics }: BurnRateChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Burn Rate Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            {metrics && (
              <Badge variant={metrics.isOverBudget ? 'destructive' : 'default'}>
                {metrics.isOverBudget ? 'Over Budget' : 'On Track'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Metrics Summary */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total Spent</span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {formatCurrency(metrics.totalSpent)}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-green-800">Daily Average</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(metrics.avgDailyBurn)}
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-orange-800">Remaining</span>
              </div>
              <div className="text-lg font-bold text-orange-600">
                {formatCurrency(metrics.remainingBudget)}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-purple-800">Days Left</span>
              </div>
              <div className="text-lg font-bold text-purple-600">
                {metrics.daysToComplete ? `${metrics.daysToComplete}d` : '∞'}
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                fontSize={12}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'cumulativeSpend' ? 'Actual Spend' :
                  name === 'budgetLine' ? 'Budget Line' : name
                ]}
                labelStyle={{ fontSize: '12px' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cumulativeSpend" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Actual Spend"
                dot={{ r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="budgetLine" 
                stroke="#22c55e" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Budget Line"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Variance Indicator */}
        {metrics && (
          <div className="mt-4 flex items-center justify-center">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              metrics.isOverBudget 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {metrics.isOverBudget ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              <span>
                {metrics.isOverBudget ? '+' : ''}{formatCurrency(Math.abs(metrics.burnRateVariance))} vs budget
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
