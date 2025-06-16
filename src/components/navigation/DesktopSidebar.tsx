
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import { Shield, LogOut } from 'lucide-react';
import { ProfileData } from '@/types/auth';
import { NavigationItem } from '@/types/navigation';
import { useSearchParams } from 'react-router-dom';

interface DesktopSidebarProps {
  profile: ProfileData | null;
  navigation: NavigationItem[];
  activeSection: string;
  onSectionChange: (searchParamsString: string) => void;
  onAdminClick: () => void;
  onSignOut: () => void;
  isAdmin: boolean;
}

export const DesktopSidebar = ({
  profile,
  navigation,
  activeSection,
  onSectionChange,
  onAdminClick,
  onSignOut,
  isAdmin
}: DesktopSidebarProps) => {
  const [searchParams] = useSearchParams();

  const handleNavigation = (section: string) => {
    const currentProject = searchParams.get('project');
    const newParams = new URLSearchParams();
    newParams.set('section', section);
    if (currentProject) {
      newParams.set('project', currentProject);
    }
    onSectionChange(newParams.toString());
  };

  return (
    <Sidebar className="hidden lg:flex">
      <SidebarHeader className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">ConstructPro</h1>
          {profile?.is_company_user && (
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              <Shield size={12} className="mr-1" />
              Company
            </Badge>
          )}
        </div>
        {profile && (
          <div className="mt-2">
            <p className="text-sm text-slate-600">{profile.full_name || profile.email}</p>
            <p className="text-xs text-slate-500 capitalize">{profile.role?.replace('_', ' ')}</p>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="p-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === item.id
                    ? 'bg-orange-100 text-orange-800'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        <div className="mt-auto pt-4 border-t border-slate-200 space-y-2">
          {isAdmin && (
            <Button
              variant="outline"
              onClick={onAdminClick}
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
            >
              <Shield size={20} className="mr-3" />
              Admin Panel
            </Button>
          )}
          
          <Button
            variant="ghost"
            onClick={onSignOut}
            className="w-full justify-start text-slate-600 hover:text-red-600"
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};
