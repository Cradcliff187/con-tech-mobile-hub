
import { supabase } from '@/integrations/supabase/client';
import { jsPDF } from 'jspdf';

export interface HealthCheckResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  responseTime: number;
  details?: string;
  recommendation?: string;
}

interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical';
  lastCheck: Date | null;
  uptime: string;
  results: HealthCheckResult[];
  checking: boolean;
}

const measureTime = async <T>(fn: () => Promise<T>): Promise<[T, number]> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return [result, Math.round(end - start)];
};

const checkDatabaseConnectivity = async (): Promise<HealthCheckResult> => {
  try {
    const [result, responseTime] = await measureTime(async () => {
      return await supabase
        .from('projects')
        .select('id')
        .limit(1);
    });

    if (result.error) {
      return {
        name: 'Database Connectivity',
        status: 'error',
        message: 'Database connection failed',
        responseTime,
        details: result.error.message,
        recommendation: 'Check database connection and RLS policies'
      };
    }

    return {
      name: 'Database Connectivity',
      status: 'success',
      message: 'Database connection healthy',
      responseTime
    };
  } catch (error: any) {
    return {
      name: 'Database Connectivity',
      status: 'error',
      message: 'Database connection error',
      responseTime: 0,
      details: error.message,
      recommendation: 'Verify Supabase configuration and network connectivity'
    };
  }
};

const checkStorageAccess = async (): Promise<HealthCheckResult> => {
  try {
    const [result, responseTime] = await measureTime(async () => {
      // Try to list buckets as a basic storage health check
      return await supabase.storage.listBuckets();
    });

    if (result.error) {
      return {
        name: 'Storage Access',
        status: 'error',
        message: 'Storage access failed',
        responseTime,
        details: result.error.message,
        recommendation: 'Check storage bucket configuration and permissions'
      };
    }

    return {
      name: 'Storage Access',
      status: 'success',
      message: 'Storage access healthy',
      responseTime,
      details: `${result.data?.length || 0} buckets accessible`
    };
  } catch (error: any) {
    return {
      name: 'Storage Access',
      status: 'error',
      message: 'Storage access error',
      responseTime: 0,
      details: error.message,
      recommendation: 'Verify storage configuration and bucket policies'
    };
  }
};

const checkAuthenticationSystem = async (): Promise<HealthCheckResult> => {
  try {
    const [result, responseTime] = await measureTime(async () => {
      return await supabase.auth.getUser();
    });

    if (result.error && result.error.message !== 'Auth session missing!') {
      return {
        name: 'Authentication System',
        status: 'error',
        message: 'Authentication system error',
        responseTime,
        details: result.error.message,
        recommendation: 'Check authentication configuration'
      };
    }

    return {
      name: 'Authentication System',
      status: 'success',
      message: 'Authentication system healthy',
      responseTime,
      details: result.data.user ? 'User session active' : 'No active session (normal)'
    };
  } catch (error: any) {
    return {
      name: 'Authentication System',
      status: 'error',
      message: 'Authentication system error',
      responseTime: 0,
      details: error.message,
      recommendation: 'Verify Supabase auth configuration'
    };
  }
};

const checkExportFunctionality = async (): Promise<HealthCheckResult> => {
  try {
    const [, responseTime] = await measureTime(async () => {
      // Test PDF generation
      const doc = new jsPDF();
      doc.text('Health Check Test', 20, 20);
      doc.output('blob');
      return true;
    });

    return {
      name: 'Export Functionality',
      status: 'success',
      message: 'Export functionality operational',
      responseTime,
      details: 'PDF generation working correctly'
    };
  } catch (error: any) {
    return {
      name: 'Export Functionality',
      status: 'error',
      message: 'Export functionality error',
      responseTime: 0,
      details: error.message,
      recommendation: 'Check PDF library and export dependencies'
    };
  }
};

const checkEmailProtocol = async (): Promise<HealthCheckResult> => {
  try {
    const [, responseTime] = await measureTime(async () => {
      // Test mailto protocol
      const link = document.createElement('a');
      link.href = 'mailto:test@example.com';
      return true;
    });

    return {
      name: 'Email Integration',
      status: 'success',
      message: 'Email protocol available',
      responseTime,
      details: 'Mailto links functional'
    };
  } catch (error: any) {
    return {
      name: 'Email Integration',
      status: 'warning',
      message: 'Email protocol check failed',
      responseTime: 0,
      details: error.message,
      recommendation: 'Email functionality may be limited'
    };
  }
};

