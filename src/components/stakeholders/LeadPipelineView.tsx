import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StakeholderCard } from './StakeholderCard';
import type { Stakeholder, LeadStatus } from '@/hooks/useStakeholders';

interface LeadPipelineViewProps {
  stakeholders: Stakeholder[];
  loading: boolean;
}

export const LeadPipelineView = ({ stakeholders, loading }: LeadPipelineViewProps) => {
  const pipelineStages = useMemo(() => {
    const stages: { status: LeadStatus; label: string; color: string }[] = [
      { status: 'new', label: 'New Leads', color: 'bg-slate-100' },
      { status: 'contacted', label: 'Contacted', color: 'bg-blue-100' },
      { status: 'qualified', label: 'Qualified', color: 'bg-purple-100' },
      { status: 'proposal_sent', label: 'Proposal Sent', color: 'bg-yellow-100' },
      { status: 'negotiating', label: 'Negotiating', color: 'bg-orange-100' },
      { status: 'won', label: 'Won', color: 'bg-green-100' },
      { status: 'lost', label: 'Lost', color: 'bg-red-100' }
    ];

    return stages.map(stage => ({
      ...stage,
      stakeholders: stakeholders.filter(s => (s.lead_status || 'new') === stage.status),
      totalValue: stakeholders
        .filter(s => (s.lead_status || 'new') === stage.status)
        .reduce((sum, s) => sum + (s.customer_lifetime_value || 0), 0)
    }));
  }, [stakeholders]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-20 bg-slate-200 rounded-lg animate-pulse" />
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="h-32 bg-slate-200 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pipeline Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {pipelineStages.map((stage) => (
          <Card key={stage.status} className={`${stage.color} border-0`}>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {stage.stakeholders.length}
                </div>
                <div className="text-sm font-medium text-slate-700">
                  {stage.label}
                </div>
                {stage.totalValue > 0 && (
                  <div className="text-xs text-slate-600 mt-1">
                    ${stage.totalValue.toLocaleString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
        {pipelineStages.map((stage) => (
          <div key={stage.status} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{stage.label}</h3>
              <Badge variant="outline" className="text-xs">
                {stage.stakeholders.length}
              </Badge>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {stage.stakeholders.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No leads in this stage
                </div>
              ) : (
                stage.stakeholders.map((stakeholder) => (
                  <StakeholderCard key={stakeholder.id} stakeholder={stakeholder} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};