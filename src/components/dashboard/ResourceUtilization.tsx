import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, Settings, Package, Activity, Clock, AlertTriangle } from 'lucide-react';
import { CircularProgressSkeleton } from './skeletons/CircularProgressSkeleton';
import { MetricCardSkeleton } from './skeletons/MetricCardSkeleton';
import { ErrorFallback } from '@/components/common/ErrorFallback';

interface ResourceUtilizationData {
  labor: {
    activeWorkers: number;
    totalWorkers: number;
    utilizationRate: number;
    hoursWorked: number;
    plannedHours: number;
  };
  equipment: {
    inUse: number;
    available: number;
    utilizationRate: number;
    maintenanceCount: number;
  };
  materials: {
    usageRate: number;
    deliveredToday: number;
    consumedToday: number;
    stockLevel: number;
  };
  lastUpdated: Date;
}

// Mock data - in a real app, this would come from props or hooks
const mockResourceData: ResourceUtilizationData = {
  labor: {
    activeWorkers: 18,
    totalWorkers: 25,
    utilizationRate: 72,
    hoursWorked: 144,
    plannedHours: 200
  },
  equipment: {
    inUse: 9,
    available: 12,
    utilizationRate: 75,
    maintenanceCount: 2
  },
  materials: {
    usageRate: 89,
    deliveredToday: 15,
    consumedToday: 12,
    stockLevel: 85
  },
  lastUpdated: new Date('2024-06-22T14:30:00')
};

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

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-600" />
            Resource Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorFallback 
            title="Resource Data Unavailable"
            description={error}
            resetError={() => setError(null)}
            className="max-w-none"
          />
        </CardContent>
      </Card>
    );
  }

  const data = mockResourceData;

  const laborStatus = getUtilizationStatus(data.labor.utilizationRate);
  const equipmentStatus = getUtilizationStatus(data.equipment.utilizationRate);
  const materialStatus = getUtilizationStatus(data.materials.usageRate);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Activity className="h-5 w-5 text-orange-600" />
          Resource Utilization
        </CardTitle>
        <p className="text-sm text-slate-500">
          Last updated: {data.lastUpdated.toLocaleTimeString()}
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
                  percentage={data.labor.utilizationRate}
                  label="Worker Utilization"
                  value={`${data.labor.activeWorkers}/${data.labor.totalWorkers}`}
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
                      {data.labor.activeWorkers}
                    </span>
                    <span className="text-sm text-slate-500">
                      of {data.labor.totalWorkers} total
                    </span>
                  </div>
                  <Badge className="mt-2" variant="secondary">
                    {laborStatus.label}
                  </Badge>
                </div>

                <div className="p-4 rounded-lg border bg-slate-50 border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-600">Hours Worked Today</h3>
                    <Clock className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-slate-800">
                        {data.labor.hoursWorked}h
                      </span>
                      <span className="text-sm text-slate-500">
                        of {data.labor.plannedHours}h planned
                      </span>
                    </div>
                    <Progress 
                      value={(data.labor.hoursWorked / data.labor.plannedHours) * 100} 
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
                  percentage={data.equipment.utilizationRate}
                  label="Equipment Utilization"
                  value={`${data.equipment.inUse}/${data.equipment.available}`}
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
                      {data.equipment.inUse}
                    </span>
                    <span className="text-sm text-slate-500">
                      of {data.equipment.available} available
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
                      {data.equipment.maintenanceCount}
                    </span>
                    <span className="text-sm text-slate-500">units in maintenance</span>
                    {data.equipment.maintenanceCount > 0 && (
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
                <CircularProgress
                  percentage={data.materials.usageRate}
                  label="Material Usage Rate"
                  value={`${data.materials.usageRate}%`}
                />
              </div>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${materialStatus.bg} ${materialStatus.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-600">Daily Activity</h3>
                    <materialStatus.icon className={`h-4 w-4 ${materialStatus.color}`} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Delivered:</span>
                      <span className="font-medium">{data.materials.deliveredToday} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Consumed:</span>
                      <span className="font-medium">{data.materials.consumedToday} units</span>
                    </div>
                  </div>
                  <Badge className="mt-2" variant="secondary">
                    {materialStatus.label}
                  </Badge>
                </div>

                <div className="p-4 rounded-lg border bg-slate-50 border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-600">Stock Level</h3>
                    <Package className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-slate-800">
                        {data.materials.stockLevel}%
                      </span>
                      <span className="text-sm text-slate-500">capacity</span>
                    </div>
                    <Progress 
                      value={data.materials.stockLevel} 
                      className="h-2"
                    />
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
