
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminAuthProvider } from '@/hooks/useAdminAuth';

const Admin = () => {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-gray-50 p-6">
        <AdminPanel />
      </div>
    </AdminAuthProvider>
  );
};

export default Admin;
