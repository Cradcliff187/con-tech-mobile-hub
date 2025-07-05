import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSafetyIncidentPhotos } from '@/hooks/useSafetyIncidents';
import { useDocuments } from '@/hooks/useDocuments';
import { SmartDocumentUpload } from '@/components/documents/SmartDocumentUpload';
import { Camera, Download, Edit, X, Plus, Image } from 'lucide-react';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

interface SafetyIncidentPhotosProps {
  safetyIncidentId: string;
  projectId: string;
  readOnly?: boolean;
}

export const SafetyIncidentPhotos = ({ 
  safetyIncidentId, 
  projectId, 
  readOnly = false 
}: SafetyIncidentPhotosProps) => {
  const { photos, loading, attachPhoto, detachPhoto, updatePhotoAltText } = useSafetyIncidentPhotos(safetyIncidentId);
  const { downloadDocument } = useDocuments();
  const [showUpload, setShowUpload] = useState(false);
  const [editingAltText, setEditingAltText] = useState<string | null>(null);
  const [altTextValue, setAltTextValue] = useState('');
  const isMobile = useIsMobile();

  const handleDownload = async (photo: any) => {
    try {
      if (photo.document) {
        await downloadDocument(photo.document);
      }
    } catch (error) {
      console.error('Error downloading photo:', error);
    }
  };

  const handleDetach = async (documentId: string) => {
    try {
      await detachPhoto(documentId);
    } catch (error) {
      console.error('Error removing photo:', error);
    }
  };

  // Listen for new documents uploaded with 'safety' category for this project
  useEffect(() => {
    if (!safetyIncidentId || !projectId) return;

    const handleNewSafetyDocument = async () => {
      // Check for recently uploaded safety documents that aren't attached to incidents yet
      const { data: recentDocs } = await supabase
        .from('documents')
        .select('id')
        .eq('project_id', projectId)
        .eq('category', 'safety')
        .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Last minute
        .not('id', 'in', `(${photos.map(p => `'${p.document_id}'`).join(',') || "''"})`)
        .limit(10 - photos.length);

      if (recentDocs && recentDocs.length > 0) {
        // Auto-attach recent safety photos to this incident
        for (const doc of recentDocs) {
          try {
            await attachPhoto(doc.id, 'Safety incident photo');
          } catch (error) {
            console.error('Error auto-attaching photo:', error);
          }
        }
      }
    };

    // Check for new documents every few seconds when upload dialog is open
    let interval: NodeJS.Timeout | null = null;
    if (showUpload) {
      interval = setInterval(handleNewSafetyDocument, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showUpload, safetyIncidentId, projectId, photos, attachPhoto]);

  const handleUploadComplete = () => {
    // Upload completed - close dialog and let the effect above handle attachment
    setShowUpload(false);
  };

  const handleEditAltText = (photo: any) => {
    setEditingAltText(photo.document_id);
    setAltTextValue(photo.alt_text || '');
  };

  const handleSaveAltText = async () => {
    if (editingAltText) {
      try {
        await updatePhotoAltText(editingAltText, altTextValue);
        setEditingAltText(null);
        setAltTextValue('');
      } catch (error) {
        console.error('Error updating alt text:', error);
      }
    }
  };

  const handleCancelAltText = () => {
    setEditingAltText(null);
    setAltTextValue('');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Incident Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-slate-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Incident Photos
            </CardTitle>
            {photos.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {photos.length}/10
              </Badge>
            )}
          </div>
          {!readOnly && photos.length < 10 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowUpload(!showUpload)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Photos
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showUpload && !readOnly && photos.length < 10 && (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 text-sm">
                <Camera className="w-4 h-4" />
                <span className="font-medium">Safety Documentation</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                Photos will be automatically categorized as safety documents and attached to this incident.
                {isMobile && " Use camera to capture photos directly from your device."}
              </p>
            </div>
            <SmartDocumentUpload
              projectId={projectId}
              variant="inline"
              preSelectedCategory="safety"
              onUploadComplete={handleUploadComplete}
              className="border-none p-0"
            />
          </div>
        )}

        {photos.length >= 10 && !readOnly && (
          <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
            Maximum of 10 photos allowed per incident.
          </div>
        )}

        {photos.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Image className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">No photos attached to this incident</p>
            {!readOnly && (
              <p className="text-sm mt-1">Click "Add Photos" to document the incident</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group border border-slate-200 rounded-lg overflow-hidden bg-slate-50 aspect-square"
                >
                  {photo.document?.file_type?.startsWith('image/') ? (
                    <img
                      src={photo.document.file_path}
                      alt={photo.alt_text || 'Safety incident photo'}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      loading="lazy"
                      onClick={() => window.open(photo.document.file_path, '_blank')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          window.open(photo.document.file_path, '_blank');
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownload(photo)}
                        className="bg-white/90 hover:bg-white text-slate-700"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      {!readOnly && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEditAltText(photo)}
                            className="bg-white/90 hover:bg-white text-slate-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDetach(photo.document_id)}
                            className="bg-red-50/90 hover:bg-red-50 text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Photo info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 text-xs">
                    <div className="truncate">
                      {photo.document?.name || 'Unknown'}
                    </div>
                    <div className="text-slate-300">
                      {format(new Date(photo.uploaded_at), 'MMM dd, HH:mm')}
                    </div>
                    {photo.alt_text && (
                      <div className="text-slate-300 mt-1 line-clamp-2">
                        {photo.alt_text}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Alt text editing modal/inline */}
            {editingAltText && (
              <div className="border rounded-lg p-4 bg-slate-50">
                <div className="space-y-3">
                  <Label htmlFor="alt-text">Photo Description (for accessibility)</Label>
                  <Input
                    id="alt-text"
                    value={altTextValue}
                    onChange={(e) => setAltTextValue(e.target.value)}
                    placeholder="Describe what's visible in this photo..."
                    maxLength={200}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCancelAltText}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSaveAltText}
                    >
                      Save Description
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};