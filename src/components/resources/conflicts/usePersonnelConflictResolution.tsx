
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

    setIsSubmitting(true);

    try {
      switch (selectedOption) {
        case 'reassign':
          // In a real implementation, this would reassign specific tasks
          // For now, we'll log the action and update allocation records
          console.log('Reassigning tasks:', reassignmentNotes);
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
          // Update resource allocations to reduce hours
          const { error: allocationError } = await supabase
            .from('team_members')
            .update({
              hours_allocated: newHours
            })
            .eq('name', conflict.title.split(' ')[0]); // Extract member name from title

          if (allocationError) throw allocationError;
          break;
      }

      toast({
        title: "Conflict Resolved",
        description: "Personnel overallocation has been resolved"
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
