
import { Button } from '@/components/ui/button';
import { Shield, LogOut, LucideIcon } from 'lucide-react';
import { ProfileData } from '@/types/auth';

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface MobileSidebarOverlayProps {
  profile: ProfileData | null;
  navigation: NavigationItem[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  onAdminClick: () => void;
  onSignOut: () => void;
  onClose: () => void;
  isAdmin: boolean;
}

export const MobileSidebarOverlay = ({
  profile,
  navigation,
  activeSection,
  onSectionChange,
  onAdminClick,
  onSignOut,
  onClose,
  isAdmin
}: MobileSidebarOverlayProps) => {
  return (
    <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40">
      <div className="fixed top-0 left-0 w-64 h-full bg-white">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-800">ConstructPro</h1>
          {profile && (
            <div className="mt-2">
              <p className="text-sm text-slate-600">{profile.full_name || profile.email}</p>
              <p className="text-xs text-slate-500 capitalize">{profile.role?.replace('_', ' ')}</p>
            </div>
          )}
        </div>
        <div className="p-4">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    onClose();
                  }}
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
          
          <div className="mt-8 pt-4 border-t border-slate-200 space-y-2">
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => {
                  onAdminClick();
                  onClose();
                }}
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
        </div>
      </div>
    </div>
  );
};
