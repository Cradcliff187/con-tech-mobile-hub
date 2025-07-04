import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface CategoryRenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onRename: (oldName: string, newName: string) => Promise<{ success: boolean; error?: string }>;
  isLoading?: boolean;
}

export const CategoryRenameDialog = ({
  open,
  onOpenChange,
  currentName,
  onRename,
  isLoading = false
}: CategoryRenameDialogProps) => {
  const [newName, setNewName] = useState(currentName);
  const [localLoading, setLocalLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newName.trim() || newName.trim() === currentName) {
      onOpenChange(false);
      return;
    }

    setLocalLoading(true);
    try {
      const result = await onRename(currentName, newName.trim());
      if (result.success) {
        onOpenChange(false);
        setNewName(currentName); // Reset for next time
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNewName(currentName); // Reset on close
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Category</DialogTitle>
          <DialogDescription>
            Enter a new name for the category "{currentName}".
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter category name"
              disabled={isLoading || localLoading}
              autoFocus
            />
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading || localLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || localLoading || !newName.trim() || newName.trim() === currentName}
            >
              {(isLoading || localLoading) && <LoadingSpinner size="sm" className="mr-2" />}
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};