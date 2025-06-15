
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { NavigationItem } from '@/types/navigation';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: NavigationItem[];
  activeView: string;
  onNavigate: (view: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  navigationItems,
  activeView,
  onNavigate
}) => {
  if (!isOpen) return null;

  const handleNavigate = (view: string) => {
    onNavigate(view);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Navigation Panel */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Navigation</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
        
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeView === item.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleNavigate(item.id)}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
