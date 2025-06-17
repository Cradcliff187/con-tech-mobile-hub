
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStakeholders } from '@/hooks/useStakeholders';
import { supabase } from '@/integrations/supabase/client';

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
}

export const OperatorAssignmentField = ({
  operatorType,
  setOperatorType,
  assignedOperatorId,
  setAssignedOperatorId,
  operatorId,
  setOperatorId,
  disabled = false
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

  return (
    <div className="space-y-2">
      <Label>Operator Assignment</Label>
      <Tabs value={operatorType} onValueChange={(value) => setOperatorType(value as 'employee' | 'user')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="employee" disabled={disabled}>Employee</TabsTrigger>
          <TabsTrigger value="user" disabled={disabled}>Internal User</TabsTrigger>
        </TabsList>
        
        <TabsContent value="employee" className="space-y-2">
          <Select value={assignedOperatorId} onValueChange={setAssignedOperatorId} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder="Select an employee (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No Employee</SelectItem>
              {employeeStakeholders.map((stakeholder) => (
                <SelectItem key={stakeholder.id} value={stakeholder.id}>
                  {stakeholder.contact_person || stakeholder.company_name || 'Unknown Employee'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TabsContent>
        
        <TabsContent value="user" className="space-y-2">
          <Select value={operatorId} onValueChange={setOperatorId} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder="Select an internal user (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No User</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TabsContent>
      </Tabs>
    </div>
  );
};
