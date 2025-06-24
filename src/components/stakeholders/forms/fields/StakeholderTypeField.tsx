
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';

interface StakeholderTypeFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const StakeholderTypeField = ({ 
  value, 
  onChange, 
  error 
}: StakeholderTypeFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="stakeholder_type">Type *</Label>
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder="Select stakeholder type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="client">Client</SelectItem>
          <SelectItem value="subcontractor">Subcontractor</SelectItem>
          <SelectItem value="employee">Employee</SelectItem>
          <SelectItem value="vendor">Vendor</SelectItem>
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertTriangle size={12} />
          {error}
        </p>
      )}
    </div>
  );
};
