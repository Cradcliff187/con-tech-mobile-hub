
import { useStakeholderAssignments } from '@/hooks/useStakeholderAssignments';
import { useProjects } from '@/hooks/useProjects';
import { useAssignmentFilters } from '@/hooks/useAssignmentFilters';
import { useAssignmentStatusUpdates } from '@/hooks/useAssignmentStatusUpdates';
import { AssignmentFilters } from './assignments/AssignmentFilters';
import { AssignmentCard } from './assignments/AssignmentCard';
import { AssignmentConfirmDialog } from './assignments/AssignmentConfirmDialog';
import { AssignmentEmptyState } from './assignments/AssignmentEmptyState';

export const StakeholderAssignments = () => {
  const { assignments, loading } = useStakeholderAssignments();
  const { projects, loading: projectsLoading } = useProjects();
  
  const {
    projectFilter,
    setProjectFilter,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    filteredAssignments,
    hasFilters
  } = useAssignmentFilters(assignments);

  const {
    updatingAssignments,
    confirmDialog,
    setConfirmDialog,
    handleStatusChange,
    handleConfirmStatusChange
  } = useAssignmentStatusUpdates();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <AssignmentFilters
        projectFilter={projectFilter}
        setProjectFilter={setProjectFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        projects={projects}
        projectsLoading={projectsLoading}
      />

      {/* Results Summary */}
      <div className="text-sm text-slate-600">
        Showing {filteredAssignments.length} of {assignments.length} assignments
      </div>

      {/* Assignments List */}
      <div className="grid gap-4">
        {filteredAssignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            projects={projects}
            isUpdating={updatingAssignments.has(assignment.id)}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 && (
        <AssignmentEmptyState hasFilters={hasFilters} />
      )}

      {/* Confirmation Dialog */}
      <AssignmentConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        onConfirm={handleConfirmStatusChange}
        newStatus={confirmDialog.newStatus}
        currentStatus={confirmDialog.currentStatus}
      />
    </div>
  );
};
