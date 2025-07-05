import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SmartDocumentUpload } from '@/components/documents/SmartDocumentUpload';
import { useRFIs, useRFIDocuments } from '@/hooks/useRFIs';
import { useProjects } from '@/hooks/useProjects';
import { useStakeholders } from '@/hooks/useStakeholders';
import { CreateRFIData } from '@/types/rfi';
import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';

interface CreateRFIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}

export const CreateRFIDialog = ({ open, onOpenChange, projectId }: CreateRFIDialogProps) => {
  const { createRFI } = useRFIs();
  const { projects } = useProjects();
  const { stakeholders } = useStakeholders();
  const [loading, setLoading] = useState(false);
  const [newRFIId, setNewRFIId] = useState<string | null>(null);
  const { attachDocument } = useRFIDocuments(newRFIId || undefined);

  const [formData, setFormData] = useState<CreateRFIData>({
    title: '',
    description: '',
    project_id: projectId || '',
    priority: 'medium',
    assigned_to: '',
    due_date: ''
  });

  const companyUsers = stakeholders.filter(s => s.stakeholder_type === 'employee');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.project_id) return;

    setLoading(true);
    try {
      const cleanData: CreateRFIData = {
        ...formData,
        assigned_to: formData.assigned_to || undefined,
        due_date: formData.due_date || undefined
      };

      const rfi = await createRFI(cleanData);
      if (rfi) {
        setNewRFIId(rfi.id);
        // Reset form but keep dialog open for document upload
        setFormData({
          title: '',
          description: '',
          project_id: projectId || '',
          priority: 'medium',
          assigned_to: '',
          due_date: ''
        });
      }
    } catch (error) {
      console.error('Error creating RFI:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (files: File[]) => {
    if (!newRFIId) return;

    // Files are handled by SmartDocumentUpload, we just need to attach them
    // This will be called when upload completes
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      project_id: projectId || '',
      priority: 'medium',
      assigned_to: '',
      due_date: ''
    });
    setNewRFIId(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {newRFIId ? 'Add Supporting Documents' : 'Create New RFI'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {!newRFIId ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter RFI title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project">Project *</Label>
                  <Select
                    value={formData.project_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}
                    required
                  >
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the information request"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                        setFormData(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assigned_to">Assign To</Label>
                    <Select
                      value={formData.assigned_to}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {companyUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.contact_person || user.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={handleClose} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || !formData.title.trim() || !formData.project_id}>
                    {loading ? 'Creating...' : 'Create RFI'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-800 mb-1">RFI Created Successfully!</h3>
                  <p className="text-sm text-green-600">
                    You can now attach supporting documents to this RFI.
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Supporting Documents</h3>
                    <Badge variant="secondary" className="flex items-center gap-1" aria-label="Document category: RFI Documents">
                      <HelpCircle className="w-3 h-3" />
                      RFI Documents
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    Upload any relevant documents, drawings, or photos that support this RFI.
                  </p>
                  
                  <SmartDocumentUpload
                    projectId={formData.project_id}
                    preSelectedCategory="rfis"
                    onUploadComplete={() => {
                      // Document upload completed - could refresh RFI documents here
                    }}
                    className="border-2 border-dashed border-slate-300 rounded-lg p-6"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button onClick={handleClose}>
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
