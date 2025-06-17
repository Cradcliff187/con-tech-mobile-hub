
interface AssignmentEmptyStateProps {
  hasFilters: boolean;
}

export const AssignmentEmptyState = ({ hasFilters }: AssignmentEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="text-slate-500 mb-2">
        {hasFilters
          ? 'No assignments match your search criteria'
          : 'No assignments found'
        }
      </div>
      <div className="text-sm text-slate-400">
        {hasFilters
          ? 'Try adjusting your search or filters'
          : 'Stakeholders will appear here once assigned to projects'
        }
      </div>
    </div>
  );
};
