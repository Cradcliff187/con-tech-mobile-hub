import React from 'react';
import { Calendar, DollarSign, Activity, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { SchedulePerformance } from './SchedulePerformance';
import { BudgetTracker } from './BudgetTracker';
import { ResourceUtilization } from './ResourceUtilization';

interface DetailsSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: 'schedule' | 'budget' | 'resources' | null;
  onTabChange: (tab: 'schedule' | 'budget' | 'resources') => void;
}

const getTabConfig = (tab: 'schedule' | 'budget' | 'resources' | null) => {
  switch (tab) {
    case 'schedule':
      return {
        title: 'Schedule Performance',
        description: 'Detailed schedule metrics and upcoming milestones',
        icon: Calendar
      };
    case 'budget':
      return {
        title: 'Budget Tracker',
        description: 'Comprehensive budget analysis and spending breakdown',
        icon: DollarSign
      };
    case 'resources':
      return {
        title: 'Resource Utilization',
        description: 'Labor, equipment, and materials allocation details',
        icon: Activity
      };
    default:
      return {
        title: 'Project Details',
        description: 'Select a metric to view detailed information',
        icon: Activity
      };
  }
};

export const DetailsSidebar = ({ 
  open, 
  onOpenChange, 
  activeTab, 
  onTabChange 
}: DetailsSidebarProps) => {
  const tabConfig = getTabConfig(activeTab);
  const IconComponent = tabConfig.icon;

  // Set default tab when opening
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !activeTab) {
      onTabChange('schedule');
    }
    onOpenChange(newOpen);
  };

  const defaultTab = activeTab || 'schedule';

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-[600px] p-0 overflow-y-auto"
      >
        <SheetHeader className="p-6 pb-4 border-b bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <IconComponent className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <SheetTitle className="text-left text-lg font-semibold text-slate-800">
                {tabConfig.title}
              </SheetTitle>
              <SheetDescription className="text-left text-sm text-slate-600">
                {tabConfig.description}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 p-6">
          <Tabs 
            value={defaultTab} 
            onValueChange={(value) => onTabChange(value as 'schedule' | 'budget' | 'resources')}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3 bg-slate-100">
              <TabsTrigger 
                value="schedule" 
                className="flex items-center gap-2 data-[state=active]:bg-white"
              >
                <Calendar size={16} />
                <span className="hidden sm:inline">Schedule</span>
              </TabsTrigger>
              <TabsTrigger 
                value="budget" 
                className="flex items-center gap-2 data-[state=active]:bg-white"
              >
                <DollarSign size={16} />
                <span className="hidden sm:inline">Budget</span>
              </TabsTrigger>
              <TabsTrigger 
                value="resources" 
                className="flex items-center gap-2 data-[state=active]:bg-white"
              >
                <Activity size={16} />
                <span className="hidden sm:inline">Resources</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="space-y-6 mt-6">
              <SchedulePerformance />
            </TabsContent>

            <TabsContent value="budget" className="space-y-6 mt-6">
              <BudgetTracker />
            </TabsContent>

            <TabsContent value="resources" className="space-y-6 mt-6">
              <ResourceUtilization />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};