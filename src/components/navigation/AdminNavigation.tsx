
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Shield } from 'lucide-react';

interface AdminNavigationProps {
  onAdminPanelClick: () => void;
}

export const AdminNavigation: React.FC<AdminNavigationProps> = ({ onAdminPanelClick }) => {
  const { isAdmin } = useAdminAuth();

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Badge className="bg-red-100 text-red-800 border-red-200">
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </Badge>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onAdminPanelClick}
        className="text-red-600 border-red-200 hover:bg-red-50"
      >
        Admin Panel
      </Button>
    </div>
  );
};
