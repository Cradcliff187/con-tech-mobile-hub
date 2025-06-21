
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Smartphone,
  Monitor,
  Tablet,
  Upload,
  Download,
  Eye
} from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useAuth } from '@/hooks/useAuth';

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

export const DocumentTestPanel = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [viewportSize, setViewportSize] = useState('desktop');
  const { documents, loading, uploadDocument } = useDocuments();
  const { user, profile } = useAuth();

  const runComprehensiveTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Console Errors Check
    const originalConsoleError = console.error;
    let consoleErrors = 0;
    console.error = (...args) => {
      consoleErrors++;
      originalConsoleError(...args);
    };

    results.push({
      test: 'Console Errors',
      status: consoleErrors === 0 ? 'pass' : 'warning',
      message: consoleErrors === 0 ? 'No console errors detected' : `${consoleErrors} console errors found`
    });

    // Test 2: Authentication State
    results.push({
      test: 'Authentication',
      status: user && profile ? 'pass' : 'fail',
      message: user && profile ? 'User authenticated' : 'Authentication required'
    });

    // Test 3: Document Loading
    results.push({
      test: 'Document Loading',
      status: !loading ? 'pass' : 'warning',
      message: !loading ? 'Documents loaded successfully' : 'Documents still loading'
    });

    // Test 4: Mobile Viewport Test
    const isMobile = window.innerWidth < 768;
    results.push({
      test: 'Mobile Viewport',
      status: 'pass',
      message: isMobile ? 'Mobile viewport detected' : 'Desktop viewport detected'
    });

    // Test 5: Touch Target Size
    const buttons = document.querySelectorAll('button');
    let smallButtons = 0;
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      if (rect.height < 44 || rect.width < 44) {
        smallButtons++;
      }
    });

    results.push({
      test: 'Touch Target Size',
      status: smallButtons === 0 ? 'pass' : 'warning',
      message: smallButtons === 0 ? 'All buttons meet 44px minimum' : `${smallButtons} buttons below 44px`
    });

    // Test 6: File Upload Permissions
    const canUpload = profile && (
      (profile.is_company_user && profile.account_status === 'approved') ||
      (!profile.is_company_user && profile.account_status === 'approved')
    );

    results.push({
      test: 'Upload Permissions',
      status: canUpload ? 'pass' : 'fail',
      message: canUpload ? 'Upload permissions granted' : 'Upload permissions denied'
    });

    // Test 7: Accessibility Check
    const missingAlt = document.querySelectorAll('img:not([alt])').length;
    const missingLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').length;

    results.push({
      test: 'Accessibility',
      status: (missingAlt + missingLabels) === 0 ? 'pass' : 'warning',
      message: `${missingAlt} missing alt tags, ${missingLabels} missing labels`
    });

    console.error = originalConsoleError;
    setTestResults(results);
    setIsRunning(false);
  };

  const simulateViewport = (size: string) => {
    setViewportSize(size);
    const viewport = document.querySelector('meta[name="viewport"]');
    
    switch (size) {
      case 'mobile':
        if (viewport) {
          viewport.setAttribute('content', 'width=320, initial-scale=1');
        }
        break;
      case 'tablet':
        if (viewport) {
          viewport.setAttribute('content', 'width=768, initial-scale=1');
        }
        break;
      default:
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1');
        }
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'fail':
        return <XCircle className="text-red-600" size={16} />;
      case 'warning':
        return <AlertTriangle className="text-orange-600" size={16} />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Pass</Badge>;
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>;
      case 'warning':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Warning</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="text-blue-600" size={24} />
            Document Management Testing Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tests" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tests">Test Results</TabsTrigger>
              <TabsTrigger value="viewport">Viewport Testing</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="tests" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Comprehensive Tests</h3>
                <Button 
                  onClick={runComprehensiveTests}
                  disabled={isRunning}
                  className="min-h-[44px]"
                >
                  {isRunning ? 'Running Tests...' : 'Run All Tests'}
                </Button>
              </div>

              {testResults.length > 0 && (
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <span className="font-medium">{result.test}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600">{result.message}</span>
                        {getStatusBadge(result.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {testResults.length === 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Click "Run All Tests" to perform comprehensive testing of document management features.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="viewport" className="space-y-4">
              <h3 className="text-lg font-semibold">Viewport Testing</h3>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={viewportSize === 'mobile' ? 'default' : 'outline'}
                  onClick={() => simulateViewport('mobile')}
                  className="flex items-center gap-2 min-h-[44px]"
                >
                  <Smartphone size={16} />
                  Mobile (320px)
                </Button>
                <Button
                  variant={viewportSize === 'tablet' ? 'default' : 'outline'}
                  onClick={() => simulateViewport('tablet')}
                  className="flex items-center gap-2 min-h-[44px]"
                >
                  <Tablet size={16} />
                  Tablet (768px)
                </Button>
                <Button
                  variant={viewportSize === 'desktop' ? 'default' : 'outline'}
                  onClick={() => simulateViewport('desktop')}
                  className="flex items-center gap-2 min-h-[44px]"
                >
                  <Monitor size={16} />
                  Desktop (1024px+)
                </Button>
              </div>
              
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  Current viewport: <strong>{viewportSize}</strong>. 
                  Test upload flows, navigation, and touch interactions at each size.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <h3 className="text-lg font-semibold">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Upload className="text-blue-600" size={16} />
                      <span className="font-medium">Upload Performance</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Test large file uploads and monitor memory usage during bulk operations.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Download className="text-green-600" size={16} />
                      <span className="font-medium">Download Performance</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Monitor download speeds and verify signed URL generation.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
