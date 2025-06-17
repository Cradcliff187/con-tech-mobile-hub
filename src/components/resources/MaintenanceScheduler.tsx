import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, AlertTriangle, CheckCircle, Clock, Wrench } from 'lucide-react';
import { useEquipment } from '@/hooks/useEquipment';
import { useDialogState } from '@/hooks/useDialogState';
import { MaintenanceTaskDetailsDialog } from './MaintenanceTaskDetailsDialog';

interface MaintenanceTask {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'routine' | 'repair' | 'inspection';
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledDate: string;
  estimatedHours: number;
  assignedTo?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  description: string;
}

export const MaintenanceScheduler = () => {
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const { equipment, loading: equipmentLoading } = useEquipment();
  const { activeDialog, openDialog, closeDialog, isDialogOpen } = useDialogState();

  useEffect(() => {
    if (!equipmentLoading) {
      generateMaintenanceTasks();
    }
  }, [equipment, equipmentLoading]);

  const generateMaintenanceTasks = () => {
    const tasks: MaintenanceTask[] = [];
    const today = new Date();

    equipment.forEach(item => {
      if (item.maintenance_due) {
        const maintenanceDate = new Date(item.maintenance_due);
        const isOverdue = maintenanceDate < today;
        const daysUntilMaintenance = Math.ceil((maintenanceDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        
        let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
        let status: 'scheduled' | 'in-progress' | 'completed' | 'overdue' = 'scheduled';
        
        if (isOverdue) {
          priority = 'critical';
          status = 'overdue';
        } else if (daysUntilMaintenance <= 7) {
          priority = 'high';
        } else if (daysUntilMaintenance <= 30) {
          priority = 'medium';
        } else {
          priority = 'low';
        }

        // Determine maintenance type based on equipment type
        let maintenanceType: 'routine' | 'repair' | 'inspection' = 'routine';
        if (item.type?.toLowerCase().includes('crane') || item.type?.toLowerCase().includes('lift')) {
          maintenanceType = 'inspection';
        } else if (item.status === 'maintenance') {
          maintenanceType = 'repair';
        }

        // Estimate hours based on equipment type and maintenance type
        let estimatedHours = 4;
        if (maintenanceType === 'repair') {
          estimatedHours = 8;
        } else if (maintenanceType === 'inspection') {
          estimatedHours = 2;
        }

        tasks.push({
          id: item.id,
          equipmentId: item.id,
          equipmentName: item.name,
          type: maintenanceType,
          priority,
          scheduledDate: item.maintenance_due,
          estimatedHours,
          assignedTo: item.operator?.full_name,
          status,
          description: `${maintenanceType === 'routine' ? 'Routine maintenance' : 
                       maintenanceType === 'repair' ? 'Repair work required' : 
                       'Safety inspection'} for ${item.name}`
        });
      }
    });

    // Sort by priority and date
    tasks.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    });

    setMaintenanceTasks(tasks);
    setLoading(false);
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-600" />;
      case 'in-progress': return <Clock size={16} className="text-blue-600" />;
      case 'overdue': return <AlertTriangle size={16} className="text-red-600" />;
      default: return <CalendarDays size={16} className="text-yellow-600" />;
    }
  };

  const overdueTasks = maintenanceTasks.filter(task => task.status === 'overdue').length;
  const criticalTasks = maintenanceTasks.filter(task => task.priority === 'critical').length;
  const thisWeekTasks = maintenanceTasks.filter(task => {
    const taskDate = new Date(task.scheduledDate);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return taskDate >= today && taskDate <= weekFromNow;
  }).length;

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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Tasks</p>
                <p className="text-2xl font-bold text-slate-800">{maintenanceTasks.length}</p>
              </div>
              <Wrench className="text-blue-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueTasks}</p>
              </div>
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Critical</p>
                <p className="text-2xl font-bold text-orange-600">{criticalTasks}</p>
              </div>
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">This Week</p>
                <p className="text-2xl font-bold text-green-600">{thisWeekTasks}</p>
              </div>
              <CalendarDays className="text-green-600" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Tasks */}
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
                <div key={task.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(task.status)}
                        <h4 className="font-medium text-slate-800">{task.equipmentName}</h4>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>Due: {new Date(task.scheduledDate).toLocaleDateString()}</span>
                        <span>{task.estimatedHours}h estimated</span>
                        {task.assignedTo && <span>Assigned to: {task.assignedTo}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('-', ' ')}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(task)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
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
