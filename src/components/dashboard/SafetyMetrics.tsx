import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldAlert, ShieldX, HardHat, ClipboardCheck } from 'lucide-react';
import { MetricCardSkeleton } from './skeletons/MetricCardSkeleton';
import { ErrorFallback } from '@/components/common/ErrorFallback';

interface SafetyData {
  daysWithoutIncident: number;
  safetyComplianceRate: number;
  toolboxTalksCompleted: number;
  toolboxTalksTotal: number;
  ppeComplianceRate: number;
  lastIncidentDate?: Date;
  lastSafetyAudit?: Date;
}

// Mock data - in a real app, this would come from props or a hook
const mockSafetyData: SafetyData = {
  daysWithoutIncident: 47,
  safetyComplianceRate: 94,
  toolboxTalksCompleted: 8,
  toolboxTalksTotal: 10,
  ppeComplianceRate: 89,
  lastIncidentDate: new Date('2024-05-06'),
  lastSafetyAudit: new Date('2024-06-15')
};

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

export const SafetyMetrics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Simulate loading state (in real app, this would come from a hook)
  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

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

  if (error) {
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
            description={error}
            resetError={() => setError(null)}
            className="max-w-none"
          />
        </CardContent>
      </Card>
    );
  }

  const data = mockSafetyData;

  // Calculate derived values
  const toolboxCompletionRate = Math.round((data.toolboxTalksCompleted / data.toolboxTalksTotal) * 100);

  // Status calculations
  const incidentStatus = getStatusColor(data.daysWithoutIncident, { good: 30, warning: 15 });
  const complianceStatus = getStatusColor(data.safetyComplianceRate, { good: 90, warning: 70 });
  const toolboxStatus = getStatusColor(toolboxCompletionRate, { good: 80, warning: 60 });
  const ppeStatus = getStatusColor(data.ppeComplianceRate, { good: 95, warning: 85 });

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
          <div className={`p-4 rounded-lg border ${incidentStatus.bg} ${incidentStatus.border}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Days Without Incident</h3>
              <incidentStatus.icon className={`h-4 w-4 ${incidentStatus.text}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${incidentStatus.text}`}>
                {data.daysWithoutIncident}
              </span>
              <span className="text-sm text-slate-500">days</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Last incident: {data.lastIncidentDate?.toLocaleDateString() || 'None on record'}
            </p>
          </div>

          {/* Safety Compliance Rate */}
          <div className={`p-4 rounded-lg border ${complianceStatus.bg} ${complianceStatus.border}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Safety Compliance</h3>
              <complianceStatus.icon className={`h-4 w-4 ${complianceStatus.text}`} />
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className={`text-2xl font-bold ${complianceStatus.text}`}>
                {data.safetyComplianceRate}%
              </span>
            </div>
            <Progress 
              value={data.safetyComplianceRate} 
              className="h-2 mb-1"
            />
            <p className="text-xs text-slate-500">
              Last audit: {data.lastSafetyAudit?.toLocaleDateString() || 'Pending'}
            </p>
          </div>

          {/* Toolbox Talks Completion */}
          <div className={`p-4 rounded-lg border ${toolboxStatus.bg} ${toolboxStatus.border}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Toolbox Talks</h3>
              <ClipboardCheck className={`h-4 w-4 ${toolboxStatus.text}`} />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xl font-bold ${toolboxStatus.text}`}>
                {data.toolboxTalksCompleted}/{data.toolboxTalksTotal}
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

          {/* PPE Compliance */}
          <div className={`p-4 rounded-lg border ${ppeStatus.bg} ${ppeStatus.border}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">PPE Compliance</h3>
              <ppeStatus.icon className={`h-4 w-4 ${ppeStatus.text}`} />
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className={`text-2xl font-bold ${ppeStatus.text}`}>
                {data.ppeComplianceRate}%
              </span>
            </div>
            <Progress 
              value={data.ppeComplianceRate} 
              className="h-2 mb-1"
            />
            <p className="text-xs text-slate-500">
              {data.ppeComplianceRate >= 95 
                ? 'Excellent compliance' 
                : data.ppeComplianceRate >= 85 
                  ? 'Needs improvement' 
                  : 'Action required'
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
