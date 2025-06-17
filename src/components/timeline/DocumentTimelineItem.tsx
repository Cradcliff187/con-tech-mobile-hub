
import React from 'react';
import { FileText, Upload, Check, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DocumentRecord {
  id: string;
  name: string;
  category?: string;
  created_at: string;
  file_type?: string;
  uploader?: {
    full_name?: string;
    email: string;
  };
}

interface DocumentTimelineItemProps {
  document: DocumentRecord;
  onNavigate: (documentId: string) => void;
  className?: string;
}

export const DocumentTimelineItem: React.FC<DocumentTimelineItemProps> = ({
  document,
  onNavigate,
  className
}) => {
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'plans': return 'bg-blue-100 text-blue-800';
      case 'permits': return 'bg-green-100 text-green-800';
      case 'contracts': return 'bg-purple-100 text-purple-800';
      case 'safety': return 'bg-red-100 text-red-800';
      case 'photos': return 'bg-orange-100 text-orange-800';
      case 'reports': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusIcon = () => {
    return <Upload size={16} className="text-blue-600" />;
  };

  return (
    <div className={`flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors ${className}`}>
      <div className="flex-shrink-0 mt-1">
        {getStatusIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-slate-800 truncate">
              {document.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              {document.category && (
                <Badge className={`text-xs ${getCategoryColor(document.category)}`}>
                  {document.category}
                </Badge>
              )}
              <span className="text-xs text-slate-500">
                Uploaded {format(new Date(document.created_at), 'MMM d, h:mm a')}
              </span>
            </div>
            {document.uploader && (
              <p className="text-xs text-slate-500 mt-1">
                by {document.uploader.full_name || document.uploader.email}
              </p>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate(document.id)}
            className="text-xs flex-shrink-0"
          >
            <FileText size={12} className="mr-1" />
            View
          </Button>
        </div>
      </div>
    </div>
  );
};
