import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PipelineVisualization } from './PipelineVisualization';
import { CRMActivityFeed } from './CRMActivityFeed';
import { useCRMMetrics } from '@/hooks/useCRMMetrics';
import { TrendingUp, BarChart3, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

export const CRMPipelineView = () => {
  const { metrics, loading, refetch } = useCRMMetrics();
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

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
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales Pipeline</h1>
          <p className="text-muted-foreground">
            Visualize and manage your sales pipeline from leads to closed deals
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch}>
            <TrendingUp size={16} className="mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Pipeline Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  ${metrics.pipelineValue.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Pipeline Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {metrics.conversionRate.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {metrics.pipelineStats.estimates.count + metrics.pipelineStats.bids.count}
                </p>
                <p className="text-sm text-muted-foreground">Active Opportunities</p>
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
            Pipeline Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PipelineVisualization 
            pipelineStats={metrics.pipelineStats}
            onStageSelect={setSelectedStage}
            selectedStage={selectedStage}
          />
        </CardContent>
      </Card>

      {/* Pipeline Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Average Deal Size</p>
                    <p className="text-xl font-bold text-foreground">
                      ${metrics.pipelineStats.projects.count > 0 
                        ? (metrics.pipelineStats.projects.value / metrics.pipelineStats.projects.count).toLocaleString()
                        : '0'
                      }
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Sales Velocity</p>
                    <p className="text-xl font-bold text-foreground">
                      {metrics.activeLeads > 0 ? `${(metrics.pipelineStats.projects.count / metrics.activeLeads * 100).toFixed(1)}%` : '0%'}
                    </p>
                  </div>
                </div>
                
                {selectedStage && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">
                      {selectedStage.charAt(0).toUpperCase() + selectedStage.slice(1)} Stage Details
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Click on pipeline stages to view detailed analysis and recommended actions.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <CRMActivityFeed activities={metrics.recentActivity} />
        </div>
      </div>
    </div>
  );
};