
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText } from 'lucide-react';
import { exportToPDF, exportToExcel } from './exportUtils';
import { exportPlanningToPDF, exportPlanningToExcel } from './planningExportUtils';

interface ExportOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateRange?: string;
  selectedProjectId: string;
  reportType?: 'dashboard' | 'charts';
  context?: 'reports' | 'planning';
  activeView?: string;
}

export const ExportOptionsDialog = ({ 
  open, 
  onOpenChange, 
  dateRange = 'all', 
  selectedProjectId, 
  reportType = 'dashboard',
  context = 'reports',
  activeView = 'gantt'
}: ExportOptionsDialogProps) => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [filteredOnly, setFilteredOnly] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const getDateRangeLabel = (range: string) => {
    switch (range) {
      case 'last_30_days': return 'Last 30 Days';
      case 'last_90_days': return 'Last 90 Days';
      case 'this_year': return 'This Year';
      case 'custom_range': return 'Custom Range';
      default: return 'All Time';
    }
  };

  const getDialogTitle = () => {
    return context === 'planning' ? 'Export Project Plan' : 'Export Progress Report';
  };

  const getExportDescription = () => {
    if (context === 'planning') {
      return 'Export project planning data including tasks, milestones, and resource allocations';
    }
    return 'Export progress report data';
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      if (context === 'planning') {
        const planningOptions = {
          format: exportFormat,
          projectId: selectedProjectId,
          activeView,
          timestamp
        };

        const filename = `ConstructPro_Planning_${timestamp}`;

        if (exportFormat === 'pdf') {
          await exportPlanningToPDF(planningOptions, filename);
        } else {
          await exportPlanningToExcel(planningOptions, filename);
        }
      } else {
        // Use existing export logic for reports
        const exportOptions = {
          format: exportFormat,
          dateRange: filteredOnly ? dateRange : 'all',
          projectId: filteredOnly ? selectedProjectId : 'all',
          reportType: reportType || 'dashboard',
          timestamp
        };

        const filename = `ConstructPro_Report_${timestamp}`;

        if (exportFormat === 'pdf') {
          await exportToPDF(exportOptions, filename);
        } else {
          await exportToExcel(exportOptions, filename);
        }
      }

      toast({
        title: "Export Successful",
        description: `${context === 'planning' ? 'Project plan' : 'Report'} exported as ${exportFormat.toUpperCase()} successfully`
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: `There was an error generating the ${context === 'planning' ? 'project plan' : 'report'}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download size={20} />
            {getDialogTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: 'pdf' | 'excel') => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    PDF (Formatted Report)
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    Excel (Raw Data)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {context === 'reports' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="filtered-only" 
                  checked={filteredOnly}
                  onCheckedChange={(checked) => setFilteredOnly(checked as boolean)}
                />
                <Label htmlFor="filtered-only">Export filtered data only</Label>
              </div>
              
              {filteredOnly && (
                <div className="bg-slate-50 p-3 rounded-lg text-sm space-y-1">
                  <div><strong>Date Range:</strong> {getDateRangeLabel(dateRange)}</div>
                  <div><strong>Project:</strong> {selectedProjectId === 'all' ? 'All Projects' : 'Selected Project'}</div>
                  <div><strong>Report Type:</strong> {reportType === 'dashboard' ? 'Dashboard View' : 'Charts View'}</div>
                </div>
              )}
            </div>
          )}

          {context === 'planning' && (
            <div className="bg-slate-50 p-3 rounded-lg text-sm space-y-1">
              <div><strong>Project:</strong> Selected Project</div>
              <div><strong>Active View:</strong> {activeView}</div>
              <div><strong>Data Includes:</strong> Tasks, Milestones, Resource Allocations</div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
