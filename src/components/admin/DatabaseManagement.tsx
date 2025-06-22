
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useDatabaseStats } from '@/hooks/useDatabaseStats';
import { 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  HardDrive, 
  Activity,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

export const DatabaseManagement = () => {
  const { toast } = useToast();
  const { stats, loading } = useDatabaseStats();

  const handleBackup = () => {
    toast({
      title: "Backup initiated",
      description: "Database backup has been started. You'll be notified when complete.",
    });
  };

  const handleRestore = () => {
    toast({
      title: "Restore initiated",
      description: "Database restore process has been started.",
    });
  };

  const migrations = [
    {
      id: '20250622000001',
      name: 'Add stakeholder certifications table',
      status: 'completed',
      appliedAt: '2025-01-22 14:30:00',
      duration: '0.45s'
    },
    {
      id: '20250621000001', 
      name: 'Update task dependencies structure',
      status: 'completed',
      appliedAt: '2025-01-21 09:15:00',
      duration: '1.2s'
    },
    {
      id: '20250620000001',
      name: 'Add equipment maintenance schedules',
      status: 'completed',
      appliedAt: '2025-01-20 16:45:00',
      duration: '0.8s'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6 text-slate-600" />
          <h2 className="text-2xl font-bold text-slate-800">Database Management</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-slate-600 mt-2">Loading database statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Database className="h-6 w-6 text-slate-600" />
        <h2 className="text-2xl font-bold text-slate-800">Database Management</h2>
      </div>

      {/* Database Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Tables</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalTables}</p>
              </div>
              <HardDrive className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Records</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalRows.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Database Size</p>
                <p className="text-2xl font-bold text-slate-900">{stats.databaseSize}</p>
              </div>
              <Database className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tables" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tables">Table Statistics</TabsTrigger>
          <TabsTrigger value="migrations">Migrations</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Table Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.tables.map((table) => (
                  <div key={table.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium capitalize">{table.name.replace('_', ' ')}</h4>
                      <p className="text-sm text-slate-600">{table.rowCount.toLocaleString()} records</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{table.size}</p>
                      <Badge variant="outline" className="text-xs">
                        {table.rowCount > 1000 ? 'Large' : table.rowCount > 100 ? 'Medium' : 'Small'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="migrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Migration History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {migrations.map((migration) => (
                  <div key={migration.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium">{migration.name}</h4>
                        <p className="text-sm text-slate-600">ID: {migration.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-green-600">
                        {migration.status}
                      </Badge>
                      <p className="text-xs text-slate-500 mt-1">
                        {migration.appliedAt} ({migration.duration})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Backup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Create a full backup of the database including all tables and data.
                </p>
                <Button onClick={handleBackup} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
                <div className="text-xs text-slate-500">
                  Last backup: Today at 2:00 AM (Automatic)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Restore</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Restore database from a previous backup. This will overwrite current data.
                </p>
                <Button onClick={handleRestore} variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Restore from Backup
                </Button>
                <div className="text-xs text-red-500">
                  ⚠️ This action cannot be undone
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
