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

const EBMeterCalculation = () => {
  const [meterReadings, setMeterReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meterFilter, setMeterFilter] = useState('');
  const [showMeterModal, setShowMeterModal] = useState(false);
  const [editingMeter, setEditingMeter] = useState(null);
  const [expandedMeter, setExpandedMeter] = useState(null);
  const { currentBranchId } = useSelector((state) => state.branch);

  const initialMeterForm = {
    readingDate: '',
    meterNumber: '',
    previousReading: 0,
    currentReading: 0,
    unitsConsumed: 0,
    ratePerUnit: 0,
    totalAmount: 0,
    billNumber: '',
    paymentStatus: 'pending',
    dueDate: '',
    remarks: ''
  };

  const [meterForm, setMeterForm] = useState(initialMeterForm);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    fetchMeterData();
  }, [currentBranchId]);

  const fetchMeterData = async () => {
    setLoading(true);
    setError('');
    try {
      // Simulate API call - replace with actual service
      const mockMeterReadings = [
        {
          _id: '1',
          readingDate: '2024-01-15',
          meterNumber: 'EB001',
          previousReading: 1250,
          currentReading: 1350,
          unitsConsumed: 100,
          ratePerUnit: 8.5,
          totalAmount: 850,
          billNumber: 'EB-2024-001',
          paymentStatus: 'paid',
          dueDate: '2024-02-15',
          remarks: 'Normal consumption',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        {
          _id: '2',
          readingDate: '2024-01-16',
          meterNumber: 'EB002',
          previousReading: 2100,
          currentReading: 2250,
          unitsConsumed: 150,
          ratePerUnit: 8.5,
          totalAmount: 1275,
          billNumber: 'EB-2024-002',
          paymentStatus: 'pending',
          dueDate: '2024-02-16',
          remarks: 'High consumption due to peak season',
          createdAt: '2024-01-16T11:00:00Z',
          updatedAt: '2024-01-16T11:15:00Z'
        }
      ];
      setMeterReadings(mockMeterReadings);
    } catch (err) {
      setError(err.message || 'Failed to fetch meter data');
    } finally {
      setLoading(false);
    }
  };

  const openMeterModal = (meter = null) => {
    setEditingMeter(meter);
    if (meter) {
      // Format dates for HTML date inputs (YYYY-MM-DD)
      const formattedReadingDate = new Date(meter.readingDate).toISOString().split('T')[0];
      const formattedDueDate = new Date(meter.dueDate).toISOString().split('T')[0];
      const formData = {
        ...initialMeterForm,
        ...meter,
        readingDate: formattedReadingDate,
        dueDate: formattedDueDate
      };
      setMeterForm(formData);
    } else {
      setMeterForm(initialMeterForm);
    }
    setShowMeterModal(true);
  };

  const closeMeterModal = () => {
    setShowMeterModal(false);
    setEditingMeter(null);
    setMeterForm(initialMeterForm);
  };

  const handleMeterFormChange = (e) => {
    const { name, value } = e.target;
    setMeterForm(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-calculate units consumed and total amount
      if (name === 'currentReading' || name === 'previousReading') {
        const current = parseFloat(updated.currentReading || 0);
        const previous = parseFloat(updated.previousReading || 0);
        updated.unitsConsumed = Math.max(0, current - previous);
        updated.totalAmount = updated.unitsConsumed * parseFloat(updated.ratePerUnit || 0);
      }
      
      if (name === 'ratePerUnit') {
        const units = parseFloat(updated.unitsConsumed || 0);
        const rate = parseFloat(value || 0);
        updated.totalAmount = units * rate;
      }
      
      return updated;
    });
  };

  const handleFilesChange = (files) => {
    setSelectedFiles(files);
  };

  const saveMeter = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Simulate API call - replace with actual service
      if (editingMeter) {
        // Update existing meter reading
        setMeterReadings(prev => prev.map(meter => 
          meter._id === editingMeter._id ? { ...meterForm, _id: meter._id } : meter
        ));
      } else {
        // Create new meter reading
        const newMeter = {
          ...meterForm,
          _id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setMeterReadings(prev => [newMeter, ...prev]);
      }
      closeMeterModal();
    } catch (error) {
      setError('Error saving meter reading: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteMeter = async (meterId) => {
    if (window.confirm('Are you sure you want to delete this meter reading?')) {
      try {
        setLoading(true);
        // Simulate API call - replace with actual service
        setMeterReadings(prev => prev.filter(meter => meter._id !== meterId));
      } catch (error) {
        setError('Error deleting meter reading: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Calculate summary statistics
  const totalUnits = meterReadings.reduce((sum, meter) => sum + meter.unitsConsumed, 0);
  const totalAmount = meterReadings.reduce((sum, meter) => sum + meter.totalAmount, 0);
  const averageConsumption = meterReadings.length > 0 ? totalUnits / meterReadings.length : 0;
  const pendingBills = meterReadings.filter(meter => meter.paymentStatus === 'pending').length;

  // Define columns for the table
  const columns = [
    { 
      key: "readingDate", 
      label: "Reading Date",
      renderCell: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: "meterNumber", 
      label: "Meter Number",
      renderCell: (value) => <span className="font-semibold text-blue-600">{value}</span>
    },
    { 
      key: "currentReading", 
      label: "Current Reading",
      renderCell: (value) => <span className="font-semibold text-indigo-600">{value.toLocaleString()}</span>
    },
    { 
      key: "unitsConsumed", 
      label: "Units Consumed",
      renderCell: (value) => <span className="font-semibold text-green-600">{value.toLocaleString()}</span>
    },
    { 
      key: "ratePerUnit", 
      label: "Rate/Unit",
      renderCell: (value) => <span className="text-gray-700">₹{value}</span>
    },
    { 
      key: "totalAmount", 
      label: "Total Amount",
      renderCell: (value) => <span className="font-semibold text-purple-600">₹{value.toLocaleString()}</span>
    },
    { 
      key: "paymentStatus", 
      label: "Payment Status",
      renderCell: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(value)}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    }
  ];

  const filteredMeterReadings = meterReadings.filter(meter => {
    const q = meterFilter.toLowerCase();
    return (
      meter.meterNumber?.toLowerCase().includes(q) ||
      meter.billNumber?.toLowerCase().includes(q) ||
      meter.paymentStatus?.toLowerCase().includes(q)
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
              EB Meter Calculation
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Electricity billing and power consumption tracking</p>
          </div>
          <div className="flex justify-center sm:justify-start space-x-2">
            <Button
              onClick={() => openMeterModal()}
              variant="success"
              className="px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              ⚡ Add Meter Reading
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
                <span className="text-blue-600 text-lg">⚡</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Units</p>
                <p className="text-xl font-bold text-blue-600">{totalUnits.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-green-600 text-lg">💰</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-green-600">₹{totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-purple-600 text-lg">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Consumption</p>
                <p className="text-xl font-bold text-purple-600">{averageConsumption.toFixed(1)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-yellow-600 text-lg">⏳</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Bills</p>
                <p className="text-xl font-bold text-yellow-600">{pendingBills}</p>
              </div>
            </div>
          </div>
        </div>

        <ResponsiveFilters title="Filters & Search" className="mb-6">
          <TableFilters
            searchValue={meterFilter}
            searchPlaceholder="Search by meter number, bill number..."
            onSearchChange={(e) => setMeterFilter(e.target.value)}
            showSelect={false}
          />
          <BranchFilter
            value={currentBranchId || ''}
            onChange={(value) => {
              console.log('Branch changed in EB Meter:', value);
            }}
          />
        </ResponsiveFilters>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Meter Readings</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {filteredMeterReadings.length} records</p>
          </div>
          <TableList
            data={filteredMeterReadings}
            columns={columns}
            actions={(meter) => [
              <Button
                key="edit"
                onClick={() => openMeterModal(meter)}
                variant="info"
                icon="edit"
                className="text-xs px-2 py-1"
              >
                Edit
              </Button>,
              <Button
                key="delete"
                onClick={() => deleteMeter(meter._id)}
                variant="danger"
                icon="delete"
                className="text-xs px-2 py-1"
              >
                Delete
              </Button>
            ]}
            renderDetail={(meter) => (
              <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-yellow-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Reading Date:</span>
                      <span className="text-gray-900 font-medium">{new Date(meter.readingDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Meter Number:</span>
                      <span className="text-blue-600 font-medium">{meter.meterNumber}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Bill Number:</span>
                      <span className="text-gray-900 font-medium">{meter.billNumber}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Due Date:</span>
                      <span className="text-gray-900 font-medium">{new Date(meter.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Previous Reading:</span>
                      <span className="text-gray-900 font-medium">{meter.previousReading.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Current Reading:</span>
                      <span className="text-indigo-600 font-medium">{meter.currentReading.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Units Consumed:</span>
                      <span className="text-green-600 font-bold">{meter.unitsConsumed.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Rate per Unit:</span>
                      <span className="text-gray-900 font-medium">₹{meter.ratePerUnit}</span>
                    </div>
                  </div>
                </div>
                
                {/* Calculation Details */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Calculation Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-indigo-600">{meter.unitsConsumed.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Units Consumed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-600">₹{meter.ratePerUnit}</div>
                      <div className="text-xs text-gray-600">Rate per Unit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">₹{meter.totalAmount.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Total Amount</div>
                    </div>
                    <div className="text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(meter.paymentStatus)}`}>
                        {meter.paymentStatus.charAt(0).toUpperCase() + meter.paymentStatus.slice(1)}
                      </span>
                      <div className="text-xs text-gray-600 mt-1">Payment Status</div>
                    </div>
                  </div>
                  
                  {meter.remarks && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-1">Remarks</h4>
                      <p className="text-gray-700 text-sm">{meter.remarks}</p>
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
            <h3 className="text-lg font-semibold text-gray-800">Meter Readings</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {filteredMeterReadings.length} records</p>
          </div>
          
          <div className="p-4">
            {filteredMeterReadings.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No meter readings</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new meter reading.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMeterReadings.map((meter) => (
                  <div key={meter._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="bg-white p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedMeter(expandedMeter === meter._id ? null : meter._id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-blue-600">{meter.meterNumber}</div>
                          <div className="text-sm text-gray-600">{new Date(meter.readingDate).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">
                            {meter.unitsConsumed.toLocaleString()} units • ₹{meter.totalAmount.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(meter.paymentStatus)}`}>
                            {meter.paymentStatus.charAt(0).toUpperCase() + meter.paymentStatus.slice(1)}
                          </span>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openMeterModal(meter);
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
                              deleteMeter(meter._id);
                            }}
                            variant="danger"
                            icon="delete"
                            className="text-xs px-2 py-1"
                          >
                            Delete
                          </Button>
                          <svg 
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              expandedMeter === meter._id ? 'rotate-180' : ''
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

                    {expandedMeter === meter._id && (
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Bill Number:</span>
                            <span className="ml-1 font-medium text-gray-900">{meter.billNumber}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Due Date:</span>
                            <span className="ml-1 font-medium text-gray-900">{new Date(meter.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Previous Reading:</span>
                            <span className="ml-1 font-medium text-gray-900">{meter.previousReading.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Current Reading:</span>
                            <span className="ml-1 font-medium text-indigo-600">{meter.currentReading.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Units Consumed:</span>
                            <span className="ml-1 font-medium text-green-600">{meter.unitsConsumed.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Rate per Unit:</span>
                            <span className="ml-1 font-medium text-gray-900">₹{meter.ratePerUnit}</span>
                          </div>
                        </div>
                        {meter.remarks && (
                          <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <h5 className="text-sm font-semibold text-gray-800 mb-1">Remarks</h5>
                            <p className="text-gray-700 text-sm">{meter.remarks}</p>
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

      {/* Meter Modal */}
      <DialogBox
        show={showMeterModal}
        onClose={closeMeterModal}
        title={editingMeter ? 'Edit Meter Reading' : 'Add New Meter Reading'}
        size="2xl"
      >
        <form onSubmit={saveMeter} className="space-y-6" key={editingMeter ? 'edit' : 'add'}>
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Reading Date"
                name="readingDate"
                type="date"
                value={meterForm.readingDate}
                onChange={handleMeterFormChange}
                required
                icon="calendar"
              />
              <FormInput
                label="Meter Number"
                name="meterNumber"
                value={meterForm.meterNumber}
                onChange={handleMeterFormChange}
                required
                icon="hash"
              />
              <FormInput
                label="Bill Number"
                name="billNumber"
                value={meterForm.billNumber}
                onChange={handleMeterFormChange}
                required
                icon="file-text"
              />
              <FormInput
                label="Due Date"
                name="dueDate"
                type="date"
                value={meterForm.dueDate}
                onChange={handleMeterFormChange}
                required
                icon="calendar"
              />
            </div>
          </div>

          {/* Meter Readings Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Meter Readings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Previous Reading"
                name="previousReading"
                type="number"
                value={meterForm.previousReading}
                onChange={handleMeterFormChange}
                required
                icon="gauge"
              />
              <FormInput
                label="Current Reading"
                name="currentReading"
                type="number"
                value={meterForm.currentReading}
                onChange={handleMeterFormChange}
                required
                icon="gauge"
              />
              <FormInput
                label="Units Consumed"
                name="unitsConsumed"
                type="number"
                value={meterForm.unitsConsumed}
                readOnly
                icon="calculator"
              />
              <FormInput
                label="Rate per Unit (₹)"
                name="ratePerUnit"
                type="number"
                step="0.01"
                value={meterForm.ratePerUnit}
                onChange={handleMeterFormChange}
                required
                icon="dollar-sign"
              />
            </div>
          </div>

          {/* Financial Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Total Amount (₹)"
                name="totalAmount"
                type="number"
                value={meterForm.totalAmount}
                readOnly
                icon="calculator"
              />
              <FormSelect
                label="Payment Status"
                name="paymentStatus"
                value={meterForm.paymentStatus}
                onChange={handleMeterFormChange}
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'overdue', label: 'Overdue' }
                ]}
                icon="credit-card"
              />
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Additional Information</h3>
            <FormInput
              label="Remarks"
              name="remarks"
              value={meterForm.remarks}
              onChange={handleMeterFormChange}
              icon="note"
            />
            
            {/* File Upload Section */}
            <div className="space-y-2">
              <FileUpload
                label="Upload Meter Bills & Documents"
                module="meter"
                onFilesChange={handleFilesChange}
                files={selectedFiles}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                maxFiles={10}
                maxSize={10}
                showPreview={true}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" onClick={closeMeterModal} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingMeter ? 'Update Meter Reading' : 'Create Meter Reading'}
            </Button>
          </div>
        </form>
      </DialogBox>
    </div>
  );
};

export default EBMeterCalculation; 