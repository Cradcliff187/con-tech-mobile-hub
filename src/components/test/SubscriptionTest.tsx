
import React, { useState, useEffect } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useResourceAllocations } from '@/hooks/useResourceAllocations';
import { useMaintenanceSchedules } from '@/hooks/useMaintenanceSchedules';
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

const SubscriptionTestContent: React.FC = () => {
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();
  const { allocations, loading: allocationsLoading } = useResourceAllocations();
  const { schedules, loading: schedulesLoading } = useMaintenanceSchedules();

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

  return (
    <div className="space-y-6">
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
          🚧 <strong>Temporary Test Component</strong> - Verifies all hooks work without subscription errors. 
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
              Rapid mounting/unmounting will expose subscription errors if they exist.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionTest;
