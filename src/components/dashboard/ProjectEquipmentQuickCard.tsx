
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEquipment } from '@/hooks/useEquipment';
import { AssignEquipmentToProjectDialog } from './AssignEquipmentToProjectDialog';
import { Wrench, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '@/types/database';

interface ProjectEquipmentQuickCardProps {
  project: Project;
}

export const ProjectEquipmentQuickCard = ({ project }: ProjectEquipmentQuickCardProps) => {
  const { equipment, loading } = useEquipment();
  const navigate = useNavigate();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const projectEquipment = equipment.filter(eq => eq.project_id === project.id);
  const activeEquipment = projectEquipment.filter(eq => eq.status === 'in-use');

  const handleViewAll = () => {
    navigate(`/?section=resources&project=${project.id}&tab=equipment`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Wrench className="h-5 w-5 text-orange-600" />
            </div>
            Equipment
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewAll}
            className="text-slate-500 hover:text-slate-700"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Equipment Summary */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-slate-800">
                {projectEquipment.length}
              </div>
              <div className="text-sm text-slate-600">
                Total Assigned
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={activeEquipment.length > 0 ? "default" : "secondary"}>
                  {activeEquipment.length} Active
                </Badge>
              </div>
              <div className="text-xs text-slate-500">
                {projectEquipment.length - activeEquipment.length} Available
              </div>
            </div>
          </div>

          {/* Recent Equipment */}
          {projectEquipment.length > 0 ? (
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-700">Recent Equipment</div>
              <div className="space-y-1">
                {projectEquipment.slice(0, 3).map((eq) => (
                  <div key={eq.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 truncate">{eq.name}</span>
                    <Badge 
                      variant={eq.status === 'in-use' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {eq.status}
                    </Badge>
                  </div>
                ))}
                {projectEquipment.length > 3 && (
                  <div className="text-xs text-slate-500">
                    +{projectEquipment.length - 3} more...
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-slate-500">
              <Wrench size={32} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No equipment assigned</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAssignDialogOpen(true)}
              size="sm"
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              <Plus size={14} className="mr-2" />
              Assign Equipment
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAll}
              className="flex-1"
            >
              View All
            </Button>
          </div>
        </CardContent>
      </Card>

      <AssignEquipmentToProjectDialog
        project={project}
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        onSuccess={() => {
          // Equipment will be refetched by the useEquipment hook
        }}
      />
    </>
  );
};
