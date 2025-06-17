
import { useState, useEffect } from 'react';
import { useStakeholders } from '@/hooks/useStakeholders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, TrendingUp, TrendingDown, Users, Clock, CheckCircle } from 'lucide-react';

export const StakeholderPerformance = () => {
  const { stakeholders } = useStakeholders();
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'name'>('rating');

  const filteredStakeholders = stakeholders
    .filter(stakeholder => typeFilter === 'all' || stakeholder.stakeholder_type === typeFilter)
    .sort((a, b) => {
      if (sortBy === 'rating') {
        // Handle null ratings - put them at the end
        if (a.rating === null && b.rating === null) return 0;
        if (a.rating === null) return 1;
        if (b.rating === null) return -1;
        return b.rating - a.rating;
      }
      return (a.company_name || '').localeCompare(b.company_name || '');
    });

  // Calculate average rating only from stakeholders with ratings
  const stakeholdersWithRatings = stakeholders.filter(s => s.rating !== null);
  const averageRating = stakeholdersWithRatings.length > 0 
    ? stakeholdersWithRatings.reduce((sum, s) => sum + s.rating!, 0) / stakeholdersWithRatings.length 
    : 0;

  // Top performers are those with rating 4.0 or higher
  const topPerformers = stakeholders
    .filter(s => s.rating !== null && s.rating >= 4.0)
    .sort((a, b) => b.rating! - a.rating!)
    .slice(0, 5);

  const getPerformanceColor = (rating: number | null) => {
    if (rating === null) return 'text-slate-400';
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (rating: number | null) => {
    if (rating === null) return { label: 'No Rating', color: 'bg-slate-100 text-slate-600' };
    if (rating >= 4.5) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (rating >= 3.5) return { label: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    if (rating >= 2.5) return { label: 'Average', color: 'bg-orange-100 text-orange-800' };
    return { label: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Stakeholders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold">{stakeholders.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="h-8 w-8 text-yellow-500" />
              <span className="text-2xl font-bold">
                {stakeholdersWithRatings.length > 0 ? averageRating.toFixed(1) : 'N/A'}
              </span>
              {stakeholdersWithRatings.length > 0 && (
                <span className="text-sm text-slate-500">/ 5.0</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold">{topPerformers.length}</span>
              <span className="text-sm text-slate-500">4.0+ rating</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48 min-h-[44px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="client">Clients</SelectItem>
            <SelectItem value="subcontractor">Subcontractors</SelectItem>
            <SelectItem value="employee">Employees</SelectItem>
            <SelectItem value="vendor">Vendors</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-48 min-h-[44px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="rating">Rating (High to Low)</SelectItem>
            <SelectItem value="name">Name (A to Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Performance List */}
      {filteredStakeholders.length > 0 ? (
        <div className="grid gap-4">
          {filteredStakeholders.map((stakeholder) => {
            const performanceBadge = getPerformanceBadge(stakeholder.rating);
            
            return (
              <Card key={stakeholder.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">
                        {stakeholder.company_name || 'Individual'}
                      </CardTitle>
                      {stakeholder.contact_person && (
                        <p className="text-sm text-slate-600">{stakeholder.contact_person}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={performanceBadge.color}>
                        {performanceBadge.label}
                      </Badge>
                      <Badge variant="outline">
                        {stakeholder.stakeholder_type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Rating Display */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        {stakeholder.rating !== null ? (
                          <>
                            <span className={`font-bold ${getPerformanceColor(stakeholder.rating)}`}>
                              {stakeholder.rating.toFixed(1)}
                            </span>
                            <span className="text-sm text-slate-500">/ 5.0</span>
                          </>
                        ) : (
                          <span className="text-sm text-slate-500">No rating yet</span>
                        )}
                      </div>
                    </div>
                    {stakeholder.rating !== null && (
                      <Progress 
                        value={(stakeholder.rating / 5) * 100} 
                        className="h-2"
                      />
                    )}
                  </div>

                  {/* Specialties */}
                  {stakeholder.specialties && stakeholder.specialties.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-slate-600">Specialties:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {stakeholder.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Crew Size for Subcontractors */}
                  {stakeholder.stakeholder_type === 'subcontractor' && stakeholder.crew_size && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={16} className="text-slate-500" />
                      <span>{stakeholder.crew_size} crew members</span>
                    </div>
                  )}

                  {/* Quick Stats - Placeholder for now */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-slate-800">0</div>
                      <div className="text-xs text-slate-500">Active Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-slate-800">0</div>
                      <div className="text-xs text-slate-500">Completed Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-slate-800">0</div>
                      <div className="text-xs text-slate-500">Total Hours</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-slate-500 mb-2">
            {typeFilter !== 'all' 
              ? `No ${typeFilter}s found` 
              : 'No stakeholders found'
            }
          </div>
          <div className="text-sm text-slate-400">
            Performance data will appear here once stakeholders are added and evaluated
          </div>
        </div>
      )}
    </div>
  );
};
