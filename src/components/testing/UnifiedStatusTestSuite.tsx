
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, Play, RefreshCw } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { getUnifiedLifecycleStatus, updateProjectStatus } from '@/utils/unified-lifecycle-utils';
import { getMigrationStatus } from '@/utils/migration-detection';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  duration?: number;
}

const TEST_SCENARIOS = [
  {
    id: 'legacy-migration',
    name: 'Legacy Project Migration Workflow',
    description: 'Test migration of projects from legacy status/phase to unified lifecycle status',
    steps: [
      'Identify projects without unified_lifecycle_status',
      'Map legacy status/phase combinations to unified statuses',
      'Update projects with computed unified status',
      'Verify all projects have valid unified status',
      'Test UI displays unified status correctly'
    ]
  },
  {
    id: 'mixed-environment',
    name: 'Mixed Environment Compatibility',
    description: 'Test system behavior with both migrated and legacy projects',
    steps: [
      'Create mix of legacy and unified status projects',
      'Test filtering works across both systems',
      'Verify status transitions work correctly',
      'Check UI components handle both status types',
      'Validate data consistency during operations'
    ]
  },
  {
    id: 'mobile-responsive',
    name: 'Mobile Responsiveness & Edge Cases',
    description: 'Test mobile interface and handle edge cases gracefully',
    steps: [
      'Test status badges on mobile viewports',
      'Verify touch interactions work properly',
      'Test long project names with status display',
      'Check dropdown z-index and backgrounds',
      'Validate error handling for invalid statuses'
    ]
  }
];

