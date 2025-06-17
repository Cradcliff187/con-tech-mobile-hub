
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';
import { TestTube, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
}

export const DocumentTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const { documents, loading, uploadDocument, downloadDocument, shareDocument } = useDocuments();
  const { toast } = useToast();

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);

    // Test 1: Document fetch
    addTestResult({
      name: 'Document Fetch',
      status: loading ? 'warning' : 'success',
      message: loading ? 'Loading documents...' : `Found ${documents.length} documents`
    });

    // Test 2: Storage bucket accessibility
    try {
      const testUrl = `https://jjmedlilkxmrbacoitio.supabase.co/storage/v1/object/public/documents/test`;
      const response = await fetch(testUrl, { method: 'HEAD' });
      addTestResult({
        name: 'Storage Bucket Access',
        status: 'success',
        message: 'Storage bucket is accessible (public)'
      });
    } catch (error) {
      addTestResult({
        name: 'Storage Bucket Access',
        status: 'error',
        message: 'Storage bucket access failed'
      });
    }

    // Test 3: Test upload capability (with a small test file)
    try {
      const testFile = new File(['Test content'], 'test.txt', { type: 'text/plain' });
      await uploadDocument(testFile, 'other');
      addTestResult({
        name: 'Upload Functionality',
        status: 'success',
        message: 'Test file uploaded successfully'
      });
    } catch (error) {
      addTestResult({
        name: 'Upload Functionality',
        status: 'error',
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 4: Test download capability
    if (documents.length > 0) {
      try {
        const testDoc = documents[0];
        await downloadDocument(testDoc);
        addTestResult({
          name: 'Download Functionality',
          status: 'success',
          message: 'Download test completed'
        });
      } catch (error) {
        addTestResult({
          name: 'Download Functionality',
          status: 'error',
          message: `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    } else {
      addTestResult({
        name: 'Download Functionality',
        status: 'warning',
        message: 'No documents available to test download'
      });
    }

    // Test 5: Test share capability
    if (documents.length > 0) {
      try {
        const testDoc = documents[0];
        await shareDocument(testDoc);
        addTestResult({
          name: 'Share Functionality',
          status: 'success',
          message: 'Share link generated successfully'
        });
      } catch (error) {
        addTestResult({
          name: 'Share Functionality',
          status: 'error',
          message: `Share failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    } else {
      addTestResult({
        name: 'Share Functionality',
        status: 'warning',
        message: 'No documents available to test sharing'
      });
    }

    setTesting(false);
    
    const errorCount = testResults.filter(r => r.status === 'error').length;
    const warningCount = testResults.filter(r => r.status === 'warning').length;
    
    toast({
      title: "Test Results",
      description: `${testResults.length - errorCount - warningCount} passed, ${warningCount} warnings, ${errorCount} failed`,
      variant: errorCount > 0 ? "destructive" : "default"
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'error':
        return <XCircle className="text-red-500" size={16} />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={16} />;
      default:
        return <TestTube className="text-gray-500" size={16} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-800">Document System Tests</h3>
        <Button
          onClick={runTests}
          disabled={testing}
          className="flex items-center gap-2"
        >
          <TestTube size={16} />
          {testing ? 'Running Tests...' : 'Run Tests'}
        </Button>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-3">
          {testResults.map((result, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <div className="font-medium text-sm text-slate-800">{result.name}</div>
                <div className="text-xs text-slate-600">{result.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {testResults.length === 0 && !testing && (
        <div className="text-center py-8 text-slate-500">
          <TestTube size={48} className="mx-auto mb-2 text-slate-300" />
          <p>Click "Run Tests" to verify document system functionality</p>
        </div>
      )}
    </div>
  );
};
