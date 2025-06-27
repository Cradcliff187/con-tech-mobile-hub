
import React, { useState, useEffect } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useResourceAllocations } from '@/hooks/useResourceAllocations';
import { useMaintenanceSchedules } from '@/hooks/useMaintenanceSchedules';
import { subscriptionManager } from '@/services/SubscriptionManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface HookStatus {
  name: string;
  loading: boolean;
  dataCount: number;
  error?: string;
  status: 'healthy' | 'loading' | 'error' | 'inactive';
}

interface SubscriptionStats {
  totalChannels: number;
  activeSubscriptions: number;
  erroredSubscriptions: number;
  totalCallbacks: number;
  uptimeMs: number;
}

const SubscriptionTestContent: React.FC = () => {
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();
  const { allocations, loading: allocationsLoading } = useResourceAllocations();
  const { schedules, loading: schedulesLoading } = useMaintenanceSchedules();
  
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats>({
    totalChannels: 0,
    activeSubscriptions: 0,
    erroredSubscriptions: 0,
    totalCallbacks: 0,
    uptimeMs: 0
  });

  const [subscriptionInfo, setSubscriptionInfo] = useState<Record<string, any>>({});

  // Update subscription statistics
  useEffect(() => {
    const updateStats = () => {
      const stats = subscriptionManager.getStats();
      const info = subscriptionManager.getSubscriptionInfo();
      setSubscriptionStats(stats);
      setSubscriptionInfo(info);
    };

    // Update immediately
    updateStats();

    // Update every 2 seconds
    const interval = setInterval(updateStats, 2000);

    return () => clearInterval(interval);
  }, []);

  const getHookStatuses = (): HookStatus[] => [
    {
      name: 'Projects',
      loading: projectsLoading,
      dataCount: projects?.length || 0,
      status: projectsLoading ? 'loading' : 'healthy'
    },
    {
      name: 'Tasks',
      loading: tasksLoading,
      dataCount: tasks?.length || 0,
      status: tasksLoading ? 'loading' : 'healthy'
    },
    {
      name: 'Resource Allocations',
      loading: allocationsLoading,
      dataCount: allocations?.length || 0,
      status: allocationsLoading ? 'loading' : 'healthy'
    },
    {
      name: 'Maintenance Schedules',
      loading: schedulesLoading,
      dataCount: schedules?.length || 0,
      status: schedulesLoading ? 'loading' : 'healthy'
    }
  ];

  const hookStatuses = getHookStatuses();

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hook Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hookStatuses.map((hook) => (
          <Card key={hook.name} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{hook.name}</CardTitle>
                <Badge 
                  variant={hook.status === 'healthy' ? 'default' : hook.status === 'loading' ? 'secondary' : 'destructive'}
                  aria-label={`${hook.name} status: ${hook.status}`}
                >
                  {hook.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Records:</span>
                  <span className="font-medium">{hook.dataCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Loading:</span>
                  <span className={hook.loading ? 'text-yellow-600' : 'text-green-600'}>
                    {hook.loading ? 'Yes' : 'No'}
                  </span>
                </div>
                {hook.error && (
                  <div className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded">
                    {hook.error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Subscription Manager Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>🔄 Centralized Subscription Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{subscriptionStats.totalChannels}</div>
              <div className="text-xs text-muted-foreground">Total Channels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{subscriptionStats.activeSubscriptions}</div>
              <div className="text-xs text-muted-foreground">Active Subs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{subscriptionStats.erroredSubscriptions}</div>
              <div className="text-xs text-muted-foreground">Errored Subs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{subscriptionStats.totalCallbacks}</div>
              <div className="text-xs text-muted-foreground">Callbacks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatUptime(subscriptionStats.uptimeMs)}</div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Subscription Information */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Subscription Details</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(subscriptionInfo).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(subscriptionInfo).map(([tableName, info]: [string, any]) => (
                <div key={tableName} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{tableName}</h4>
                    <Badge variant={info.state === 'SUBSCRIBED' ? 'default' : info.state === 'ERROR' ? 'destructive' : 'secondary'}>
                      {info.state}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Callbacks:</span>
                      <span className="ml-2 font-medium">{info.callbackCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Retries:</span>
                      <span className="ml-2 font-medium">{info.retryCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Uptime:</span>
                      <span className="ml-2 font-medium">{formatUptime(info.uptimeMs)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">User:</span>
                      <span className="ml-2 font-medium">{info.userId ? info.userId.slice(-8) : 'N/A'}</span>
                    </div>
                  </div>
                  {info.lastError && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                      Error: {info.lastError}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No active subscriptions</p>
          )}
        </CardContent>
      </Card>

      {/* Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Health Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Hooks Active:</span>
              <Badge variant="outline">{hookStatuses.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Healthy Subscriptions:</span>
              <Badge variant="default">
                {hookStatuses.filter(h => h.status === 'healthy').length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Loading Subscriptions:</span>
              <Badge variant="secondary">
                {hookStatuses.filter(h => h.status === 'loading').length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Records:</span>
              <Badge variant="outline">
                {hookStatuses.reduce((sum, h) => sum + h.dataCount, 0)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Manager Status:</span>
              <Badge variant={subscriptionStats.activeSubscriptions > 0 ? 'default' : 'secondary'}>
                {subscriptionStats.activeSubscriptions > 0 ? 'Active' : 'Idle'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SubscriptionTest: React.FC = () => {
  const [isActive, setIsActive] = useState(true);
  const [mountCount, setMountCount] = useState(0);

  const toggleComponent = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setMountCount(prev => prev + 1);
    }
  };

  const handleForceCleanup = async () => {
    await subscriptionManager.cleanup();
    console.log('Forced cleanup completed');
  };

  useEffect(() => {
    console.log('SubscriptionTest mounted, count:', mountCount);
    return () => {
      console.log('SubscriptionTest unmounted');
    };
  }, [mountCount]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Subscription Test Dashboard</h1>
        <p className="text-muted-foreground mb-4">
          🚧 <strong>Centralized Subscription Manager</strong> - Testing the new SubscriptionManager service with all hooks. 
          Remove after testing is complete.
        </p>
        
        <div className="flex items-center gap-4">
          <Button 
            onClick={toggleComponent}
            variant={isActive ? "destructive" : "default"}
            size="sm"
          >
            {isActive ? 'Unmount Hooks' : 'Mount Hooks'}
          </Button>
          <Button 
            onClick={handleForceCleanup}
            variant="outline"
            size="sm"
          >
            Force Cleanup
          </Button>
          <div className="text-sm text-muted-foreground">
            Mount cycles: <Badge variant="outline">{mountCount}</Badge>
          </div>
        </div>
        
        <Separator className="mt-4" />
      </div>

      {isActive ? (
        <SubscriptionTestContent />
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Hooks are unmounted. Click "Mount Hooks" to test subscriptions.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Rapid mounting/unmounting will test the centralized SubscriptionManager's robustness.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionTest;