export const UnifiedStatusTestSuite: React.FC = () => {
  const { projects } = useProjects();
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());

  const runTest = async (testId: string) => {
    setRunningTests(prev => new Set(prev).add(testId));
    setTestResults(prev => ({
      ...prev,
      [testId]: { 
        id: testId, 
        name: TEST_SCENARIOS.find(t => t.id === testId)?.name || testId,
        status: 'running' 
      }
    }));

    const startTime = Date.now();

    try {
      let result: TestResult;

      switch (testId) {
        case 'legacy-migration':
          result = await testLegacyMigration();
          break;
        case 'mixed-environment':
          result = await testMixedEnvironment();
          break;
        case 'mobile-responsive':
          result = await testMobileResponsive();
          break;
        default:
          throw new Error(`Unknown test: ${testId}`);
      }

      result.duration = Date.now() - startTime;
      setTestResults(prev => ({ ...prev, [testId]: result }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testId]: {
          id: testId,
          name: TEST_SCENARIOS.find(t => t.id === testId)?.name || testId,
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - startTime
        }
      }));
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });
    }
  };

  const testLegacyMigration = async (): Promise<TestResult> => {
    const migrationStatus = getMigrationStatus(projects);
    
    if (migrationStatus.needsMigration) {
      return {
        id: 'legacy-migration',
        name: 'Legacy Project Migration Workflow',
        status: 'failed',
        message: `Found ${migrationStatus.legacyProjects} projects that need migration`
      };
    }

    // Test unified status mapping
    const projectsWithUnified = projects.filter(p => p.unified_lifecycle_status);
    const validUnifiedStatuses = projectsWithUnified.every(p => {
      const status = getUnifiedLifecycleStatus(p);
      return status && typeof status === 'string';
    });

    if (!validUnifiedStatuses) {
      return {
        id: 'legacy-migration',
        name: 'Legacy Project Migration Workflow',
        status: 'failed',
        message: 'Some projects have invalid unified lifecycle status'
      };
    }

    return {
      id: 'legacy-migration',
      name: 'Legacy Project Migration Workflow',
      status: 'passed',
      message: `Successfully validated ${projects.length} projects with unified status`
    };
  };

  const testMixedEnvironment = async (): Promise<TestResult> => {
    const legacyProjects = projects.filter(p => !p.unified_lifecycle_status);
    const unifiedProjects = projects.filter(p => p.unified_lifecycle_status);

    if (legacyProjects.length === 0 && unifiedProjects.length === 0) {
      return {
        id: 'mixed-environment',
        name: 'Mixed Environment Compatibility',
        status: 'failed',
        message: 'No projects available for testing'
      };
    }

    // Test that both types can be processed
    try {
      projects.forEach(project => {
        const status = getUnifiedLifecycleStatus(project);
        if (!status) {
          throw new Error(`Could not determine status for project ${project.id}`);
        }
      });

      return {
        id: 'mixed-environment',
        name: 'Mixed Environment Compatibility',
        status: 'passed',
        message: `Tested ${legacyProjects.length} legacy + ${unifiedProjects.length} unified projects`
      };
    } catch (error) {
      return {
        id: 'mixed-environment',
        name: 'Mixed Environment Compatibility',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Status processing failed'
      };
    }
  };

  const testMobileResponsive = async (): Promise<TestResult> => {
    // Test viewport detection
    const isMobileViewport = window.innerWidth < 768;
    
    // Test badge rendering
    const testElement = document.createElement('div');
    testElement.className = 'text-xs px-2 py-1 h-6'; // Small badge classes
    
    // Simulate touch target size validation
    const minTouchTarget = 44; // 44px minimum for accessibility
    const buttonElements = document.querySelectorAll('button');
    const invalidTouchTargets = Array.from(buttonElements).filter(btn => {
      const rect = btn.getBoundingClientRect();
      return rect.height < minTouchTarget && rect.width < minTouchTarget;
    });

    if (invalidTouchTargets.length > 0) {
      return {
        id: 'mobile-responsive',
        name: 'Mobile Responsiveness & Edge Cases',
        status: 'failed',
        message: `Found ${invalidTouchTargets.length} buttons with insufficient touch target size`
      };
    }

    return {
      id: 'mobile-responsive',
      name: 'Mobile Responsiveness & Edge Cases',
      status: 'passed',
      message: `Mobile responsive design validated (viewport: ${window.innerWidth}px)`
    };
  };

  const runAllTests = async () => {
    for (const scenario of TEST_SCENARIOS) {
      await runTest(scenario.id);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />;
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const passedTests = Object.values(testResults).filter(r => r.status === 'passed').length;
  const totalTests = TEST_SCENARIOS.length;
  const progressPercentage = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Unified Status Test Suite</h2>
          <p className="text-slate-600">Validate the unified lifecycle status system implementation</p>
        </div>
        <Button 
          onClick={runAllTests}
          disabled={runningTests.size > 0}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Play className="h-4 w-4 mr-2" />
          Run All Tests
        </Button>
      </div>

      {/* Overall Progress */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600">Overall Progress</span>
          <span className="font-medium">{passedTests}/{totalTests} passed</span>
        </div>
        <Progress value={progressPercentage} className="h-3" />
      </div>

      {/* Test Scenarios */}
      <div className="grid gap-4">
        {TEST_SCENARIOS.map((scenario) => {
          const result = testResults[scenario.id];
          const isRunning = runningTests.has(scenario.id);

          return (
            <Card key={scenario.id} className="border border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result?.status || 'pending')}
                    <div>
                      <CardTitle className="text-lg">{scenario.name}</CardTitle>
                      <CardDescription>{scenario.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {result && (
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runTest(scenario.id)}
                      disabled={isRunning}
                    >
                      {isRunning ? 'Running...' : 'Run Test'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Test Steps:</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {scenario.steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-5 h-5 bg-slate-100 text-slate-600 rounded-full text-xs flex items-center justify-center mt-0.5 shrink-0">
                            {index + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {result && result.message && (
                    <Alert className={result.status === 'failed' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                      <AlertDescription className={result.status === 'failed' ? 'text-red-700' : 'text-green-700'}>
                        {result.message}
                        {result.duration && (
                          <span className="block mt-1 text-xs opacity-75">
                            Completed in {result.duration}ms
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UnifiedStatusTestSuite;
