
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';

export const AdvancedMetrics = () => {
  const { projects } = useProjects();
  const { tasks } = useTasks();

  // Generate real budget vs spent data
  const budgetData = projects
    .filter(p => p.budget && p.budget > 0)
    .slice(0, 6) // Show top 6 projects
    .map(project => ({
      name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
      budget: Number(project.budget) || 0,
      spent: Number(project.spent) || 0
    }));

  // Generate real task distribution data
  const taskStatusData = [
    { name: 'Not Started', value: tasks.filter(t => t.status === 'not-started').length, color: '#94a3b8' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: '#f97316' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#22c55e' },
    { name: 'Blocked', value: tasks.filter(t => t.status === 'blocked').length, color: '#ef4444' }
  ].filter(item => item.value > 0); // Only show categories with tasks

  if (projects.length === 0 && tasks.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-800">Budget vs Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <p className="text-slate-500">No project budget data available</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-slate-800">Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <p className="text-slate-500">No task data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-800">Budget vs Spending</CardTitle>
        </CardHeader>
        <CardContent>
          {budgetData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                <Bar dataKey="spent" fill="#f97316" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-slate-500">No budget data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-slate-800">Task Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {taskStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-slate-500">No task data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
