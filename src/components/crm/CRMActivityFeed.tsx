import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CRMMetrics } from '@/hooks/useCRMMetrics';
import { 
  Phone, 
  Mail, 
  Users, 
  FileText, 
  Gavel, 
  Building, 
  Calendar,
  ExternalLink,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CRMActivityFeedProps {
  activities: CRMMetrics['recentActivity'];
}

export const CRMActivityFeed = ({ activities }: CRMActivityFeedProps) => {
  const getActivityIcon = (type: string, description?: string) => {
    switch (type) {
      case 'interaction':
        if (description?.includes('call')) return Phone;
        if (description?.includes('email')) return Mail;
        if (description?.includes('meeting')) return Users;
        return Phone;
      case 'estimate':
        return FileText;
      case 'bid':
        return Gavel;
      case 'project':
        return Building;
      default:
        return Calendar;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'interaction':
        return 'text-blue-600 bg-blue-50';
      case 'estimate':
        return 'text-amber-600 bg-amber-50';
      case 'bid':
        return 'text-purple-600 bg-purple-50';
      case 'project':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'interaction':
        return 'secondary' as const;
      case 'estimate':
        return 'outline' as const;
      case 'bid':
        return 'outline' as const;
      case 'project':
        return 'default' as const;
      default:
        return 'secondary' as const;
    }
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar size={18} />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock size={48} className="mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-medium text-foreground mb-1">No recent activity</h3>
            <p className="text-sm text-muted-foreground">
              Recent CRM activities will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar size={18} />
          Recent Activity
          <Badge variant="outline" className="ml-auto">
            {activities.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-1 p-4">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type, activity.description);
              const colorClass = getActivityColor(activity.type);
              
              return (
                <div 
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                    <Icon size={16} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {activity.description}
                        </p>
                        {activity.stakeholder && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {activity.stakeholder}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <Badge variant={getBadgeVariant(activity.type)} className="text-xs">
                          {activity.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <Button variant="outline" size="sm" className="w-full">
            <ExternalLink size={14} className="mr-2" />
            View All Activities
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};