
import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCostRollup } from '@/hooks/useCostRollup';
import { useProjects } from '@/hooks/useProjects';

interface CostRollupIndicatorProps {
  projectId: string;
}

export const CostRollupIndicator = ({ projectId }: CostRollupIndicatorProps) => {
  const { updateProjectCosts, triggerCostSnapshot, loading } = useCostRollup();
  const { projects, refetch } = useProjects();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const currentProject = projects.find(p => p.id === projectId);

  const handleManualUpdate = async () => {
    const result = await updateProjectCosts(projectId);
    if (result.success) {
      setLastUpdate(new Date());
      refetch();
    }
  };

  const handleCreateSnapshot = async () => {
    const result = await triggerCostSnapshot();
    if (result.success) {
      refetch();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getVarianceColor = (budget: number, spent: number) => {
    if (!budget || budget === 0) return 'text-slate-600';
    const percentage = (spent / budget) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  const getVarianceIcon = (budget: number, spent: number) => {
    if (!budget || budget === 0) return null;
    const percentage = (spent / budget) * 100;
    return percentage >= 100 ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
  };

  if (!currentProject) {
    return null;
  }

  const budgetUtilization = currentProject.budget 
    ? ((currentProject.spent || 0) / currentProject.budget) * 100 
    : 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <DollarSign size={20} className="text-green-600" />
            Cost Rollup Status
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualUpdate}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw size={16} className="animate-spin mr-2" />
              ) : (
                <RefreshCw size={16} className="mr-2" />
              )}
              Update Costs
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCreateSnapshot}
              disabled={loading}
            >
              Create Snapshot
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-blue-800">Total Budget</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(currentProject.budget || 0)}
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-orange-800">Labor Costs</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(currentProject.spent || 0)}
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-green-800">Remaining</span>
              {getVarianceIcon(currentProject.budget || 0, currentProject.spent || 0)}
            </div>
            <div className={`text-2xl font-bold ${getVarianceColor(currentProject.budget || 0, currentProject.spent || 0)}`}>
              {formatCurrency((currentProject.budget || 0) - (currentProject.spent || 0))}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-purple-800">Utilization</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {budgetUtilization.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={budgetUtilization >= 90 ? 'destructive' : budgetUtilization >= 75 ? 'secondary' : 'default'}>
              {budgetUtilization >= 90 ? 'High Risk' : budgetUtilization >= 75 ? 'Caution' : 'On Track'}
            </Badge>
            {lastUpdate && (
              <span className="text-sm text-slate-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="text-sm text-slate-600">
            Costs automatically update when assignments change
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
