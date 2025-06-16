
import { useState } from 'react';
import { ReportDashboard } from './ReportDashboard';
import { ReportCharts } from './ReportCharts';
import { Calendar, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjects } from '@/hooks/useProjects';
import { validateSelectData } from '@/utils/selectHelpers';

export const ProgressReports = () => {
  const [reportType, setReportType] = useState<'dashboard' | 'charts'>('dashboard');
  const [dateRange, setDateRange] = useState('last_30_days');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  
  const { projects, loading: projectsLoading } = useProjects();
  const validatedProjects = validateSelectData(projects);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-800">Progress Reports</h2>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setReportType('dashboard')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                reportType === 'dashboard'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setReportType('charts')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                reportType === 'charts'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Charts
            </button>
          </div>
          
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-500" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
                <SelectItem value="custom_range">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projectsLoading ? (
                <SelectItem value="loading" disabled>Loading projects...</SelectItem>
              ) : validatedProjects.length === 0 ? (
                <SelectItem value="no-projects" disabled>No projects available</SelectItem>
              ) : (
                validatedProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name || 'Unnamed Project'}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        {reportType === 'dashboard' ? <ReportDashboard /> : <ReportCharts />}
      </div>
    </div>
  );
};
