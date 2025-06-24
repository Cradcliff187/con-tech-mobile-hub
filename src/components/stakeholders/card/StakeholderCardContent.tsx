
import { Stakeholder } from '@/hooks/useStakeholders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Users, Star } from 'lucide-react';
import { formatAddress, formatPhoneNumber } from '@/utils/addressFormatting';

interface StakeholderCardContentProps {
  stakeholder: Stakeholder;
  onPhoneCall: (e: React.MouseEvent) => void;
  onEmailSend: (e: React.MouseEvent) => void;
}

export const StakeholderCardContent = ({ 
  stakeholder, 
  onPhoneCall, 
  onEmailSend 
}: StakeholderCardContentProps) => {
  const formattedAddress = formatAddress(stakeholder);
  const formattedPhone = formatPhoneNumber(stakeholder.phone);

  return (
    <div className="space-y-3">
      {formattedPhone && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPhoneCall}
            className="p-0 h-auto font-normal text-slate-600 hover:text-orange-600 break-words"
          >
            <Phone size={16} className="mr-2 flex-shrink-0" />
            <span>{formattedPhone}</span>
          </Button>
        </div>
      )}
      
      {stakeholder.email && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEmailSend}
            className="p-0 h-auto font-normal text-slate-600 hover:text-orange-600 break-all"
          >
            <Mail size={16} className="mr-2 flex-shrink-0" />
            <span>{stakeholder.email}</span>
          </Button>
        </div>
      )}
      
      {formattedAddress && (
        <div className="flex items-start gap-2 text-sm text-slate-600">
          <MapPin size={16} className="mt-0.5 flex-shrink-0" />
          <span className="break-words">{formattedAddress}</span>
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
        <span className="text-sm font-medium">
          {stakeholder.rating !== null ? stakeholder.rating.toFixed(1) : 'No rating'}
        </span>
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
    </div>
  );
};
