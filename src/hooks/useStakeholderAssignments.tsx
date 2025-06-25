
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { StakeholderAssignment, CreateAssignmentData } from './stakeholders/types';
import * as assignmentService from './stakeholders/assignmentService';
import { useAuth } from '@/hooks/useAuth';
import { useImprovedStakeholderAssignmentSubscription } from '@/hooks/stakeholders/useImprovedStakeholderAssignmentSubscription';

// Re-export the type for backward compatibility
export type { StakeholderAssignment } from './stakeholders/types';

export const useStakeholderAssignments = (projectId?: string) => {
  const [assignments, setAssignments] = useState<StakeholderAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Create stable callback for subscription
  const stableAssignmentsUpdate = useCallback((updatedAssignments: StakeholderAssignment[]) => {
    setAssignments(updatedAssignments);
    setLoading(false);
  }, []);

  // Use improved real-time subscription
  useImprovedStakeholderAssignmentSubscription({
    user,
    onAssignmentsUpdate: stableAssignmentsUpdate,
    projectId
  });

  const createAssignment = useCallback(async (assignmentData: CreateAssignmentData) => {
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
        description: error.message || "Failed to create assignment",
        variant: "destructive"
      });
      return { data: null, error: error.message };
    }
  }, [toast]);

  const updateAssignment = useCallback(async (id: string, updates: Partial<StakeholderAssignment>) => {
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
        description: error.message || "Failed to update assignment",
        variant: "destructive"
      });
      return { data: null, error: error.message };
    }
  }, [toast]);

  const deleteAssignment = useCallback(async (id: string) => {
    try {
      await assignmentService.deleteAssignment(id);
      
      // Real-time subscription will handle state update
      toast({
        title: "Success",
        description: "Assignment deleted successfully"
      });
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete assignment",
        variant: "destructive"
      });
      return { error: error.message };
    }
  }, [toast]);

  const bulkCreateAssignments = useCallback(async (assignmentsData: CreateAssignmentData[]) => {
    try {
      const newAssignments = await assignmentService.bulkCreateAssignments(assignmentsData);
      
      // Real-time subscription will handle state update
      toast({
        title: "Success",
        description: `${newAssignments.length} assignments created successfully`
      });
      return { data: newAssignments, error: null };
    } catch (error: any) {
      console.error('Error creating bulk assignments:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create assignments",
        variant: "destructive"
      });
      return { data: null, error: error.message };
    }
  }, [toast]);

  const getAssignmentsByStakeholder = useCallback((stakeholderId: string) => {
    return assignments.filter(assignment => assignment.stakeholder_id === stakeholderId);
  }, [assignments]);

  const getAssignmentsByProject = useCallback((projectId: string) => {
    return assignments.filter(assignment => assignment.project_id === projectId);
  }, [assignments]);

  const getTotalCostByProject = useCallback((projectId: string) => {
    const projectAssignments = getAssignmentsByProject(projectId);
    return projectAssignments.reduce((total, assignment) => {
      return total + (assignment.total_cost || 0);
    }, 0);
  }, [getAssignmentsByProject]);

  const getTotalHoursByStakeholder = useCallback((stakeholderId: string) => {
    const stakeholderAssignments = getAssignmentsByStakeholder(stakeholderId);
    return stakeholderAssignments.reduce((total, assignment) => {
      return total + (assignment.total_hours || 0);
    }, 0);
  }, [getAssignmentsByStakeholder]);

  return {
    assignments,
    loading,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    bulkCreateAssignments,
    getAssignmentsByStakeholder,
    getAssignmentsByProject,
    getTotalCostByProject,
    getTotalHoursByStakeholder
  };
};
