
import React, { useState } from 'react';
import { ResponsiveDialog } from './ResponsiveDialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { UnifiedLifecycleStatus } from '@/types/unified-lifecycle';
import { getStatusMetadata, validateStatusTransition } from '@/utils/unified-lifecycle-utils';
import { EnhancedUnifiedStatusBadge } from '@/components/ui/enhanced-unified-status-badge';
import { cn } from '@/lib/utils';

interface EnhancedStatusTransitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  currentStatus: UnifiedLifecycleStatus;
  targetStatus: UnifiedLifecycleStatus;
  project: any;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const EnhancedStatusTransitionDialog: React.FC<EnhancedStatusTransitionDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  currentStatus,
  targetStatus,
  project,
  onConfirm,
  isLoading = false
}) => {
  const [validationResult, setValidationResult] = useState<any>(null);
  const [validationLoading, setValidationLoading] = useState(false);

  React.useEffect(() => {
    if (open && projectId) {
      validateTransition();
    }
  }, [open, projectId, targetStatus]);

  const validateTransition = async () => {
    setValidationLoading(true);
    try {
      const result = await validateStatusTransition(projectId, targetStatus);
      setValidationResult(result);
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({
        is_valid: false,
        error_message: 'Failed to validate transition',
        required_conditions: {}
      });
    } finally {
      setValidationLoading(false);
    }
  };

  const currentMetadata = getStatusMetadata(currentStatus);
  const targetMetadata = getStatusMetadata(targetStatus);

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Confirm Status Transition"
      className="max-w-lg"
    >
      <div className="space-y-6">
        {/* Status Transition Visual */}
        <div className="flex items-center justify-center space-x-4 py-4 bg-slate-50 rounded-lg">
          <EnhancedUnifiedStatusBadge 
            status={currentStatus} 
            size="lg"
            showTooltip={false}
          />
          <ArrowRight className="h-6 w-6 text-slate-400" />
          <EnhancedUnifiedStatusBadge 
            status={targetStatus} 
            size="lg"
            showTooltip={false}
          />
        </div>

        {/* Validation Progress */}
        {validationLoading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Validating transition...</span>
              <span className="text-slate-500">Processing</span>
            </div>
            <Progress value={undefined} className="h-2" />
          </div>
        )}

        {/* Validation Results */}
        {validationResult && !validationLoading && (
          <div className="space-y-3">
            {!validationResult.is_valid && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  <strong>Cannot transition:</strong> {validationResult.error_message}
                </AlertDescription>
              </Alert>
            )}

            {validationResult.is_valid && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  <strong>Ready to transition:</strong> All requirements are met.
                </AlertDescription>
              </Alert>
            )}

            {/* Required Conditions */}
            {Object.keys(validationResult.required_conditions || {}).length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Required Conditions
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {Object.entries(validationResult.required_conditions).map(([key, value]) => (
                    <li key={key} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      {key}: {String(value)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Project Info */}
        <div className="text-sm text-slate-600 space-y-2 bg-slate-50 rounded-lg p-4">
          <div><strong>Project:</strong> {project.name}</div>
          <div><strong>Progress:</strong> {project.progress || 0}%</div>
          <div><strong>Current Phase:</strong> {currentMetadata.label}</div>
          <div><strong>Target Phase:</strong> {targetMetadata.label}</div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto touch-manipulation min-h-[44px]"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!validationResult?.is_valid || isLoading || validationLoading}
            className={cn(
              "w-full sm:w-auto touch-manipulation min-h-[44px]",
              "bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
            )}
          >
            {isLoading ? 'Updating...' : 'Confirm Transition'}
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
};

export default EnhancedStatusTransitionDialog;
