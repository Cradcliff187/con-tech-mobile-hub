
import { useState } from 'react';
import { Plus, Zap, Calendar, Users, CheckCircle, FileText, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Project } from '@/types/database';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { AssignStakeholderDialog } from '@/components/stakeholders/AssignStakeholderDialog';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ProjectQuickActionsProps {
  project: Project;
  context?: 'dashboard' | 'planning' | 'tasks';
  variant?: 'floating' | 'inline' | 'compact';
  className?: string;
}

export const ProjectQuickActions = ({ 
  project, 
  context = 'dashboard', 
  variant = 'floating',
  className 
}: ProjectQuickActionsProps) => {
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [assignStakeholderOpen, setAssignStakeholderOpen] = useState(false);
  const navigate = useNavigate();

  const getContextActions = () => {
    const baseActions = [
      {
        id: 'create-task',
        label: 'Create Task',
        icon: Plus,
        action: () => setCreateTaskOpen(true),
        shortcut: 'Ctrl+N',
        primary: true
      },
      {
        id: 'assign-stakeholder',
        label: 'Assign Stakeholder',
        icon: Users,
        action: () => setAssignStakeholderOpen(true),
        shortcut: 'Ctrl+U'
      },
      {
        id: 'view-timeline',
        label: 'View Timeline',
        icon: Calendar,
        action: () => navigate(`/?section=timeline&project=${project.id}`),
        shortcut: 'Ctrl+T'
      }
    ];

    // Phase-specific actions
    const phaseActions = [];
    
    if (project.phase === 'active' && project.progress > 80) {
      phaseActions.push({
        id: 'generate-punch-list',
        label: 'Generate Punch List',
        icon: CheckCircle,
        action: () => navigate(`/?section=planning&project=${project.id}`),
        badge: 'Ready',
        variant: 'secondary' as const
      });
    }

    if (project.phase === 'punch_list') {
      phaseActions.push({
        id: 'quality-inspection',
        label: 'Quality Inspection',
        icon: FileText,
        action: () => navigate(`/?section=tasks&project=${project.id}&filter=punch_list`),
        badge: 'Active',
        variant: 'destructive' as const
      });
    }

    // Context-specific actions
    const contextActions = [];
    
    switch (context) {
      case 'planning':
        contextActions.push({
          id: 'resource-planning',
          label: 'Resource Planning',
          icon: Users,
          action: () => navigate(`/?section=planning&project=${project.id}&tab=resources`)
        });
        break;
      case 'tasks':
        contextActions.push({
          id: 'bulk-actions',
          label: 'Bulk Task Actions',
          icon: MoreHorizontal,
          action: () => {} // Would open bulk actions modal
        });
        break;
      case 'dashboard':
        contextActions.push({
          id: 'project-overview',
          label: 'Project Overview',
          icon: FileText,
          action: () => navigate(`/?project=${project.id}`)
        });
        break;
    }

    return [...baseActions, ...phaseActions, ...contextActions];
  };

  const actions = getContextActions();
  const primaryAction = actions.find(a => a.primary);
  const secondaryActions = actions.filter(a => !a.primary);

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <div className={cn("flex items-center gap-1", className)}>
          {primaryAction && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  onClick={primaryAction.action}
                  className="h-8 w-8 p-0"
                >
                  <primaryAction.icon size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{primaryAction.label}</p>
                {primaryAction.shortcut && (
                  <p className="text-xs text-muted-foreground">{primaryAction.shortcut}</p>
                )}
              </TooltipContent>
            </Tooltip>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {secondaryActions.map((action) => (
                <DropdownMenuItem key={action.id} onClick={action.action}>
                  <action.icon className="mr-2 h-4 w-4" />
                  <span className="flex-1">{action.label}</span>
                  {action.badge && (
                    <Badge variant={action.variant || 'default'} className="ml-2 text-xs">
                      {action.badge}
                    </Badge>
                  )}
                  {action.shortcut && (
                    <span className="text-xs text-muted-foreground ml-2">{action.shortcut}</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <CreateTaskDialog
            open={createTaskOpen}
            onOpenChange={setCreateTaskOpen}
            projectId={project.id}
          />
          
          <AssignStakeholderDialog
            open={assignStakeholderOpen}
            onOpenChange={setAssignStakeholderOpen}
            projectId={project.id}
          />
        </div>
      </TooltipProvider>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-2 flex-wrap", className)}>
        {actions.slice(0, 3).map((action) => (
          <Button
            key={action.id}
            variant={action.primary ? "default" : "outline"}
            size="sm"
            onClick={action.action}
            className="relative"
          >
            <action.icon size={16} className="mr-2" />
            {action.label}
            {action.badge && (
              <Badge variant={action.variant || 'default'} className="ml-2 text-xs">
                {action.badge}
              </Badge>
            )}
          </Button>
        ))}
        
        {actions.length > 3 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal size={16} className="mr-2" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {actions.slice(3).map((action) => (
                <DropdownMenuItem key={action.id} onClick={action.action}>
                  <action.icon className="mr-2 h-4 w-4" />
                  <span className="flex-1">{action.label}</span>
                  {action.badge && (
                    <Badge variant={action.variant || 'default'} className="ml-2 text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <CreateTaskDialog
          open={createTaskOpen}
          onOpenChange={setCreateTaskOpen}
          projectId={project.id}
        />
        
        <AssignStakeholderDialog
          open={assignStakeholderOpen}
          onOpenChange={setAssignStakeholderOpen}
          projectId={project.id}
        />
      </div>
    );
  }

  // Floating variant (default)
  return (
    <TooltipProvider>
      <div className={cn("fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2", className)}>
        {/* Secondary actions (hidden by default, shown on hover) */}
        <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-200 flex flex-col gap-2">
          {secondaryActions.slice(0, 3).map((action) => (
            <Tooltip key={action.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={action.action}
                  className="h-10 w-10 rounded-full shadow-lg relative"
                >
                  <action.icon size={16} />
                  {action.badge && (
                    <Badge 
                      variant={action.variant || 'default'} 
                      className="absolute -top-1 -right-1 text-xs h-5 w-5 p-0 flex items-center justify-center"
                    >
                      !
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{action.label}</p>
                {action.shortcut && (
                  <p className="text-xs text-muted-foreground">{action.shortcut}</p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Primary action button */}
        {primaryAction && (
          <div className="group">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  onClick={primaryAction.action}
                  className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105"
                >
                  <primaryAction.icon size={24} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{primaryAction.label}</p>
                {primaryAction.shortcut && (
                  <p className="text-xs text-muted-foreground">{primaryAction.shortcut}</p>
                )}
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Quick action indicator */}
        <div className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Zap size={12} />
            Quick Actions
          </div>
        </div>

        <CreateTaskDialog
          open={createTaskOpen}
          onOpenChange={setCreateTaskOpen}
          projectId={project.id}
        />
        
        <AssignStakeholderDialog
          open={assignStakeholderOpen}
          onOpenChange={setAssignStakeholderOpen}
          projectId={project.id}
        />
      </div>
    </TooltipProvider>
  );
};
