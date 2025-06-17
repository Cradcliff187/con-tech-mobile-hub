export interface FileTypeInfo {
  category: 'image' | 'pdf' | 'office' | 'text' | 'unknown';
  canPreview: boolean;
  icon: string;
  displayName: string;
}

export const getFileTypeInfo = (fileType?: string, fileName?: string): FileTypeInfo => {
  if (!fileType && !fileName) {
    return { category: 'unknown', canPreview: false, icon: 'file', displayName: 'Unknown File' };
  }

  const type = fileType?.toLowerCase() || '';
  const name = fileName?.toLowerCase() || '';

  // Image files
  if (type.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp|svg)$/.test(name)) {
    return { category: 'image', canPreview: true, icon: 'image', displayName: 'Image' };
  }

  // PDF files
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return { category: 'pdf', canPreview: true, icon: 'file-text', displayName: 'PDF Document' };
  }

  // Office documents
  if (
    type.includes('word') || 
    type.includes('excel') || 
    type.includes('powerpoint') ||
    type.includes('spreadsheet') ||
    /\.(doc|docx|xls|xlsx|ppt|pptx)$/.test(name)
  ) {
    let displayName = 'Office Document';
    if (type.includes('word') || /\.(doc|docx)$/.test(name)) {
      displayName = 'Word Document';
    } else if (type.includes('excel') || type.includes('spreadsheet') || /\.(xls|xlsx)$/.test(name)) {
      displayName = 'Excel Spreadsheet';
    } else if (type.includes('powerpoint') || /\.(ppt|pptx)$/.test(name)) {
      displayName = 'PowerPoint Presentation';
    }
    return { category: 'office', canPreview: false, icon: 'file-text', displayName };
  }

  // Text files
  if (type.startsWith('text/') || /\.(txt|md|csv)$/.test(name)) {
    let displayName = 'Text File';
    if (name.endsWith('.md')) {
      displayName = 'Markdown Document';
    } else if (name.endsWith('.csv')) {
      displayName = 'CSV File';
    }
    return { category: 'text', canPreview: true, icon: 'file-text', displayName };
  }

  return { category: 'unknown', canPreview: false, icon: 'file', displayName: 'Unknown File' };
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
