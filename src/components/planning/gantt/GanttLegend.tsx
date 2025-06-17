
export const GanttLegend = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-slate-700 mb-3">Construction Phases & Status</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
        {/* Status Legend */}
        <div className="space-y-2">
          <div className="font-medium text-slate-600">Status</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Blocked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>On Hold</span>
          </div>
        </div>

        {/* Phase Legend */}
        <div className="space-y-2">
          <div className="font-medium text-slate-600">Phases</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-600 rounded"></div>
            <span>Foundation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-600 rounded"></div>
            <span>Structure</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Electrical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span>Plumbing</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="font-medium text-slate-600">&nbsp;</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-500 rounded"></div>
            <span>HVAC</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>Finishing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Punch List</span>
          </div>
        </div>
      </div>
    </div>
  );
};
