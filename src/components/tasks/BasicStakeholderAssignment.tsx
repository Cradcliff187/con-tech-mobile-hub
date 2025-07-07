
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { TaskStakeholderAssignmentField } from './forms/TaskStakeholderAssignmentField';
import { AssignmentErrorHandler, createAssignmentError } from './AssignmentErrorHandler';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useStakeholderWorkload } from '@/hooks/useStakeholderWorkload';
import { useAssignmentValidation } from '@/hooks/useAssignmentValidation';

interface BasicStakeholderAssignmentProps {
  projectId: string;
  requiredSkills: string[];
  selectedStakeholderId?: string;
  selectedStakeholderIds?: string[];
  onSingleSelect: (stakeholderId: string | undefined) => void;
  onMultiSelect?: (stakeholderIds: string[]) => void;
  multiSelectMode?: boolean;
  existingAssignments?: string[];
}

export const BasicStakeholderAssignment: React.FC<BasicStakeholderAssignmentProps> = ({
  projectId,
  requiredSkills,
  selectedStakeholderId,
  selectedStakeholderIds = [],
  onSingleSelect,
  onMultiSelect,
  multiSelectMode = false,
  existingAssignments = []
}) => {
  const [assignmentError, setAssignmentError] = useState<any>(null);
  const { stakeholders } = useStakeholders();
  // Memoize workload parameters to prevent loops
  const workloadParams = React.useMemo(() => ({
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  }), []);
  
  const { workloadData, loading: workloadLoading, error: workloadError } = useStakeholderWorkload(workloadParams);
  const { validating } = useAssignmentValidation();

  // Handle workload errors
  React.useEffect(() => {
    if (workloadError) {
      setAssignmentError(createAssignmentError(workloadError, 'workload calculation'));
    }
  }, [workloadError]);

  // Get workload status for selected stakeholders
  const getStakeholderWorkloadStatus = (stakeholderId: string) => {
    try {
      const workload = workloadData.find(w => w.stakeholder_id === stakeholderId);
      if (!workload) return 'unknown';
      
      if (workload.utilization_percentage >= 100) return 'overallocated';
      if (workload.utilization_percentage >= 80) return 'busy';
      return 'available';
    } catch (error) {
      console.warn('Error getting workload status:', error);
      return 'unknown';
    }
  };

  const hasExistingAssignments = existingAssignments.length > 0;
  const selectedStakeholders = stakeholders.filter(s => 
    selectedStakeholderId === s.id || selectedStakeholderIds.includes(s.id)
  );

  const overallocatedCount = selectedStakeholders.filter(s => 
    getStakeholderWorkloadStatus(s.id) === 'overallocated'
  ).length;

  // Debug log to track assignment state
  console.log('🎯 BasicStakeholderAssignment state:', {
    projectId,
    selectedStakeholderId,
    selectedStakeholderIds,
    stakeholdersCount: stakeholders.length,
    multiSelectMode
  });

  const handleRetryWorkload = () => {
    setAssignmentError(null);
    // The workload hook will automatically retry
  };

  const handleDismissError = () => {
    setAssignmentError(null);
  };

  // Enhanced stakeholder selection with error handling
  const handleStakeholderSelect = (stakeholderId: string | undefined) => {
    try {
      onSingleSelect(stakeholderId);
      setAssignmentError(null);
    } catch (error) {
      setAssignmentError(createAssignmentError(error, 'stakeholder selection'));
    }
  };

  const handleMultiStakeholderSelect = (stakeholderIds: string[]) => {
    try {
      onMultiSelect?.(stakeholderIds);
      setAssignmentError(null);
    } catch (error) {
      setAssignmentError(createAssignmentError(error, 'multi-stakeholder selection'));
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4" />
          Stakeholder Assignment
          {validating && <div className="text-xs text-blue-500">Validating...</div>}
        </CardTitle>
        {hasExistingAssignments && (
          <div className="flex items-center gap-2 text-xs text-amber-600">
            <AlertTriangle className="h-3 w-3" />
            Task has existing assignments - changes may affect project timeline
          </div>
        )}
      </CardHeader>
      <CardContent>
        <AssignmentErrorHandler
          error={assignmentError}
          onRetry={workloadError ? handleRetryWorkload : undefined}
          onDismiss={handleDismissError}
        />

        <TaskStakeholderAssignmentField
          value={selectedStakeholderId}
          values={selectedStakeholderIds}
          onChange={handleStakeholderSelect}
          onMultiChange={handleMultiStakeholderSelect}
          stakeholders={stakeholders}
          requiredSkills={requiredSkills}
          multiSelectMode={multiSelectMode}
        />

        {/* Workload Status Indicators */}
        {!workloadLoading && !workloadError && selectedStakeholders.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
              <CheckCircle className="h-3 w-3" />
              Workload Status:
            </div>
            <div className="space-y-1">
              {selectedStakeholders.map(stakeholder => {
                const status = getStakeholderWorkloadStatus(stakeholder.id);
                const workload = workloadData.find(w => w.stakeholder_id === stakeholder.id);
                const statusColor = {
                  available: 'bg-green-100 text-green-800',
                  busy: 'bg-yellow-100 text-yellow-800',
                  overallocated: 'bg-red-100 text-red-800',
                  unknown: 'bg-gray-100 text-gray-800'
                }[status];

                return (
                  <div key={stakeholder.id} className="flex items-center justify-between text-xs">
                    <span className="truncate max-w-[150px]">
                      {stakeholder.company_name || stakeholder.contact_person}
                    </span>
                    <div className="flex items-center gap-1">
                      <Badge className={statusColor}>
                        {status === 'overallocated' ? 'Over Capacity' : 
                         status === 'busy' ? 'Near Capacity' : 
                         status === 'available' ? 'Available' : 'Unknown'}
                      </Badge>
                      {workload && (
                        <span className="text-xs text-slate-500">
                          {Math.round(workload.utilization_percentage)}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Over-allocation Warning */}
        {overallocatedCount > 0 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Capacity Warning</span>
            </div>
            <p className="text-xs text-amber-600 mt-1">
              {overallocatedCount} selected stakeholder{overallocatedCount > 1 ? 's are' : ' is'} over capacity. 
              Consider reassigning or adjusting timelines.
            </p>
          </div>
        )}

        {/* Loading State */}
        {workloadLoading && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-600">
            Loading workload data...
          </div>
        )}
      </CardContent>
    </Card>
  );
};
