
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  
  let section = searchParams.get('section');
  if (!section) {
    if (location.pathname === '/') section = 'dashboard';
    else if (location.pathname === '/planning') section = 'planning';
  }

  const { projects } = useProjects();
  const project = projectId ? projects.find(p => p.id === projectId) : null;

  const capitalize = (s: string | null) => s && s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ');

  if (location.pathname === '/admin') return null;

  return (
    <Breadcrumb className="mb-4 hidden md:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/?section=dashboard"><Home className="h-4 w-4" /></Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
            {project ? (
                <BreadcrumbLink asChild>
                    <Link to={`/?section=dashboard`}>Dashboard</Link>
                </BreadcrumbLink>
            ) : (
                <BreadcrumbPage>{capitalize(section)}</BreadcrumbPage>
            )}
        </BreadcrumbItem>
        {project && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/planning?project=${project.id}`}>{project.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export { Breadcrumbs };
