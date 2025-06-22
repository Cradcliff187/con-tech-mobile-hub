
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';

interface SafetyMetrics {
  daysWithoutIncident: number | null;
  safetyComplianceRate: number | null;
  toolboxTalksCompleted: number;
  toolboxTalksTotal: number;
  ppeComplianceRate: number | null;
  lastIncidentDate?: Date;
  lastSafetyAudit?: Date;
  hasIncidentData: boolean;
  hasComplianceData: boolean;
  hasToolboxData: boolean;
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

        // Check if we have any incident data
        const { data: incidentsData, error: incidentsError } = await supabase
          .from('safety_incidents')
          .select('incident_date')
          .match(projectFilter)
          .order('incident_date', { ascending: false });

        if (incidentsError) throw incidentsError;

        const hasIncidentData = incidentsData && incidentsData.length > 0;
        let daysWithoutIncident: number | null = null;
        let lastIncidentDate: Date | undefined;

        if (hasIncidentData) {
          const lastIncident = new Date(incidentsData[0].incident_date);
          const today = new Date();
          daysWithoutIncident = Math.floor((today.getTime() - lastIncident.getTime()) / (1000 * 60 * 60 * 24));
          lastIncidentDate = lastIncident;
        }

        // Check if we have any compliance data
        const { data: complianceData, error: complianceError } = await supabase
          .from('safety_compliance')
          .select('compliance_rate, compliance_type, last_audit_date')
          .match(projectFilter);

        if (complianceError) throw complianceError;

        const hasComplianceData = complianceData && complianceData.length > 0;
        let safetyComplianceRate: number | null = null;
        let ppeComplianceRate: number | null = null;
        let lastSafetyAudit: Date | undefined;

        if (hasComplianceData) {
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
        }

        // Check if we have any toolbox talks data
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const { data: toolboxData, error: toolboxError } = await supabase
          .from('safety_toolbox_talks')
          .select('completed_count, total_required')
          .match({ ...projectFilter, month: currentMonth, year: currentYear });

        if (toolboxError) throw toolboxError;

        const hasToolboxData = toolboxData && toolboxData.length > 0;
        let toolboxTalksCompleted = 0;
        let toolboxTalksTotal = 0;

        if (hasToolboxData) {
          toolboxTalksCompleted = toolboxData.reduce((sum, item) => sum + item.completed_count, 0);
          toolboxTalksTotal = toolboxData.reduce((sum, item) => sum + item.total_required, 0);
        }

        setMetrics({
          daysWithoutIncident,
          safetyComplianceRate,
          toolboxTalksCompleted,
          toolboxTalksTotal,
          ppeComplianceRate,
          lastIncidentDate,
          lastSafetyAudit,
          hasIncidentData,
          hasComplianceData,
          hasToolboxData
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
