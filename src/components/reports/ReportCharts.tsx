
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useChartData } from '@/hooks/useChartData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const ReportCharts = () => {
  const { projectProgress, taskStatus, loading } = useChartData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-slate-200 rounded"></div>
            <div className="h-80 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-800">Project Reports</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h4 className="text-md font-medium text-slate-700 mb-4">Project Progress</h4>
          {projectProgress.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="progress" fill="#0088FE" name="Progress %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-300 text-slate-500">
              No project data available
            </div>
          )}
        </div>

        {/* Task Status Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h4 className="text-md font-medium text-slate-700 mb-4">Task Status Distribution</h4>
          {taskStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {taskStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-300 text-slate-500">
              No task data available
            </div>
          )}
        </div>

        {/* Budget vs Spent Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 lg:col-span-2">
          <h4 className="text-md font-medium text-slate-700 mb-4">Budget vs Spent</h4>
          {projectProgress.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="budget" fill="#00C49F" name="Budget" />
                <Bar dataKey="spent" fill="#FF8042" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-300 text-slate-500">
              No budget data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
