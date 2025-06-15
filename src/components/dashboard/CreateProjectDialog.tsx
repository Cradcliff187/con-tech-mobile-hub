
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjects } from '@/hooks/useProjects';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus } from 'lucide-react';
import { CreateStakeholderDialog } from '@/components/stakeholders/CreateStakeholderDialog';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateProjectDialog = ({ open, onOpenChange }: CreateProjectDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<'planning' | 'active'>('planning');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateClient, setShowCreateClient] = useState(false);
  
  const { createProject } = useProjects();
  const { stakeholders, refetch: refetchStakeholders } = useStakeholders();
  const { toast } = useToast();

  // Filter stakeholders to show only clients
  const clients = stakeholders.filter(s => s.stakeholder_type === 'client');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId) {
      toast({
        title: "Client Required",
        description: "Please select a client or create a new one",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    const projectData = {
      name,
      description: description || undefined,
      location: location || undefined,
      budget: budget ? parseFloat(budget) : undefined,
      client_id: clientId,
      status,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      progress: 0
    };

    const { error } = await createProject(projectData);

    if (error) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Unknown error occurred';
      toast({
        title: "Error creating project",
        description: errorMessage,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Project created successfully",
        description: `${name} has been created and is ready for team assignment`
      });
      
      // Reset form
      setName('');
      setDescription('');
      setLocation('');
      setBudget('');
      setClientId('');
      setStatus('planning');
      setStartDate('');
      setEndDate('');
      onOpenChange(false);
    }
    
    setLoading(false);
  };

  const handleClientCreated = () => {
    refetchStakeholders();
    setShowCreateClient(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Office Building Construction"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <div className="flex gap-2">
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company_name || client.contact_person || 'Unknown Client'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowCreateClient(true)}
                  title="Add new client"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {clients.length === 0 && (
                <Alert>
                  <AlertDescription>
                    No clients available. Click the + button to create a client first.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the project scope and objectives"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Project site address or location"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: 'planning' | 'active') => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">Target Completion</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !name}>
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <CreateStakeholderDialog 
        open={showCreateClient} 
        onOpenChange={setShowCreateClient}
        defaultType="client"
        onSuccess={handleClientCreated}
      />
    </>
  );
};
