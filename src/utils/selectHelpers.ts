
export const validateSelectData = <T extends { id: string; name?: string }>(
  items: T[],
  nameField: keyof T = 'name'
) => {
  return items.filter(item => 
    item.id && 
    item.id.trim() !== '' && 
    item.id !== 'undefined' && 
    item.id !== 'null'
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
