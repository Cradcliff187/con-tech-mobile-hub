
import { FileText, Image, File, Folder, Download, Share } from 'lucide-react';

interface DocumentListProps {
  filter: string;
  searchTerm: string;
}

export const DocumentList = ({ filter, searchTerm }: DocumentListProps) => {
  const documents = [
    {
      id: 1,
      name: 'Site Plans - Floor 1-3',
      type: 'plans',
      format: 'PDF',
      size: '2.4 MB',
      modified: '2024-06-15',
      project: 'Downtown Office Complex',
      isFolder: false
    },
    {
      id: 2,
      name: 'Building Permits',
      type: 'permits',
      format: 'Folder',
      size: '15 files',
      modified: '2024-06-14',
      project: 'Downtown Office Complex',
      isFolder: true
    },
    {
      id: 3,
      name: 'Foundation Progress Photos',
      type: 'photos',
      format: 'JPG',
      size: '8.7 MB',
      modified: '2024-06-13',
      project: 'Downtown Office Complex',
      isFolder: false
    },
    {
      id: 4,
      name: 'Contract - Steel Fabrication',
      type: 'contracts',
      format: 'PDF',
      size: '1.2 MB',
      modified: '2024-06-12',
      project: 'Downtown Office Complex',
      isFolder: false
    },
    {
      id: 5,
      name: 'Weekly Progress Report',
      type: 'reports',
      format: 'PDF',
      size: '892 KB',
      modified: '2024-06-11',
      project: 'Multiple Projects',
      isFolder: false
    }
  ];

  const getFileIcon = (type: string, isFolder: boolean) => {
    if (isFolder) return <Folder className="text-blue-500" size={20} />;
    
    switch (type) {
      case 'photos':
        return <Image className="text-green-500" size={20} />;
      case 'plans':
      case 'permits':
      case 'contracts':
      case 'reports':
        return <FileText className="text-red-500" size={20} />;
      default:
        return <File className="text-slate-500" size={20} />;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesFilter = filter === 'all' || doc.type === filter;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="divide-y divide-slate-100">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(doc.type, doc.isFolder)}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-slate-800 truncate">
                    {doc.name}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span>{doc.format}</span>
                    <span>{doc.size}</span>
                    <span>Modified: {new Date(doc.modified).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {doc.project}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button className="p-1 text-slate-500 hover:text-slate-700 rounded">
                  <Share size={16} />
                </button>
                <button className="p-1 text-slate-500 hover:text-slate-700 rounded">
                  <Download size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredDocuments.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-slate-500">No documents found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};
