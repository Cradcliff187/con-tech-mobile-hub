
import { Project, Task, TeamMember } from '@/types/database';
import { Stakeholder } from '@/hooks/useStakeholders';

/**
 * Get intelligent task defaults based on project context
 */
export const getTaskDefaults = (project: Project): Partial<Task> => ({
  task_type: project.phase === 'punch_list' ? 'punch_list' : 'regular',
  priority: project.phase === 'closeout' ? 'high' : 'medium',
  status: 'not-started',
  required_skills: project.phase === 'punch_list' 
    ? ['inspection', 'quality control'] 
    : project.phase === 'active' 
    ? ['construction', 'safety'] 
    : [],
  estimated_hours: project.phase === 'punch_list' ? 2 : 8,
  punch_list_category: project.phase === 'punch_list' ? 'other' : undefined,
  inspection_status: project.phase === 'punch_list' ? 'pending' : undefined
});

/**
 * Get intelligent assignment defaults based on stakeholder and project context
 */
export const getAssignmentDefaults = (stakeholder: Stakeholder, project: Project) => ({
  hourly_rate: getDefaultHourlyRate(stakeholder.stakeholder_type),
  start_date: new Date().toISOString().split('T')[0],
  end_date: project.end_date || undefined,
  role: inferRoleFromSkills(stakeholder.specialties || [], project.phase),
  status: 'assigned'
});

/**
 * Get default hourly rates based on stakeholder type
 */
export const getDefaultHourlyRate = (stakeholderType: string): number => {
  const rateMap: Record<string, number> = {
    'employee': 50,
    'subcontractor': 75,
    'vendor': 65,
    'client': 0
  };
  
  return rateMap[stakeholderType] || 60;
};

/**
 * Infer appropriate role based on skills and project phase
 */
const inferRoleFromSkills = (skills: string[], phase: string): string => {
  if (!skills || skills.length === 0) {
    return getDefaultRoleForPhase(phase);
  }

  // Phase-specific role inference
  if (phase === 'punch_list' || phase === 'closeout') {
    if (skills.some(skill => 
      ['inspection', 'quality control', 'qa', 'qc'].includes(skill.toLowerCase())
    )) {
      return 'Quality Inspector';
    }
    if (skills.some(skill => 
      ['project management', 'supervision', 'coordination'].includes(skill.toLowerCase())
    )) {
      return 'Project Coordinator';
    }
    return 'Inspector';
  }

  // Active phase role inference
  if (phase === 'active') {
    if (skills.some(skill => 
      ['electrical', 'electrician', 'wiring'].includes(skill.toLowerCase())
    )) {
      return 'Electrician';
    }
    if (skills.some(skill => 
      ['plumbing', 'plumber', 'pipes'].includes(skill.toLowerCase())
    )) {
      return 'Plumber';
    }
    if (skills.some(skill => 
      ['carpentry', 'carpenter', 'framing', 'woodwork'].includes(skill.toLowerCase())
    )) {
      return 'Carpenter';
    }
    if (skills.some(skill => 
      ['hvac', 'heating', 'cooling', 'ventilation'].includes(skill.toLowerCase())
    )) {
      return 'HVAC Technician';
    }
    if (skills.some(skill => 
      ['concrete', 'masonry', 'foundation'].includes(skill.toLowerCase())
    )) {
      return 'Concrete Worker';
    }
    if (skills.some(skill => 
      ['painting', 'painter', 'finishing'].includes(skill.toLowerCase())
    )) {
      return 'Painter';
    }
    if (skills.some(skill => 
      ['roofing', 'roofer', 'shingles'].includes(skill.toLowerCase())
    )) {
      return 'Roofer';
    }
    if (skills.some(skill => 
      ['supervision', 'management', 'coordination'].includes(skill.toLowerCase())
    )) {
      return 'Site Supervisor';
    }
    return 'Construction Worker';
  }

  // Planning phase role inference
  if (phase === 'planning') {
    if (skills.some(skill => 
      ['project management', 'planning', 'coordination'].includes(skill.toLowerCase())
    )) {
      return 'Project Manager';
    }
    if (skills.some(skill => 
      ['engineering', 'design', 'architect'].includes(skill.toLowerCase())
    )) {
      return 'Design Engineer';
    }
    if (skills.some(skill => 
      ['estimation', 'cost analysis', 'budgeting'].includes(skill.toLowerCase())
    )) {
      return 'Estimator';
    }
    return 'Project Coordinator';
  }

  return getDefaultRoleForPhase(phase);
};

