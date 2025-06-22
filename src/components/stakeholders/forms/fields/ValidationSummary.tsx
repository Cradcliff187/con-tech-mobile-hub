
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ValidationSummaryProps {
  errors: Record<string, string[]>;
}

export const ValidationSummary = ({ errors }: ValidationSummaryProps) => {
  if (Object.keys(errors).length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Please fix the validation errors above. All inputs are sanitized for security.
      </AlertDescription>
    </Alert>
  );
};
