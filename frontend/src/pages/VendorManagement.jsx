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

  useEffect(() => {
    fetchVendorData();
  }, [currentBranchId]);

  const fetchVendorData = async () => {
    setLoading(true);
    setError('');
    try {
      // Simulate API call - replace with actual service
      const mockVendors = [
        {
          _id: '1',
          vendorCode: 'V001',
          vendorName: 'ABC Rice Suppliers',
          contactPerson: 'Rajesh Kumar',
          phone: '+91 9876543210',
          email: 'rajesh@abcrice.com',
          address: '123 Rice Market, Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          gstNumber: '27ABCDE1234F1Z5',
          panNumber: 'ABCDE1234F',
          vendorType: 'supplier',
          creditLimit: 500000,
          paymentTerms: '30_days',
          rating: 4,
          status: 'active',
          remarks: 'Reliable supplier with good quality rice',
          totalOrders: 45,
          totalAmount: 2500000,
          lastOrderDate: '2024-01-15',
          createdAt: '2023-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        {
          _id: '2',
          vendorCode: 'V002',
          vendorName: 'XYZ Grain Traders',
          contactPerson: 'Priya Sharma',
          phone: '+91 8765432109',
          email: 'priya@xyzgrains.com',
          address: '456 Grain Market, Industrial Area',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          gstNumber: '07FGHIJ5678G2Z6',
          panNumber: 'FGHIJ5678G',
          vendorType: 'supplier',
          creditLimit: 300000,
          paymentTerms: '15_days',
          rating: 3,
          status: 'active',
          remarks: 'Good prices but sometimes delayed delivery',
          totalOrders: 28,
          totalAmount: 1200000,
          lastOrderDate: '2024-01-10',
          createdAt: '2023-03-20T11:00:00Z',
          updatedAt: '2024-01-10T11:15:00Z'
        }
      ];
      setVendors(mockVendors);
    } catch (err) {
      setError(err.message || 'Failed to fetch vendor data');
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

  const saveVendor = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Simulate API call - replace with actual service
      if (editingVendor) {
        // Update existing vendor
        setVendors(prev => prev.map(vendor => 
          vendor._id === editingVendor._id ? { ...vendorForm, _id: vendor._id } : vendor
        ));
      } else {
        // Create new vendor
        const newVendor = {
          ...vendorForm,
          _id: Date.now().toString(),
          totalOrders: 0,
          totalAmount: 0,
          lastOrderDate: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setVendors(prev => [newVendor, ...prev]);
      }
      closeVendorModal();
    } catch (error) {
      setError('Error saving vendor: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteVendor = async (vendorId) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        setLoading(true);
        // Simulate API call - replace with actual service
        setVendors(prev => prev.filter(vendor => vendor._id !== vendorId));
      } catch (error) {
        setError('Error deleting vendor: ' + error.message);
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                <span className="text-purple-600 text-lg">📦</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Suppliers</p>
                <p className="text-xl font-bold text-gray-900">{vendors.filter(v => v.vendorType === 'supplier').length}</p>
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
                  {(vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length).toFixed(1)}
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
                  
                  {vendor.remarks && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-1">Remarks</h4>
                      <p className="text-gray-700 text-sm">{vendor.remarks}</p>
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
              options={[
                { value: 'supplier', label: 'Supplier' },
                { value: 'service', label: 'Service Provider' },
                { value: 'equipment', label: 'Equipment Supplier' }
              ]}
              icon="package"
            />
            <FormSelect
              label="Payment Terms"
              name="paymentTerms"
              value={vendorForm.paymentTerms}
              onChange={handleVendorFormChange}
              options={[
                { value: 'immediate', label: 'Immediate' },
                { value: '7_days', label: '7 Days' },
                { value: '15_days', label: '15 Days' },
                { value: '30_days', label: '30 Days' },
                { value: '45_days', label: '45 Days' }
              ]}
              icon="calendar"
            />
            <FormSelect
              label="Rating"
              name="rating"
              value={vendorForm.rating}
              onChange={handleVendorFormChange}
              options={[
                { value: 1, label: '1 Star' },
                { value: 2, label: '2 Stars' },
                { value: 3, label: '3 Stars' },
                { value: 4, label: '4 Stars' },
                { value: 5, label: '5 Stars' }
              ]}
              icon="star"
            />
            <FormSelect
              label="Status"
              name="status"
              value={vendorForm.status}
              onChange={handleVendorFormChange}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'suspended', label: 'Suspended' }
              ]}
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
            files={selectedFiles}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            maxFiles={10}
            maxSize={10}
            showPreview={true}
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