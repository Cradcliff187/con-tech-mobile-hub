
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, Upload, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ImportEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface EquipmentRow {
  name: string;
  type: string;
  status: string;
  maintenance_due: string;
  isValid: boolean;
  errors: string[];
}

export const ImportEquipmentDialog = ({
  open,
  onOpenChange,
  onSuccess
}: ImportEquipmentDialogProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCsvData] = useState<EquipmentRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const validStatuses = ['available', 'in-use', 'maintenance', 'out-of-service'];

  const downloadTemplate = () => {
    const csvContent = 'name,type,status,maintenance_due\n' +
      'Excavator CAT 320,Heavy Machinery,available,2024-08-15\n' +
      'Generator 15kW,Power Equipment,in-use,2024-09-01\n' +
      'Safety Harness Set,Safety Equipment,available,';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'equipment_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const validateRow = (row: any, index: number): EquipmentRow => {
    const errors: string[] = [];
    
    if (!row.name || row.name.trim() === '') {
      errors.push('Name is required');
    }
    
    if (!row.type || row.type.trim() === '') {
      errors.push('Type is required');
    }
    
    if (row.status && !validStatuses.includes(row.status.toLowerCase())) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }
    
    if (row.maintenance_due && row.maintenance_due.trim() !== '') {
      const date = new Date(row.maintenance_due);
      if (isNaN(date.getTime())) {
        errors.push('Maintenance due date must be a valid date (YYYY-MM-DD)');
      }
    }

    return {
      name: row.name?.trim() || '',
      type: row.type?.trim() || '',
      status: row.status?.trim().toLowerCase() || 'available',
      maintenance_due: row.maintenance_due?.trim() || '',
      isValid: errors.length === 0,
      errors
    };
  };

  const parseCSV = (text: string): EquipmentRow[] => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const expectedHeaders = ['name', 'type', 'status', 'maintenance_due'];
    
    // Check if all required headers are present
    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      toast({
        title: "Invalid CSV Format",
        description: `Missing required columns: ${missingHeaders.join(', ')}`,
        variant: "destructive"
      });
      return [];
    }

    const data: EquipmentRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      const validatedRow = validateRow(row, i);
      data.push(validatedRow);
    }
    
    return data;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsedData = parseCSV(text);
      setCsvData(parsedData);
      setShowPreview(parsedData.length > 0);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const validRows = csvData.filter(row => row.isValid);
    
    if (validRows.length === 0) {
      toast({
        title: "No Valid Data",
        description: "Please fix the validation errors before importing",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const equipmentData = validRows.map(row => ({
        name: row.name,
        type: row.type,
        status: row.status,
        maintenance_due: row.maintenance_due || null,
        utilization_rate: 0
      }));

      const { data, error } = await supabase
        .from('equipment')
        .insert(equipmentData)
        .select();

      if (error) throw error;

      const successCount = data?.length || 0;
      const errorCount = csvData.length - successCount;

      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} equipment items${errorCount > 0 ? `, ${errorCount} failed` : ''}`
      });

      setCsvData([]);
      setShowPreview(false);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error importing equipment:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import equipment",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetDialog = () => {
    setCsvData([]);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validCount = csvData.filter(row => row.isValid).length;
  const errorCount = csvData.length - validCount;

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetDialog();
    }}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Equipment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">CSV Template</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-3">
                Download the CSV template to see the required format and example data.
              </p>
              <Button onClick={downloadTemplate} variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                Download Template
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Upload CSV File</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="mb-3"
              />
              <p className="text-xs text-slate-500">
                Required columns: name, type, status, maintenance_due
              </p>
            </CardContent>
          </Card>

          {/* Preview */}
          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  Preview ({csvData.length} rows)
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle size={14} />
                      {validCount} valid
                    </span>
                    {errorCount > 0 && (
                      <span className="flex items-center gap-1 text-red-600">
                        <AlertTriangle size={14} />
                        {errorCount} errors
                      </span>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Maintenance Due</th>
                        <th className="text-left p-2">Errors</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.map((row, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">
                            {row.isValid ? (
                              <CheckCircle size={16} className="text-green-600" />
                            ) : (
                              <X size={16} className="text-red-600" />
                            )}
                          </td>
                          <td className="p-2">{row.name}</td>
                          <td className="p-2">{row.type}</td>
                          <td className="p-2">{row.status}</td>
                          <td className="p-2">{row.maintenance_due}</td>
                          <td className="p-2">
                            {row.errors.length > 0 && (
                              <span className="text-red-600 text-xs">
                                {row.errors.join(', ')}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            {showPreview && (
              <Button
                onClick={handleImport}
                disabled={isProcessing || validCount === 0}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" />
                    Import {validCount} Equipment Items
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
