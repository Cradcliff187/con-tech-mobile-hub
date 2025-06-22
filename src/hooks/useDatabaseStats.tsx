
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
        // Use individual queries for each table to avoid dynamic table name issues
        const tableQueries = [
          { name: 'projects', query: supabase.from('projects').select('*', { count: 'exact', head: true }) },
          { name: 'tasks', query: supabase.from('tasks').select('*', { count: 'exact', head: true }) },
          { name: 'stakeholders', query: supabase.from('stakeholders').select('*', { count: 'exact', head: true }) },
          { name: 'profiles', query: supabase.from('profiles').select('*', { count: 'exact', head: true }) },
          { name: 'documents', query: supabase.from('documents').select('*', { count: 'exact', head: true }) },
          { name: 'activity_log', query: supabase.from('activity_log').select('*', { count: 'exact', head: true }) },
          { name: 'messages', query: supabase.from('messages').select('*', { count: 'exact', head: true }) },
          { name: 'equipment', query: supabase.from('equipment').select('*', { count: 'exact', head: true }) }
        ];

        const tableStats = await Promise.all(
          tableQueries.map(async ({ name, query }) => {
            const { count } = await query;
            return {
              name,
              rowCount: count || 0,
              size: `${Math.round((count || 0) * 0.5)} KB`
            };
          })
        );

        const totalRows = tableStats.reduce((sum, table) => sum + table.rowCount, 0);
        const estimatedSizeMB = Math.round(totalRows * 0.0005 * 100) / 100;

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
