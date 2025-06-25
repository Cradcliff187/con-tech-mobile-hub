
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { StakeholderAssignment, CreateAssignmentData } from './stakeholders/types';
import * as assignmentService from './stakeholders/assignmentService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useStakeholderAssignments = () => {
  const [assignments, setAssignments] = useState<StakeholderAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Real-time subscription setup
  useEffect(() => {
    if (!user) return;

    console.log('Setting up stakeholder assignments real-time subscription');

    const handleAssignmentChange = async () => {
      try {
        const data = await assignmentService.fetchAssignments();
        setAssignments(data);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching stakeholder assignments:', error);
        setLoading(false);
      }
    };

    // Initial fetch
    handleAssignmentChange();

    // Set up real-time subscription
    const channel = supabase
      .channel('stakeholder-assignments-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'stakeholder_assignments' },
        () => handleAssignmentChange()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'stakeholders' },
        () => handleAssignmentChange()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => handleAssignmentChange()
      )
      .subscribe();

    return () => {
      console.log('Cleaning up stakeholder assignments subscription');
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchAssignments = async (projectId?: string) => {
    // Real-time subscription handles automatic updates
    console.log('Manual fetch called - real-time subscription should handle updates automatically');
  };

  const createAssignment = async (assignmentData: CreateAssignmentData) => {
    try {
      const newAssignment = await assignmentService.createAssignment(assignmentData);
      
      // Real-time subscription will handle state update
      toast({
        title: "Success",
        description: "Stakeholder assigned successfully"
      });
      return { data: newAssignment, error: null };
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to assign stakeholder",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateAssignment = async (id: string, updates: Partial<StakeholderAssignment>) => {
    try {
      const updatedAssignment = await assignmentService.updateAssignment(id, updates);
      
      // Real-time subscription will handle state update
      toast({
        title: "Success",
        description: "Assignment updated successfully"
      });
      return { data: updatedAssignment, error: null };
    } catch (error: any) {
      console.error('Error updating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateDailyHours = async (id: string, date: string, hours: number) => {
    try {
      // Get current assignment
      const assignment = assignments.find(a => a.id === id);
      if (!assignment) throw new Error('Assignment not found');

      const updatedAssignment = await assignmentService.updateDailyHours(id, date, hours, assignment);
      
      // Real-time subscription will handle state update
      toast({
        title: "Success",
        description: "Daily hours updated successfully"
      });
      return { data: updatedAssignment, error: null };
    } catch (error: any) {
      console.error('Error updating daily hours:', error);
      toast({
        title: "Error",
        description: "Failed to update daily hours",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  // Manual refetch function for compatibility
  const refetch = (projectId?: string) => {
    // Real-time subscription handles automatic updates, but this is kept for compatibility
    console.log('Manual refetch called - real-time subscription should handle updates automatically');
  };

  return {
    assignments,
    loading,
    createAssignment,
    updateAssignment,
    updateDailyHours,
    refetch
  };
};

// Export types for backward compatibility
export type { StakeholderAssignment } from './stakeholders/types';
