import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, FileText, Gavel, Building } from 'lucide-react';
import { CRMMetrics } from '@/hooks/useCRMMetrics';

interface PipelineVisualizationProps {
  pipelineStats: CRMMetrics['pipelineStats'];
  onStageSelect?: (stage: string) => void;
  selectedStage?: string | null;
}

export const PipelineVisualization = ({ 
  pipelineStats, 
  onStageSelect,
  selectedStage 
}: PipelineVisualizationProps) => {
  const stages = [
    {
      key: 'leads',
      title: 'Leads',
      icon: Users,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      iconColor: 'text-blue-600',
      data: pipelineStats.leads
    },
    {
      key: 'estimates',
      title: 'Estimates',
      icon: FileText,
      color: 'bg-amber-50 border-amber-200 text-amber-800',
      iconColor: 'text-amber-600',
      data: pipelineStats.estimates
    },
    {
      key: 'bids',
      title: 'Bids',
      icon: Gavel,
      color: 'bg-purple-50 border-purple-200 text-purple-800',
      iconColor: 'text-purple-600',
      data: pipelineStats.bids
    },
    {
      key: 'projects',
      title: 'Projects',
      icon: Building,
      color: 'bg-green-50 border-green-200 text-green-800',
      iconColor: 'text-green-600',
      data: pipelineStats.projects
    }
  ];

  const totalValue = Object.values(pipelineStats).reduce((sum, stage) => sum + stage.value, 0);

  return (
    <div className="space-y-6">
      {/* Pipeline Flow */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {stages.map((stage, index) => (
          <div key={stage.key} className="flex items-center gap-4 w-full lg:w-auto">
            {/* Stage Card */}
            <Card 
              className={`flex-1 lg:w-48 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedStage === stage.key ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onStageSelect?.(stage.key)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-muted/10`}>
                    <stage.icon size={20} className={stage.iconColor} />
                  </div>
                  <h3 className="font-semibold text-foreground">{stage.title}</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Count:</span>
                    <Badge variant="outline" className={stage.color}>
                      {stage.data.count}
                    </Badge>
                  </div>
                  
                  {stage.data.value > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Value:</span>
                      <span className="text-sm font-medium text-foreground">
                        ${stage.data.value.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {stage.data.value > 0 && totalValue > 0 && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${stage.iconColor.replace('text-', 'bg-')}`}
                        style={{ width: `${(stage.data.value / totalValue) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Arrow between stages */}
            {index < stages.length - 1 && (
              <div className="hidden lg:flex items-center justify-center w-8">
                <ArrowRight size={20} className="text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pipeline Summary */}
      <Card className="bg-muted/5">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Pipeline</p>
              <p className="text-lg font-semibold text-foreground">
                ${totalValue.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Opportunities</p>
              <p className="text-lg font-semibold text-foreground">
                {pipelineStats.estimates.count + pipelineStats.bids.count}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conversion Pipeline</p>
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
                <span>{pipelineStats.leads.count}</span>
                <ArrowRight size={12} />
                <span>{pipelineStats.estimates.count}</span>
                <ArrowRight size={12} />
                <span>{pipelineStats.bids.count}</span>
                <ArrowRight size={12} />
                <span>{pipelineStats.projects.count}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};