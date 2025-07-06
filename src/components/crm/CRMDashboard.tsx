import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PipelineVisualization } from './PipelineVisualization';
import { CRMMetricsCards } from './CRMMetricsCards';
import { CRMActivityFeed } from './CRMActivityFeed';
import { CRMQuickActions } from './CRMQuickActions';
import { useCRMMetrics } from '@/hooks/useCRMMetrics';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * CRMDashboard - Main CRM dashboard component
 * 
 * Layout Structure:
 * 1. Dashboard Header with key metrics
 * 2. Pipeline Visualization showing lead → estimate → bid → project flow
 * 3. Grid layout with metrics cards and activity feed
 * 4. Quick actions panel for common CRM tasks
 * 
 * Responsive Design:
 * - Desktop (lg+): 4-column grid (3 main + 1 sidebar)
 * - Tablet (md): 2-column grid
 * - Mobile (sm): 1-column grid
 */
export const CRMDashboard = () => {
  const { metrics, loading, refetch } = useCRMMetrics();
  const [selectedPipelineStage, setSelectedPipelineStage] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        
        <Skeleton className="h-64" />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Skeleton className="h-96" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CRM Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your sales pipeline and customer relationships
          </p>
        </div>
        <Button onClick={refetch} variant="outline">
          <TrendingUp size={16} className="mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pipeline Value</p>
                <p className="text-2xl font-bold text-foreground">
                  ${metrics.pipelineValue.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Leads</p>
                <p className="text-2xl font-bold text-foreground">{metrics.activeLeads}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {metrics.conversionRate.toFixed(1)}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-secondary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Follow-ups Due</p>
                <p className="text-2xl font-bold text-foreground">{metrics.upcomingFollowUps}</p>
                {metrics.upcomingFollowUps > 0 && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    Action Required
                  </Badge>
                )}
              </div>
              <div className="h-12 w-12 rounded-lg bg-muted/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={20} />
            Sales Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PipelineVisualization 
            pipelineStats={metrics.pipelineStats}
            onStageSelect={setSelectedPipelineStage}
            selectedStage={selectedPipelineStage}
          />
        </CardContent>
      </Card>

      {/* Dashboard Grid - Metrics + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area (3 columns) */}
        <div className="lg:col-span-3 space-y-6">
          {/* CRM Metrics Cards */}
          <CRMMetricsCards metrics={metrics} />
          
          {/* Quick Actions Panel */}
          <CRMQuickActions />
        </div>
        
        {/* Sidebar Area (1 column) */}
        <div className="lg:col-span-1">
          <CRMActivityFeed activities={metrics.recentActivity} />
        </div>
      </div>
    </div>
  );
};