
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

interface ProjectLinkProps {
  projectId: string;
  projectName?: string;
  className?: string;
  showIcon?: boolean;
}

export const ProjectLink = ({ 
  projectId, 
  projectName,
  className = "text-sm text-blue-600 hover:text-blue-700 hover:underline",
  showIcon = true 
}: ProjectLinkProps) => {
  const displayText = projectName || `Project ${projectId.slice(0, 8)}...`;
  
  return (
    <Link 
      to={`/planning?project=${projectId}`}
      className={`inline-flex items-center gap-1 ${className}`}
    >
      {displayText}
      {showIcon && <ExternalLink size={12} />}
    </Link>
  );
};
