import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Phone, 
  Mail, 
  Users, 
  MapPin, 
  FileText, 
  Calendar,  
  MoreHorizontal,
  Edit,
  Trash,
  Clock
} from 'lucide-react';
import { ContactInteraction, InteractionType } from '@/hooks/useContactInteractions';
import { formatDistanceToNow } from 'date-fns';

interface InteractionCardProps {
  interaction: ContactInteraction;
  onEdit?: (interaction: ContactInteraction) => void;
  onDelete?: (id: string) => void;
  onScheduleFollowUp?: (interaction: ContactInteraction) => void;
}

export const InteractionCard = ({ 
  interaction, 
  onEdit, 
  onDelete, 
  onScheduleFollowUp 
}: InteractionCardProps) => {
  const [showFullNotes, setShowFullNotes] = useState(false);

  const getInteractionIcon = (type: InteractionType) => {
    switch (type) {
      case 'call': return <Phone size={16} className="text-blue-600" />;
      case 'email': return <Mail size={16} className="text-green-600" />;
      case 'meeting': return <Users size={16} className="text-purple-600" />;
      case 'site_visit': return <MapPin size={16} className="text-orange-600" />;
      case 'proposal': return <FileText size={16} className="text-amber-600" />;
      case 'follow_up': return <Calendar size={16} className="text-slate-600" />;
      default: return <Phone size={16} className="text-slate-600" />;
    }
  };

  const getInteractionColor = (type: InteractionType) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'email': return 'bg-green-100 text-green-800 border-green-200';
      case 'meeting': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'site_visit': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'proposal': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'follow_up': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatInteractionType = (type: InteractionType) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const truncateNotes = (notes: string, maxLength: number = 150) => {
    if (notes.length <= maxLength) return notes;
    return notes.substring(0, maxLength) + '...';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getInteractionIcon(interaction.interaction_type)}
            <Badge 
              variant="outline" 
              className={`text-xs ${getInteractionColor(interaction.interaction_type)}`}
            >
              {formatInteractionType(interaction.interaction_type)}
            </Badge>
            {interaction.duration_minutes && (
              <Badge variant="outline" className="text-xs">
                <Clock size={12} className="mr-1" />
                {formatDuration(interaction.duration_minutes)}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(interaction.interaction_date), { addSuffix: true })}
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem 
                  onClick={() => onEdit?.(interaction)}
                  className="cursor-pointer"
                >
                  <Edit size={16} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onScheduleFollowUp?.(interaction)}
                  className="cursor-pointer"
                >
                  <Calendar size={16} className="mr-2" />
                  Schedule Follow-up
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(interaction.id)}
                  className="cursor-pointer text-destructive"
                >
                  <Trash size={16} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {interaction.subject && (
          <h4 className="font-medium text-slate-900 mb-2">
            {interaction.subject}
          </h4>
        )}

        {interaction.notes && (
          <div className="mb-3">
            <p className="text-sm text-slate-700">
              {showFullNotes ? interaction.notes : truncateNotes(interaction.notes)}
            </p>
            {interaction.notes.length > 150 && (
              <button
                onClick={() => setShowFullNotes(!showFullNotes)}
                className="text-xs text-primary hover:underline mt-1"
              >
                {showFullNotes ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {interaction.outcome && (
          <div className="mb-3">
            <span className="text-xs font-medium text-slate-600">Outcome: </span>
            <span className="text-sm text-slate-700">{interaction.outcome}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {new Date(interaction.interaction_date).toLocaleDateString()}
          </span>
          
          {interaction.follow_up_required && interaction.follow_up_date && (
            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
              <Calendar size={12} className="mr-1" />
              Follow-up: {new Date(interaction.follow_up_date).toLocaleDateString()}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};