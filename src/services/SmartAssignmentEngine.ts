
import { Stakeholder } from '@/hooks/useStakeholders';

export interface AssignmentSuggestion {
  stakeholder: Stakeholder;
  score: number;
  reasons: string[];
  warnings: string[];
  skillMatch: number;
  availability: number;
  performance: number;
  workloadStatus: 'available' | 'moderate' | 'nearly_full' | 'overallocated';
}

export interface AssignmentCriteria {
  requiredSkills: string[];
  projectId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedHours?: number;
  dueDate?: string;
  taskType?: 'regular' | 'punch_list';
}

export class SmartAssignmentEngine {
  private static instance: SmartAssignmentEngine;

  public static getInstance(): SmartAssignmentEngine {
    if (!SmartAssignmentEngine.instance) {
      SmartAssignmentEngine.instance = new SmartAssignmentEngine();
    }
    return SmartAssignmentEngine.instance;
  }

  public generateSuggestions(
    stakeholders: Stakeholder[],
    workloadData: any[],
    criteria: AssignmentCriteria
  ): AssignmentSuggestion[] {
    // Filter to assignable stakeholders only
    const assignableStakeholders = stakeholders.filter(s => 
      ['employee', 'subcontractor', 'vendor'].includes(s.stakeholder_type) && 
      s.status === 'active'
    );

    const suggestions = assignableStakeholders.map(stakeholder => {
      const workload = workloadData.find(w => w.stakeholder_id === stakeholder.id);
      
      return {
        stakeholder,
        ...this.calculateSuggestionScore(stakeholder, workload, criteria)
      };
    });

    // Sort by score (highest first)
    return suggestions.sort((a, b) => b.score - a.score);
  }

  private calculateSuggestionScore(
    stakeholder: Stakeholder,
    workload: any,
    criteria: AssignmentCriteria
  ): Omit<AssignmentSuggestion, 'stakeholder'> {
    const skillMatch = this.calculateSkillMatch(stakeholder.specialties || [], criteria.requiredSkills);
    const availability = this.calculateAvailability(workload);
    const performance = this.calculatePerformance(stakeholder);
    
    // Weighted scoring
    const weights = {
      skillMatch: 0.4,
      availability: 0.35,
      performance: 0.25
    };

    const score = (
      skillMatch * weights.skillMatch +
      availability * weights.availability +
      performance * weights.performance
    );

    const reasons = this.generateReasons(skillMatch, availability, performance, criteria);
    const warnings = this.generateWarnings(workload, criteria);
    const workloadStatus = this.getWorkloadStatus(workload);

    return {
      score: Math.round(score),
      reasons,
      warnings,
      skillMatch: Math.round(skillMatch),
      availability: Math.round(availability),
      performance: Math.round(performance),
      workloadStatus
    };
  }

  private calculateSkillMatch(stakeholderSkills: string[], requiredSkills: string[]): number {
    if (requiredSkills.length === 0) return 100;
    
    const matchingSkills = requiredSkills.filter(skill => 
      stakeholderSkills.some(sSkill => 
        sSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(sSkill.toLowerCase())
      )
    );

    return (matchingSkills.length / requiredSkills.length) * 100;
  }

  private calculateAvailability(workload: any): number {
    if (!workload) return 100; // No workload data means fully available
    
    const utilization = workload.utilization_percentage || 0;
    
    if (utilization >= 100) return 0;
    if (utilization >= 90) return 20;
    if (utilization >= 80) return 40;
    if (utilization >= 60) return 70;
    if (utilization >= 40) return 85;
    return 100;
  }

  private calculatePerformance(stakeholder: Stakeholder): number {
    // Use stakeholder rating if available, otherwise default to neutral
    const rating = stakeholder.rating || 3.5;
    return Math.min(100, (rating / 5) * 100);
  }

  private generateReasons(
    skillMatch: number,
    availability: number,
    performance: number,
    criteria: AssignmentCriteria
  ): string[] {
    const reasons: string[] = [];

    if (skillMatch >= 80) {
      reasons.push('Excellent skill match for required expertise');
    } else if (skillMatch >= 60) {
      reasons.push('Good skill match with relevant experience');
    } else if (skillMatch > 0) {
      reasons.push('Partial skill match - may need additional support');
    }

    if (availability >= 80) {
      reasons.push('High availability with capacity for new work');
    } else if (availability >= 50) {
      reasons.push('Moderate availability');
    }

    if (performance >= 80) {
      reasons.push('Strong performance history');
    } else if (performance >= 60) {
      reasons.push('Reliable track record');
    }

    if (criteria.priority === 'critical' && availability < 50) {
      reasons.push('Consider workload impact for critical task');
    }

    return reasons;
  }

  private generateWarnings(workload: any, criteria: AssignmentCriteria): string[] {
    const warnings: string[] = [];

    if (workload?.is_overallocated) {
      warnings.push('Already overallocated - assignment may impact other projects');
    }

    if (workload?.utilization_percentage >= 90) {
      warnings.push('Near capacity - monitor for potential delays');
    }

    if (criteria.priority === 'critical' && workload?.utilization_percentage >= 80) {
      warnings.push('High utilization may affect critical task delivery');
    }

    return warnings;
  }

  private getWorkloadStatus(workload: any): AssignmentSuggestion['workloadStatus'] {
    if (!workload) return 'available';
    
    const utilization = workload.utilization_percentage || 0;
    
    if (utilization >= 100) return 'overallocated';
    if (utilization >= 80) return 'nearly_full';
    if (utilization >= 50) return 'moderate';
    return 'available';
  }
}
