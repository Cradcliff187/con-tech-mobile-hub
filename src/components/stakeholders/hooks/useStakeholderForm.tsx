
import { useState, useEffect } from 'react';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useToast } from '@/hooks/use-toast';

interface StakeholderFormData {
  stakeholder_type: 'client' | 'subcontractor' | 'employee' | 'vendor';
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  specialties: string[];
  crew_size: string;
  license_number: string;
  insurance_expiry: string;
  notes: string;
}

interface UseStakeholderFormProps {
  defaultType?: 'client' | 'subcontractor' | 'employee' | 'vendor';
  onSuccess?: () => void;
  onClose: () => void;
}

export const useStakeholderForm = ({ defaultType, onSuccess, onClose }: UseStakeholderFormProps) => {
  const [formData, setFormData] = useState<StakeholderFormData>({
    stakeholder_type: defaultType || 'subcontractor',
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    specialties: [],
    crew_size: '',
    license_number: '',
    insurance_expiry: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { createStakeholder } = useStakeholders();
  const { toast } = useToast();

  useEffect(() => {
    if (defaultType) {
      setFormData(prev => ({ ...prev, stakeholder_type: defaultType }));
    }
  }, [defaultType]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      stakeholder_type: defaultType || 'subcontractor',
      company_name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      specialties: [],
      crew_size: '',
      license_number: '',
      insurance_expiry: '',
      notes: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const stakeholderData = {
      ...formData,
      crew_size: formData.crew_size ? parseInt(formData.crew_size) : undefined,
      insurance_expiry: formData.insurance_expiry || undefined,
      specialties: formData.specialties.length > 0 ? formData.specialties : undefined,
      status: 'active' as const
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
        description: `${formData.company_name || formData.contact_person} has been added to your directory`
      });
      
      resetForm();
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    }
    
    setLoading(false);
  };

  return {
    formData,
    loading,
    handleInputChange,
    handleSubmit,
    resetForm
  };
};
