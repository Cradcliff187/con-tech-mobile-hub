
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CostExportDialogProps {
  onExport: (options: {
    format: 'csv' | 'pdf';
    includeCharts: boolean;
    includeProjects: boolean;
    includeEmployees: boolean;
    dateRange: 'all' | '30days' | '90days' | 'custom';
  }) => void;
}

export const CostExportDialog = ({ onExport }: CostExportDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeProjects, setIncludeProjects] = useState(true);
  const [includeEmployees, setIncludeEmployees] = useState(true);
  const [dateRange, setDateRange] = useState<'all' | '30days' | '90days' | 'custom'>('30days');
  const { toast } = useToast();

  const handleExport = () => {
    onExport({
      format,
      includeCharts,
      includeProjects,
      includeEmployees,
      dateRange
    });
    
    toast({
      title: "Export Started",
      description: `Your ${format.toUpperCase()} export is being generated...`
    });
    
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download size={16} className="mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Cost Report</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Export Format</label>
            <Select value={format} onValueChange={(value: 'csv' | 'pdf') => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet size={16} />
                    CSV - Spreadsheet
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    PDF - Report
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Include Options */}
          <div>
            <label className="text-sm font-medium mb-2 block">Include in Export</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="projects" 
                  checked={includeProjects}
                  onCheckedChange={setIncludeProjects}
                />
                <label htmlFor="projects" className="text-sm">Project Cost Overview</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="employees" 
                  checked={includeEmployees}
                  onCheckedChange={setIncludeEmployees}
                />
                <label htmlFor="employees" className="text-sm">Employee Earnings Data</label>
              </div>
              
              {format === 'pdf' && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="charts" 
                    checked={includeCharts}
                    onCheckedChange={setIncludeCharts}
                  />
                  <label htmlFor="charts" className="text-sm">Charts and Visualizations</label>
                </div>
              )}
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download size={16} className="mr-2" />
              Export {format.toUpperCase()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
