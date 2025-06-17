
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStakeholders } from '@/hooks/useStakeholders';
import { supabase } from '@/integrations/supabase/client';
import { normalizeSelectValue } from '@/utils/selectHelpers';

interface User {
  id: string;
  full_name?: string;
  email: string;
}

interface OperatorAssignmentFieldProps {
  operatorType: 'employee' | 'user';
  setOperatorType: (value: 'employee' | 'user') => void;
  assignedOperatorId: string;
  setAssignedOperatorId: (value: string) => void;
  operatorId: string;
  setOperatorId: (value: string) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
}

export const OperatorAssignmentField = ({
  operatorType,
  setOperatorType,
  assignedOperatorId,
  setAssignedOperatorId,
  operatorId,
  setOperatorId,
  disabled = false,
  errors = {}
}: OperatorAssignmentFieldProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const { stakeholders } = useStakeholders();

  // Fetch company users
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('is_company_user', true)
        .eq('account_status', 'approved');

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data || []);
      }
    };

    fetchUsers();
  }, []);

  const employeeStakeholders = stakeholders.filter(s => s.stakeholder_type === 'employee');

  const handleOperatorTypeChange = (value: 'employee' | 'user') => {
    setOperatorType(value);
    // Reset operator selections when type changes
    setAssignedOperatorId('none');
    setOperatorId('none');
  };

  const getFieldErrorClass = (fieldName: string) => {
    return errors[fieldName] ? 'border-red-500 focus:border-red-500' : '';
  };

  return (
    <div className="space-y-2">
      <Label>Operator Assignment</Label>
      <Tabs value={operatorType} onValueChange={handleOperatorTypeChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="employee" disabled={disabled}>Employee</TabsTrigger>
          <TabsTrigger value="user" disabled={disabled}>Internal User</TabsTrigger>
        </TabsList>
        
        <TabsContent value="employee" className="space-y-2">
          <Select 
            value={normalizeSelectValue(assignedOperatorId)} 
            onValueChange={setAssignedOperatorId} 
            disabled={disabled}
          >
            <SelectTrigger className={getFieldErrorClass('assignedOperator')}>
              <SelectValue placeholder="Select an employee (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Employee</SelectItem>
              {employeeStakeholders.map((stakeholder) => (
                <SelectItem key={stakeholder.id} value={stakeholder.id}>
                  {stakeholder.contact_person || stakeholder.company_name || 'Unknown Employee'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.assignedOperator && (
            <p className="text-sm text-red-600">{errors.assignedOperator}</p>
          )}
        </TabsContent>
        
        <TabsContent value="user" className="space-y-2">
          <Select 
            value={normalizeSelectValue(operatorId)} 
            onValueChange={setOperatorId} 
            disabled={disabled}
          >
            <SelectTrigger className={getFieldErrorClass('operator')}>
              <SelectValue placeholder="Select an internal user (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No User</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.operator && (
            <p className="text-sm text-red-600">{errors.operator}</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
