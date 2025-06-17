
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

interface PlanningExportOptions {
  format: 'pdf' | 'excel';
  projectId: string;
  activeView: string;
  timestamp: string;
}

export const exportPlanningToPDF = async (options: PlanningExportOptions, filename: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // Header
  doc.setFontSize(20);
  doc.text('ConstructPro Project Planning Report', margin, 30);
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 45);
  doc.text(`Active View: ${options.activeView}`, margin, 52);
  
  // Fetch and display data
  const planningData = await fetchPlanningData(options.projectId);
  
  let yPosition = 70;

  // Project Information
  if (planningData.project) {
    doc.setFontSize(14);
    doc.text('Project Overview', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.text(`Name: ${planningData.project.name}`, margin, yPosition);
    doc.text(`Status: ${planningData.project.status}`, margin, yPosition + 7);
    doc.text(`Phase: ${planningData.project.phase}`, margin, yPosition + 14);
    doc.text(`Progress: ${planningData.project.progress}%`, margin, yPosition + 21);
    if (planningData.project.start_date) {
      doc.text(`Start Date: ${new Date(planningData.project.start_date).toLocaleDateString()}`, margin, yPosition + 28);
    }
    if (planningData.project.end_date) {
      doc.text(`End Date: ${new Date(planningData.project.end_date).toLocaleDateString()}`, margin, yPosition + 35);
    }
    yPosition += 50;
  }

  // Tasks Summary
  if (planningData.tasks.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFontSize(14);
    doc.text('Task Summary', margin, yPosition);
    yPosition += 15;

    const taskStats = calculateTaskStats(planningData.tasks);
    doc.setFontSize(10);
    doc.text(`Total Tasks: ${taskStats.total}`, margin, yPosition);
    doc.text(`Completed: ${taskStats.completed}`, margin, yPosition + 7);
    doc.text(`In Progress: ${taskStats.inProgress}`, margin, yPosition + 14);
    doc.text(`Not Started: ${taskStats.notStarted}`, margin, yPosition + 21);
    yPosition += 35;
  }

  // Milestones
  if (planningData.milestones.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFontSize(14);
    doc.text('Milestones', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    planningData.milestones.slice(0, 5).forEach((milestone) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
      doc.text(`• ${milestone.title}`, margin, yPosition);
      doc.text(`  Due: ${new Date(milestone.due_date).toLocaleDateString()}`, margin + 5, yPosition + 7);
      doc.text(`  Status: ${milestone.status}`, margin + 5, yPosition + 14);
      yPosition += 25;
    });
  }

  // Resource Allocations
  if (planningData.allocations.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFontSize(14);
    doc.text('Resource Allocations', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    planningData.allocations.slice(0, 3).forEach((allocation) => {
      if (yPosition > 230) {
        doc.addPage();
        yPosition = 30;
      }
      doc.text(`Team: ${allocation.team_name}`, margin, yPosition);
      doc.text(`Budget: $${allocation.total_budget}`, margin, yPosition + 7);
      doc.text(`Used: $${allocation.total_used}`, margin, yPosition + 14);
      yPosition += 25;
    });
  }

  doc.save(`${filename}.pdf`);
};

export const exportPlanningToExcel = async (options: PlanningExportOptions, filename: string) => {
  const planningData = await fetchPlanningData(options.projectId);
  
  const workbook = XLSX.utils.book_new();

  // Project Overview Sheet
  if (planningData.project) {
    const projectData = [
      ['ConstructPro Project Planning Report'],
      ['Generated on:', new Date().toLocaleDateString()],
      ['Active View:', options.activeView],
      [''],
      ['Project Information:'],
      ['Name:', planningData.project.name],
      ['Status:', planningData.project.status],
      ['Phase:', planningData.project.phase],
      ['Progress (%):', planningData.project.progress],
      ['Start Date:', planningData.project.start_date || ''],
      ['End Date:', planningData.project.end_date || ''],
      ['Budget:', planningData.project.budget || 0]
    ];
    
    const projectSheet = XLSX.utils.aoa_to_sheet(projectData);
    XLSX.utils.book_append_sheet(workbook, projectSheet, 'Project Overview');
  }

  // Tasks Sheet
  if (planningData.tasks.length > 0) {
    const tasksData = planningData.tasks.map(task => ({
      'Task Title': task.title,
      'Status': task.status,
      'Priority': task.priority,
      'Progress (%)': task.progress || 0,
      'Due Date': task.due_date || '',
      'Start Date': task.start_date || '',
      'Estimated Hours': task.estimated_hours || 0,
      'Actual Hours': task.actual_hours || 0,
      'Category': task.category || '',
      'Created': new Date(task.created_at).toLocaleDateString()
    }));

    const tasksSheet = XLSX.utils.json_to_sheet(tasksData);
    XLSX.utils.book_append_sheet(workbook, tasksSheet, 'Tasks');
  }

  // Milestones Sheet
  if (planningData.milestones.length > 0) {
    const milestonesData = planningData.milestones.map(milestone => ({
      'Title': milestone.title,
      'Description': milestone.description || '',
      'Due Date': new Date(milestone.due_date).toLocaleDateString(),
      'Status': milestone.status,
      'Created': new Date(milestone.created_at).toLocaleDateString()
    }));

    const milestonesSheet = XLSX.utils.json_to_sheet(milestonesData);
    XLSX.utils.book_append_sheet(workbook, milestonesSheet, 'Milestones');
  }

  // Resource Allocations Sheet
  if (planningData.allocations.length > 0) {
    const allocationsData = planningData.allocations.map(allocation => ({
      'Team Name': allocation.team_name,
      'Week Start': allocation.week_start_date,
      'Total Budget': allocation.total_budget,
      'Total Used': allocation.total_used,
      'Allocation Type': allocation.allocation_type || 'weekly',
      'Created': new Date(allocation.created_at).toLocaleDateString()
    }));

    const allocationsSheet = XLSX.utils.json_to_sheet(allocationsData);
    XLSX.utils.book_append_sheet(workbook, allocationsSheet, 'Resource Allocations');
  }

  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

const fetchPlanningData = async (projectId: string) => {
  const [projectResult, tasksResult, milestonesResult, allocationsResult] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single(),
    supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false }),
    // For milestones, we'll use the project data since there's no dedicated milestones table
    supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single(),
    supabase
      .from('resource_allocations')
      .select('*')
      .eq('project_id', projectId)
      .order('week_start_date', { ascending: false })
  ]);

  // Create synthetic milestones similar to useMilestones hook
  const project = projectResult.data;
  const syntheticMilestones = project ? [
    {
      id: `${project.id}-start`,
      project_id: project.id,
      title: `${project.name} - Project Start`,
      description: 'Project kick-off and initial setup',
      due_date: project.start_date || new Date().toISOString(),
      status: project.start_date && new Date(project.start_date) <= new Date() ? 'completed' : 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: `${project.id}-midpoint`,
      project_id: project.id,
      title: `${project.name} - Mid-point Review`,
      description: 'Project progress review and adjustments',
      due_date: project.end_date ? new Date(new Date(project.start_date || Date.now()).getTime() + 
        (new Date(project.end_date).getTime() - new Date(project.start_date || Date.now()).getTime()) / 2).toISOString() 
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: (project.progress || 0) >= 50 ? 'completed' : 'in-progress',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: `${project.id}-end`,
      project_id: project.id,
      title: `${project.name} - Project Completion`,
      description: 'Final deliverables and project closure',
      due_date: project.end_date || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      status: project.status === 'completed' ? 'completed' : 
             project.end_date && new Date(project.end_date) < new Date() ? 'overdue' : 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ] : [];

  return {
    project: projectResult.data,
    tasks: tasksResult.data || [],
    milestones: syntheticMilestones,
    allocations: allocationsResult.data || []
  };
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
