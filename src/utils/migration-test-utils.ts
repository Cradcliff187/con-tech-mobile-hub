
import { Project } from '@/types/database';
import { LifecycleStatus } from '@/types/database';

/**
 * Development utilities for testing lifecycle status migration
 * These utilities help create test scenarios and validate migration behavior
 */

export interface TestProject extends Omit<Project, 'id' | 'created_at' | 'updated_at'> {
  id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create test projects with different migration scenarios
 */
export const createTestProjects = (): TestProject[] => {
  const baseDate = new Date('2024-01-01').toISOString();
  
  return [
    // Legacy project - planning status
    {
      id: 'test-1',
      name: 'Legacy Planning Project',
      status: 'planning' as const,
      phase: 'planning' as const,
      lifecycle_status: undefined, // No lifecycle status - needs migration
      progress: 15,
      created_at: baseDate,
      updated_at: baseDate
    },
    
    // Legacy project - active construction
    {
      id: 'test-2',
      name: 'Legacy Active Project',
      status: 'active' as const,
      phase: 'active' as const,
      lifecycle_status: undefined, // No lifecycle status - needs migration
      progress: 65,
      created_at: baseDate,
      updated_at: baseDate
    },
    
    // Already migrated project
    {
      id: 'test-3',
      name: 'Migrated Project',
      status: 'active' as const,
      phase: 'punch_list' as const,
      lifecycle_status: 'punch_list_phase' as LifecycleStatus,
      progress: 92,
      created_at: baseDate,
      updated_at: baseDate
    },
    
    // Legacy completed project
    {
      id: 'test-4',
      name: 'Legacy Completed Project',
      status: 'completed' as const,
      phase: 'completed' as const,
      lifecycle_status: undefined, // No lifecycle status - needs migration
      progress: 100,
      created_at: baseDate,
      updated_at: baseDate
    },
    
    // Legacy on-hold project
    {
      id: 'test-5',
      name: 'Legacy On-Hold Project',
      status: 'on-hold' as const,
      phase: 'active' as const,
      lifecycle_status: undefined, // No lifecycle status - needs migration
      progress: 45,
      created_at: baseDate,
      updated_at: baseDate
    }
  ];
};

/**
 * Validate migration results
 */
export const validateMigration = (originalProject: Project, migratedProject: Project): boolean => {
  // Check that lifecycle_status was added
  if (!migratedProject.lifecycle_status) {
    console.error(`Migration failed: lifecycle_status not set for project ${originalProject.name}`);
    return false;
  }
  
  // Check that original status/phase are preserved
  if (originalProject.status !== migratedProject.status || originalProject.phase !== migratedProject.phase) {
    console.error(`Migration failed: original status/phase changed for project ${originalProject.name}`);
    return false;
  }
  
  // Check that other fields are preserved
  if (originalProject.name !== migratedProject.name || originalProject.progress !== migratedProject.progress) {
    console.error(`Migration failed: other fields changed for project ${originalProject.name}`);
    return false;
  }
  
  console.log(`✅ Migration validated successfully for project ${originalProject.name}`);
  return true;
};

/**
 * Log test scenario results
 */
export const logTestScenario = (scenarioName: string, projects: Project[]): void => {
  console.group(`🧪 Test Scenario: ${scenarioName}`);
  
  projects.forEach(project => {
    console.log(`Project: ${project.name}`);
    console.log(`  Status: ${project.status} | Phase: ${project.phase}`);
    console.log(`  Lifecycle Status: ${project.lifecycle_status || 'NOT SET'}`);
    console.log(`  Progress: ${project.progress}%`);
    console.log('---');
  });
  
  console.groupEnd();
};

/**
 * Development console commands for testing
 */
export const addTestCommands = () => {
  if (typeof window !== 'undefined') {
    (window as any).migrationTestUtils = {
      createTestProjects,
      validateMigration,
      logTestScenario,
      
      // Quick test command
      runQuickTest: () => {
        const testProjects = createTestProjects();
        logTestScenario('Quick Test', testProjects);
        console.log('📋 Test projects created. Use migrationTestUtils.logTestScenario() to inspect.');
      }
    };
    
    console.log('🛠️ Migration test utilities available at window.migrationTestUtils');
    console.log('Run migrationTestUtils.runQuickTest() to get started');
  }
};
