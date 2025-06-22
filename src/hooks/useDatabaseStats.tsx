
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseStats {
  tables: Array<{
    name: string;
    rowCount: number;
    size: string;
  }>;
  totalTables: number;
  totalRows: number;
  databaseSize: string;
}

export const useDatabaseStats = () => {
  const [stats, setStats] = useState<DatabaseStats>({
    tables: [],
    totalTables: 0,
    totalRows: 0,
    databaseSize: '0 MB'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatabaseStats = async () => {
      try {
        // Get counts for major tables
        const tableNames = [
          'projects', 'tasks', 'stakeholders', 'profiles', 
          'documents', 'activity_log', 'messages', 'equipment'
        ];

        const tableStats = await Promise.all(
          tableNames.map(async (tableName) => {
            const { count } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true });
            
            return {
              name: tableName,
              rowCount: count || 0,
              size: `${Math.round((count || 0) * 0.5)} KB` // Estimated size
            };
          })
        );

        const totalRows = tableStats.reduce((sum, table) => sum + table.rowCount, 0);
        const estimatedSizeMB = Math.round(totalRows * 0.0005 * 100) / 100; // Rough estimate

        setStats({
          tables: tableStats,
          totalTables: tableStats.length,
          totalRows,
          databaseSize: `${estimatedSizeMB} MB`
        });
      } catch (error) {
        console.error('Error fetching database stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDatabaseStats();
  }, []);

  return { stats, loading };
};