/**
 * Get default role for project phase when no skills match
 */
const getDefaultRoleForPhase = (phase: string): string => {
  const phaseRoleMap: Record<string, string> = {
    'planning': 'Project Coordinator',
    'active': 'Construction Worker',
    'punch_list': 'Inspector',
    'closeout': 'Project Coordinator',
    'completed': 'Project Coordinator'
  };
  
  return phaseRoleMap[phase] || 'General Worker';
};

/**
 * Get intelligent team member defaults for resource allocation
 */
export const getTeamMemberDefaults = (
  stakeholder: Stakeholder, 
  project: Project,
  weekStartDate: string
): Partial<TeamMember> => ({
  name: stakeholder.contact_person || stakeholder.company_name || 'Unknown',
  role: inferRoleFromSkills(stakeholder.specialties || [], project.phase),
  hours_allocated: project.phase === 'punch_list' ? 20 : 40,
  hours_used: 0,
  cost_per_hour: getDefaultHourlyRate(stakeholder.stakeholder_type),
  availability: 100,
  tasks: []
});

/**
 * Get default categories based on project phase
 */
export const getDefaultCategories = (phase: string): string[] => {
  const categoryMap: Record<string, string[]> = {
    'planning': ['Design', 'Permits', 'Planning', 'Documentation'],
    'active': ['Foundation', 'Framing', 'Electrical', 'Plumbing', 'HVAC', 'Finishing'],
    'punch_list': ['Touch-ups', 'Corrections', 'Final Inspections', 'Cleanup'],
    'closeout': ['Documentation', 'Handover', 'Training', 'Warranty'],
    'completed': ['Maintenance', 'Support', 'Follow-up']
  };
  
  return categoryMap[phase] || ['General'];
};

/**
 * Get default required skills based on task category and project phase
 */
export const getDefaultRequiredSkills = (category: string, phase: string): string[] => {
  const skillMap: Record<string, string[]> = {
    // Construction categories
    'Foundation': ['concrete', 'excavation', 'surveying'],
    'Framing': ['carpentry', 'blueprint reading', 'measuring'],
    'Electrical': ['electrical', 'wiring', 'safety'],
    'Plumbing': ['plumbing', 'pipe fitting', 'water systems'],
    'HVAC': ['hvac', 'ductwork', 'climate control'],
    'Finishing': ['finishing', 'attention to detail', 'quality control'],
    
    // Punch list categories
    'Touch-ups': ['finishing', 'painting', 'quality control'],
    'Corrections': ['problem solving', 'repair', 'quality control'],
    'Final Inspections': ['inspection', 'quality control', 'documentation'],
    'Cleanup': ['cleaning', 'organization', 'safety'],
    
    // Planning categories
    'Design': ['design', 'cad', 'engineering'],
    'Permits': ['regulatory knowledge', 'documentation', 'compliance'],
    'Planning': ['project management', 'scheduling', 'coordination'],
    
    // Default by phase
    'punch_list_default': ['inspection', 'quality control'],
    'active_default': ['construction', 'safety'],
    'planning_default': ['planning', 'coordination'],
    'closeout_default': ['documentation', 'organization']
  };
  
  return skillMap[category] || skillMap[`${phase}_default`] || [];
};

/**
 * Get intelligent priority based on project phase and task type
 */
export const getDefaultPriority = (phase: string, category?: string): Task['priority'] => {
  if (phase === 'closeout' || phase === 'punch_list') {
    return 'high';
  }
  
  if (category && ['Foundation', 'Safety', 'Permits'].includes(category)) {
    return 'high';
  }
  
  if (phase === 'planning') {
    return 'medium';
  }
  
  return 'medium';
};
