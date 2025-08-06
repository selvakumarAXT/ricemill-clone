import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import TableFilters from '../components/common/TableFilters';
import BranchFilter from '../components/common/BranchFilter';
import TableList from '../components/common/TableList';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ResponsiveFilters from '../components/common/ResponsiveFilters';
import FormInput from '../components/common/FormInput';
import FormSelect from '../components/common/FormSelect';
import DialogBox from '../components/common/DialogBox';

const DocumentUploads = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [documentFilter, setDocumentFilter] = useState('');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [expandedDocument, setExpandedDocument] = useState(null);
  const { currentBranchId } = useSelector((state) => state.branch);

  const initialDocumentForm = {
    title: '',
    description: '',
    category: 'invoice',
    fileType: 'pdf',
    uploadDate: '',
    uploadedBy: '',
    version: '1.0',
    status: 'active',
    remarks: ''
  };

  const [documentForm, setDocumentForm] = useState(initialDocumentForm);

  useEffect(() => {
    fetchDocumentData();
  }, [currentBranchId]);

  const fetchDocumentData = async () => {
    setLoading(true);
    setError('');
    try {
      // Simulate API call - replace with actual service
      const mockDocuments = [
        {
          _id: '1',
          title: 'Rice Sales Invoice - January 2024',
          description: 'Monthly rice sales invoice for ABC Traders',
          category: 'invoice',
          fileType: 'pdf',
          fileName: 'rice_sales_invoice_jan2024.pdf',
          fileSize: '2.5 MB',
          uploadDate: '2024-01-15',
          uploadedBy: 'John Doe',
          version: '1.0',
          status: 'active',
          remarks: 'Important document for accounting',
          downloadCount: 5,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        {
          _id: '2',
          title: 'Paddy Quality Report',
          description: 'Quality assessment report for paddy batch QC-001',
          category: 'quality_report',
          fileType: 'pdf',
          fileName: 'paddy_quality_report_qc001.pdf',
          fileSize: '1.8 MB',
          uploadDate: '2024-01-16',
          uploadedBy: 'Jane Smith',
          version: '1.0',
          status: 'active',
          remarks: 'QC report for batch processing',
          downloadCount: 3,
          createdAt: '2024-01-16T11:00:00Z',
          updatedAt: '2024-01-16T11:15:00Z'
        }
      ];
      setDocuments(mockDocuments);
    } catch (err) {
      setError(err.message || 'Failed to fetch document data');
    } finally {
      setLoading(false);
    }
  };

  const openDocumentModal = (document = null) => {
    setEditingDocument(document);
    if (document) {
      // Format date for HTML date input (YYYY-MM-DD)
      const formattedUploadDate = new Date(document.uploadDate).toISOString().split('T')[0];
      const formData = {
        ...initialDocumentForm,
        ...document,
        uploadDate: formattedUploadDate
      };
      setDocumentForm(formData);
    } else {
      setDocumentForm(initialDocumentForm);
    }
    setShowDocumentModal(true);
  };

  const closeDocumentModal = () => {
    setShowDocumentModal(false);
    setEditingDocument(null);
    setDocumentForm(initialDocumentForm);
  };

  const handleDocumentFormChange = (e) => {
    const { name, value } = e.target;
    setDocumentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveDocument = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Simulate API call - replace with actual service
      if (editingDocument) {
        // Update existing document
        setDocuments(prev => prev.map(doc => 
          doc._id === editingDocument._id ? { ...documentForm, _id: doc._id } : doc
        ));
      } else {
        // Create new document
        const newDocument = {
          ...documentForm,
          _id: Date.now().toString(),
          fileName: 'sample_document.pdf',
          fileSize: '1.0 MB',
          downloadCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setDocuments(prev => [newDocument, ...prev]);
      }
      closeDocumentModal();
    } catch (error) {
      setError('Error saving document: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        setLoading(true);
        // Simulate API call - replace with actual service
        setDocuments(prev => prev.filter(doc => doc._id !== documentId));
      } catch (error) {
        setError('Error deleting document: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const downloadDocument = (document) => {
    // Simulate download - replace with actual download logic
    console.log('Downloading document:', document.fileName);
    alert(`Downloading ${document.fileName}`);
  };

  const getStatusColor = (status) => {
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
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'invoice': return '📄';
      case 'quality_report': return '🔬';
      case 'contract': return '📋';
      case 'license': return '📜';
      case 'manual': return '📚';
      case 'other': return '📁';
      default: return '📄';
    }
  };

  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case 'pdf': return '📄';
      case 'doc': return '📝';
      case 'xls': return '📊';
      case 'jpg': return '🖼️';
      case 'png': return '🖼️';
      default: return '📄';
    }
  };

  // Calculate summary statistics
  const totalDocuments = documents.length;
  const totalSize = documents.reduce((sum, doc) => {
    const size = parseFloat(doc.fileSize.replace(' MB', ''));
    return sum + size;
  }, 0);
  const totalDownloads = documents.reduce((sum, doc) => sum + doc.downloadCount, 0);
  const activeDocuments = documents.filter(doc => doc.status === 'active').length;

  // Define columns for the table
  const columns = [
    { 
      key: "title", 
      label: "Document Title",
      renderCell: (value) => <span className="font-medium text-gray-900">{value}</span>
    },
    { 
      key: "category", 
      label: "Category",
      renderCell: (value) => (
        <span className="flex items-center">
          <span className="mr-1">{getCategoryIcon(value)}</span>
          <span className="capitalize">{value.replace('_', ' ')}</span>
        </span>
      )
    },
    { 
      key: "fileType", 
      label: "File Type",
      renderCell: (value) => (
        <span className="flex items-center">
          <span className="mr-1">{getFileTypeIcon(value)}</span>
          <span className="uppercase">{value}</span>
        </span>
      )
    },
    { 
      key: "fileSize", 
      label: "File Size",
      renderCell: (value) => <span className="text-gray-700">{value}</span>
    },
    { 
      key: "uploadDate", 
      label: "Upload Date",
      renderCell: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: "uploadedBy", 
      label: "Uploaded By",
      renderCell: (value) => <span className="text-gray-700">{value}</span>
    },
    { 
      key: "status", 
      label: "Status",
      renderCell: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    }
  ];

  const filteredDocuments = documents.filter(doc => {
    const q = documentFilter.toLowerCase();
    return (
      doc.title?.toLowerCase().includes(q) ||
      doc.description?.toLowerCase().includes(q) ||
      doc.category?.toLowerCase().includes(q) ||
      doc.uploadedBy?.toLowerCase().includes(q) ||
      doc.status?.toLowerCase().includes(q)
    );
  });

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-6 sm:px-6">
        <div className="flex flex-col space-y-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Document Uploads & History
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage file uploads and document tracking</p>
          </div>
          <div className="flex justify-center sm:justify-start">
            <Button
              onClick={() => openDocumentModal()}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              📁 Upload Document
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 text-lg">📁</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-xl font-bold text-blue-600">{totalDocuments}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-green-600 text-lg">💾</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Size</p>
                <p className="text-xl font-bold text-green-600">{totalSize.toFixed(1)} MB</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-purple-600 text-lg">⬇️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Downloads</p>
                <p className="text-xl font-bold text-purple-600">{totalDownloads}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-yellow-600 text-lg">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Documents</p>
                <p className="text-xl font-bold text-yellow-600">{activeDocuments}</p>
              </div>
            </div>
          </div>
        </div>

        <ResponsiveFilters title="Filters & Search" className="mb-6">
          <TableFilters
            searchValue={documentFilter}
            searchPlaceholder="Search by title, description, category..."
            onSearchChange={(e) => setDocumentFilter(e.target.value)}
            showSelect={false}
          />
          <BranchFilter
            value={currentBranchId || ''}
            onChange={(value) => {
              console.log('Branch changed in Documents:', value);
            }}
          />
        </ResponsiveFilters>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Document Records</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {filteredDocuments.length} records</p>
          </div>
          <TableList
            data={filteredDocuments}
            columns={columns}
            actions={(document) => [
              <Button
                key="download"
                onClick={() => downloadDocument(document)}
                variant="success"
                icon="download"
                className="text-xs px-2 py-1"
              >
                Download
              </Button>,
              <Button
                key="edit"
                onClick={() => openDocumentModal(document)}
                variant="info"
                icon="edit"
                className="text-xs px-2 py-1"
              >
                Edit
              </Button>,
              <Button
                key="delete"
                onClick={() => deleteDocument(document._id)}
                variant="danger"
                icon="delete"
                className="text-xs px-2 py-1"
              >
                Delete
              </Button>
            ]}
            renderDetail={(document) => (
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Title:</span>
                      <span className="text-gray-900 font-medium">{document.title}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Category:</span>
                      <span className="flex items-center">
                        <span className="mr-1">{getCategoryIcon(document.category)}</span>
                        <span className="text-gray-900 font-medium capitalize">{document.category.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">File Name:</span>
                      <span className="text-gray-900 font-medium">{document.fileName}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Uploaded By:</span>
                      <span className="text-gray-900 font-medium">{document.uploadedBy}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">File Type:</span>
                      <span className="flex items-center">
                        <span className="mr-1">{getFileTypeIcon(document.fileType)}</span>
                        <span className="text-gray-900 font-medium uppercase">{document.fileType}</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">File Size:</span>
                      <span className="text-gray-900 font-medium">{document.fileSize}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Version:</span>
                      <span className="text-gray-900 font-medium">{document.version}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Downloads:</span>
                      <span className="text-purple-600 font-medium">{document.downloadCount}</span>
                    </div>
                  </div>
                </div>
                
                {/* Document Details */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Document Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{document.fileSize}</div>
                      <div className="text-xs text-gray-600">File Size</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{document.downloadCount}</div>
                      <div className="text-xs text-gray-600">Downloads</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{document.version}</div>
                      <div className="text-xs text-gray-600">Version</div>
                    </div>
                    <div className="text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                        {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                      </span>
                      <div className="text-xs text-gray-600 mt-1">Status</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Upload Date:</span>
                      <span className="font-medium">{new Date(document.uploadDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Modified:</span>
                      <span className="font-medium">{new Date(document.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {document.description && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-1">Description</h4>
                      <p className="text-gray-700 text-sm">{document.description}</p>
                    </div>
                  )}
                  
                  {document.remarks && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-1">Remarks</h4>
                      <p className="text-gray-700 text-sm">{document.remarks}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          />
        </div>

        {/* Mobile Table View */}
        <div className="lg:hidden bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Document Records</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {filteredDocuments.length} records</p>
          </div>
          
          <div className="p-4">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by uploading a new document.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map((document) => (
                  <div key={document._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="bg-white p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedDocument(expandedDocument === document._id ? null : document._id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{document.title}</div>
                          <div className="text-sm text-gray-600">{document.fileName}</div>
                          <div className="text-xs text-gray-500">
                            {document.fileSize} • {document.uploadedBy} • {new Date(document.uploadDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadDocument(document);
                            }}
                            variant="success"
                            icon="download"
                            className="text-xs px-2 py-1"
                          >
                            Download
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDocumentModal(document);
                            }}
                            variant="info"
                            icon="edit"
                            className="text-xs px-2 py-1"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDocument(document._id);
                            }}
                            variant="danger"
                            icon="delete"
                            className="text-xs px-2 py-1"
                          >
                            Delete
                          </Button>
                          <svg 
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              expandedDocument === document._id ? 'rotate-180' : ''
                            }`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {expandedDocument === document._id && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Category:</span>
                            <span className="ml-1 font-medium text-gray-900 capitalize">{document.category.replace('_', ' ')}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">File Type:</span>
                            <span className="ml-1 font-medium text-gray-900 uppercase">{document.fileType}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Version:</span>
                            <span className="ml-1 font-medium text-gray-900">{document.version}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Downloads:</span>
                            <span className="ml-1 font-medium text-purple-600">{document.downloadCount}</span>
                          </div>
                        </div>
                        {document.description && (
                          <div className="p-3 bg-white rounded-lg border border-gray-200 mb-3">
                            <h5 className="text-sm font-semibold text-gray-800 mb-1">Description</h5>
                            <p className="text-gray-700 text-sm">{document.description}</p>
                          </div>
                        )}
                        {document.remarks && (
                          <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <h5 className="text-sm font-semibold text-gray-800 mb-1">Remarks</h5>
                            <p className="text-gray-700 text-sm">{document.remarks}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Modal */}
      <DialogBox
        show={showDocumentModal}
        onClose={closeDocumentModal}
        title={editingDocument ? 'Edit Document' : 'Upload New Document'}
        size="lg"
      >
        <form onSubmit={saveDocument} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Document Title"
              name="title"
              value={documentForm.title}
              onChange={handleDocumentFormChange}
              required
              icon="file-text"
            />
            <FormSelect
              label="Category"
              name="category"
              value={documentForm.category}
              onChange={handleDocumentFormChange}
              options={[
                { value: 'invoice', label: 'Invoice' },
                { value: 'quality_report', label: 'Quality Report' },
                { value: 'contract', label: 'Contract' },
                { value: 'license', label: 'License' },
                { value: 'manual', label: 'Manual' },
                { value: 'other', label: 'Other' }
              ]}
              icon="folder"
            />
            <FormSelect
              label="File Type"
              name="fileType"
              value={documentForm.fileType}
              onChange={handleDocumentFormChange}
              options={[
                { value: 'pdf', label: 'PDF' },
                { value: 'doc', label: 'DOC' },
                { value: 'xls', label: 'XLS' },
                { value: 'jpg', label: 'JPG' },
                { value: 'png', label: 'PNG' }
              ]}
              icon="file"
            />
            <FormInput
              label="Version"
              name="version"
              value={documentForm.version}
              onChange={handleDocumentFormChange}
              required
              icon="hash"
            />
            <FormInput
              label="Upload Date"
              name="uploadDate"
              type="date"
              value={documentForm.uploadDate}
              onChange={handleDocumentFormChange}
              required
              icon="calendar"
            />
            <FormInput
              label="Uploaded By"
              name="uploadedBy"
              value={documentForm.uploadedBy}
              onChange={handleDocumentFormChange}
              required
              icon="user"
            />
            <FormSelect
              label="Status"
              name="status"
              value={documentForm.status}
              onChange={handleDocumentFormChange}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'archived', label: 'Archived' },
                { value: 'deleted', label: 'Deleted' }
              ]}
              icon="check-circle"
            />
          </div>
          <FormInput
            label="Description"
            name="description"
            value={documentForm.description}
            onChange={handleDocumentFormChange}
            icon="note"
          />
          <FormInput
            label="Remarks"
            name="remarks"
            value={documentForm.remarks}
            onChange={handleDocumentFormChange}
            icon="note"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={closeDocumentModal} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingDocument ? 'Update Document' : 'Upload Document'}
            </Button>
          </div>
        </form>
      </DialogBox>
    </div>
  );
};

export default DocumentUploads; 