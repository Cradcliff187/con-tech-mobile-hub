
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { CreateProjectDialog } from '@/components/dashboard/CreateProjectDialog';

interface QuickProjectCreateProps {
  clientId?: string;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost';
  buttonSize?: 'sm' | 'default' | 'lg';
}

export const QuickProjectCreate = ({ 
  clientId, 
  buttonText = "New Project",
  buttonVariant = 'default',
  buttonSize = 'default'
}: QuickProjectCreateProps) => {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setShowDialog(true)}
        variant={buttonVariant}
        size={buttonSize}
      >
        <Plus className="mr-2 h-4 w-4" />
        {buttonText}
      </Button>
      
      <CreateProjectDialog 
        open={showDialog}
        onOpenChange={setShowDialog}
        defaultClientId={clientId}
      />
    </>
  );
};
