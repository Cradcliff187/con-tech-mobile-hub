
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Conflict {
  id: string;
  title: string;
  description: string;
  affectedProjects: string[];
}

export const usePersonnelConflictResolution = (
  conflict: Conflict,
  onResolved: () => void,
  onClose: () => void
) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newHours, setNewHours] = useState<number>(0);
  const [extensionDays, setExtensionDays] = useState<number>(0);
  const [reassignmentNotes, setReassignmentNotes] = useState('');
  const { toast } = useToast();

  const handleResolve = async () => {
    if (!selectedOption) {
      toast({
        title: "Error",
        description: "Please select a resolution option",
        variant: "destructive"
      });
      return;
    }

    console.warn('⚠️ MIGRATION NOTICE: Using stakeholder assignments instead of team_members for conflict resolution');

    setIsSubmitting(true);

    try {
      switch (selectedOption) {
        case 'reassign':
          // Update stakeholder assignments instead of team_members
          console.log('Reassigning tasks using stakeholder assignments:', reassignmentNotes);
          
          // Find stakeholder assignments for the conflicted employee
          const { data: assignments, error: fetchError } = await supabase
            .from('stakeholder_assignments')
            .select('*')
            .in('project_id', conflict.affectedProjects);

          if (fetchError) throw fetchError;

          // Update assignment notes with reassignment information
          if (assignments && assignments.length > 0) {
            const { error: updateError } = await supabase
              .from('stakeholder_assignments')
              .update({
                notes: `REASSIGNED: ${reassignmentNotes}`,
                status: 'reassigned'
              })
              .eq('id', assignments[0].id);

            if (updateError) throw updateError;
          }
          break;
          
        case 'extend':
          // Update project end dates
          const { error: projectError } = await supabase
            .from('projects')
            .update({
              end_date: new Date(Date.now() + extensionDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            })
            .in('name', conflict.affectedProjects);

          if (projectError) throw projectError;
          break;

        case 'reduce':
          // Update stakeholder assignments to reduce hours instead of team_members
          const { error: allocationError } = await supabase
            .from('stakeholder_assignments')
            .update({
              total_hours: newHours
            })
            .in('project_id', conflict.affectedProjects);

          if (allocationError) throw allocationError;
          break;
      }

      toast({
        title: "Conflict Resolved",
        description: "Personnel overallocation has been resolved using the new assignment system"
      });

      onResolved();
      onClose();
    } catch (error) {
      console.error('Error resolving conflict:', error);
      toast({
        title: "Error",
        description: "Failed to resolve conflict",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedOption,
    setSelectedOption,
    isSubmitting,
    newHours,
    setNewHours,
    extensionDays,
    setExtensionDays,
    reassignmentNotes,
    setReassignmentNotes,
    handleResolve
  };
};
