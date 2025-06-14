
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

interface TimelineTask {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  dependencies: string[];
  category: string;
  isCriticalPath?: boolean;
}

interface ProjectTimelineProps {
  projectId?: string;
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projectId }) => {
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Mock data for demonstration
  const tasks: TimelineTask[] = [
    {
      id: '1',
      title: 'Site Preparation & Excavation',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-15'),
      progress: 100,
      status: 'completed',
      priority: 'high',
      assignee: 'Site Team A',
      dependencies: [],
      category: 'Foundation',
      isCriticalPath: true
    },
    {
      id: '2',
      title: 'Foundation Pour',
      startDate: new Date('2024-02-16'),
      endDate: new Date('2024-03-10'),
      progress: 75,
      status: 'in-progress',
      priority: 'critical',
      assignee: 'Concrete Crew',
      dependencies: ['1'],
      category: 'Foundation',
      isCriticalPath: true
    },
    {
      id: '3',
      title: 'Steel Frame Installation',
      startDate: new Date('2024-03-11'),
      endDate: new Date('2024-04-20'),
      progress: 0,
      status: 'not-started',
      priority: 'high',
      assignee: 'Steel Workers',
      dependencies: ['2'],
      category: 'Structure',
      isCriticalPath: true
    },
    {
      id: '4',
      title: 'Electrical Rough-in',
      startDate: new Date('2024-03-25'),
      endDate: new Date('2024-04-15'),
      progress: 0,
      status: 'not-started',
      priority: 'medium',
      assignee: 'Electrical Team',
      dependencies: ['3'],
      category: 'MEP'
    },
    {
      id: '5',
      title: 'Plumbing Installation',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-05-01'),
      progress: 0,
      status: 'not-started',
      priority: 'medium',
      assignee: 'Plumbing Crew',
      dependencies: ['3'],
      category: 'MEP'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'blocked':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-400" />;
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

  const getTaskBarWidth = (task: TimelineTask) => {
    const duration = Math.max(1, Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24)));
    return Math.max(120, duration * 3); // Minimum 120px, 3px per day
  };

  const getTaskBarLeft = (task: TimelineTask) => {
    const baseDate = new Date('2024-01-01');
    const daysSinceBase = Math.ceil((task.startDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceBase * 3; // 3px per day
  };

  return (
    <div className="space-y-6">
      {/* Timeline Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Project Timeline
            </CardTitle>
            <div className="flex items-center gap-4">
              <Select value={viewMode} onValueChange={(value: 'week' | 'month' | 'quarter') => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week View</SelectItem>
                  <SelectItem value="month">Month View</SelectItem>
                  <SelectItem value="quarter">Quarter View</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                Today
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Critical Path</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span>Not Started</span>
              </div>
            </div>

            {/* Timeline Grid */}
            <div className="relative overflow-x-auto">
              <div className="min-w-[1200px]">
                {/* Time Scale Header */}
                <div className="flex border-b border-gray-200 bg-gray-50 p-2">
                  <div className="w-64 font-medium text-sm">Task</div>
                  <div className="flex-1 relative">
                    <div className="flex text-xs text-gray-600">
                      {Array.from({ length: 12 }, (_, i) => (
                        <div key={i} className="flex-1 text-center border-r border-gray-200 py-1">
                          {format(addDays(new Date('2024-01-01'), i * 30), 'MMM yyyy')}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Task Rows */}
                <div className="space-y-1">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        selectedTask === task.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                    >
                      {/* Task Info */}
                      <div className="w-64 p-3 border-r border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(task.status)}
                          <span className="font-medium text-sm truncate">{task.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Users className="w-3 h-3" />
                          <span>{task.assignee}</span>
                          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>

                      {/* Timeline Bar */}
                      <div className="flex-1 relative p-2">
                        <div className="relative h-8">
                          <div
                            className={`absolute top-1 h-6 rounded transition-all duration-200 cursor-pointer ${
                              task.isCriticalPath
                                ? 'bg-red-500'
                                : task.status === 'completed'
                                ? 'bg-green-500'
                                : task.status === 'in-progress'
                                ? 'bg-blue-500'
                                : 'bg-gray-300'
                            }`}
                            style={{
                              left: `${getTaskBarLeft(task)}px`,
                              width: `${getTaskBarWidth(task)}px`,
                            }}
                          >
                            {/* Progress Indicator */}
                            {task.progress > 0 && (
                              <div
                                className="h-full bg-white bg-opacity-30 rounded"
                                style={{ width: `${task.progress}%` }}
                              />
                            )}
                            <div className="flex items-center justify-center h-full text-white text-xs font-medium">
                              {task.progress}%
                            </div>
                          </div>

                          {/* Dependencies Lines */}
                          {task.dependencies.map((depId) => {
                            const depTask = tasks.find(t => t.id === depId);
                            if (depTask) {
                              return (
                                <div
                                  key={depId}
                                  className="absolute border-l-2 border-dashed border-gray-400"
                                  style={{
                                    left: `${getTaskBarLeft(depTask) + getTaskBarWidth(depTask)}px`,
                                    top: '-20px',
                                    height: '40px',
                                  }}
                                />
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
