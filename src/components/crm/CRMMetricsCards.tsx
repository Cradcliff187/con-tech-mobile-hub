import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CRMMetrics } from '@/hooks/useCRMMetrics';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface CRMMetricsCardsProps {
  metrics: CRMMetrics;
}

/**
 * CRMMetricsCards - Advanced metrics and analytics cards for CRM dashboard
 * 
 * Features:
 * - Pipeline velocity and trends
 * - Average deal size calculations
 * - Activity tracking and engagement metrics
 * - Goal progress indicators
 * - Mobile responsive grid layout
 */
export const CRMMetricsCards = ({ metrics }: CRMMetricsCardsProps) => {
  // Calculate derived metrics
  const totalOpportunities = metrics.pipelineStats.estimates.count + metrics.pipelineStats.bids.count;
  const averageDealSize = totalOpportunities > 0 
    ? (metrics.pipelineStats.estimates.value + metrics.pipelineStats.bids.value) / totalOpportunities 
    : 0;

  const pipelineVelocity = metrics.activeLeads > 0 
    ? (metrics.pipelineStats.projects.count / metrics.activeLeads * 30) // Simplified: projects per month
    : 0;

  const activityScore = Math.min(100, metrics.recentActivity.length * 10); // Simple activity scoring

  // Use real goals from company settings
  const monthlyGoal = metrics.goals.revenue_target;
  const goalProgress = (metrics.monthlyRevenue / monthlyGoal) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Average Deal Size */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Average Deal Size
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            ${averageDealSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
            <span>Based on {totalOpportunities} opportunities</span>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Velocity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pipeline Velocity
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {pipelineVelocity.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground ml-1">deals/mo</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {pipelineVelocity > 1 ? (
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
            ) : (
              <ArrowDownRight className="mr-1 h-3 w-3 text-orange-500" />
            )}
            <span>Lead to project conversion</span>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Goal Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly Goal
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {goalProgress.toFixed(0)}%
          </div>
          <Progress value={goalProgress} className="mt-2 h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
            <span>${metrics.monthlyRevenue.toLocaleString()}</span>
            <span>${monthlyGoal.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Activity Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Activity Score
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {activityScore}
            <span className="text-sm font-normal text-muted-foreground ml-1">/100</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <Progress value={activityScore} className="flex-1 h-2" />
            <Badge 
              variant={activityScore >= 70 ? 'default' : activityScore >= 40 ? 'secondary' : 'outline'}
              className="ml-2 text-xs"
            >
              {activityScore >= 70 ? 'High' : activityScore >= 40 ? 'Medium' : 'Low'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on recent interactions
          </p>
        </CardContent>
      </Card>

      {/* Conversion Funnel Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Funnel Health
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Leads → Estimates</span>
              <span className="font-medium text-foreground">
                {metrics.activeLeads > 0 
                  ? ((metrics.pipelineStats.estimates.count / metrics.activeLeads) * 100).toFixed(0)
                  : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimates → Bids</span>
              <span className="font-medium text-foreground">
                {metrics.pipelineStats.estimates.count > 0 
                  ? ((metrics.pipelineStats.bids.count / metrics.pipelineStats.estimates.count) * 100).toFixed(0)
                  : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Bids → Projects</span>
              <span className="font-medium text-foreground">
                {metrics.pipelineStats.bids.count > 0 
                  ? ((metrics.pipelineStats.projects.count / metrics.pipelineStats.bids.count) * 100).toFixed(0)
                  : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pipeline Summary
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Value</span>
              <span className="font-medium text-foreground">
                ${metrics.pipelineValue.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Opportunities</span>
              <span className="font-medium text-foreground">{totalOpportunities}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Follow-ups Due</span>
              <div className="flex items-center gap-1">
                <span className="font-medium text-foreground">{metrics.upcomingFollowUps}</span>
                {metrics.upcomingFollowUps > 0 && (
                  <Badge variant="outline" className="h-4 px-1 text-xs">
                    !
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};