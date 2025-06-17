
import { Card, CardContent } from '@/components/ui/card';
import { Wrench, AlertTriangle, CalendarDays } from 'lucide-react';
import { MaintenanceTask } from '@/hooks/useMaintenanceTasks';

interface MaintenanceSummaryCardsProps {
  tasks: MaintenanceTask[];
}

export const MaintenanceSummaryCards = ({ tasks }: MaintenanceSummaryCardsProps) => {
  const overdueTasks = tasks.filter(task => task.status === 'overdue').length;
  const criticalTasks = tasks.filter(task => task.priority === 'critical').length;
  const thisWeekTasks = tasks.filter(task => {
    const taskDate = new Date(task.scheduled_date);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return taskDate >= today && taskDate <= weekFromNow;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Tasks</p>
              <p className="text-2xl font-bold text-slate-800">{tasks.length}</p>
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
  );
};
