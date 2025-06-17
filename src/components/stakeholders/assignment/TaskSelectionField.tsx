
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Stakeholder } from '@/hooks/useStakeholders';
import { Task } from '@/types/database';
import { calculateSkillMatchPercentage } from '@/utils/skill-matching';

interface TaskSelectionFieldProps {
  value: string;
  onChange: (value: string) => void;
  tasks: Task[];
  stakeholder?: Stakeholder;
  projectSelected: boolean;
}

export const TaskSelectionField = ({ 
  value, 
  onChange, 
  tasks, 
  stakeholder, 
  projectSelected 
}: TaskSelectionFieldProps) => {
  // Filter and sort tasks by skill match when stakeholder has specialties
  const getFilteredAndSortedTasks = () => {
    if (!stakeholder?.specialties || stakeholder.specialties.length === 0) {
      return tasks;
    }

    const tasksWithSkillMatch = tasks.map(task => ({
      ...task,
      skillMatchPercentage: calculateSkillMatchPercentage(
        task.required_skills || [], 
        stakeholder.specialties || []
      )
    }));

    // Filter to show tasks with >0% match first, then others
    const matchingTasks = tasksWithSkillMatch.filter(task => task.skillMatchPercentage > 0);
    const nonMatchingTasks = tasksWithSkillMatch.filter(task => task.skillMatchPercentage === 0);

    // Sort matching tasks by skill match percentage (highest first)
    matchingTasks.sort((a, b) => b.skillMatchPercentage - a.skillMatchPercentage);

    // Return matching tasks first, then non-matching tasks
    return [...matchingTasks, ...nonMatchingTasks];
  };

  const filteredTasks = getFilteredAndSortedTasks();

  if (!projectSelected) {
    return null;
  }

  if (filteredTasks.length === 0) {
    return (
      <div>
        <Label>Task (Optional)</Label>
        <p className="text-sm text-muted-foreground mt-1">No tasks available for this project</p>
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor="task_id">Task (Optional) - Sorted by skill compatibility</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="min-h-[44px]">
          <SelectValue placeholder="Select a task (optional)" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="none">No specific task</SelectItem>
          {filteredTasks.map((task) => {
            const matchPercentage = stakeholder?.specialties && stakeholder.specialties.length > 0 
              ? calculateSkillMatchPercentage(task.required_skills || [], stakeholder.specialties || [])
              : null;
            
            return (
              <SelectItem key={task.id} value={task.id}>
                <div className="flex items-center justify-between w-full">
                  <span className="flex-1 truncate">
                    {task.title}
                    {matchPercentage !== null && (
                      <span className="text-sm text-muted-foreground ml-1">
                        ({matchPercentage}% match)
                      </span>
                    )}
                  </span>
                  {matchPercentage !== null && (
                    <Badge 
                      variant={matchPercentage >= 80 ? "default" : matchPercentage >= 50 ? "secondary" : "outline"}
                      className="ml-2 text-xs"
                    >
                      {matchPercentage}%
                    </Badge>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {stakeholder?.specialties && stakeholder.specialties.length > 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          Tasks are sorted by compatibility with stakeholder skills: {stakeholder.specialties.join(', ')}
        </p>
      )}
    </div>
  );
};
