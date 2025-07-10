
import { useState } from 'react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateExternalUserDialog } from './CreateExternalUserDialog';
import { CreateCompanyUserDialog } from './CreateCompanyUserDialog';
import { EditUserDialog } from './EditUserDialog';
import { EmailTestDialog } from './EmailTestDialog';
import { Users, UserPlus, Shield, Clock, CheckCircle, XCircle, Search } from 'lucide-react';

export const UserManagement = () => {
  const { users, invitations, loading, updateUserRole, updateUserStatus, deleteUser, refetch } = useUserManagement();
  const [loadingUsers, setLoadingUsers] = useState<Set<string>>(new Set());
  
  const handleQuickStatusChange = async (userId: string, newStatus: string) => {
    console.log('🔄 [UserManagement] Starting status change:', { userId, newStatus });
    
    // Add user to loading set
    setLoadingUsers(prev => new Set([...prev, userId]));
    
    try {
      console.log('📞 [UserManagement] Calling updateUserStatus...');
      const result = await updateUserStatus(userId, newStatus);
      
      console.log('📋 [UserManagement] UpdateUserStatus result:', result);
      
      if (result?.error) {
        console.error('❌ [UserManagement] Status update failed:', result.error);
        // Error toast is already handled by useUsers hook
      } else {
        console.log('✅ [UserManagement] Status update successful');
        // Success toast is already handled by useUsers hook
      }
    } catch (error) {
      console.error('💥 [UserManagement] Unexpected error in handleQuickStatusChange:', error);
    } finally {
      // Remove user from loading set
      setLoadingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createCompanyDialogOpen, setCreateCompanyDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [emailTestDialogOpen, setEmailTestDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.account_status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const companyUsers = filteredUsers.filter(user => user.is_company_user);
  const externalUsers = filteredUsers.filter(user => !user.is_company_user);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle size={12} className="mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock size={12} className="mr-1" />Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800"><XCircle size={12} className="mr-1" />Suspended</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string, isCompany: boolean) => {
    const baseClasses = isCompany ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800";
    return (
      <Badge className={baseClasses}>
        {isCompany && <Shield size={12} className="mr-1" />}
        {role.replace('_', ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
          <p className="text-slate-600">Manage company employees and external stakeholders</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setEmailTestDialogOpen(true)} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
            🧪 Test Emails
          </Button>
          <Button onClick={() => setCreateCompanyDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Shield size={20} className="mr-2" />
            Add Company Employee
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
            <UserPlus size={20} className="mr-2" />
            Add External User
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Company Users</p>
                <p className="text-2xl font-bold">{companyUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-slate-600">External Users</p>
                <p className="text-2xl font-bold">{externalUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-slate-600">Pending Approval</p>
                <p className="text-2xl font-bold">{users.filter(u => u.account_status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Active Users</p>
                <p className="text-2xl font-bold">{users.filter(u => u.account_status === 'approved').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 min-h-[44px]"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-48 min-h-[44px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="project_manager">Project Manager</SelectItem>
              <SelectItem value="site_supervisor">Site Supervisor</SelectItem>
              <SelectItem value="worker">Worker</SelectItem>
              <SelectItem value="stakeholder">Stakeholder</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="vendor">Vendor</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 min-h-[44px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Company Users Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Company Employees ({companyUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {companyUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{user.full_name || user.email}</p>
                      <p className="text-sm text-slate-600">{user.email}</p>
                    </div>
                    {getRoleBadge(user.role, true)}
                    {getStatusBadge(user.account_status)}
                  </div>
                </div>
                <div className="flex gap-2">
                  {user.account_status === 'pending' && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleQuickStatusChange(user.id, 'approved')}
                      disabled={loadingUsers.has(user.id)}
                    >
                      {loadingUsers.has(user.id) ? 'Approving...' : 'Approve'}
                    </Button>
                  )}
                  {user.account_status === 'approved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                      onClick={() => handleQuickStatusChange(user.id, 'suspended')}
                      disabled={loadingUsers.has(user.id)}
                    >
                      {loadingUsers.has(user.id) ? 'Suspending...' : 'Suspend'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setEditDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
            {companyUsers.length === 0 && (
              <p className="text-center text-slate-500 py-8">No company users found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* External Users Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            External Stakeholders ({externalUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {externalUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{user.full_name || user.email}</p>
                      <p className="text-sm text-slate-600">{user.email}</p>
                    </div>
                    {getRoleBadge(user.role, false)}
                    {getStatusBadge(user.account_status)}
                  </div>
                </div>
                <div className="flex gap-2">
                  {user.account_status === 'pending' && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleQuickStatusChange(user.id, 'approved')}
                      disabled={loadingUsers.has(user.id)}
                    >
                      {loadingUsers.has(user.id) ? 'Approving...' : 'Approve'}
                    </Button>
                  )}
                  {user.account_status === 'approved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                      onClick={() => handleQuickStatusChange(user.id, 'suspended')}
                      disabled={loadingUsers.has(user.id)}
                    >
                      {loadingUsers.has(user.id) ? 'Suspending...' : 'Suspend'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setEditDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
            {externalUsers.length === 0 && (
              <p className="text-center text-slate-500 py-8">No external users found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateCompanyUserDialog
        open={createCompanyDialogOpen}
        onOpenChange={setCreateCompanyDialogOpen}
        onSuccess={refetch}
      />
      
      <CreateExternalUserDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
      
      <EmailTestDialog
        open={emailTestDialogOpen}
        onOpenChange={setEmailTestDialogOpen}
      />
      
      {selectedUser && (
        <EditUserDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          user={selectedUser}
        />
      )}
    </div>
  );
};
