import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CreateCompanyUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateCompanyUserDialog = ({ open, onOpenChange, onSuccess }: CreateCompanyUserDialogProps) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('project_manager');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateTemporaryPassword = () => {
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    setTemporaryPassword(password);
  };

  const validateCompanyEmail = (email: string) => {
    return email.toLowerCase().includes('@austinkunzconstruction.com');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCompanyEmail(email)) {
      toast({
        title: "Error",
        description: "Company employees must use @austinkunzconstruction.com email addresses",
        variant: "destructive"
      });
      return;
    }

    if (!temporaryPassword || temporaryPassword.length < 8) {
      toast({
        title: "Error", 
        description: "Please generate a temporary password (minimum 8 characters)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Call edge function to create company user
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email,
          password: temporaryPassword,
          user_metadata: {
            full_name: fullName,
            role: role,
            is_company_user: true,
            created_by_admin: true
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Company employee account created for ${fullName}. Temporary password: ${temporaryPassword}`,
        duration: 10000 // Show longer so admin can copy password
      });

      // Reset form
      setFullName('');
      setEmail('');
      setRole('project_manager');
      setTemporaryPassword('');
      onOpenChange(false);
      onSuccess?.();

    } catch (error: any) {
      console.error('Error creating company user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create company user account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyPasswordToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      toast({
        title: "Copied",
        description: "Temporary password copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy password to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Add Company Employee
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter employee's full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Company Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="employee@austinkunzconstruction.com"
              required
            />
            {email && !validateCompanyEmail(email) && (
              <p className="text-sm text-red-600">Must use @austinkunzconstruction.com email</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="project_manager">Project Manager</SelectItem>
                <SelectItem value="site_supervisor">Site Supervisor</SelectItem>
                <SelectItem value="worker">Worker</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="temporaryPassword">Temporary Password</Label>
            <div className="flex gap-2">
              <Input
                id="temporaryPassword"
                type="text"
                value={temporaryPassword}
                onChange={(e) => setTemporaryPassword(e.target.value)}
                placeholder="Click generate or enter custom password"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateTemporaryPassword}
                size="sm"
              >
                Generate
              </Button>
            </div>
            {temporaryPassword && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={copyPasswordToClipboard}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Copy password to clipboard
              </Button>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !email || !fullName || !temporaryPassword}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};