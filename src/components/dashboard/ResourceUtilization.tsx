
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Settings, Package, Activity } from 'lucide-react';
import { useResourceAllocations } from '@/hooks/useResourceAllocations';
import { useEquipment } from '@/hooks/useEquipment';
import { useMaintenanceTasks } from '@/hooks/useMaintenanceTasks';
import { ResourceUtilizationLoading } from './resource-utilization/ResourceUtilizationLoading';
import { LaborTab } from './resource-utilization/LaborTab';
import { EquipmentTab } from './resource-utilization/EquipmentTab';
import { MaterialsTab } from './resource-utilization/MaterialsTab';

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
    return <ResourceUtilizationLoading activeTab={activeTab} onTabChange={setActiveTab} />;
  }

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

          <TabsContent value="labor" className="space-y-6">
            <LaborTab
              laborUtilizationRate={laborUtilizationRate}
              activeWorkers={activeWorkers}
              totalWorkers={totalWorkers}
              totalHoursUsed={totalHoursUsed}
              totalHoursAllocated={totalHoursAllocated}
            />
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6">
            <EquipmentTab
              equipmentUtilizationRate={equipmentUtilizationRate}
              inUse={inUse}
              totalEquipment={totalEquipment}
              maintenanceCount={maintenanceCount}
            />
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <MaterialsTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
