
import { Home, Calendar, CheckSquare, Users, MessageSquare, FileText, BarChart3, Target } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileNavigation = ({ activeTab, onTabChange }: MobileNavigationProps) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'planning', icon: Target, label: 'Planning' },
    { id: 'timeline', icon: Calendar, label: 'Timeline' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'resources', icon: Users, label: 'Resources' },
    { id: 'communication', icon: MessageSquare, label: 'Chat' },
    { id: 'documents', icon: FileText, label: 'Docs' },
    { id: 'reports', icon: BarChart3, label: 'Reports' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
