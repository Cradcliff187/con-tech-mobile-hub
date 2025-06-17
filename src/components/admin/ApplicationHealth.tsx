
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { 
  Activity, 
  Database, 
  Shield, 
  FileText, 
  Mail, 
  Phone, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  Download,
  Clock
} from 'lucide-react';
import { performHealthChecks, exportHealthReport, HealthCheckResult } from '@/utils/healthChecks';

interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical';
  lastCheck: Date | null;
  uptime: string;
  results: HealthCheckResult[];
  checking: boolean;
}

export const ApplicationHealth = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    overall: 'healthy',
    lastCheck: null,
    uptime: '0h 0m',
    results: [],
    checking: false
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Memoize the async operation options to prevent recreations
  const healthCheckOptions = useMemo(() => ({
    successMessage: 'Health check completed successfully',
    errorMessage: 'Failed to complete health check'
  }), []);

  const exportOptions = useMemo(() => ({
    successMessage: 'Health report exported successfully',
    errorMessage: 'Failed to export health report'
  }), []);

  const { execute: runHealthCheck, loading: healthCheckLoading } = useAsyncOperation(healthCheckOptions);
  const { execute: exportReport, loading: exportLoading } = useAsyncOperation(exportOptions);

  // Calculate uptime without side effects
  const calculateUptime = useCallback(() => {
    const startTime = localStorage.getItem('app_start_time');
    if (!startTime) {
      return '0h 0m';
    }

    const elapsed = Date.now() - parseInt(startTime);
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }, []);

  // Initialize app start time only once
  useEffect(() => {
    const startTime = localStorage.getItem('app_start_time');
    if (!startTime) {
      localStorage.setItem('app_start_time', Date.now().toString());
    }
  }, []);

  // Run health checks function
  const handleHealthCheck = useCallback(async () => {
    if (systemStatus.checking) {
      console.log('Health check already in progress, skipping...');
      return;
    }

    console.log('Starting health check...');
    await runHealthCheck(async () => {
      setSystemStatus(prev => ({ ...prev, checking: true }));
      
      try {
        const results = await performHealthChecks();
        const hasErrors = results.some(r => r.status === 'error');
        const hasWarnings = results.some(r => r.status === 'warning');
        
        let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (hasErrors) overall = 'critical';
        else if (hasWarnings) overall = 'warning';

        setSystemStatus({
          overall,
          lastCheck: new Date(),
          uptime: calculateUptime(),
          results,
          checking: false
        });
        
        console.log('Health check completed successfully');
      } catch (error) {
        console.error('Health check failed:', error);
        setSystemStatus(prev => ({ ...prev, checking: false }));
        throw error;
      }
    });
  }, [runHealthCheck, calculateUptime, systemStatus.checking]);

  // Update uptime every minute
  useEffect(() => {
    const uptimeInterval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        uptime: calculateUptime()
      }));
    }, 60000);

    return () => clearInterval(uptimeInterval);
  }, [calculateUptime]);

  // Manual export handler
  const handleExportReport = useCallback(async () => {
    await exportReport(async () => {
      await exportHealthReport(systemStatus);
    });
  }, [exportReport, systemStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getOverallStatusBadge = () => {
    switch (systemStatus.overall) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">All Systems Operational</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Issues Detected</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical Issues</Badge>;
    }
  };

  const successCount = systemStatus.results.filter(r => r.status === 'success').length;
  const totalCount = systemStatus.results.length;
  const healthPercentage = totalCount > 0 ? (successCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-slate-600" />
          <h2 className="text-2xl font-bold text-slate-800">Application Health</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleHealthCheck}
            disabled={healthCheckLoading || systemStatus.checking}
            className="flex items-center gap-2"
          >
            {healthCheckLoading || systemStatus.checking ? (
              <LoadingSpinner size="sm" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Run Health Check
          </Button>
          <Button
            variant="outline"
            onClick={handleExportReport}
            disabled={exportLoading || !systemStatus.lastCheck}
            className="flex items-center gap-2"
          >
            {exportLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export Report
          </Button>
        </div>
      </div>

      {/* Overall Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>System Overview</span>
            {getOverallStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">{healthPercentage.toFixed(0)}%</div>
              <div className="text-sm text-slate-600">System Health</div>
              <Progress value={healthPercentage} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">{systemStatus.uptime}</div>
              <div className="text-sm text-slate-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                {systemStatus.lastCheck ? (
                  <span>Last check: {systemStatus.lastCheck.toLocaleTimeString()}</span>
                ) : (
                  <span>No checks run yet</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Health Results */}
      <Card>
        <CardHeader>
          <CardTitle>System Components</CardTitle>
        </CardHeader>
        <CardContent>
          {systemStatus.results.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No health check results available. Run a health check to see component status.
            </div>
          ) : (
            <div className="space-y-4">
              {systemStatus.results.map((result, index) => (
                <div key={index}>
                  <div className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <h4 className="font-medium">{result.name}</h4>
                          <p className="text-sm opacity-75">{result.message}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {result.responseTime}ms
                        </div>
                        <div className="text-xs opacity-75">
                          Response Time
                        </div>
                      </div>
                    </div>
                    {result.details && (
                      <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                        <p className="text-sm opacity-75">{result.details}</p>
                      </div>
                    )}
                  </div>
                  {index < systemStatus.results.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {systemStatus.overall !== 'healthy' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemStatus.results
                .filter(r => r.status !== 'success')
                .map((result, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">{result.name}</div>
                      <div className="text-sm text-slate-600">
                        {result.recommendation || 'Check logs and try refreshing the page'}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
