
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { ApplicationHealth } from '@/components/admin/ApplicationHealth';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Database, Shield, Activity } from 'lucide-react';
import { AddressMigration } from '@/components/admin/AddressMigration';

const Admin = () => {
  const { isAdmin, loading } = useAdminAuth();
  const { profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-600">
            Manage users, monitor system health, and migrate data
          </p>
        </div>

        <Tabs defaultValue="health" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Health Monitor
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="migration" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Migration
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              System Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="space-y-6">
            <ApplicationHealth />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <AdminPanel />
          </TabsContent>

          <TabsContent value="migration" className="space-y-6">
            <AddressMigration />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-700">Current User</h4>
                    <p className="text-sm text-slate-600">{profile?.email}</p>
                    <p className="text-sm text-slate-600">Role: {profile?.role}</p>
                    <p className="text-sm text-slate-600">Status: {profile?.account_status}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-700">Application Status</h4>
                    <p className="text-sm text-green-600">✓ Authentication System</p>
                    <p className="text-sm text-green-600">✓ Database Connection</p>
                    <p className="text-sm text-green-600">✓ Admin Controls</p>
                    <p className="text-sm text-green-600">✓ Navigation System</p>
                    <p className="text-sm text-green-600">✓ Health Monitoring</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
