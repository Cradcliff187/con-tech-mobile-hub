
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEquipment } from '@/hooks/useEquipment';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AssignEquipmentToProjectDialog } from './AssignEquipmentToProjectDialog';
import { Plus, Wrench, User, Calendar, AlertTriangle } from 'lucide-react';
import { ResponsiveTable } from '@/components/common/ResponsiveTable';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';
import type { Project } from '@/types/database';

interface ProjectEquipmentSectionProps {
  project: Project;
}

export const ProjectEquipmentSection = ({ project }: ProjectEquipmentSectionProps) => {
  const { equipment, loading, refetch } = useEquipment();
  const { toast } = useToast();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [releasingId, setReleasingId] = useState<string | null>(null);

  const projectEquipment = equipment.filter(eq => eq.project_id === project.id);

  const handleReleaseEquipment = async (equipmentId: string, equipmentName: string) => {
    setReleasingId(equipmentId);
    try {
      const { error } = await supabase
        .from('equipment')
        .update({
          project_id: null,
          status: 'available',
          operator_id: null,
          assigned_operator_id: null
        })
        .eq('id', equipmentId);

      if (error) throw error;

      toast({
        title: "Equipment Released",
        description: `${equipmentName} has been released from ${project.name}`
      });

      refetch();
    } catch (error) {
      console.error('Error releasing equipment:', error);
      toast({
        title: "Error",
        description: "Failed to release equipment",
        variant: "destructive"
      });
    } finally {
      setReleasingId(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in-use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-service': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Equipment Name',
      render: (value: string, row: any) => (
        <div className="flex items-center gap-2">
          <Wrench size={16} className="text-slate-500" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => value || 'N/A'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge className={getStatusBadgeColor(value)}>
          {value.replace('-', ' ')}
        </Badge>
      )
    },
    {
      key: 'assigned_operator',
      label: 'Operator',
      mobileLabel: 'Operator',
      render: (value: any, row: any) => {
        if (row.assigned_operator) {
          return (
            <div className="flex items-center gap-1">
              <User size={14} />
              <span className="text-sm">{row.assigned_operator.contact_person || 'Unknown'}</span>
            </div>
          );
        }
        if (row.operator) {
          return (
            <div className="flex items-center gap-1">
              <User size={14} />
              <span className="text-sm">{row.operator.full_name || 'Unknown'}</span>
            </div>
          );
        }
        return <span className="text-slate-500 text-sm">Unassigned</span>;
      }
    },
    {
      key: 'maintenance_due',
      label: 'Maintenance Due',
      mobileLabel: 'Maintenance',
      render: (value: string) => {
        if (!value) return <span className="text-slate-500">N/A</span>;
        
        const dueDate = new Date(value);
        const today = new Date();
        const isOverdue = dueDate < today;
        
        return (
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
            {isOverdue && <AlertTriangle size={14} />}
            <Calendar size={14} />
            <span className="text-sm">{dueDate.toLocaleDateString()}</span>
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: any) => (
        <TouchFriendlyButton
          variant="outline"
          size="sm"
          onClick={() => handleReleaseEquipment(row.id, row.name)}
          disabled={releasingId === row.id}
          className="text-red-600 hover:text-red-700"
        >
          {releasingId === row.id ? 'Releasing...' : 'Release'}
        </TouchFriendlyButton>
      )
    }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-2 text-slate-500">Loading equipment...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench size={20} />
                Project Equipment
              </CardTitle>
              <p className="text-sm text-slate-600">
                Equipment currently assigned to {project.name}
              </p>
            </div>
            <TouchFriendlyButton
              onClick={() => setIsAssignDialogOpen(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus size={16} className="mr-2" />
              Assign Equipment
            </TouchFriendlyButton>
          </div>
        </CardHeader>
        <CardContent>
          {projectEquipment.length === 0 ? (
            <div className="text-center py-8">
              <Wrench size={48} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No Equipment Assigned</h3>
              <p className="text-slate-500 mb-4">
                This project doesn't have any equipment assigned yet.
              </p>
              <TouchFriendlyButton
                onClick={() => setIsAssignDialogOpen(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus size={16} className="mr-2" />
                Assign Equipment
              </TouchFriendlyButton>
            </div>
          ) : (
            <ResponsiveTable
              columns={columns}
              data={projectEquipment}
              emptyMessage="No equipment assigned to this project"
            />
          )}
        </CardContent>
      </Card>

      <AssignEquipmentToProjectDialog
        project={project}
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        onSuccess={refetch}
      />
    </>
  );
};
