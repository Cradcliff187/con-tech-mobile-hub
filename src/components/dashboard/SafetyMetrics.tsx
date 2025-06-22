
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, ShieldX, HardHat, ClipboardCheck, Plus, AlertCircle } from 'lucide-react';
import { MetricCardSkeleton } from './skeletons/MetricCardSkeleton';
import { ErrorFallback } from '@/components/common/ErrorFallback';
import { useSafetyMetrics } from '@/hooks/useSafetyMetrics';

const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
  if (value >= thresholds.good) {
    return {
      text: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: ShieldCheck
    };
  } else if (value >= thresholds.warning) {
    return {
      text: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: ShieldAlert
    };
  } else {
    return {
      text: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: ShieldX
    };
  }
};

const NoDataCard = ({ 
  title, 
  description, 
  actionLabel, 
  onAction 
}: { 
  title: string; 
  description: string; 
  actionLabel: string; 
  onAction?: () => void; 
}) => (
  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium text-slate-600">{title}</h3>
      <AlertCircle className="h-4 w-4 text-slate-400" />
    </div>
    <div className="text-center py-2">
      <span className="text-2xl font-bold text-slate-400">--</span>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
      {onAction && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAction}
          className="mt-2 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          {actionLabel}
        </Button>
      )}
    </div>
  </div>
);

export const SafetyMetrics = () => {
  const { metrics, loading, error } = useSafetyMetrics();

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <HardHat className="h-5 w-5 text-orange-600" />
            Safety Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <MetricCardSkeleton key={i} showProgress={i > 2} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !metrics) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <HardHat className="h-5 w-5 text-orange-600" />
            Safety Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorFallback 
            title="Safety Data Unavailable"
            description={error || "Failed to load safety metrics"}
            className="max-w-none"
          />
        </CardContent>
      </Card>
    );
  }

  // Calculate derived values
  const toolboxCompletionRate = metrics.toolboxTalksTotal > 0 
    ? Math.round((metrics.toolboxTalksCompleted / metrics.toolboxTalksTotal) * 100)
    : 0;

  // Status calculations (only when we have data)
  const incidentStatus = metrics.daysWithoutIncident !== null 
    ? getStatusColor(metrics.daysWithoutIncident, { good: 30, warning: 15 })
    : null;
  
  const complianceStatus = metrics.safetyComplianceRate !== null 
    ? getStatusColor(metrics.safetyComplianceRate, { good: 90, warning: 70 })
    : null;
  
  const toolboxStatus = metrics.hasToolboxData 
    ? getStatusColor(toolboxCompletionRate, { good: 80, warning: 60 })
    : null;
  
  const ppeStatus = metrics.ppeComplianceRate !== null 
    ? getStatusColor(metrics.ppeComplianceRate, { good: 95, warning: 85 })
    : null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <HardHat className="h-5 w-5 text-orange-600" />
          Safety Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Days Without Incident */}
          {!metrics.hasIncidentData ? (
            <NoDataCard
              title="Days Without Incident"
              description="No incident tracking data available"
              actionLabel="Start Tracking"
              onAction={() => console.log('Start incident tracking')}
            />
          ) : incidentStatus && (
            <div className={`p-4 rounded-lg border ${incidentStatus.bg} ${incidentStatus.border}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-600">Days Without Incident</h3>
                <incidentStatus.icon className={`h-4 w-4 ${incidentStatus.text}`} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${incidentStatus.text}`}>
                  {metrics.daysWithoutIncident}
                </span>
                <span className="text-sm text-slate-500">days</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Last incident: {metrics.lastIncidentDate?.toLocaleDateString() || 'None on record'}
              </p>
            </div>
          )}

          {/* Safety Compliance Rate */}
          {!metrics.hasComplianceData ? (
            <NoDataCard
              title="Safety Compliance"
              description="No compliance audits recorded"
              actionLabel="Schedule Audit"
              onAction={() => console.log('Schedule safety audit')}
            />
          ) : complianceStatus && (
            <div className={`p-4 rounded-lg border ${complianceStatus.bg} ${complianceStatus.border}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-600">Safety Compliance</h3>
                <complianceStatus.icon className={`h-4 w-4 ${complianceStatus.text}`} />
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-2xl font-bold ${complianceStatus.text}`}>
                  {metrics.safetyComplianceRate}%
                </span>
              </div>
              <Progress 
                value={metrics.safetyComplianceRate} 
                className="h-2 mb-1"
              />
              <p className="text-xs text-slate-500">
                Last audit: {metrics.lastSafetyAudit?.toLocaleDateString() || 'Pending'}
              </p>
            </div>
          )}

          {/* Toolbox Talks Completion */}
          {!metrics.hasToolboxData ? (
            <NoDataCard
              title="Toolbox Talks"
              description="No toolbox talks scheduled this month"
              actionLabel="Add Talks"
              onAction={() => console.log('Add toolbox talks')}
            />
          ) : toolboxStatus && (
            <div className={`p-4 rounded-lg border ${toolboxStatus.bg} ${toolboxStatus.border}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-600">Toolbox Talks</h3>
                <ClipboardCheck className={`h-4 w-4 ${toolboxStatus.text}`} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xl font-bold ${toolboxStatus.text}`}>
                  {metrics.toolboxTalksCompleted}/{metrics.toolboxTalksTotal}
                </span>
                <Badge 
                  variant={toolboxCompletionRate >= 80 ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {toolboxCompletionRate}%
                </Badge>
              </div>
              <Progress 
                value={toolboxCompletionRate} 
                className="h-2 mb-1"
              />
              <p className="text-xs text-slate-500">This month</p>
            </div>
          )}

          {/* PPE Compliance */}
          {!metrics.hasComplianceData ? (
            <NoDataCard
              title="PPE Compliance"
              description="No PPE compliance data recorded"
              actionLabel="Start Monitoring"
              onAction={() => console.log('Start PPE monitoring')}
            />
          ) : ppeStatus && (
            <div className={`p-4 rounded-lg border ${ppeStatus.bg} ${ppeStatus.border}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-600">PPE Compliance</h3>
                <ppeStatus.icon className={`h-4 w-4 ${ppeStatus.text}`} />
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-2xl font-bold ${ppeStatus.text}`}>
                  {metrics.ppeComplianceRate}%
                </span>
              </div>
              <Progress 
                value={metrics.ppeComplianceRate} 
                className="h-2 mb-1"
              />
              <p className="text-xs text-slate-500">
                {metrics.ppeComplianceRate >= 95 
                  ? 'Excellent compliance' 
                  : metrics.ppeComplianceRate >= 85 
                    ? 'Needs improvement' 
                    : 'Action required'
                }
              </p>
            </div>
          )}
        </div>

        {/* Help message when no data is available */}
        {!metrics.hasIncidentData && !metrics.hasComplianceData && !metrics.hasToolboxData && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <HardHat className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-1">
                  Start Safety Tracking
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  No safety data is being tracked yet. Start recording safety metrics to monitor your project's safety performance.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
                    Record Incident
                  </Button>
                  <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
                    Schedule Audit
                  </Button>
                  <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
                    Plan Toolbox Talks
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
