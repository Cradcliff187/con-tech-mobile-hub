import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCRMMetrics } from '@/hooks/useCRMMetrics';
import { generatePipelineReport, generateActivityReport, generatePerformanceReport } from '@/utils/crmExportUtils';

interface ReportLoadingState {
  pipeline: boolean;
  activity: boolean;
  performance: boolean;
}

export const useCRMReports = () => {
  const { metrics, loading: metricsLoading } = useCRMMetrics();
  const { toast } = useToast();
  
  const [loadingStates, setLoadingStates] = useState<ReportLoadingState>({
    pipeline: false,
    activity: false,
    performance: false
  });

  const setLoading = useCallback((reportType: keyof ReportLoadingState, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [reportType]: loading }));
  }, []);

  const handleReportGeneration = useCallback(async (
    reportType: keyof ReportLoadingState,
    generateFn: () => Promise<void>,
    reportName: string
  ) => {
    if (metricsLoading) {
      toast({
        title: "Please wait",
        description: "CRM data is still loading. Please try again in a moment.",
        variant: "default"
      });
      return;
    }

    setLoading(reportType, true);
    
    try {
      await generateFn();
      
      toast({
        title: "Report Generated Successfully",
        description: `${reportName} has been downloaded to your device.`,
        variant: "default"
      });
    } catch (error) {
      console.error(`Error generating ${reportName}:`, error);
      
      toast({
        title: "Report Generation Failed",
        description: `Failed to generate ${reportName}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setLoading(reportType, false);
    }
  }, [metricsLoading, toast, setLoading]);

  const generatePipelineReportAsync = useCallback(async () => {
    await handleReportGeneration(
      'pipeline',
      () => generatePipelineReport(metrics),
      'Pipeline Report'
    );
  }, [handleReportGeneration, metrics]);

  const generateActivityReportAsync = useCallback(async () => {
    await handleReportGeneration(
      'activity',
      () => generateActivityReport(),
      'Activity Report'
    );
  }, [handleReportGeneration]);

  const generatePerformanceReportAsync = useCallback(async () => {
    await handleReportGeneration(
      'performance',
      () => generatePerformanceReport(metrics),
      'Performance Report'
    );
  }, [handleReportGeneration, metrics]);

  const generateAllReports = useCallback(async () => {
    if (metricsLoading) {
      toast({
        title: "Please wait",
        description: "CRM data is still loading. Please try again in a moment.",
        variant: "default"
      });
      return;
    }

    toast({
      title: "Generating All Reports",
      description: "This may take a moment. Reports will download individually.",
      variant: "default"
    });

    try {
      await Promise.all([
        generatePipelineReportAsync(),
        generateActivityReportAsync(),
        generatePerformanceReportAsync()
      ]);
      
      toast({
        title: "All Reports Generated",
        description: "All CRM reports have been successfully generated.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error generating all reports:', error);
      
      toast({
        title: "Batch Generation Failed",
        description: "Some reports may have failed to generate. Please try individual reports.",
        variant: "destructive"
      });
    }
  }, [metricsLoading, toast, generatePipelineReportAsync, generateActivityReportAsync, generatePerformanceReportAsync]);

  return {
    loadingStates,
    generatePipelineReport: generatePipelineReportAsync,
    generateActivityReport: generateActivityReportAsync,
    generatePerformanceReport: generatePerformanceReportAsync,
    generateAllReports,
    isGenerating: Object.values(loadingStates).some(Boolean),
    metricsLoading
  };
};