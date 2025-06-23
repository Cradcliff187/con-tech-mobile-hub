
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Project {
  id: string;
  name: string;
  status?: string;
}

interface ProjectSelectionFieldProps {
  selectedProjectId: string;
  onProjectSelect: (projectId: string) => void;
  projects: Project[];
  isUploading: boolean;
  currentProjectId: string;
}

export const ProjectSelectionField: React.FC<ProjectSelectionFieldProps> = ({
  selectedProjectId,
  onProjectSelect,
  projects,
  isUploading,
  currentProjectId
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="animate-fade-in">
      <Label className="text-slate-700 font-medium">Project</Label>
      <Select 
        value={selectedProjectId} 
        onValueChange={onProjectSelect}
        disabled={isUploading}
      >
        <SelectTrigger className={`mt-1 ${isMobile ? 'min-h-[48px]' : ''}`}>
          <SelectValue placeholder={isMobile ? "Select project" : "Select a project for these documents"} />
        </SelectTrigger>
        <SelectContent className="z-50 bg-white max-h-[200px] overflow-y-auto">
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              <div className="flex items-center justify-between w-full">
                <span className="truncate">{project.name}</span>
                {project.id === currentProjectId && (
                  <span className={`ml-2 text-blue-600 font-medium ${isMobile ? 'text-sm' : 'text-xs'}`}>
                    Current
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {!selectedProjectId && (
        <div className={`flex items-center gap-2 mt-2 text-amber-600 ${isMobile ? 'text-sm' : 'text-xs'}`}>
          <AlertCircle size={isMobile ? 16 : 14} />
          <span>Please select a project to continue</span>
        </div>
      )}
      
      {currentProjectId && selectedProjectId === currentProjectId && (
        <div className={`text-blue-600 mt-1 ${isMobile ? 'text-sm' : 'text-xs'}`}>
          Uploading to current project
        </div>
      )}
    </div>
  );
};
