
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StakeholderProjects } from './StakeholderProjects';
import { StakeholderAssignmentsList } from './StakeholderAssignmentsList';
import { StakeholderPerformanceMetrics } from './StakeholderPerformanceMetrics';
import { InteractionTimeline } from './InteractionTimeline';
import { Stakeholder } from '@/hooks/useStakeholders';
import { Skeleton } from '@/components/ui/skeleton';

interface StakeholderDetailProps {
  stakeholderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StakeholderDetail = ({ stakeholderId, open, onOpenChange }: StakeholderDetailProps) => {
  const [stakeholder, setStakeholder] = useState<Stakeholder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && stakeholderId) {
      setLoading(true);
      const fetchStakeholder = async () => {
        const { data, error } = await supabase
          .from('stakeholders')
          .select('*')
          .eq('id', stakeholderId)
          .single();
        if (data) {
          setStakeholder(data);
        } else {
          console.error('Error fetching stakeholder:', error);
        }
        setLoading(false);
      };
      fetchStakeholder();
    }
  }, [stakeholderId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        {loading || !stakeholder ? (
          <div className="p-6">
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{stakeholder.company_name || stakeholder.contact_person || 'Stakeholder Details'}</DialogTitle>
              <DialogDescription>
                <span className="capitalize">{stakeholder.stakeholder_type}</span>
                {stakeholder.contact_person && ` - ${stakeholder.contact_person}`}
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="projects" className="flex-grow flex flex-col overflow-hidden">
              <TabsList className="bg-slate-100">
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                <TabsTrigger value="interactions">Interactions</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="availability" disabled>Availability</TabsTrigger>
              </TabsList>
              <div className="flex-grow overflow-y-auto p-1 mt-4">
                <TabsContent value="projects">
                    <StakeholderProjects stakeholderId={stakeholderId} stakeholderType={stakeholder.stakeholder_type} />
                </TabsContent>
                <TabsContent value="assignments">
                  <StakeholderAssignmentsList stakeholderId={stakeholderId} />
                </TabsContent>
                <TabsContent value="interactions">
                  <InteractionTimeline stakeholderId={stakeholderId} />
                </TabsContent>
                <TabsContent value="performance">
                  <StakeholderPerformanceMetrics stakeholderId={stakeholderId} />
                </TabsContent>
                <TabsContent value="availability">
                  <p>Availability details will be shown here.</p>
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
