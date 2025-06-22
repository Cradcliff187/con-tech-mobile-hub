
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { sanitizeText, sanitizeStringArray } from '@/utils/validation';
import { type StakeholderFormData } from '@/schemas';

interface SpecialtiesManagerProps {
  formData: StakeholderFormData;
  onInputChange: (field: string, value: any) => void;
  errors?: Record<string, string[]>;
}

export const SpecialtiesManager = ({ 
  formData, 
  onInputChange,
  errors = {}
}: SpecialtiesManagerProps) => {
  const [newSpecialty, setNewSpecialty] = useState('');

  const getFieldError = (field: string): string | undefined => {
    return errors[field]?.[0];
  };

  const handleAddSpecialty = () => {
    const sanitizedSpecialty = sanitizeText(newSpecialty);
    if (sanitizedSpecialty && !formData.specialties.includes(sanitizedSpecialty)) {
      const updatedSpecialties = sanitizeStringArray([...formData.specialties, sanitizedSpecialty]);
      onInputChange('specialties', updatedSpecialties);
      setNewSpecialty('');
    }
  };

  const handleRemoveSpecialty = (specialtyToRemove: string) => {
    const updatedSpecialties = formData.specialties.filter(spec => spec !== specialtyToRemove);
    onInputChange('specialties', updatedSpecialties);
  };

  return (
    <div className="space-y-2">
      <Label>Specialties</Label>
      <div className="flex gap-2">
        <Input
          value={newSpecialty}
          onChange={(e) => setNewSpecialty(e.target.value)}
          placeholder="Add specialty (max 50 characters)"
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialty())}
        />
        <Button type="button" onClick={handleAddSpecialty} variant="outline">
          Add
        </Button>
      </div>
      {formData.specialties.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.specialties.map((specialty) => (
            <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
              {specialty}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleRemoveSpecialty(specialty)}
              />
            </Badge>
          ))}
        </div>
      )}
      {getFieldError('specialties') && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertTriangle size={12} />
          {getFieldError('specialties')}
        </p>
      )}
    </div>
  );
};
