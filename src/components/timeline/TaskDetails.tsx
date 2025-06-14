
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Users, AlertTriangle, CheckCircle2, Edit, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface TaskDetailsProps {
  taskId: string;
  onClose: () => void;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({ taskId, onClose }) => {
  // Mock task data
  const task = {
    id: taskId,
    title: 'Foundation Pour',
    description: 'Pour concrete foundation for main building structure. Includes rebar installation and curing time.',
    startDate: new Date('2024-02-16'),
    endDate: new Date('2024-03-10'),
    progress: 75,
    status: 'in-progress',
    priority: 'critical',
    assignee: 'Concrete Crew',
    category: 'Foundation',
    estimatedHours: 320,
    actualHours: 240,
    budget: 45000,
    spent: 33750,
    dependencies: ['Site Preparation & Excavation'],
    blockers: [],
    updates: [
      {
        date: new Date('2024-02-20'),
        message: 'Started foundation excavation',
        author: 'John Smith'
      },
      {
        date: new Date('2024-02-25'),
        message: 'Rebar installation 50% complete',
        author: 'Mike Johnson'
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl mb-2">{task.title}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(task.status)}>
                {task.status.replace('-', ' ')}
              </Badge>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              <Badge variant="outline">{task.category}</Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Description */}
        <div>
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-gray-600 text-sm">{task.description}</p>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Progress</h4>
            <span className="text-sm font-medium">{task.progress}%</span>
          </div>
          <Progress value={task.progress} className="w-full" />
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Calendar className="w-4 h-4" />
              Start Date
            </div>
            <p className="font-medium">{format(task.startDate, 'MMM dd, yyyy')}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Calendar className="w-4 h-4" />
              End Date
            </div>
            <p className="font-medium">{format(task.endDate, 'MMM dd, yyyy')}</p>
          </div>
        </div>

        {/* Resources */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Users className="w-4 h-4" />
              Assigned To
            </div>
            <p className="font-medium">{task.assignee}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Clock className="w-4 h-4" />
              Hours
            </div>
            <p className="font-medium">{task.actualHours} / {task.estimatedHours} hrs</p>
          </div>
        </div>

        {/* Budget */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Budget</div>
            <p className="font-medium">${task.budget.toLocaleString()}</p>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Spent</div>
            <p className="font-medium">${task.spent.toLocaleString()}</p>
          </div>
        </div>

        {/* Dependencies */}
        {task.dependencies.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Dependencies</h4>
            <div className="space-y-1">
              {task.dependencies.map((dep, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  {dep}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Updates */}
        <div>
          <h4 className="font-medium mb-2">Recent Updates</h4>
          <div className="space-y-2">
            {task.updates.map((update, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">{update.author}</span>
                  <span className="text-xs text-gray-500">
                    {format(update.date, 'MMM dd, yyyy')}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{update.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button size="sm" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Task
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Add Update
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
