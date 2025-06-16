
import { AlertTriangle, CheckCircle, Clock, Wrench } from 'lucide-react';
import { useEquipment } from '@/hooks/useEquipment';

export const EquipmentTracker = () => {
  const { equipment, loading } = useEquipment();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-use':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'maintenance':
        return <Wrench size={16} className="text-orange-500" />;
      case 'available':
        return <Clock size={16} className="text-blue-500" />;
      default:
        return <AlertTriangle size={16} className="text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-use':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'available':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-slate-500 mt-2">Loading equipment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Equipment Status</h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {equipment.length === 0 ? (
            <div className="p-6 text-center">
              <Wrench size={48} className="mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No Equipment Found</h3>
              <p className="text-slate-500">Add equipment to track utilization and maintenance</p>
            </div>
          ) : (
            equipment.map((item) => (
              <div key={item.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-slate-800 mb-1">
                      {item.name}
                    </h4>
                    <p className="text-sm text-slate-600 mb-2">
                      Type: {item.type || 'Unknown'}
                    </p>
                    <p className="text-sm text-slate-600 mb-2">
                      Location: {item.project?.name || 'Available'}
                    </p>
                    <p className="text-sm text-slate-600">
                      Operator: {item.operator?.full_name || 'Unassigned'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status?.replace('-', ' ') || 'unknown'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Utilization</span>
                      <span className="font-medium text-slate-800">{item.utilization_rate || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${Math.min(item.utilization_rate || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Next Maintenance</p>
                    <p className="text-sm font-medium text-slate-800">
                      {item.maintenance_due 
                        ? new Date(item.maintenance_due).toLocaleDateString()
                        : 'Not scheduled'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
