
import { StakeholderAssignment } from './types';

export const transformAssignmentData = (data: any): StakeholderAssignment => {
  return {
    ...data,
    daily_hours: typeof data.daily_hours === 'object' && data.daily_hours !== null 
      ? data.daily_hours as Record<string, number>
      : {} as Record<string, number>
  } as StakeholderAssignment;
};

export const calculateWeekStartDate = (startDate: string): string => {
  const date = new Date(startDate);
  const monday = new Date(date);
  monday.setDate(date.getDate() - date.getDay() + 1);
  return monday.toISOString().split('T')[0];
};

export const enhanceAssignmentData = (assignmentData: any) => {
  const enhancedData = {
    ...assignmentData,
    total_hours: 0,
    total_cost: 0,
    daily_hours: {},
    week_start_date: assignmentData.start_date 
      ? new Date(assignmentData.start_date).toISOString().split('T')[0]
      : null
  };

  // Set week_start_date to Monday of the week if start_date is provided
  if (enhancedData.start_date) {
    enhancedData.week_start_date = calculateWeekStartDate(enhancedData.start_date);
  }

  return enhancedData;
};
