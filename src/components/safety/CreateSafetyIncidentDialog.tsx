import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSafetyIncidents } from '@/hooks/useSafetyIncidents';
import { useProjects } from '@/hooks/useProjects';
import { CreateSafetyIncidentData } from '@/types/safetyIncident';
import { format } from 'date-fns';

interface CreateSafetyIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  onIncidentCreated?: (incidentId: string) => void;
}

export const CreateSafetyIncidentDialog = ({ 
  open, 
  onOpenChange, 
  projectId: propProjectId,
  onIncidentCreated 
}: CreateSafetyIncidentDialogProps) => {
  const [searchParams] = useSearchParams();
  const currentProjectId = propProjectId || searchParams.get('project') || '';
  
  const [formData, setFormData] = useState<CreateSafetyIncidentData>({
    project_id: currentProjectId,
    incident_date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    severity: 'minor',
    corrective_actions: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createSafetyIncident } = useSafetyIncidents();
  const { projects } = useProjects();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_id || !formData.description.trim()) return;

    setIsSubmitting(true);
    try {
      const incident = await createSafetyIncident(formData);
      if (incident) {
        onIncidentCreated?.(incident.id);
        onOpenChange(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating safety incident:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      project_id: currentProjectId,
      incident_date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      severity: 'minor',
      corrective_actions: ''
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Report Safety Incident</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Select 
              value={formData.project_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
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
            <Label htmlFor="incident_date">Incident Date</Label>
            <Input
              id="incident_date"
              type="date"
              value={formData.incident_date}
              onChange={(e) => setFormData(prev => ({ ...prev, incident_date: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity</Label>
            <Select 
              value={formData.severity} 
              onValueChange={(value: 'minor' | 'moderate' | 'major' | 'critical') => 
                setFormData(prev => ({ ...prev, severity: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Incident Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what happened..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="corrective_actions">Immediate Actions Taken</Label>
            <Textarea
              id="corrective_actions"
              value={formData.corrective_actions}
              onChange={(e) => setFormData(prev => ({ ...prev, corrective_actions: e.target.value }))}
              placeholder="Describe immediate corrective actions..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Incident'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};