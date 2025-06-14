
import { useState } from 'react';
import { ResourceOverview } from './ResourceOverview';
import { ResourceAllocation } from './ResourceAllocation';
import { EquipmentTracker } from './EquipmentTracker';
import { MaintenanceScheduler } from './MaintenanceScheduler';
import { ResourceConflicts } from './ResourceConflicts';

export const ResourceManager = () => {
  const [activeView, setActiveView] = useState<'overview' | 'allocation' | 'equipment' | 'maintenance' | 'conflicts'>('overview');

  const views = [
    { id: 'overview', label: 'Overview' },
    { id: 'allocation', label: 'Allocation' },
    { id: 'equipment', label: 'Equipment' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'conflicts', label: 'Conflicts' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-800">Resource Management</h2>
        
        <div className="flex bg-slate-100 rounded-lg p-1">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === view.id
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {activeView === 'overview' && <ResourceOverview />}
      {activeView === 'allocation' && <ResourceAllocation />}
      {activeView === 'equipment' && <EquipmentTracker />}
      {activeView === 'maintenance' && <MaintenanceScheduler />}
      {activeView === 'conflicts' && <ResourceConflicts />}
    </div>
  );
};
