
import React from 'react';
import { TaskSkillsField } from './TaskSkillsField';
import { TaskTypeAndCategoryFields } from './fields/TaskTypeAndCategoryFields';
import { PunchListCategoryField } from './fields/PunchListCategoryField';
import { TaskDateFields } from './fields/TaskDateFields';
import { TaskHoursFields } from './fields/TaskHoursFields';

interface EditTaskAdvancedFieldsProps {
  taskType: 'regular' | 'punch_list';
  setTaskType: (value: 'regular' | 'punch_list') => void;
  category: string;
  setCategory: (value: string) => void;
  estimatedHours: number | undefined;
  setEstimatedHours: (value: number | undefined) => void;
  actualHours: number | undefined;
  setActualHours: (value: number | undefined) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  requiredSkills: string[];
  newSkill: string;
  setNewSkill: (value: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skill: string) => void;
  punchListCategory: 'paint' | 'electrical' | 'plumbing' | 'carpentry' | 'flooring' | 'hvac' | 'other' | '';
  setPunchListCategory: (value: 'paint' | 'electrical' | 'plumbing' | 'carpentry' | 'flooring' | 'hvac' | 'other' | '') => void;
  disabled?: boolean;
  errors?: Record<string, string[]>;
  getFieldError?: (fieldName: string) => string | undefined;
}

export const EditTaskAdvancedFields: React.FC<EditTaskAdvancedFieldsProps> = ({
  taskType,
  setTaskType,
  category,
  setCategory,
  estimatedHours,
  setEstimatedHours,
  actualHours,
  setActualHours,
  startDate,
  setStartDate,
  requiredSkills,
  newSkill,
  setNewSkill,
  onAddSkill,
  onRemoveSkill,
  punchListCategory,
  setPunchListCategory,
  disabled = false,
  getFieldError
}) => {
  return (
    <>
      {/* Task Type & Category */}
      <TaskTypeAndCategoryFields
        taskType={taskType}
        setTaskType={setTaskType}
        category={category}
        setCategory={setCategory}
        disabled={disabled}
        getFieldError={getFieldError}
      />

      {/* Punch List Category (conditional) */}
      {taskType === 'punch_list' && (
        <PunchListCategoryField
          punchListCategory={punchListCategory}
          setPunchListCategory={setPunchListCategory}
          disabled={disabled}
          getFieldError={getFieldError}
        />
      )}

      {/* Date Fields */}
      <TaskDateFields
        startDate={startDate}
        setStartDate={setStartDate}
        disabled={disabled}
        getFieldError={getFieldError}
      />

      {/* Hours Tracking */}
      <TaskHoursFields
        estimatedHours={estimatedHours}
        setEstimatedHours={setEstimatedHours}
        actualHours={actualHours}
        setActualHours={setActualHours}
        disabled={disabled}
        getFieldError={getFieldError}
      />

      {/* Required Skills */}
      <div>
        <TaskSkillsField
          requiredSkills={requiredSkills}
          newSkill={newSkill}
          setNewSkill={setNewSkill}
          onAddSkill={onAddSkill}
          onRemoveSkill={onRemoveSkill}
        />
        {getFieldError?.('required_skills') && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {getFieldError('required_skills')}
          </p>
        )}
      </div>
    </>
  );
};
