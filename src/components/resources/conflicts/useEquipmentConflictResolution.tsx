
import { supabase } from '@/integrations/supabase/client';
import { useEquipment } from '@/hooks/useEquipment';

export const useEquipmentConflictResolution = () => {
  const { equipment } = useEquipment();

  const resolveConflict = async (
    selectedOption: string,
    resolutionData: any,
    conflict: any
  ) => {
    const equipmentName = conflict.title.split(' ')[0];
    const conflictedEquipment = equipment.find(eq => eq.name === equipmentName);

    switch (selectedOption) {
      case 'reschedule':
        console.log('Rescheduling equipment from', resolutionData.newStartDate, 'to', resolutionData.newEndDate);
        break;

      case 'alternative':
        if (!resolutionData.alternativeEquipmentId || !conflictedEquipment) {
          throw new Error('Alternative equipment not selected');
        }

        const { error: altError } = await supabase
          .from('equipment')
          .update({
            project_id: conflictedEquipment.project_id,
            status: 'in-use'
          })
          .eq('id', resolutionData.alternativeEquipmentId);

        if (altError) throw altError;

        const { error: freeError } = await supabase
          .from('equipment')
          .update({
            project_id: null,
            status: 'available'
          })
          .eq('id', conflictedEquipment.id);

        if (freeError) throw freeError;
        break;

      case 'reassign':
        if (!resolutionData.targetProjectId || !conflictedEquipment) {
          throw new Error('Target project not selected');
        }

        const { error: reassignError } = await supabase
          .from('equipment')
          .update({
            project_id: resolutionData.targetProjectId
          })
          .eq('id', conflictedEquipment.id);

        if (reassignError) throw reassignError;
        break;

      default:
        throw new Error('Invalid resolution option');
    }
  };

  return { resolveConflict };
};
