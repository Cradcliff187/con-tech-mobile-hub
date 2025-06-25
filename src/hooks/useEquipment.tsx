
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useImprovedEquipmentSubscription } from '@/hooks/equipment/useImprovedEquipmentSubscription';

export interface Equipment {
  id: string;
  name: string;
  type?: string; // Make type optional to match database schema
  status: string;
  project_id?: string;
  operator_id?: string;
  assigned_operator_id?: string;
  maintenance_due?: string;
  utilization_rate: number;
  created_at: string;
  updated_at: string;
  project?: { id: string; name: string };
  operator?: { id: string; full_name?: string };
  assigned_operator?: { id: string; contact_person?: string; company_name?: string };
}

export const useEquipment = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Use improved real-time subscription
  useImprovedEquipmentSubscription({
    user,
    onEquipmentUpdate: (updatedEquipment) => {
      setEquipment(updatedEquipment);
      setLoading(false);
    }
  });

  // Manual refetch function for compatibility
  const refetch = async () => {
    // Real-time subscription handles automatic updates, but this is kept for compatibility
    console.log('Manual refetch called - real-time subscription should handle updates automatically');
  };

  return { 
    equipment, 
    loading, 
    refetch
  };
};
