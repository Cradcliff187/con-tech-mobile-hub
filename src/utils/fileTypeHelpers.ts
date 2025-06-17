
export interface FileTypeInfo {
  category: 'image' | 'pdf' | 'office' | 'text' | 'unknown';
  canPreview: boolean;
  icon: string;
}

export const getFileTypeInfo = (fileType?: string, fileName?: string): FileTypeInfo => {
  if (!fileType && !fileName) {
    return { category: 'unknown', canPreview: false, icon: 'file' };
  }

  const type = fileType?.toLowerCase() || '';
  const name = fileName?.toLowerCase() || '';

  // Image files
  if (type.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp|svg)$/.test(name)) {
    return { category: 'image', canPreview: true, icon: 'image' };
  }

  // PDF files
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return { category: 'pdf', canPreview: true, icon: 'file-text' };
  }

  // Office documents
  if (
    type.includes('word') || 
    type.includes('excel') || 
    type.includes('powerpoint') ||
    type.includes('spreadsheet') ||
    /\.(doc|docx|xls|xlsx|ppt|pptx)$/.test(name)
  ) {
    return { category: 'office', canPreview: false, icon: 'file-text' };
  }

  // Text files
  if (type.startsWith('text/') || /\.(txt|md|csv)$/.test(name)) {
    return { category: 'text', canPreview: true, icon: 'file-text' };
  }

  return { category: 'unknown', canPreview: false, icon: 'file' };
};

export const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isImageFile = (fileType?: string, fileName?: string): boolean => {
  const info = getFileTypeInfo(fileType, fileName);
  return info.category === 'image';
};

export const isPdfFile = (fileType?: string, fileName?: string): boolean => {
  const info = getFileTypeInfo(fileType, fileName);
  return info.category === 'pdf';
};

export const canPreviewFile = (fileType?: string, fileName?: string): boolean => {
  const info = getFileTypeInfo(fileType, fileName);
  return info.canPreview;
};
