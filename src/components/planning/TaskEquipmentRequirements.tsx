
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEquipment } from '@/hooks/useEquipment';
import { useEquipmentAllocations } from '@/hooks/useEquipmentAllocations';
import { Wrench, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Task } from '@/types/database';

interface TaskEquipmentRequirementsProps {
  task: Task;
  projectId: string;
}

export const TaskEquipmentRequirements = ({ task, projectId }: TaskEquipmentRequirementsProps) => {
  const { equipment } = useEquipment();
  const { allocations } = useEquipmentAllocations();
  
  // Get equipment allocated to this project
  const projectEquipment = equipment.filter(eq => eq.project_id === projectId);
  
  // Get equipment allocations that overlap with task dates
  const taskAllocations = allocations.filter(allocation => {
    if (!task.start_date || !task.due_date) return false;
    
    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.due_date);
    const allocationStart = new Date(allocation.start_date);
    const allocationEnd = new Date(allocation.end_date);
    
    return (taskStart <= allocationEnd && taskEnd >= allocationStart) &&
           allocation.task_id === task.id;
  });

  // Determine equipment status for this task
  const getEquipmentStatus = () => {
    if (taskAllocations.length === 0) {
      return { status: 'none', message: 'No equipment assigned' };
    }
    
    const hasConflicts = taskAllocations.some(allocation => {
      // Check if equipment is double-booked
      const conflictingAllocations = allocations.filter(a => 
        a.equipment_id === allocation.equipment_id &&
        a.id !== allocation.id &&
        new Date(a.start_date) <= new Date(allocation.end_date) &&
        new Date(a.end_date) >= new Date(allocation.start_date)
      );
      return conflictingAllocations.length > 0;
    });
    
    if (hasConflicts) {
      return { status: 'conflict', message: 'Equipment conflicts detected' };
    }
    
    return { status: 'ready', message: 'Equipment ready' };
  };

  const equipmentStatus = getEquipmentStatus();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          Equipment Requirements
        </CardTitle>
        <Badge 
          variant={
            equipmentStatus.status === 'ready' ? 'default' : 
            equipmentStatus.status === 'conflict' ? 'destructive' : 'secondary'
          }
        >
          {equipmentStatus.status === 'ready' && <CheckCircle className="h-3 w-3 mr-1" />}
          {equipmentStatus.status === 'conflict' && <AlertTriangle className="h-3 w-3 mr-1" />}
          {equipmentStatus.message}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Task Equipment Allocations */}
        {taskAllocations.length > 0 ? (
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700">Assigned Equipment</div>
            {taskAllocations.map((allocation) => {
              const equipmentItem = equipment.find(eq => eq.id === allocation.equipment_id);
              return (
                <div key={allocation.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">
                      {equipmentItem?.name || 'Unknown Equipment'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {allocation.start_date} - {allocation.end_date}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {equipmentItem?.type}
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500">
            <Wrench size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm mb-3">No equipment assigned to this task</p>
            <Button size="sm" variant="outline">
              <Plus size={14} className="mr-2" />
              Assign Equipment
            </Button>
          </div>
        )}

        {/* Available Project Equipment */}
        {projectEquipment.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700">Available Equipment</div>
            <div className="grid grid-cols-2 gap-2">
              {projectEquipment.slice(0, 4).map((eq) => (
                <div key={eq.id} className="text-xs p-2 bg-orange-50 rounded border">
                  <div className="font-medium text-orange-800">{eq.name}</div>
                  <div className="text-orange-600">{eq.type}</div>
                </div>
              ))}
            </div>
            {projectEquipment.length > 4 && (
              <div className="text-xs text-slate-500 text-center">
                +{projectEquipment.length - 4} more available
              </div>
            )}
          </div>
        )}

        {/* Equipment Conflicts Warning */}
        {equipmentStatus.status === 'conflict' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-red-800">Equipment Conflicts</div>
                <div className="text-red-600">
                  Some equipment is double-booked during this task's timeframe. 
                  Review allocations to resolve conflicts.
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
