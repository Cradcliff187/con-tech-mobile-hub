
import { useState } from 'react';
import { Stakeholder } from '@/hooks/useStakeholders';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DeleteStakeholderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stakeholder: Stakeholder | null;
  onDeleted?: () => void;
}

export const DeleteStakeholderDialog = ({ open, onOpenChange, stakeholder, onDeleted }: DeleteStakeholderDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!stakeholder) return;

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('stakeholders')
        .delete()
        .eq('id', stakeholder.id);
      
      if (error) throw error;
      
      onOpenChange(false);
      onDeleted?.();
      toast({
        title: "Success",
        description: "Stakeholder deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting stakeholder:', error);
      toast({
        title: "Error",
        description: "Failed to delete stakeholder. They may have active assignments.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!stakeholder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <DialogTitle>Delete Stakeholder</DialogTitle>
          </div>
          <DialogDescription className="text-left pt-2">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{stakeholder.company_name}</span>?
            <br /><br />
            This action cannot be undone. All associated certifications and performance 
            records will also be deleted. Active assignments must be removed first.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="flex-1 min-h-[44px]"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={loading}
            className="flex-1 min-h-[44px]"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
