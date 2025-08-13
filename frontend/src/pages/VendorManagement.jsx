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
import FileUpload from '../components/common/FileUpload';
import FileDisplay from '../components/common/FileDisplay';
import vendorService from '../services/vendorService';

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [expandedVendor, setExpandedVendor] = useState(null);
  const { currentBranchId } = useSelector((state) => state.branch);
  const { user } = useSelector((state) => state.auth);

  const initialVendorForm = {
    vendorCode: '',
    vendorName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    panNumber: '',
    vendorType: 'supplier',
    creditLimit: 0,
    paymentTerms: '30_days',
    rating: 5,
    status: 'active',
    remarks: ''
  };

  const [vendorForm, setVendorForm] = useState(initialVendorForm);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchVendorData();
  }, [currentBranchId]);

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchVendorData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await vendorService.getAllVendors({
        branch_id: currentBranchId,
        page: 1,
        limit: 100
      });
      
      if (response.success) {
        const formattedVendors = response.data.map(vendorService.formatVendorResponse);
        setVendors(formattedVendors);
      } else {
        throw new Error(response.message || 'Failed to fetch vendor data');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch vendor data');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const openVendorModal = (vendor = null) => {
    setEditingVendor(vendor);
    if (vendor) {
      const formData = {
        ...initialVendorForm,
        ...vendor
      };
      setVendorForm(formData);
    } else {
      setVendorForm(initialVendorForm);
    }
    setShowVendorModal(true);
  };

  const closeVendorModal = () => {
    setShowVendorModal(false);
    setEditingVendor(null);
    setVendorForm(initialVendorForm);
    setSelectedFiles([]);
    setUploadedFiles([]);
  };

  const handleVendorFormChange = (e) => {
    const { name, value } = e.target;
    setVendorForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilesChange = (files) => {
    setSelectedFiles(files);
  };

  const handleFileUploadSuccess = (uploadedFiles) => {
    setUploadedFiles(uploadedFiles);
    setSelectedFiles([]); // Clear selected files after upload
  };

  const saveVendor = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formattedVendor = vendorService.formatVendorData(vendorForm);
      
      if (editingVendor) {
        const response = await vendorService.updateVendor(editingVendor.id, formattedVendor, uploadedFiles);
        if (response.success) {
          setSuccessMessage('Vendor updated successfully!');
          fetchVendorData();
          closeVendorModal();
        } else {
          setError(response.message || 'Failed to update vendor');
        }
      } else {
        const response = await vendorService.createVendor(formattedVendor, uploadedFiles);
        if (response.success) {
          setSuccessMessage('Vendor created successfully!');
          fetchVendorData();
          closeVendorModal();
        } else {
          setError(response.message || 'Failed to create vendor');
        }
      }
    } catch (error) {
      setError(error.message || 'Failed to save vendor');
    } finally {
      setLoading(false);
    }
  };

  const deleteVendor = async (vendorId) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        setLoading(true);
        const response = await vendorService.deleteVendor(vendorId);
        if (response.success) {
          setSuccessMessage('Vendor deleted successfully!');
          fetchVendorData();
        } else {
          setError(response.message || 'Failed to delete vendor');
        }
      } catch (error) {
        setError(error.message || 'Failed to delete vendor');
      } finally {
        setLoading(false);
      }
    }
  };



  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-red-600 bg-red-100';
      case 'suspended':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRatingStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getVendorTypeIcon = (type) => {
    switch (type) {
      case 'supplier': return '📦';
      case 'service': return '🔧';
      case 'equipment': return '⚙️';
      default: return '🏢';
    }
  };

  // Define columns for the table
  const columns = [
    { 
      key: "vendorCode", 
      label: "Vendor Code",
      renderCell: (value) => <span className="font-semibold text-blue-600">{value}</span>
    },
    { 
      key: "vendorName", 
      label: "Vendor Name",
      renderCell: (value) => <span className="font-medium text-gray-900">{value}</span>
    },
    { 
      key: "contactPerson", 
      label: "Contact Person",
      renderCell: (value) => <span className="text-gray-700">{value}</span>
    },
    { 
      key: "phone", 
      label: "Phone",
      renderCell: (value) => <span className="text-gray-700">{value}</span>
    },
    { 
      key: "vendorType", 
      label: "Type",
      renderCell: (value) => (
        <span className="flex items-center">
          <span className="mr-1">{getVendorTypeIcon(value)}</span>
          <span className="capitalize">{value}</span>
        </span>
      )
    },
    { 
      key: "rating", 
      label: "Rating",
      renderCell: (value) => (
        <span className="text-yellow-500 text-sm">{getRatingStars(value)}</span>
      )
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

  const filteredVendors = vendors.filter(vendor => {
    const q = vendorFilter.toLowerCase();
    return (
      vendor.vendorCode?.toLowerCase().includes(q) ||
      vendor.vendorName?.toLowerCase().includes(q) ||
      vendor.contactPerson?.toLowerCase().includes(q) ||
      vendor.vendorType?.toLowerCase().includes(q) ||
      vendor.status?.toLowerCase().includes(q) ||
      vendor.city?.toLowerCase().includes(q)
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
              Vendor Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage suppliers and vendor relationships</p>
          </div>
          <div className="flex justify-center sm:justify-start space-x-2">
            {/* Only show Add button when a specific branch is selected (not "All Branches") */}
            {((user?.isSuperAdmin && currentBranchId && currentBranchId !== 'all') || 
              (!user?.isSuperAdmin && user?.branch?.id)) && (
              <Button
                onClick={() => openVendorModal()}
                variant="success"
                className="px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                🏢 Add New Vendor
              </Button>
            )}
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

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-700 font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 text-lg">🏢</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Vendors</p>
                <p className="text-xl font-bold text-gray-900">{vendors.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-green-600 text-lg">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Vendors</p>
                <p className="text-xl font-bold text-gray-900">{vendors.filter(v => v.status === 'active').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-purple-600 text-lg">💰</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Outstanding</p>
                <p className="text-xl font-bold text-gray-900">
                  ₹{vendors.reduce((sum, v) => sum + (v.outstandingBalance || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-yellow-600 text-lg">⭐</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-xl font-bold text-gray-900">
                  {vendors.length > 0 ? (vendors.reduce((sum, v) => sum + (v.rating || 0), 0) / vendors.length).toFixed(1) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-emerald-600 text-lg">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Credit Limit</p>
                <p className="text-xl font-bold text-gray-900">
                  ₹{vendors.reduce((sum, v) => sum + (v.creditLimit || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-orange-600 text-lg">⚠️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vendors with Due</p>
                <p className="text-xl font-bold text-gray-900">
                  {vendors.filter(v => (v.outstandingBalance || 0) > 0).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-red-600 text-lg">🚨</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Critical Status</p>
                <p className="text-xl font-bold text-gray-900">
                  {vendors.filter(v => vendorService.getPaymentStatus(v) === 'critical').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <ResponsiveFilters title="Filters & Search" className="mb-6">
          <TableFilters
            searchValue={vendorFilter}
            searchPlaceholder="Search by vendor code, name, contact..."
            onSearchChange={(e) => setVendorFilter(e.target.value)}
            showSelect={false}
          />
          <BranchFilter
            value={currentBranchId || ''}
            onChange={(value) => {
              console.log('Branch changed in Vendor:', value);
            }}
          />
        </ResponsiveFilters>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Vendor Records</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {filteredVendors.length} records</p>
          </div>
          <TableList
            data={filteredVendors}
            columns={columns}
            actions={(vendor) => [
              <Button
                key="edit"
                onClick={() => openVendorModal(vendor)}
                variant="info"
                icon="edit"
                className="text-xs px-2 py-1"
              >
                Edit
              </Button>,
              <Button
                key="delete"
                onClick={() => deleteVendor(vendor._id)}
                variant="danger"
                icon="delete"
                className="text-xs px-2 py-1"
              >
                Delete
              </Button>
            ]}
            renderDetail={(vendor) => (
              <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-l-4 border-purple-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Vendor Code:</span>
                      <span className="text-gray-900 font-medium">{vendor.vendorCode}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Vendor Name:</span>
                      <span className="text-gray-900 font-medium">{vendor.vendorName}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Contact Person:</span>
                      <span className="text-gray-900 font-medium">{vendor.contactPerson}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Phone:</span>
                      <span className="text-gray-900 font-medium">{vendor.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Email:</span>
                      <span className="text-gray-900 font-medium">{vendor.email}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Address:</span>
                      <span className="text-gray-900 font-medium">{vendor.address}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">City:</span>
                      <span className="text-gray-900 font-medium">{vendor.city}, {vendor.state}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Pincode:</span>
                      <span className="text-gray-900 font-medium">{vendor.pincode}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">GST Number:</span>
                      <span className="text-gray-900 font-medium">{vendor.gstNumber}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">PAN Number:</span>
                      <span className="text-gray-900 font-medium">{vendor.panNumber}</span>
                    </div>
                  </div>
                </div>
                
                {/* Business Details */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Business Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">₹{vendor.creditLimit?.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Credit Limit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{vendor.totalOrders || 0}</div>
                      <div className="text-xs text-gray-600">Total Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">₹{vendor.totalAmount?.toLocaleString() || 0}</div>
                      <div className="text-xs text-gray-600">Total Amount</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-600">{getRatingStars(vendor.rating)}</div>
                      <div className="text-xs text-gray-600">Rating</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vendor Type:</span>
                      <span className="font-medium capitalize">{vendor.vendorType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Terms:</span>
                      <span className="font-medium">{vendor.paymentTerms?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Order:</span>
                      <span className="font-medium">{vendor.lastOrderDate ? new Date(vendor.lastOrderDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Financial Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${vendor.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₹{vendor.outstandingBalance?.toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-gray-600">Outstanding</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">₹{vendor.totalPaid?.toLocaleString() || 0}</div>
                      <div className="text-xs text-gray-600">Total Paid</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">
                        {vendor.creditLimit > 0 ? ((vendor.outstandingBalance || 0) / vendor.creditLimit * 100).toFixed(1) : 0}%
                      </div>
                      <div className="text-xs text-gray-600">Credit Used</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${vendorService.getPaymentStatusColor(vendorService.getPaymentStatus(vendor))}`}>
                        {vendorService.getPaymentStatusLabel(vendorService.getPaymentStatus(vendor))}
                      </div>
                      <div className="text-xs text-gray-600">Status</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Payment:</span>
                      <span className="font-medium">
                        {vendor.lastPaymentDate ? new Date(vendor.lastPaymentDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`font-medium px-2 py-1 rounded-full text-xs ${vendorService.getPaymentStatusColor(vendorService.getPaymentStatus(vendor))}`}>
                        {vendorService.getPaymentStatusLabel(vendorService.getPaymentStatus(vendor))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Credit Limit:</span>
                      <span className="font-medium">₹{vendor.creditLimit?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                {vendor.documents && vendor.documents.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Documents</h4>
                    <FileDisplay 
                      files={vendor.documents} 
                      title=""
                      showTitle={false}
                    />
                  </div>
                )}
                
                {vendor.remarks && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Remarks</h4>
                    <p className="text-gray-700 text-sm">{vendor.remarks}</p>
                  </div>
                )}
              </div>
            )}
          />
        </div>

        {/* Mobile Table View */}
        <div className="lg:hidden bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Vendor Records</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {filteredVendors.length} records</p>
          </div>
          
          <div className="p-4">
            {filteredVendors.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No vendor records</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new vendor record.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredVendors.map((vendor) => (
                  <div key={vendor._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="bg-white p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedVendor(expandedVendor === vendor._id ? null : vendor._id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-blue-600">{vendor.vendorCode}</div>
                          <div className="text-sm text-gray-600">{vendor.vendorName}</div>
                          <div className="text-xs text-gray-500">
                            {vendor.contactPerson} • {vendor.phone} • {vendor.city}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openVendorModal(vendor);
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
                              deleteVendor(vendor._id);
                            }}
                            variant="danger"
                            icon="delete"
                            className="text-xs px-2 py-1"
                          >
                            Delete
                          </Button>
                          <svg 
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              expandedVendor === vendor._id ? 'rotate-180' : ''
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

                    {expandedVendor === vendor._id && (
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Contact Person:</span>
                            <span className="ml-1 font-medium text-gray-900">{vendor.contactPerson}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Phone:</span>
                            <span className="ml-1 font-medium text-gray-900">{vendor.phone}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Email:</span>
                            <span className="ml-1 font-medium text-gray-900">{vendor.email}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">City:</span>
                            <span className="ml-1 font-medium text-gray-900">{vendor.city}, {vendor.state}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">GST Number:</span>
                            <span className="ml-1 font-medium text-gray-900">{vendor.gstNumber}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Rating:</span>
                            <span className="ml-1 font-medium text-yellow-500">{getRatingStars(vendor.rating)}</span>
                          </div>
                        </div>
                        {vendor.remarks && (
                          <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <h5 className="text-sm font-semibold text-gray-800 mb-1">Remarks</h5>
                            <p className="text-gray-700 text-sm">{vendor.remarks}</p>
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

      {/* Vendor Modal */}
      <DialogBox
        show={showVendorModal}
        onClose={closeVendorModal}
        title={editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
        size="2xl"
      >
        <form onSubmit={saveVendor} className="space-y-4" key={editingVendor ? 'edit' : 'add'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Vendor Code"
              name="vendorCode"
              value={vendorForm.vendorCode || ''}
              onChange={handleVendorFormChange}
              required
              icon="hash"
            />
            <FormInput
              label="Vendor Name"
              name="vendorName"
              value={vendorForm.vendorName || ''}
              onChange={handleVendorFormChange}
              required
              icon="building"
            />
            <FormInput
              label="Contact Person"
              name="contactPerson"
              value={vendorForm.contactPerson || ''}
              onChange={handleVendorFormChange}
              required
              icon="user"
            />
            <FormInput
              label="Phone"
              name="phone"
              value={vendorForm.phone}
              onChange={handleVendorFormChange}
              required
              icon="phone"
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={vendorForm.email}
              onChange={handleVendorFormChange}
              required
              icon="mail"
            />
            <FormInput
              label="GST Number"
              name="gstNumber"
              value={vendorForm.gstNumber}
              onChange={handleVendorFormChange}
              required
              icon="file-text"
            />
            <FormInput
              label="PAN Number"
              name="panNumber"
              value={vendorForm.panNumber}
              onChange={handleVendorFormChange}
              required
              icon="credit-card"
            />
            <FormInput
              label="Credit Limit (₹)"
              name="creditLimit"
              type="number"
              value={vendorForm.creditLimit}
              onChange={handleVendorFormChange}
              required
              icon="dollar-sign"
            />
            <FormSelect
              label="Vendor Type"
              name="vendorType"
              value={vendorForm.vendorType}
              onChange={handleVendorFormChange}
              options={vendorService.getVendorOptions()}
              icon="package"
            />
            <FormSelect
              label="Payment Terms"
              name="paymentTerms"
              value={vendorForm.paymentTerms}
              onChange={handleVendorFormChange}
              options={vendorService.getPaymentTermsOptions()}
              icon="calendar"
            />
            <FormSelect
              label="Rating"
              name="rating"
              value={vendorForm.rating}
              onChange={handleVendorFormChange}
              options={vendorService.getRatingOptions()}
              icon="star"
            />
            <FormSelect
              label="Status"
              name="status"
              value={vendorForm.status}
              onChange={handleVendorFormChange}
              options={vendorService.getStatusOptions()}
              icon="check-circle"
            />
            <FormInput
              label="City"
              name="city"
              value={vendorForm.city}
              onChange={handleVendorFormChange}
              required
              icon="map-pin"
            />
            <FormInput
              label="State"
              name="state"
              value={vendorForm.state}
              onChange={handleVendorFormChange}
              required
              icon="map"
            />
            <FormInput
              label="Pincode"
              name="pincode"
              value={vendorForm.pincode}
              onChange={handleVendorFormChange}
              required
              icon="hash"
            />
          </div>
          <FormInput
            label="Address"
            name="address"
            value={vendorForm.address}
            onChange={handleVendorFormChange}
            required
            icon="map-pin"
          />
          <FormInput
            label="Remarks"
            name="remarks"
            value={vendorForm.remarks}
            onChange={handleVendorFormChange}
            icon="note"
          />
          
          {/* File Upload Section */}
          <FileUpload
            label="Upload Vendor Documents"
            module="vendor"
            onFilesChange={handleFilesChange}
            onUploadSuccess={handleFileUploadSuccess}
            files={selectedFiles}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            maxFiles={10}
            maxSize={10}
            showPreview={true}
            disableAutoUpload={false}
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={closeVendorModal} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingVendor ? 'Update Vendor' : 'Create Vendor'}
            </Button>
          </div>
        </form>
      </DialogBox>
    </div>
  );
};

export default VendorManagement; 