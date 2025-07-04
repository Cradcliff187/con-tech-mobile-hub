import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SmartDocumentUpload } from '@/components/documents/SmartDocumentUpload';
import { useChangeOrders, useChangeOrderDocuments } from '@/hooks/useChangeOrders';
import { useProjects } from '@/hooks/useProjects';
import { CreateChangeOrderData } from '@/types/changeOrder';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';

interface CreateChangeOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}

export const CreateChangeOrderDialog = ({ open, onOpenChange, projectId }: CreateChangeOrderDialogProps) => {
  const { createChangeOrder } = useChangeOrders();
  const { projects } = useProjects();
  const [loading, setLoading] = useState(false);
  const [newChangeOrderId, setNewChangeOrderId] = useState<string | null>(null);
  const [documentsExpanded, setDocumentsExpanded] = useState(false);
  const { documents } = useChangeOrderDocuments(newChangeOrderId || undefined);

  const [formData, setFormData] = useState<CreateChangeOrderData>({
    title: '',
    description: '',
    project_id: projectId || '',
    cost_impact: 0,
    schedule_impact_days: 0,
    priority: 'medium',
    reason_for_change: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.project_id) return;

    setLoading(true);
    try {
      const cleanData: CreateChangeOrderData = {
        ...formData,
        cost_impact: formData.cost_impact || undefined,
        schedule_impact_days: formData.schedule_impact_days || undefined,
        reason_for_change: formData.reason_for_change || undefined
      };

      const changeOrder = await createChangeOrder(cleanData);
      if (changeOrder) {
        setNewChangeOrderId(changeOrder.id);
        setDocumentsExpanded(true);
        // Reset form but keep dialog open for document upload
        setFormData({
          title: '',
          description: '',
          project_id: projectId || '',
          cost_impact: 0,
          schedule_impact_days: 0,
          priority: 'medium',
          reason_for_change: ''
        });
      }
    } catch (error) {
      console.error('Error creating change order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      project_id: projectId || '',
      cost_impact: 0,
      schedule_impact_days: 0,
      priority: 'medium',
      reason_for_change: ''
    });
    setNewChangeOrderId(null);
    setDocumentsExpanded(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {newChangeOrderId ? 'Add Supporting Documents' : 'Create New Change Order'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {!newChangeOrderId ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter change order title"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
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

                  <div>
                    <Label htmlFor="cost_impact">Cost Impact ($)</Label>
                    <Input
                      id="cost_impact"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.cost_impact || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        cost_impact: e.target.value ? parseFloat(e.target.value) : 0 
                      }))}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="schedule_impact">Schedule Impact (Days)</Label>
                    <Input
                      id="schedule_impact"
                      type="number"
                      min="0"
                      value={formData.schedule_impact_days || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        schedule_impact_days: e.target.value ? parseInt(e.target.value) : 0 
                      }))}
                      placeholder="0"
                    />
                  </div>

                  <div>
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
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the change order details"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="reason_for_change">Reason for Change</Label>
                  <Textarea
                    id="reason_for_change"
                    value={formData.reason_for_change}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason_for_change: e.target.value }))}
                    placeholder="Explain why this change is necessary"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={handleClose} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || !formData.title.trim() || !formData.project_id}>
                    {loading ? 'Creating...' : 'Create Change Order'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-800 mb-1">Change Order Created Successfully!</h3>
                  <p className="text-sm text-green-600">
                    You can now attach supporting documents to this change order.
                  </p>
                </div>

                <Separator />

                <Collapsible open={documentsExpanded} onOpenChange={setDocumentsExpanded}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Supporting Documentation
                        {documents.length > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                            {documents.length}/5
                          </span>
                        )}
                      </div>
                      {documentsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="space-y-4 mt-4">
                    <p className="text-sm text-slate-600">
                      Upload supporting documents, contracts, or drawings related to this change order. Maximum 5 documents allowed.
                    </p>
                    
                    <SmartDocumentUpload
                      projectId={formData.project_id}
                      variant="inline"
                      onUploadComplete={() => {
                        // Document upload completed - the hook will auto-refresh
                      }}
                      className="border-2 border-dashed border-slate-300 rounded-lg p-6"
                    />

                    {documents.length >= 5 && (
                      <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                        Maximum of 5 documents allowed per change order.
                      </p>
                    )}
                  </CollapsibleContent>
                </Collapsible>

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
