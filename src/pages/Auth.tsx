
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, Info } from 'lucide-react';
import { AdminNotificationTest } from '@/components/admin/AdminNotificationTest';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, profile, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    // Handle email confirmation redirect
    const confirmed = searchParams.get('confirmed');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (confirmed === 'true') {
      // Show success message for email confirmation
      toast({
        title: "Email Confirmed!",
        description: "Your email has been confirmed successfully. Please sign in to continue.",
        variant: "default"
      });
    }
    
    if (error) {
      toast({
        title: "Authentication Error",
        description: errorDescription || "An error occurred during authentication. Please try again.",
        variant: "destructive"
      });
    }

    if (user && profile && profile.account_status === 'approved') {
      navigate('/');
    }
  }, [user, profile, navigate, searchParams, toast]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn(email, password);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signUp(email, password, fullName);
    setLoading(false);
  };

  const isCompanyEmail = email.toLowerCase().includes('@austinkunzconstruction.com');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            ConstructPro
          </h1>
          <p className="text-slate-600">
            Professional Construction Management Platform
          </p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to access your construction projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
                
                <div className="mt-4 text-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/reset-password')}
                    className="text-slate-600 hover:text-slate-800 text-sm"
                  >
                    Forgot your password?
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Join the ConstructPro platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  {/* Access Level Information */}
                  {email && (
                    <Alert>
                      <div className="flex items-start gap-2">
                        {isCompanyEmail ? (
                          <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                        ) : (
                          <Users className="h-4 w-4 text-purple-600 mt-0.5" />
                        )}
                        <div>
                          <AlertDescription>
                            {isCompanyEmail ? (
                              <>
                                <strong className="text-blue-800">Company Employee Access</strong><br />
                                Your @austinkunzconstruction.com account will be automatically approved with full platform access.
                              </>
                            ) : (
                              <>
                                <strong className="text-purple-800">External Stakeholder</strong><br />
                                External accounts require administrator approval before access is granted.
                              </>
                            )}
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Information Cards */}
        <div className="mt-6 space-y-3">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Company Employees:</strong> Use your @austinkunzconstruction.com email for immediate access to all platform features.
            </AlertDescription>
          </Alert>
          
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              <strong>External Stakeholders:</strong> Your account will be created but requires approval. Contact your project manager if you need immediate access.
            </AlertDescription>
          </Alert>
        </div>

        {/* Admin Test Section - Only show for development/testing */}
        {(user?.email?.includes('@austinkunzconstruction.com') || process.env.NODE_ENV === 'development') && (
          <div className="mt-6">
            <AdminNotificationTest />
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
