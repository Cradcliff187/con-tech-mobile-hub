
import { StakeholderAssignment, CreateAssignmentData } from './types';

export const transformAssignmentData = (rawData: any): StakeholderAssignment => {
  return {
    ...rawData,
    daily_hours: rawData.daily_hours || {},
    total_hours: rawData.total_hours || 0,
    total_cost: rawData.total_cost || 0,
  };
};

export const enhanceAssignmentData = (assignmentData: CreateAssignmentData) => {
  const totalHours = assignmentData.total_hours || 0;
  const hourlyRate = assignmentData.hourly_rate || 0;
  const totalCost = totalHours * hourlyRate;

  return {
    ...assignmentData,
    total_hours: totalHours,
    total_cost: totalCost,
    daily_hours: assignmentData.daily_hours || {},
    status: assignmentData.status || 'assigned',
  };
};
