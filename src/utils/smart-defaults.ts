import { Project, Task, TeamMember, LifecycleStatus } from '@/types/database';
import { Stakeholder } from '@/hooks/useStakeholders';
import { getLifecycleStatus, getTaskDefaultsForLifecycleStatus } from './lifecycle-status';

/**
 * Get intelligent task defaults based on project lifecycle status
 */
export const getTaskDefaults = (project: Project): Partial<Task> => {
  const lifecycleStatus = getLifecycleStatus(project);
  return getTaskDefaultsForLifecycleStatus(lifecycleStatus);
};

/**
 * Get intelligent assignment defaults based on stakeholder and project context
 */
export const getAssignmentDefaults = (stakeholder: Stakeholder, project: Project) => {
  const lifecycleStatus = getLifecycleStatus(project);
  
  return {
    hourly_rate: getDefaultHourlyRate(stakeholder.stakeholder_type),
    start_date: new Date().toISOString().split('T')[0],
    end_date: project.end_date || undefined,
    role: inferRoleFromSkills(stakeholder.specialties || [], lifecycleStatus),
    status: 'assigned'
  };
};

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
 * Get default required skills based on category and project phase
 */
export const getDefaultRequiredSkills = (category?: string, phase?: string): string[] => {
  if (!category) return [];

  const categorySkills: Record<string, string[]> = {
    'Safety': ['safety protocols', 'hazmat handling', 'first aid'],
    'Quality Control': ['inspection', 'quality assurance', 'documentation'],
    'Installation': ['installation', 'assembly', 'technical skills'],
    'Electrical': ['electrical work', 'wiring', 'circuit testing'],
    'Plumbing': ['plumbing', 'pipe fitting', 'water systems'],
    'HVAC': ['hvac systems', 'ventilation', 'climate control'],
    'Carpentry': ['carpentry', 'woodwork', 'framing'],
    'Concrete': ['concrete work', 'masonry', 'foundation'],
    'Painting': ['painting', 'surface preparation', 'finishing'],
    'Roofing': ['roofing', 'weatherproofing', 'height work']
  };

  return categorySkills[category] || [];
};

/**
 * Get default priority based on project phase and category
 */
export const getDefaultPriority = (phase?: string, category?: string): 'low' | 'medium' | 'high' | 'critical' => {
  // High priority for safety and quality control
  if (category === 'Safety' || category === 'Quality Control') {
    return 'high';
  }

  // Phase-based priorities
  switch (phase) {
    case 'punch_list':
    case 'closeout':
      return 'high';
    case 'active':
      return category === 'Installation' || category === 'Electrical' || category === 'Plumbing' ? 'high' : 'medium';
    case 'planning':
      return 'medium';
    default:
      return 'medium';
  }
};

/**
 * Infer appropriate role based on skills and lifecycle status
 */
const inferRoleFromSkills = (skills: string[], lifecycleStatus: LifecycleStatus): string => {
  if (!skills || skills.length === 0) {
    return getDefaultRoleForLifecycleStatus(lifecycleStatus);
  }

  // Lifecycle-specific role inference
  if (lifecycleStatus === 'punch_list_phase' || lifecycleStatus === 'project_closeout') {
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

  // Construction active phase role inference
  if (lifecycleStatus === 'construction_active') {
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
  if (lifecycleStatus === 'pre_planning' || lifecycleStatus === 'planning_active') {
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

  return getDefaultRoleForLifecycleStatus(lifecycleStatus);
};

/**
 * Get default role for lifecycle status when no skills match
 */
const getDefaultRoleForLifecycleStatus = (lifecycleStatus: LifecycleStatus): string => {
  const lifecycleRoleMap: Record<LifecycleStatus, string> = {
    'pre_planning': 'Project Coordinator',
    'planning_active': 'Project Coordinator',
    'construction_active': 'Construction Worker',
    'construction_hold': 'Construction Worker',
    'punch_list_phase': 'Inspector',
    'project_closeout': 'Project Coordinator',
    'project_completed': 'Project Coordinator',
    'project_cancelled': 'Project Coordinator'
  };

  return lifecycleRoleMap[lifecycleStatus] || 'Construction Worker';
};
