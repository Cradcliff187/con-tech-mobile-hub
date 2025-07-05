import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useWeatherHistory } from '@/hooks/useWeatherHistory';
import { format } from 'date-fns';

interface WeatherHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cityName: string | null;
}

export const WeatherHistoryDialog = ({ 
  open, 
  onOpenChange, 
  cityName 
}: WeatherHistoryDialogProps) => {
  const { data, loading, error } = useWeatherHistory(cityName);

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d');
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Weather History - ${cityName}`}
      className="max-w-md"
    >
      <div className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p>No weather history available for {cityName}</p>
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.map((record, index) => {
              const currentDate = formatDate(record.created_at);
              const prevDate = index > 0 ? formatDate(data[index - 1].created_at) : null;
              const showDateHeader = currentDate !== prevDate;

              return (
                <div key={record.id}>
                  {showDateHeader && (
                    <div className="sticky top-0 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 rounded">
                      {currentDate}
                    </div>
                  )}
                  
                  <div 
                    className={`p-3 rounded-lg border ${
                      record.work_safe 
                        ? 'bg-white border-slate-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className={`text-sm ${record.work_safe ? 'text-slate-900' : 'text-red-900'}`}>
                      <span className="font-medium">
                        {formatTime(record.created_at)}
                      </span>
                      {' - '}
                      <span>{Math.round(record.temperature)}°F</span>
                      {', '}
                      <span>{record.precipitation.toFixed(1)}" rain</span>
                    </div>
                    
                    {!record.work_safe && (
                      <div className="text-xs text-red-700 mt-1">
                        ⚠️ Unsafe work conditions
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ResponsiveDialog>
  );
};