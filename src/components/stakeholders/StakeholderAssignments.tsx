
import { useState } from 'react';
import { useStakeholderAssignments } from '@/hooks/useStakeholders';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Briefcase } from 'lucide-react';

export const StakeholderAssignments = () => {
  const { assignments, loading } = useStakeholderAssignments();
  const { projects } = useProjects();
  const [projectFilter, setProjectFilter] = useState('all');

  const filteredAssignments = assignments.filter(assignment => 
    projectFilter === 'all' || assignment.project_id === projectFilter
  );

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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Current Assignments</h3>
        
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredAssignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {assignment.stakeholder?.company_name || 'Unknown Stakeholder'}
                </CardTitle>
                <Badge className={
                  assignment.status === 'active' ? 'bg-green-100 text-green-800' :
                  assignment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }>
                  {assignment.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-slate-500" />
                  <span className="text-sm">
                    {assignment.stakeholder?.stakeholder_type}
                  </span>
                </div>
                
                {assignment.role && (
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-slate-500" />
                    <span className="text-sm">{assignment.role}</span>
                  </div>
                )}
                
                {assignment.start_date && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-500" />
                    <span className="text-sm">
                      {new Date(assignment.start_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              
              {assignment.notes && (
                <p className="text-sm text-slate-600 mt-2">{assignment.notes}</p>
              )}
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  Edit Assignment
                </Button>
                <Button variant="outline" size="sm">
                  View Performance
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-500 mb-2">No assignments found</div>
          <div className="text-sm text-slate-400">
            Stakeholders will appear here once assigned to projects
          </div>
        </div>
      )}
    </div>
  );
};
