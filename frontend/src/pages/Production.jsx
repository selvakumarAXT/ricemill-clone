import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import productionService from '../services/productionService';
import TableFilters from '../components/common/TableFilters';
import BranchFilter from '../components/common/BranchFilter';
import ResponsiveFilters from '../components/common/ResponsiveFilters';
import TableList from '../components/common/TableList';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DialogBox from '../components/common/DialogBox';
import FormInput from '../components/common/FormInput';
import FormSelect from '../components/common/FormSelect';
import FileUpload from '../components/common/FileUpload';

const Production = () => {
  const [production, setProduction] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [productionFilter, setProductionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [qualityFilter, setQualityFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [expandedProduction, setExpandedProduction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduction, setEditingProduction] = useState(null);
  const [productionForm, setProductionForm] = useState({
    name: '',
    description: '',
    quantity: '',
    unit: 'kg',
    productionDate: new Date().toISOString().split('T')[0],
    quality: 'Good',
    status: 'Completed',
    batchNumber: '',
    operator: '',
    notes: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const { currentBranchId } = useSelector((state) => state.branch);
  const { user } = useSelector((state) => state.auth);

  const units = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'tons', label: 'Tons' },
    { value: 'bags', label: 'Bags' },
    { value: 'quintals', label: 'Quintals' },
    { value: 'pieces', label: 'Pieces' }
  ];

  const qualities = [
    { value: 'Excellent', label: 'Excellent' },
    { value: 'Good', label: 'Good' },
    { value: 'Average', label: 'Average' },
    { value: 'Poor', label: 'Poor' }
  ];

  const statuses = [
    { value: 'Pending', label: 'Pending' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    fetchProduction();
    // eslint-disable-next-line
  }, [currentBranchId]);

  const fetchProduction = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await productionService.getAllProduction(currentBranchId);
      setProduction(res.items || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch production records');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setProductionForm({ ...productionForm, [e.target.name]: e.target.value });
  };

  const handleFilesChange = (files) => {
    setSelectedFiles(files);
  };

  const saveProduction = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formData = {
        ...productionForm,
        documents: uploadedFiles.map(file => file.url || file.path)
      };

      if (editingProduction) {
        await productionService.updateProduction(editingProduction._id || editingProduction.id, formData);
        setSuccess('Production record updated successfully');
      } else {
        await productionService.createProduction(formData);
        setSuccess('Production record created successfully');
      }
      fetchProduction();
      closeModal();
    } catch (error) {
      setError(error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduction = async (productionId) => {
    if (!confirm('Are you sure you want to delete this production record? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await productionService.deleteProduction(productionId);
      setSuccess('Production record deleted successfully');
      fetchProduction();
    } catch (error) {
      setError(error.message || 'Failed to delete production record');
    } finally {
      setLoading(false);
    }
  };

  const openProductionModal = (editProduction = null) => {
    if (editProduction) {
      setEditingProduction(editProduction);
      setProductionForm({
        name: editProduction.name || '',
        description: editProduction.description || '',
        quantity: editProduction.quantity || '',
        unit: editProduction.unit || 'kg',
        productionDate: editProduction.productionDate ? new Date(editProduction.productionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        quality: editProduction.quality || 'Good',
        status: editProduction.status || 'Completed',
        batchNumber: editProduction.batchNumber || '',
        operator: editProduction.operator || '',
        notes: editProduction.notes || ''
      });
      setUploadedFiles(editProduction.documents || []);
    } else {
      setEditingProduction(null);
      setProductionForm({
        name: '',
        description: '',
        quantity: '',
        unit: 'kg',
        productionDate: new Date().toISOString().split('T')[0],
        quality: 'Good',
        status: 'Completed',
        batchNumber: '',
        operator: '',
        notes: ''
      });
      setUploadedFiles([]);
    }
    setSelectedFiles([]);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduction(null);
    setProductionForm({
      name: '',
      description: '',
      quantity: '',
      unit: 'kg',
      productionDate: new Date().toISOString().split('T')[0],
      quality: 'Good',
      status: 'Completed',
      batchNumber: '',
      operator: '',
      notes: ''
    });
    setUploadedFiles([]);
    setSelectedFiles([]);
  };

  const filteredProduction = production.filter(item => {
    const q = productionFilter.toLowerCase();
    const matchesText = !productionFilter || (
      item.name?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.batchNumber?.toLowerCase().includes(q) ||
      item.operator?.toLowerCase().includes(q)
    );
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesQuality = qualityFilter ? item.quality === qualityFilter : true;
    return matchesText && matchesStatus && matchesQuality;
  });

  const renderFilePreview = (files) => {
    if (!files || files.length === 0) return null;

    return (
      <div className="mt-4">
        <h5 className="text-sm font-semibold text-gray-800 mb-2">Attached Documents</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {files.map((file, index) => (
            <div key={index} className="relative">
              {file.mimetype?.startsWith('image/') ? (
                <img
                  src={`http://localhost:3001${file.url}`}
                  alt={file.originalName}
                  className="w-full h-20 object-cover rounded border"
                />
              ) : (
                <div className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center">
                  <span className="text-2xl">📄</span>
                </div>
              )}
              <div className="absolute top-1 right-1">
                <a
                  href={`http://localhost:3001${file.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 text-white p-1 rounded text-xs hover:bg-blue-600"
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading && production.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-6 sm:px-6">
        <div className="flex flex-col space-y-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Production Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Monitor and manage rice production processes
            </p>
          </div>
          
          {/* Add Production Button */}
          <div className="flex justify-center sm:justify-start">
            <Button
              onClick={() => openProductionModal()}
              variant="primary"
              icon="add"
              className="w-full sm:w-auto"
            >
              Add Production Record
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-1 text-sm text-green-700">{success}</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <ResponsiveFilters title="Filters & Search" className="mb-6">
          <TableFilters
            searchValue={productionFilter}
            searchPlaceholder="Search production records..."
            onSearchChange={(e) => setProductionFilter(e.target.value)}
            selectValue={statusFilter}
            selectOptions={statuses}
            onSelectChange={(e) => setStatusFilter(e.target.value)}
            selectPlaceholder="All Statuses"
            showSelect={true}
          />
          <FormSelect
            label="Quality"
            name="qualityFilter"
            value={qualityFilter}
            onChange={(e) => setQualityFilter(e.target.value)}
            className="w-full"
          >
            <option value="">All Qualities</option>
            {qualities.map((quality) => (
              <option key={quality.value} value={quality.value}>
                {quality.label}
              </option>
            ))}
          </FormSelect>
          <BranchFilter
            value={currentBranchId && currentBranchId !== 'all' ? currentBranchId : branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          />
        </ResponsiveFilters>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Production Records</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {filteredProduction.length} records</p>
          </div>
          <TableList
            columns={["Name", "Quantity", "Status", "Quality", "Date", "Branch", "Documents"]}
            data={filteredProduction}
            renderRow={item => [
              <div key="name" className="font-medium text-gray-900">{item.name}</div>,
              <div key="quantity" className="text-gray-600">{item.quantity} {item.unit}</div>,
              <div key="status">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  item.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                  item.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {item.status}
                </span>
              </div>,
              <div key="quality">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  item.quality === 'Excellent' ? 'bg-green-100 text-green-800' :
                  item.quality === 'Good' ? 'bg-blue-100 text-blue-800' :
                  item.quality === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {item.quality}
                </span>
              </div>,
              <div key="date" className="text-gray-600">
                {new Date(item.productionDate).toLocaleDateString()}
              </div>,
              <div key="branch" className="text-gray-600">
                {item.branch_id?.name || item.branch?.name || 'N/A'}
              </div>,
              <div key="documents" className="text-gray-600">
                {item.documents && item.documents.length > 0 ? (
                  <span className="text-blue-600 font-medium">{item.documents.length} files</span>
                ) : (
                  <span className="text-gray-400">No files</span>
                )}
              </div>
            ]}
            actions={item => [
              <Button
                key="edit"
                onClick={() => openProductionModal(item)}
                variant="info"
                icon="edit"
                className="text-xs"
              >
                Edit
              </Button>,
              <Button
                key="delete"
                onClick={() => deleteProduction(item._id || item.id)}
                variant="danger"
                icon="delete"
                className="text-xs"
              >
                Delete
              </Button>
            ]}
            renderDetail={item => (
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Name:</span>
                      <span className="text-gray-900 font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Quantity:</span>
                      <span className="text-gray-900 font-medium">{item.quantity} {item.unit}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        item.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        item.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Quality:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.quality === 'Excellent' ? 'bg-green-100 text-green-800' :
                        item.quality === 'Good' ? 'bg-blue-100 text-blue-800' :
                        item.quality === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.quality}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Branch:</span>
                      <span className="text-gray-900 font-medium">{item.branch_id?.name || item.branch?.name || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Batch Number:</span> {item.batchNumber || 'N/A'}</div>
                        <div><span className="font-medium">Operator:</span> {item.operator || 'N/A'}</div>
                        <div><span className="font-medium">Date:</span> {new Date(item.productionDate).toLocaleDateString()}</div>
                        <div><span className="font-medium">Description:</span> {item.description || 'N/A'}</div>
                        {item.notes && (
                          <div><span className="font-medium">Notes:</span> {item.notes}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {renderFilePreview(item.documents)}
              </div>
            )}
          />
        </div>

        {/* Mobile Table View */}
        <div className="lg:hidden bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Production Records</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {filteredProduction.length} records</p>
          </div>
          
          <div className="p-4">
            {filteredProduction.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No production records</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new production record.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProduction.map((item) => (
                  <div key={item._id || item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Mobile Table Row */}
                    <div 
                      className="bg-white p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedProduction(expandedProduction === (item._id || item.id) ? null : (item._id || item.id))}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-600">{item.quantity} {item.unit}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(item.productionDate).toLocaleDateString()} • {item.branch_id?.name || item.branch?.name || 'N/A'}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            item.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            item.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.status}
                          </span>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openProductionModal(item);
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
                              deleteProduction(item._id || item.id);
                            }}
                            variant="danger"
                            icon="delete"
                            className="text-xs px-2 py-1"
                          >
                            Delete
                          </Button>
                          <svg 
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              expandedProduction === (item._id || item.id) ? 'rotate-180' : ''
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

                    {/* Expanded Detail View */}
                    {expandedProduction === (item._id || item.id) && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Quality:</span>
                            <span className={`ml-1 px-2 py-1 text-xs font-medium rounded-full ${
                              item.quality === 'Excellent' ? 'bg-green-100 text-green-800' :
                              item.quality === 'Good' ? 'bg-blue-100 text-blue-800' :
                              item.quality === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.quality}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Batch:</span>
                            <span className="ml-1 font-medium text-gray-900">{item.batchNumber || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Operator:</span>
                            <span className="ml-1 font-medium text-gray-900">{item.operator || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Documents:</span>
                            <span className="ml-1 font-medium text-gray-900">
                              {item.documents && item.documents.length > 0 ? `${item.documents.length} files` : 'No files'}
                            </span>
                          </div>
                        </div>

                        {item.description && (
                          <div className="p-3 bg-white rounded-lg border border-gray-200 w-full mb-3">
                            <h5 className="text-sm font-semibold text-gray-800 mb-2">Description</h5>
                            <p className="text-gray-700 text-sm">{item.description}</p>
                          </div>
                        )}

                        {item.notes && (
                          <div className="p-3 bg-white rounded-lg border border-gray-200 w-full mb-3">
                            <h5 className="text-sm font-semibold text-gray-800 mb-2">Notes</h5>
                            <p className="text-gray-700 text-sm">{item.notes}</p>
                          </div>
                        )}

                        {renderFilePreview(item.documents)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Production Modal */}
      {showModal && (
        <DialogBox
          show={showModal}
          onClose={closeModal}
          onSubmit={saveProduction}
          title={editingProduction ? "Edit Production Record" : "Add Production Record"}
          submitText={editingProduction ? "Update" : "Create"}
          cancelText="Cancel"
          error={error}
          success={success}
        >
          <form onSubmit={saveProduction} className="space-y-4">
            <FormInput
              label="Production Name"
              name="name"
              value={productionForm.name}
              onChange={handleFormChange}
              required
              icon="factory"
            />
            <FormInput
              label="Description"
              name="description"
              value={productionForm.description}
              onChange={handleFormChange}
              icon="info"
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Quantity"
                name="quantity"
                type="number"
                value={productionForm.quantity}
                onChange={handleFormChange}
                required
                icon="scale"
              />
              <FormSelect
                label="Unit"
                name="unit"
                value={productionForm.unit}
                onChange={handleFormChange}
                required
              >
                {units.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </FormSelect>
            </div>
            <FormInput
              label="Production Date"
              name="productionDate"
              type="date"
              value={productionForm.productionDate}
              onChange={handleFormChange}
              required
              icon="calendar"
            />
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Quality"
                name="quality"
                value={productionForm.quality}
                onChange={handleFormChange}
                required
              >
                {qualities.map((quality) => (
                  <option key={quality.value} value={quality.value}>
                    {quality.label}
                  </option>
                ))}
              </FormSelect>
              <FormSelect
                label="Status"
                name="status"
                value={productionForm.status}
                onChange={handleFormChange}
                required
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </FormSelect>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Batch Number"
                name="batchNumber"
                value={productionForm.batchNumber}
                onChange={handleFormChange}
                icon="tag"
              />
              <FormInput
                label="Operator"
                name="operator"
                value={productionForm.operator}
                onChange={handleFormChange}
                icon="user"
              />
            </div>
            <FormInput
              label="Notes"
              name="notes"
              value={productionForm.notes}
              onChange={handleFormChange}
              icon="note"
            />
            
            {/* File Upload Section */}
            <FileUpload
              label="Upload Documents & Images"
              module="production"
              onFilesChange={handleFilesChange}
              files={selectedFiles}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
              maxFiles={10}
              maxSize={10}
              showPreview={true}
            />
            
            {/* Show existing uploaded files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Existing Documents</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      {file.mimetype?.startsWith('image/') ? (
                        <img
                          src={`http://localhost:3001${file.url}`}
                          alt={file.originalName}
                          className="w-full h-20 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center">
                          <span className="text-2xl">📄</span>
                        </div>
                      )}
                      <div className="absolute top-1 right-1">
                        <a
                          href={`http://localhost:3001${file.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-500 text-white p-1 rounded text-xs hover:bg-blue-600"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </DialogBox>
      )}
    </div>
  );
};

export default Production; 