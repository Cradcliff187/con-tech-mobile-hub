
export interface FileTypeInfo {
  category: 'pdf' | 'image' | 'text' | 'office' | 'unknown';
  canPreview: boolean;
  icon: string;
  displayName: string;
}

export const getFileTypeInfo = (mimeType?: string, fileName?: string): FileTypeInfo => {
  if (!mimeType) {
    // Fallback to file extension
    const extension = fileName?.split('.').pop()?.toLowerCase();
    return getFileTypeInfoByExtension(extension);
  }

  switch (mimeType) {
    case 'application/pdf':
      return {
        category: 'pdf',
        canPreview: true,
        icon: 'FileText',
        displayName: 'PDF Document'
      };
    
    case 'image/png':
    case 'image/jpeg':
    case 'image/jpg':
    case 'image/gif':
      return {
        category: 'image',
        canPreview: true,
        icon: 'Image',
        displayName: 'Image'
      };
    
    case 'text/plain':
      return {
        category: 'text',
        canPreview: true,
        icon: 'FileText',
        displayName: 'Text File'
      };
    
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return {
        category: 'office',
        canPreview: false,
        icon: 'FileText',
        displayName: 'Word Document'
      };
    
    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return {
        category: 'office',
        canPreview: false,
        icon: 'FileText',
        displayName: 'Excel Spreadsheet'
      };
    
    default:
      return {
        category: 'unknown',
        canPreview: false,
        icon: 'File',
        displayName: 'Document'
      };
  }
};

const getFileTypeInfoByExtension = (extension?: string): FileTypeInfo => {
  if (!extension) {
    return {
      category: 'unknown',
      canPreview: false,
      icon: 'File',
      displayName: 'Document'
    };
  }

  switch (extension) {
    case 'pdf':
      return { category: 'pdf', canPreview: true, icon: 'FileText', displayName: 'PDF Document' };
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return { category: 'image', canPreview: true, icon: 'Image', displayName: 'Image' };
    case 'txt':
      return { category: 'text', canPreview: true, icon: 'FileText', displayName: 'Text File' };
    case 'doc':
    case 'docx':
      return { category: 'office', canPreview: false, icon: 'FileText', displayName: 'Word Document' };
    case 'xls':
    case 'xlsx':
      return { category: 'office', canPreview: false, icon: 'FileText', displayName: 'Excel Spreadsheet' };
    default:
      return { category: 'unknown', canPreview: false, icon: 'File', displayName: 'Document' };
  }
};

export const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
