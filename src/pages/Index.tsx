
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
import { AdminNavigation } from '@/components/navigation/AdminNavigation';
import { MobileNavigation } from '@/components/navigation/MobileNavigation';
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FileText, 
  MessageSquare, 
  Wrench,
  Users,
  Calendar,
  BarChart3,
  Clock,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const navigation = [
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
        {/* Desktop Sidebar */}
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
                    onClick={() => setActiveSection(item.id)}
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
                  onClick={() => navigate('/admin')}
                  className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Shield size={20} className="mr-3" />
                  Admin Panel
                </Button>
              )}
              
              <Button
                variant="ghost"
                onClick={signOut}
                className="w-full justify-start text-slate-600 hover:text-red-600"
              >
                <LogOut size={20} className="mr-3" />
                Sign Out
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-800">ConstructPro</h1>
              {profile?.is_company_user && (
                <Badge className="bg-blue-100 text-blue-800 text-xs">
                  <Shield size={10} className="mr-1" />
                  Company
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
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
                          setActiveSection(item.id);
                          setSidebarOpen(false);
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
                        navigate('/admin');
                        setSidebarOpen(false);
                      }}
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Shield size={20} className="mr-3" />
                      Admin Panel
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    onClick={signOut}
                    className="w-full justify-start text-slate-600 hover:text-red-600"
                  >
                    <LogOut size={20} className="mr-3" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="lg:hidden h-16"></div> {/* Spacer for mobile header */}
          <div className="p-6">
            {renderContent()}
          </div>
        </main>

        {/* Mobile Bottom Navigation - Hidden for now since MobileNavigation component needs to be updated */}
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
