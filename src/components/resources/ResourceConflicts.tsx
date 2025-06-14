
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Calendar, Users, Wrench } from 'lucide-react';

interface ResourceConflict {
  id: string;
  type: 'equipment' | 'personnel' | 'schedule';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedProjects: string[];
  suggestedAction: string;
  dueDate?: string;
}

export const ResourceConflicts = () => {
  const conflicts: ResourceConflict[] = [
    {
      id: '1',
      type: 'equipment',
      severity: 'high',
      title: 'Excavator Double Booking',
      description: 'CAT 320 excavator is scheduled for both Downtown Office Complex and Residential Phase 2 on June 18-19',
      affectedProjects: ['Downtown Office Complex', 'Residential Housing Phase 2'],
      suggestedAction: 'Reschedule one project or arrange backup equipment',
      dueDate: '2024-06-18'
    },
    {
      id: '2',
      type: 'personnel',
      severity: 'critical',
      title: 'Site Supervisor Overallocation',
      description: 'Mike Johnson is assigned to 3 concurrent projects exceeding 120% capacity',
      affectedProjects: ['Downtown Office Complex', 'Highway Bridge', 'Residential Phase 2'],
      suggestedAction: 'Reassign secondary supervisor or extend timeline'
    },
    {
      id: '3',
      type: 'schedule',
      severity: 'medium',
      title: 'Material Delivery Conflict',
      description: 'Steel delivery scheduled for same timeframe as concrete pour at Downtown site',
      affectedProjects: ['Downtown Office Complex'],
      suggestedAction: 'Coordinate delivery schedule with concrete contractor',
      dueDate: '2024-06-20'
    },
    {
      id: '4',
      type: 'equipment',
      severity: 'low',
      title: 'Crane Maintenance Overlap',
      description: 'Liebherr 150 maintenance scheduled during peak usage period',
      affectedProjects: ['Highway Bridge Renovation'],
      suggestedAction: 'Move maintenance to weekend or arrange backup crane'
    }
  ];

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

  const criticalCount = conflicts.filter(c => c.severity === 'critical').length;
  const highCount = conflicts.filter(c => c.severity === 'high').length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Conflicts</p>
                <p className="text-2xl font-bold text-slate-800">{conflicts.length}</p>
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
          <div className="space-y-4">
            {conflicts.map((conflict) => (
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
                    <Button variant="outline" size="sm">
                      Resolve
                    </Button>
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
