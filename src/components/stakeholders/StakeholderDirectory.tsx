
import { useState } from 'react';
import { useStakeholders } from '@/hooks/useStakeholders';
import { StakeholderCard } from './StakeholderCard';
import { StakeholderFilters } from './StakeholderFilters';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export const StakeholderDirectory = () => {
  const { stakeholders, loading } = useStakeholders();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredStakeholders = stakeholders.filter(stakeholder => {
    const matchesSearch = 
      stakeholder.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stakeholder.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stakeholder.specialties?.some(specialty => 
        specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesType = typeFilter === 'all' || stakeholder.stakeholder_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || stakeholder.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <Input
            placeholder="Search stakeholders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <StakeholderFilters
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStakeholders.map((stakeholder) => (
          <StakeholderCard key={stakeholder.id} stakeholder={stakeholder} />
        ))}
      </div>

      {filteredStakeholders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-500 mb-2">No stakeholders found</div>
          <div className="text-sm text-slate-400">
            Try adjusting your search or filters
          </div>
        </div>
      )}
    </div>
  );
};
