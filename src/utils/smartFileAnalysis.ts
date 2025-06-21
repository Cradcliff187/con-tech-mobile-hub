
import { getFileTypeInfo } from './fileTypeHelpers';

export interface FileAnalysis {
  category: string;
  confidence: number;
  suggestedCategories: Array<{ value: string; label: string; confidence: number }>;
  isReceipt: boolean;
  isPhoto: boolean;
  requiresExpenseFields: boolean;
}

export interface ProjectPhaseContext {
  phase: 'planning' | 'active' | 'punch_list' | 'closeout' | 'completed';
  status: string;
}

const FILENAME_PATTERNS = {
  plans: /\b(plan|blueprint|drawing|dwg|cad|design|layout|floor)\b/i,
  permits: /\b(permit|license|approval|authorization|inspection)\b/i,
  contracts: /\b(contract|agreement|proposal|bid|quote|estimate)\b/i,
  receipts: /\b(receipt|invoice|bill|purchase|expense|cost|payment)\b/i,
  photos: /\b(photo|image|pic|img|progress|before|after|site)\b/i,
  reports: /\b(report|summary|status|inspection|analysis|test)\b/i,
  safety: /\b(safety|msds|hazard|incident|accident|training)\b/i,
  other: /\b(misc|other|general|document|file)\b/i
};

const PHASE_RELEVANT_CATEGORIES = {
  planning: ['plans', 'permits', 'contracts'],
  active: ['photos', 'receipts', 'reports', 'safety'],
  punch_list: ['photos', 'reports'],
  closeout: ['reports', 'photos', 'other'],
  completed: ['other', 'reports']
};

export const analyzeFile = (
  file: File,
  projectContext?: ProjectPhaseContext
): FileAnalysis => {
  const fileTypeInfo = getFileTypeInfo(file.type, file.name);
  const fileName = file.name.toLowerCase();
  
  // Base analysis
  const isPhoto = fileTypeInfo.category === 'image';
  const isReceipt = detectReceipt(fileName, file.type);
  
  // Pattern matching for categories
  const categoryScores: Record<string, number> = {};
  
  Object.entries(FILENAME_PATTERNS).forEach(([category, pattern]) => {
    const matches = fileName.match(pattern);
    if (matches) {
      categoryScores[category] = (categoryScores[category] || 0) + 0.8;
    }
  });
  
  // File type hints
  if (isPhoto) {
    categoryScores.photos = (categoryScores.photos || 0) + 0.6;
  }
  
  if (file.type === 'application/pdf') {
    categoryScores.plans = (categoryScores.plans || 0) + 0.3;
    categoryScores.contracts = (categoryScores.contracts || 0) + 0.3;
    categoryScores.reports = (categoryScores.reports || 0) + 0.3;
  }
  
  // Project phase context boost
  if (projectContext) {
    const relevantCategories = PHASE_RELEVANT_CATEGORIES[projectContext.phase] || [];
    relevantCategories.forEach(category => {
      categoryScores[category] = (categoryScores[category] || 0) + 0.4;
    });
  }
  
  // Find best category
  const sortedCategories = Object.entries(categoryScores)
    .sort(([,a], [,b]) => b - a)
    .map(([category, score]) => ({
      value: category,
      label: getCategoryLabel(category),
      confidence: Math.min(score, 1.0)
    }));
  
  const primaryCategory = sortedCategories[0]?.value || (isPhoto ? 'photos' : 'other');
  const confidence = sortedCategories[0]?.confidence || 0.3;
  
  return {
    category: primaryCategory,
    confidence,
    suggestedCategories: sortedCategories.slice(0, 3),
    isReceipt,
    isPhoto,
    requiresExpenseFields: isReceipt
  };
};

const detectReceipt = (fileName: string, fileType: string): boolean => {
  const receiptPatterns = /\b(receipt|invoice|bill|purchase|expense|cost)\b/i;
  return receiptPatterns.test(fileName);
};

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    plans: 'Plans & Drawings',
    permits: 'Permits',
    contracts: 'Contracts',
    photos: 'Photos',
    reports: 'Reports',
    safety: 'Safety Documents',
    receipts: 'Receipts',
    other: 'Other'
  };
  return labels[category] || category;
};

export const validateFileSize = (file: File): { isValid: boolean; error?: string } => {
  const maxImageSize = 20 * 1024 * 1024; // 20MB for images
  const maxDocumentSize = 10 * 1024 * 1024; // 10MB for documents
  
  const fileTypeInfo = getFileTypeInfo(file.type, file.name);
  const isImage = fileTypeInfo.category === 'image';
  const maxSize = isImage ? maxImageSize : maxDocumentSize;
  
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `File size (${fileSizeMB}MB) exceeds ${maxSizeMB}MB limit for ${isImage ? 'images' : 'documents'}`
    };
  }
  
  return { isValid: true };
};
