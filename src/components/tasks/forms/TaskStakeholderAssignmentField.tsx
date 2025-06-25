
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, User, Building, Truck } from 'lucide-react';
import { Stakeholder } from '@/hooks/useStakeholders';
import { filterAndSortWorkersBySkillMatch } from '@/utils/skill-matching';

interface TaskStakeholderAssignmentFieldProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  stakeholders: Stakeholder[];
  requiredSkills: string[];
  error?: string;
}

export const TaskStakeholderAssignmentField = ({
  value,
  onChange,
  stakeholders,
  requiredSkills,
  error
}: TaskStakeholderAssignmentFieldProps) => {
  // Filter to only assignable stakeholders (employees, subcontractors, vendors)
  const assignableStakeholders = stakeholders.filter(s => 
    ['employee', 'subcontractor', 'vendor'].includes(s.stakeholder_type) && 
    s.status === 'active'
  );

  // Sort by skill match if required skills exist
  const sortedStakeholders = requiredSkills.length > 0 
    ? filterAndSortWorkersBySkillMatch(assignableStakeholders, requiredSkills)
    : assignableStakeholders.map(s => ({ ...s, skillMatchPercentage: 100 }));

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
      case 'employee': return 'bg-green-100 text-green-800';
      case 'subcontractor': return 'bg-blue-100 text-blue-800';
      case 'vendor': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getSkillMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Handle the select value change - convert "none" to undefined
  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === 'none') {
      onChange(undefined);
    } else {
      onChange(selectedValue);
    }
  };

  // Get the current select value - convert undefined to "none"
  const selectValue = value || 'none';

  return (
    <div className="space-y-2">
      <Label htmlFor="stakeholder-assignment">Assign To</Label>
      <Select value={selectValue} onValueChange={handleValueChange}>
        <SelectTrigger 
          className={`min-h-[44px] ${error ? 'border-red-500' : ''}`}
          id="stakeholder-assignment"
        >
          <SelectValue placeholder="Select a stakeholder (optional)" />
        </SelectTrigger>
        <SelectContent className="bg-white max-h-80">
          <SelectItem value="none">No assignment</SelectItem>
          {sortedStakeholders.map((stakeholder) => (
            <SelectItem 
              key={stakeholder.id} 
              value={stakeholder.id}
              className="py-3 px-2"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 flex-1 min-w-0">
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
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
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
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {requiredSkills.length > 0 && (
        <div className="text-xs text-slate-500">
          Stakeholders sorted by skill match percentage
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertTriangle size={12} />
          {error}
        </p>
      )}
    </div>
  );
};
