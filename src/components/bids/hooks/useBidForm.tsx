import { useState, useEffect } from 'react';
import { useBids } from '@/hooks/useBids';
import { useEstimates } from '@/hooks/useEstimates';
import { useToast } from '@/hooks/use-toast';

export interface BidFormData {
  estimate_id?: string;
  bid_amount: number;
  status: 'pending' | 'submitted' | 'accepted' | 'declined' | 'withdrawn';
  submission_date?: string;
  decision_date?: string;
  win_probability?: number;
  competitor_count?: number;
  estimated_competition_range_low?: number;
  estimated_competition_range_high?: number;
  win_loss_reason?: string;
  notes?: string;
}

interface UseBidFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
  defaultData?: Partial<BidFormData>;
  defaultEstimateId?: string;
}

export const useBidForm = ({
  onSuccess,
  onClose,
  defaultData,
  defaultEstimateId
}: UseBidFormProps) => {
  const { createBid, updateBid } = useBids();
  const { estimates } = useEstimates();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<BidFormData>({
    estimate_id: defaultEstimateId,
    bid_amount: 0,
    status: 'pending',
    submission_date: '',
    decision_date: '',
    win_probability: 0,
    competitor_count: 0,
    estimated_competition_range_low: 0,
    estimated_competition_range_high: 0,
    win_loss_reason: '',
    notes: '',
    ...defaultData
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  // Pre-fill form data when estimate is selected or changed
  useEffect(() => {
    if (formData.estimate_id && estimates.length > 0) {
      const selectedEstimate = estimates.find(e => e.id === formData.estimate_id);
      if (selectedEstimate && formData.bid_amount === 0) {
        setFormData(prev => ({
          ...prev,
          bid_amount: selectedEstimate.amount
        }));
      }
    }
  }, [formData.estimate_id, estimates, formData.bid_amount]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: [] }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string[]> = {};

    if (formData.bid_amount <= 0) {
      newErrors.bid_amount = ['Bid amount must be greater than 0'];
    }

    if (!formData.status) {
      newErrors.status = ['Status is required'];
    }

    if (formData.win_probability && (formData.win_probability < 0 || formData.win_probability > 100)) {
      newErrors.win_probability = ['Win probability must be between 0 and 100'];
    }

    if (formData.competitor_count && formData.competitor_count < 0) {
      newErrors.competitor_count = ['Competitor count cannot be negative'];
    }

    if (formData.estimated_competition_range_low && formData.estimated_competition_range_high) {
      if (formData.estimated_competition_range_low > formData.estimated_competition_range_high) {
        newErrors.estimated_competition_range_low = ['Low range cannot be higher than high range'];
      }
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
        // Convert empty strings to undefined
        estimate_id: formData.estimate_id || undefined,
        submission_date: formData.submission_date || undefined,
        decision_date: formData.decision_date || undefined,
        win_loss_reason: formData.win_loss_reason?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        // Ensure numeric fields are numbers or undefined
        win_probability: formData.win_probability || undefined,
        competitor_count: formData.competitor_count || undefined,
        estimated_competition_range_low: formData.estimated_competition_range_low || undefined,
        estimated_competition_range_high: formData.estimated_competition_range_high || undefined
      };

      const { error } = await createBid(submitData);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to create bid. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Bid created successfully"
      });
      
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error('Error creating bid:', error);
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