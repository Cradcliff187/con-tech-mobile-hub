
import React, { useState, useMemo } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { ProjectsList } from '@/components/projects/ProjectsList';
import { CreateProjectDialog } from '@/components/dashboard/CreateProjectDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus, Building2, Activity, CheckCircle, Pause, FolderOpen } from 'lucide-react';

export const ProjectsManager = () => {
  const { projects, loading } = useProjects();
  const { profile } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Permission check for creating projects
  const canCreateProject = profile?.is_company_user && profile?.account_status === 'approved';

  // Calculate project statistics
  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const planning = projects.filter(p => p.status === 'planning').length;
    const onHold = projects.filter(p => p.status === 'on-hold').length;

    return {
      total,
      active,
      completed,
      planning,
      onHold,
      inProgress: active + planning // Active projects including planning phase
    };
  }, [projects]);

  // Stats cards configuration
  const statsCards = [
    {
      title: 'Total Projects',
      value: stats.total,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'All projects'
    },
    {
      title: 'Active Projects',
      value: stats.active,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'In progress'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Finished projects'
    },
    {
      title: 'Planning Phase',
      value: stats.planning,
      icon: FolderOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Getting started'
    }
  ];

  // Loading state for stats
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state when no projects exist
  if (!loading && projects.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
            <p className="text-slate-600">Manage and track your construction projects</p>
          </div>
          {canCreateProject && (
            <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
              <Plus size={20} />
              New Project
            </Button>
          )}
        </div>

        {/* Empty State */}
        <EmptyState
          variant="card"
          icon={<Building2 size={48} />}
          title="No Projects Yet"
          description={
            canCreateProject
              ? "Get started by creating your first construction project. You can track progress, assign tasks, and manage resources all in one place."
              : "No projects are available. Contact your project manager to get access to projects."
          }
          actions={canCreateProject ? [
            {
              label: "Create Project",
              onClick: () => setShowCreateDialog(true),
              icon: <Plus size={16} />
            }
          ] : []}
        />

        {/* Create Project Dialog */}
        <CreateProjectDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
          <p className="text-slate-600">
            Manage and track your construction projects ({stats.total} total, {stats.inProgress} active)
          </p>
        </div>
        {canCreateProject && (
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
            <Plus size={20} />
            New Project
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-slate-800">
                    {stat.value}
                  </div>
                  {stat.value > 0 && (
                    <div className="text-xs text-slate-500">
                      {((stat.value / stats.total) * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg border border-slate-200">
        <ProjectsList />
      </div>

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};
