
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, User } from 'lucide-react';
import type { Equipment } from '@/hooks/useEquipment';

interface EquipmentCardProps {
  equipment: Equipment;
  isSelected: boolean;
  isAvailable?: boolean;
  showAvailabilityCheck: boolean;
  operatorId?: string;
  availableOperators: Array<{
    id: string;
    contact_person?: string;
    company_name?: string;
  }>;
  onToggle: (checked: boolean) => void;
  onOperatorChange: (operatorId: string) => void;
}

export const EquipmentCard = ({
  equipment,
  isSelected,
  isAvailable,
  showAvailabilityCheck,
  operatorId,
  availableOperators,
  onToggle,
  onOperatorChange
}: EquipmentCardProps) => {
  return (
    <Card className="p-4">
      <CardContent className="p-0 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggle}
            />
            <div>
              <h3 className="font-medium">{equipment.name}</h3>
              <p className="text-sm text-slate-600">{equipment.type}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="secondary">{equipment.status}</Badge>
            {showAvailabilityCheck && (
              <div className="flex items-center gap-1">
                {isAvailable === false ? (
                  <>
                    <AlertTriangle size={14} className="text-red-500" />
                    <span className="text-xs text-red-600">Not Available</span>
                  </>
                ) : isAvailable === true ? (
                  <span className="text-xs text-green-600">Available</span>
                ) : (
                  <span className="text-xs text-slate-500">Checking...</span>
                )}
              </div>
            )}
          </div>
        </div>

        {isSelected && (
          <div className="space-y-2 pl-6">
            <Label className="text-sm flex items-center gap-2">
              <User size={14} />
              Assign Operator (Optional)
            </Label>
            <Select
              value={operatorId || ''}
              onValueChange={onOperatorChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select operator..." />
              </SelectTrigger>
              <SelectContent>
                {availableOperators.map((operator) => (
                  <SelectItem key={operator.id} value={operator.id}>
                    {operator.contact_person || operator.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
