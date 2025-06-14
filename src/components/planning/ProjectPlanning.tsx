
import { useState } from 'react';
import { GanttChart } from './GanttChart';
import { TaskHierarchy } from './TaskHierarchy';
import { ResourcePlanning } from './ResourcePlanning';
import { MilestonePlanning } from './MilestonePlanning';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Target, BarChart3 } from 'lucide-react';

export const ProjectPlanning = () => {
  const [activeView, setActiveView] = useState<'gantt' | 'hierarchy' | 'resources' | 'milestones'>('gantt');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const views = [
    { id: 'gantt', label: 'Gantt Chart', icon: BarChart3 },
    { id: 'hierarchy', label: 'Task Hierarchy', icon: Target },
    { id: 'resources', label: 'Resource Planning', icon: Users },
    { id: 'milestones', label: 'Milestones', icon: Calendar }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Project Planning</h2>
          <p className="text-slate-600">Plan and visualize your construction project timeline</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Export Plan
          </Button>
          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
            Save Changes
          </Button>
        </div>
      </div>

      {/* Project Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700">Select Project:</label>
          <select 
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Choose a project...</option>
            <option value="1">Downtown Office Complex</option>
            <option value="2">Residential Housing Phase 2</option>
            <option value="3">Highway Bridge Renovation</option>
          </select>
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <div className="flex overflow-x-auto">
            {views.map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeView === view.id
                      ? 'border-orange-500 text-orange-600 bg-orange-50'
                      : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={16} />
                  {view.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {selectedProjectId ? (
            <>
              {activeView === 'gantt' && <GanttChart projectId={selectedProjectId} />}
              {activeView === 'hierarchy' && <TaskHierarchy projectId={selectedProjectId} />}
              {activeView === 'resources' && <ResourcePlanning projectId={selectedProjectId} />}
              {activeView === 'milestones' && <MilestonePlanning projectId={selectedProjectId} />}
            </>
          ) : (
            <div className="text-center py-12">
              <Target size={48} className="mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">Select a Project to Begin Planning</h3>
              <p className="text-slate-500">Choose a project from the dropdown above to view and edit its planning details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
