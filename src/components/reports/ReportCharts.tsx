
export const ReportCharts = () => {
  // Mock chart data - in a real app, this would come from a charting library
  const chartData = {
    schedulePerformance: [
      { month: 'Jan', onTime: 85, delayed: 15 },
      { month: 'Feb', onTime: 88, delayed: 12 },
      { month: 'Mar', onTime: 92, delayed: 8 },
      { month: 'Apr', onTime: 89, delayed: 11 },
      { month: 'May', onTime: 94, delayed: 6 },
      { month: 'Jun', onTime: 92, delayed: 8 }
    ],
    budgetTrends: [
      { month: 'Jan', planned: 500000, actual: 485000 },
      { month: 'Feb', planned: 750000, actual: 745000 },
      { month: 'Mar', planned: 1200000, actual: 1180000 },
      { month: 'Apr', planned: 1650000, actual: 1625000 },
      { month: 'May', planned: 2100000, actual: 2080000 },
      { month: 'Jun', planned: 2500000, actual: 2470000 }
    ]
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Schedule Performance Trend</h3>
        <div className="bg-slate-50 rounded-lg p-6 h-64 flex items-center justify-center">
          <div className="text-center text-slate-500">
            <p className="mb-2">Schedule Performance Chart</p>
            <p className="text-sm">Chart visualization would appear here</p>
            <div className="mt-4 flex justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm">On Time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-sm">Delayed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Budget vs Actual Spending</h3>
        <div className="bg-slate-50 rounded-lg p-6 h-64 flex items-center justify-center">
          <div className="text-center text-slate-500">
            <p className="mb-2">Budget Comparison Chart</p>
            <p className="text-sm">Chart visualization would appear here</p>
            <div className="mt-4 flex justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm">Planned Budget</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span className="text-sm">Actual Spending</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Resource Utilization</h3>
          <div className="bg-slate-50 rounded-lg p-6 h-48 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <p className="mb-2">Resource Utilization</p>
              <p className="text-sm">Pie chart would appear here</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Project Progress</h3>
          <div className="bg-slate-50 rounded-lg p-6 h-48 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <p className="mb-2">Progress Overview</p>
              <p className="text-sm">Progress chart would appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
