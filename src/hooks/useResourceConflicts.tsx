
import { useState, useEffect } from 'react';
import { Task } from '@/types/database';
import { calculateTaskDatesFromEstimate } from '@/components/planning/gantt/utils/dateUtils';

interface ResourceConflict {
  id: string;
  taskIds: string[];
  type: 'personnel' | 'equipment' | 'skill';
  severity: 'high' | 'medium' | 'low';
  description: string;
  date: Date;
}

export const useResourceConflicts = (tasks: Task[]) => {
  const [conflicts, setConflicts] = useState<ResourceConflict[]>([]);

  useEffect(() => {
    const detectConflicts = () => {
      const detectedConflicts: ResourceConflict[] = [];

      // Check for overlapping tasks requiring same skills or assignees
      tasks.forEach((task1, i) => {
        tasks.slice(i + 1).forEach(task2 => {
          const { calculatedStartDate: start1, calculatedEndDate: end1 } = calculateTaskDatesFromEstimate(task1);
          const { calculatedStartDate: start2, calculatedEndDate: end2 } = calculateTaskDatesFromEstimate(task2);
          
          // Check for date overlap
          const hasOverlap = start1 <= end2 && start2 <= end1;
          
          if (hasOverlap) {
            // Check for same assignee conflicts
            if (task1.assignee_id && task2.assignee_id && task1.assignee_id === task2.assignee_id) {
              detectedConflicts.push({
                id: `assignee-conflict-${task1.id}-${task2.id}`,
                taskIds: [task1.id, task2.id],
                type: 'personnel',
                severity: 'high',
                description: 'Same person assigned to overlapping tasks',
                date: start1 > start2 ? start1 : start2
              });
            }

            // Check for skill conflicts (if both tasks have required skills)
            if (task1.required_skills && task2.required_skills) {
              const sharedSkills = task1.required_skills.filter(skill => 
                task2.required_skills?.includes(skill)
              );
              
              if (sharedSkills.length > 0) {
                detectedConflicts.push({
                  id: `skill-conflict-${task1.id}-${task2.id}`,
                  taskIds: [task1.id, task2.id],
                  type: 'skill',
                  severity: sharedSkills.length > 1 ? 'high' : 'medium',
                  description: `Skill conflict: ${sharedSkills.join(', ')}`,
                  date: start1 > start2 ? start1 : start2
                });
              }
            }
          }
        });
      });

      setConflicts(detectedConflicts);
    };

    detectConflicts();
  }, [tasks]);

  return { conflicts };
};
