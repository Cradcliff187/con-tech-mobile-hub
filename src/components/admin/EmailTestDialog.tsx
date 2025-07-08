import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface EmailTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmailTestDialog = ({ open, onOpenChange }: EmailTestDialogProps) => {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testWelcomeEmail = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      console.log('🧪 Testing welcome email to:', testEmail);
      
      const response = await supabase.functions.invoke('send-welcome-email', {
        body: {
          userEmail: testEmail,
          userName: 'Test User',
          temporaryPassword: 'TestPass123!',
          userRole: 'stakeholder'
        }
      });
      
      console.log('🧪 Welcome email test response:', response);
      setResults({ type: 'welcome', response });
      
    } catch (error) {
      console.error('🧪 Welcome email test error:', error);
      setResults({ type: 'welcome', error });
    } finally {
      setLoading(false);
    }
  };

  const testAdminNotification = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      console.log('🧪 Testing admin notification for:', testEmail);
      
      const response = await supabase.functions.invoke('send-admin-notification', {
        body: {
          userEmail: testEmail,
          userName: 'Test User',
          userRole: 'stakeholder',
          createdBy: 'Email Test'
        }
      });
      
      console.log('🧪 Admin notification test response:', response);
      setResults({ type: 'admin', response });
      
    } catch (error) {
      console.error('🧪 Admin notification test error:', error);
      setResults({ type: 'admin', error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email System Test</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="testEmail">Test Email Address</Label>
            <Input
              id="testEmail"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="mt-1"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={testWelcomeEmail}
              disabled={loading || !testEmail}
              className="flex-1"
            >
              {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Test Welcome Email
            </Button>
            <Button
              onClick={testAdminNotification}
              disabled={loading || !testEmail}
              variant="outline"
              className="flex-1"
            >
              {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Test Admin Notification
            </Button>
          </div>

          {results && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Test Results for {results.type} email:</strong>
                </AlertDescription>
              </Alert>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Response Details:</h4>
                <pre className="text-sm bg-white p-3 rounded border overflow-auto">
                  {JSON.stringify(results.response || results.error, null, 2)}
                </pre>
              </div>

              {results.response?.data && (
                <Alert>
                  <AlertDescription className="text-green-800">
                    ✅ Function executed successfully! Check the console logs and your email inbox.
                  </AlertDescription>
                </Alert>
              )}

              {results.response?.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    ❌ Function returned an error: {JSON.stringify(results.response.error)}
                  </AlertDescription>
                </Alert>
              )}

              {results.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    💥 Function invocation failed: {results.error.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <Alert>
            <AlertDescription>
              <strong>Debug Instructions:</strong><br />
              1. Open browser DevTools (F12) and check the Console tab<br />
              2. Click test buttons above<br />
              3. Look for detailed logs with 🧪 emoji<br />
              4. Check your email inbox and spam folder<br />
              5. Check Edge Function logs in Supabase dashboard
            </AlertDescription>
          </Alert>

          <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};