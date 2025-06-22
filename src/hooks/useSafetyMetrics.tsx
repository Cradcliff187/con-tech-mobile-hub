
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';

interface SafetyMetrics {
  daysWithoutIncident: number;
  safetyComplianceRate: number;
  toolboxTalksCompleted: number;
  toolboxTalksTotal: number;
  ppeComplianceRate: number;
  lastIncidentDate?: Date;
  lastSafetyAudit?: Date;
}

export const useSafetyMetrics = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const [metrics, setMetrics] = useState<SafetyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSafetyMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        // If no specific project, get data for all projects
        const projectFilter = projectId ? { project_id: projectId } : {};

        // Get days without incident
        let daysWithoutIncident = 0;
        if (projectId) {
          const { data: daysData } = await supabase.rpc('calculate_days_without_incident', {
            p_project_id: projectId
          });
          daysWithoutIncident = daysData || 0;
        } else {
          // For all projects, get the minimum days without incident
          const { data: incidentsData } = await supabase
            .from('safety_incidents')
            .select('incident_date')
            .order('incident_date', { ascending: false })
            .limit(1);
          
          if (incidentsData && incidentsData.length > 0) {
            const lastIncident = new Date(incidentsData[0].incident_date);
            const today = new Date();
            daysWithoutIncident = Math.floor((today.getTime() - lastIncident.getTime()) / (1000 * 60 * 60 * 24));
          } else {
            daysWithoutIncident = 365; // No incidents on record
          }
        }

        // Get safety compliance rates
        const { data: complianceData } = await supabase
          .from('safety_compliance')
          .select('compliance_rate, compliance_type, last_audit_date')
          .match(projectFilter);

        let safetyComplianceRate = 0;
        let ppeComplianceRate = 0;
        let lastSafetyAudit: Date | undefined;

        if (complianceData && complianceData.length > 0) {
          // Calculate average compliance rate
          safetyComplianceRate = Math.round(
            complianceData.reduce((sum, item) => sum + item.compliance_rate, 0) / complianceData.length
          );

          // Get PPE specific compliance rate
          const ppeCompliance = complianceData.find(item => item.compliance_type === 'ppe');
          ppeComplianceRate = ppeCompliance?.compliance_rate || safetyComplianceRate;

          // Get most recent audit date
          const auditDates = complianceData
            .filter(item => item.last_audit_date)
            .map(item => new Date(item.last_audit_date!))
            .sort((a, b) => b.getTime() - a.getTime());
          
          lastSafetyAudit = auditDates[0];
        } else {
          // Default values if no compliance data
          safetyComplianceRate = 85;
          ppeComplianceRate = 89;
        }

        // Get toolbox talks data
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const { data: toolboxData } = await supabase
          .from('safety_toolbox_talks')
          .select('completed_count, total_required')
          .match({ ...projectFilter, month: currentMonth, year: currentYear });

        let toolboxTalksCompleted = 0;
        let toolboxTalksTotal = 10; // Default requirement

        if (toolboxData && toolboxData.length > 0) {
          toolboxTalksCompleted = toolboxData.reduce((sum, item) => sum + item.completed_count, 0);
          toolboxTalksTotal = toolboxData.reduce((sum, item) => sum + item.total_required, 0);
        }

        // Get last incident date
        const { data: lastIncidentData } = await supabase
          .from('safety_incidents')
          .select('incident_date')
          .match(projectFilter)
          .order('incident_date', { ascending: false })
          .limit(1);

        const lastIncidentDate = lastIncidentData && lastIncidentData.length > 0 
          ? new Date(lastIncidentData[0].incident_date)
          : undefined;

        setMetrics({
          daysWithoutIncident,
          safetyComplianceRate,
          toolboxTalksCompleted,
          toolboxTalksTotal,
          ppeComplianceRate,
          lastIncidentDate,
          lastSafetyAudit
        });

      } catch (err) {
        console.error('Error fetching safety metrics:', err);
        setError('Failed to load safety metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchSafetyMetrics();
  }, [projectId]);

  return { metrics, loading, error };
};
