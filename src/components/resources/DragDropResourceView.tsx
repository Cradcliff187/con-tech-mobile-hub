
import { useState, useMemo, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useResourceAllocations } from '@/hooks/useResourceAllocations';
import { useProjects } from '@/hooks/useProjects';
import { useResourceConflicts } from '@/hooks/useResourceConflicts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Calendar, Users, Filter, GripVertical } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface TeamMemberAllocation {
  memberId: string;
  memberName: string;
  totalHours: number;
  totalAllocated: number;
  utilizationRate: number;
  projects: {
    projectId: string;
    projectName: string;
    hoursAllocated: number;
    hoursUsed: number;
    percentage: number;
    status: string;
    allocationId: string;
    teamMemberId: string;
  }[];
  conflicts: boolean;
  availability: number;
}

interface DragPreview {
  memberId: string;
  sourceProjectId: string;
  targetProjectId: string;
  hours: number;
  wouldOverAllocate: boolean;
}

export const DragDropResourceView = () => {
  const { projects } = useProjects();
  const { allocations, loading, refetch } = useResourceAllocations();
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [filterMember, setFilterMember] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const { toast } = useToast();

  // Get active projects only
  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'planning');

  // Process allocations into team member view with drag-drop support
  const teamMemberAllocations = useMemo(() => {
    const memberMap = new Map<string, TeamMemberAllocation>();

    allocations.forEach(allocation => {
      const project = projects.find(p => p.id === allocation.project_id);
      if (!project) return;

      allocation.members?.forEach(member => {
        const key = member.user_id || member.name;
        
        if (!memberMap.has(key)) {
          memberMap.set(key, {
            memberId: key,
            memberName: member.name,
            totalHours: 0,
            totalAllocated: 0,
            utilizationRate: 0,
            projects: [],
            conflicts: false,
            availability: member.availability
          });
        }

        const memberData = memberMap.get(key)!;
        memberData.totalHours += member.hours_used;
        memberData.totalAllocated += member.hours_allocated;
        
        // Check for over-allocation (conflicts)
        if (memberData.totalAllocated > 40) {
          memberData.conflicts = true;
        }

        memberData.utilizationRate = memberData.totalAllocated > 0 
          ? (memberData.totalHours / memberData.totalAllocated) * 100 
          : 0;

        memberData.projects.push({
          projectId: project.id,
          projectName: project.name,
          hoursAllocated: member.hours_allocated,
          hoursUsed: member.hours_used,
          percentage: (member.hours_allocated / 40) * 100,
          status: project.status,
          allocationId: allocation.id,
          teamMemberId: member.id
        });
      });
    });

    return Array.from(memberMap.values());
  }, [allocations, projects]);

  // Filter team members based on search criteria
  const filteredMembers = teamMemberAllocations.filter(member => {
    const matchesName = !filterMember || member.memberName.toLowerCase().includes(filterMember.toLowerCase());
    const matchesProject = !filterProject || member.projects.some(p => p.projectId === filterProject);
    return matchesName && matchesProject;
  });

  // Group members by project for drag-drop lists
  const projectGroups = useMemo(() => {
    const groups = new Map<string, TeamMemberAllocation[]>();
    
    // Initialize groups for all active projects
    activeProjects.forEach(project => {
      groups.set(project.id, []);
    });

    // Add members to their respective project groups
    filteredMembers.forEach(member => {
      member.projects.forEach(project => {
        if (groups.has(project.projectId)) {
          groups.get(project.projectId)!.push({
            ...member,
            // Override with project-specific data for this view
            totalAllocated: project.hoursAllocated,
            totalHours: project.hoursUsed
          });
        }
      });
    });

    return groups;
  }, [filteredMembers, activeProjects]);

  const handleDragStart = useCallback((start: any) => {
    const { draggableId } = start;
    const [memberId, sourceProjectId] = draggableId.split('::');
    
    // Find the member and their allocation for this project
    const member = filteredMembers.find(m => m.memberId === memberId);
    const projectAllocation = member?.projects.find(p => p.projectId === sourceProjectId);
    
    if (member && projectAllocation) {
      console.log('Drag started:', { memberId, sourceProjectId, hours: projectAllocation.hoursAllocated });
    }
  }, [filteredMembers]);

  const handleDragUpdate = useCallback((update: any) => {
    const { draggableId, destination } = update;
    
    if (!destination) {
      setDragPreview(null);
      return;
    }

    const [memberId, sourceProjectId] = draggableId.split('::');
    const targetProjectId = destination.droppableId;
    
    if (sourceProjectId === targetProjectId) {
      setDragPreview(null);
      return;
    }

    const member = filteredMembers.find(m => m.memberId === memberId);
    const projectAllocation = member?.projects.find(p => p.projectId === sourceProjectId);
    
    if (member && projectAllocation) {
      // Calculate if this would cause over-allocation
      const currentTargetAllocation = member.projects
        .filter(p => p.projectId === targetProjectId)
        .reduce((sum, p) => sum + p.hoursAllocated, 0);
      
      const newTotalForTarget = currentTargetAllocation + projectAllocation.hoursAllocated;
      const wouldOverAllocate = newTotalForTarget > 40;

      setDragPreview({
        memberId,
        sourceProjectId,
        targetProjectId,
        hours: projectAllocation.hoursAllocated,
        wouldOverAllocate
      });
    }
  }, [filteredMembers]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    setDragPreview(null);
    
    const { draggableId, destination, source } = result;

    // If dropped outside a valid area or in the same position
    if (!destination || 
        (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const [memberId, sourceProjectId] = draggableId.split('::');
    const targetProjectId = destination.droppableId;

    // Don't allow moving within the same project
    if (sourceProjectId === targetProjectId) {
      return;
    }

    const member = filteredMembers.find(m => m.memberId === memberId);
    const sourceProject = member?.projects.find(p => p.projectId === sourceProjectId);
    
    if (!member || !sourceProject) {
      toast({
        title: "Error",
        description: "Could not find member or project allocation",
        variant: "destructive"
      });
      return;
    }

    // Check for over-allocation
    const currentTargetAllocation = member.projects
      .filter(p => p.projectId === targetProjectId)
      .reduce((sum, p) => sum + p.hoursAllocated, 0);
    
    const newTotalForTarget = currentTargetAllocation + sourceProject.hoursAllocated;
    
    if (newTotalForTarget > 40) {
      toast({
        title: "Over-allocation Prevented",
        description: `Moving ${sourceProject.hoursAllocated} hours would exceed the 40-hour weekly limit`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Find target allocation for the week
      const targetAllocation = allocations.find(a => 
        a.project_id === targetProjectId && 
        a.week_start_date === allocations.find(sa => sa.id === sourceProject.allocationId)?.week_start_date
      );

      if (!targetAllocation) {
        toast({
          title: "Error",
          description: "Could not find target project allocation for this week",
          variant: "destructive"
        });
        return;
      }

      // Update database: move the team member to new allocation
      const { error: updateError } = await supabase
        .from('team_members')
        .update({
          allocation_id: targetAllocation.id
        })
        .eq('id', sourceProject.teamMemberId);

      if (updateError) {
        throw updateError;
      }

      // Update source allocation total_used
      const sourceAllocation = allocations.find(a => a.id === sourceProject.allocationId);
      if (sourceAllocation) {
        const { error: sourceUpdateError } = await supabase
          .from('resource_allocations')
          .update({
            total_used: Math.max(0, sourceAllocation.total_used - (sourceProject.hoursAllocated * sourceProject.hoursUsed / sourceProject.hoursAllocated || 0))
          })
          .eq('id', sourceProject.allocationId);

        if (sourceUpdateError) {
          console.error('Error updating source allocation:', sourceUpdateError);
        }
      }

      // Update target allocation total_used
      const { error: targetUpdateError } = await supabase
        .from('resource_allocations')
        .update({
          total_used: targetAllocation.total_used + (sourceProject.hoursAllocated * sourceProject.hoursUsed / sourceProject.hoursAllocated || 0)
        })
        .eq('id', targetAllocation.id);

      if (targetUpdateError) {
        console.error('Error updating target allocation:', targetUpdateError);
      }

      toast({
        title: "Resource Moved Successfully",
        description: `${member.memberName} moved from ${activeProjects.find(p => p.id === sourceProjectId)?.name} to ${activeProjects.find(p => p.id === targetProjectId)?.name}`,
      });

      // Refresh data
      refetch();
    } catch (error) {
      console.error('Error moving resource:', error);
      toast({
        title: "Error",
        description: "Failed to move resource allocation",
        variant: "destructive"
      });
    }
  }, [filteredMembers, allocations, activeProjects, toast, refetch]);

  const getAllocationColor = (percentage: number) => {
    if (percentage > 100) return 'bg-red-500';
    if (percentage > 80) return 'bg-orange-500';
    if (percentage > 60) return 'bg-yellow-500';
    if (percentage > 40) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'bg-red-100 text-red-800 border-red-200';
    if (rate >= 75) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rate >= 50) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-4"></div>
          <div className="space-y-3">
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Interactive Resource Management</h2>
          <p className="text-slate-600">Drag and drop team members between projects</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-500" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}
            >
              Previous Week
            </Button>
            <span className="text-sm text-slate-600 px-3">
              {format(startOfWeek(selectedWeek), 'MMM dd')} - {format(endOfWeek(selectedWeek), 'MMM dd, yyyy')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))}
            >
              Next Week
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter size={20} />
            <CardTitle>Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Filter by Team Member</label>
              <Input
                placeholder="Search team member..."
                value={filterMember}
                onChange={(e) => setFilterMember(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Filter by Project</label>
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger>
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Projects</SelectItem>
                  {activeProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drag Preview */}
      {dragPreview && (
        <Card className={`border-2 ${dragPreview.wouldOverAllocate ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Moving {dragPreview.hours} hours from{' '}
                  {activeProjects.find(p => p.id === dragPreview.sourceProjectId)?.name} to{' '}
                  {activeProjects.find(p => p.id === dragPreview.targetProjectId)?.name}
                </p>
              </div>
              {dragPreview.wouldOverAllocate && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Would Over-allocate
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drag and Drop Resource Grid */}
      <DragDropContext
        onDragStart={handleDragStart}
        onDragUpdate={handleDragUpdate}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeProjects.map((project) => {
            const projectMembers = projectGroups.get(project.id) || [];
            
            return (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{project.name}</span>
                    <Badge variant="outline">{projectMembers.length} members</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Droppable droppableId={project.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[200px] space-y-2 p-2 rounded-lg border-2 border-dashed transition-colors ${
                          snapshot.isDraggingOver 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-slate-200'
                        }`}
                      >
                        {projectMembers.map((member, index) => {
                          const dragId = `${member.memberId}::${project.id}`;
                          
                          return (
                            <Draggable
                              key={dragId}
                              draggableId={dragId}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`p-3 bg-white rounded-lg border shadow-sm transition-shadow ${
                                    snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <div
                                          {...provided.dragHandleProps}
                                          className="text-slate-400 hover:text-slate-600"
                                        >
                                          <GripVertical size={14} />
                                        </div>
                                        <span className="font-medium text-sm">{member.memberName}</span>
                                        {member.conflicts && (
                                          <AlertTriangle className="text-red-500" size={12} />
                                        )}
                                      </div>
                                      <div className="text-xs text-slate-600 mt-1">
                                        {member.totalAllocated} hours allocated
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        {member.totalHours} hours used
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      <Badge className={getUtilizationColor(member.utilizationRate)}>
                                        {member.utilizationRate.toFixed(0)}%
                                      </Badge>
                                      <div
                                        className={`w-3 h-3 rounded-full ${getAllocationColor((member.totalAllocated / 40) * 100)}`}
                                        title={`${((member.totalAllocated / 40) * 100).toFixed(1)}% of full-time`}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                        
                        {projectMembers.length === 0 && (
                          <div className="text-center py-8 text-slate-500">
                            <Users size={24} className="mx-auto mb-2 text-slate-300" />
                            <p className="text-sm">No team members assigned</p>
                            <p className="text-xs">Drag members here to assign</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DragDropContext>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>0-40% allocation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>40-60% allocation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>60-80% allocation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>80-100% allocation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Over-allocated ({'>'}100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={12} />
              <span>Resource conflict</span>
            </div>
            <div className="flex items-center gap-2">
              <GripVertical className="text-slate-400" size={12} />
              <span>Drag handle</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
