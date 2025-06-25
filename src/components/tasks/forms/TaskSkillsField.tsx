
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, AlertTriangle } from 'lucide-react';

interface TaskSkillsFieldProps {
  requiredSkills: string[];
  newSkill: string;
  setNewSkill: (skill: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skill: string) => void;
  error?: string;
}

export const TaskSkillsField = ({
  requiredSkills,
  newSkill,
  setNewSkill,
  onAddSkill,
  onRemoveSkill,
  error
}: TaskSkillsFieldProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddSkill();
    }
  };

  return (
    <div className="space-y-2">
      <Label>Required Skills</Label>
      <div className="flex gap-2">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Add a skill (max 50 characters)"
          onKeyDown={handleKeyDown}
        />
        <Button type="button" onClick={onAddSkill} variant="outline">
          Add
        </Button>
      </div>
      {requiredSkills && requiredSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {requiredSkills.map((skill) => (
            <Badge key={skill} variant="secondary" className="flex items-center gap-1">
              {skill}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onRemoveSkill(skill)}
              />
            </Badge>
          ))}
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
