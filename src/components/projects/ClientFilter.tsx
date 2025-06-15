
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStakeholders } from '@/hooks/useStakeholders';

interface ClientFilterProps {
  selectedClientId?: string;
  onClientChange: (clientId: string | undefined) => void;
  className?: string;
}

export const ClientFilter = ({ selectedClientId, onClientChange, className }: ClientFilterProps) => {
  const { stakeholders } = useStakeholders();
  
  const clients = stakeholders.filter(s => 
    s.stakeholder_type === 'client' || s.stakeholder_type === 'vendor'
  );

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
        {clients.map((client) => (
          <SelectItem key={client.id} value={client.id}>
            {client.company_name || client.contact_person || 'Unknown Client'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
