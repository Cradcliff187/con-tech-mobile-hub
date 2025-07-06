import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InteractionCard } from './InteractionCard';
import { LogInteractionDialog } from './LogInteractionDialog';
import { EditInteractionDialog } from './EditInteractionDialog';
import { ScheduleFollowUpDialog } from './ScheduleFollowUpDialog';
import { useContactInteractions, ContactInteraction, InteractionType } from '@/hooks/useContactInteractions';
import { useDialogState } from '@/hooks/useDialogState';
import { Plus, Search, Filter, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface InteractionTimelineProps {
  stakeholderId: string;
}

export const InteractionTimeline = ({ stakeholderId }: InteractionTimelineProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedInteraction, setSelectedInteraction] = useState<ContactInteraction | null>(null);
  
  const { 
    interactions, 
    loading, 
    createInteraction, 
    updateInteraction, 
    deleteInteraction 
  } = useContactInteractions(stakeholderId);
  
  const { activeDialog, openDialog, closeDialog, isDialogOpen } = useDialogState();

  const filteredInteractions = useMemo(() => {
    return interactions.filter(interaction => {
      const matchesSearch = !searchQuery || 
        interaction.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interaction.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interaction.outcome?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || interaction.interaction_type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [interactions, searchQuery, typeFilter]);

  const handleCreateInteraction = () => {
    setSelectedInteraction(null);
    openDialog('create');
  };

  const handleEditInteraction = (interaction: ContactInteraction) => {
    setSelectedInteraction(interaction);
    openDialog('edit');
  };

  const handleScheduleFollowUp = (interaction: ContactInteraction) => {
    setSelectedInteraction(interaction);
    openDialog('followUp');
  };

  const handleDeleteInteraction = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this interaction?')) {
      await deleteInteraction(id);
    }
  };

  const handleInteractionSaved = () => {
    closeDialog();
    setSelectedInteraction(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Contact History</h3>
          <p className="text-sm text-muted-foreground">
            {interactions.length} interaction{interactions.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <Button onClick={handleCreateInteraction} className="bg-primary hover:bg-primary/90">
          <Plus size={16} className="mr-2" />
          Log Interaction
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search interactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="call">Calls</SelectItem>
                  <SelectItem value="email">Emails</SelectItem>
                  <SelectItem value="meeting">Meetings</SelectItem>
                  <SelectItem value="site_visit">Site Visits</SelectItem>
                  <SelectItem value="proposal">Proposals</SelectItem>
                  <SelectItem value="follow_up">Follow-ups</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {filteredInteractions.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchQuery || typeFilter !== 'all' ? 'No matching interactions' : 'No interactions yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || typeFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start building a relationship by logging your first interaction'
                }
              </p>
              {!searchQuery && typeFilter === 'all' && (
                <Button onClick={handleCreateInteraction}>
                  <Plus size={16} className="mr-2" />
                  Log First Interaction
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInteractions.map((interaction) => (
            <InteractionCard
              key={interaction.id}
              interaction={interaction}
              onEdit={handleEditInteraction}
              onDelete={handleDeleteInteraction}
              onScheduleFollowUp={handleScheduleFollowUp}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <LogInteractionDialog
        open={isDialogOpen('create')}
        onOpenChange={(open) => !open && closeDialog()}
        stakeholderId={stakeholderId}
        onInteractionSaved={handleInteractionSaved}
      />

      <EditInteractionDialog
        open={isDialogOpen('edit')}
        onOpenChange={(open) => !open && closeDialog()}
        interaction={selectedInteraction}
        onInteractionSaved={handleInteractionSaved}
      />

      <ScheduleFollowUpDialog
        open={isDialogOpen('followUp')}
        onOpenChange={(open) => !open && closeDialog()}
        stakeholder={null} // We'll handle this differently for interactions
        onScheduled={handleInteractionSaved}
      />
    </div>
  );
};