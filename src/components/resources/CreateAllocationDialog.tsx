
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useResourceAllocations } from '@/hooks/useResourceAllocations';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';

interface CreateAllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateAllocationDialog = ({ open, onOpenChange }: CreateAllocationDialogProps) => {
  const [teamName, setTeamName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [weekStartDate, setWeekStartDate] = useState('');
  const [allocationType, setAllocationType] = useState<'weekly' | 'daily'>('weekly');
  const [loading, setLoading] = useState(false);

  const { createAllocation } = useResourceAllocations();
  const { projects } = useProjects();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !projectId || !totalBudget || !weekStartDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await createAllocation({
      team_name: teamName,
      project_id: projectId,
      total_budget: parseFloat(totalBudget),
      week_start_date: weekStartDate,
      allocation_type: allocationType
    });

    if (error) {
      toast({
        title: "Error creating allocation",
        description: error.message || "Failed to create resource allocation",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Resource allocation created successfully"
      });
      // Reset form
      setTeamName('');
      setProjectId('');
      setTotalBudget('');
      setWeekStartDate('');
      setAllocationType('weekly');
      onOpenChange(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Resource Allocation</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name *</Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g., Construction Team A"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalBudget">Total Budget *</Label>
            <Input
              id="totalBudget"
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weekStartDate">Start Date *</Label>
            <Input
              id="weekStartDate"
              type="date"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allocationType">Allocation Type</Label>
            <Select value={allocationType} onValueChange={(value: 'weekly' | 'daily') => setAllocationType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Allocation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
