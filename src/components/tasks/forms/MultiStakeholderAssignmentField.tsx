
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, User, Building, Truck, X, Search, Plus } from 'lucide-react';
import { Stakeholder } from '@/hooks/useStakeholders';
import { filterAndSortWorkersBySkillMatch } from '@/utils/skill-matching';

interface MultiStakeholderAssignmentFieldProps {
  value?: string[];
  onChange: (value: string[]) => void;
  stakeholders: Stakeholder[];
  requiredSkills: string[];
  error?: string;
}

export const MultiStakeholderAssignmentField = ({
  value = [],
  onChange,
  stakeholders,
  requiredSkills,
  error
}: MultiStakeholderAssignmentFieldProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter to only assignable stakeholders (employees, subcontractors, vendors)
  const assignableStakeholders = stakeholders.filter(s => 
    ['employee', 'subcontractor', 'vendor'].includes(s.stakeholder_type) && 
    s.status === 'active'
  );

  // Sort by skill match if required skills exist
  const sortedStakeholders = requiredSkills.length > 0 
    ? filterAndSortWorkersBySkillMatch(assignableStakeholders, requiredSkills)
    : assignableStakeholders.map(s => ({ ...s, skillMatchPercentage: 100 }));

  // Filter stakeholders based on search term
  const filteredStakeholders = sortedStakeholders.filter(s => 
    !value.includes(s.id) && (
      (s.company_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  // Get selected stakeholders with their details
  const selectedStakeholders = value.map(id => 
    stakeholders.find(s => s.id === id)
  ).filter(Boolean) as Stakeholder[];

  const getStakeholderIcon = (type: string) => {
    switch (type) {
      case 'employee': return <User size={14} />;
      case 'subcontractor': return <Building size={14} />;
      case 'vendor': return <Truck size={14} />;
      default: return <User size={14} />;
    }
  };

  const getStakeholderTypeColor = (type: string) => {
    switch (type) {
      case 'employee': return 'bg-green-100 text-green-800 border-green-200';
      case 'subcontractor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'vendor': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getSkillMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAddStakeholder = (stakeholderId: string) => {
    if (!value.includes(stakeholderId)) {
      onChange([...value, stakeholderId]);
      setSearchTerm('');
      setShowDropdown(false);
    }
  };

  const handleRemoveStakeholder = (stakeholderId: string) => {
    onChange(value.filter(id => id !== stakeholderId));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="stakeholder-assignment">Assign To</Label>
        {value.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-slate-500 hover:text-slate-700"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Selected Stakeholders - Tags */}
      {selectedStakeholders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedStakeholders.map((stakeholder) => {
            const matchingStakeholder = sortedStakeholders.find(s => s.id === stakeholder.id);
            const skillMatchPercentage = matchingStakeholder?.skillMatchPercentage || 100;
            
            return (
              <Badge
                key={stakeholder.id}
                variant="secondary"
                className={`${getStakeholderTypeColor(stakeholder.stakeholder_type)} flex items-center gap-2 px-3 py-2 text-sm`}
              >
                {getStakeholderIcon(stakeholder.stakeholder_type)}
                <span className="max-w-32 truncate">
                  {stakeholder.company_name || stakeholder.contact_person || 'Unnamed'}
                </span>
                {requiredSkills.length > 0 && (
                  <span className={`text-xs font-medium ${getSkillMatchColor(skillMatchPercentage)}`}>
                    {skillMatchPercentage}%
                  </span>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveStakeholder(stakeholder.id)}
                  className="h-4 w-4 p-0 hover:bg-red-100 text-slate-600 hover:text-red-600"
                >
                  <X size={12} />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <Input
            id="stakeholder-assignment"
            type="text"
            placeholder="Search stakeholders to assign..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className={`pl-10 ${error ? 'border-red-500' : ''}`}
          />
        </div>

        {/* Dropdown */}
        {showDropdown && (searchTerm || filteredStakeholders.length > 0) && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
            {filteredStakeholders.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">
                {searchTerm ? 'No stakeholders found' : 'All available stakeholders are already assigned'}
              </div>
            ) : (
              filteredStakeholders.map((stakeholder) => (
                <button
                  key={stakeholder.id}
                  type="button"
                  onClick={() => handleAddStakeholder(stakeholder.id)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none border-b border-slate-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getStakeholderIcon(stakeholder.stakeholder_type)}
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">
                          {stakeholder.company_name || stakeholder.contact_person || 'Unnamed'}
                        </div>
                        {stakeholder.contact_person && stakeholder.company_name && (
                          <div className="text-xs text-slate-500 truncate">
                            {stakeholder.contact_person}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge 
                        className={`text-xs ${getStakeholderTypeColor(stakeholder.stakeholder_type)}`}
                      >
                        {stakeholder.stakeholder_type}
                      </Badge>
                      {requiredSkills.length > 0 && (
                        <span className={`text-xs font-medium ${getSkillMatchColor(stakeholder.skillMatchPercentage)}`}>
                          {stakeholder.skillMatchPercentage}%
                        </span>
                      )}
                      <Plus size={16} className="text-slate-400" />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Click away to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Assignment Info */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {value.length === 0 ? 'No stakeholders assigned' : 
           value.length === 1 ? '1 stakeholder assigned' : 
           `${value.length} stakeholders assigned`}
        </span>
        {requiredSkills.length > 0 && (
          <span>Sorted by skill match percentage</span>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
