import React from 'react';

const FileDisplay = ({ 
  files = [], 
  title = "FILES", 
  showTitle = true,
  className = "",
  onFileClick = null,
  onFileRemove = null,
  showRemoveButton = false
}) => {
  if (!files || files.length === 0) {
    return (
      <div className={`${className}`}>
        {showTitle && (
          <h4 className="text-sm font-semibold text-gray-800 mb-2">{title}</h4>
        )}
        <div className="text-sm text-gray-500">No files</div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {showTitle && (
        <h4 className="text-sm font-semibold text-gray-800 mb-2">{title}</h4>
      )}
      
      <div className="space-y-2">
        {files.map((file, index) => (
          <div key={index} className="flex items-center justify-between">
            <button
              onClick={() => onFileClick && onFileClick(file, index)}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                onFileClick 
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer' 
                  : 'bg-blue-100 text-blue-800 cursor-default'
              }`}
            >
              <span className="text-gray-500 mr-2">📎</span>
              <span className="truncate max-w-48">
                {file.originalname || file.name || file.filename || 'Unknown File'}
              </span>
            </button>
            
            {showRemoveButton && onFileRemove && (
              <button
                onClick={() => onFileRemove(index)}
                className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                title="Remove file"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileDisplay;
