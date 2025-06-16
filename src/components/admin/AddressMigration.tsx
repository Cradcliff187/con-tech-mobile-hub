
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { parseAddress, validateParsedAddress } from '@/utils/addressMigration';
import { AlertCircle, CheckCircle, Clock, Play, Download } from 'lucide-react';

interface MigrationStats {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  needsReview: number;
}

interface MigrationItem {
  id: string;
  type: 'stakeholder' | 'project';
  original_address: string;
  parsed_street?: string;
  parsed_city?: string;
  parsed_state?: string;
  parsed_zip?: string;
  confidence: string;
  notes?: string;
  status: 'pending' | 'processed' | 'failed' | 'needs_review';
}

export const AddressMigration = () => {
  const [stats, setStats] = useState<MigrationStats>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    needsReview: 0
  });
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [migrationItems, setMigrationItems] = useState<MigrationItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const fetchMigrationCandidates = async () => {
    try {
      // Fetch stakeholders with legacy address data
      const { data: stakeholders, error: stakeholderError } = await supabase
        .from('stakeholders')
        .select('id, address, street_address, city, state, zip_code')
        .not('address', 'is', null)
        .neq('address', '');

      if (stakeholderError) throw stakeholderError;

      // Fetch projects with legacy location data
      const { data: projects, error: projectError } = await supabase
        .from('projects')
        .select('id, location, street_address, city, state, zip_code')
        .not('location', 'is', null)
        .neq('location', '');

      if (projectError) throw projectError;

      const candidates: MigrationItem[] = [];

      // Process stakeholders
      stakeholders?.forEach(stakeholder => {
        if (stakeholder.address && (!stakeholder.street_address && !stakeholder.city)) {
          candidates.push({
            id: stakeholder.id,
            type: 'stakeholder',
            original_address: stakeholder.address,
            status: 'pending',
            confidence: 'unknown'
          });
        }
      });

      // Process projects
      projects?.forEach(project => {
        if (project.location && (!project.street_address && !project.city)) {
          candidates.push({
            id: project.id,
            type: 'project',
            original_address: project.location,
            status: 'pending',
            confidence: 'unknown'
          });
        }
      });

      setMigrationItems(candidates);
      setStats(prev => ({ ...prev, total: candidates.length }));

      toast({
        title: "Migration Analysis Complete",
        description: `Found ${candidates.length} records that need migration`
      });

    } catch (error) {
      console.error('Error fetching migration candidates:', error);
      toast({
        title: "Error",
        description: "Failed to analyze migration candidates",
        variant: "destructive"
      });
    }
  };

  const runMigration = async () => {
    if (migrationItems.length === 0) {
      toast({
        title: "No Data",
        description: "No migration candidates found. Run analysis first.",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setProgress(0);
    
    const batchSize = 10;
    let processed = 0;
    let successful = 0;
    let failed = 0;
    let needsReview = 0;

    try {
      for (let i = 0; i < migrationItems.length; i += batchSize) {
        const batch = migrationItems.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (item) => {
          try {
            const parsed = parseAddress(item.original_address);
            const isValid = validateParsedAddress(parsed);
            
            const updateData = {
              street_address: parsed.street_address,
              city: parsed.city,
              state: parsed.state,
              zip_code: parsed.zip_code
            };

            let updateResult;
            
            if (item.type === 'stakeholder') {
              updateResult = await supabase
                .from('stakeholders')
                .update(updateData)
                .eq('id', item.id);
            } else {
              updateResult = await supabase
                .from('projects')
                .update(updateData)
                .eq('id', item.id);
            }

            if (updateResult.error) throw updateResult.error;

            // Update local item
            item.parsed_street = parsed.street_address;
            item.parsed_city = parsed.city;
            item.parsed_state = parsed.state;
            item.parsed_zip = parsed.zip_code;
            item.confidence = parsed.parsing_confidence;
            item.notes = parsed.parsing_notes;

            if (isValid && parsed.parsing_confidence === 'high') {
              item.status = 'processed';
              successful++;
            } else if (isValid && parsed.parsing_confidence === 'medium') {
              item.status = 'processed';
              successful++;
              needsReview++;
            } else {
              item.status = 'needs_review';
              needsReview++;
            }

          } catch (error) {
            console.error(`Error migrating ${item.type} ${item.id}:`, error);
            item.status = 'failed';
            item.notes = `Migration failed: ${error}`;
            failed++;
          }
          
          processed++;
        }));

        setProgress((processed / migrationItems.length) * 100);
        setStats(prev => ({
          ...prev,
          processed,
          successful,
          failed,
          needsReview
        }));
      }

      setShowResults(true);
      toast({
        title: "Migration Complete",
        description: `Processed ${processed} records. ${successful} successful, ${failed} failed, ${needsReview} need review.`
      });

    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: "Migration Error",
        description: "An error occurred during migration",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const exportResults = () => {
    const csv = [
      'Type,ID,Original Address,Street,City,State,ZIP,Confidence,Status,Notes',
      ...migrationItems.map(item => 
        `${item.type},${item.id},"${item.original_address}","${item.parsed_street || ''}","${item.parsed_city || ''}","${item.parsed_state || ''}","${item.parsed_zip || ''}",${item.confidence},${item.status},"${item.notes || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `address-migration-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchMigrationCandidates();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Address Migration Tool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
              <div className="text-sm text-slate-600">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.processed}</div>
              <div className="text-sm text-slate-600">Processed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
              <div className="text-sm text-slate-600">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.needsReview}</div>
              <div className="text-sm text-slate-600">Need Review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-slate-600">Failed</div>
            </div>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 animate-spin" />
                <span className="text-sm">Migration in progress...</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={fetchMigrationCandidates}
              disabled={isRunning}
              variant="outline"
            >
              Refresh Analysis
            </Button>
            <Button 
              onClick={runMigration}
              disabled={isRunning || stats.total === 0}
            >
              <Play className="h-4 w-4 mr-2" />
              Run Migration
            </Button>
            {showResults && (
              <Button 
                onClick={exportResults}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showResults && (
        <Card>
          <CardHeader>
            <CardTitle>Migration Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {migrationItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{item.type}</Badge>
                      <Badge variant={
                        item.status === 'processed' ? 'default' :
                        item.status === 'needs_review' ? 'secondary' :
                        item.status === 'failed' ? 'destructive' : 'outline'
                      }>
                        {item.status}
                      </Badge>
                      <Badge variant="outline">{item.confidence}</Badge>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">Original: {item.original_address}</div>
                      <div className="text-slate-600">
                        Parsed: {item.parsed_street}, {item.parsed_city}, {item.parsed_state} {item.parsed_zip}
                      </div>
                      {item.notes && (
                        <div className="text-xs text-slate-500 mt-1">{item.notes}</div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    {item.status === 'processed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {item.status === 'needs_review' && <AlertCircle className="h-5 w-5 text-yellow-600" />}
                    {item.status === 'failed' && <AlertCircle className="h-5 w-5 text-red-600" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
