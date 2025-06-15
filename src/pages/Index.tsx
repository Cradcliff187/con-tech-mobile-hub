
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ProjectDashboard } from '@/components/dashboard/ProjectDashboard';
import { TaskManager } from '@/components/tasks/TaskManager';
import { DocumentCenter } from '@/components/documents/DocumentCenter';
import { CommunicationCenter } from '@/components/communication/CommunicationCenter';
import { ResourceManager } from '@/components/resources/ResourceManager';
import { StakeholderManager } from '@/components/stakeholders/StakeholderManager';
import { ProjectPlanning } from '@/components/planning/ProjectPlanning';
import { TimelineView } from '@/components/timeline/TimelineView';
import { ReportDashboard } from '@/components/reports/ReportDashboard';
import { DesktopSidebar } from '@/components/navigation/DesktopSidebar';
import { MobileHeader } from '@/components/navigation/MobileHeader';
import { MobileSidebarOverlay } from '@/components/navigation/MobileSidebarOverlay';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { SidebarProvider } from '@/components/ui/sidebar';
import { NavigationItem } from '@/types/navigation';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FileText, 
  MessageSquare, 
  Wrench,
  Users,
  Calendar,
  BarChart3,
  Clock
} from 'lucide-react';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const navigation: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'stakeholders', label: 'Stakeholders', icon: Users },
    { id: 'planning', label: 'Planning', icon: Calendar },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'resources', label: 'Resources', icon: Wrench },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'communication', label: 'Messages', icon: MessageSquare },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <ProjectDashboard />;
      case 'tasks': return <TaskManager />;
      case 'stakeholders': return <StakeholderManager />;
      case 'planning': return <ProjectPlanning />;
      case 'timeline': return <TimelineView />;
      case 'resources': return <ResourceManager />;
      case 'documents': return <DocumentCenter />;
      case 'communication': return <CommunicationCenter />;
      case 'reports': return <ReportDashboard />;
      default: return <ProjectDashboard />;
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="flex h-screen bg-slate-50">
      <SidebarProvider>
        <DesktopSidebar
          profile={profile}
          navigation={navigation}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onAdminClick={() => navigate('/admin')}
          onSignOut={signOut}
          isAdmin={isAdmin}
        />

        <MobileHeader
          profile={profile}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {sidebarOpen && (
          <MobileSidebarOverlay
            profile={profile}
            navigation={navigation}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onAdminClick={() => navigate('/admin')}
            onSignOut={signOut}
            onClose={() => setSidebarOpen(false)}
            isAdmin={isAdmin}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="lg:hidden h-16"></div>
          <div className="p-6">
            <ErrorBoundary>
              {renderContent()}
            </ErrorBoundary>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2">
          <div className="flex justify-around">
            {navigation.slice(0, 5).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex flex-col items-center p-2 rounded-lg ${
                    activeSection === item.id
                      ? 'text-orange-600'
                      : 'text-slate-600'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs mt-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Index;
