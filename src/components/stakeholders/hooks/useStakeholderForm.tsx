
import { useState } from 'react';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useToast } from '@/hooks/use-toast';
import { stakeholderSchema, type StakeholderFormData } from '@/schemas';
import { validateFormData } from '@/schemas/validation';
import { sanitizeOnSubmit, sanitizeEmailOnSubmit, sanitizePhoneOnSubmit } from '@/utils/iosFriendlyValidation';

interface UseStakeholderFormProps {
  defaultType?: 'client' | 'subcontractor' | 'employee' | 'vendor';
  onSuccess?: () => void;
  onClose?: () => void;
}

export const useStakeholderForm = ({
  defaultType = 'subcontractor',
  onSuccess,
  onClose
}: UseStakeholderFormProps) => {
  const { createStakeholder } = useStakeholders();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<StakeholderFormData>({
    stakeholder_type: defaultType,
    contact_person: '',
    company_name: '',
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

  const handleInputChange = (field: string, value: any) => {
    // Direct assignment without any sanitization during typing
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sanitize data only on submission - let sanitization functions handle undefined conversion
      const sanitizedData = {
        stakeholder_type: formData.stakeholder_type, // Explicitly assign to ensure it's not optional
        contact_person: sanitizeOnSubmit(formData.contact_person),
        company_name: sanitizeOnSubmit(formData.company_name),
        email: sanitizeEmailOnSubmit(formData.email),
        phone: sanitizePhoneOnSubmit(formData.phone),
        street_address: sanitizeOnSubmit(formData.street_address),
        city: sanitizeOnSubmit(formData.city),
        state: sanitizeOnSubmit(formData.state),
        zip_code: sanitizeOnSubmit(formData.zip_code),
        license_number: sanitizeOnSubmit(formData.license_number),
        notes: sanitizeOnSubmit(formData.notes),
        specialties: formData.specialties?.filter(s => s.trim().length > 0).map(s => sanitizeOnSubmit(s)).filter(s => s !== undefined) || [],
        crew_size: formData.crew_size,
        // Convert empty date strings to undefined for PostgreSQL compatibility
        insurance_expiry: formData.insurance_expiry && formData.insurance_expiry.trim() !== '' ? formData.insurance_expiry : undefined,
        status: formData.status
      };

      // Validate the sanitized data
      const validation = validateFormData(stakeholderSchema, sanitizedData);
      
      if (!validation.success) {
        setErrors(validation.errors || {});
        toast({
          title: "Validation Error",
          description: "Please correct the errors in the form",
          variant: "destructive"
        });
        return;
      }

      const { error } = await createStakeholder(sanitizedData);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to create stakeholder. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Stakeholder created successfully"
      });
      
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error('Error creating stakeholder:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    handleInputChange,
    handleSubmit
  };
};
