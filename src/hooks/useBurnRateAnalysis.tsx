
import { useMemo } from 'react';
import { useEmployeeAssignments } from '@/hooks/employee-assignments';
import { format, subDays, eachDayOfInterval } from 'date-fns';

interface BurnRateDataPoint {
  date: string;
  dailySpend: number;
  cumulativeSpend: number;
  budgetLine: number;
}

export const useBurnRateAnalysis = (
  projectId?: string,
  startDate?: Date,
  endDate?: Date
) => {
  const { employeeAssignments } = useEmployeeAssignments();

  const burnRateData = useMemo(() => {
    if (!startDate || !endDate) return [];

    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    const data: BurnRateDataPoint[] = [];
    
    let cumulativeSpend = 0;
    const totalDays = dateRange.length;
    
    // Filter assignments for the project if specified
    const relevantAssignments = projectId 
      ? employeeAssignments.filter(a => a.project_id === projectId)
      : employeeAssignments;
    
    // Calculate total budget for budget line
    const totalBudget = relevantAssignments.reduce((sum, a) => sum + (a.total_cost || 0), 0);
    const dailyBudget = totalBudget / totalDays;

    dateRange.forEach((date, index) => {
      // Calculate daily spend (simplified - in reality this would be more complex)
      const dailySpend = relevantAssignments
        .filter(assignment => {
          if (!assignment.start_date || !assignment.end_date) return false;
          const assignmentStart = new Date(assignment.start_date);
          const assignmentEnd = new Date(assignment.end_date);
          return date >= assignmentStart && date <= assignmentEnd;
        })
        .reduce((sum, assignment) => {
          const assignmentDays = Math.ceil(
            (new Date(assignment.end_date!).getTime() - new Date(assignment.start_date!).getTime()) 
            / (1000 * 60 * 60 * 24)
          );
          return sum + ((assignment.total_cost || 0) / Math.max(1, assignmentDays));
        }, 0);

      cumulativeSpend += dailySpend;

      data.push({
        date: format(date, 'MMM dd'),
        dailySpend,
        cumulativeSpend,
        budgetLine: dailyBudget * (index + 1)
      });
    });

    return data;
  }, [employeeAssignments, projectId, startDate, endDate]);

  const burnRateMetrics = useMemo(() => {
    if (burnRateData.length === 0) return null;

    const totalSpent = burnRateData[burnRateData.length - 1]?.cumulativeSpend || 0;
    const totalBudget = burnRateData[burnRateData.length - 1]?.budgetLine || 0;
    const avgDailyBurn = totalSpent / burnRateData.length;
    
    // Project completion based on current burn rate
    const remainingBudget = Math.max(0, totalBudget - totalSpent);
    const daysToComplete = avgDailyBurn > 0 ? remainingBudget / avgDailyBurn : Infinity;

    return {
      totalSpent,
      totalBudget,
      avgDailyBurn,
      remainingBudget,
      daysToComplete: daysToComplete === Infinity ? null : Math.ceil(daysToComplete),
      isOverBudget: totalSpent > totalBudget,
      burnRateVariance: totalSpent - totalBudget
    };
  }, [burnRateData]);

  return {
    burnRateData,
    burnRateMetrics
  };
};
