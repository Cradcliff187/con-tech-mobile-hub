
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarRail 
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Shield, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { ProfileData } from '@/types/auth';
import { NavigationItem } from '@/types/navigation';
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';

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
  const [expandedItems, setExpandedItems] = useState<string[]>(['crm']); // CRM expanded by default
  const activeSubsection = searchParams.get('subsection');

  const handleNavigation = (section: string, subsection?: string) => {
    const currentProject = searchParams.get('project');
    const newParams = new URLSearchParams();
    newParams.set('section', section);
    if (subsection) {
      newParams.set('subsection', subsection);
    }
    if (currentProject) {
      newParams.set('project', currentProject);
    }
    onSectionChange(newParams.toString());
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    // For now, company users have CRM access
    return profile?.is_company_user && profile?.account_status === 'approved';
  };

  return (
    <Sidebar 
      collapsible="offcanvas"
      className="sidebar-enhanced border-r border-slate-200"
    >
      <SidebarHeader className="p-6 border-b border-slate-200 bg-white">
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
          <div className="mt-3">
            <p className="text-sm font-medium text-slate-700">{profile.full_name || profile.email}</p>
            <p className="text-xs text-slate-500 capitalize">{profile.role?.replace('_', ' ')}</p>
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent className="p-4 bg-white">
        <nav className="space-y-1" role="navigation" aria-label="Main navigation">
          {navigation.map((item) => {
            if (!hasPermission(item.permission)) return null;
            
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const isExpanded = expandedItems.includes(item.id);
            
            if (item.children && item.children.length > 0) {
              return (
                <Collapsible key={item.id} open={isExpanded} onOpenChange={() => toggleExpanded(item.id)}>
                  <CollapsibleTrigger asChild>
                    <button
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                        isActive
                          ? 'bg-orange-100 text-orange-800 font-medium shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                      aria-expanded={isExpanded}
                    >
                      <Icon size={20} className={isActive ? 'text-orange-600' : 'text-slate-500'} />
                      <span className="font-medium flex-1">{item.label}</span>
                      {isExpanded ? (
                        <ChevronDown size={16} className="text-slate-400" />
                      ) : (
                        <ChevronRight size={16} className="text-slate-400" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6 mt-1 space-y-1">
                    {item.children.map((child) => {
                      if (!hasPermission(child.permission)) return null;
                      
                      const ChildIcon = child.icon;
                      const isChildActive = activeSection === item.id && activeSubsection === child.id.split('-')[1];
                      
                      return (
                        <button
                          key={child.id}
                          onClick={() => handleNavigation(item.id, child.id.split('-')[1])}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                            isChildActive
                              ? 'bg-orange-50 text-orange-700 font-medium'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                          }`}
                          aria-current={isChildActive ? 'page' : undefined}
                        >
                          <ChildIcon size={16} className={isChildActive ? 'text-orange-600' : 'text-slate-400'} />
                          <span className="text-sm font-medium">{child.label}</span>
                        </button>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            }
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                data-sidebar="menu-button"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-orange-100 text-orange-800 font-medium shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} className={isActive ? 'text-orange-600' : 'text-slate-500'} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-slate-200 space-y-2 bg-white">
        {isAdmin && (
          <Button
            variant="outline"
            onClick={onAdminClick}
            className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 focus-visible:ring-red-500"
          >
            <Shield size={20} className="mr-3" />
            Admin Panel
          </Button>
        )}
        
        <Button
          variant="ghost"
          onClick={onSignOut}
          className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50 focus-visible:ring-red-500"
        >
          <LogOut size={20} className="mr-3" />
          Sign Out
        </Button>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
};
