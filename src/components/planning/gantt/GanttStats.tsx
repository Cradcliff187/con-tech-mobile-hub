
import { CheckCircle, Clock, AlertTriangle, Pause, PlayCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Task } from '@/types/database';

interface GanttStatsProps {
  tasks: Task[];
}

export const GanttStats = ({ tasks }: GanttStatsProps) => {
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
    notStarted: tasks.filter(t => t.status === 'not-started').length,
    onHold: tasks.filter(t => t.status === 'on-hold').length
  };

  const statCards = [
    { 
      label: 'Total Tasks', 
      value: stats.total, 
      icon: Clock, 
      color: 'text-slate-800',
      bgColor: 'bg-slate-50'
    },
    { 
      label: 'Completed', 
      value: stats.completed, 
      icon: CheckCircle, 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      label: 'In Progress', 
      value: stats.inProgress, 
      icon: PlayCircle, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Blocked', 
      value: stats.blocked, 
      icon: AlertTriangle, 
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    { 
      label: 'Not Started', 
      value: stats.notStarted, 
      icon: Pause, 
      color: 'text-slate-600',
      bgColor: 'bg-slate-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className={`p-3 ${stat.bgColor} border-0`}>
            <div className="flex items-center gap-2">
              <Icon size={16} className={stat.color} />
              <div>
                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-slate-600">{stat.label}</div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
