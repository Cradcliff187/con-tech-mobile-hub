
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEquipment } from '@/hooks/useEquipment';

interface AlternativeEquipmentFormProps {
  onSubmit: (data: { alternativeEquipmentId: string }) => void;
  isSubmitting: boolean;
}

export const AlternativeEquipmentForm = ({ onSubmit, isSubmitting }: AlternativeEquipmentFormProps) => {
  const [alternativeEquipmentId, setAlternativeEquipmentId] = useState('');
  const { equipment } = useEquipment();

  const availableEquipment = equipment.filter(eq => eq.status === 'available');

  const handleSubmit = () => {
    onSubmit({ alternativeEquipmentId });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="alt-equipment">Alternative Equipment</Label>
      <Select 
        value={alternativeEquipmentId} 
        onValueChange={setAlternativeEquipmentId}
        disabled={isSubmitting}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select alternative equipment..." />
        </SelectTrigger>
        <SelectContent>
          {availableEquipment.map((eq) => (
            <SelectItem key={eq.id} value={eq.id}>
              {eq.name} - {eq.type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
