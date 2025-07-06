import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { CRMMetrics } from '@/hooks/useCRMMetrics';

export interface CRMExportData {
  stakeholders: any[];
  interactions: any[];
  estimates: any[];
  bids: any[];
  projects: any[];
}

export const fetchCRMExportData = async (): Promise<CRMExportData> => {
  const [
    { data: stakeholders },
    { data: interactions },
    { data: estimates },
    { data: bids },
    { data: projects }
  ] = await Promise.all([
    supabase
      .from('stakeholders')
      .select('*')
      .eq('stakeholder_type', 'client')
      .order('created_at', { ascending: false }),
    
    supabase
      .from('contact_interactions')
      .select(`
        *,
        stakeholder:stakeholders(contact_person, company_name, stakeholder_type)
      `)
      .order('interaction_date', { ascending: false }),
    
    supabase
      .from('estimates')
      .select(`
        *,
        stakeholder:stakeholders(contact_person, company_name)
      `)
      .order('created_at', { ascending: false }),
    
    supabase
      .from('bids')
      .select(`
        *,
        estimate:estimates(title, stakeholder:stakeholders(contact_person, company_name))
      `)
      .order('created_at', { ascending: false }),
    
    supabase
      .from('projects')
      .select(`
        *,
        client:stakeholders(contact_person, company_name)
      `)
      .order('created_at', { ascending: false })
  ]);

  return {
    stakeholders: stakeholders || [],
    interactions: interactions || [],
    estimates: estimates || [],
    bids: bids || [],
    projects: projects || []
  };
};

