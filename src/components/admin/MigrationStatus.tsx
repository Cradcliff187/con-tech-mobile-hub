
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Database, 
  Users, 
  FileText,
  RefreshCw 
} from 'lucide-react';

interface MigrationLog {
  id: string;
  operation: string;
  source_table: string;
  source_id?: string;
  target_table?: string;
  target_id?: string;
  issue_description: string;
  data_snapshot?: any;
  created_at: string;
}

interface MigrationSummary {
  operation: string;
  count: number;
  latest_occurrence: string;
}

export const MigrationStatus = () => {
  const [migrationLogs, setMigrationLogs] = useState<MigrationLog[]>([]);
  const [migrationSummary, setMigrationSummary] = useState<MigrationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMigrationData = async () => {
    setLoading(true);
    try {
      // Fetch migration summary
      const { data: summaryData, error: summaryError } = await supabase
        .from('migration_summary')
        .select('*');

      if (summaryError) throw summaryError;
      setMigrationSummary(summaryData || []);

      // Fetch migration logs
      const { data: logsData, error: logsError } = await supabase
        .from('migration_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;
      setMigrationLogs(logsData || []);

    } catch (error: any) {
      console.error('Error fetching migration data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch migration data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'migration_success':
      case 'migration_complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'validation_warning':
      case 'duplicate_warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'migration_error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'stakeholder_created':
        return <Users className="h-4 w-4 text-blue-600" />;
      default:
        return <Database className="h-4 w-4 text-slate-600" />;
    }
  };

  const getOperationBadgeVariant = (operation: string) => {
    switch (operation) {
      case 'migration_success':
      case 'migration_complete':
        return 'default';
      case 'validation_warning':
      case 'duplicate_warning':
        return 'secondary';
      case 'migration_error':
        return 'destructive';
      case 'stakeholder_created':
        return 'outline';
      default:
        return 'outline';
    }
  };

  useEffect(() => {
    fetchMigrationData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
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

  const completionSummary = migrationSummary.find(s => s.operation === 'migration_complete');
  const successCount = migrationSummary.find(s => s.operation === 'migration_success')?.count || 0;
  const errorCount = migrationSummary.find(s => s.operation === 'migration_error')?.count || 0;
  const warningCount = migrationSummary.find(s => s.operation === 'validation_warning')?.count || 0;
  const duplicateCount = migrationSummary.find(s => s.operation === 'duplicate_warning')?.count || 0;
  const stakeholdersCreated = migrationSummary.find(s => s.operation === 'stakeholder_created')?.count || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6 text-slate-600" />
          <h2 className="text-2xl font-bold text-slate-800">Data Migration Status</h2>
        </div>
        <Button onClick={fetchMigrationData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Migration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Successful Migrations</p>
                <p className="text-2xl font-bold text-green-600">{successCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Stakeholders Created</p>
                <p className="text-2xl font-bold text-blue-600">{stakeholdersCreated}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{warningCount + duplicateCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {completionSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Migration Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              The team_members to stakeholder_assignments migration completed on{' '}
              {new Date(completionSummary.latest_occurrence).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="logs">Migration Logs</TabsTrigger>
          <TabsTrigger value="issues">Issues & Warnings</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Migration Operations Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {migrationSummary.map((summary) => (
                  <div key={summary.operation} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getOperationIcon(summary.operation)}
                      <div>
                        <p className="font-medium capitalize">
                          {summary.operation.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-slate-600">
                          Latest: {new Date(summary.latest_occurrence).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getOperationBadgeVariant(summary.operation)}>
                      {summary.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Migration Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {migrationLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getOperationIcon(log.operation)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <Badge variant={getOperationBadgeVariant(log.operation)} className="mb-2">
                          {log.operation.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-800 mb-1">{log.issue_description}</p>
                      <div className="text-xs text-slate-600">
                        {log.source_table && <span>Source: {log.source_table}</span>}
                        {log.target_table && <span className="ml-4">Target: {log.target_table}</span>}
                      </div>
                      {log.data_snapshot && (
                        <details className="mt-2">
                          <summary className="text-xs text-slate-500 cursor-pointer">View Data</summary>
                          <pre className="text-xs bg-slate-50 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(log.data_snapshot, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Migration Issues & Warnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {migrationLogs
                  .filter(log => ['validation_warning', 'duplicate_warning', 'migration_error'].includes(log.operation))
                  .map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg bg-yellow-50">
                      {getOperationIcon(log.operation)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Badge variant={getOperationBadgeVariant(log.operation)} className="mb-2">
                            {log.operation.replace(/_/g, ' ')}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-800 mb-2">{log.issue_description}</p>
                        {log.data_snapshot && (
                          <details>
                            <summary className="text-xs text-slate-600 cursor-pointer">View Details</summary>
                            <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto border">
                              {JSON.stringify(log.data_snapshot, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                {migrationLogs.filter(log => ['validation_warning', 'duplicate_warning', 'migration_error'].includes(log.operation)).length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <p>No migration issues or warnings found.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
