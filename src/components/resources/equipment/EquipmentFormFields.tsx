
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';

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
  errors?: Record<string, string>;
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
  disabled = false,
  errors = {}
}: EquipmentFormFieldsProps) => {
  const getFieldErrorClass = (fieldName: string) => {
    return errors[fieldName] ? 'border-red-500 focus:border-red-500' : '';
  };

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
          className={getFieldErrorClass('name')}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name}</p>
        )}
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
          className={getFieldErrorClass('type')}
        />
        {errors.type && (
          <p className="text-sm text-red-600">{errors.type}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-status">Status</Label>
        <GlobalStatusDropdown
          entityType="equipment"
          currentStatus={status}
          onStatusChange={setStatus}
          disabled={disabled}
          size="md"
          className="w-full"
        />
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
