
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Users, Target, BarChart3 } from 'lucide-react';

interface EmptyStateProps {
  type: 'projects' | 'stakeholders' | 'tasks' | 'general';
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  icon?: React.ReactNode;
}

export const EmptyState = ({ 
  type, 
  title, 
  description, 
  actionLabel, 
  onAction,
  icon 
}: EmptyStateProps) => {
  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'projects':
        return <BarChart3 size={48} className="text-slate-400" />;
      case 'stakeholders':
        return <Users size={48} className="text-slate-400" />;
      case 'tasks':
        return <Target size={48} className="text-slate-400" />;
      default:
        return <Plus size={48} className="text-slate-400" />;
    }
  };

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        {getIcon()}
        <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">
          {title}
        </h3>
        <p className="text-slate-600 text-center mb-6 max-w-md">
          {description}
        </p>
        <Button 
          onClick={onAction}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus size={16} className="mr-2" />
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
};
