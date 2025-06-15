
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, MapPin, Wrench } from 'lucide-react';

interface PunchListItem {
  id: string;
  title: string;
  description: string;
  status: string;
  punch_list_category: string;
  project_id: string;
  location: string;
  priority: string;
  created_at: string;
  assigned_stakeholder_id?: string;
}

interface GroupedPunchList {
  [category: string]: {
    [location: string]: PunchListItem[];
  };
}

export const PunchListView = () => {
  const { user } = useAuth();
  const [punchListItems, setPunchListItems] = useState<PunchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupedItems, setGroupedItems] = useState<GroupedPunchList>({});

  useEffect(() => {
    fetchPunchListItems();
  }, []);

  useEffect(() => {
    // Group items by category and location
    const grouped: GroupedPunchList = {};
    
    punchListItems.forEach(item => {
      const category = item.punch_list_category || 'other';
      const location = item.location || 'No Location';
      
      if (!grouped[category]) {
        grouped[category] = {};
      }
      if (!grouped[category][location]) {
        grouped[category][location] = [];
      }
      
      grouped[category][location].push(item);
    });
    
    setGroupedItems(grouped);
  }, [punchListItems]);

  const fetchPunchListItems = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          status,
          punch_list_category,
          project_id,
          priority,
          created_at,
          assigned_stakeholder_id,
          projects!inner(location)
        `)
        .eq('task_type', 'punch_list')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedItems = data?.map(item => ({
        ...item,
        location: item.projects?.location || 'No Location'
      })) || [];

      setPunchListItems(formattedItems);
    } catch (error) {
      console.error('Error fetching punch list items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      setPunchListItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, status: 'completed' }
            : item
        )
      );
    } catch (error) {
      console.error('Error completing punch list item:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'electrical': return '⚡';
      case 'plumbing': return '🔧';
      case 'paint': return '🎨';
      case 'carpentry': return '🔨';
      case 'flooring': return '🏠';
      case 'hvac': return '❄️';
      default: return '📋';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-4"></div>
          <div className="space-y-3">
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (punchListItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Punch List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No Punch List Items</h3>
            <p className="text-slate-500">All quality control items have been completed or none have been created yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Punch List
        </h2>
        <div className="text-sm text-slate-600">
          {punchListItems.filter(item => item.status === 'completed').length} of {punchListItems.length} completed
        </div>
      </div>

      {Object.entries(groupedItems).map(([category, locationGroups]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="text-2xl">{getCategoryIcon(category)}</span>
              <span className="capitalize">{category}</span>
              <Badge variant="outline">
                {Object.values(locationGroups).flat().length} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(locationGroups).map(([location, items]) => (
              <div key={location} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <h4 className="font-medium text-slate-700">{location}</h4>
                  <Badge variant="secondary">{items.length} items</Badge>
                </div>
                
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <Checkbox
                        checked={item.status === 'completed'}
                        onCheckedChange={() => handleCompleteItem(item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className={`font-medium ${item.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                              {item.title}
                            </h5>
                            {item.description && (
                              <p className={`text-sm mt-1 ${item.status === 'completed' ? 'text-slate-400' : 'text-slate-600'}`}>
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant={getPriorityColor(item.priority)}>
                              {item.priority}
                            </Badge>
                            {item.status === 'completed' && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                ✓ Complete
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
