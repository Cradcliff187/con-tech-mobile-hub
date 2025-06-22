
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  AlertTriangle, 
  Database, 
  Users,
  Trash2,
  RefreshCw 
} from 'lucide-react';

interface MigrationStats {
  team_members_count: number;
  stakeholder_assignments_count: number;
  migrated_assignments_count: number;
  employees_created_count: number;
  migration_complete: boolean;
}

export const MigrationVerification = () => {
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const { toast } = useToast();

  const fetchMigrationStats = async () => {
    setLoading(true);
    try {
      // Get team_members count
      const { count: teamMembersCount } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true });

      // Get stakeholder_assignments count
      const { count: assignmentsCount } = await supabase
        .from('stakeholder_assignments')
        .select('*', { count: 'exact', head: true });

      // Get migrated assignments (those with migration notes)
      const { count: migratedCount } = await supabase
        .from('stakeholder_assignments')
        .select('*', { count: 'exact', head: true })
        .ilike('notes', '%Migrated from team_members%');

      // Get employees created during migration
      const { data: migrationSummary } = await supabase
        .from('migration_summary')
        .select('*')
        .eq('operation', 'stakeholder_created');

      const employeesCreated = migrationSummary?.[0]?.count || 0;

      // Check if migration is complete
      const { data: completionData } = await supabase
        .from('migration_summary')
        .select('*')
        .eq('operation', 'migration_complete');

      setStats({
        team_members_count: teamMembersCount || 0,
        stakeholder_assignments_count: assignmentsCount || 0,
        migrated_assignments_count: migratedCount || 0,
        employees_created_count: employeesCreated,
        migration_complete: !!completionData?.[0]
      });

    } catch (error: any) {
      console.error('Error fetching migration stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch migration statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupBackupTables = async () => {
    if (!stats?.migration_complete) {
      toast({
        title: "Migration Not Complete",
        description: "Cannot cleanup backup tables until migration is verified complete",
        variant: "destructive"
      });
      return;
    }

    setCleanupLoading(true);
    try {
      // Note: In production, we would be more careful about this
      // For now, we'll just show what would be cleaned up
      toast({
        title: "Cleanup Simulation",
        description: "In production, this would remove backup tables after verification",
        variant: "default"
      });
      
      // In a real scenario, you might run:
      // await supabase.rpc('cleanup_migration_tables');
    } catch (error: any) {
      console.error('Error during cleanup:', error);
      toast({
        title: "Cleanup Error",
        description: "Failed to cleanup backup tables",
        variant: "destructive"
      });
    } finally {
      setCleanupLoading(false);
    }
  };

  useEffect(() => {
    fetchMigrationStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-4"></div>
          <div className="space-y-3">
            <div className="h-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-slate-600">Unable to load migration statistics</p>
        </CardContent>
      </Card>
    );
  }

  const migrationHealthy = stats.migration_complete && 
    stats.migrated_assignments_count > 0 && 
    stats.team_members_count === stats.migrated_assignments_count;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6 text-slate-600" />
          <h2 className="text-xl font-bold text-slate-800">Migration Verification</h2>
        </div>
        <Button onClick={fetchMigrationStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Migration Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {migrationHealthy ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            Migration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-slate-800">{stats.team_members_count}</div>
              <div className="text-sm text-slate-600">Original Records</div>
              <Badge variant="secondary" className="mt-2">team_members</Badge>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.migrated_assignments_count}</div>
              <div className="text-sm text-slate-600">Migrated Records</div>
              <Badge variant="default" className="mt-2">stakeholder_assignments</Badge>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.employees_created_count}</div>
              <div className="text-sm text-slate-600">Employees Created</div>
              <Badge variant="outline" className="mt-2">new stakeholders</Badge>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-slate-800">{stats.stakeholder_assignments_count}</div>
              <div className="text-sm text-slate-600">Total Assignments</div>
              <Badge variant="secondary" className="mt-2">current system</Badge>
            </div>
          </div>
          
          <div className="mt-6 p-4 rounded-lg bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-800">Migration Health Check</h4>
                <p className="text-sm text-slate-600 mt-1">
                  {migrationHealthy 
                    ? "Migration completed successfully. All records migrated."
                    : "Migration needs attention. Check logs for details."}
                </p>
              </div>
              <div>
                {migrationHealthy ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Validation */}
      <Card>
        <CardHeader>
          <CardTitle>Data Validation Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">Migration completion status</span>
              <div className="flex items-center gap-2">
                {stats.migration_complete ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Complete</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-600">Incomplete</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">Record count validation</span>
              <div className="flex items-center gap-2">
                {stats.team_members_count === stats.migrated_assignments_count ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Match</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-600">Mismatch</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">New employees created</span>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600">{stats.employees_created_count} stakeholders</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cleanup Actions */}
      {migrationHealthy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-slate-600" />
              Migration Cleanup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Migration is complete and verified. You can safely cleanup backup tables and migration logs.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={handleCleanupBackupTables}
                disabled={cleanupLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                {cleanupLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
                <Trash2 className="h-4 w-4" />
                Cleanup Backup Tables
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Warning: This action cannot be undone. Ensure migration is fully verified first.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
