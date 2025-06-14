
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, XCircle, Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check account status for logged-in users
  if (profile) {
    if (profile.account_status === 'pending') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <Clock className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">Account Pending Approval</h2>
              <p className="text-slate-600 mb-4">
                Your account is awaiting approval from an administrator. You'll receive an email notification when your account is approved.
              </p>
              <div className="bg-yellow-50 p-3 rounded-lg text-left">
                <p className="text-sm text-yellow-800">
                  <strong>Account Details:</strong><br />
                  Email: {profile.email}<br />
                  Type: {profile.is_company_user ? 'Company Employee' : 'External Stakeholder'}<br />
                  Status: Pending Approval
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (profile.account_status === 'suspended' || profile.account_status === 'inactive') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Account {profile.account_status === 'suspended' ? 'Suspended' : 'Inactive'}
              </h2>
              <p className="text-slate-600 mb-4">
                Your account has been {profile.account_status}. Please contact an administrator for assistance.
              </p>
              <div className="bg-red-50 p-3 rounded-lg text-left">
                <p className="text-sm text-red-800">
                  <strong>Contact Information:</strong><br />
                  Email: admin@austinkunzconstruction.com<br />
                  Phone: (555) 123-4567
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
};
