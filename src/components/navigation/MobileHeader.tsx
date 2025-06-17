
import { Badge } from '@/components/ui/badge';
import { Menu, X, Shield } from 'lucide-react';
import { ProfileData } from '@/types/auth';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';

interface MobileHeaderProps {
  profile: ProfileData | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const MobileHeader = ({ 
  profile, 
  sidebarOpen, 
  onToggleSidebar 
}: MobileHeaderProps) => {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-lg font-bold text-slate-800 truncate">ConstructPro</h1>
          {profile?.is_company_user && (
            <Badge className="bg-blue-100 text-blue-800 text-xs flex-shrink-0">
              <Shield size={10} className="mr-1" />
              Company
            </Badge>
          )}
        </div>
        <TouchFriendlyButton
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="flex-shrink-0"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </TouchFriendlyButton>
      </div>
    </div>
  );
};
