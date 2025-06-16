
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStakeholders } from '@/hooks/useStakeholders';
import { validateSelectData, getSelectDisplayName } from '@/utils/selectHelpers';

interface ClientFilterProps {
  selectedClientId?: string;
  onClientChange: (clientId: string | undefined) => void;
  className?: string;
}

export const ClientFilter = ({ selectedClientId, onClientChange, className }: ClientFilterProps) => {
  const { stakeholders, loading } = useStakeholders();
  
  const clients = stakeholders.filter(s => 
    s.stakeholder_type === 'client' || s.stakeholder_type === 'vendor'
  );

  const validatedClients = validateSelectData(clients);

  return (
    <Select 
      value={selectedClientId || "all"} 
      onValueChange={(value) => onClientChange(value === "all" ? undefined : value)}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Filter by client" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Clients</SelectItem>
        {loading ? (
          <SelectItem value="loading" disabled>Loading clients...</SelectItem>
        ) : (
          validatedClients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {getSelectDisplayName(client, ['company_name', 'contact_person'], 'Unknown Client')}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
