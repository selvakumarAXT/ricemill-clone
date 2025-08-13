import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import Button from './Button';

const FileUpload = ({
  label = "Upload Files",
  multiple = true,
  accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv",
  maxFiles = 10,
  maxSize = 10, // MB
  onFilesChange,
  onFileRemove,
  onUploadSuccess,
  files = [],
  disabled = false,
  className = "",
  showPreview = true,
  module = "documents",
  disableAutoUpload = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { token } = useSelector((state) => state.auth);

  const allowedTypes = accept.split(',').map(type => type.trim());
  
  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File ${file.name} is too large. Maximum size is ${maxSize}MB.`;
    }
    
    // Check file type
    const isValidType = allowedTypes.some(type => {
      if (type === 'image/*') {
        return file.type.startsWith('image/');
      }
      return file.type === type || file.name.toLowerCase().endsWith(type.replace('*', ''));
    });
    
    if (!isValidType) {
      return `File ${file.name} has an invalid type. Allowed types: ${accept}`;
    }
    
    return null;
  };

  const handleFiles = (selectedFiles) => {
    const validFiles = [];
    const errors = [];
    
    Array.from(selectedFiles).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });
    
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    
    if (files.length + validFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed.`);
      return;
    }
    
    onFilesChange([...files, ...validFiles]);
  };

  const handleFileUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    try {
      console.log('Starting file upload for module:', module);
      console.log('Files to upload:', files);
      console.log('Token available:', !!token);
      console.log('Token length:', token ? token.length : 0);
      
      const formData = new FormData();
      formData.append('module', module);
      
      files.forEach((file, index) => {
        formData.append('files', file);
      });
      
      console.log('FormData created, sending request...');
      
      // Try to get token from multiple sources
      const authToken = token || localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('Using token:', authToken ? 'Available' : 'Not available');
      
      const response = await fetch(`http://localhost:3001/api/uploads/upload/${module}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });
      
      console.log('Response received:', response.status);
      
      const result = await response.json();
      console.log('Upload result:', result);
      
      if (result.success) {
        // Clear files after successful upload
        onFilesChange([]);
        // Call the callback with uploaded file data
        if (onUploadSuccess) {
          console.log('Calling onUploadSuccess with:', result.files);
          onUploadSuccess(result.files);
        }
        alert('Files uploaded successfully!');
      } else {
        alert(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileRemove = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    if (onFileRemove) {
      onFileRemove(index);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    // Handle cases where file.type might be undefined (uploaded files from backend)
    if (!file.type) {
      // Try to determine type from filename or mimetype
      const filename = file.name || file.originalname || '';
      const mimetype = file.mimetype || '';
      
      if (filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg') || 
          filename.toLowerCase().endsWith('.png') || filename.toLowerCase().endsWith('.gif') ||
          mimetype.startsWith('image/')) {
        return '🖼️';
      } else if (filename.toLowerCase().endsWith('.pdf') || mimetype.includes('pdf')) {
        return '📄';
      } else if (filename.toLowerCase().endsWith('.doc') || filename.toLowerCase().endsWith('.docx') || 
                 mimetype.includes('word') || mimetype.includes('document')) {
        return '📝';
      } else if (filename.toLowerCase().endsWith('.xls') || filename.toLowerCase().endsWith('.xlsx') || 
                 mimetype.includes('excel') || mimetype.includes('spreadsheet')) {
        return '📊';
      } else if (filename.toLowerCase().endsWith('.txt') || filename.toLowerCase().endsWith('.csv') || 
                 mimetype.includes('text')) {
        return '📄';
      } else {
        return '📎';
      }
    }
    
    // Handle files with type property (newly selected files)
    if (file.type.startsWith('image/')) {
      return '🖼️';
    } else if (file.type.includes('pdf')) {
      return '📄';
    } else if (file.type.includes('word') || file.type.includes('document')) {
      return '📝';
    } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
      return '📊';
    } else if (file.type.includes('text')) {
      return '📄';
    } else {
      return '📎';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-2">
          <div className="text-4xl">📁</div>
          <div className="text-sm text-gray-600">
            <span className="font-medium text-blue-600 hover:text-blue-500">
              Click to upload
            </span>{' '}
            or drag and drop
          </div>
          <div className="text-xs text-gray-500">
            {accept} (Max {maxSize}MB per file, {maxFiles} files max)
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700">
              Selected Files ({files.length}/{maxFiles})
            </h4>
            {!disableAutoUpload && (
              <Button
                onClick={handleFileUpload}
                variant="primary"
                icon="upload"
                disabled={uploading || disabled}
                className="text-xs"
              >
                {uploading ? 'Uploading...' : 'Upload Files'}
              </Button>
            )}
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-lg">{getFileIcon(file)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name || file.originalname || 'Unknown File'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size || 0)}
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={() => handleFileRemove(index)}
                  variant="danger"
                  icon="delete"
                  className="text-xs ml-2"
                  disabled={disabled}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Preview */}
      {showPreview && files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Preview</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {files.map((file, index) => {
              const isImage = (file.type && file.type.startsWith('image/')) || 
                             (file.mimetype && file.mimetype.startsWith('image/'));
              
              return (
                <div key={index} className="relative">
                  {isImage ? (
                    <img
                      src={file.url || URL.createObjectURL(file)}
                      alt={file.name || file.originalname || 'File'}
                      className="w-full h-20 object-cover rounded border"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-20 bg-gray-100 rounded border flex items-center justify-center ${
                    isImage ? 'hidden' : ''
                  }`}>
                    <span className="text-2xl">{getFileIcon(file)}</span>
                  </div>
                  <div className="absolute top-1 right-1">
                    <Button
                      onClick={() => handleFileRemove(index)}
                      variant="danger"
                      icon="delete"
                      className="text-xs p-1"
                      disabled={disabled}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 