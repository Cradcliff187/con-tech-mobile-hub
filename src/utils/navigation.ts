
export const navigateToProjectContext = (projectId: string, view: string = 'planning') => {
  return `/${view}?project=${projectId}`;
};

export const navigateToStakeholder = (stakeholderId: string, modal: boolean = true) => {
  if (modal) {
    // This is a placeholder for modal logic.
    // In a real app, this would dispatch an action to a global state manager
    // to open a modal. For now, we'll just log it.
    console.log('Open stakeholder modal for:', stakeholderId);
    return { modal: 'stakeholder', id: stakeholderId };
  }
  return `/stakeholders/${stakeholderId}`;
};
