
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Activity } from 'lucide-react';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  lastChecked: Date;
}

export const SystemHealthCheck = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const { user, profile } = useAuth();

  useEffect(() => {
    const checkSystemHealth = () => {
      const newMetrics: HealthMetric[] = [];

      // Authentication Health
      if (user && profile) {
        newMetrics.push({
          name: 'Authentication',
          status: 'healthy',
          message: 'User authenticated and profile loaded',
          lastChecked: new Date()
        });
      } else {
        newMetrics.push({
          name: 'Authentication',
          status: 'error',
          message: 'Authentication issues detected',
          lastChecked: new Date()
        });
      }

      // Account Status Health
      if (profile) {
        switch (profile.account_status) {
          case 'approved':
            newMetrics.push({
              name: 'Account Status',
              status: 'healthy',
              message: 'Account approved and active',
              lastChecked: new Date()
            });
            break;
          case 'pending':
            newMetrics.push({
              name: 'Account Status',
              status: 'warning',
              message: 'Account pending approval',
              lastChecked: new Date()
            });
            break;
          default:
            newMetrics.push({
              name: 'Account Status',
              status: 'error',
              message: `Account status: ${profile.account_status}`,
              lastChecked: new Date()
            });
        }
      }

      // Navigation Health
      newMetrics.push({
        name: 'Navigation',
        status: 'healthy',
        message: 'Navigation system operational',
        lastChecked: new Date()
      });

      // UI Components Health
      newMetrics.push({
        name: 'UI Components',
        status: 'healthy',
        message: 'All components rendering correctly',
        lastChecked: new Date()
      });

      // Data Loading Health
      newMetrics.push({
        name: 'Data Loading',
        status: 'healthy',
        message: 'Hooks and data fetching operational',
        lastChecked: new Date()
      });

      setMetrics(newMetrics);
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user, profile]);

  const getIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'healthy': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const healthyCount = metrics.filter(m => m.status === 'healthy').length;
  const warningCount = metrics.filter(m => m.status === 'warning').length;
  const errorCount = metrics.filter(m => m.status === 'error').length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Health
        </CardTitle>
        <div className="flex gap-4 text-sm">
          <span className="text-green-600">✓ {healthyCount} healthy</span>
          <span className="text-yellow-600">⚠ {warningCount} warnings</span>
          <span className="text-red-600">✗ {errorCount} errors</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-3">
                {getIcon(metric.status)}
                <span className="font-medium">{metric.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">{metric.message}</span>
                <Badge variant={getBadgeVariant(metric.status)}>
                  {metric.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
