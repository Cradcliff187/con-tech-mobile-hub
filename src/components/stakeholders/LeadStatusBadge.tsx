import { Badge } from '@/components/ui/badge';
import { LeadStatus } from '@/hooks/useStakeholders';

interface LeadStatusBadgeProps {
  status: LeadStatus;
  size?: 'sm' | 'default';
}

export const LeadStatusBadge = ({ status, size = 'default' }: LeadStatusBadgeProps) => {
  const getStatusConfig = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return { label: 'New Lead', className: 'bg-slate-100 text-slate-800 hover:bg-slate-200' };
      case 'contacted':
        return { label: 'Contacted', className: 'bg-blue-100 text-blue-800 hover:bg-blue-200' };
      case 'qualified':
        return { label: 'Qualified', className: 'bg-purple-100 text-purple-800 hover:bg-purple-200' };
      case 'proposal_sent':
        return { label: 'Proposal Sent', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' };
      case 'negotiating':
        return { label: 'Negotiating', className: 'bg-orange-100 text-orange-800 hover:bg-orange-200' };
      case 'won':
        return { label: 'Won', className: 'bg-green-100 text-green-800 hover:bg-green-200' };
      case 'lost':
        return { label: 'Lost', className: 'bg-red-100 text-red-800 hover:bg-red-200' };
      default:
        return { label: 'Unknown', className: 'bg-slate-100 text-slate-800 hover:bg-slate-200' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      className={`${config.className} ${size === 'sm' ? 'text-xs px-2 py-1' : ''}`}
    >
      {config.label}
    </Badge>
  );
};