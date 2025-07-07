
import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Paperclip } from 'lucide-react';
import { Task } from '@/types/database';
import { EditTaskBasicFields } from './EditTaskBasicFields';
import { EditTaskAdvancedFields } from './EditTaskAdvancedFields';
import { TaskDocumentAttachments } from '../TaskDocumentAttachments';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface EditTaskDialogContentProps {
  task: Task;
  formData: any; // Form data passed from parent  
  onSubmit: (formData: any) => void;
  onProjectChange: (projectId: string) => void;
  loading: boolean;
}

export const EditTaskDialogContent: React.FC<EditTaskDialogContentProps> = ({
  task,
  formData,
  onSubmit,
  onProjectChange,
  loading
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = formData.validateForm();
    if (!validation.success) {
      return;
    }

    onSubmit(formData.getFormData());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Fields */}
      <EditTaskBasicFields
        title={formData.title}
        setTitle={formData.setTitle}
        description={formData.description}
        setDescription={formData.setDescription}
        status={formData.status}
        onStatusChange={formData.handleStatusChange}
        priority={formData.priority}
        setPriority={formData.setPriority}
        dueDate={formData.dueDate}
        setDueDate={formData.setDueDate}
        projectId={formData.projectId}
        onProjectChange={onProjectChange}
        progress={formData.progress}
        setProgress={formData.setProgress}
        disabled={loading}
        projectsLoading={formData.projectsLoading}
        errors={formData.errors}
        getFieldError={formData.getFieldError}
      />

      {/* Advanced Fields */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="flex items-center gap-2 p-0 h-auto font-medium text-slate-700 hover:text-slate-900"
          >
            {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Advanced Fields
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4 mt-4">
          <EditTaskAdvancedFields
            taskType={formData.taskType}
            setTaskType={formData.setTaskType}
            category={formData.category}
            setCategory={formData.setCategory}
            estimatedHours={formData.estimatedHours}
            setEstimatedHours={formData.setEstimatedHours}
            actualHours={formData.actualHours}
            setActualHours={formData.setActualHours}
            startDate={formData.startDate}
            setStartDate={formData.setStartDate}
            requiredSkills={formData.requiredSkills}
            newSkill={formData.newSkill}
            setNewSkill={formData.setNewSkill}
            onAddSkill={formData.handleAddSkill}
            onRemoveSkill={formData.handleRemoveSkill}
            punchListCategory={formData.punchListCategory}
            setPunchListCategory={formData.setPunchListCategory}
            disabled={loading}
            errors={formData.errors}
            getFieldError={formData.getFieldError}
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Document Attachments */}
      <Collapsible open={showAttachments} onOpenChange={setShowAttachments}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="flex items-center gap-2 p-0 h-auto font-medium text-slate-700 hover:text-slate-900"
          >
            {showAttachments ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <Paperclip className="h-4 w-4" />
            Document Attachments
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4 mt-4">
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <TaskDocumentAttachments task={task} />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="submit" 
          disabled={loading || !formData.title.trim() || formData.hasErrors()}
          className="bg-orange-600 hover:bg-orange-700 transition-colors duration-200 focus:ring-2 focus:ring-orange-300"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Updating...
            </>
          ) : (
            'Update Task'
          )}
        </Button>
      </div>
    </form>
  );
};
