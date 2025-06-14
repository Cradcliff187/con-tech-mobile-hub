
import { Clock, CheckSquare, User, AlertTriangle } from 'lucide-react';

export const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'task_completed',
      message: 'Foundation pour completed for Building A',
      project: 'Downtown Office Complex',
      time: '2 hours ago',
      icon: CheckSquare,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'user_action',
      message: 'Mike Johnson checked in at Riverside site',
      project: 'Residential Housing Phase 2',
      time: '4 hours ago',
      icon: User,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'delay',
      message: 'Material delivery delayed by 2 days',
      project: 'Highway Bridge Renovation',
      time: '6 hours ago',
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      id: 4,
      type: 'task_completed',
      message: 'Electrical rough-in inspection passed',
      project: 'Downtown Office Complex',
      time: '1 day ago',
      icon: CheckSquare,
      color: 'text-green-600'
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Activity</h2>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 divide-y divide-slate-100">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start space-x-3">
                <div className={`mt-1 ${activity.color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 font-medium">
                    {activity.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {activity.project}
                  </p>
                </div>
                <div className="flex items-center text-xs text-slate-500">
                  <Clock size={14} className="mr-1" />
                  {activity.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
