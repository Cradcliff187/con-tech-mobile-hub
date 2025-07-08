import { useState } from 'react';
import { useEstimates } from '@/hooks/useEstimates';
import { useToast } from '@/hooks/use-toast';

export interface EstimateFormData {
  stakeholder_id: string;
  title: string;
  description?: string;
  amount: number;
  labor_cost?: number;
  material_cost?: number;
  equipment_cost?: number;
  markup_percentage?: number;
  valid_until?: string;
  terms_and_conditions?: string;
  notes?: string;
}

interface UseEstimateFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
  defaultData?: Partial<EstimateFormData>;
  estimateId?: string;
}

export const useEstimateForm = ({
  onSuccess,
  onClose,
  defaultData,
  estimateId
}: UseEstimateFormProps) => {
  const { createEstimate, updateEstimate } = useEstimates();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<EstimateFormData>({
    stakeholder_id: '',
    title: '',
    description: '',
    amount: 0,
    labor_cost: 0,
    material_cost: 0,
    equipment_cost: 0,
    markup_percentage: 0,
    valid_until: '',
    terms_and_conditions: '',
    notes: '',
    ...defaultData
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: [] }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string[]> = {};

    if (!formData.stakeholder_id) {
      newErrors.stakeholder_id = ['Stakeholder is required'];
    }

    if (!formData.title.trim()) {
      newErrors.title = ['Title is required'];
    }

    if (formData.amount <= 0) {
      newErrors.amount = ['Amount must be greater than 0'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        status: 'draft' as const,
        // Convert empty strings to undefined
        description: formData.description?.trim() || undefined,
        valid_until: formData.valid_until || undefined,
        terms_and_conditions: formData.terms_and_conditions?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        // Ensure numeric fields are numbers or undefined
        labor_cost: formData.labor_cost || undefined,
        material_cost: formData.material_cost || undefined,
        equipment_cost: formData.equipment_cost || undefined,
        markup_percentage: formData.markup_percentage || undefined
      };

      const { error } = estimateId 
        ? await updateEstimate(estimateId, submitData)
        : await createEstimate(submitData);
      
      if (error) {
        toast({
          title: "Error",
          description: estimateId 
            ? "Failed to update estimate. Please try again."
            : "Failed to create estimate. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: estimateId 
          ? "Estimate updated successfully"
          : "Estimate created successfully"
      });
      
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error(`Error ${estimateId ? 'updating' : 'creating'} estimate:`, error);
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