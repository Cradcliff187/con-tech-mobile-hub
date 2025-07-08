
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResourceAllocation } from './ResourceAllocation';
import { ResourceConflicts } from './ResourceConflicts';
import { MultiProjectResourceView } from './MultiProjectResourceView';
import { EquipmentTracker } from './EquipmentTracker';
import { MaintenanceScheduler } from './MaintenanceScheduler';
import { useEquipment } from '@/hooks/useEquipment';
import { useMaintenanceTasksContext } from '@/contexts/MaintenanceTasksContext';

export const ResourceManager = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showMaintenanceScheduler, setShowMaintenanceScheduler] = useState(false);
  const { equipment } = useEquipment();
  const { tasks: maintenanceTasks } = useMaintenanceTasksContext();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Resource Management</h1>
        <p className="text-slate-600">Manage resources, equipment, and team allocations across projects</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Multi-Project View</TabsTrigger>
          <TabsTrigger value="allocation">Allocations</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="maintenance" onClick={() => setShowMaintenanceScheduler(true)}>Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <MultiProjectResourceView />
        </TabsContent>

        <TabsContent value="allocation" className="space-y-6">
          <ResourceAllocation />
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-6">
          <ResourceConflicts />
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          <EquipmentTracker />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="text-center py-8">
            <p className="text-slate-600 mb-4">Open the Maintenance Scheduler to manage maintenance tasks and schedules.</p>
            <button 
              onClick={() => setShowMaintenanceScheduler(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Open Maintenance Scheduler
            </button>
          </div>
        </TabsContent>
      </Tabs>

      <MaintenanceScheduler
        open={showMaintenanceScheduler}
        onOpenChange={setShowMaintenanceScheduler}
        equipment={equipment}
        maintenanceTasks={maintenanceTasks}
      />
    </div>
  );
};
