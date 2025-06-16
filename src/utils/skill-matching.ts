
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
  return PUNCH_LIST_CATEGORY_SKILLS[category] || [];
};

export const filterAndSortWorkersBySkillMatch = (
  workers: Array<{ id: string; skills?: string[]; [key: string]: any }>,
  requiredSkills: string[]
) => {
  return workers
    .map(worker => ({
      ...worker,
      skillMatchPercentage: calculateSkillMatchPercentage(requiredSkills, worker.skills || [])
    }))
    .sort((a, b) => b.skillMatchPercentage - a.skillMatchPercentage);
};
