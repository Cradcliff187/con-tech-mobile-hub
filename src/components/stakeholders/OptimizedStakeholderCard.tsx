
import React, { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Phone, Mail, MapPin, Edit, Trash2 } from 'lucide-react';
import { formatAddress, formatPhoneNumber } from '@/utils/addressFormatting';

interface Stakeholder {
  id: string;
  company_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  stakeholder_type: string;
  specialties?: string[];
  rating?: number;
  status: string;
  address?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

interface OptimizedStakeholderCardProps {
  stakeholder: Stakeholder;
  onEdit?: (stakeholder: Stakeholder) => void;
  onDelete?: (stakeholder: Stakeholder) => void;
}

export const OptimizedStakeholderCard = memo(({ 
  stakeholder, 
  onEdit, 
  onDelete 
}: OptimizedStakeholderCardProps) => {
  const handleEdit = () => onEdit?.(stakeholder);
  const handleDelete = () => onDelete?.(stakeholder);

  const formattedAddress = formatAddress(stakeholder);
  const formattedPhone = formatPhoneNumber(stakeholder.phone);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-slate-800">
              {stakeholder.company_name || 'Unnamed Company'}
            </h3>
            {stakeholder.contact_person && (
              <p className="text-sm text-slate-600">{stakeholder.contact_person}</p>
            )}
          </div>
          <Badge variant={stakeholder.status === 'active' ? 'default' : 'secondary'}>
            {stakeholder.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {stakeholder.stakeholder_type?.replace('_', ' ')}
          </Badge>
          {stakeholder.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-slate-600">{stakeholder.rating}/5</span>
            </div>
          )}
        </div>

        <div className="space-y-1 text-xs text-slate-600">
          {stakeholder.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              <span className="truncate">{stakeholder.email}</span>
            </div>
          )}
          {formattedPhone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span>{formattedPhone}</span>
            </div>
          )}
          {formattedAddress && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{formattedAddress}</span>
            </div>
          )}
        </div>

        {stakeholder.specialties && stakeholder.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {stakeholder.specialties.slice(0, 3).map((specialty, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {stakeholder.specialties.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{stakeholder.specialties.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="flex-1"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedStakeholderCard.displayName = 'OptimizedStakeholderCard';
