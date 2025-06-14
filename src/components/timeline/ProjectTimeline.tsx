
import { useState } from 'react';
import { TimelineView } from './TimelineView';
import { TaskDetails } from './TaskDetails';

export const ProjectTimeline = () => {
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const projects = [
    {
      id: 1,
      name: 'Downtown Office Complex',
      tasks: [
        {
          id: 1,
          name: 'Site Preparation',
          startDate: '2024-06-01',
          endDate: '2024-06-15',
          progress: 100,
          dependencies: [],
          assignee: 'Site Crew A'
        },
        {
          id: 2,
          name: 'Foundation Work',
          startDate: '2024-06-16',
          endDate: '2024-07-05',
          progress: 75,
          dependencies: [1],
          assignee: 'Foundation Specialists'
        },
        {
          id: 3,
          name: 'Structural Framing',
          startDate: '2024-07-06',
          endDate: '2024-08-15',
          progress: 25,
          dependencies: [2],
          assignee: 'Steel Crew'
        },
        {
          id: 4,
          name: 'Electrical Rough-in',
          startDate: '2024-07-20',
          endDate: '2024-08-10',
          progress: 0,
          dependencies: [3],
          assignee: 'Electric Solutions Inc'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-800">Project Timeline</h2>
        <select className="px-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Downtown Office Complex</option>
          <option>Residential Housing Phase 2</option>
          <option>Highway Bridge Renovation</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TimelineView 
            project={projects[0]} 
            onTaskSelect={setSelectedTask}
            selectedTask={selectedTask}
          />
        </div>
        <div>
          <TaskDetails task={selectedTask} />
        </div>
      </div>
    </div>
  );
};
