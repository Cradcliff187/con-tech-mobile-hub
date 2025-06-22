
import { stakeholderSchema, type StakeholderFormData, validateFormData } from '@/schemas';
import { sanitizeInput } from '@/utils/validation';

export const sanitizeStakeholderInput = (field: string, value: any) => {
  switch (field) {
    case 'company_name':
    case 'contact_person':
    case 'city':
    case 'state':
    case 'license_number':
      return sanitizeInput(value, 'text');
    case 'email':
      return sanitizeInput(value, 'email');
    case 'phone':
      return sanitizeInput(value, 'phone');
    case 'notes':
      return sanitizeInput(value, 'html');
    case 'street_address':
    case 'zip_code':
      return sanitizeInput(value, 'text');
    case 'crew_size':
      return value;
    case 'specialties':
      return Array.isArray(value) ? value.map(v => sanitizeInput(v, 'text')) : value;
    default:
      return value;
  }
};

export const validateStakeholderForm = (formData: StakeholderFormData) => {
  return validateFormData(stakeholderSchema, formData);
};

export const createLegacyAddress = (data: StakeholderFormData) => {
  return [
    data.street_address,
    data.city,
    data.state,
    data.zip_code
  ].filter(Boolean).join(', ');
};

export const transformStakeholderData = (validatedData: StakeholderFormData) => {
  const legacyAddress = createLegacyAddress(validatedData);

  return {
    stakeholder_type: validatedData.stakeholder_type,
    company_name: validatedData.company_name,
    contact_person: validatedData.contact_person,
    email: validatedData.email,
    phone: validatedData.phone,
    street_address: validatedData.street_address,
    city: validatedData.city,
    state: validatedData.state,
    zip_code: validatedData.zip_code,
    specialties: validatedData.specialties && validatedData.specialties.length > 0 ? validatedData.specialties : undefined,
    crew_size: typeof validatedData.crew_size === 'string' 
      ? parseInt(validatedData.crew_size) || undefined 
      : validatedData.crew_size,
    license_number: validatedData.license_number,
    insurance_expiry: validatedData.insurance_expiry || undefined,
    notes: validatedData.notes,
    status: validatedData.status,
    address: legacyAddress || undefined,
  };
};

export const getInitialFormData = (defaultType: 'client' | 'subcontractor' | 'employee' | 'vendor'): StakeholderFormData => ({
  stakeholder_type: defaultType,
  company_name: '',
  contact_person: '',
  email: '',
  phone: '',
  street_address: '',
  city: '',
  state: '',
  zip_code: '',
  specialties: [],
  crew_size: undefined,
  license_number: '',
  insurance_expiry: '',
  notes: '',
  status: 'active'
});
