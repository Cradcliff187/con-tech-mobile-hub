import { useState } from 'react';
import { EstimateDirectory } from './EstimateDirectory';
import { CreateEstimateDialog } from './CreateEstimateDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const EstimateManager = () => {
  const [activeView, setActiveView] = useState<'directory' | 'performance'>('directory');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const views = [
    { id: 'directory', label: 'Directory' },
    { id: 'performance', label: 'Performance' }
  ];

  const handleEstimateCreated = () => {
    setShowCreateDialog(false);
    // The dialog will handle the success callback to refresh data
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-800">Estimate Management</h2>
        
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
            Create Estimate
          </Button>
        </div>
      </div>

      {activeView === 'directory' && <EstimateDirectory />}
      {activeView === 'performance' && (
        <div className="text-center py-12 text-slate-500">
          Performance analytics coming soon
        </div>
      )}

      <CreateEstimateDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onSuccess={handleEstimateCreated}
      />
    </div>
  );
};