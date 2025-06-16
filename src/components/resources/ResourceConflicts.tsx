
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Calendar, Users, Wrench, CheckCircle, X } from 'lucide-react';
import { useResourceAllocations } from '@/hooks/useResourceAllocations';
import { useEquipment } from '@/hooks/useEquipment';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ResourceConflict {
  id: string;
  type: 'equipment' | 'personnel' | 'schedule';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedProjects: string[];
  suggestedAction: string;
  dueDate?: string;
  resolved?: boolean;
}

export const ResourceConflicts = () => {
  const [conflicts, setConflicts] = useState<ResourceConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingIds, setResolvingIds] = useState<Set<string>>(new Set());
  const { allocations } = useResourceAllocations();
  const { equipment } = useEquipment();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && allocations.length >= 0 && equipment.length >= 0) {
      generateConflicts();
    }
  }, [allocations, equipment, user]);

  const generateConflicts = () => {
    const detectedConflicts: ResourceConflict[] = [];

    // Check for overallocated personnel
    const personnelConflicts = checkPersonnelOverallocation();
    detectedConflicts.push(...personnelConflicts);

    // Check for equipment conflicts
    const equipmentConflicts = checkEquipmentConflicts();
    detectedConflicts.push(...equipmentConflicts);

    // Check for maintenance scheduling conflicts
    const maintenanceConflicts = checkMaintenanceConflicts();
    detectedConflicts.push(...maintenanceConflicts);

    setConflicts(detectedConflicts);
    setLoading(false);
  };

  const checkPersonnelOverallocation = (): ResourceConflict[] => {
    const conflicts: ResourceConflict[] = [];
    const memberAllocationMap = new Map<string, { totalHours: number; projects: string[] }>();

    // Aggregate member allocations across all projects
    allocations.forEach(allocation => {
      allocation.members?.forEach(member => {
        const existing = memberAllocationMap.get(member.name) || { totalHours: 0, projects: [] };
        existing.totalHours += member.hours_allocated;
        if (!existing.projects.includes(allocation.team_name)) {
          existing.projects.push(allocation.team_name);
        }
        memberAllocationMap.set(member.name, existing);
      });
    });

    // Check for overallocation (more than 40 hours per week)
    memberAllocationMap.forEach((allocation, memberName) => {
      if (allocation.totalHours > 40) {
        conflicts.push({
          id: `personnel-${memberName}`,
          type: 'personnel',
          severity: allocation.totalHours > 50 ? 'critical' : 'high',
          title: `${memberName} Overallocated`,
          description: `${memberName} is allocated ${allocation.totalHours} hours per week across multiple projects`,
          affectedProjects: allocation.projects,
          suggestedAction: 'Redistribute workload or extend project timeline'
        });
      }
    });

    return conflicts;
  };

  const checkEquipmentConflicts = (): ResourceConflict[] => {
    const conflicts: ResourceConflict[] = [];
    const equipmentProjectMap = new Map<string, string[]>();

    // Group equipment by projects
    equipment.forEach(item => {
      if (item.project_id && item.project?.name) {
        const existing = equipmentProjectMap.get(item.name) || [];
        if (!existing.includes(item.project.name)) {
          existing.push(item.project.name);
        }
        equipmentProjectMap.set(item.name, existing);
      }
    });

    // Check for equipment assigned to multiple projects
    equipmentProjectMap.forEach((projects, equipmentName) => {
      if (projects.length > 1) {
        conflicts.push({
          id: `equipment-${equipmentName}`,
          type: 'equipment',
          severity: 'high',
          title: `${equipmentName} Double Booking`,
          description: `${equipmentName} is assigned to multiple projects simultaneously`,
          affectedProjects: projects,
          suggestedAction: 'Reschedule one project or arrange backup equipment'
        });
      }
    });

    return conflicts;
  };

  const checkMaintenanceConflicts = (): ResourceConflict[] => {
    const conflicts: ResourceConflict[] = [];
    const today = new Date();
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    equipment.forEach(item => {
      if (item.maintenance_due && item.project_id) {
        const maintenanceDate = new Date(item.maintenance_due);
        
        // Check if maintenance is due while equipment is in use
        if (maintenanceDate <= oneWeekFromNow && item.status === 'in-use') {
          conflicts.push({
            id: `maintenance-${item.id}`,
            type: 'schedule',
            severity: maintenanceDate <= today ? 'critical' : 'medium',
            title: `${item.name} Maintenance Conflict`,
            description: `${item.name} maintenance scheduled during active project use`,
            affectedProjects: item.project?.name ? [item.project.name] : [],
            suggestedAction: 'Reschedule maintenance or arrange backup equipment',
            dueDate: item.maintenance_due
          });
        }
      }
    });

    return conflicts;
  };

  const handleResolveConflict = async (conflictId: string) => {
    setResolvingIds(prev => new Set(prev).add(conflictId));
    
    // Simulate conflict resolution (in real implementation, this would update the database)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setConflicts(prev => prev.map(conflict => 
      conflict.id === conflictId 
        ? { ...conflict, resolved: true }
        : conflict
    ));
    
    setResolvingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(conflictId);
      return newSet;
    });

    toast({
      title: "Conflict Resolved",
      description: "The resource conflict has been marked as resolved"
    });
  };

  const handleDismissConflict = (conflictId: string) => {
    setConflicts(prev => prev.filter(conflict => conflict.id !== conflictId));
    toast({
      title: "Conflict Dismissed",
      description: "The conflict has been dismissed"
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'equipment': return <Wrench size={16} />;
      case 'personnel': return <Users size={16} />;
      case 'schedule': return <Calendar size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const activeConflicts = conflicts.filter(c => !c.resolved);
  const criticalCount = activeConflicts.filter(c => c.severity === 'critical').length;
  const highCount = activeConflicts.filter(c => c.severity === 'high').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="h-24 bg-slate-200 rounded"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
          </div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Conflicts</p>
                <p className="text-2xl font-bold text-slate-800">{activeConflicts.length}</p>
              </div>
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{highCount}</p>
              </div>
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conflicts List */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Conflicts</CardTitle>
        </CardHeader>
        <CardContent>
          {activeConflicts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No Active Conflicts</h3>
              <p className="text-slate-500">All resources are properly allocated with no conflicts detected.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeConflicts.map((conflict) => (
                <div key={conflict.id} className={`border rounded-lg p-4 ${getSeverityColor(conflict.severity)} border-l-4`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(conflict.type)}
                        <h4 className="font-medium text-slate-800">{conflict.title}</h4>
                        <Badge variant="outline" className="capitalize">
                          {conflict.type}
                        </Badge>
                        <Badge className={getSeverityColor(conflict.severity)}>
                          {conflict.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-3">{conflict.description}</p>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium text-slate-600 mb-1">Affected Projects:</p>
                          <div className="flex flex-wrap gap-1">
                            {conflict.affectedProjects.map((project, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {project}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium text-slate-600 mb-1">Suggested Action:</p>
                          <p className="text-sm text-slate-700">{conflict.suggestedAction}</p>
                        </div>
                        
                        {conflict.dueDate && (
                          <div className="text-xs text-slate-500">
                            Deadline: {new Date(conflict.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleResolveConflict(conflict.id)}
                        disabled={resolvingIds.has(conflict.id)}
                      >
                        {resolvingIds.has(conflict.id) ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-green-600 mr-2"></div>
                        ) : (
                          <CheckCircle size={14} className="mr-2" />
                        )}
                        Resolve
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDismissConflict(conflict.id)}
                      >
                        <X size={14} className="mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
