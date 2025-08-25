import React from 'react';
import FileDisplay from './FileDisplay';

const FileDisplayDemo = () => {
  // Mock data for different modules
  const mockFiles = [
    {
      originalname: "Screenshot 2025-08-12 at 6.44.55 PM.png",
      filename: "inv_screenshot_123.png",
      size: 123456,
      mimetype: "image/png"
    },
    {
              originalname: "Rice Report Q1.pdf",
      filename: "prod_report_q1.pdf",
      size: 234567,
      mimetype: "application/pdf"
    },
    {
      originalname: "Rice Quality Analysis.xlsx",
      filename: "rice_quality_analysis.xlsx",
      size: 34567,
      mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
  ];

  const emptyFiles = [];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
        FileDisplay Component Demo
      </h1>

      {/* Basic Usage */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-blue-600">1. Basic FileDisplay (with files)</h2>
        <FileDisplay files={mockFiles} />
      </div>

      {/* Empty State */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-blue-600">2. Empty State (no files)</h2>
        <FileDisplay files={emptyFiles} />
      </div>

      {/* Custom Title */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-blue-600">3. Custom Title</h2>
        <FileDisplay files={mockFiles} title="INVENTORY DOCUMENTS" />
      </div>

      {/* No Title */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-blue-600">4. No Title (for table columns)</h2>
        <FileDisplay files={mockFiles} showTitle={false} />
      </div>

      {/* With Click Handler */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-blue-600">5. With Click Handler (clickable files)</h2>
        <FileDisplay 
          files={mockFiles} 
          title="CLICKABLE FILES"
          onFileClick={(file, index) => alert(`Clicked: ${file.originalname}`)}
        />
      </div>

      {/* With Remove Buttons */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-blue-600">6. With Remove Buttons</h2>
        <FileDisplay 
          files={mockFiles} 
          title="FILES WITH REMOVE OPTIONS"
          showRemoveButton={true}
          onFileRemove={(index) => alert(`Remove file at index: ${index}`)}
        />
      </div>

      {/* Different Module Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inventory Module */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-md font-semibold mb-3 text-green-600">Inventory Module</h3>
          <FileDisplay 
            files={mockFiles.slice(0, 2)} 
            title="INVENTORY FILES"
            className="text-sm"
          />
        </div>

        {/* Gunny Management */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-md font-semibold mb-3 text-purple-600">Gunny Management</h3>
          <FileDisplay 
            files={mockFiles.slice(1, 3)} 
            title="GUNNY FILES"
            className="text-sm"
          />
        </div>

        {/* Rice Management */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-md font-semibold mb-3 text-orange-600">Rice Management</h3>
          <FileDisplay 
            files={mockFiles.slice(2)} 
            title="RICE DOCUMENTS"
            className="text-sm"
          />
        </div>

        {/* Paddy Management */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-md font-semibold mb-3 text-red-600">Paddy Management</h3>
          <FileDisplay 
            files={emptyFiles} 
            title="PADDY FILES"
            className="text-sm"
          />
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-lg font-semibold mb-4 text-blue-800">📋 How to Use in Your Modules</h2>
        <div className="space-y-3 text-blue-700">
          <div>
            <h3 className="font-medium">1. Import the Component:</h3>
            <code className="block bg-blue-100 p-2 rounded text-sm mt-1">
              import FileDisplay from '../components/common/FileDisplay';
            </code>
          </div>
          
          <div>
            <h3 className="font-medium">2. Use in Table Columns:</h3>
            <code className="block bg-blue-100 p-2 rounded text-sm mt-1">
              {`{ key: "files", label: "Files", render: (files) => (
  <FileDisplay files={files} title="" showTitle={false} />
)}`}
            </code>
          </div>
          
          <div>
            <h3 className="font-medium">3. Use in Detail Views:</h3>
            <code className="block bg-blue-100 p-2 rounded text-sm mt-1">
              {`<FileDisplay 
  files={item.files} 
  title="Attached Files"
  showTitle={true}
/>`}
            </code>
          </div>
          
          <div>
            <h3 className="font-medium">4. Use with Click Handlers:</h3>
            <code className="block bg-blue-100 p-2 rounded text-sm mt-1">
              {`<FileDisplay 
  files={files} 
  title="FILES"
  onFileClick={(file, index) => handleFileClick(file)}
/>`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDisplayDemo;
