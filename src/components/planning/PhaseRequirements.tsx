
import { CheckCircle } from 'lucide-react';

interface PhaseRequirementsProps {
  requirements: string[];
}

export const PhaseRequirements = ({ requirements }: PhaseRequirementsProps) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h4 className="font-semibold text-slate-800 mb-4">Phase Requirements</h4>
      <div className="space-y-2">
        {requirements.map((requirement, index) => (
          <div key={index} className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-slate-600 text-sm">{requirement}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
