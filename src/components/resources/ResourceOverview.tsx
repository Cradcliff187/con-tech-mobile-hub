
import { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useEmployeeAssignments } from '@/hooks/employee-assignments';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { CreateProjectDialog } from '@/components/dashboard/CreateProjectDialog';

interface TeamData {
  project_name: string;
  total_members: number;
  active_tasks: number;
  utilization: number;
}

export const ResourceOverview = () => {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [activeTeams, setActiveTeams] = useState(0);
  const [avgUtilization, setAvgUtilization] = useState(0);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const { user } = useAuth();
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { employeeAssignments } = useEmployeeAssignments();

  useEffect(() => {
    const fetchResourceData = async () => {
      if (!user) return;

      try {
        // Fetch total workers from profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, role, account_status')
          .in('role', ['worker', 'site_supervisor', 'project_manager'])
          .eq('account_status', 'approved');
        
        const workersCount = profiles?.length || 0;
        setTotalWorkers(workersCount);

        // Calculate team data from projects and employee assignments
        const activeProjects = projects.filter(p => p.status === 'active');
        setActiveTeams(activeProjects.length);

        const teamData: TeamData[] = activeProjects.map(project => {
          // Get employee assignments for this project
          const projectAssignments = employeeAssignments.filter(assignment => 
            assignment.project_id === project.id
          );
          
          // Get tasks for this project
          const projectTasks = tasks.filter(t => t.project_id === project.id);
          const activeTasks = projectTasks.filter(task => task.status === 'in-progress').length;
          
          // Count unique employees assigned to this project
          const uniqueEmployees = new Set(
            projectAssignments.map(assignment => assignment.stakeholder_id)
          );
          
          // Calculate utilization based on hours and assignments
          const totalAllocatedHours = projectAssignments.reduce((sum, assignment) => 
            sum + (assignment.total_hours || 0), 0
          );
          
          const utilizationRate = uniqueEmployees.size > 0 && totalAllocatedHours > 0
            ? Math.min(100, Math.floor((totalAllocatedHours / (uniqueEmployees.size * 40)) * 100))
            : 0;
          
          return {
            project_name: project.name,
            total_members: uniqueEmployees.size,
            active_tasks: activeTasks,
            utilization: utilizationRate
          };
        });

        setTeams(teamData);
        
        // Calculate average utilization
        const totalUtil = teamData.reduce((sum, team) => sum + team.utilization, 0);
        setAvgUtilization(teamData.length > 0 ? Math.floor(totalUtil / teamData.length) : 0);

      } catch (error) {
        console.error('Error fetching resource data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResourceData();
  }, [user, projects, tasks, employeeAssignments]);

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600 bg-red-100';
    if (utilization >= 70) return 'text-orange-600 bg-orange-100';
    if (utilization > 0) return 'text-green-600 bg-green-100';
    return 'text-slate-600 bg-slate-100';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-slate-500 mt-2">Loading resource data...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no projects exist
  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          type="projects"
          title="No Projects to Manage Resources For"
          description="Create your first project to start managing team resources, tracking utilization, and optimizing project assignments."
          actionLabel="Create First Project"
          onAction={() => setIsCreateProjectOpen(true)}
        />
        <CreateProjectDialog 
          open={isCreateProjectOpen}
          onOpenChange={setIsCreateProjectOpen}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Workers</p>
              <p className="text-2xl font-bold text-slate-800">{totalWorkers}</p>
            </div>
            <Users className="text-blue-600" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Active Projects</p>
              <p className="text-2xl font-bold text-slate-800">{activeTeams}</p>
            </div>
            <Clock className="text-orange-600" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Avg Utilization</p>
              <p className="text-2xl font-bold text-slate-800">{avgUtilization}%</p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Project Teams Overview</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {teams.length === 0 ? (
            <div className="p-6 text-center">
              <Users size={48} className="mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No Active Projects</h3>
              <p className="text-slate-500">Create some projects to see team utilization data</p>
            </div>
          ) : (
            teams.map((team, index) => (
              <div key={index} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-slate-800 mb-1">
                      {team.project_name}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {team.total_members} members
                      </span>
                      <span>
                        {team.active_tasks} active tasks
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-slate-600 mb-1">Utilization</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUtilizationColor(team.utilization)}`}>
                        {team.utilization}%
                      </span>
                    </div>
                    <div className="w-2 h-12 rounded-full bg-green-500" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
