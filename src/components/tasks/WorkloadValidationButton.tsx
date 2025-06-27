
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useWorkloadValidation } from '@/hooks/useWorkloadValidation';

export const WorkloadValidationButton: React.FC = () => {
  const { validationResult, loading, validateWorkloadCalculations } = useWorkloadValidation();

  const getStatusColor = () => {
    if (!validationResult) return 'bg-slate-100 text-slate-600';
    if (validationResult.isValid && validationResult.warnings.length === 0) return 'bg-green-100 text-green-800';
    if (validationResult.isValid) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = () => {
    if (!validationResult) return 'Not Tested';
    if (validationResult.isValid && validationResult.warnings.length === 0) return 'Working';
    if (validationResult.isValid) return 'With Warnings';
    return 'Has Issues';
  };

  const getStatusIcon = () => {
    if (loading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (!validationResult) return <AlertCircle className="h-4 w-4" />;
    if (validationResult.isValid) return <CheckCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={validateWorkloadCalculations}
        disabled={loading}
        className="flex items-center gap-2"
      >
        {getStatusIcon()}
        {loading ? 'Testing...' : 'Test Core Functions'}
      </Button>
      
      {validationResult && (
        <Badge className={getStatusColor()}>
          {getStatusText()}
        </Badge>
      )}
    </div>
  );
};
