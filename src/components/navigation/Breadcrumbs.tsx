
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
  const category = searchParams.get('category');
  
  let section = searchParams.get('section');
  if (!section) {
    if (location.pathname === '/') section = 'dashboard';
    else if (location.pathname === '/planning') section = 'planning';
  }

  const { projects } = useProjects();
  const project = projectId ? projects.find(p => p.id === projectId) : null;

  const capitalize = (s: string | null) => s && s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ');

  const getCategoryLabel = (cat: string) => {
    const categoryMap: Record<string, string> = {
      'plans': 'Plans & Drawings',
      'permits': 'Permits',
      'contracts': 'Contracts',
      'photos': 'Photos',
      'reports': 'Reports',
      'receipts': 'Receipts',
      'safety': 'Safety Documents',
      'other': 'Other'
    };
    return categoryMap[cat] || capitalize(cat);
  };

  // Don't show breadcrumbs on admin pages
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
              {section === 'documents' && !category ? (
                <BreadcrumbPage>{project.name} - Documents</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={`/?section=${section}&project=${project.id}`}>
                    {project.name}
                    {section && section !== 'dashboard' && ` - ${capitalize(section)}`}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {section === 'documents' && category && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{getCategoryLabel(category)}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export { Breadcrumbs };
