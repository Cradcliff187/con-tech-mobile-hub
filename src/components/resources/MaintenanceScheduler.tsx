
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, AlertTriangle, CheckCircle, Clock, Wrench } from 'lucide-react';

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
  const [maintenanceTasks] = useState<MaintenanceTask[]>([
    {
      id: '1',
      equipmentId: 'eq1',
      equipmentName: 'Excavator CAT 320',
      type: 'routine',
      priority: 'medium',
      scheduledDate: '2024-06-20',
      estimatedHours: 4,
      assignedTo: 'Mike Rodriguez',
      status: 'scheduled',
      description: 'Oil change and hydraulic fluid check'
    },
    {
      id: '2',
      equipmentId: 'eq2',
      equipmentName: 'Crane Liebherr 150',
      type: 'repair',
      priority: 'critical',
      scheduledDate: '2024-06-15',
      estimatedHours: 12,
      assignedTo: 'Sarah Johnson',
      status: 'overdue',
      description: 'Hydraulic cylinder replacement'
    },
    {
      id: '3',
      equipmentId: 'eq3',
      equipmentName: 'Bulldozer D6',
      type: 'inspection',
      priority: 'high',
      scheduledDate: '2024-06-25',
      estimatedHours: 2,
      status: 'scheduled',
      description: 'Annual safety inspection'
    }
  ]);

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
                <p className="text-2xl font-bold text-green-600">
                  {maintenanceTasks.filter(task => {
                    const taskDate = new Date(task.scheduledDate);
                    const today = new Date();
                    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                    return taskDate >= today && taskDate <= weekFromNow;
                  }).length}
                </p>
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
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
