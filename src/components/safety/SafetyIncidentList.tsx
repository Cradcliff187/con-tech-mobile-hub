import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSafetyIncidents } from '@/hooks/useSafetyIncidents';
import { CreateSafetyIncidentDialog } from './CreateSafetyIncidentDialog';
import { SafetyIncidentPhotos } from './SafetyIncidentPhotos';
import { AlertTriangle, Plus, Calendar, User, Shield } from 'lucide-react';
import { format } from 'date-fns';

interface SafetyIncidentListProps {
  projectId?: string;
}

export const SafetyIncidentList = ({ projectId }: SafetyIncidentListProps) => {
  const { safetyIncidents, loading } = useSafetyIncidents(projectId);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'major': return 'bg-orange-500';
      case 'moderate': return 'bg-yellow-500';
      case 'minor': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-4"></div>
          <div className="space-y-3">
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Safety Incidents
        </h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Report Incident
        </Button>
      </div>

      {safetyIncidents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No safety incidents reported</h3>
            <p className="text-slate-600 mb-4">Report safety incidents to maintain workplace safety records.</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Report First Incident
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {safetyIncidents.map((incident) => (
            <Card key={incident.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(incident.severity)}`} title={`${incident.severity} severity`} />
                      <h3 className="text-lg font-semibold">
                        {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)} Incident
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(incident.incident_date), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{incident.reporter?.full_name || incident.reporter?.email}</span>
                      </div>
                      {incident.project?.name && (
                        <div className="text-slate-500">
                          Project: {incident.project.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(incident.status)}>
                    {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 mb-2">Description:</h4>
                    <p className="text-slate-700">{incident.description}</p>
                  </div>
                  
                  {incident.corrective_actions && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 mb-2">Corrective Actions:</h4>
                      <p className="text-slate-700">{incident.corrective_actions}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedIncident(expandedIncident === incident.id ? null : incident.id)}
                    >
                      {expandedIncident === incident.id ? 'Hide' : 'View'} Photos
                    </Button>
                  </div>

                  {expandedIncident === incident.id && (
                    <div className="mt-4 pt-4 border-t">
                      <SafetyIncidentPhotos 
                        safetyIncidentId={incident.id} 
                        projectId={incident.project_id} 
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateSafetyIncidentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        projectId={projectId}
      />
    </div>
  );
};