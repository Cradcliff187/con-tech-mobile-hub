
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, User } from 'lucide-react';
import { AssignmentSuggestion } from '@/services/SmartAssignmentEngine';

interface StakeholderSuggestionCardProps {
  suggestion: AssignmentSuggestion;
  onSelect: (stakeholderId: string) => void;
  isSelected?: boolean;
  compact?: boolean;
}

export const StakeholderSuggestionCard: React.FC<StakeholderSuggestionCardProps> = ({
  suggestion,
  onSelect,
  isSelected = false,
  compact = false
}) => {
  const { stakeholder, score, reasons, warnings, skillMatch, availability, performance, workloadStatus } = suggestion;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getWorkloadStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'nearly_full': return 'bg-orange-100 text-orange-800';
      case 'overallocated': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStakeholderTypeIcon = (type: string) => {
    switch (type) {
      case 'employee': return <User size={14} className="text-green-600" />;
      case 'subcontractor': return <User size={14} className="text-blue-600" />;
      case 'vendor': return <User size={14} className="text-purple-600" />;
      default: return <User size={14} className="text-slate-600" />;
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return '?';
  };

  if (compact) {
    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-sm ${
          isSelected ? 'ring-2 ring-blue-500 border-blue-300' : ''
        }`}
        onClick={() => onSelect(stakeholder.id)}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-slate-200">
                  {getInitials(stakeholder.contact_person, stakeholder.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {stakeholder.company_name || stakeholder.contact_person || 'Unnamed'}
                </div>
                <div className="flex items-center gap-1">
                  <Badge className={`text-xs ${getWorkloadStatusColor(workloadStatus)}`}>
                    {workloadStatus.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`text-sm font-bold px-2 py-1 rounded border ${getScoreColor(score)}`}>
                {score}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-300 bg-blue-50' : ''
      }`}
      onClick={() => onSelect(stakeholder.id)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-sm bg-slate-200">
                {getInitials(stakeholder.contact_person, stakeholder.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-slate-900 truncate">
                  {stakeholder.company_name || stakeholder.contact_person || 'Unnamed'}
                </h4>
                {getStakeholderTypeIcon(stakeholder.stakeholder_type)}
              </div>
              {stakeholder.contact_person && stakeholder.company_name && (
                <p className="text-sm text-slate-600 truncate">{stakeholder.contact_person}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {stakeholder.stakeholder_type}
                </Badge>
                <Badge className={`text-xs ${getWorkloadStatusColor(workloadStatus)}`}>
                  {workloadStatus.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>
          <div className={`text-lg font-bold px-3 py-1 rounded border ${getScoreColor(score)}`}>
            {score}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-1">Skills</div>
            <div className="font-medium text-sm">{skillMatch}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-1">Available</div>
            <div className="font-medium text-sm">{availability}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-1">Performance</div>
            <div className="font-medium text-sm">{performance}%</div>
          </div>
        </div>

        {/* Reasons */}
        {reasons.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-medium text-slate-700 mb-2 flex items-center gap-1">
              <CheckCircle size={12} className="text-green-600" />
              Why this match works
            </div>
            <ul className="space-y-1">
              {reasons.slice(0, 2).map((reason, index) => (
                <li key={index} className="text-xs text-slate-600 flex items-start gap-1">
                  <span className="text-green-600 mt-0.5">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-medium text-orange-700 mb-2 flex items-center gap-1">
              <AlertTriangle size={12} className="text-orange-600" />
              Consider
            </div>
            <ul className="space-y-1">
              {warnings.slice(0, 2).map((warning, index) => (
                <li key={index} className="text-xs text-orange-600 flex items-start gap-1">
                  <span className="text-orange-600 mt-0.5">•</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Button */}
        <Button
          size="sm"
          className={`w-full ${isSelected ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
          variant={isSelected ? 'default' : 'outline'}
        >
          {isSelected ? 'Selected' : 'Select'}
        </Button>
      </CardContent>
    </Card>
  );
};
