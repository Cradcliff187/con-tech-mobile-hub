
import { useState } from 'react';
import { ReportDashboard } from './ReportDashboard';
import { ReportCharts } from './ReportCharts';
import { Calendar, Download } from 'lucide-react';

export const ProgressReports = () => {
  const [reportType, setReportType] = useState<'dashboard' | 'charts'>('dashboard');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-800">Progress Reports</h2>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setReportType('dashboard')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                reportType === 'dashboard'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setReportType('charts')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                reportType === 'charts'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Charts
            </button>
          </div>
          
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-500" />
            <select className="border border-slate-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
              <option>Custom Range</option>
            </select>
          </div>
          
          <select className="border border-slate-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Projects</option>
            <option>Downtown Office Complex</option>
            <option>Residential Housing Phase 2</option>
            <option>Highway Bridge Renovation</option>
          </select>
        </div>
        
        {reportType === 'dashboard' ? <ReportDashboard /> : <ReportCharts />}
      </div>
    </div>
  );
};
