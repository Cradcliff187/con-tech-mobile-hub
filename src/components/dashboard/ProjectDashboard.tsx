import { ProjectCard } from './ProjectCard';
import { QuickStats } from './QuickStats';
import { RecentActivity } from './RecentActivity';
import { WeatherWidget } from './WeatherWidget';

export const ProjectDashboard = () => {
  const projects = [
    {
      id: 1,
      name: 'Downtown Office Complex',
      progress: 68,
      budget: 2500000,
      spent: 1700000,
      dueDate: '2024-08-15',
      status: 'on-track' as const,
      location: 'Downtown District'
    },
    {
      id: 2,
      name: 'Residential Housing Phase 2',
      progress: 34,
      budget: 1200000,
      spent: 408000,
      dueDate: '2024-10-30',
      status: 'on-track' as const,
      location: 'Riverside Development'
    },
    {
      id: 3,
      name: 'Highway Bridge Renovation',
      progress: 89,
      budget: 3800000,
      spent: 3420000,
      dueDate: '2024-07-20',
      status: 'delayed' as const,
      location: 'Route 101 Crossing'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickStats />
        <WeatherWidget />
      </div>
      
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Active Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
      
      <RecentActivity />
    </div>
  );
};
