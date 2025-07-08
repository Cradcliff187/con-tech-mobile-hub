
import { useState } from 'react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useProjects } from '@/hooks/useProjects';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { prepareOptionalSelectField } from '@/utils/selectHelpers';
import { supabase } from '@/integrations/supabase/client';

interface CreateExternalUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateExternalUserDialog = ({ open, onOpenChange }: CreateExternalUserDialogProps) => {
  const { createExternalUser } = useUserManagement();
  const { projects } = useProjects();
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'stakeholder' as string,
    project_id: 'none' as string
  });
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { tempPassword: generatedPassword, error } = await createExternalUser({
      ...formData,
      project_id: prepareOptionalSelectField(formData.project_id)
    });

    if (!error && generatedPassword) {
      setTempPassword(generatedPassword);
      
      // Send welcome email to user and admin notification
      try {
        console.log('🔄 Starting email notifications...', {
          userEmail: formData.email,
          userName: formData.full_name || formData.email.split('@')[0],
          userRole: formData.role
        });

        const [welcomeResponse, adminResponse] = await Promise.all([
          supabase.functions.invoke('send-welcome-email', {
            body: {
              userEmail: formData.email,
              userName: formData.full_name || formData.email.split('@')[0],
              temporaryPassword: generatedPassword,
              userRole: formData.role
            }
          }),
          supabase.functions.invoke('send-admin-notification', {
            body: {
              userEmail: formData.email,
              userName: formData.full_name || formData.email.split('@')[0],
              userRole: formData.role,
              createdBy: 'Admin Panel'
            }
          })
        ]);

        console.log('✅ Welcome email response:', {
          data: welcomeResponse.data,
          error: welcomeResponse.error
        });
        
        console.log('✅ Admin notification response:', {
          data: adminResponse.data,
          error: adminResponse.error
        });

        // Check for specific errors in responses
        if (welcomeResponse.error) {
          console.error('❌ Welcome email error:', welcomeResponse.error);
        }
        if (adminResponse.error) {
          console.error('❌ Admin notification error:', adminResponse.error);
        }

      } catch (emailError) {
        console.error('💥 Email invocation failed:', {
          error: emailError,
          message: emailError?.message,
          stack: emailError?.stack
        });
        // Don't block the user creation flow for email errors
      }
    }
    
    setLoading(false);
  };

  const handleClose = () => {
    setFormData({
      email: '',
      full_name: '',
      role: 'stakeholder',
      project_id: 'none'
    });
    setTempPassword('');
    setShowPassword(false);
    onOpenChange(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create External User Account</DialogTitle>
        </DialogHeader>
        
        {tempPassword ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                User account created successfully! Welcome email sent to user and admin notification sent to Matt and Chris.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <Label>Email</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={formData.email} readOnly />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(formData.email)}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Temporary Password</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={tempPassword} 
                    readOnly 
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(tempPassword)}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>
              
              <Alert>
                <AlertDescription>
                  The user should log in and change their password immediately. 
                  The temporary password is only shown once for security reasons.
                </AlertDescription>
              </Alert>
            </div>
            
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="min-h-[44px]"
                placeholder="user@company.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="min-h-[44px]"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <Label htmlFor="role">User Role *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="stakeholder">Stakeholder - Can update assigned tasks, upload photos</SelectItem>
                  <SelectItem value="client">Client - View project progress (read-only)</SelectItem>
                  <SelectItem value="vendor">Vendor - Manage deliveries and orders</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="project_id">Assign to Project (Optional)</Label>
              <Select 
                value={formData.project_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}
              >
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="none">No specific project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <AlertDescription>
                External users cannot self-register. They must be created by company administrators 
                and will receive login credentials to access their assigned projects and tasks.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={loading} 
                className="flex-1 min-h-[44px] bg-orange-600 hover:bg-orange-700"
              >
                {loading ? 'Creating User...' : 'Create User Account'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose} 
                className="flex-1 min-h-[44px]"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
