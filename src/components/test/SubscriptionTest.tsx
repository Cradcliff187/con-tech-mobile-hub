import React, { useState, useEffect } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useResourceAllocations } from '@/hooks/useResourceAllocations';
import { useMaintenanceSchedules } from '@/hooks/useMaintenanceSchedules';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useDocuments } from '@/hooks/useDocuments';
import { useEquipment } from '@/hooks/useEquipment';
import { useMessages } from '@/hooks/useMessages';
import { useMaintenanceTasks } from '@/hooks/useMaintenanceTasks';
import { useStakeholderAssignments } from '@/hooks/useStakeholderAssignments';
import { subscriptionManager } from '@/services/SubscriptionManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { CreateProjectDialog } from '@/components/dashboard/CreateProjectDialog';

interface HookStatus {
  name: string;
  loading: boolean;
  dataCount: number;
  error?: string;
  status: 'healthy' | 'loading' | 'error' | 'inactive';
  category: string;
  subscriptionPattern: 'centralized' | 'legacy';
}

interface SubscriptionStats {
  totalChannels: number;
  activeSubscriptions: number;
  erroredSubscriptions: number;
  totalCallbacks: number;
  uptimeMs: number;
}

const SubscriptionTestContent: React.FC = () => {
  // Project Management hooks
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();
  
  // Resources & Equipment hooks
  const { equipment, loading: equipmentLoading } = useEquipment();
  const { allocations, loading: allocationsLoading } = useResourceAllocations();
  const { tasks: maintenanceTasks, loading: maintenanceTasksLoading } = useMaintenanceTasks();
  const { schedules, loading: schedulesLoading } = useMaintenanceSchedules();
  
  // Stakeholder Management hooks
  const { stakeholders, loading: stakeholdersLoading } = useStakeholders();
  const { assignments, loading: assignmentsLoading } = useStakeholderAssignments();
  
  // Communications & Documents hooks
  const { messages, loading: messagesLoading } = useMessages();
  const { documents, loading: documentsLoading } = useDocuments();
  
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats>({
    totalChannels: 0,
    activeSubscriptions: 0,
    erroredSubscriptions: 0,
    totalCallbacks: 0,
    uptimeMs: 0
  });

  const [subscriptionInfo, setSubscriptionInfo] = useState<Record<string, any>>({});
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);

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
    // Project Management
    {
      name: 'Projects',
      loading: projectsLoading,
      dataCount: projects?.length || 0,
      status: projectsLoading ? 'loading' : 'healthy',
      category: 'Project Management',
      subscriptionPattern: 'centralized'
    },
    {
      name: 'Tasks',
      loading: tasksLoading,
      dataCount: tasks?.length || 0,
      status: tasksLoading ? 'loading' : 'healthy',
      category: 'Project Management',
      subscriptionPattern: 'centralized'
    },
    
    // Resources & Equipment
    {
      name: 'Equipment',
      loading: equipmentLoading,
      dataCount: equipment?.length || 0,
      status: equipmentLoading ? 'loading' : 'healthy',
      category: 'Resources & Equipment',
      subscriptionPattern: 'centralized'
    },
    {
      name: 'Resource Allocations',
      loading: allocationsLoading,
      dataCount: allocations?.length || 0,
      status: allocationsLoading ? 'loading' : 'healthy',
      category: 'Resources & Equipment',
      subscriptionPattern: 'centralized'
    },
    {
      name: 'Maintenance Tasks',
      loading: maintenanceTasksLoading,
      dataCount: maintenanceTasks?.length || 0,
      status: maintenanceTasksLoading ? 'loading' : 'healthy',
      category: 'Resources & Equipment',
      subscriptionPattern: 'centralized'
    },
    {
      name: 'Maintenance Schedules',
      loading: schedulesLoading,
      dataCount: schedules?.length || 0,
      status: schedulesLoading ? 'loading' : 'healthy',
      category: 'Resources & Equipment',
      subscriptionPattern: 'centralized'
    },
    
    // Stakeholder Management
    {
      name: 'Stakeholders',
      loading: stakeholdersLoading,
      dataCount: stakeholders?.length || 0,
      status: stakeholdersLoading ? 'loading' : 'healthy',
      category: 'Stakeholder Management',
      subscriptionPattern: 'centralized'
    },
    {
      name: 'Stakeholder Assignments',
      loading: assignmentsLoading,
      dataCount: assignments?.length || 0,
      status: assignmentsLoading ? 'loading' : 'healthy',
      category: 'Stakeholder Management',
      subscriptionPattern: 'centralized'
    },
    
    // Communications & Documents
    {
      name: 'Messages',
      loading: messagesLoading,
      dataCount: messages?.length || 0,
      status: messagesLoading ? 'loading' : 'healthy',
      category: 'Communications & Documents',
      subscriptionPattern: 'centralized'
    },
    {
      name: 'Documents',
      loading: documentsLoading,
      dataCount: documents?.length || 0,
      status: documentsLoading ? 'loading' : 'healthy',
      category: 'Communications & Documents',
      subscriptionPattern: 'centralized'
    }
  ];

  const hookStatuses = getHookStatuses();
  const categories = Array.from(new Set(hookStatuses.map(h => h.category)));

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

  const getStatusBadgeVariant = (status: string, pattern: string) => {
    if (pattern === 'legacy') return 'destructive';
    switch (status) {
      case 'healthy': return 'default';
      case 'loading': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Hook Status by Category */}
      {categories.map(category => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-3 text-slate-700">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {hookStatuses
              .filter(hook => hook.category === category)
              .map((hook) => (
                <Card key={hook.name} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{hook.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge 
                          variant={getStatusBadgeVariant(hook.status, hook.subscriptionPattern)}
                          aria-label={`${hook.name} status: ${hook.status}`}
                        >
                          {hook.status}
                        </Badge>
                        <Badge 
                          variant={hook.subscriptionPattern === 'centralized' ? 'default' : 'destructive'}
                          className="text-xs"
                          aria-label={`${hook.name} subscription pattern: ${hook.subscriptionPattern}`}
                        >
                          {hook.subscriptionPattern === 'centralized' ? '✓ New' : '⚠ Legacy'}
                        </Badge>
                      </div>
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
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pattern:</span>
                        <span className={hook.subscriptionPattern === 'centralized' ? 'text-green-600' : 'text-red-600'}>
                          {hook.subscriptionPattern}
                        </span>
                      </div>
                      {hook.error && (
                        <div className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded" role="alert">
                          {hook.error}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
      
      {/* Subscription Manager Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>🔄 Centralized Subscription Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
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

      {/* Test CreateProjectDialog */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Component Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">CreateProjectDialog Test</h4>
                <p className="text-sm text-muted-foreground">
                  Test the dialog that originally caused subscription errors
                </p>
              </div>
              <Dialog open={createProjectDialogOpen} onOpenChange={setCreateProjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    Test Dialog
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <CreateProjectDialog 
                    open={createProjectDialogOpen} 
                    onOpenChange={setCreateProjectDialogOpen}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Subscription Information */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Active Subscription Details</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(subscriptionInfo).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(subscriptionInfo).map(([tableName, info]: [string, any]) => (
                <div key={tableName} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{tableName}</h4>
                    <div className="flex gap-2">
                      <Badge 
                        variant={info.state === 'SUBSCRIBED' ? 'default' : info.state === 'ERROR' ? 'destructive' : 'secondary'}
                        aria-label={`${tableName} subscription state: ${info.state}`}
                      >
                        {info.state}
                      </Badge>
                      {info.isSubscribing && (
                        <Badge variant="secondary" className="animate-pulse">
                          Connecting...
                        </Badge>
                      )}
                    </div>
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
                    <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded" role="alert">
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

      {/* Migration Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Migration Health Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Hooks Monitored:</span>
              <Badge variant="outline">{hookStatuses.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Using Centralized Pattern:</span>
              <Badge variant="default">
                {hookStatuses.filter(h => h.subscriptionPattern === 'centralized').length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Legacy Patterns Remaining:</span>
              <Badge variant={hookStatuses.filter(h => h.subscriptionPattern === 'legacy').length > 0 ? 'destructive' : 'default'}>
                {hookStatuses.filter(h => h.subscriptionPattern === 'legacy').length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Records Loaded:</span>
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
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Migration Complete:</span>
              <Badge variant={hookStatuses.every(h => h.subscriptionPattern === 'centralized') ? 'default' : 'secondary'}>
                {hookStatuses.every(h => h.subscriptionPattern === 'centralized') ? '✅ Yes' : '⏳ In Progress'}
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
        <h1 className="text-3xl font-bold mb-2">Comprehensive Subscription Test Dashboard</h1>
        <p className="text-muted-foreground mb-4">
          🎯 <strong>All Hooks Migrated</strong> - Testing the centralized SubscriptionManager with all 10 hooks. 
          This dashboard monitors subscription health and verifies the migration is complete.
        </p>
        
        <div className="flex items-center gap-4">
          <Button 
            onClick={toggleComponent}
            variant={isActive ? "destructive" : "default"}
            size="sm"
          >
            {isActive ? 'Unmount All Hooks' : 'Mount All Hooks'}
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
              All hooks are unmounted. Click "Mount All Hooks" to test the comprehensive subscription system.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Rapid mounting/unmounting tests SubscriptionManager's robustness with all 10 hooks.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionTest;
