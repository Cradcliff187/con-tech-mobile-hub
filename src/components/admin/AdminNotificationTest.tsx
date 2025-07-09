import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const AdminNotificationTest = () => {
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testName, setTestName] = useState('Test User');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const testNotification = async () => {
    if (!testEmail || !testName) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and name",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('test_admin_notification', {
        test_email: testEmail,
        test_name: testName
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Test Completed",
        description: "Admin notification test sent successfully. Check the console for details.",
        variant: "default"
      });

      console.log('Notification test response:', data);
    } catch (error: any) {
      console.error('Error testing notification:', error);
      toast({
        title: "Test Failed",
        description: error.message || "Failed to test admin notification",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Notification Test</CardTitle>
        <CardDescription>
          Test the admin notification system by sending a test email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Test Email</Label>
          <Input
            id="test-email"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter test email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="test-name">Test Name</Label>
          <Input
            id="test-name"
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="Enter test name"
          />
        </div>
        <Button onClick={testNotification} disabled={loading} className="w-full">
          {loading ? 'Testing...' : 'Test Admin Notification'}
        </Button>
      </CardContent>
    </Card>
  );
};