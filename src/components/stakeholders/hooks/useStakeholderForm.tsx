import { useState, useEffect } from 'react';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useToast } from '@/hooks/use-toast';
import { stakeholderSchema, type StakeholderFormData, validateFormData } from '@/schemas';
import { sanitizeInput } from '@/utils/validation';

interface UseStakeholderFormProps {
  defaultType?: 'client' | 'subcontractor' | 'employee' | 'vendor';
  onSuccess?: () => void;
  onClose: () => void;
}

export const useStakeholderForm = ({ defaultType = 'subcontractor', onSuccess, onClose }: UseStakeholderFormProps) => {
  const [formData, setFormData] = useState<StakeholderFormData>({
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
  
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  
  const { createStakeholder } = useStakeholders();
  const { toast } = useToast();

  useEffect(() => {
    setFormData(prev => ({ ...prev, stakeholder_type: defaultType }));
  }, [defaultType]);

  const handleInputChange = (field: string, value: any) => {
    // Sanitize input based on field type
    let sanitizedValue = value;
    
    switch (field) {
      case 'company_name':
      case 'contact_person':
      case 'city':
      case 'state':
      case 'license_number':
        sanitizedValue = sanitizeInput(value, 'text');
        break;
      case 'email':
        sanitizedValue = sanitizeInput(value, 'email');
        break;
      case 'phone':
        sanitizedValue = sanitizeInput(value, 'phone');
        break;
      case 'notes':
        sanitizedValue = sanitizeInput(value, 'html');
        break;
      case 'street_address':
      case 'zip_code':
        sanitizedValue = sanitizeInput(value, 'text');
        break;
      case 'crew_size':
        // Keep as string for form input, will be converted during validation
        sanitizedValue = value;
        break;
      case 'specialties':
        sanitizedValue = Array.isArray(value) ? value.map(v => sanitizeInput(v, 'text')) : value;
        break;
      default:
        sanitizedValue = value;
    }
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const validation = validateFormData(stakeholderSchema, formData);
    
    if (!validation.success) {
      setErrors(validation.errors || {});
      return false;
    }
    
    setErrors({});
    return true;
  };

  const resetForm = () => {
    setFormData({
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
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      const validation = validateFormData(stakeholderSchema, formData);
      if (!validation.success || !validation.data) {
        throw new Error('Form validation failed');
      }

      // Create legacy address field for backward compatibility
      const legacyAddress = [
        validation.data.street_address,
        validation.data.city,
        validation.data.state,
        validation.data.zip_code
      ].filter(Boolean).join(', ');

      const stakeholderData = {
        ...validation.data,
        address: legacyAddress || undefined, // Keep for backward compatibility
        crew_size: validation.data.crew_size,
        insurance_expiry: validation.data.insurance_expiry || undefined,
        specialties: validation.data.specialties && validation.data.specialties.length > 0 ? validation.data.specialties : undefined
      };

      const { error } = await createStakeholder(stakeholderData);

      if (error) {
        toast({
          title: "Error creating stakeholder",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Stakeholder created successfully",
          description: `${validation.data.company_name || validation.data.contact_person} has been added with enhanced security validation`
        });
        
        resetForm();
        
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }
    } catch (error) {
      console.error('Stakeholder creation error:', error);
      toast({
        title: "Error creating stakeholder",
        description: "Failed to create stakeholder. Please try again.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  return {
    formData,
    errors,
    loading,
    handleInputChange,
    handleSubmit,
    resetForm,
    validateForm
  };
};
