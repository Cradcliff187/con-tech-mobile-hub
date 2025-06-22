
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, Settings, Package, Activity, Clock, AlertTriangle } from 'lucide-react';
import { CircularProgressSkeleton } from './skeletons/CircularProgressSkeleton';
import { MetricCardSkeleton } from './skeletons/MetricCardSkeleton';
import { ErrorFallback } from '@/components/common/ErrorFallback';
import { useResourceAllocations } from '@/hooks/useResourceAllocations';
import { useEquipment } from '@/hooks/useEquipment';
import { useMaintenanceTasks } from '@/hooks/useMaintenanceTasks';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
  value: string;
}

const CircularProgress = ({ 
  percentage, 
  size = 120, 
  strokeWidth = 8, 
  color = 'text-blue-600',
  label,
  value 
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (rate: number) => {
    if (rate >= 85) return 'stroke-green-500';
    if (rate >= 70) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-slate-200"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-500 ${getColor(percentage)}`}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-800">{percentage}%</span>
          <span className="text-sm font-medium text-slate-600">{value}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-slate-600 text-center">{label}</span>
    </div>
  );
};

const getUtilizationStatus = (rate: number) => {
  if (rate >= 85) {
    return {
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      label: 'Excellent',
      icon: Users
    };
  } else if (rate >= 70) {
    return {
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      label: 'Good',
      icon: Clock
    };
  } else {
    return {
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'Needs Attention',
      icon: AlertTriangle
    };
  }
};

export const ResourceUtilization = () => {
  const [activeTab, setActiveTab] = useState('labor');
  
  // Get data from existing hooks
  const { allocations, loading: allocationsLoading } = useResourceAllocations();
  const { equipment, loading: equipmentLoading } = useEquipment();
  const { tasks: maintenanceTasks, loading: maintenanceLoading } = useMaintenanceTasks();

  // Calculate loading state
  const loading = allocationsLoading || equipmentLoading || maintenanceLoading;

  // Calculate real labor metrics
  const allMembers = allocations.flatMap(a => a.members || []);
  const activeWorkers = allMembers.filter(m => m.hours_used > 0).length;
  const totalWorkers = allMembers.length;
  const totalHoursUsed = allMembers.reduce((sum, m) => sum + m.hours_used, 0);
  const totalHoursAllocated = allMembers.reduce((sum, m) => sum + m.hours_allocated, 0);
  const laborUtilizationRate = totalHoursAllocated > 0 ? Math.round((totalHoursUsed / totalHoursAllocated) * 100) : 0;

  // Calculate real equipment metrics
  const inUse = equipment.filter(e => e.status === 'in-use').length;
  const available = equipment.filter(e => e.status === 'available').length;
  const totalEquipment = inUse + available;
  const equipmentUtilizationRate = totalEquipment > 0 ? Math.round((inUse / totalEquipment) * 100) : 0;
  const maintenanceCount = maintenanceTasks.filter(t => t.status === 'scheduled' || t.status === 'in_progress').length;

  // Get last updated time from most recent data
  const lastUpdated = new Date(); // Use current time as data is real-time

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-600" />
            Resource Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="labor">Labor</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
            </TabsList>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CircularProgressSkeleton size={120} />
              <div className="space-y-4">
                <MetricCardSkeleton />
                <MetricCardSkeleton showProgress />
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  const laborStatus = getUtilizationStatus(laborUtilizationRate);
  const equipmentStatus = getUtilizationStatus(equipmentUtilizationRate);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Activity className="h-5 w-5 text-orange-600" />
          Resource Utilization
        </CardTitle>
        <p className="text-sm text-slate-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="labor" className="flex items-center gap-2">
              <Users size={16} />
              Labor
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Settings size={16} />
              Equipment
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <Package size={16} />
              Materials
            </TabsTrigger>
          </TabsList>

          {/* Labor Tab */}
          <TabsContent value="labor" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex justify-center">
                <CircularProgress
                  percentage={laborUtilizationRate}
                  label="Worker Utilization"
                  value={`${activeWorkers}/${totalWorkers}`}
                />
              </div>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${laborStatus.bg} ${laborStatus.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-600">Active Workers</h3>
                    <laborStatus.icon className={`h-4 w-4 ${laborStatus.color}`} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${laborStatus.color}`}>
                      {activeWorkers}
                    </span>
                    <span className="text-sm text-slate-500">
                      of {totalWorkers} total
                    </span>
                  </div>
                  <Badge className="mt-2" variant="secondary">
                    {laborStatus.label}
                  </Badge>
                </div>

                <div className="p-4 rounded-lg border bg-slate-50 border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-600">Hours Utilization</h3>
                    <Clock className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-slate-800">
                        {totalHoursUsed}h
                      </span>
                      <span className="text-sm text-slate-500">
                        of {totalHoursAllocated}h allocated
                      </span>
                    </div>
                    <Progress 
                      value={laborUtilizationRate} 
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Equipment Tab */}
          <TabsContent value="equipment" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex justify-center">
                <CircularProgress
                  percentage={equipmentUtilizationRate}
                  label="Equipment Utilization"
                  value={`${inUse}/${totalEquipment}`}
                />
              </div>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${equipmentStatus.bg} ${equipmentStatus.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-600">Equipment In Use</h3>
                    <equipmentStatus.icon className={`h-4 w-4 ${equipmentStatus.color}`} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${equipmentStatus.color}`}>
                      {inUse}
                    </span>
                    <span className="text-sm text-slate-500">
                      of {totalEquipment} total
                    </span>
                  </div>
                  <Badge className="mt-2" variant="secondary">
                    {equipmentStatus.label}
                  </Badge>
                </div>

                <div className="p-4 rounded-lg border bg-slate-50 border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-600">Maintenance Status</h3>
                    <Settings className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-800">
                      {maintenanceCount}
                    </span>
                    <span className="text-sm text-slate-500">tasks pending</span>
                    {maintenanceCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Scheduled
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex justify-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center">
                    <Package className="h-8 w-8 text-slate-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-600 text-center">Materials Tracking</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-slate-50 border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-600">Status</h3>
                    <Package className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">
                      Materials tracking is not yet available.
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      Coming Soon
                    </Badge>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-slate-50 border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-600">Future Features</h3>
                    <AlertTriangle className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>• Material usage tracking</p>
                    <p>• Delivery management</p>
                    <p>• Stock level monitoring</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
