
import { Stakeholder } from '@/hooks/useStakeholders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Phone, Mail, MapPin, Users, Star, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface StakeholderCardProps {
  stakeholder: Stakeholder;
}

export const StakeholderCard = ({ stakeholder }: StakeholderCardProps) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'subcontractor': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      case 'vendor': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-slate-100 text-slate-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800 truncate">
              {stakeholder.company_name || 'Individual'}
            </h3>
            {stakeholder.contact_person && (
              <p className="text-sm text-slate-600 truncate">{stakeholder.contact_person}</p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Assign to Project</DropdownMenuItem>
              <DropdownMenuItem>View Performance</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <Badge className={getTypeColor(stakeholder.stakeholder_type)}>
            {stakeholder.stakeholder_type}
          </Badge>
          <Badge className={getStatusColor(stakeholder.status)}>
            {stakeholder.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {stakeholder.phone && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone size={16} />
            <span>{stakeholder.phone}</span>
          </div>
        )}
        
        {stakeholder.email && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail size={16} />
            <span className="truncate">{stakeholder.email}</span>
          </div>
        )}
        
        {stakeholder.address && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={16} />
            <span className="truncate">{stakeholder.address}</span>
          </div>
        )}
        
        {stakeholder.crew_size && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users size={16} />
            <span>{stakeholder.crew_size} crew members</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Star size={16} className="text-yellow-500" />
          <span className="text-sm font-medium">{stakeholder.rating.toFixed(1)}</span>
        </div>
        
        {stakeholder.specialties && stakeholder.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {stakeholder.specialties.slice(0, 3).map((specialty, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {stakeholder.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{stakeholder.specialties.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
