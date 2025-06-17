
import { Check, Calendar, User, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number }>;
  completed: boolean;
  current: boolean;
}

interface AllocationProgressStepsProps {
  currentStep: string;
  completedSteps: string[];
}

export const AllocationProgressSteps = ({
  currentStep,
  completedSteps
}: AllocationProgressStepsProps) => {
  const steps: Step[] = [
    {
      id: 'dates',
      name: 'Select Dates',
      icon: Calendar,
      completed: completedSteps.includes('dates'),
      current: currentStep === 'dates'
    },
    {
      id: 'operator',
      name: 'Assign Operator',
      icon: User,
      completed: completedSteps.includes('operator'),
      current: currentStep === 'operator'
    },
    {
      id: 'details',
      name: 'Add Details',
      icon: FileText,
      completed: completedSteps.includes('details'),
      current: currentStep === 'details'
    }
  ];

  return (
    <div className="flex items-center justify-between w-full mb-6">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
              step.completed 
                ? "bg-green-500 border-green-500 text-white"
                : step.current
                ? "bg-orange-500 border-orange-500 text-white"
                : "bg-gray-100 border-gray-300 text-gray-400"
            )}>
              {step.completed ? (
                <Check size={16} />
              ) : (
                <step.icon size={16} />
              )}
            </div>
            <span className={cn(
              "mt-2 text-xs font-medium",
              step.completed || step.current
                ? "text-gray-900"
                : "text-gray-400"
            )}>
              {step.name}
            </span>
          </div>
          
          {index < steps.length - 1 && (
            <div className={cn(
              "flex-1 h-0.5 mx-4 transition-colors",
              steps[index + 1].completed || step.completed
                ? "bg-green-500"
                : "bg-gray-200"
            )} />
          )}
        </div>
      ))}
    </div>
  );
};
