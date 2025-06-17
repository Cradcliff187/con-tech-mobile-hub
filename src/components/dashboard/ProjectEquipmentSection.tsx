
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEquipment } from '@/hooks/useEquipment';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AssignEquipmentToProjectDialog } from './AssignEquipmentToProjectDialog';
import { Plus, Wrench, User } from 'lucide-react';
import type { Project } from '@/types/database';

interface ProjectEquipmentSectionProps {
  project: Project;
}

export const ProjectEquipmentSection = ({ project }: ProjectEquipmentSectionProps) => {
  const { equipment, loading, refetch } = useEquipment();
  const { toast } = useToast();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const projectEquipment = equipment.filter(eq => eq.project_id === project.id);

  const handleReleaseEquipment = async (equipmentId: string) => {
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
        title: "Success",
        description: "Equipment released from project"
      });

      refetch();
    } catch (error) {
      console.error('Error releasing equipment:', error);
      toast({
        title: "Error",
        description: "Failed to release equipment",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading equipment...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Equipment Assigned to Project</CardTitle>
          <Button 
            onClick={() => setIsAssignDialogOpen(true)}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus size={16} className="mr-2" />
            Assign Equipment
          </Button>
        </CardHeader>
        <CardContent>
          {projectEquipment.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Wrench size={48} className="mx-auto mb-4 text-slate-300" />
              <p>No equipment assigned to this project</p>
              <Button 
                onClick={() => setIsAssignDialogOpen(true)}
                variant="outline"
                className="mt-4"
              >
                <Plus size={16} className="mr-2" />
                Assign Equipment
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectEquipment.map((eq) => (
                <div 
                  key={eq.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{eq.name}</h3>
                      <p className="text-sm text-slate-600">{eq.type}</p>
                    </div>
                    <Badge 
                      variant={eq.status === 'in-use' ? 'default' : 'secondary'}
                    >
                      {eq.status}
                    </Badge>
                  </div>
                  
                  {(eq.operator || eq.assigned_operator) && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User size={14} />
                      <span>
                        {eq.operator?.full_name || eq.assigned_operator?.contact_person || 'Assigned Operator'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                      Utilization: {eq.utilization_rate}%
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReleaseEquipment(eq.id)}
                    >
                      Release
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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
