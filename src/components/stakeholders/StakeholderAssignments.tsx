import { useState } from 'react';
import { useStakeholderAssignments } from '@/hooks/useStakeholderAssignments';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar, User, Briefcase, DollarSign, Clock, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateSelectData, getSelectDisplayName } from '@/utils/selectHelpers';

export const StakeholderAssignments = () => {
  const { assignments, loading, updateAssignment, refetch } = useStakeholderAssignments();
  const { projects, loading: projectsLoading } = useProjects();
  const { toast } = useToast();
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingAssignments, setUpdatingAssignments] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    assignmentId: string;
    newStatus: string;
    currentStatus: string;
  }>({ open: false, assignmentId: '', newStatus: '', currentStatus: '' });

  const filteredAssignments = assignments.filter(assignment => {
    const matchesProject = projectFilter === 'all' || assignment.project_id === projectFilter;
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    const matchesSearch = 
      assignment.stakeholder?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesProject && matchesStatus && matchesSearch;
  });

  const handleStatusChange = (assignmentId: string, newStatus: string, currentStatus: string) => {
    // Show confirmation for sensitive status changes
    if (newStatus === 'cancelled' || (currentStatus === 'completed' && newStatus !== 'completed')) {
      setConfirmDialog({
        open: true,
        assignmentId,
        newStatus,
        currentStatus
      });
    } else {
      performStatusUpdate(assignmentId, newStatus);
    }
  };

  const performStatusUpdate = async (assignmentId: string, newStatus: string) => {
    setUpdatingAssignments(prev => new Set([...prev, assignmentId]));
    
    const { error } = await updateAssignment(assignmentId, { status: newStatus });
    
    if (!error) {
      toast({
        title: "Success",
        description: "Assignment status updated successfully"
      });
      // Refresh the assignments list
      await refetch();
    } else {
      toast({
        title: "Error",
        description: "Failed to update assignment status",
        variant: "destructive"
      });
    }
    
    setUpdatingAssignments(prev => {
      const newSet = new Set(prev);
      newSet.delete(assignmentId);
      return newSet;
    });
  };

  const handleConfirmStatusChange = () => {
    performStatusUpdate(confirmDialog.assignmentId, confirmDialog.newStatus);
    setConfirmDialog({ open: false, assignmentId: '', newStatus: '', currentStatus: '' });
  };

  const getStatusConfirmationMessage = (newStatus: string, currentStatus: string) => {
    if (newStatus === 'cancelled') {
      return "Are you sure you want to cancel this assignment? This action will mark the assignment as cancelled.";
    }
    if (currentStatus === 'completed' && newStatus !== 'completed') {
      return "This assignment is currently marked as completed. Are you sure you want to change its status?";
    }
    return "Are you sure you want to change the status of this assignment?";
  };

  const validatedProjects = validateSelectData(projects);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <Input
            placeholder="Search assignments by stakeholder, role, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 min-h-[44px]"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-full sm:w-48 min-h-[44px]">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Projects</SelectItem>
              {projectsLoading ? (
                <SelectItem value="loading" disabled>Loading projects...</SelectItem>
              ) : (
                validatedProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {getSelectDisplayName(project, ['name'], 'Unnamed Project')}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 min-h-[44px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-slate-600">
        Showing {filteredAssignments.length} of {assignments.length} assignments
      </div>

      {/* Assignments List */}
      <div className="grid gap-4">
        {filteredAssignments.map((assignment) => {
          const project = validatedProjects.find(p => p.id === assignment.project_id);
          const isUpdating = updatingAssignments.has(assignment.id);
          
          return (
            <Card key={assignment.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      {getSelectDisplayName(assignment.stakeholder, ['company_name'], 'Unknown Stakeholder')}
                    </CardTitle>
                    {project && (
                      <p className="text-sm text-slate-600 mt-1">
                        Project: {getSelectDisplayName(project, ['name'], 'Unnamed Project')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge className={
                      assignment.status === 'active' ? 'bg-green-100 text-green-800' :
                      assignment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      assignment.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      assignment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-slate-100 text-slate-800'
                    }>
                      {assignment.status}
                    </Badge>
                    <Select
                      value={assignment.status}
                      onValueChange={(newStatus) => handleStatusChange(assignment.id, newStatus, assignment.status)}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    {isUpdating && (
                      <div className="flex items-center text-sm text-slate-500">
                        <Clock size={16} className="animate-spin mr-1" />
                        Updating...
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={16} className="text-slate-500" />
                    <span>{assignment.stakeholder?.stakeholder_type}</span>
                  </div>
                  
                  {assignment.role && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase size={16} className="text-slate-500" />
                      <span>{assignment.role}</span>
                    </div>
                  )}
                  
                  {assignment.start_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-slate-500" />
                      <span>
                        {new Date(assignment.start_date).toLocaleDateString()}
                        {assignment.end_date && ` - ${new Date(assignment.end_date).toLocaleDateString()}`}
                      </span>
                    </div>
                  )}
                  
                  {assignment.hourly_rate && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign size={16} className="text-slate-500" />
                      <span>${assignment.hourly_rate}/hr</span>
                    </div>
                  )}
                </div>
                
                {assignment.notes && (
                  <div className="bg-slate-50 p-3 rounded-md">
                    <p className="text-sm text-slate-600">{assignment.notes}</p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="min-h-[36px]">
                    Edit Assignment
                  </Button>
                  <Button variant="outline" size="sm" className="min-h-[36px]">
                    View Performance
                  </Button>
                  <Button variant="outline" size="sm" className="min-h-[36px]">
                    Contact Stakeholder
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-500 mb-2">
            {searchTerm || projectFilter !== 'all' || statusFilter !== 'all'
              ? 'No assignments match your search criteria'
              : 'No assignments found'
            }
          </div>
          <div className="text-sm text-slate-400">
            {searchTerm || projectFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Stakeholders will appear here once assigned to projects'
            }
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              {getStatusConfirmationMessage(confirmDialog.newStatus, confirmDialog.currentStatus)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStatusChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
