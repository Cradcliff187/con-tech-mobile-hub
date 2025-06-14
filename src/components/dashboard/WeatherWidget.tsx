
import { Cloud, Sun } from 'lucide-react';

export const WeatherWidget = () => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-3">Today's Weather</h3>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold text-slate-800">72°F</div>
          <div className="text-sm text-slate-600">Partly Cloudy</div>
          <div className="text-xs text-slate-500 mt-1">Good for outdoor work</div>
        </div>
        <div className="text-blue-500">
          <Cloud size={48} />
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-500">
        Wind: 8 mph • Humidity: 65%
      </div>
    </div>
  );
};
