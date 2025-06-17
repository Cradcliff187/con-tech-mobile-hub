
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Wrench, AlertTriangle, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Equipment } from '@/hooks/useEquipment';
import { MaintenanceTask, useMaintenanceTasks } from '@/hooks/useMaintenanceTasks';
import { useMaintenanceSchedules } from '@/hooks/useMaintenanceSchedules';
import { useMaintenanceHistory } from '@/hooks/useMaintenanceHistory';
import { MaintenanceTaskCard } from './maintenance/MaintenanceTaskCard';
import { getStatusColor, getPriorityColor } from './maintenance/utils';
import { format, isAfter, isBefore, addDays } from 'date-fns';

interface MaintenanceSchedulerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment[];
  maintenanceTasks: MaintenanceTask[];
}

interface MaintenanceSummaryCardProps {
  totalTasks: number;
  overdueTasks: number;
  dueSoonTasks: number;
  inProgressTasks: number;
}

const MaintenanceSummaryCards = ({ totalTasks, overdueTasks, dueSoonTasks, inProgressTasks }: MaintenanceSummaryCardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Wrench size={20} className="text-blue-600" />
          <div>
            <p className="text-sm text-blue-600">Total Tasks</p>
            <p className="text-2xl font-bold text-blue-700">{totalTasks}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-red-50 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertTriangle size={20} className="text-red-600" />
          <div>
            <p className="text-sm text-red-600">Overdue</p>
            <p className="text-2xl font-bold text-red-700">{overdueTasks}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-orange-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-orange-600" />
          <div>
            <p className="text-sm text-orange-600">Due Soon</p>
            <p className="text-2xl font-bold text-orange-700">{dueSoonTasks}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-green-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-green-600" />
          <div>
            <p className="text-sm text-green-600">In Progress</p>
            <p className="text-2xl font-bold text-green-700">{inProgressTasks}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MaintenanceScheduler = ({ 
  open, 
  onOpenChange, 
  equipment, 
  maintenanceTasks 
}: MaintenanceSchedulerProps) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const { schedules } = useMaintenanceSchedules();
  const { history } = useMaintenanceHistory();
  const { createTask, updateTask, completeTask } = useMaintenanceTasks();

  // Calculate maintenance statistics
  const totalTasks = maintenanceTasks.length;
  const overdueTasks = maintenanceTasks.filter(task => task.status === 'overdue');
  const dueSoonTasks = maintenanceTasks.filter(task => {
    const taskDate = new Date(task.scheduled_date);
    const today = new Date();
    const weekFromNow = addDays(today, 7);
    return task.status === 'scheduled' && isAfter(taskDate, today) && isBefore(taskDate, weekFromNow);
  });
  const inProgressTasks = maintenanceTasks.filter(task => task.status === 'in_progress');

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    if (newStatus === 'completed') {
      await completeTask(taskId);
    } else {
      await updateTask(taskId, { status: newStatus as any });
    }
  };

  const handleCreateQuickTask = async (equipmentId: string) => {
    const selectedEquipment = equipment.find(eq => eq.id === equipmentId);
    if (!selectedEquipment) return;

    await createTask({
      equipment_id: equipmentId,
      title: `Routine Maintenance - ${selectedEquipment.name}`,
      description: `Scheduled routine maintenance for ${selectedEquipment.name}`,
      task_type: 'routine',
      priority: 'medium',
      scheduled_date: new Date().toISOString().split('T')[0],
      estimated_hours: 4
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench size={20} />
            Maintenance Scheduler
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <MaintenanceSummaryCards
              totalTasks={totalTasks}
              overdueTasks={overdueTasks.length}
              dueSoonTasks={dueSoonTasks.length}
              inProgressTasks={inProgressTasks.length}
            />

            {/* Equipment Maintenance Status */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Equipment Status</h3>
                <Button size="sm" className="gap-2">
                  <Plus size={16} />
                  Schedule Maintenance
                </Button>
              </div>
              
              <div className="grid gap-4">
                {equipment.map((item) => {
                  const equipmentTasks = maintenanceTasks.filter(task => task.equipment_id === item.id);
                  const overdueCount = equipmentTasks.filter(task => task.status === 'overdue').length;
                  const activeCount = equipmentTasks.filter(task => 
                    task.status === 'scheduled' || task.status === 'in_progress'
                  ).length;

                  return (
                    <div key={item.id} className="p-4 border rounded-lg hover:bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{item.name}</span>
                          <Badge variant="outline">{item.type}</Badge>
                          {item.maintenance_due && (
                            <Badge variant="outline" className="text-xs">
                              <Calendar size={12} className="mr-1" />
                              Due: {format(new Date(item.maintenance_due), 'MMM dd')}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {overdueCount > 0 && (
                            <Badge className="bg-red-100 text-red-800">
                              <AlertTriangle size={12} className="mr-1" />
                              {overdueCount} Overdue
                            </Badge>
                          )}
                          {activeCount > 0 && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <Clock size={12} className="mr-1" />
                              {activeCount} Active
                            </Badge>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCreateQuickTask(item.id)}
                          >
                            Schedule Task
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Maintenance Tasks</h3>
              <Button size="sm" className="gap-2">
                <Plus size={16} />
                Create Task
              </Button>
            </div>

            {/* Task Filters */}
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                All ({totalTasks})
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-red-50 text-red-700">
                Overdue ({overdueTasks.length})
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-orange-50 text-orange-700">
                Due Soon ({dueSoonTasks.length})
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-blue-50 text-blue-700">
                In Progress ({inProgressTasks.length})
              </Badge>
            </div>

            {/* Task List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {maintenanceTasks.map((task) => (
                <MaintenanceTaskCard
                  key={task.id}
                  task={task}
                  onStatusUpdate={handleTaskStatusUpdate}
                />
              ))}
              
              {maintenanceTasks.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Wrench size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>No maintenance tasks found</p>
                  <p className="text-sm">Create your first maintenance task to get started</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Maintenance Schedules</h3>
              <Button size="sm" className="gap-2">
                <Plus size={16} />
                Create Schedule
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{schedule.schedule_name}</h4>
                      <p className="text-sm text-slate-600">
                        {schedule.equipment?.name} • {schedule.frequency_type} • {schedule.estimated_hours}h
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={schedule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {schedule.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {schedules.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>No maintenance schedules configured</p>
                  <p className="text-sm">Set up recurring maintenance schedules for your equipment</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <h3 className="text-lg font-medium">Maintenance History</h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.map((entry) => (
                <div key={entry.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{entry.description}</h4>
                      <p className="text-sm text-slate-600">
                        {entry.equipment?.name} • {format(new Date(entry.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {entry.action_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {history.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Clock size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>No maintenance history available</p>
                  <p className="text-sm">Maintenance activity will appear here once tasks are completed</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
