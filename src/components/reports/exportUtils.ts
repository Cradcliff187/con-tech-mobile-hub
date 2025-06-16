
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

interface ExportOptions {
  format: 'pdf' | 'excel';
  dateRange: string;
  projectId: string;
  reportType: 'dashboard' | 'charts';
  timestamp: string;
}

export const exportToPDF = async (options: ExportOptions, filename: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // Header
  doc.setFontSize(20);
  doc.text('ConstructPro Progress Report', margin, 30);
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 45);
  doc.text(`Report Type: ${options.reportType === 'dashboard' ? 'Dashboard View' : 'Charts View'}`, margin, 52);
  
  if (options.dateRange !== 'all') {
    doc.text(`Date Range: ${getDateRangeLabel(options.dateRange)}`, margin, 59);
  }
  
  if (options.projectId !== 'all') {
    doc.text(`Project Filter: Applied`, margin, 66);
  }

  // Fetch and display data
  const { projects, tasks } = await fetchExportData(options);
  
  let yPosition = 80;

  // Projects Section
  doc.setFontSize(14);
  doc.text('Project Overview', margin, yPosition);
  yPosition += 15;

  doc.setFontSize(10);
  projects.forEach((project, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.text(`${index + 1}. ${project.name}`, margin, yPosition);
    doc.text(`Status: ${project.status}`, margin + 10, yPosition + 7);
    doc.text(`Progress: ${project.progress}%`, margin + 10, yPosition + 14);
    doc.text(`Budget: $${project.budget || 0}`, margin + 10, yPosition + 21);
    yPosition += 35;
  });

  // Tasks Summary
  if (tasks.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFontSize(14);
    doc.text('Task Summary', margin, yPosition);
    yPosition += 15;

    const taskStats = calculateTaskStats(tasks);
    doc.setFontSize(10);
    doc.text(`Total Tasks: ${taskStats.total}`, margin, yPosition);
    doc.text(`Completed: ${taskStats.completed}`, margin, yPosition + 7);
    doc.text(`In Progress: ${taskStats.inProgress}`, margin, yPosition + 14);
    doc.text(`Not Started: ${taskStats.notStarted}`, margin, yPosition + 21);
  }

  doc.save(`${filename}.pdf`);
};

export const exportToExcel = async (options: ExportOptions, filename: string) => {
  const { projects, tasks } = await fetchExportData(options);
  
  const workbook = XLSX.utils.book_new();

  // Metadata sheet
  const metadata = [
    ['ConstructPro Progress Report'],
    ['Generated on:', new Date().toLocaleDateString()],
    ['Report Type:', options.reportType === 'dashboard' ? 'Dashboard View' : 'Charts View'],
    ['Date Range:', options.dateRange !== 'all' ? getDateRangeLabel(options.dateRange) : 'All Time'],
    ['Project Filter:', options.projectId !== 'all' ? 'Applied' : 'All Projects'],
    [''],
    ['Summary:'],
    ['Total Projects:', projects.length],
    ['Total Tasks:', tasks.length]
  ];
  
  const metadataSheet = XLSX.utils.aoa_to_sheet(metadata);
  XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Report Info');

  // Projects sheet
  const projectsData = projects.map(project => ({
    'Project Name': project.name,
    'Status': project.status,
    'Phase': project.phase,
    'Progress (%)': project.progress,
    'Budget': project.budget || 0,
    'Spent': project.spent || 0,
    'Start Date': project.start_date || '',
    'End Date': project.end_date || '',
    'Location': project.location || '',
    'Created': new Date(project.created_at).toLocaleDateString()
  }));

  const projectsSheet = XLSX.utils.json_to_sheet(projectsData);
  XLSX.utils.book_append_sheet(workbook, projectsSheet, 'Projects');

  // Tasks sheet (if any tasks)
  if (tasks.length > 0) {
    const tasksData = tasks.map(task => ({
      'Task Title': task.title,
      'Status': task.status,
      'Priority': task.priority,
      'Progress (%)': task.progress || 0,
      'Project ID': task.project_id,
      'Due Date': task.due_date || '',
      'Estimated Hours': task.estimated_hours || 0,
      'Actual Hours': task.actual_hours || 0,
      'Category': task.category || '',
      'Created': new Date(task.created_at).toLocaleDateString()
    }));

    const tasksSheet = XLSX.utils.json_to_sheet(tasksData);
    XLSX.utils.book_append_sheet(workbook, tasksSheet, 'Tasks');
  }

  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

const fetchExportData = async (options: ExportOptions) => {
  let projectsQuery = supabase
    .from('projects')
    .select(`
      *,
      client:stakeholders(
        id,
        company_name,
        contact_person,
        stakeholder_type
      )
    `)
    .order('created_at', { ascending: false });

  let tasksQuery = supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  // Apply project filter
  if (options.projectId !== 'all') {
    projectsQuery = projectsQuery.eq('id', options.projectId);
    tasksQuery = tasksQuery.eq('project_id', options.projectId);
  }

  // Apply date filters (simplified for now)
  if (options.dateRange !== 'all') {
    const dateFilter = getDateFilter(options.dateRange);
    if (dateFilter) {
      projectsQuery = projectsQuery.gte('created_at', dateFilter);
      tasksQuery = tasksQuery.gte('created_at', dateFilter);
    }
  }

  const [projectsResult, tasksResult] = await Promise.all([
    projectsQuery,
    tasksQuery
  ]);

  return {
    projects: projectsResult.data || [],
    tasks: tasksResult.data || []
  };
};

const getDateFilter = (dateRange: string): string | null => {
  const now = new Date();
  switch (dateRange) {
    case 'last_30_days':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    case 'last_90_days':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
    case 'this_year':
      return new Date(now.getFullYear(), 0, 1).toISOString();
    default:
      return null;
  }
};

const getDateRangeLabel = (range: string) => {
  switch (range) {
    case 'last_30_days': return 'Last 30 Days';
    case 'last_90_days': return 'Last 90 Days';
    case 'this_year': return 'This Year';
    case 'custom_range': return 'Custom Range';
    default: return 'All Time';
  }
};

const calculateTaskStats = (tasks: any[]) => {
  const stats = {
    total: tasks.length,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    blocked: 0
  };

  tasks.forEach(task => {
    switch (task.status) {
      case 'completed':
        stats.completed++;
        break;
      case 'in-progress':
        stats.inProgress++;
        break;
      case 'not-started':
        stats.notStarted++;
        break;
      case 'blocked':
        stats.blocked++;
        break;
    }
  });

  return stats;
};
