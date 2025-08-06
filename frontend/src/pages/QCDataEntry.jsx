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

const QCDataEntry = () => {
  const [qcRecords, setQcRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qcFilter, setQcFilter] = useState('');
  const [showQcModal, setShowQcModal] = useState(false);
  const [editingQc, setEditingQc] = useState(null);
  const [expandedQc, setExpandedQc] = useState(null);
  const { currentBranchId } = useSelector((state) => state.branch);

  const initialQcForm = {
    batchNumber: '',
    riceVariety: '',
    sampleDate: '',
    moistureContent: 0,
    brokenRice: 0,
    foreignMatter: 0,
    yellowKernels: 0,
    immatureKernels: 0,
    damagedKernels: 0,
    headRice: 0,
    totalDefects: 0,
    qualityGrade: 'A',
    testMethod: 'manual',
    testerName: '',
    remarks: '',
    status: 'pending'
  };

  const [qcForm, setQcForm] = useState(initialQcForm);

  useEffect(() => {
    fetchQcData();
  }, [currentBranchId]);

  const fetchQcData = async () => {
    setLoading(true);
    setError('');
    try {
      // Simulate API call - replace with actual service
      const mockQcRecords = [
        {
          _id: '1',
          batchNumber: 'QC-001',
          riceVariety: 'Basmati',
          sampleDate: '2024-01-15',
          moistureContent: 12.5,
          brokenRice: 2.1,
          foreignMatter: 0.3,
          yellowKernels: 0.8,
          immatureKernels: 1.2,
          damagedKernels: 0.5,
          headRice: 95.1,
          totalDefects: 4.9,
          qualityGrade: 'A',
          testMethod: 'manual',
          testerName: 'John Doe',
          remarks: 'Excellent quality batch',
          status: 'approved',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        {
          _id: '2',
          batchNumber: 'QC-002',
          riceVariety: 'Sona Masoori',
          sampleDate: '2024-01-16',
          moistureContent: 13.2,
          brokenRice: 3.5,
          foreignMatter: 0.8,
          yellowKernels: 1.5,
          immatureKernels: 2.1,
          damagedKernels: 1.2,
          headRice: 91.9,
          totalDefects: 8.1,
          qualityGrade: 'B',
          testMethod: 'automated',
          testerName: 'Jane Smith',
          remarks: 'Acceptable quality with minor defects',
          status: 'pending',
          createdAt: '2024-01-16T11:00:00Z',
          updatedAt: '2024-01-16T11:15:00Z'
        }
      ];
      setQcRecords(mockQcRecords);
    } catch (err) {
      setError(err.message || 'Failed to fetch QC data');
    } finally {
      setLoading(false);
    }
  };

  const openQcModal = (qc = null) => {
    setEditingQc(qc);
    if (qc) {
      // Format date for HTML date input (YYYY-MM-DD)
      const formattedSampleDate = new Date(qc.sampleDate).toISOString().split('T')[0];
      const formData = {
        ...initialQcForm,
        ...qc,
        sampleDate: formattedSampleDate
      };
      setQcForm(formData);
    } else {
      setQcForm(initialQcForm);
    }
    setShowQcModal(true);
  };

  const closeQcModal = () => {
    setShowQcModal(false);
    setEditingQc(null);
    setQcForm(initialQcForm);
  };

  const handleQcFormChange = (e) => {
    const { name, value } = e.target;
    setQcForm(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-calculate total defects and head rice
      if (['brokenRice', 'foreignMatter', 'yellowKernels', 'immatureKernels', 'damagedKernels'].includes(name)) {
        const totalDefects = parseFloat(updated.brokenRice || 0) + 
                           parseFloat(updated.foreignMatter || 0) + 
                           parseFloat(updated.yellowKernels || 0) + 
                           parseFloat(updated.immatureKernels || 0) + 
                           parseFloat(updated.damagedKernels || 0);
        updated.totalDefects = totalDefects.toFixed(1);
        updated.headRice = (100 - totalDefects).toFixed(1);
      }
      
      // Auto-assign quality grade based on total defects
      const totalDefects = parseFloat(updated.totalDefects || 0);
      if (totalDefects <= 3) {
        updated.qualityGrade = 'A';
      } else if (totalDefects <= 7) {
        updated.qualityGrade = 'B';
      } else if (totalDefects <= 12) {
        updated.qualityGrade = 'C';
      } else {
        updated.qualityGrade = 'D';
      }
      
      return updated;
    });
  };

  const saveQc = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Simulate API call - replace with actual service
      if (editingQc) {
        // Update existing QC record
        setQcRecords(prev => prev.map(qc => 
          qc._id === editingQc._id ? { ...qcForm, _id: qc._id } : qc
        ));
      } else {
        // Create new QC record
        const newQc = {
          ...qcForm,
          _id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setQcRecords(prev => [newQc, ...prev]);
      }
      closeQcModal();
    } catch (error) {
      setError('Error saving QC record: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteQc = async (qcId) => {
    if (window.confirm('Are you sure you want to delete this QC record?')) {
      try {
        setLoading(true);
        // Simulate API call - replace with actual service
        setQcRecords(prev => prev.filter(qc => qc._id !== qcId));
      } catch (error) {
        setError('Error deleting QC record: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A':
        return 'text-green-600 bg-green-100';
      case 'B':
        return 'text-blue-600 bg-blue-100';
      case 'C':
        return 'text-yellow-600 bg-yellow-100';
      case 'D':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Define columns for the table
  const columns = [
    { 
      key: "batchNumber", 
      label: "Batch #",
      renderCell: (value) => <span className="font-semibold text-blue-600">{value}</span>
    },
    { 
      key: "riceVariety", 
      label: "Rice Variety",
      renderCell: (value) => <span className="text-green-600 font-medium">{value}</span>
    },
    { 
      key: "sampleDate", 
      label: "Sample Date",
      renderCell: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: "moistureContent", 
      label: "Moisture (%)",
      renderCell: (value) => <span className="font-semibold text-indigo-600">{value}%</span>
    },
    { 
      key: "headRice", 
      label: "Head Rice (%)",
      renderCell: (value) => <span className="font-semibold text-green-600">{value}%</span>
    },
    { 
      key: "qualityGrade", 
      label: "Grade",
      renderCell: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(value)}`}>
          Grade {value}
        </span>
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

  const filteredQcRecords = qcRecords.filter(qc => {
    const q = qcFilter.toLowerCase();
    return (
      qc.batchNumber?.toLowerCase().includes(q) ||
      qc.riceVariety?.toLowerCase().includes(q) ||
      qc.qualityGrade?.toLowerCase().includes(q) ||
      qc.status?.toLowerCase().includes(q) ||
      qc.testerName?.toLowerCase().includes(q)
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
              QC Data Entry
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Quality control data entry and management</p>
          </div>
          <div className="flex justify-center sm:justify-start space-x-2">
            <Button
              onClick={() => openQcModal()}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              🔬 Add QC Record
            </Button>
            {qcRecords.length > 0 && (
              <Button
                onClick={() => {
                  openQcModal(qcRecords[0]);
                }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                🧪 Test Edit
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
                <span className="text-blue-600 text-lg">🔬</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tests</p>
                <p className="text-xl font-bold text-gray-900">{qcRecords.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-green-600 text-lg">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-xl font-bold text-gray-900">{qcRecords.filter(qc => qc.status === 'approved').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-yellow-600 text-lg">⏳</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-bold text-gray-900">{qcRecords.filter(qc => qc.status === 'pending').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-red-600 text-lg">❌</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-xl font-bold text-gray-900">{qcRecords.filter(qc => qc.status === 'rejected').length}</p>
              </div>
            </div>
          </div>
        </div>

        <ResponsiveFilters title="Filters & Search" className="mb-6">
          <TableFilters
            searchValue={qcFilter}
            searchPlaceholder="Search by batch number, variety, grade..."
            onSearchChange={(e) => setQcFilter(e.target.value)}
            showSelect={false}
          />
          <BranchFilter
            value={currentBranchId || ''}
            onChange={(value) => {
              console.log('Branch changed in QC:', value);
            }}
          />
        </ResponsiveFilters>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">QC Records</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {filteredQcRecords.length} records</p>
          </div>
          <TableList
            data={filteredQcRecords}
            columns={columns}
            actions={(qc) => [
              <Button
                key="edit"
                onClick={() => openQcModal(qc)}
                variant="info"
                icon="edit"
                className="text-xs px-2 py-1"
              >
                Edit
              </Button>,
              <Button
                key="delete"
                onClick={() => deleteQc(qc._id)}
                variant="danger"
                icon="delete"
                className="text-xs px-2 py-1"
              >
                Delete
              </Button>
            ]}
            renderDetail={(qc) => (
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Batch #:</span>
                      <span className="text-gray-900 font-medium">{qc.batchNumber}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Rice Variety:</span>
                      <span className="text-green-600 font-medium">{qc.riceVariety}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Sample Date:</span>
                      <span className="text-gray-900 font-medium">{new Date(qc.sampleDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Tester:</span>
                      <span className="text-gray-900 font-medium">{qc.testerName}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Quality Grade:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(qc.qualityGrade)}`}>
                        Grade {qc.qualityGrade}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(qc.status)}`}>
                        {qc.status.charAt(0).toUpperCase() + qc.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Test Method:</span>
                      <span className="text-gray-900 font-medium">{qc.testMethod}</span>
                    </div>
                  </div>
                </div>
                
                {/* Quality Metrics */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Quality Metrics (%)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-indigo-600">{qc.moistureContent}%</div>
                      <div className="text-xs text-gray-600">Moisture</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{qc.headRice}%</div>
                      <div className="text-xs text-gray-600">Head Rice</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">{qc.totalDefects}%</div>
                      <div className="text-xs text-gray-600">Total Defects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-600">{qc.brokenRice}%</div>
                      <div className="text-xs text-gray-600">Broken Rice</div>
                    </div>
                  </div>
                  
                  {/* Detailed Defects */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Foreign Matter:</span>
                      <span className="font-medium">{qc.foreignMatter}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Yellow Kernels:</span>
                      <span className="font-medium">{qc.yellowKernels}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Immature Kernels:</span>
                      <span className="font-medium">{qc.immatureKernels}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Damaged Kernels:</span>
                      <span className="font-medium">{qc.damagedKernels}%</span>
                    </div>
                  </div>
                  
                  {qc.remarks && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-1">Remarks</h4>
                      <p className="text-gray-700 text-sm">{qc.remarks}</p>
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
            <h3 className="text-lg font-semibold text-gray-800">QC Records</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {filteredQcRecords.length} records</p>
          </div>
          
          <div className="p-4">
            {filteredQcRecords.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No QC records</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new QC record.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQcRecords.map((qc) => (
                  <div key={qc._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="bg-white p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedQc(expandedQc === qc._id ? null : qc._id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-blue-600">{qc.batchNumber}</div>
                          <div className="text-sm text-gray-600">{qc.riceVariety}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(qc.sampleDate).toLocaleDateString()} • Grade {qc.qualityGrade} • {qc.status}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openQcModal(qc);
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
                              deleteQc(qc._id);
                            }}
                            variant="danger"
                            icon="delete"
                            className="text-xs px-2 py-1"
                          >
                            Delete
                          </Button>
                          <svg 
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              expandedQc === qc._id ? 'rotate-180' : ''
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

                    {expandedQc === qc._id && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Rice Variety:</span>
                            <span className="ml-1 font-medium text-green-600">{qc.riceVariety}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Sample Date:</span>
                            <span className="ml-1 font-medium text-gray-900">{new Date(qc.sampleDate).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Moisture:</span>
                            <span className="ml-1 font-medium text-indigo-600">{qc.moistureContent}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Head Rice:</span>
                            <span className="ml-1 font-medium text-green-600">{qc.headRice}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Defects:</span>
                            <span className="ml-1 font-medium text-red-600">{qc.totalDefects}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Quality Grade:</span>
                            <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(qc.qualityGrade)}`}>
                              Grade {qc.qualityGrade}
                            </span>
                          </div>
                        </div>
                        {qc.remarks && (
                          <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <h5 className="text-sm font-semibold text-gray-800 mb-1">Remarks</h5>
                            <p className="text-gray-700 text-sm">{qc.remarks}</p>
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

      {/* QC Modal */}
      <DialogBox
        show={showQcModal}
        onClose={closeQcModal}
        title={editingQc ? 'Edit QC Record' : 'Add New QC Record'}
        size="lg"
      >
        <form onSubmit={saveQc} className="space-y-4" key={editingQc ? 'edit' : 'add'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Batch Number"
              name="batchNumber"
              value={qcForm.batchNumber || ''}
              onChange={handleQcFormChange}
              required
              icon="hash"
            />
            <FormInput
              label="Rice Variety"
              name="riceVariety"
              value={qcForm.riceVariety || ''}
              onChange={handleQcFormChange}
              required
              icon="grain"
            />
            <FormInput
              label="Sample Date"
              name="sampleDate"
              type="date"
              value={qcForm.sampleDate}
              onChange={handleQcFormChange}
              required
              icon="calendar"
            />
            <FormInput
              label="Tester Name"
              name="testerName"
              value={qcForm.testerName}
              onChange={handleQcFormChange}
              required
              icon="user"
            />
            <FormInput
              label="Moisture Content (%)"
              name="moistureContent"
              type="number"
              step="0.1"
              value={qcForm.moistureContent}
              onChange={handleQcFormChange}
              required
              icon="droplet"
            />
            <FormInput
              label="Broken Rice (%)"
              name="brokenRice"
              type="number"
              step="0.1"
              value={qcForm.brokenRice}
              onChange={handleQcFormChange}
              required
              icon="scissors"
            />
            <FormInput
              label="Foreign Matter (%)"
              name="foreignMatter"
              type="number"
              step="0.1"
              value={qcForm.foreignMatter}
              onChange={handleQcFormChange}
              required
              icon="x-circle"
            />
            <FormInput
              label="Yellow Kernels (%)"
              name="yellowKernels"
              type="number"
              step="0.1"
              value={qcForm.yellowKernels}
              onChange={handleQcFormChange}
              required
              icon="circle"
            />
            <FormInput
              label="Immature Kernels (%)"
              name="immatureKernels"
              type="number"
              step="0.1"
              value={qcForm.immatureKernels}
              onChange={handleQcFormChange}
              required
              icon="circle"
            />
            <FormInput
              label="Damaged Kernels (%)"
              name="damagedKernels"
              type="number"
              step="0.1"
              value={qcForm.damagedKernels}
              onChange={handleQcFormChange}
              required
              icon="alert-circle"
            />
            <FormInput
              label="Total Defects (%)"
              name="totalDefects"
              type="number"
              step="0.1"
              value={qcForm.totalDefects}
              readOnly
              icon="calculator"
            />
            <FormInput
              label="Head Rice (%)"
              name="headRice"
              type="number"
              step="0.1"
              value={qcForm.headRice}
              readOnly
              icon="check-circle"
            />
            <FormSelect
              label="Quality Grade"
              name="qualityGrade"
              value={qcForm.qualityGrade}
              onChange={handleQcFormChange}
              options={[
                { value: 'A', label: 'Grade A (≤3% defects)' },
                { value: 'B', label: 'Grade B (≤7% defects)' },
                { value: 'C', label: 'Grade C (≤12% defects)' },
                { value: 'D', label: 'Grade D (>12% defects)' }
              ]}
              icon="award"
            />
            <FormSelect
              label="Test Method"
              name="testMethod"
              value={qcForm.testMethod}
              onChange={handleQcFormChange}
              options={[
                { value: 'manual', label: 'Manual Testing' },
                { value: 'automated', label: 'Automated Testing' },
                { value: 'hybrid', label: 'Hybrid Testing' }
              ]}
              icon="settings"
            />
            <FormSelect
              label="Status"
              name="status"
              value={qcForm.status}
              onChange={handleQcFormChange}
              options={[
                { value: 'pending', label: 'Pending Review' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' }
              ]}
              icon="check-square"
            />
          </div>
          <FormInput
            label="Remarks"
            name="remarks"
            value={qcForm.remarks}
            onChange={handleQcFormChange}
            icon="note"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={closeQcModal} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingQc ? 'Update QC Record' : 'Create QC Record'}
            </Button>
          </div>
        </form>
      </DialogBox>
    </div>
  );
};

export default QCDataEntry; 