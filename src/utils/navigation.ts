
export const navigateToProjectContext = (projectId: string, view: string = 'planning') => {
  // Use consistent searchParams pattern for all navigation
  return `/?section=${view}&project=${projectId}`;
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

export const preserveProjectContext = (currentParams: URLSearchParams, newSection: string) => {
  const newParams = new URLSearchParams();
  newParams.set('section', newSection);
  
  // Preserve project context when switching sections
  const projectId = currentParams.get('project');
  if (projectId) {
    newParams.set('project', projectId);
  }
  
  return newParams.toString();
};

export const buildNavigationUrl = (section: string, projectId?: string, additionalParams?: Record<string, string>) => {
  const params = new URLSearchParams();
  params.set('section', section);
  
  if (projectId) {
    params.set('project', projectId);
  }
  
  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      params.set(key, value);
    });
  }
  
  return `/?${params.toString()}`;
};