export const generatePipelineReport = async (metrics: CRMMetrics): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(4, 133, 234); // Primary color
  doc.text('CRM Pipeline Report', margin, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(51, 51, 51); // Neutral color
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 45);
  doc.text(`Report Period: ${new Date().toLocaleDateString()}`, margin, 52);

  let yPosition = 70;

  // Pipeline Overview
  doc.setFontSize(14);
  doc.setTextColor(4, 133, 234);
  doc.text('Pipeline Overview', margin, yPosition);
  yPosition += 20;

  doc.setFontSize(10);
  doc.setTextColor(51, 51, 51);
  
  // Pipeline stages
  const stages = [
    { name: 'Active Leads', count: metrics.pipelineStats.leads.count, value: metrics.pipelineStats.leads.value },
    { name: 'Estimates', count: metrics.pipelineStats.estimates.count, value: metrics.pipelineStats.estimates.value },
    { name: 'Bids', count: metrics.pipelineStats.bids.count, value: metrics.pipelineStats.bids.value },
    { name: 'Projects', count: metrics.pipelineStats.projects.count, value: metrics.pipelineStats.projects.value }
  ];

  stages.forEach((stage, index) => {
    doc.text(`${index + 1}. ${stage.name}:`, margin, yPosition);
    doc.text(`Count: ${stage.count}`, margin + 10, yPosition + 7);
    doc.text(`Value: $${stage.value.toLocaleString()}`, margin + 10, yPosition + 14);
    yPosition += 25;
  });

  // Conversion Metrics
  yPosition += 10;
  doc.setFontSize(14);
  doc.setTextColor(4, 133, 234);
  doc.text('Conversion Metrics', margin, yPosition);
  yPosition += 20;

  doc.setFontSize(10);
  doc.setTextColor(51, 51, 51);
  doc.text(`Overall Conversion Rate: ${metrics.conversionRate.toFixed(1)}%`, margin, yPosition);
  yPosition += 10;
  doc.text(`Total Pipeline Value: $${metrics.pipelineValue.toLocaleString()}`, margin, yPosition);
  yPosition += 10;
  doc.text(`Monthly Revenue: $${metrics.monthlyRevenue.toLocaleString()}`, margin, yPosition);
  yPosition += 10;
  doc.text(`Upcoming Follow-ups: ${metrics.upcomingFollowUps}`, margin, yPosition);

  // Performance Summary
  yPosition += 20;
  doc.setFontSize(14);
  doc.setTextColor(4, 133, 234);
  doc.text('Performance Summary', margin, yPosition);
  yPosition += 20;

  doc.setFontSize(8);
  doc.setTextColor(51, 51, 51);
  
  // Calculate conversion rates between stages
  const leadToEstimate = metrics.pipelineStats.leads.count > 0 
    ? (metrics.pipelineStats.estimates.count / metrics.pipelineStats.leads.count * 100).toFixed(1)
    : '0';
  const estimateToBid = metrics.pipelineStats.estimates.count > 0 
    ? (metrics.pipelineStats.bids.count / metrics.pipelineStats.estimates.count * 100).toFixed(1)
    : '0';
  const bidToProject = metrics.pipelineStats.bids.count > 0 
    ? (metrics.pipelineStats.projects.count / metrics.pipelineStats.bids.count * 100).toFixed(1)
    : '0';

  doc.text(`• Lead to Estimate Conversion: ${leadToEstimate}%`, margin, yPosition);
  yPosition += 10;
  doc.text(`• Estimate to Bid Conversion: ${estimateToBid}%`, margin, yPosition);
  yPosition += 10;
  doc.text(`• Bid to Project Conversion: ${bidToProject}%`, margin, yPosition);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Generated by ConstructPro CRM', margin, doc.internal.pageSize.height - 20);

  doc.save(`CRM_Pipeline_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateActivityReport = async (): Promise<void> => {
  const data = await fetchCRMExportData();
  
  const workbook = XLSX.utils.book_new();

  // Activity Report Sheet
  const activityData = data.interactions.map(interaction => ({
    'Date': interaction.interaction_date,
    'Stakeholder': interaction.stakeholder?.company_name || interaction.stakeholder?.contact_person || 'Unknown',
    'Type': interaction.interaction_type?.replace('_', ' ').toUpperCase() || 'Unknown',
    'Subject': interaction.subject || 'No subject',
    'Outcome': interaction.outcome || 'Not specified',
    'Duration (min)': interaction.duration_minutes || 0,
    'Follow-up Required': interaction.follow_up_required ? 'Yes' : 'No',
    'Follow-up Date': interaction.follow_up_date || 'Not scheduled',
    'Notes': interaction.notes || 'No notes'
  }));

  const activitySheet = XLSX.utils.json_to_sheet(activityData);
  XLSX.utils.book_append_sheet(workbook, activitySheet, 'Activity Report');

  // Summary Sheet
  const summary = [
    ['CRM Activity Report Summary'],
    ['Generated on:', new Date().toLocaleDateString()],
    [''],
    ['Total Interactions:', data.interactions.length],
    ['Unique Stakeholders:', new Set(data.interactions.map(i => i.stakeholder_id)).size],
    ['Follow-ups Required:', data.interactions.filter(i => i.follow_up_required).length],
    [''],
    ['Interaction Types:'],
    ...Object.entries(
      data.interactions.reduce((acc, interaction) => {
        const type = interaction.interaction_type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([type, count]) => [type.replace('_', ' ').toUpperCase(), count])
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summary);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  XLSX.writeFile(workbook, `CRM_Activity_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const generatePerformanceReport = async (metrics: CRMMetrics): Promise<void> => {
  const data = await fetchCRMExportData();
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(4, 133, 234);
  doc.text('CRM Performance Report', margin, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(51, 51, 51);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 45);
  
  let yPosition = 65;

  // Key Performance Indicators
  doc.setFontSize(14);
  doc.setTextColor(4, 133, 234);
  doc.text('Key Performance Indicators', margin, yPosition);
  yPosition += 20;

  doc.setFontSize(10);
  doc.setTextColor(51, 51, 51);

  const totalOpportunities = metrics.pipelineStats.estimates.count + metrics.pipelineStats.bids.count;
  const averageDealSize = totalOpportunities > 0 
    ? (metrics.pipelineStats.estimates.value + metrics.pipelineStats.bids.value) / totalOpportunities 
    : 0;
  const pipelineVelocity = metrics.activeLeads > 0 
    ? (metrics.pipelineStats.projects.count / metrics.activeLeads * 30)
    : 0;

  const kpis = [
    { label: 'Total Pipeline Value', value: `$${metrics.pipelineValue.toLocaleString()}` },
    { label: 'Conversion Rate', value: `${metrics.conversionRate.toFixed(1)}%` },
    { label: 'Active Leads', value: metrics.activeLeads.toString() },
    { label: 'Monthly Revenue', value: `$${metrics.monthlyRevenue.toLocaleString()}` },
    { label: 'Average Deal Size', value: `$${averageDealSize.toLocaleString()}` },
    { label: 'Pipeline Velocity', value: `${pipelineVelocity.toFixed(1)} deals/month` }
  ];

  kpis.forEach((kpi, index) => {
    doc.text(`${kpi.label}: ${kpi.value}`, margin, yPosition);
    yPosition += 12;
  });

  // Pipeline Health
  yPosition += 15;
  doc.setFontSize(14);
  doc.setTextColor(4, 133, 234);
  doc.text('Pipeline Health Analysis', margin, yPosition);
  yPosition += 20;

  doc.setFontSize(10);
  doc.setTextColor(51, 51, 51);

  // Health indicators
  const healthIndicators = [
    { metric: 'Lead Quality', status: metrics.conversionRate > 20 ? 'Good' : metrics.conversionRate > 10 ? 'Average' : 'Needs Improvement' },
    { metric: 'Pipeline Balance', status: totalOpportunities > 5 ? 'Healthy' : 'Needs Growth' },
    { metric: 'Follow-up Management', status: metrics.upcomingFollowUps < 10 ? 'Good' : 'Needs Attention' }
  ];

  healthIndicators.forEach(indicator => {
    doc.text(`• ${indicator.metric}: ${indicator.status}`, margin, yPosition);
    yPosition += 10;
  });

  // Recent Activity Summary
  yPosition += 15;
  doc.setFontSize(14);
  doc.setTextColor(4, 133, 234);
  doc.text('Recent Activity Summary', margin, yPosition);
  yPosition += 20;

  doc.setFontSize(8);
  doc.setTextColor(51, 51, 51);

  metrics.recentActivity.slice(0, 5).forEach(activity => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }
    doc.text(`• ${activity.title} - ${new Date(activity.date).toLocaleDateString()}`, margin, yPosition);
    yPosition += 8;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Generated by ConstructPro CRM', margin, doc.internal.pageSize.height - 20);

  doc.save(`CRM_Performance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};