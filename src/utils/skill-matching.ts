
export const calculateSkillMatchPercentage = (requiredSkills: string[], workerSkills: string[]): number => {
  if (!requiredSkills?.length) return 100;
  if (!workerSkills?.length) return 0;
  
  const matches = requiredSkills.filter(skill => 
    workerSkills.some(workerSkill => 
      workerSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(workerSkill.toLowerCase())
    )
  );
  
  return Math.round((matches.length / requiredSkills.length) * 100);
};

// Add the missing export alias
export const calculateSkillMatch = calculateSkillMatchPercentage;

export const PUNCH_LIST_CATEGORY_SKILLS = {
  paint: ['painting', 'surface prep', 'color matching'],
  electrical: ['electrical', 'wiring', 'circuits'],
  plumbing: ['plumbing', 'pipes', 'fixtures'],
  carpentry: ['carpentry', 'woodworking', 'framing'],
  flooring: ['flooring', 'tile', 'hardwood'],
  hvac: ['hvac', 'heating', 'cooling'],
  other: []
} as const;

export type PunchListCategory = keyof typeof PUNCH_LIST_CATEGORY_SKILLS;

export const getSkillsForPunchListCategory = (category: PunchListCategory): string[] => {
  return [...PUNCH_LIST_CATEGORY_SKILLS[category]]; // Create mutable copy
};

export const filterAndSortWorkersBySkillMatch = <T extends { id: string; specialties?: string[]; [key: string]: any }>(
  workers: T[],
  requiredSkills: string[]
): (T & { skillMatchPercentage: number })[] => {
  return workers
    .map(worker => ({
      ...worker,
      skillMatchPercentage: calculateSkillMatchPercentage(requiredSkills, worker.specialties || [])
    }))
    .sort((a, b) => b.skillMatchPercentage - a.skillMatchPercentage);
};
