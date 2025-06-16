
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
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
      id: '20250616215928',
      name: 'Add stakeholder certifications table',
      status: 'completed',
      appliedAt: '2025-01-15 14:30:00',
      duration: '0.45s'
    },
    {
      id: '20250615203327',
      name: 'Update task dependencies structure',
      status: 'completed',
      appliedAt: '2025-01-14 09:15:00',
      duration: '1.2s'
    },
    {
      id: '20250615202059',
      name: 'Add resource allocation tables',
      status: 'completed',
      appliedAt: '2025-01-13 16:45:00',
      duration: '2.1s'
    },
    {
      id: '20250615200610',
      name: 'Enhance user permissions system',
      status: 'completed',
      appliedAt: '2025-01-12 11:20:00',
      duration: '0.8s'
    },
    {
      id: '20250615195819',
      name: 'Add weather data integration',
      status: 'completed',
      appliedAt: '2025-01-11 08:30:00',
      duration: '0.3s'
    }
  ];

  const tableStats = [
    { name: 'projects', rows: 156, size: '2.4 MB', growth: '+12%' },
    { name: 'tasks', rows: 2847, size: '18.6 MB', growth: '+25%' },
    { name: 'stakeholders', rows: 89, size: '1.2 MB', growth: '+8%' },
    { name: 'profiles', rows: 247, size: '3.1 MB', growth: '+15%' },
    { name: 'documents', rows: 1532, size: '145.2 MB', growth: '+35%' },
    { name: 'messages', rows: 5642, size: '8.9 MB', growth: '+42%' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Database className="h-6 w-6 text-slate-600" />
        <h2 className="text-2xl font-bold text-slate-800">Database Management</h2>
      </div>

      {/* Database Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Database Status</p>
                <p className="text-lg font-bold text-green-600">Healthy</p>
                <p className="text-xs text-slate-500">All systems operational</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <HardDrive className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Storage Used</p>
                <p className="text-lg font-bold text-slate-900">245.8 MB</p>
                <Progress value={24} className="mt-2 h-2" />
                <p className="text-xs text-slate-500 mt-1">24% of 1GB limit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Active Connections</p>
                <p className="text-lg font-bold text-slate-900">12</p>
                <p className="text-xs text-slate-500">Peak: 18 connections</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health">Health & Performance</TabsTrigger>
          <TabsTrigger value="migrations">Migrations</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Table Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tableStats.map((table) => (
                  <div key={table.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">{table.name}</p>
                        <p className="text-sm text-slate-600">{table.rows.toLocaleString()} rows</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{table.size}</p>
                      <p className="text-sm text-green-600">{table.growth}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Query Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Query Time</span>
                    <span className="font-medium">0.45ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Slow Queries (&gt;100ms)</span>
                    <span className="font-medium text-green-600">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Queries per Second</span>
                    <span className="font-medium">23.7</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache Hit Rate</span>
                    <span className="font-medium text-green-600">98.4%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Index Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Indexes</span>
                    <span className="font-medium">47</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unused Indexes</span>
                    <span className="font-medium text-orange-600">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Missing Indexes</span>
                    <span className="font-medium text-green-600">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Index Usage</span>
                    <span className="font-medium text-green-600">96%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="migrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Migrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {migrations.map((migration) => (
                  <div key={migration.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">{migration.name}</p>
                        <p className="text-sm text-slate-600">ID: {migration.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        {migration.status}
                      </Badge>
                      <p className="text-sm text-slate-600">{migration.appliedAt}</p>
                      <p className="text-xs text-slate-500">Duration: {migration.duration}</p>
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
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Database Backup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    Create a full backup of the database including all tables and data.
                  </p>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Last Backup:</strong> 2025-01-15 02:00:00 UTC
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>Size:</strong> 187.3 MB
                    </p>
                  </div>
                </div>
                <Button onClick={handleBackup} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Database Restore
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    Restore database from a previous backup. This will overwrite current data.
                  </p>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <p className="text-sm text-amber-800 font-medium">
                        Caution: This action cannot be undone
                      </p>
                    </div>
                  </div>
                </div>
                <Button onClick={handleRestore} variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Restore from Backup
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: '2025-01-15 02:00:00', size: '187.3 MB', type: 'Automated' },
                  { date: '2025-01-14 02:00:00', size: '184.1 MB', type: 'Automated' },
                  { date: '2025-01-13 14:30:00', size: '182.7 MB', type: 'Manual' },
                  { date: '2025-01-13 02:00:00', size: '181.9 MB', type: 'Automated' },
                  { date: '2025-01-12 02:00:00', size: '179.2 MB', type: 'Automated' }
                ].map((backup, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="font-medium">{backup.date}</p>
                        <p className="text-sm text-slate-600">{backup.type} backup</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{backup.size}</p>
                      <Button size="sm" variant="ghost">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
