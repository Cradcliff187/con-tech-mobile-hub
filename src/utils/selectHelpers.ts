
export const validateSelectData = <T extends { id: string; name?: string }>(
  items: T[],
  nameField: keyof T = 'name'
) => {
  return items.filter(item => 
    item.id && 
    item.id.trim() !== '' && 
    item.id !== 'undefined' && 
    item.id !== 'null' &&
    item.id !== 'none' &&
    item.id !== 'all'
  );
};

export const getSelectDisplayName = (
  item: any, 
  nameFields: string[], 
  fallback: string = 'Unknown'
) => {
  for (const field of nameFields) {
    if (item[field] && item[field].trim() !== '') {
      return item[field];
    }
  }
  return fallback;
};

export const normalizeSelectValue = (value: string | null | undefined): string => {
  if (!value || value === 'null' || value === 'undefined') {
    return 'none';
  }
  return value;
};

export const denormalizeSelectValue = (value: string): string | null => {
  if (value === 'none' || value === 'all') {
    return null;
  }
  return value;
};
