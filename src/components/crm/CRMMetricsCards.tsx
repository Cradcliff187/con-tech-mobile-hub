import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CRMMetrics } from '@/hooks/useCRMMetrics';
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, Award } from 'lucide-react';

interface CRMMetricsCardsProps {
  metrics: CRMMetrics;
}

export const CRMMetricsCards = ({ metrics }: CRMMetricsCardsProps) => {
  // Calculate additional derived metrics
  const estimateToProjectConversion = metrics.pipelineStats.estimates.count > 0 
    ? (metrics.pipelineStats.projects.count / metrics.pipelineStats.estimates.count) * 100 
    : 0;

  const bidWinRate = metrics.pipelineStats.bids.count > 0 
    ? (metrics.pipelineStats.projects.count / metrics.pipelineStats.bids.count) * 100 
    : 0;

  const averageDealSize = metrics.pipelineStats.projects.count > 0
    ? metrics.pipelineStats.projects.value / metrics.pipelineStats.projects.count
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Pipeline Health */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target size={18} />
            Pipeline Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Lead Conversion</span>
              <span className="text-sm font-medium">{metrics.conversionRate.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.conversionRate} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Estimate Conversion</span>
              <span className="text-sm font-medium">{estimateToProjectConversion.toFixed(1)}%</span>
            </div>
            <Progress value={estimateToProjectConversion} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Bid Win Rate</span>
              <span className="text-sm font-medium">{bidWinRate.toFixed(1)}%</span>
            </div>
            <Progress value={bidWinRate} className="h-2" />
            {bidWinRate > 0 && (
              <Badge variant={bidWinRate > 30 ? "default" : "secondary"} className="text-xs">
                {bidWinRate > 30 ? "Strong" : "Needs Improvement"}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign size={18} />
            Revenue Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Monthly Revenue</span>
            <div className="text-right">
              <p className="font-semibold text-foreground">
                ${metrics.monthlyRevenue.toLocaleString()}
              </p>
              <Badge variant="outline" className="text-xs mt-1">
                This Month
              </Badge>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Average Deal Size</span>
            <div className="text-right">
              <p className="font-semibold text-foreground">
                ${averageDealSize.toLocaleString()}
              </p>
              {averageDealSize > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  {averageDealSize > 50000 ? (
                    <TrendingUp size={12} className="text-green-600" />
                  ) : (
                    <TrendingDown size={12} className="text-amber-600" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {averageDealSize > 50000 ? "Above average" : "Below target"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Pipeline Velocity</span>
            <div className="text-right">
              <p className="font-semibold text-foreground">
                {metrics.pipelineStats.estimates.count + metrics.pipelineStats.bids.count} deals
              </p>
              <span className="text-xs text-muted-foreground">In progress</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar size={18} />
            Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Follow-ups Due</span>
            <div className="text-right">
              <p className="font-semibold text-foreground">{metrics.upcomingFollowUps}</p>
              {metrics.upcomingFollowUps > 0 && (
                <Badge variant="destructive" className="text-xs mt-1">
                  Action Required
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Recent Activities</span>
            <p className="font-semibold text-foreground">{metrics.recentActivity.length}</p>
          </div>

          <div className="pt-2 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {metrics.recentActivity.filter(a => a.type === 'interaction').length}
                </p>
                <p className="text-xs text-muted-foreground">Recent Calls</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {metrics.recentActivity.filter(a => a.type === 'estimate').length}
                </p>
                <p className="text-xs text-muted-foreground">Recent Estimates</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Score */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award size={18} />
            CRM Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calculate a simple performance score based on multiple factors */}
          {(() => {
            const factors = [
              { weight: 0.3, score: Math.min(metrics.conversionRate * 2, 100) }, // Conversion rate
              { weight: 0.3, score: Math.min(bidWinRate * 2, 100) }, // Bid win rate
              { weight: 0.2, score: Math.min((metrics.activeLeads / 10) * 100, 100) }, // Lead volume
              { weight: 0.2, score: metrics.upcomingFollowUps === 0 ? 100 : Math.max(100 - (metrics.upcomingFollowUps * 10), 0) } // Follow-up compliance
            ];
            
            const overallScore = factors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0);
            const scoreColor = overallScore >= 80 ? 'text-green-600' : overallScore >= 60 ? 'text-amber-600' : 'text-red-600';
            const scoreBadge = overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Work';
            
            return (
              <>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${scoreColor}`}>
                    {overallScore.toFixed(0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Performance Score</p>
                  <Badge 
                    variant={overallScore >= 80 ? "default" : overallScore >= 60 ? "secondary" : "destructive"}
                    className="mt-2"
                  >
                    {scoreBadge}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <Progress value={overallScore} className="h-3" />
                  <p className="text-xs text-muted-foreground text-center">
                    Based on conversion rates, activity levels, and follow-up compliance
                  </p>
                </div>
              </>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
};