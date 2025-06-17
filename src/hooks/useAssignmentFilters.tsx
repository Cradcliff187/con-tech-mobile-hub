
import { useState, useMemo } from 'react';
import { StakeholderAssignment } from '@/hooks/useStakeholderAssignments';

export const useAssignmentFilters = (assignments: StakeholderAssignment[]) => {
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      const matchesProject = projectFilter === 'all' || assignment.project_id === projectFilter;
      const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
      const matchesSearch = 
        assignment.stakeholder?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesProject && matchesStatus && matchesSearch;
    });
  }, [assignments, projectFilter, statusFilter, searchTerm]);

  const hasFilters = projectFilter !== 'all' || statusFilter !== 'all' || searchTerm !== '';

  return {
    projectFilter,
    setProjectFilter,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    filteredAssignments,
    hasFilters
  };
};
