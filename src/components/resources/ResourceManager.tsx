
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResourceAllocation } from './ResourceAllocation';
import { ResourceConflicts } from './ResourceConflicts';
import { MultiProjectResourceView } from './MultiProjectResourceView';
import { EquipmentTracker } from './EquipmentTracker';
import { MaintenanceScheduler } from './MaintenanceScheduler';

export const ResourceManager = () => {
  const [activeTab, setActiveTab] = useState('overview');

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
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
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
          <MaintenanceScheduler />
        </TabsContent>
      </Tabs>
    </div>
  );
};
