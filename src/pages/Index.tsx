
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ProjectDashboard } from '@/components/dashboard/ProjectDashboard';
import { TaskManager } from '@/components/tasks/TaskManager';
import { DocumentCenter } from '@/components/documents/DocumentCenter';
import { CommunicationCenter } from '@/components/communication/CommunicationCenter';
import { ResourceManager } from '@/components/resources/ResourceManager';
import { StakeholderManager } from '@/components/stakeholders/StakeholderManager';
import { EstimateManager } from '@/components/estimates/EstimateManager';
import { BidsManager } from '@/components/bids/BidsManager';
import { ProjectPlanning } from '@/components/planning/ProjectPlanning';
import { TimelineView } from '@/components/timeline/TimelineView';
import { ReportDashboard } from '@/components/reports/ReportDashboard';
import { ProjectsManager } from '@/components/projects/ProjectsManager';
import { CRMDashboard } from '@/components/crm/CRMDashboard';
import { CRMLeadsView } from '@/components/crm/CRMLeadsView';
import { CRMPipelineView } from '@/components/crm/CRMPipelineView';
import { EmployeeCostDashboard } from '@/components/costs/EmployeeCostDashboard';
import { WeatherDashboard } from '@/components/weather/WeatherDashboard';
import { DesktopSidebar } from '@/components/navigation/DesktopSidebar';
import { MobileHeader } from '@/components/navigation/MobileHeader';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { NavigationItem } from '@/types/navigation';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { EnhancedSidebarTrigger } from '@/components/navigation/EnhancedSidebarTrigger';
import { useSidebarFocus } from '@/hooks/useSidebarFocus';
import { SafetyIncidentList } from '@/components/safety/SafetyIncidentList';
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
  Folder,
  DollarSign,
  Shield,
  CloudSun,
  Calculator,
  TrendingUp,
  Target,
  UserCheck,
  Gavel
} from 'lucide-react';
import '../components/ui/enhanced-sidebar.css';

// Inner component that uses sidebar hooks
const IndexContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get('section') || 'dashboard';
  const activeSubsection = searchParams.get('subsection');
  const { signOut, profile } = useAuth();
  const { isAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const { triggerRef } = useSidebarFocus();

  // Add development test utilities
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // addTestCommands(); // Commented out for now
    }
  }, []);

  const handleSectionChange = (searchParamsString: string) => {
    setSearchParams(searchParamsString);
  };

  const handleMobileBottomNavigation = (section: string) => {
    const currentProject = searchParams.get('project');
    const newParams = new URLSearchParams();
    newParams.set('section', section);
    if (currentProject) {
      newParams.set('project', currentProject);
    }
    setSearchParams(newParams.toString());
  };

  const navigation: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'stakeholders', label: 'Stakeholders', icon: Users },
    { id: 'estimates', label: 'Estimates', icon: Calculator },
    { id: 'bids', label: 'Bids', icon: TrendingUp },
    { id: 'planning', label: 'Planning', icon: Calendar },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'resources', label: 'Resources', icon: Wrench },
    { 
      id: 'crm', 
      label: 'CRM', 
      icon: TrendingUp,
      permission: 'crm_access',
      children: [
        { id: 'crm-pipeline', label: 'Pipeline', icon: Target, permission: 'crm_access' },
        { id: 'crm-leads', label: 'Leads', icon: UserCheck, permission: 'crm_access' },
        { id: 'crm-estimates', label: 'Estimates', icon: Calculator, permission: 'crm_access' },
        { id: 'crm-bids', label: 'Bids', icon: Gavel, permission: 'crm_access' }
      ]
    },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'weather', label: 'Weather', icon: CloudSun },
    { id: 'safety', label: 'Safety', icon: Shield },
    { id: 'communication', label: 'Messages', icon: MessageSquare },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  // Core mobile navigation items - include projects as primary feature
  const mobileNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'planning', label: 'Planning', icon: Calendar },
    { id: 'resources', label: 'Resources', icon: Wrench }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <ProjectDashboard />;
      case 'projects': return <ProjectsManager />;
      case 'tasks': return <TaskManager />;
      case 'stakeholders': return <StakeholderManager />;
      case 'estimates': return <EstimateManager />;
      case 'bids': return <BidsManager />;
      case 'planning': return <ProjectPlanning />;
      case 'timeline': return <TimelineView />;
      case 'resources': return <ResourceManager />;
      case 'documents': return <DocumentCenter />;
      case 'weather': return <WeatherDashboard />;
      case 'safety': return <SafetyIncidentList />;
      case 'communication': return <CommunicationCenter />;
      case 'crm': 
        switch (activeSubsection) {
          case 'pipeline': return <CRMPipelineView />;
          case 'leads': return <CRMLeadsView />;
          case 'estimates': return <EstimateManager />;
          case 'bids': return <BidsManager />;
          default: return <CRMDashboard />;
        }
      case 'reports': return <ReportDashboard />;
      default: return <ProjectDashboard />;
    }
  };

  return (
    <>
      <DesktopSidebar
        profile={profile}
        navigation={navigation}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onAdminClick={() => navigate('/admin')}
        onSignOut={signOut}
        isAdmin={isAdmin}
      />

      <SidebarInset className="flex flex-col w-full">
        <MobileHeader profile={profile} />

        {/* Floating Sidebar Trigger - Desktop only */}
        <div className="hidden lg:block">
          <EnhancedSidebarTrigger 
            floating 
            ref={triggerRef}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto main-content-shift">
          <div className="lg:hidden h-16"></div>
          <div className="p-6 lg:pl-16">
            <Breadcrumbs />
            <ErrorBoundary>
              {renderContent()}
            </ErrorBoundary>
          </div>
        </main>

        {/* Mobile Bottom Navigation - Enhanced with Projects */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 z-30">
          <div className="flex justify-around">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMobileBottomNavigation(item.id)}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 touch-manipulation min-w-[44px] min-h-[44px] ${
                    activeSection === item.id
                      ? 'text-orange-600 bg-orange-50 scale-105'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </SidebarInset>
    </>
  );
};

// Main Index component - only provides Sidebar context
const Index = () => {
  return (
    <div className="flex h-screen bg-slate-50">
      <SidebarProvider defaultOpen={false}>
        <IndexContent />
      </SidebarProvider>
    </div>
  );
};

export default Index;
