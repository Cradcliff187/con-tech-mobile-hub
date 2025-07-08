
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Users, TrendingUp, Clock, Search } from 'lucide-react';
import { useStakeholderWorkload } from '@/hooks/useStakeholderWorkload';
import { useStakeholders } from '@/hooks/useStakeholders';
import { SmartAssignmentEngine, AssignmentCriteria } from '@/services/SmartAssignmentEngine';
import { StakeholderSuggestionCard } from './StakeholderSuggestionCard';

interface SmartStakeholderAssignmentProps {
  projectId: string;
  requiredSkills: string[];
  selectedStakeholderIds: string[];
  onSelectionChange: (stakeholderIds: string[]) => void;
  taskPriority: 'low' | 'medium' | 'high' | 'critical';
  estimatedHours?: number;
  dueDate?: string;
  existingAssignments?: string[]; // For edit mode
}

export const SmartStakeholderAssignment: React.FC<SmartStakeholderAssignmentProps> = ({
  projectId,
  requiredSkills,
  selectedStakeholderIds,
  onSelectionChange,
  taskPriority,
  estimatedHours,
  dueDate,
  existingAssignments = []
}) => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [searchQuery, setSearchQuery] = useState('');
  const { stakeholders } = useStakeholders();
  
  // Use stable date objects to prevent infinite loops
  const stableDates = useMemo(() => ({
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }), []);
  
  const { workloadData, loading: workloadLoading, error: workloadError } = useStakeholderWorkload(stableDates);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [availableStakeholders, setAvailableStakeholders] = useState<any[]>([]);
  const [overallocatedStakeholders, setOverallocatedStakeholders] = useState<any[]>([]);
  const [allStakeholdersWithWorkload, setAllStakeholdersWithWorkload] = useState<any[]>([]);

  useEffect(() => {
    if (!workloadLoading && !workloadError && stakeholders.length > 0 && workloadData.length > 0) {
      try {
        const engine = SmartAssignmentEngine.getInstance();
        const criteria: AssignmentCriteria = {
          requiredSkills,
          projectId,
          priority: taskPriority,
          estimatedHours,
          dueDate
        };

        const allSuggestions = engine.generateSuggestions(stakeholders, workloadData, criteria);
        
        // Filter suggestions based on workload status
        const available = allSuggestions.filter(s => s.workloadStatus === 'available');
        const overallocated = allSuggestions.filter(s => s.workloadStatus === 'overallocated');
        
        setSuggestions(allSuggestions.slice(0, 10)); // Top 10 suggestions
        setAvailableStakeholders(available.slice(0, 8));
        setOverallocatedStakeholders(overallocated.slice(0, 5));
        setAllStakeholdersWithWorkload(allSuggestions); // All stakeholders with workload data
      } catch (error) {
        console.error('Error generating stakeholder suggestions:', error);
        setSuggestions([]);
        setAvailableStakeholders([]);
        setOverallocatedStakeholders([]);
        setAllStakeholdersWithWorkload([]);
      }
    } else if (workloadError) {
      // Clear suggestions on error
      setSuggestions([]);
      setAvailableStakeholders([]);
      setOverallocatedStakeholders([]);
      setAllStakeholdersWithWorkload([]);
    }
  }, [stakeholders, workloadData, workloadLoading, workloadError, requiredSkills, projectId, taskPriority, estimatedHours, dueDate]);

  const handleStakeholderSelect = (stakeholderId: string) => {
    const isSelected = selectedStakeholderIds.includes(stakeholderId);
    let newSelection: string[];

    if (isSelected) {
      newSelection = selectedStakeholderIds.filter(id => id !== stakeholderId);
    } else {
      newSelection = [...selectedStakeholderIds, stakeholderId];
    }

    onSelectionChange(newSelection);
  };

  const getTabCount = (items: any[]) => {
    return items.length > 0 ? ` (${items.length})` : '';
  };

  // Filter all stakeholders based on search query
  const filteredAllStakeholders = useMemo(() => {
    if (!searchQuery.trim()) {
      return allStakeholdersWithWorkload;
    }
    
    const query = searchQuery.toLowerCase();
    return allStakeholdersWithWorkload.filter(suggestion => {
      const stakeholder = suggestion.stakeholder;
      const name = (stakeholder.contact_person || '').toLowerCase();
      const company = (stakeholder.company_name || '').toLowerCase();
      const type = (stakeholder.stakeholder_type || '').toLowerCase();
      
      return name.includes(query) || company.includes(query) || type.includes(query);
    });
  }, [allStakeholdersWithWorkload, searchQuery]);

  const hasExistingAssignments = existingAssignments.length > 0;

  if (workloadLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Loading Smart Suggestions...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (workloadError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Unable to Load Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-slate-500">
            <p className="text-sm">Failed to load workload data</p>
            <p className="text-xs">{workloadError}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4" />
          Smart Assignment Suggestions
        </CardTitle>
        {hasExistingAssignments && (
          <div className="flex items-center gap-2 text-xs text-amber-600">
            <AlertTriangle className="h-3 w-3" />
            Task has existing assignments - changes may affect project timeline
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="suggestions" className="text-xs">
              Top Matches{getTabCount(suggestions)}
            </TabsTrigger>
            <TabsTrigger value="available" className="text-xs">
              Available{getTabCount(availableStakeholders)}
            </TabsTrigger>
            <TabsTrigger value="overallocated" className="text-xs">
              Busy{getTabCount(overallocatedStakeholders)}
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs">
              All{getTabCount(filteredAllStakeholders)}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-3 mt-4">
            {suggestions.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs text-slate-600 mb-2">
                  Ranked by skills match, availability, and performance
                </div>
                {suggestions.map((suggestion) => (
                  <StakeholderSuggestionCard
                    key={suggestion.stakeholder.id}
                    suggestion={suggestion}
                    onSelect={handleStakeholderSelect}
                    isSelected={selectedStakeholderIds.includes(suggestion.stakeholder.id)}
                    compact={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No suggestions available</p>
                <p className="text-xs">Try adjusting required skills or check other tabs</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="available" className="space-y-3 mt-4">
            {availableStakeholders.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs text-slate-600 mb-2">
                  Stakeholders with available capacity
                </div>
                {availableStakeholders.map((suggestion) => (
                  <StakeholderSuggestionCard
                    key={suggestion.stakeholder.id}
                    suggestion={suggestion}
                    onSelect={handleStakeholderSelect}
                    isSelected={selectedStakeholderIds.includes(suggestion.stakeholder.id)}
                    compact={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No available stakeholders</p>
                <p className="text-xs">All stakeholders are currently assigned</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="overallocated" className="space-y-3 mt-4">
            {overallocatedStakeholders.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  These stakeholders are already over capacity
                </div>
                {overallocatedStakeholders.map((suggestion) => (
                  <StakeholderSuggestionCard
                    key={suggestion.stakeholder.id}
                    suggestion={suggestion}
                    onSelect={handleStakeholderSelect}
                    isSelected={selectedStakeholderIds.includes(suggestion.stakeholder.id)}
                    compact={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No overallocated stakeholders</p>
                <p className="text-xs">Good workload distribution!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-3 mt-4">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search stakeholders by name, company, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
              
              {filteredAllStakeholders.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <div className="text-xs text-slate-600 mb-2">
                    All stakeholders{searchQuery ? ` matching "${searchQuery}"` : ''} ({filteredAllStakeholders.length})
                  </div>
                  {filteredAllStakeholders.map((suggestion) => (
                    <StakeholderSuggestionCard
                      key={suggestion.stakeholder.id}
                      suggestion={suggestion}
                      onSelect={handleStakeholderSelect}
                      isSelected={selectedStakeholderIds.includes(suggestion.stakeholder.id)}
                      compact={true}
                    />
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-6 text-slate-500">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No stakeholders found</p>
                  <p className="text-xs">Try adjusting your search terms</p>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No stakeholders available</p>
                  <p className="text-xs">Stakeholder data is still loading</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {selectedStakeholderIds.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-200">
            <div className="text-xs text-slate-600 mb-2">Selected Stakeholders:</div>
            <div className="flex flex-wrap gap-1">
              {selectedStakeholderIds.map(id => {
                const stakeholder = stakeholders.find(s => s.id === id);
                return stakeholder ? (
                  <Badge key={id} variant="outline" className="text-xs">
                    {stakeholder.company_name || stakeholder.contact_person}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
