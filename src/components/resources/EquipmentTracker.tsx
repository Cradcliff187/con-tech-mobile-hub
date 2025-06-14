
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const EquipmentTracker = () => {
  const equipment = [
    {
      id: 1,
      name: 'Excavator CAT 320',
      location: 'Downtown Office Complex',
      status: 'operational',
      utilization: 85,
      nextMaintenance: '2024-07-01',
      operator: 'John Smith'
    },
    {
      id: 2,
      name: 'Crane Liebherr 150',
      location: 'Highway Bridge Renovation',
      status: 'maintenance',
      utilization: 0,
      nextMaintenance: '2024-06-25',
      operator: 'Mike Rodriguez'
    },
    {
      id: 3,
      name: 'Bulldozer D6',
      location: 'Residential Housing Phase 2',
      status: 'operational',
      utilization: 72,
      nextMaintenance: '2024-07-15',
      operator: 'Sarah Johnson'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'maintenance':
        return <AlertTriangle size={16} className="text-orange-500" />;
      default:
        return <Clock size={16} className="text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Equipment Status</h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {equipment.map((item) => (
            <div key={item.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-medium text-slate-800 mb-1">
                    {item.name}
                  </h4>
                  <p className="text-sm text-slate-600 mb-2">
                    Location: {item.location}
                  </p>
                  <p className="text-sm text-slate-600">
                    Operator: {item.operator}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Utilization</span>
                    <span className="font-medium text-slate-800">{item.utilization}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${item.utilization}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-slate-600 mb-1">Next Maintenance</p>
                  <p className="text-sm font-medium text-slate-800">
                    {new Date(item.nextMaintenance).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
