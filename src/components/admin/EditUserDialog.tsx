
import { useState } from 'react';
import { useUserManagement, UserProfile } from '@/hooks/useUserManagement';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, Trash2 } from 'lucide-react';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile;
}

export const EditUserDialog = ({ open, onOpenChange, user }: EditUserDialogProps) => {
  const { updateUserRole, updateUserStatus, deleteUser } = useUserManagement();
  const [formData, setFormData] = useState({
    role: user.role,
    account_status: user.account_status
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const promises = [];
    
    if (formData.role !== user.role) {
      promises.push(updateUserRole(user.id, formData.role));
    }
    
    if (formData.account_status !== user.account_status) {
      promises.push(updateUserStatus(user.id, formData.account_status));
    }

    await Promise.all(promises);
    setLoading(false);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    await deleteUser(user.id);
    setLoading(false);
    onOpenChange(false);
  };

  const getAvailableRoles = () => {
    if (user.is_company_user) {
      return [
        { value: 'admin', label: 'Admin - Full system access' },
        { value: 'project_manager', label: 'Project Manager - Manage projects and teams' },
        { value: 'site_supervisor', label: 'Site Supervisor - Field operations' },
        { value: 'worker', label: 'Worker - Task execution' }
      ];
    } else {
      return [
        { value: 'stakeholder', label: 'Stakeholder - Task updates and photos' },
        { value: 'client', label: 'Client - View project progress' },
        { value: 'vendor', label: 'Vendor - Manage deliveries' }
      ];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {user.is_company_user ? (
              <Shield className="h-5 w-5 text-blue-600" />
            ) : (
              <Users className="h-5 w-5 text-purple-600" />
            )}
            Edit User: {user.full_name || user.email}
          </DialogTitle>
        </DialogHeader>
        
        {showDeleteConfirm ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Are you sure you want to delete this user? This action cannot be undone and will remove 
                all their data and access to the system.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                onClick={handleDelete} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Deleting...' : 'Yes, Delete User'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(false)} 
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>User Type</Label>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                {user.is_company_user ? (
                  <>
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Company Employee</span>
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">External Stakeholder</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="role">User Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {getAvailableRoles().map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="account_status">Account Status</Label>
              <Select 
                value={formData.account_status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, account_status: value }))}
              >
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="approved">Approved - Full access</SelectItem>
                  <SelectItem value="pending">Pending - Awaiting approval</SelectItem>
                  <SelectItem value="suspended">Suspended - Access blocked</SelectItem>
                  <SelectItem value="inactive">Inactive - Account disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg space-y-2">
              <p className="text-sm font-medium">User Information</p>
              <p className="text-sm text-slate-600">Email: {user.email}</p>
              <p className="text-sm text-slate-600">
                Created: {new Date(user.created_at).toLocaleDateString()}
              </p>
              {user.last_login && (
                <p className="text-sm text-slate-600">
                  Last Login: {new Date(user.last_login).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={loading || (formData.role === user.role && formData.account_status === user.account_status)}
                className="flex-1 min-h-[44px] bg-orange-600 hover:bg-orange-700"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                className="flex-1 min-h-[44px]"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>

            <div className="border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                disabled={loading}
              >
                <Trash2 size={16} className="mr-2" />
                Delete User Account
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
