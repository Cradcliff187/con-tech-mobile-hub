
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface PhaseRecommendationsProps {
  recommendations: string[];
}

export const PhaseRecommendations = ({ recommendations }: PhaseRecommendationsProps) => {
  if (recommendations.length === 0) return null;

  return (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Recommendations</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-1">
          {recommendations.map((rec, index) => (
            <li key={index} className="text-sm">• {rec}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};
