import { useState } from 'react';
import { useEstimates } from '@/hooks/useEstimates';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';
import { TextField } from '@/components/ui/form-field';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Estimate } from '@/hooks/useEstimates';

interface ConvertEstimateToProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate: Estimate | null;
  onSuccess?: () => void;
}

export const ConvertEstimateToProjectDialog = ({
  open,
  onOpenChange,
  estimate,
  onSuccess
}: ConvertEstimateToProjectDialogProps) => {
  const { convertEstimateToProject } = useEstimates();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState('');

  const handleConvert = async () => {
    if (!estimate) return;

    setLoading(true);
    try {
      const { error } = await convertEstimateToProject(
        estimate.id,
        projectName.trim() || estimate.title
      );
      
      if (error) {
        toast({
          title: "Conversion Failed",
          description: "Failed to convert estimate to project. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Estimate successfully converted to project"
      });
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error converting estimate to project:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!estimate) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const canConvert = estimate.status === 'accepted' && !estimate.project_id;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Convert Estimate to Project"
      className="max-w-md"
    >
      <div className="space-y-4">
        {!canConvert && (
          <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                Cannot Convert Estimate
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                {estimate.status !== 'accepted' && "Estimate must be accepted before conversion."}
                {estimate.project_id && "Estimate has already been converted to a project."}
              </p>
            </div>
          </div>
        )}

        {canConvert && (
          <>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  Ready for Conversion
                </p>
                <p className="text-sm text-green-700 mt-1">
                  This will create a new project based on the estimate data.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Converting estimate:
              </p>
              <div className="bg-slate-50 p-3 rounded border">
                <p className="font-medium text-slate-900">{estimate.estimate_number}</p>
                <p className="text-sm text-slate-600">
                  Amount: {formatCurrency(estimate.amount)}
                </p>
                <p className="text-sm text-slate-600">
                  Title: {estimate.title}
                </p>
                {estimate.stakeholder && (
                  <p className="text-sm text-slate-600">
                    Client: {estimate.stakeholder.company_name || estimate.stakeholder.contact_person}
                  </p>
                )}
              </div>
            </div>

            <TextField
              label="Project Name (Optional)"
              value={projectName}
              onChange={setProjectName}
              placeholder={estimate.title || "Enter custom project name"}
              hint={`Default: ${estimate.title || 'Estimate title'}`}
            />
          </>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
          <TouchFriendlyButton
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="order-2 sm:order-1"
          >
            Cancel
          </TouchFriendlyButton>
          <TouchFriendlyButton
            type="button"
            onClick={handleConvert}
            disabled={loading || !canConvert}
            className="order-1 sm:order-2"
          >
            {loading ? 'Converting...' : 'Convert to Project'}
          </TouchFriendlyButton>
        </div>
      </div>
    </ResponsiveDialog>
  );
};