import { useState } from 'react';
import { ProjectDashboard } from '@/components/dashboard/ProjectDashboard';
import { TaskManager } from '@/components/tasks/TaskManager';
import { ProjectPlanning } from '@/components/planning/ProjectPlanning';
import { TimelineView } from '@/components/timeline/TimelineView';
import { ResourceManager } from '@/components/resources/ResourceManager';
import { CommunicationCenter } from '@/components/communication/CommunicationCenter';
import { DocumentCenter } from '@/components/documents/DocumentCenter';
import { ReportDashboard } from '@/components/reports/ReportDashboard';
import { AdminNavigation } from '@/components/navigation/AdminNavigation';
import { MobileNavigation } from '@/components/navigation/MobileNavigation';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building2, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  Users, 
  MessageSquare, 
  FileText, 
  TrendingUp,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const { isAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const handleAdminPanelClick = () => {
    navigate('/admin');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Building2 },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'planning', label: 'Planning', icon: Calendar },
    { id: 'timeline', label: 'Timeline', icon: BarChart3 },
    { id: 'resources', label: 'Resources', icon: Users },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <ProjectDashboard />;
      case 'tasks':
        return <TaskManager />;
      case 'planning':
        return <ProjectPlanning />;
      case 'timeline':
        return <TimelineView />;
      case 'resources':
        return <ResourceManager />;
      case 'communication':
        return <CommunicationCenter />;
      case 'documents':
        return <DocumentCenter />;
      case 'reports':
        return <ReportDashboard />;
      default:
        return <ProjectDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Construction Manager Pro</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <AdminNavigation onAdminPanelClick={handleAdminPanelClick} />
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white shadow-sm border-r min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeView === item.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveView(item.id)}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Navigation */}
        <MobileNavigation 
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          navigationItems={navigationItems}
          activeView={activeView}
          onNavigate={setActiveView}
        />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
