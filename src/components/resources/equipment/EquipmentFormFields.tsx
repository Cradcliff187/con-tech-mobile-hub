
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EquipmentFormFieldsProps {
  name: string;
  setName: (value: string) => void;
  type: string;
  setType: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  maintenanceDue: string;
  setMaintenanceDue: (value: string) => void;
  disabled?: boolean;
}

export const EquipmentFormFields = ({
  name,
  setName,
  type,
  setType,
  status,
  setStatus,
  maintenanceDue,
  setMaintenanceDue,
  disabled = false
}: EquipmentFormFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="edit-name">Equipment Name *</Label>
        <Input
          id="edit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Excavator CAT 320"
          required
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-type">Type *</Label>
        <Input
          id="edit-type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="e.g., Heavy Machinery"
          required
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-status">Status</Label>
        <Select value={status} onValueChange={setStatus} disabled={disabled}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in-use">In Use</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="out-of-service">Out of Service</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-maintenanceDue">Maintenance Due Date</Label>
        <Input
          id="edit-maintenanceDue"
          type="date"
          value={maintenanceDue}
          onChange={(e) => setMaintenanceDue(e.target.value)}
          disabled={disabled}
        />
      </div>
    </>
  );
};
