
import { type StakeholderFormData } from '@/schemas';
import { validateFormData, stakeholderSchema } from '@/schemas';

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

export const validateStakeholderForm = (data: StakeholderFormData) => {
  return validateFormData(stakeholderSchema, data);
};

export const transformStakeholderData = (data: StakeholderFormData) => {
  return {
    ...data,
    // Ensure crew_size is properly handled
    crew_size: data.crew_size || null,
    // Ensure empty strings are converted to null for optional fields
    company_name: data.company_name || null,
    email: data.email || null,
    phone: data.phone || null,
    street_address: data.street_address || null,
    city: data.city || null,
    state: data.state || null,
    zip_code: data.zip_code || null,
    license_number: data.license_number || null,
    insurance_expiry: data.insurance_expiry || null,
    notes: data.notes || null
  };
};
