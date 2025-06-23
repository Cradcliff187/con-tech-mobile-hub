
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, ArrowRight } from 'lucide-react';
import { Project } from '@/types/database';
import { getUnifiedLifecycleStatus, getStatusLabel, getStatusMetadata } from '@/types/unified-lifecycle';
import { getLifecycleStatus, getLifecycleStatusLabel } from '@/utils/lifecycle-status';

interface UnifiedStatusMigrationHelperProps {
  project: Project;
  showMigrationInfo?: boolean;
}

export const UnifiedStatusMigrationHelper: React.FC<UnifiedStatusMigrationHelperProps> = ({
  project,
  showMigrationInfo = true
}) => {
  const legacyStatus = getLifecycleStatus(project);
  const unifiedStatus = getUnifiedLifecycleStatus(project as any);
  const legacyLabel = getLifecycleStatusLabel(legacyStatus);
  const unifiedLabel = getStatusLabel(unifiedStatus);
  const unifiedMetadata = getStatusMetadata(unifiedStatus);

  // If project already has unified_lifecycle_status, no migration needed
  const projectWithUnified = project as any;
  if (projectWithUnified.unified_lifecycle_status) {
    return null;
  }

  if (!showMigrationInfo) {
    return null;
  }

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Info className="h-4 w-4" />
      <AlertDescription>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Status System Migration Available</p>
          <div className="flex items-center gap-2 text-xs">
            <span>Current (legacy):</span>
            <Badge variant="outline" className="text-slate-600">
              {legacyLabel}
            </Badge>
            <ArrowRight className="h-3 w-3" />
            <span>New unified:</span>
            <Badge className={`${unifiedMetadata.color} ${unifiedMetadata.textColor} border-0`}>
              {unifiedLabel}
            </Badge>
          </div>
          <p className="text-xs text-slate-600">
            This project will automatically use the new unified lifecycle status system for better construction workflow management.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default UnifiedStatusMigrationHelper;
