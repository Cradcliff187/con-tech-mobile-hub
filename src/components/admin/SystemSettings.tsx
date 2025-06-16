
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Settings, Mail, Layers, Database, Activity } from 'lucide-react';
import { ApplicationHealth } from './ApplicationHealth';

export const SystemSettings = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoApproveCompanyUsers, setAutoApproveCompanyUsers] = useState(true);
  const [maxProjectsPerUser, setMaxProjectsPerUser] = useState('10');
  const [sessionTimeout, setSessionTimeout] = useState('24');
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "System settings have been updated successfully.",
    });
  };

  const defaultPhases = ['Planning', 'Active', 'Punch List', 'Completed', 'Closed'];
  const defaultCategories = ['Foundation', 'Framing', 'Electrical', 'Plumbing', 'HVAC', 'Finishing'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-slate-600" />
        <h2 className="text-2xl font-bold text-slate-800">System Settings</h2>
      </div>

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="health">Health Monitor</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="defaults">Defaults</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <ApplicationHealth />
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Maintenance Mode</Label>
                  <p className="text-sm text-slate-600">
                    Prevent users from accessing the application
                  </p>
                </div>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                  <Input
                    id="session-timeout"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    type="number"
                    min="1"
                    max="72"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-projects">Max Projects per User</Label>
                  <Input
                    id="max-projects"
                    value={maxProjectsPerUser}
                    onChange={(e) => setMaxProjectsPerUser(e.target.value)}
                    type="number"
                    min="1"
                    max="100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Registration & Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Allow New Registrations</Label>
                  <p className="text-sm text-slate-600">
                    Allow new users to register for accounts
                  </p>
                </div>
                <Switch
                  checked={allowRegistration}
                  onCheckedChange={setAllowRegistration}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-approve Company Users</Label>
                  <p className="text-sm text-slate-600">
                    Automatically approve users with company email domains
                  </p>
                </div>
                <Switch
                  checked={autoApproveCompanyUsers}
                  onCheckedChange={setAutoApproveCompanyUsers}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Email Notifications</Label>
                  <p className="text-sm text-slate-600">
                    Send email notifications for system events
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="task-assignments" defaultChecked />
                    <Label htmlFor="task-assignments">Task Assignments</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="project-updates" defaultChecked />
                    <Label htmlFor="project-updates">Project Updates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="deadline-reminders" defaultChecked />
                    <Label htmlFor="deadline-reminders">Deadline Reminders</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="user-registrations" defaultChecked />
                    <Label htmlFor="user-registrations">User Registrations</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defaults" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Default Project Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Default Project Phases</Label>
                  <p className="text-sm text-slate-600 mb-3">
                    Standard phases for new projects
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {defaultPhases.map((phase) => (
                      <span
                        key={phase}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {phase}
                      </span>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-base">Default Task Categories</Label>
                  <p className="text-sm text-slate-600 mb-3">
                    Standard categories for project tasks
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {defaultCategories.map((category) => (
                      <span
                        key={category}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="bg-orange-600 hover:bg-orange-700">
          Save Settings
        </Button>
      </div>
    </div>
  );
};
