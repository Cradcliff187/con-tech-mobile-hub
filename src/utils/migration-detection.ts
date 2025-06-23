
import { Project } from '@/types/database';

/**
 * Migration Detection Utilities
 * Helps identify projects that need lifecycle_status migration
 */

export interface MigrationStatus {
  needsMigration: boolean;
  totalProjects: number;
  legacyProjects: number;
  migrationComplete: boolean;
}

/**
 * Check if a project needs migration
 */
export const projectNeedsMigration = (project: Project): boolean => {
  return !project.lifecycle_status;
};

/**
 * Get migration status for all projects
 */
export const getMigrationStatus = (projects: Project[]): MigrationStatus => {
  const totalProjects = projects.length;
  const legacyProjects = projects.filter(projectNeedsMigration).length;
  const needsMigration = legacyProjects > 0;
  const migrationComplete = legacyProjects === 0 && totalProjects > 0;

  return {
    needsMigration,
    totalProjects,
    legacyProjects,
    migrationComplete
  };
};

/**
 * Get migration warning message
 */
export const getMigrationWarningMessage = (status: MigrationStatus): string => {
  if (status.migrationComplete) {
    return 'All projects have been successfully migrated to the new lifecycle status system.';
  }
  
  if (status.needsMigration) {
    return `${status.legacyProjects} of ${status.totalProjects} projects need to be migrated to the new lifecycle status system. This will improve project tracking and reporting.`;
  }
  
  return 'No migration needed.';
};

/**
 * Log migration status for debugging
 */
export const logMigrationStatus = (projects: Project[]): void => {
  const status = getMigrationStatus(projects);
  
  console.log('🔄 Lifecycle Status Migration Status:', {
    needsMigration: status.needsMigration,
    totalProjects: status.totalProjects,
    legacyProjects: status.legacyProjects,
    migrationComplete: status.migrationComplete
  });
  
  if (status.needsMigration) {
    const legacyProjectNames = projects
      .filter(projectNeedsMigration)
      .map(p => p.name)
      .slice(0, 5); // Show first 5
    
    console.log('📋 Projects needing migration:', legacyProjectNames);
    if (status.legacyProjects > 5) {
      console.log(`... and ${status.legacyProjects - 5} more`);
    }
  }
};
