
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench } from 'lucide-react';
import { useEquipment } from '@/hooks/useEquipment';
import { useDialogState } from '@/hooks/useDialogState';
import { MaintenanceTaskDetailsDialog } from './MaintenanceTaskDetailsDialog';
import { MaintenanceSummaryCards } from './maintenance/MaintenanceSummaryCards';
import { MaintenanceTaskCard } from './maintenance/MaintenanceTaskCard';
import { MaintenanceTask } from './maintenance/types';
import { generateMaintenanceTasks } from './maintenance/utils';

export const MaintenanceScheduler = () => {
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const { equipment, loading: equipmentLoading } = useEquipment();
  const { activeDialog, openDialog, closeDialog, isDialogOpen } = useDialogState();

  useEffect(() => {
    if (!equipmentLoading) {
      const tasks = generateMaintenanceTasks(equipment);
      setMaintenanceTasks(tasks);
      setLoading(false);
    }
  }, [equipment, equipmentLoading]);

  const handleViewDetails = (task: MaintenanceTask) => {
    setSelectedTask(task);
    openDialog('details');
  };

  const handleDetailsClose = (open: boolean) => {
    if (!open) {
      closeDialog();
      setSelectedTask(null);
    }
  };

  if (loading || equipmentLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="h-24 bg-slate-200 rounded"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
          </div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MaintenanceSummaryCards tasks={maintenanceTasks} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Maintenance Schedule</CardTitle>
            <Button size="sm">Schedule New</Button>
          </div>
        </CardHeader>
        <CardContent>
          {maintenanceTasks.length === 0 ? (
            <div className="text-center py-8">
              <Wrench size={48} className="mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No Maintenance Scheduled</h3>
              <p className="text-slate-500">All equipment is up to date with no scheduled maintenance.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {maintenanceTasks.map((task) => (
                <MaintenanceTaskCard
                  key={task.id}
                  task={task}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <MaintenanceTaskDetailsDialog
        open={isDialogOpen('details')}
        onOpenChange={handleDetailsClose}
        task={selectedTask}
      />
    </div>
  );
};
