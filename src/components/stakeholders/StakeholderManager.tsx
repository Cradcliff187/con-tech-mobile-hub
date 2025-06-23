
import { useState } from 'react';
import { StakeholderDirectory } from './StakeholderDirectory';
import { StakeholderAssignments } from './StakeholderAssignments';
import { StakeholderPerformance } from './StakeholderPerformance';
import { CreateStakeholderDialog } from './CreateStakeholderDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const StakeholderManager = () => {
  const [activeView, setActiveView] = useState<'directory' | 'assignments' | 'performance'>('directory');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const views = [
    { id: 'directory', label: 'Directory' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'performance', label: 'Performance' }
  ];

  const handleStakeholderCreated = () => {
    setShowCreateDialog(false);
    // The dialog will handle the success callback to refresh data
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-800">Stakeholder Management</h2>
        
        <div className="flex items-center gap-4">
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
          
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Stakeholder
          </Button>
        </div>
      </div>

      {activeView === 'directory' && <StakeholderDirectory />}
      {activeView === 'assignments' && <StakeholderAssignments />}
      {activeView === 'performance' && <StakeholderPerformance />}

      <CreateStakeholderDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onSuccess={handleStakeholderCreated}
      />
    </div>
  );
};
