
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import { ProfileData } from '@/types/auth';
import { EnhancedSidebarTrigger } from './EnhancedSidebarTrigger';

interface MobileHeaderProps {
  profile: ProfileData | null;
}

export const MobileHeader = ({ profile }: MobileHeaderProps) => {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 z-50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <EnhancedSidebarTrigger className="flex-shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-lg font-bold text-slate-800 truncate">ConstructPro</h1>
            {profile?.is_company_user && (
              <Badge className="bg-blue-100 text-blue-800 text-xs flex-shrink-0">
                <Shield size={10} className="mr-1" />
                Company
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
