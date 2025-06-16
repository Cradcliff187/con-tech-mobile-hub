
export const formatAddress = (stakeholder: {
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  address?: string;
}): string => {
  // Try to use structured address fields first
  if (stakeholder.street_address || stakeholder.city || stakeholder.state || stakeholder.zip_code) {
    const parts = [
      stakeholder.street_address,
      stakeholder.city,
      stakeholder.state && stakeholder.zip_code 
        ? `${stakeholder.state} ${stakeholder.zip_code}`
        : stakeholder.state || stakeholder.zip_code
    ].filter(Boolean);
    
    return parts.join(', ');
  }
  
  // Fallback to legacy address field
  return stakeholder.address || '';
};

export const formatPhoneNumber = (phone?: string): string => {
  if (!phone) return '';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format as (###) ###-####
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Return original if not 10 digits
  return phone;
};
