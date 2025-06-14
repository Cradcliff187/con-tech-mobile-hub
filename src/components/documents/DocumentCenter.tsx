
import { useState } from 'react';
import { DocumentList } from './DocumentList';
import { DocumentFilters } from './DocumentFilters';
import { Plus, Upload } from 'lucide-react';

export const DocumentCenter = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-800">Document Center</h2>
        
        <div className="flex gap-2">
          <button className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Upload size={20} />
            Upload
          </button>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
            <Plus size={20} />
            New Folder
          </button>
        </div>
      </div>

      <DocumentFilters 
        currentFilter={filter}
        onFilterChange={setFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <DocumentList filter={filter} searchTerm={searchTerm} />
    </div>
  );
};
