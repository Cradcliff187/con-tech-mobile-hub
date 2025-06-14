
import { useState, useEffect } from 'react';
import { Flag, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MilestonePlanningProps {
  projectId: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  actualDate?: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'delayed';
  progress: number;
  dependencies: string[];
  deliverables: string[];
  criticalPath: boolean;
}

export const MilestonePlanning = ({ projectId }: MilestonePlanningProps) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    // Mock milestone data - in real app, this would come from API
    const mockMilestones: Milestone[] = [
      {
        id: '1',
        title: 'Site Preparation Complete',
        description: 'All excavation, grading, and utility preparation work finished',
        targetDate: '2024-06-15',
        actualDate: '2024-06-14',
        status: 'completed',
        progress: 100,
        dependencies: [],
        deliverables: ['Site Survey Report', 'Excavation Completion Certificate', 'Utility Installation Report'],
        criticalPath: true
      },
      {
        id: '2',
        title: 'Foundation Pour Complete',
        description: 'All foundation concrete poured and cured to specification',
        targetDate: '2024-07-05',
        status: 'in-progress',
        progress: 75,
        dependencies: ['Site Preparation Complete'],
        deliverables: ['Foundation Inspection Report', 'Concrete Test Results', 'As-Built Drawings'],
        criticalPath: true
      },
      {
        id: '3',
        title: 'Structural Frame Erected',
        description: 'Steel frame structure completely erected and secured',
        targetDate: '2024-08-15',
        status: 'upcoming',
        progress: 0,
        dependencies: ['Foundation Pour Complete'],
        deliverables: ['Steel Erection Certificate', 'Structural Inspection Report', 'Welding Certification'],
        criticalPath: true
      },
      {
        id: '4',
        title: 'Electrical Rough-In Complete',
        description: 'All electrical rough-in work completed and inspected',
        targetDate: '2024-08-10',
        status: 'upcoming',
        progress: 0,
        dependencies: ['Structural Frame Erected'],
        deliverables: ['Electrical Inspection Certificate', 'Circuit Testing Report'],
        criticalPath: false
      },
      {
        id: '5',
        title: 'Building Envelope Sealed',
        description: 'Exterior walls, roofing, and weatherproofing complete',
        targetDate: '2024-09-20',
        status: 'upcoming',
        progress: 0,
        dependencies: ['Structural Frame Erected', 'Electrical Rough-In Complete'],
        deliverables: ['Weatherproofing Certificate', 'Energy Efficiency Report'],
        criticalPath: true
      }
    ];

    setMilestones(mockMilestones);
  }, [projectId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={20} className="text-green-600" />;
      case 'in-progress': return <Clock size={20} className="text-blue-600" />;
      case 'delayed': return <AlertTriangle size={20} className="text-red-600" />;
      default: return <Flag size={20} className="text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100 border-green-200';
      case 'in-progress': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'delayed': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  const getDaysUntil = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Project Milestones</h3>
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
          <Flag size={16} className="mr-2" />
          Add Milestone
        </Button>
      </div>

      {/* Milestone Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {milestones.filter(m => m.status === 'completed').length}
          </div>
          <div className="text-sm text-green-800">Completed</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {milestones.filter(m => m.status === 'in-progress').length}
          </div>
          <div className="text-sm text-blue-800">In Progress</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-slate-600">
            {milestones.filter(m => m.status === 'upcoming').length}
          </div>
          <div className="text-sm text-slate-800">Upcoming</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">
            {milestones.filter(m => m.status === 'delayed').length}
          </div>
          <div className="text-sm text-red-800">Delayed</div>
        </div>
      </div>

      {/* Milestone Timeline */}
      <div className="space-y-4">
        {milestones.map((milestone, index) => {
          const daysUntil = getDaysUntil(milestone.targetDate);
          const isOverdue = daysUntil < 0 && milestone.status !== 'completed';
          
          return (
            <div key={milestone.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(milestone.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-slate-800">{milestone.title}</h4>
                        {milestone.criticalPath && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            Critical Path
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(milestone.status)}`}>
                          {milestone.status.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-3">{milestone.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">Progress</span>
                          <span className="font-medium text-slate-800">{milestone.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${milestone.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                      <Calendar size={14} />
                      <span>Target: {formatDate(milestone.targetDate)}</span>
                    </div>
                    {milestone.actualDate && (
                      <div className="text-sm text-green-600">
                        Completed: {formatDate(milestone.actualDate)}
                      </div>
                    )}
                    {!milestone.actualDate && (
                      <div className={`text-sm ${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                        {daysUntil === 0 ? 'Due today' : 
                         daysUntil > 0 ? `${daysUntil} days remaining` : 
                         `${Math.abs(daysUntil)} days overdue`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Dependencies */}
                {milestone.dependencies.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-slate-700 mb-2">Dependencies:</h5>
                    <div className="flex flex-wrap gap-2">
                      {milestone.dependencies.map((dep, depIndex) => (
                        <span key={depIndex} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deliverables */}
                <div>
                  <h5 className="text-sm font-medium text-slate-700 mb-2">Key Deliverables:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {milestone.deliverables.map((deliverable, delIndex) => (
                      <div key={delIndex} className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-2 h-2 bg-slate-400 rounded-full flex-shrink-0" />
                        <span>{deliverable}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Timeline Connector */}
              {index < milestones.length - 1 && (
                <div className="flex justify-center">
                  <div className="w-px h-6 bg-slate-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Critical Path Alert */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={20} className="text-orange-600" />
          <h4 className="font-semibold text-orange-800">Critical Path Analysis</h4>
        </div>
        <p className="text-sm text-orange-700 mb-3">
          The following milestones are on the critical path. Any delays will impact the overall project timeline.
        </p>
        <div className="space-y-1">
          {milestones
            .filter(m => m.criticalPath)
            .map(m => (
              <div key={m.id} className="text-sm text-orange-700">
                • {m.title} - Due {formatDate(m.targetDate)}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
