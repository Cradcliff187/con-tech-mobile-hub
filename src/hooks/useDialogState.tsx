
import { useState } from 'react';

export type DialogType = 'none' | 'details' | 'edit' | 'assign' | 'delete' | 'export';

export const useDialogState = (initialState: DialogType = 'none') => {
  const [activeDialog, setActiveDialog] = useState<DialogType>(initialState);

  const openDialog = (type: DialogType) => {
    setActiveDialog(type);
  };

  const closeDialog = () => {
    setActiveDialog('none');
  };

  const isDialogOpen = (type: DialogType) => {
    return activeDialog === type;
  };

  return {
    activeDialog,
    openDialog,
    closeDialog,
    isDialogOpen
  };
};
