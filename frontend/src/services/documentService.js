import { createAxiosInstance } from '../utils/apiUtils';

const BASE_URL = '/documents';

// Create axios instance for API calls
const api = createAxiosInstance();

export const documentService = {
  // Get all documents with filtering and pagination
  getDocuments: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}?${queryParams.toString()}` : BASE_URL;
    const response = await api.get(url);
    return response.data;
  },

  // Get single document
  getDocument: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create new document
  createDocument: async (documentData) => {
    const response = await api.post(BASE_URL, documentData);
    return response.data;
  },

  // Update document
  updateDocument: async (id, documentData) => {
    const response = await api.put(`${BASE_URL}/${id}`, documentData);
    return response.data;
  },

  // Delete document
  deleteDocument: async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Download document (increment download count)
  downloadDocument: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/download`);
    return response.data;
  },

  // Get document statistics
  getDocumentStats: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/stats/overview?${queryParams.toString()}` : `${BASE_URL}/stats/overview`;
    const response = await api.get(url);
    return response.data;
  },

  // Get documents by module
  getDocumentsByModule: async (module, params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/module/${module}?${queryParams.toString()}` : `${BASE_URL}/module/${module}`;
    const response = await api.get(url);
    return response.data;
  },

  // Upload file and create document
  uploadDocument: async (file, documentData) => {
    try {
      console.log('uploadDocument called with:', { file, documentData });
      
      // Get current branch ID from Redux store or localStorage
      const currentBranchId = documentData.branchId || 'default';
      console.log('Using branch ID:', currentBranchId);
      
      // First upload the file using the new branch-based structure
      const formData = new FormData();
      formData.append('files', file);
      formData.append('module', documentData.module || 'documents');
      formData.append('branchId', currentBranchId);

      console.log('Uploading to module:', documentData.module || 'documents');
      console.log('FormData entries:', Array.from(formData.entries()));

             const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/uploads/upload/${documentData.module || 'documents'}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      console.log('Upload response status:', uploadResponse.status);
      console.log('Upload response ok:', uploadResponse.ok);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error('Upload response error:', errorData);
        throw new Error(`File upload failed: ${errorData.message || 'Unknown error'}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('Upload result:', uploadResult);
      
      if (!uploadResult.success || !uploadResult.files || uploadResult.files.length === 0) {
        throw new Error('No files uploaded');
      }

      const uploadedFile = uploadResult.files[0];
      console.log('Uploaded file info:', uploadedFile);

      // Determine file type from mime type
      const getFileType = (mimeType) => {
        if (mimeType.includes('pdf')) return 'pdf';
        if (mimeType.includes('word') || mimeType.includes('doc')) return 'doc';
        if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'xls';
        if (mimeType.includes('image')) {
          if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpg';
          if (mimeType.includes('png')) return 'png';
          if (mimeType.includes('gif')) return 'gif';
          return 'jpg';
        }
        if (mimeType.includes('text')) {
          if (mimeType.includes('csv')) return 'csv';
          return 'txt';
        }
        return 'pdf';
      };

      // Then create the document record
      const documentPayload = {
        ...documentData,
        fileName: uploadedFile.filename,
        originalName: uploadedFile.originalName,
        filePath: uploadedFile.path,
        fileUrl: uploadedFile.url,
        fileSize: uploadedFile.size,
        mimeType: uploadedFile.mimetype,
        fileType: getFileType(uploadedFile.mimetype),
        branchId: currentBranchId,
        // Map 'documents' back to 'general' for database storage
        module: documentData.module === 'documents' ? 'general' : documentData.module
      };

      return await documentService.createDocument(documentPayload);
    } catch (error) {
      console.error('Upload document error:', error);
      throw error;
    }
  },

  // Download file from URL
  downloadFile: async (url, fileName) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download file error:', error);
      throw error;
    }
  },

  // Get module options
  getModuleOptions: () => [
    { value: 'production', label: 'Production' },
    { value: 'paddy', label: 'Paddy Management' },
    { value: 'rice', label: 'Rice Management' },
    { value: 'gunny', label: 'Gunny Management' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'financial', label: 'Financial Ledger' },
    { value: 'quality', label: 'Quality Control' },
    { value: 'sales', label: 'Sales & Dispatch' },
    { value: 'vendor', label: 'Vendor Management' },
    { value: 'eb_meter', label: 'EB Meter Calculation' },

    { value: 'users', label: 'User Management' },
    { value: 'branches', label: 'Branch Management' },
    { value: 'general', label: 'General' }
  ],

  // Get category options
  getCategoryOptions: () => [
    { value: 'invoice', label: 'Invoice' },
    { value: 'quality_report', label: 'Quality Report' },
    { value: 'contract', label: 'Contract' },
    { value: 'license', label: 'License' },
    { value: 'manual', label: 'Manual' },
    { value: 'receipt', label: 'Receipt' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'statement', label: 'Statement' },
    { value: 'report', label: 'Report' },
    { value: 'other', label: 'Other' }
  ],

  // Get file type options
  getFileTypeOptions: () => [
    { value: 'pdf', label: 'PDF' },
    { value: 'doc', label: 'DOC' },
    { value: 'docx', label: 'DOCX' },
    { value: 'xls', label: 'XLS' },
    { value: 'xlsx', label: 'XLSX' },
    { value: 'jpg', label: 'JPG' },
    { value: 'jpeg', label: 'JPEG' },
    { value: 'png', label: 'PNG' },
    { value: 'gif', label: 'GIF' },
    { value: 'txt', label: 'TXT' },
    { value: 'csv', label: 'CSV' }
  ],

  // Get status options
  getStatusOptions: () => [
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' },
    { value: 'deleted', label: 'Deleted' }
  ],

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },

  // Get file type icon
  getFileTypeIcon: (fileType) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      case 'txt': return '📄';
      case 'csv': return '📊';
      default: return '📄';
    }
  },

  // Get category icon
  getCategoryIcon: (category) => {
    switch (category) {
      case 'invoice': return '🧾';
      case 'quality_report': return '🔬';
      case 'contract': return '📋';
      case 'license': return '📜';
      case 'manual': return '📚';
      case 'receipt': return '🧾';
      case 'certificate': return '🏆';
      case 'statement': return '📊';
      case 'report': return '📈';
      case 'other': return '📁';
      default: return '📄';
    }
  },

  // Get status color
  getStatusColor: (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'archived':
        return 'text-gray-600 bg-gray-100';
      case 'deleted':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }
};

export default documentService; 