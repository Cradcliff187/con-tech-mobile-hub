import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useEquipmentServiceRecords } from '@/hooks/useEquipmentServiceRecords';
import { useDocuments } from '@/hooks/useDocuments';
import { AlertTriangle, Calendar, FileText, Wrench, Plus, Download, Trash2, Upload } from 'lucide-react';
import { format } from 'date-fns';

interface EquipmentServiceRecordsProps {
  equipmentId: string;
  equipmentName: string;
  maintenanceDue?: string;
}

const SERVICE_TYPE_LABELS = {
  routine: 'Routine Maintenance',
  repair: 'Repair Work',
  inspection: 'Inspection',
  warranty: 'Warranty Service'
};

const SERVICE_TYPE_COLORS = {
  routine: 'bg-blue-100 text-blue-800',
  repair: 'bg-red-100 text-red-800',
  inspection: 'bg-green-100 text-green-800',
  warranty: 'bg-purple-100 text-purple-800'
};

export const EquipmentServiceRecords = ({ 
  equipmentId, 
  equipmentName, 
  maintenanceDue 
}: EquipmentServiceRecordsProps) => {
  const {
    serviceRecords,
    loading,
    createServiceRecord,
    deleteServiceRecord,
    getNextServiceDue,
    isServiceOverdue
  } = useEquipmentServiceRecords(equipmentId);

  const { uploadDocument, downloadDocument } = useDocuments();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    service_date: format(new Date(), 'yyyy-MM-dd'),
    service_type: 'routine' as const,
    notes: '',
    selectedFile: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);

  const nextServiceDue = getNextServiceDue(maintenanceDue);
  const isOverdue = isServiceOverdue(nextServiceDue);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF and images only)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF and image files are allowed');
        return;
      }
      
      setUploadFormData(prev => ({ ...prev, selectedFile: file }));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveServiceRecord = async () => {
    if (!uploadFormData.selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    try {
      // First upload the document
      const documentResult = await uploadDocument(
        uploadFormData.selectedFile,
        'maintenance',
        undefined, // No project restriction for equipment service records
        `Service Record - ${equipmentName} - ${format(new Date(uploadFormData.service_date), 'MMM dd, yyyy')}`
      );

      if (documentResult.data) {
        // Then create the service record linking to the uploaded document
        await createServiceRecord({
          equipment_id: equipmentId,
          document_id: documentResult.data.id,
          service_date: uploadFormData.service_date,
          service_type: uploadFormData.service_type,
          notes: uploadFormData.notes || undefined
        });

        // Reset form
        setShowUploadForm(false);
        setUploadFormData({
          service_date: format(new Date(), 'yyyy-MM-dd'),
          service_type: 'routine',
          notes: '',
          selectedFile: null
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Error saving service record:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (record: any) => {
    try {
      await downloadDocument(record.document);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (confirm('Are you sure you want to delete this service record?')) {
      try {
        await deleteServiceRecord(recordId);
      } catch (error) {
        console.error('Error deleting service record:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-24 bg-slate-200 rounded"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Service Status for {equipmentName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-slate-600">Next Service Due:</p>
              <div className="flex items-center gap-2">
                {nextServiceDue ? (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span className={isOverdue ? 'text-red-600 font-medium' : 'text-slate-900'}>
                      {format(new Date(nextServiceDue), 'MMM dd, yyyy')}
                    </span>
                    {isOverdue && (
                      <Badge variant="destructive" className="ml-2">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Overdue
                      </Badge>
                    )}
                  </>
                ) : (
                  <span className="text-slate-500">No service scheduled</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Total Records:</p>
              <p className="text-2xl font-bold text-slate-900">{serviceRecords.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload New Service Record */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Service Records</CardTitle>
            <Button 
              onClick={() => setShowUploadForm(!showUploadForm)}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service Record
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showUploadForm && (
            <div className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service_date">Service Date</Label>
                  <Input
                    id="service_date"
                    type="date"
                    value={uploadFormData.service_date}
                    onChange={(e) => setUploadFormData(prev => ({ 
                      ...prev, 
                      service_date: e.target.value 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service_type">Service Type</Label>
                  <Select 
                    value={uploadFormData.service_type}
                    onValueChange={(value) => setUploadFormData(prev => ({ 
                      ...prev, 
                      service_type: value as any 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine Maintenance</SelectItem>
                      <SelectItem value="repair">Repair Work</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="warranty">Warranty Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Service Notes</Label>
                <Textarea
                  id="notes"
                  value={uploadFormData.notes}
                  onChange={(e) => setUploadFormData(prev => ({ 
                    ...prev, 
                    notes: e.target.value 
                  }))}
                  placeholder="Optional notes about the service..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Upload Service Document</Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUploadClick}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </Button>
                  {uploadFormData.selectedFile && (
                    <span className="text-sm text-slate-600">
                      {uploadFormData.selectedFile.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Accepts PDF and image files only
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUploadForm(false);
                    setUploadFormData({
                      service_date: format(new Date(), 'yyyy-MM-dd'),
                      service_type: 'routine',
                      notes: '',
                      selectedFile: null
                    });
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveServiceRecord}
                  disabled={!uploadFormData.selectedFile || isUploading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isUploading ? 'Uploading...' : 'Save Service Record'}
                </Button>
              </div>
            </div>
          )}

          {/* Service Records Timeline */}
          {serviceRecords.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No service records</h3>
              <p className="text-slate-600 mb-4">Upload maintenance documents to track service history.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {serviceRecords.map((record, index) => (
                <div 
                  key={record.id} 
                  className="relative pl-8 pb-6 border-l-2 border-slate-200 last:border-l-0"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-[-5px] top-0 w-3 h-3 bg-orange-500 rounded-full"></div>
                  
                  <Card className="ml-2">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span className="font-medium">
                              {format(new Date(record.service_date), 'MMM dd, yyyy')}
                            </span>
                            <Badge 
                              className={SERVICE_TYPE_COLORS[record.service_type as keyof typeof SERVICE_TYPE_COLORS] || 'bg-slate-100 text-slate-800'}
                            >
                              {SERVICE_TYPE_LABELS[record.service_type as keyof typeof SERVICE_TYPE_LABELS] || record.service_type}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">
                            {record.document.name}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(record)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {record.notes && (
                        <div className="mt-3 p-3 bg-slate-50 rounded text-sm">
                          <strong>Notes:</strong> {record.notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.gif"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};