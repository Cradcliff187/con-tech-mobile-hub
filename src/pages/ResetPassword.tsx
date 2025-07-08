import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Check if we have access_token and type=recovery in URL params
  const accessToken = searchParams.get('access_token');
  const type = searchParams.get('type');
  const isResetMode = accessToken && type === 'recovery';

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setStep('success');
        toast({
          title: "Reset email sent",
          description: "Check your email for password reset instructions"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Password updated successfully"
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (isResetMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Reset Password
            </h1>
            <p className="text-slate-600">
              Enter your new password below
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Set New Password</CardTitle>
              <CardDescription>
                Choose a strong password for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-orange-600 hover:bg-orange-700" 
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Reset Password
          </h1>
          <p className="text-slate-600">
            Enter your email to receive reset instructions
          </p>
        </div>

        {step === 'request' && (
          <Card>
            <CardHeader>
              <CardTitle>Forgot Your Password?</CardTitle>
              <CardDescription>
                We'll send you a link to reset your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-orange-600 hover:bg-orange-700" 
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
              
              <div className="mt-4 text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/auth')}
                  className="text-slate-600 hover:text-slate-800"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Email Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  We've sent a password reset link to <strong>{email}</strong>. 
                  Check your email and click the link to reset your password.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/auth')}
                  className="text-slate-600 hover:text-slate-800"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;