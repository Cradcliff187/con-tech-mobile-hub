
import { Search } from 'lucide-react';

interface DocumentFiltersProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const DocumentFilters = ({ 
  currentFilter, 
  onFilterChange, 
  searchTerm, 
  onSearchChange 
}: DocumentFiltersProps) => {
  const filters = [
    { id: 'all', label: 'All Files' },
    { id: 'plans', label: 'Plans & Drawings' },
    { id: 'permits', label: 'Permits' },
    { id: 'contracts', label: 'Contracts' },
    { id: 'photos', label: 'Photos' },
    { id: 'reports', label: 'Reports' },
    { id: 'receipts', label: 'Receipts' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                currentFilter === filter.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
