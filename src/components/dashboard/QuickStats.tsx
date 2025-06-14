
export const QuickStats = () => {
  const stats = [
    {
      label: 'Active Projects',
      value: '8',
      change: '+2 this month',
      color: 'text-blue-600'
    },
    {
      label: 'On Schedule',
      value: '75%',
      change: '+5% from last month',
      color: 'text-green-600'
    },
    {
      label: 'Budget Efficiency',
      value: '94%',
      change: 'Within target',
      color: 'text-orange-600'
    },
    {
      label: 'Active Workers',
      value: '127',
      change: 'Across all sites',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="md:col-span-2 lg:col-span-2">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Stats</h2>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className={`text-2xl font-bold ${stat.color} mb-1`}>
              {stat.value}
            </div>
            <div className="text-sm text-slate-600 mb-1">{stat.label}</div>
            <div className="text-xs text-slate-500">{stat.change}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
