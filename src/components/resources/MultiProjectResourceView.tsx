
import { useState, useMemo } from 'react';
import { useResourceAllocations } from '@/hooks/useResourceAllocations';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Calendar, Users, Filter, Move } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { DragDropResourceView } from './DragDropResourceView';

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
  }[];
  conflicts: boolean;
  availability: number;
}

export const MultiProjectResourceView = () => {
  const { projects } = useProjects();
  const { allocations, loading } = useResourceAllocations();
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [filterMember, setFilterMember] = useState('');
  const [filterProject, setFilterProject] = useState('all');

  // Get active projects only
  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'planning');

  // Process allocations into team member view
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
        if (memberData.totalAllocated > 40) { // Assuming 40 hours per week max
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
          percentage: (member.hours_allocated / 40) * 100, // Percentage of full-time
          status: project.status
        });
      });
    });

    return Array.from(memberMap.values());
  }, [allocations, projects]);

  // Filter team members based on search criteria
  const filteredMembers = teamMemberAllocations.filter(member => {
    const matchesName = !filterMember || member.memberName.toLowerCase().includes(filterMember.toLowerCase());
    const matchesProject = filterProject === 'all' || member.projects.some(p => p.projectId === filterProject);
    return matchesName && matchesProject;
  });

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalMembers = filteredMembers.length;
    const conflictMembers = filteredMembers.filter(m => m.conflicts).length;
    const avgUtilization = filteredMembers.reduce((sum, m) => sum + m.utilizationRate, 0) / totalMembers || 0;
    const totalHoursAllocated = filteredMembers.reduce((sum, m) => sum + m.totalAllocated, 0);

    return {
      totalMembers,
      conflictMembers,
      avgUtilization,
      totalHoursAllocated
    };
  }, [filteredMembers]);

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'bg-red-100 text-red-800 border-red-200';
    if (rate >= 75) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rate >= 50) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getAllocationColor = (percentage: number) => {
    if (percentage > 100) return 'bg-red-500';
    if (percentage > 80) return 'bg-orange-500';
    if (percentage > 60) return 'bg-yellow-500';
    if (percentage > 40) return 'bg-blue-500';
    return 'bg-green-500';
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
          <h2 className="text-2xl font-bold text-slate-800">Multi-Project Resource Management</h2>
          <p className="text-slate-600">Overview of resource allocation across all active projects</p>
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

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Team Members</p>
                <p className="text-2xl font-bold text-slate-800">{summaryStats.totalMembers}</p>
              </div>
              <Users className="text-blue-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Resource Conflicts</p>
                <p className="text-2xl font-bold text-red-600">{summaryStats.conflictMembers}</p>
              </div>
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Utilization</p>
                <p className="text-2xl font-bold text-slate-800">{summaryStats.avgUtilization.toFixed(1)}%</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-white text-xs">%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Hours Allocated</p>
                <p className="text-2xl font-bold text-slate-800">{summaryStats.totalHoursAllocated}</p>
              </div>
              <Calendar className="text-orange-600" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Tabs */}
      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Filter size={16} />
            Table View
          </TabsTrigger>
          <TabsTrigger value="interactive" className="flex items-center gap-2">
            <Move size={16} />
            Interactive View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-6">
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
                      <SelectItem value="all">All Projects</SelectItem>
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

          {/* Resource Allocation Matrix */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Allocation Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Team Member</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Project Assignments</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.memberId} className={member.conflicts ? 'bg-red-50' : ''}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {member.conflicts && <AlertTriangle className="text-red-500" size={16} />}
                            {member.memberName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getUtilizationColor(member.utilizationRate)}>
                            {member.utilizationRate.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {member.totalHours} / {member.totalAllocated} hrs
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">
                            {member.availability}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {member.projects.map((project) => (
                              <div key={project.projectId} className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${getAllocationColor(project.percentage)}`}
                                  title={`${project.percentage.toFixed(1)}% allocation`}
                                />
                                <span className="text-sm truncate max-w-32">{project.projectName}</span>
                                <span className="text-xs text-slate-500">
                                  ({project.hoursAllocated}h)
                                </span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.conflicts ? (
                            <Badge variant="destructive" className="text-xs">
                              Over-allocated
                            </Badge>
                          ) : member.utilizationRate > 80 ? (
                            <Badge variant="default" className="text-xs bg-yellow-500">
                              High Utilization
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Available
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredMembers.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No team members found matching the current filters.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

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
                  <span>Over-allocated ({'>'} 100%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-red-500" size={12} />
                  <span>Resource conflict</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactive">
          <DragDropResourceView />
        </TabsContent>
      </Tabs>
    </div>
  );
};
