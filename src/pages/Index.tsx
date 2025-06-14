
import { useState } from 'react';
import { ProjectDashboard } from '@/components/dashboard/ProjectDashboard';
import { ProjectTimeline } from '@/components/timeline/ProjectTimeline';
import { TaskManager } from '@/components/tasks/TaskManager';
import { ResourceManager } from '@/components/resources/ResourceManager';
import { CommunicationCenter } from '@/components/communication/CommunicationCenter';
import { DocumentCenter } from '@/components/documents/DocumentCenter';
import { ProgressReports } from '@/components/reports/ProgressReports';
import { MobileNavigation } from '@/components/navigation/MobileNavigation';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ProjectDashboard />;
      case 'timeline':
        return <ProjectTimeline />;
      case 'tasks':
        return <TaskManager />;
      case 'resources':
        return <ResourceManager />;
      case 'communication':
        return <CommunicationCenter />;
      case 'documents':
        return <DocumentCenter />;
      case 'reports':
        return <ProgressReports />;
      default:
        return <ProjectDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 pb-20">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Construction Manager Pro
          </h1>
          <p className="text-slate-600">
            Streamline your construction projects with professional tools
          </p>
        </header>
        
        <main className="min-h-[calc(100vh-200px)]">
          {renderActiveComponent()}
        </main>
      </div>
      
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
