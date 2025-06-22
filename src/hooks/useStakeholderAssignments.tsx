
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { StakeholderAssignment, CreateAssignmentData } from './stakeholders/types';
import * as assignmentService from './stakeholders/assignmentService';

export const useStakeholderAssignments = () => {
  const [assignments, setAssignments] = useState<StakeholderAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAssignments = async (projectId?: string) => {
    setLoading(true);
    try {
      const data = await assignmentService.fetchAssignments(projectId);
      setAssignments(data);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stakeholder assignments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async (assignmentData: CreateAssignmentData) => {
    try {
      const newAssignment = await assignmentService.createAssignment(assignmentData);
      
      setAssignments(prev => [newAssignment, ...prev]);
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
      
      setAssignments(prev => prev.map(a => a.id === id ? updatedAssignment : a));
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
      
      setAssignments(prev => prev.map(a => a.id === id ? updatedAssignment : a));
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

  useEffect(() => {
    fetchAssignments();
  }, []);

  return {
    assignments,
    loading,
    createAssignment,
    updateAssignment,
    updateDailyHours,
    refetch: fetchAssignments
  };
};

// Export types for backward compatibility
export type { StakeholderAssignment } from './stakeholders/types';
