import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { SafetyIncident, CreateSafetyIncidentData, UpdateSafetyIncidentData, SafetyIncidentPhoto } from '@/types/safetyIncident';

export const useSafetyIncidents = (projectId?: string) => {
  const [safetyIncidents, setSafetyIncidents] = useState<SafetyIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSafetyIncidents = useCallback(async () => {
    if (!user) {
      setSafetyIncidents([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('safety_incidents')
        .select(`
          *,
          project:projects(name),
          reporter:profiles!reported_by(full_name, email)
        `)
        .order('incident_date', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching safety incidents:', error);
        toast({
          title: "Error",
          description: "Failed to fetch safety incidents",
          variant: "destructive"
        });
        return;
      }

      setSafetyIncidents(data as SafetyIncident[] || []);
    } catch (error) {
      console.error('Error in fetchSafetyIncidents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch safety incidents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, projectId, toast]);

  // Handle real-time updates
  const handleSafetyIncidentsUpdate = useCallback((payload: any) => {
    console.log('Safety incidents change detected:', payload);
    fetchSafetyIncidents();
  }, [fetchSafetyIncidents]);

  const { isSubscribed } = useSubscription(
    'safety_incidents',
    handleSafetyIncidentsUpdate,
    {
      userId: user?.id,
      enabled: !!user
    }
  );

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchSafetyIncidents();
    } else {
      setSafetyIncidents([]);
      setLoading(false);
    }
  }, [user?.id, fetchSafetyIncidents]);

  const createSafetyIncident = useCallback(async (data: CreateSafetyIncidentData): Promise<SafetyIncident | null> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data: incident, error } = await supabase
        .from('safety_incidents')
        .insert({
          ...data,
          reported_by: user.id
        })
        .select(`
          *,
          project:projects(name),
          reporter:profiles!reported_by(full_name, email)
        `)
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Safety incident created successfully"
      });

      return incident as SafetyIncident;
    } catch (error: any) {
      console.error('Error creating safety incident:', error);
      toast({
        title: "Error",
        description: `Failed to create safety incident: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
  }, [user, toast]);

  const updateSafetyIncident = useCallback(async (id: string, data: UpdateSafetyIncidentData): Promise<SafetyIncident | null> => {
    try {
      const { data: incident, error } = await supabase
        .from('safety_incidents')
        .update(data)
        .eq('id', id)
        .select(`
          *,
          project:projects(name),
          reporter:profiles!reported_by(full_name, email)
        `)
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Safety incident updated successfully"
      });

      return incident as SafetyIncident;
    } catch (error: any) {
      console.error('Error updating safety incident:', error);
      toast({
        title: "Error",
        description: `Failed to update safety incident: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  const deleteSafetyIncident = useCallback(async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('safety_incidents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Safety incident deleted successfully"
      });
    } catch (error: any) {
      console.error('Error deleting safety incident:', error);
      toast({
        title: "Error",
        description: `Failed to delete safety incident: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  return {
    safetyIncidents,
    loading,
    createSafetyIncident,
    updateSafetyIncident,
    deleteSafetyIncident,
    refetch: fetchSafetyIncidents
  };
};

export const useSafetyIncidentPhotos = (safetyIncidentId?: string) => {
  const [photos, setPhotos] = useState<SafetyIncidentPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSafetyIncidentPhotos = useCallback(async () => {
    if (!user || !safetyIncidentId) {
      setPhotos([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('safety_incident_photos')
        .select(`
          *,
          document:documents(*)
        `)
        .eq('safety_incident_id', safetyIncidentId)
        .order('display_order', { ascending: true });

      if (error) throw error;

      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching safety incident photos:', error);
      toast({
        title: "Error",
        description: "Failed to fetch safety incident photos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, safetyIncidentId, toast]);

  useEffect(() => {
    fetchSafetyIncidentPhotos();
  }, [fetchSafetyIncidentPhotos]);

  const attachPhoto = useCallback(async (documentId: string, altText?: string): Promise<void> => {
    if (!safetyIncidentId) throw new Error('Safety incident ID is required');

    try {
      // Get the next display order
      const { data: existingPhotos } = await supabase
        .from('safety_incident_photos')
        .select('display_order')
        .eq('safety_incident_id', safetyIncidentId)
        .order('display_order', { ascending: false })
        .limit(1);

      const nextOrder = existingPhotos && existingPhotos.length > 0 
        ? existingPhotos[0].display_order + 1 
        : 0;

      const { error } = await supabase
        .from('safety_incident_photos')
        .insert({
          safety_incident_id: safetyIncidentId,
          document_id: documentId,
          alt_text: altText,
          display_order: nextOrder
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Photo attached to safety incident"
      });

      fetchSafetyIncidentPhotos();
    } catch (error: any) {
      console.error('Error attaching photo:', error);
      toast({
        title: "Error",
        description: `Failed to attach photo: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
  }, [safetyIncidentId, fetchSafetyIncidentPhotos, toast]);

  const detachPhoto = useCallback(async (documentId: string): Promise<void> => {
    if (!safetyIncidentId) throw new Error('Safety incident ID is required');

    try {
      const { error } = await supabase
        .from('safety_incident_photos')
        .delete()
        .eq('safety_incident_id', safetyIncidentId)
        .eq('document_id', documentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Photo removed from safety incident"
      });

      fetchSafetyIncidentPhotos();
    } catch (error: any) {
      console.error('Error detaching photo:', error);
      toast({
        title: "Error",
        description: `Failed to remove photo: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
  }, [safetyIncidentId, fetchSafetyIncidentPhotos, toast]);

  const updatePhotoAltText = useCallback(async (documentId: string, altText: string): Promise<void> => {
    if (!safetyIncidentId) throw new Error('Safety incident ID is required');

    try {
      const { error } = await supabase
        .from('safety_incident_photos')
        .update({ alt_text: altText })
        .eq('safety_incident_id', safetyIncidentId)
        .eq('document_id', documentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Photo description updated"
      });

      fetchSafetyIncidentPhotos();
    } catch (error: any) {
      console.error('Error updating photo alt text:', error);
      toast({
        title: "Error",
        description: `Failed to update photo description: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
  }, [safetyIncidentId, fetchSafetyIncidentPhotos, toast]);

  return {
    photos,
    loading,
    attachPhoto,
    detachPhoto,
    updatePhotoAltText,
    refetch: fetchSafetyIncidentPhotos
  };
};