
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Users, TrendingUp, Clock } from 'lucide-react';
import { useStakeholderWorkload } from '@/hooks/useStakeholderWorkload';
import { useStakeholders } from '@/hooks/useStakeholders';
import { SmartAssignmentEngine, AssignmentCriteria } from '@/services/SmartAssignmentEngine';
import { StakeholderSuggestionCard } from './StakeholderSuggestionCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface SmartStakeholderAssignmentProps {
  projectId: string;
  requiredSkills: string[];
  selectedStakeholderIds: string[];
  onSelectionChange: (stakeholderIds: string[]) => void;
  taskPriority?: 'low' | 'medium' | 'high' | 'critical';
  estimatedHours?: number;
  dueDate?: string;
}

export const SmartStakeholderAssignment: React.FC<SmartStakeholderAssignmentProps> = ({
  projectId,
  requiredSkills,
  selectedStakeholderIds,
  onSelectionChange,
  taskPriority = 'medium',
  estimatedHours,
  dueDate
}) => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const { stakeholders, loading: stakeholdersLoading } = useStakeholders();
  const { workloadData, loading: workloadLoading } = useStakeholderWorkload();
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const engine = SmartAssignmentEngine.getInstance();

  useEffect(() => {
    if (!stakeholdersLoading && !workloadLoading && stakeholders.length > 0) {
      const criteria: AssignmentCriteria = {
        requiredSkills,
        projectId,
        priority: taskPriority,
        estimatedHours,
        dueDate,
        taskType: 'regular'
      };

      const newSuggestions = engine.generateSuggestions(stakeholders, workloadData, criteria);
      setSuggestions(newSuggestions);
    }
  }, [stakeholders, workloadData, requiredSkills, projectId, taskPriority, estimatedHours, dueDate, stakeholdersLoading, workloadLoading]);

  const handleStakeholderToggle = (stakeholderId: string) => {
    const isSelected = selectedStakeholderIds.includes(stakeholderId);
    
    if (isSelected) {
      onSelectionChange(selectedStakeholderIds.filter(id => id !== stakeholderId));
    } else {
      onSelectionChange([...selectedStakeholderIds, stakeholderId]);
    }
  };

  const topSuggestions = suggestions.slice(0, 3);
  const availableStakeholders = suggestions.filter(s => s.workloadStatus === 'available');
  const highPerformers = suggestions.filter(s => s.performance >= 80);

  if (stakeholdersLoading || workloadLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-blue-600" />
          Smart Assignment Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="suggestions" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              Top Picks
            </TabsTrigger>
            <TabsTrigger value="available" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Available
            </TabsTrigger>
            <TabsTrigger value="performers" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Top Rated
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              All
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-3 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Best Matches</h4>
              <Badge variant="secondary" className="text-xs">
                {topSuggestions.length} suggestions
              </Badge>
            </div>
            {topSuggestions.length > 0 ? (
              <div className="space-y-3">
                {topSuggestions.map((suggestion) => (
                  <StakeholderSuggestionCard
                    key={suggestion.stakeholder.id}
                    suggestion={suggestion}
                    onSelect={handleStakeholderToggle}
                    isSelected={selectedStakeholderIds.includes(suggestion.stakeholder.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                <Brain className="mx-auto h-8 w-8 mb-2 text-slate-400" />
                <p className="text-sm">No suggestions available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="available" className="space-y-3 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Available Now</h4>
              <Badge variant="secondary" className="text-xs">
                {availableStakeholders.length} available
              </Badge>
            </div>
            {availableStakeholders.length > 0 ? (
              <div className="space-y-3">
                {availableStakeholders.map((suggestion) => (
                  <StakeholderSuggestionCard
                    key={suggestion.stakeholder.id}
                    suggestion={suggestion}
                    onSelect={handleStakeholderToggle}
                    isSelected={selectedStakeholderIds.includes(suggestion.stakeholder.id)}
                    compact
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                <Clock className="mx-auto h-8 w-8 mb-2 text-slate-400" />
                <p className="text-sm">No fully available stakeholders</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="performers" className="space-y-3 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Top Performers</h4>
              <Badge variant="secondary" className="text-xs">
                {highPerformers.length} high rated
              </Badge>
            </div>
            {highPerformers.length > 0 ? (
              <div className="space-y-3">
                {highPerformers.map((suggestion) => (
                  <StakeholderSuggestionCard
                    key={suggestion.stakeholder.id}
                    suggestion={suggestion}
                    onSelect={handleStakeholderToggle}
                    isSelected={selectedStakeholderIds.includes(suggestion.stakeholder.id)}
                    compact
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                <TrendingUp className="mx-auto h-8 w-8 mb-2 text-slate-400" />
                <p className="text-sm">No high performers available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-3 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">All Stakeholders</h4>
              <Badge variant="secondary" className="text-xs">
                {suggestions.length} total
              </Badge>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <StakeholderSuggestionCard
                  key={suggestion.stakeholder.id}
                  suggestion={suggestion}
                  onSelect={handleStakeholderToggle}
                  isSelected={selectedStakeholderIds.includes(suggestion.stakeholder.id)}
                  compact
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Selection Summary */}
        {selectedStakeholderIds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                {selectedStakeholderIds.length} stakeholder{selectedStakeholderIds.length !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectionChange([])}
              >
                Clear All
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
