
import { useState, useCallback } from 'react';

export const useDialogState = () => {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const openDialog = useCallback((dialogId: string) => {
    setActiveDialog(dialogId);
  }, []);

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
  }, []);

  const isDialogOpen = useCallback((dialogId: string) => {
    return activeDialog === dialogId;
  }, [activeDialog]);

  return {
    activeDialog,
    openDialog,
    closeDialog,
    isDialogOpen
  };
};