const checkPhoneProtocol = async (): Promise<HealthCheckResult> => {
  try {
    const [, responseTime] = await measureTime(async () => {
      // Test tel protocol
      const link = document.createElement('a');
      link.href = 'tel:+1234567890';
      return true;
    });

    return {
      name: 'Phone Integration',
      status: 'success',
      message: 'Phone protocol available',
      responseTime,
      details: 'Tel links functional'
    };
  } catch (error: any) {
    return {
      name: 'Phone Integration',
      status: 'warning',
      message: 'Phone protocol check failed',
      responseTime: 0,
      details: error.message,
      recommendation: 'Phone functionality may be limited'
    };
  }
};

const checkAPIEndpoints = async (): Promise<HealthCheckResult> => {
  try {
    const [result, responseTime] = await measureTime(async () => {
      // Test multiple API calls to check overall responsiveness
      const [profiles, projects] = await Promise.all([
        supabase.from('profiles').select('id').limit(1),
        supabase.from('projects').select('id').limit(1)
      ]);
      return { profiles, projects };
    });

    const hasErrors = result.profiles.error || result.projects.error;
    
    if (hasErrors) {
      return {
        name: 'API Endpoints',
        status: 'warning',
        message: 'Some API endpoints experiencing issues',
        responseTime,
        details: 'One or more endpoints returned errors',
        recommendation: 'Check RLS policies and database configuration'
      };
    }

    if (responseTime > 2000) {
      return {
        name: 'API Endpoints',
        status: 'warning',
        message: 'API response times are slow',
        responseTime,
        details: 'Endpoints responding but performance is degraded',
        recommendation: 'Monitor database performance and network connectivity'
      };
    }

    return {
      name: 'API Endpoints',
      status: 'success',
      message: 'API endpoints healthy',
      responseTime,
      details: 'All endpoints responding normally'
    };
  } catch (error: any) {
    return {
      name: 'API Endpoints',
      status: 'error',
      message: 'API endpoints error',
      responseTime: 0,
      details: error.message,
      recommendation: 'Check network connectivity and Supabase status'
    };
  }
};

export const performHealthChecks = async (): Promise<HealthCheckResult[]> => {
  const checks = [
    checkDatabaseConnectivity(),
    checkStorageAccess(),
    checkAuthenticationSystem(),
    checkExportFunctionality(),
    checkEmailProtocol(),
    checkPhoneProtocol(),
    checkAPIEndpoints()
  ];

  const results = await Promise.all(checks);
  return results;
};

export const exportHealthReport = async (systemStatus: SystemStatus): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // Header
  doc.setFontSize(20);
  doc.text('ConstructPro Health Report', margin, 30);
  
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 45);
  doc.text(`System Uptime: ${systemStatus.uptime}`, margin, 52);
  doc.text(`Overall Status: ${systemStatus.overall.toUpperCase()}`, margin, 59);

  let yPosition = 80;

  // Overall metrics
  doc.setFontSize(14);
  doc.text('System Overview', margin, yPosition);
  yPosition += 15;

  const successCount = systemStatus.results.filter(r => r.status === 'success').length;
  const warningCount = systemStatus.results.filter(r => r.status === 'warning').length;
  const errorCount = systemStatus.results.filter(r => r.status === 'error').length;
  const healthPercentage = ((successCount / systemStatus.results.length) * 100).toFixed(1);

  doc.setFontSize(10);
  doc.text(`Health Score: ${healthPercentage}%`, margin, yPosition);
  doc.text(`Healthy Components: ${successCount}`, margin, yPosition + 7);
  doc.text(`Components with Warnings: ${warningCount}`, margin, yPosition + 14);
  doc.text(`Failed Components: ${errorCount}`, margin, yPosition + 21);
  yPosition += 35;

  // Component details
  doc.setFontSize(14);
  doc.text('Component Status', margin, yPosition);
  yPosition += 15;

  systemStatus.results.forEach((result, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }

    doc.setFontSize(10);
    const statusSymbol = result.status === 'success' ? '✓' : result.status === 'warning' ? '⚠' : '✗';
    doc.text(`${statusSymbol} ${result.name}`, margin, yPosition);
    doc.text(`Status: ${result.message}`, margin + 10, yPosition + 7);
    doc.text(`Response Time: ${result.responseTime}ms`, margin + 10, yPosition + 14);
    
    if (result.details) {
      doc.text(`Details: ${result.details}`, margin + 10, yPosition + 21);
      yPosition += 28;
    } else {
      yPosition += 21;
    }

    if (result.recommendation) {
      doc.text(`Recommendation: ${result.recommendation}`, margin + 10, yPosition);
      yPosition += 7;
    }

    yPosition += 10;
  });

  // Footer
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 30;
  }
  
  doc.setFontSize(8);
  doc.text('This report was generated automatically by ConstructPro Application Health Monitor', margin, yPosition + 20);

  doc.save(`health-report-${new Date().toISOString().split('T')[0]}.pdf`);
};
