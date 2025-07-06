import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useContactInteractions } from '@/hooks/useContactInteractions';
import { Calendar, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FollowUpItem {
  id: string;
  interaction_type: string;
  subject?: string;
  follow_up_date: string;
  stakeholder: {
    id: string;
    company_name?: string;
    contact_person: string;
    stakeholder_type: string;
  };
}

export const FollowUpReminders = () => {
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { getUpcomingFollowUps, markFollowUpComplete } = useContactInteractions();

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const { data } = await getUpcomingFollowUps();
      setFollowUps(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const handleMarkComplete = async (id: string) => {
    await markFollowUpComplete(id);
    fetchFollowUps(); // Refresh the list
  };

  const isOverdue = (date: string) => {
    return new Date(date) < new Date();
  };

  const getUrgencyColor = (date: string) => {
    const followUpDate = new Date(date);
    const today = new Date();
    const daysDiff = Math.ceil((followUpDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 'bg-red-100 text-red-800 border-red-200';
    if (daysDiff === 0) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (daysDiff <= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getUrgencyIcon = (date: string) => {
    if (isOverdue(date)) return <AlertCircle size={16} className="text-red-600" />;
    return <Clock size={16} className="text-blue-600" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Follow-up Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar size={20} />
          Follow-up Reminders
          {followUps.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {followUps.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {followUps.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
            <h3 className="font-medium text-slate-900 mb-1">All caught up!</h3>
            <p className="text-sm text-muted-foreground">No pending follow-ups at this time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {followUps.map((followUp) => (
              <div 
                key={followUp.id}
                className="flex items-start justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={16} className="text-slate-400" />
                    <span className="font-medium text-slate-900">
                      {followUp.stakeholder.company_name || followUp.stakeholder.contact_person}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {followUp.stakeholder.stakeholder_type}
                    </Badge>
                  </div>
                  
                  {followUp.subject && (
                    <p className="text-sm text-slate-700 mb-2">{followUp.subject}</p>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {getUrgencyIcon(followUp.follow_up_date)}
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getUrgencyColor(followUp.follow_up_date)}`}
                    >
                      {isOverdue(followUp.follow_up_date) 
                        ? `Overdue by ${formatDistanceToNow(new Date(followUp.follow_up_date))}`
                        : `Due ${formatDistanceToNow(new Date(followUp.follow_up_date), { addSuffix: true })}`
                      }
                    </Badge>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkComplete(followUp.id)}
                  className="ml-4"
                >
                  <CheckCircle size={16} className="mr-1" />
                  Complete
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};