import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDialogState } from '@/hooks/useDialogState';
import { CreateEstimateDialog } from '@/components/estimates/CreateEstimateDialog';
import { CreateBidDialog } from '@/components/bids/CreateBidDialog';
import { CreateStakeholderDialog } from '@/components/stakeholders/CreateStakeholderDialog';
import { LogInteractionDialog } from '@/components/stakeholders/LogInteractionDialog';
import { ScheduleFollowUpDialog } from '@/components/stakeholders/ScheduleFollowUpDialog';
import { 
  Plus, 
  FileText, 
  Gavel, 
  Phone, 
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Send
} from 'lucide-react';

export const CRMQuickActions = () => {
  const { activeDialog, openDialog, closeDialog, isDialogOpen } = useDialogState();
  const [selectedStakeholder, setSelectedStakeholder] = useState<string | null>(null);

  const quickActions = [
    {
      key: 'lead',
      title: 'Add Lead',
      description: 'Create new lead',
      icon: Users,
      color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      key: 'estimate',
      title: 'Create Estimate',
      description: 'New project estimate',
      icon: FileText,
      color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200',
      iconColor: 'text-amber-600'
    },
    {
      key: 'bid',
      title: 'Create Bid',
      description: 'Submit new bid',
      icon: Gavel,
      color: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      key: 'interaction',
      title: 'Log Call',
      description: 'Record interaction',
      icon: Phone,
      color: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200',
      iconColor: 'text-orange-600'
    },
    {
      key: 'followup',
      title: 'Schedule Follow-up',
      description: 'Plan next contact',
      icon: Calendar,
      color: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200',
      iconColor: 'text-green-600'
    }
  ];

  const reportActions = [
    {
      key: 'pipeline',
      title: 'Pipeline Report',
      description: 'Sales pipeline analysis',
      icon: TrendingUp,
      onClick: () => console.log('Generate pipeline report')
    },
    {
      key: 'revenue',
      title: 'Revenue Report',
      description: 'Monthly revenue summary',
      icon: DollarSign,
      onClick: () => console.log('Generate revenue report')
    },
    {
      key: 'activity',
      title: 'Activity Report',
      description: 'CRM activity summary',
      icon: Users,
      onClick: () => console.log('Generate activity report')
    }
  ];

  const handleActionClick = (actionKey: string) => {
    if (actionKey === 'interaction' || actionKey === 'followup') {
      // For interaction/followup actions, we need to select a stakeholder first
      // For now, we'll open the dialog without a pre-selected stakeholder
      setSelectedStakeholder(null);
    }
    openDialog(actionKey);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus size={18} />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action) => (
            <Button
              key={action.key}
              variant="outline"
              className={`w-full justify-start h-auto p-4 ${action.color}`}
              onClick={() => handleActionClick(action.key)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`p-2 rounded-lg bg-background/50`}>
                  <action.icon size={20} className={action.iconColor} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-sm opacity-70">{action.description}</p>
                </div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Reports & Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Send size={18} />
            Reports & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reportActions.map((action) => (
            <Button
              key={action.key}
              variant="outline"
              className="w-full justify-start h-auto p-4 hover:bg-muted/50"
              onClick={action.onClick}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 rounded-lg bg-muted/50">
                  <action.icon size={20} className="text-muted-foreground" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-foreground">{action.title}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </Button>
          ))}
          
          {/* Custom Reports */}
          <Button
            variant="outline" 
            className="w-full mt-4 text-muted-foreground"
            onClick={() => console.log('Open custom reports')}
          >
            View All Reports
          </Button>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateStakeholderDialog
        open={isDialogOpen('lead')}
        onOpenChange={(open) => !open && closeDialog()}
        defaultType="client"
        onSuccess={() => closeDialog()}
      />

      <CreateEstimateDialog
        open={isDialogOpen('estimate')}
        onOpenChange={(open) => !open && closeDialog()}
      />

      <CreateBidDialog
        open={isDialogOpen('bid')}
        onOpenChange={(open) => !open && closeDialog()}
      />

      <LogInteractionDialog
        open={isDialogOpen('interaction')}
        onOpenChange={(open) => !open && closeDialog()}
        stakeholderId={selectedStakeholder || ''}
        onInteractionSaved={() => closeDialog()}
      />

      <ScheduleFollowUpDialog
        open={isDialogOpen('followup')}
        onOpenChange={(open) => !open && closeDialog()}
        stakeholder={null}
        onScheduled={() => closeDialog()}
      />
    </div>
  );
};