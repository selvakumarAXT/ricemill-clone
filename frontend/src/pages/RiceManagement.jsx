import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Button from "../components/common/Button";
import DialogBox from "../components/common/DialogBox";
import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import GroupedTable from "../components/common/GroupedTable";
import TableFilters from "../components/common/TableFilters";
import BranchFilter from "../components/common/BranchFilter";
import ResponsiveFilters from "../components/common/ResponsiveFilters";
import LoadingSpinner from "../components/common/LoadingSpinner";
import FileUpload from "../components/common/FileUpload";
import DateRangeFilter from "../components/common/DateRangeFilter";
import riceDepositService from "../services/riceDepositService";
import { getAllPaddy } from "../services/paddyService";
import { formatWeight } from "../utils/calculations";
import InvoiceTemplate from "../components/common/InvoiceTemplate";
import PreviewInvoice from "../components/common/PreviewInvoice";

const RiceManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const { currentBranchId } = useSelector((state) => state.branch);
  const [riceDeposits, setRiceDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRiceModal, setShowRiceModal] = useState(false);
  const [editingRice, setEditingRice] = useState(null);
  const [riceFilter, setRiceFilter] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [expandedRice, setExpandedRice] = useState(null);
  const [stats, setStats] = useState({
    totalONB: 0,
    totalSS: 0,
    totalRiceBags: 0,
    totalRiceWeight: 0,
    totalRiceDeposit: 0,
    totalGunnyBags: 0,
    totalGunnyWeight: 0,
    count: 0
  });
  const [paddyData, setPaddyData] = useState([]);
  const [riceComparison, setRiceComparison] = useState({
    actualRiceOutput: 0,
    expectedRiceOutput: 0,
    totalPaddyWeight: 0,
    efficiency: 0,
    difference: 0
  });
  const [selectedPaddy, setSelectedPaddy] = useState(null);
  const [usedGunnyFromPaddy, setUsedGunnyFromPaddy] = useState({
    nb: 0,
    onb: 0,
    ss: 0,
    swp: 0
  });
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const initialRiceForm = {
    date: "",
    truckMemo: "",
    lorryNumber: "",
    depositGodown: "",
    variety: "",
    godownDate: "",
    ackNo: "",
    riceBag: 0,
    riceBagFrk: 0,
    depositWeight: 0,
    depositWeightFrk: 0,
    totalRiceDeposit: 0,
    moisture: 0,
    sampleNumber: "",
    paddyReference: "",
    gunny: {
      onb: 0,
      ss: 0,
      swp: 0,
    },
    gunnyUsedFromPaddy: {
      nb: 0,
      onb: 0,
      ss: 0,
      swp: 0,
    },
    gunnyBags: 0,
    gunnyWeight: 0,
    invoiceNumber: '',
    invoiceGenerated: false,
  };

  const [riceForm, setRiceForm] = useState(initialRiceForm);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedRiceForInvoice, setSelectedRiceForInvoice] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewInvoiceData, setPreviewInvoiceData] = useState(null);

  // Fetch rice deposit data
  useEffect(() => {
    fetchRiceData();
    fetchRiceStats();
    fetchPaddyData();
  }, []);

  // Refetch data when branch changes
  useEffect(() => {
    if (currentBranchId) {
      fetchRiceData();
      fetchRiceStats();
      fetchPaddyData();
    }
  }, [currentBranchId]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchRiceData = async () => {
    try {
      setLoading(true);
      const data = await riceDepositService.getAllRiceDeposits();
      setRiceDeposits(data);
    } catch (error) {
      console.error('Error fetching rice deposit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiceStats = async () => {
    try {
      const data = await riceDepositService.getRiceDepositStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching rice deposit stats:', error);
    }
  };

  const fetchPaddyData = async () => {
    try {
      const data = await getAllPaddy();
      setPaddyData(data.data || data);
    } catch (error) {
      console.error('Error fetching paddy data:', error);
    }
  };

  // Calculate rice comparison statistics
  const calculateRiceComparison = () => {
    const actualRiceOutput = stats.totalRiceWeight || 0;
    
    // Calculate expected rice output (67% of total paddy weight)
    const totalPaddyWeight = paddyData.reduce((total, paddy) => {
      return total + (paddy.paddy?.weight || 0);
    }, 0);
    
    const expectedRiceOutput = totalPaddyWeight * 0.67;
    const difference = actualRiceOutput - expectedRiceOutput;
    const efficiency = expectedRiceOutput > 0 ? (actualRiceOutput / expectedRiceOutput) * 100 : 0;

    setRiceComparison({
      actualRiceOutput,
      expectedRiceOutput,
      totalPaddyWeight,
      efficiency,
      difference
    });
  };

  // Update comparison when stats or paddy data changes
  useEffect(() => {
    if (stats.totalRiceWeight !== undefined && paddyData.length > 0) {
      calculateRiceComparison();
    }
  }, [stats, paddyData]);

  // Rice CRUD operations
  const openRiceModal = (rice = null) => {
    setEditingRice(rice);
    setRiceForm(
      rice
        ? {
            ...initialRiceForm,
            ...rice,
            gunny: { ...initialRiceForm.gunny, ...rice.gunny },
            gunnyUsedFromPaddy: { ...initialRiceForm.gunnyUsedFromPaddy, ...rice.gunnyUsedFromPaddy },
          }
        : initialRiceForm
    );
    
    // Set selected paddy if editing
    if (rice && rice.paddyReference) {
      const paddyRecord = paddyData.find(paddy => paddy._id === rice.paddyReference);
      setSelectedPaddy(paddyRecord);
      setUsedGunnyFromPaddy(rice.gunnyUsedFromPaddy || { nb: 0, onb: 0, ss: 0, swp: 0 });
    } else {
      setSelectedPaddy(null);
      setUsedGunnyFromPaddy({ nb: 0, onb: 0, ss: 0, swp: 0 });
    }
    
    setShowRiceModal(true);
  };

  const closeRiceModal = () => {
    setShowRiceModal(false);
    setEditingRice(null);
    setRiceForm(initialRiceForm);
    setSelectedPaddy(null);
    setUsedGunnyFromPaddy({ nb: 0, onb: 0, ss: 0, swp: 0 });
    setErrorMessage(null);
  };

  const handleRiceFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('gunny.')) {
      const gunnyType = name.split('.')[1];
      setRiceForm({
        ...riceForm,
        gunny: {
          ...riceForm.gunny,
          [gunnyType]: parseInt(value) || 0,
        },
      });
    } else {
      setRiceForm({
        ...riceForm,
        [name]: value,
      });
    }
  };

  const handlePaddySelection = (paddyId) => {
    const selectedPaddyRecord = paddyData.find(paddy => paddy._id === paddyId);
    setSelectedPaddy(selectedPaddyRecord);
    setRiceForm({
      ...riceForm,
      paddyReference: paddyId
    });
    // Reset gunny usage when paddy changes
    setUsedGunnyFromPaddy({ nb: 0, onb: 0, ss: 0, swp: 0 });
  };

  const handleGunnyUsageChange = (grade, value) => {
    const newUsedGunny = {
      ...usedGunnyFromPaddy,
      [grade]: parseInt(value) || 0
    };
    setUsedGunnyFromPaddy(newUsedGunny);
    
    // Update the form with the new gunny usage
    setRiceForm({
      ...riceForm,
      gunnyUsedFromPaddy: newUsedGunny
    });
  };

  const handleFilesChange = (files) => {
    setSelectedFiles(files);
  };

  const openInvoiceModal = (rice) => {
    setSelectedRiceForInvoice(rice);
    setShowInvoiceModal(true);
  };

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setSelectedRiceForInvoice(null);
  };

  const handleGenerateInvoice = (invoiceData) => {
    try {
      setLoading(true);
      
      // Update rice deposit with invoice information
      setRiceDeposits(prev => prev.map(rice => 
        rice._id === selectedRiceForInvoice._id 
          ? { ...rice, invoiceNumber: invoiceData.invoiceNumber, invoiceGenerated: true }
          : rice
      ));
      
      alert('Rice deposit invoice generated successfully!');
      closeInvoiceModal();
      
    } catch (error) {
      setErrorMessage('Error generating invoice: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openPreviewModal = (rice) => {
    setPreviewInvoiceData(rice);
    setShowPreviewModal(true);
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewInvoiceData(null);
  };

  const downloadInvoice = async (rice) => {
    try {
      setLoading(true);
      // TODO: Implement actual PDF download
      alert('Invoice download functionality coming soon!');
    } catch (error) {
      setErrorMessage('Error downloading invoice: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveRice = async (e) => {
    e.preventDefault();
    
    // Validate gunny stock availability
    if (selectedPaddy && riceForm.paddyReference) {
      const validationErrors = [];
      
      // Check NB gunny availability
      if (usedGunnyFromPaddy.nb > selectedPaddy.gunny?.nb) {
        validationErrors.push(`NB gunny: Requested ${usedGunnyFromPaddy.nb}, Available ${selectedPaddy.gunny?.nb || 0}`);
      }
      
      // Check ONB gunny availability
      if (usedGunnyFromPaddy.onb > selectedPaddy.gunny?.onb) {
        validationErrors.push(`ONB gunny: Requested ${usedGunnyFromPaddy.onb}, Available ${selectedPaddy.gunny?.onb || 0}`);
      }
      
      // Check SS gunny availability
      if (usedGunnyFromPaddy.ss > selectedPaddy.gunny?.ss) {
        validationErrors.push(`SS gunny: Requested ${usedGunnyFromPaddy.ss}, Available ${selectedPaddy.gunny?.ss || 0}`);
      }
      
      // Check SWP gunny availability
      if (usedGunnyFromPaddy.swp > selectedPaddy.gunny?.swp) {
        validationErrors.push(`SWP gunny: Requested ${usedGunnyFromPaddy.swp}, Available ${selectedPaddy.gunny?.swp || 0}`);
      }
      
      if (validationErrors.length > 0) {
        setErrorMessage('Insufficient gunny stock: ' + validationErrors.join(', '));
        return;
      }
    }
    
    try {
      setLoading(true);
      if (editingRice) {
        await riceDepositService.updateRiceDeposit(editingRice._id, riceForm);
      } else {
        await riceDepositService.createRiceDeposit(riceForm);
      }
      // Show success message
      setSuccessMessage(editingRice ? 'Rice deposit updated successfully!' : 'Rice deposit created successfully!');
      // Close modal first, then refresh data
      closeRiceModal();
      // Refresh data after a short delay to ensure modal is closed
      setTimeout(() => {
        fetchRiceData();
        fetchRiceStats();
        fetchPaddyData();
      }, 100);
    } catch (error) {
      console.error('Error saving rice deposit:', error);
      setErrorMessage('Error saving rice deposit: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const deleteRice = async (riceId) => {
    if (window.confirm('Are you sure you want to delete this rice deposit record?')) {
      try {
        setLoading(true);
        await riceDepositService.deleteRiceDeposit(riceId);
        fetchRiceData();
        fetchRiceStats();
        fetchPaddyData();
      } catch (error) {
        console.error('Error deleting rice deposit:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter rice deposits
  const filteredRiceDeposits = riceDeposits.filter(rice => {
    const q = riceFilter.toLowerCase();
    const matchesText = (
      rice.truckMemo?.toLowerCase().includes(q) ||
      rice.lorryNumber?.toLowerCase().includes(q) ||
      rice.depositGodown?.toLowerCase().includes(q) ||
      rice.variety?.toLowerCase().includes(q) ||
      rice.ackNo?.toLowerCase().includes(q) ||
      rice.sampleNumber?.toLowerCase().includes(q)
    );
    
    // Date range filter
    let matchesDate = true;
    if (dateRange.startDate || dateRange.endDate) {
      const riceDate = new Date(rice.date);
      if (dateRange.startDate) {
        matchesDate = matchesDate && riceDate >= new Date(dateRange.startDate);
      }
      if (dateRange.endDate) {
        matchesDate = matchesDate && riceDate <= new Date(dateRange.endDate + 'T23:59:59.999Z');
      }
    }
    
    return matchesText && matchesDate;
  });

  // Grouped headers for the table
  const groupedHeaders = [
    {
      label: "S.NO",
      columns: [
        {
          key: "serialNumber",
        }
      ]
    },
    {
      label: "DATE",
      columns: [
        {
          key: "date",
          render: (value) => new Date(value).toLocaleDateString(),
        }
      ]
    },
    {
      label: "TRUCK MEMO",
      columns: [
        {
          key: "truckMemo",
          render: (value) => value,
        }
      ]
    },
    {
      label: "LORRY NUMBER",
      columns: [
        {
          key: "lorryNumber",
          render: (value) => value,
        }
      ]
    },
    {
      label: "DEPOSIT GODOWN",
      columns: [
        {
          key: "depositGodown",
          render: (value) => value,
        }
      ]
    },
    {
      label: "VARIETY",
      columns: [
        {
          key: "variety",
          render: (value) => value,
        }
      ]
    },
    {
      label: "GODOWN",
      columns: [
        {
          key: "godownDate",
          label: "DATE",
          render: (value) => new Date(value).toLocaleDateString(),
        },
        {
          key: "ackNo",
          label: "ACK NO",
          render: (value) => value,
        }
      ]
    },
    {
      label: "RICE BAG",
      columns: [
        {
          key: "riceBag",
          label: "BAGS",
          render: (value) => value || 0,
        },
        {
          key: "riceBagFrk",
          label: "FRK",
          render: (value) => value || 0,
        }
      ]
    },
    {
      label: "DEPOSIT WEIGHT",
      columns: [
        {
          key: "depositWeight",
          label: "WEIGHT",
          render: (value) => value || 0,
        },
        {
          key: "depositWeightFrk",
          label: "FRK",
          render: (value) => value || 0,
        }
      ]
    },
    {
      label: "TOTAL RICE DEPOSIT",
      columns: [
        {
          key: "totalRiceDeposit",
          render: (value) => value || 0,
        }
      ]
    },
    {
      label: "MOISTURE",
      columns: [
        {
          key: "moisture",
          render: (value) => value || 0,
        }
      ]
    },
    {
      label: "SAMPLE NUMBER",
      columns: [
        {
          key: "sampleNumber",
          render: (value) => value || 'N/A',
        }
      ]
    },
    {
      label: "GUNNY",
      columns: [
        {
          key: "gunny.onb",
          label: "ONB",
          render: (value, record) => record.gunny?.onb || 0,
        },
        {
          key: "gunny.ss",
          label: "SS",
          render: (value, record) => record.gunny?.ss || 0,
        },
        {
          key: "gunny.swp",
          label: "SWP",
          render: (value, record) => record.gunny?.swp || 0,
        },
        {
          key: "gunnyBags",
          label: "BAGS",
          render: (value) => value || 0,
        },
        {
          key: "gunnyWeight",
          label: "WEIGHT",
          render: (value) => value || 0,
        }
      ]
    },
    {
      label: "INVOICE",
      columns: [
        {
          key: "invoiceNumber",
          label: "INVOICE #",
          render: (value) => (
            <span className={`font-medium ${value ? 'text-green-600' : 'text-gray-400'}`}>
              {value || 'Not Generated'}
            </span>
          ),
        }
      ]
    }
  ];

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <LoadingSpinner />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-6 sm:px-6">
        <div className="flex flex-col space-y-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Rice Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage rice deposit records</p>
          </div>
          {currentBranchId && currentBranchId !== 'all' && (
            <div className="flex justify-center sm:justify-start">
                              <Button
                  onClick={() => openRiceModal()}
                  variant="success" 
                  icon="plus"
                  className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300"
                >
                Add Rice Deposit
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-green-800">
              <div className="font-medium">Success:</div>
              <div>{successMessage}</div>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="mt-2 text-green-600 hover:text-green-800 text-sm"
            >
              ✕ Dismiss
            </button>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800">
              <div className="font-medium">Error:</div>
              <div>{errorMessage}</div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm"
            >
              ✕ Dismiss
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-xl font-bold text-gray-900">{stats.count}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total ONB</p>
              <p className="text-xl font-bold text-blue-600">{stats.totalONB}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total SS</p>
              <p className="text-xl font-bold text-purple-600">{stats.totalSS}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Rice Bags</p>
              <p className="text-xl font-bold text-green-600">{stats.totalRiceBags}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Rice Weight</p>
              <p className="text-xl font-bold text-indigo-600">{formatWeight(stats.totalRiceWeight)}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Rice</p>
              <p className="text-xl font-bold text-red-600">{stats.totalRiceDeposit}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Gunny Bags</p>
              <p className="text-xl font-bold text-yellow-600">{stats.totalGunnyBags}</p>
            </div>
          </div>
        </div>

        {/* Rice Output Comparison Summary */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <h3 className="text-lg font-semibold text-gray-800">Rice Output Analysis</h3>
              <p className="text-sm text-gray-600 mt-1">Actual vs Expected Rice Production (67% of paddy weight)</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Actual Rice Output */}
                <div className="text-center">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {formatWeight(riceComparison.actualRiceOutput)}
                    </div>
                    <div className="text-sm font-medium text-gray-700">Actual Rice Output</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Total rice produced
                    </div>
                  </div>
                </div>

                {/* Expected Rice Output */}
                <div className="text-center">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {formatWeight(riceComparison.expectedRiceOutput)}
                    </div>
                    <div className="text-sm font-medium text-gray-700">Expected Rice Output</div>
                    <div className="text-xs text-gray-500 mt-1">
                      67% of total paddy weight
                    </div>
                  </div>
                </div>

                {/* Efficiency */}
                <div className="text-center">
                  <div className={`rounded-lg p-4 border ${
                    riceComparison.efficiency >= 100 
                      ? 'bg-emerald-50 border-emerald-200' 
                      : riceComparison.efficiency >= 90 
                        ? 'bg-yellow-50 border-yellow-200' 
                        : 'bg-red-50 border-red-200'
                  }`}>
                    <div className={`text-2xl font-bold mb-2 ${
                      riceComparison.efficiency >= 100 
                        ? 'text-emerald-600' 
                        : riceComparison.efficiency >= 90 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                    }`}>
                      {riceComparison.efficiency.toFixed(1)}%
                    </div>
                    <div className="text-sm font-medium text-gray-700">Production Efficiency</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Actual vs Expected
                    </div>
                  </div>
                </div>

                {/* Difference */}
                <div className="text-center">
                  <div className={`rounded-lg p-4 border ${
                    riceComparison.difference >= 0 
                      ? 'bg-emerald-50 border-emerald-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className={`text-2xl font-bold mb-2 ${
                      riceComparison.difference >= 0 
                        ? 'text-emerald-600' 
                        : 'text-red-600'
                    }`}>
                      {riceComparison.difference >= 0 ? '+' : ''}{formatWeight(riceComparison.difference)}
                    </div>
                    <div className="text-sm font-medium text-gray-700">Difference</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Actual - Expected
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-700 mb-1">Processing Summary</div>
                  <div className="text-gray-600">
                    <div>• Total Paddy Weight: {formatWeight(riceComparison.totalPaddyWeight)}</div>
                    <div>• Expected Rice: {formatWeight(riceComparison.expectedRiceOutput)}</div>
                    <div>• Actual Rice: {formatWeight(riceComparison.actualRiceOutput)}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-700 mb-1">Efficiency Analysis</div>
                  <div className="text-gray-600">
                    <div>• Target Efficiency: 100%</div>
                    <div>• Current Efficiency: {riceComparison.efficiency.toFixed(1)}%</div>
                    <div>• Status: {
                      riceComparison.efficiency >= 100 
                        ? '✅ Above Target' 
                        : riceComparison.efficiency >= 90 
                          ? '⚠️ Near Target' 
                          : '❌ Below Target'
                    }</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-700 mb-1">Production Insights</div>
                  <div className="text-gray-600">
                    <div>• Processing Ratio: 67% rice, 33% by-products</div>
                    <div>• By-products: {formatWeight(riceComparison.totalPaddyWeight * 0.33)}</div>
                    <div>• Total Records: {stats.count}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Filters */}
        <ResponsiveFilters title="Filters & Search" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <BranchFilter
              value={currentBranchId || ''}
              onChange={(value) => console.log('Branch changed:', value)}
            />
            <TableFilters
              searchValue={riceFilter}
              onSearchChange={setRiceFilter}
              searchPlaceholder="Search by memo, lorry, godown, variety..."
            />
          </div>
          <div className="mt-4">
            <DateRangeFilter
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onStartDateChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              onEndDateChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              startDateLabel="Date From"
              endDateLabel="Date To"
            />
          </div>
        </ResponsiveFilters>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <GroupedTable
            tableTitle="Rice Deposit Records"
            data={filteredRiceDeposits}
            groupedHeaders={groupedHeaders}
            renderDetail={(rice) => (
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Date:</span>
                      <span className="text-gray-900 font-medium">{new Date(rice.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Truck Memo:</span>
                      <span className="text-gray-900 font-medium">{rice.truckMemo}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Lorry Number:</span>
                      <span className="text-gray-900 font-medium">{rice.lorryNumber}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Deposit Godown:</span>
                      <span className="text-gray-900 font-medium">{rice.depositGodown}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Variety:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rice.variety === 'A' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        Variety {rice.variety}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Ack No:</span>
                      <span className="text-gray-900 font-medium">{rice.ackNo}</span>
                    </div>
                    {rice.createdAt && (
                      <div className="flex items-center">
                        <span className="w-24 text-sm font-medium text-gray-600">Created:</span>
                        <span className="text-gray-900 font-medium">
                          {new Date(rice.createdAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {rice.updatedAt && rice.updatedAt !== rice.createdAt && (
                      <div className="flex items-center">
                        <span className="w-24 text-sm font-medium text-gray-600">Updated:</span>
                        <span className="text-gray-900 font-medium">
                          {new Date(rice.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {/* Rice Summary */}
                    <div className="p-3 bg-white rounded-lg border border-gray-200 w-full">
                      <h5 className="text-sm font-semibold text-gray-800 mb-2">Rice Summary</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm w-full">
                        <div>
                          <span className="text-gray-600">Rice Bags:</span>
                          <span className="ml-1 font-medium text-green-600">{rice.riceBag || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Rice:</span>
                          <span className="ml-1 font-medium text-green-600">{rice.totalRiceDeposit || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Gunny Summary */}
                    <div className="p-3 bg-white rounded-lg border border-gray-200 w-full">
                      <h5 className="text-sm font-semibold text-gray-800 mb-2">Gunny Summary</h5>
                      <div className="grid grid-cols-3 gap-4 text-sm w-full">
                        <div className="text-center">
                          <div className="font-medium text-blue-600">ONB</div>
                          <div className="text-gray-900">{rice.gunny?.onb || 0}</div>
                          {rice.gunnyUsedFromPaddy?.nb > 0 && (
                            <div className="text-xs text-blue-500">(from {rice.gunnyUsedFromPaddy.nb} NB)</div>
                          )}
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-green-600">SS</div>
                          <div className="text-gray-900">{rice.gunny?.ss || 0}</div>
                          {rice.gunnyUsedFromPaddy?.onb > 0 && (
                            <div className="text-xs text-green-500">(from {rice.gunnyUsedFromPaddy.onb} ONB)</div>
                          )}
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-purple-600">SWP</div>
                          <div className="text-gray-900">{rice.gunny?.swp || 0}</div>
                          {(rice.gunnyUsedFromPaddy?.ss > 0 || rice.gunnyUsedFromPaddy?.swp > 0) && (
                            <div className="text-xs text-purple-500">
                              (from {rice.gunnyUsedFromPaddy?.ss || 0} SS + {rice.gunnyUsedFromPaddy?.swp || 0} SWP)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-center">
                          <div className="text-xs font-medium text-gray-600">Total Gunny</div>
                          <div className="text-lg font-bold text-green-600">
                            {(rice.gunny?.onb || 0) + (rice.gunny?.ss || 0) + (rice.gunny?.swp || 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            actions={(rice) => [
              <Button
                key="edit"
                onClick={() => openRiceModal(rice)}
                variant="info"
                icon="edit"
              >
                Edit
              </Button>,
              rice.invoiceNumber ? (
                <>
                  <Button
                    key="preview-invoice"
                    onClick={() => openPreviewModal(rice)}
                    variant="info"
                    icon="eye"
                    className="mr-1"
                  >
                    Preview
                  </Button>
                  <Button
                    key="download-invoice"
                    onClick={() => downloadInvoice(rice)}
                    variant="success"
                    icon="download"
                  >
                    Download
                  </Button>
                </>
              ) : (
                <Button
                  key="generate-invoice"
                  onClick={() => openInvoiceModal(rice)}
                  variant="primary"
                  icon="document-text"
                >
                  Generate Invoice
                </Button>
              ),
              <Button
                key="delete"
                onClick={() => deleteRice(rice._id)}
                variant="danger"
                icon="delete"
              >
                Delete
              </Button>,
            ]}
          />
        </div>

        {/* Mobile Table View */}
        <div className="lg:hidden bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Rice Deposit Records</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {riceDeposits.length} records</p>
          </div>
          
          <div className="p-4">
            {filteredRiceDeposits.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No rice deposit records</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new rice deposit record.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRiceDeposits.map((rice, index) => (
                  <div key={rice._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="bg-white p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedRice(expandedRice === rice._id ? null : rice._id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{rice.truckMemo}</div>
                          <div className="text-sm text-gray-600">
                            {rice.lorryNumber} • {rice.depositGodown}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(rice.date).toLocaleDateString()} • {rice.variety}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openRiceModal(rice);
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
                              deleteRice(rice._id);
                            }}
                            variant="danger"
                            icon="delete"
                            className="text-xs px-2 py-1"
                          >
                            Delete
                          </Button>
                          <svg 
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              expandedRice === rice._id ? 'rotate-180' : ''
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
                    
                    {expandedRice === rice._id && (
                      <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Date:</span>
                            <span className="ml-2 text-gray-900">{new Date(rice.date).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Truck Memo:</span>
                            <span className="ml-2 text-gray-900">{rice.truckMemo}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Lorry Number:</span>
                            <span className="ml-2 text-gray-900">{rice.lorryNumber}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Deposit Godown:</span>
                            <span className="ml-2 text-gray-900">{rice.depositGodown}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Variety:</span>
                            <span className="ml-2 text-gray-900">{rice.variety}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Ack No:</span>
                            <span className="ml-2 text-gray-900">{rice.ackNo}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Rice Bags:</span>
                            <span className="ml-2 text-gray-900">{rice.riceBag || 0}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Total Rice:</span>
                            <span className="ml-2 text-gray-900">{rice.totalRiceDeposit || 0}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">ONB:</span>
                            <span className="ml-2 text-gray-900">{rice.gunny?.onb || 0}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">SS:</span>
                            <span className="ml-2 text-gray-900">{rice.gunny?.ss || 0}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Invoice:</span>
                            <span className={`ml-2 font-medium ${rice.invoiceNumber ? 'text-green-600' : 'text-gray-400'}`}>
                              {rice.invoiceNumber || 'Not Generated'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rice Modal */}
      <DialogBox
        show={showRiceModal}
        onClose={closeRiceModal}
        onSubmit={saveRice}
        title={editingRice ? "Edit Rice Deposit" : "Add Rice Deposit"}
        submitText={editingRice ? "Update" : "Create"}
        cancelText="Cancel"
        size="2xl"
      >
        <form onSubmit={saveRice} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <FormInput
              label="Date"
              name="date"
              type="date"
              value={riceForm.date}
              onChange={handleRiceFormChange}
              required
            />
            <FormInput
              label="Truck Memo"
              name="truckMemo"
              type="text"
              value={riceForm.truckMemo}
              onChange={handleRiceFormChange}
              required
            />
            <FormInput
              label="Lorry Number"
              name="lorryNumber"
              type="text"
              value={riceForm.lorryNumber}
              onChange={handleRiceFormChange}
              required
            />
            <FormInput
              label="Deposit Godown"
              name="depositGodown"
              type="text"
              value={riceForm.depositGodown}
              onChange={handleRiceFormChange}
              required
            />
            <FormInput
              label="Variety"
              name="variety"
              type="text"
              value={riceForm.variety}
              onChange={handleRiceFormChange}
              required
            />
            <FormInput
              label="Godown Date"
              name="godownDate"
              type="date"
              value={riceForm.godownDate}
              onChange={handleRiceFormChange}
              required
            />
            <FormInput
              label="Acknowledgment No"
              name="ackNo"
              type="text"
              value={riceForm.ackNo}
              onChange={handleRiceFormChange}
              required
            />
            <FormInput
              label="Sample Number"
              name="sampleNumber"
              type="text"
              value={riceForm.sampleNumber}
              onChange={handleRiceFormChange}
            />
          </div>

          {/* Paddy Reference Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Paddy Record *
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="paddyReference"
                value={riceForm.paddyReference}
                onChange={(e) => handlePaddySelection(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="">Select a paddy record...</option>
                {paddyData.map((paddy) => (
                  <option key={paddy._id} value={paddy._id}>
                    {paddy.issueMemo} - {paddy.lorryNumber} - {paddy.paddyFrom} - Variety {paddy.paddyVariety}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Selected Paddy Details */}
            {selectedPaddy && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Selected Paddy Details</h4>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600 font-medium">Issue Memo:</span>
                    <span className="ml-2 text-gray-700">{selectedPaddy.issueMemo}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Lorry Number:</span>
                    <span className="ml-2 text-gray-700">{selectedPaddy.lorryNumber}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Paddy From:</span>
                    <span className="ml-2 text-gray-700">{selectedPaddy.paddyFrom}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Variety:</span>
                    <span className="ml-2 text-gray-700">Variety {selectedPaddy.paddyVariety}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Available ONB:</span>
                    <span className="ml-2 text-gray-700">{selectedPaddy.gunny?.onb || 0}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Available SS:</span>
                    <span className="ml-2 text-gray-700">{selectedPaddy.gunny?.ss || 0}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="text-center">
                    <span className="text-xs font-medium text-blue-600">Total Available Gunny (ONB + SS)</span>
                    <div className="text-lg font-bold text-blue-800">
                      {(selectedPaddy.gunny?.onb || 0) + (selectedPaddy.gunny?.ss || 0)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rice Bag Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <FormInput
              label="Rice Bags"
              name="riceBag"
              type="number"
              value={riceForm.riceBag}
              onChange={handleRiceFormChange}
              min="0"
            />
            <FormInput
              label="Rice Bags FRK"
              name="riceBagFrk"
              type="number"
              value={riceForm.riceBagFrk}
              onChange={handleRiceFormChange}
              min="0"
            />
            <FormInput
              label="Deposit Weight"
              name="depositWeight"
              type="number"
              value={riceForm.depositWeight}
              onChange={handleRiceFormChange}
              min="0"
            />
            <FormInput
              label="Deposit Weight FRK"
              name="depositWeightFrk"
              type="number"
              value={riceForm.depositWeightFrk}
              onChange={handleRiceFormChange}
              min="0"
            />
            <FormInput
              label="Total Rice Deposit"
              name="totalRiceDeposit"
              type="number"
              value={riceForm.totalRiceDeposit}
              onChange={handleRiceFormChange}
              min="0"
            />
            <FormInput
              label="Moisture"
              name="moisture"
              type="number"
              value={riceForm.moisture}
              onChange={handleRiceFormChange}
              min="0"
            />
          </div>

          {/* Gunny Downgrade Details */}
          {selectedPaddy && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-yellow-800 mb-3">Gunny Downgrade System</h4>
                <p className="text-xs text-yellow-700 mb-4">
                  Select how many gunny bags to use from each grade. They will be downgraded in rice output:
                  <br />• NB → ONB | ONB → SS | SS → SWP | SWP → SWP
                </p>
                
                {/* Validation Summary */}
                {(() => {
                  const hasShortage = 
                    usedGunnyFromPaddy.nb > (selectedPaddy.gunny?.nb || 0) ||
                    usedGunnyFromPaddy.onb > (selectedPaddy.gunny?.onb || 0) ||
                    usedGunnyFromPaddy.ss > (selectedPaddy.gunny?.ss || 0) ||
                    usedGunnyFromPaddy.swp > (selectedPaddy.gunny?.swp || 0);
                  
                  if (hasShortage) {
                    return (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span className="text-sm font-medium text-red-800">Insufficient Gunny Stock</span>
                        </div>
                        <p className="text-xs text-red-700 mt-1">
                          Some gunny grades have insufficient stock. Please reduce the requested amounts or select a different paddy record.
                        </p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium text-green-800">Sufficient Gunny Stock</span>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        All requested gunny amounts are within available stock limits.
                      </p>
                    </div>
                  );
                })()}
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* NB to ONB */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Use NB (→ ONB)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selectedPaddy.gunny?.nb || 0}
                      value={usedGunnyFromPaddy.nb}
                      onChange={(e) => handleGunnyUsageChange('nb', e.target.value)}
                      className={`block w-full border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        usedGunnyFromPaddy.nb > (selectedPaddy.gunny?.nb || 0) 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    <p className={`text-xs mt-1 ${
                      usedGunnyFromPaddy.nb > (selectedPaddy.gunny?.nb || 0) 
                        ? 'text-red-600 font-medium' 
                        : 'text-gray-500'
                    }`}>
                      Available: {selectedPaddy.gunny?.nb || 0}
                      {usedGunnyFromPaddy.nb > (selectedPaddy.gunny?.nb || 0) && 
                        ` (Shortage: ${usedGunnyFromPaddy.nb - (selectedPaddy.gunny?.nb || 0)})`
                      }
                    </p>
                  </div>
                  
                  {/* ONB to SS */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Use ONB (→ SS)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selectedPaddy.gunny?.onb || 0}
                      value={usedGunnyFromPaddy.onb}
                      onChange={(e) => handleGunnyUsageChange('onb', e.target.value)}
                      className={`block w-full border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        usedGunnyFromPaddy.onb > (selectedPaddy.gunny?.onb || 0) 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    <p className={`text-xs mt-1 ${
                      usedGunnyFromPaddy.onb > (selectedPaddy.gunny?.onb || 0) 
                        ? 'text-red-600 font-medium' 
                        : 'text-gray-500'
                    }`}>
                      Available: {selectedPaddy.gunny?.onb || 0}
                      {usedGunnyFromPaddy.onb > (selectedPaddy.gunny?.onb || 0) && 
                        ` (Shortage: ${usedGunnyFromPaddy.onb - (selectedPaddy.gunny?.onb || 0)})`
                      }
                    </p>
                  </div>
                  
                  {/* SS to SWP */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Use SS (→ SWP)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selectedPaddy.gunny?.ss || 0}
                      value={usedGunnyFromPaddy.ss}
                      onChange={(e) => handleGunnyUsageChange('ss', e.target.value)}
                      className={`block w-full border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        usedGunnyFromPaddy.ss > (selectedPaddy.gunny?.ss || 0) 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    <p className={`text-xs mt-1 ${
                      usedGunnyFromPaddy.ss > (selectedPaddy.gunny?.ss || 0) 
                        ? 'text-red-600 font-medium' 
                        : 'text-gray-500'
                    }`}>
                      Available: {selectedPaddy.gunny?.ss || 0}
                      {usedGunnyFromPaddy.ss > (selectedPaddy.gunny?.ss || 0) && 
                        ` (Shortage: ${usedGunnyFromPaddy.ss - (selectedPaddy.gunny?.ss || 0)})`
                      }
                    </p>
                  </div>
                  
                  {/* SWP stays SWP */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Use SWP (→ SWP)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selectedPaddy.gunny?.swp || 0}
                      value={usedGunnyFromPaddy.swp}
                      onChange={(e) => handleGunnyUsageChange('swp', e.target.value)}
                      className={`block w-full border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        usedGunnyFromPaddy.swp > (selectedPaddy.gunny?.swp || 0) 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    <p className={`text-xs mt-1 ${
                      usedGunnyFromPaddy.swp > (selectedPaddy.gunny?.swp || 0) 
                        ? 'text-red-600 font-medium' 
                        : 'text-gray-500'
                    }`}>
                      Available: {selectedPaddy.gunny?.swp || 0}
                      {usedGunnyFromPaddy.swp > (selectedPaddy.gunny?.swp || 0) && 
                        ` (Shortage: ${usedGunnyFromPaddy.swp - (selectedPaddy.gunny?.swp || 0)})`
                      }
                    </p>
                  </div>
                </div>
                
                {/* Result Preview */}
                <div className="mt-4 pt-4 border-t border-yellow-200">
                  <h5 className="text-sm font-semibold text-yellow-800 mb-2">Rice Output Gunny Preview</h5>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-blue-600">ONB</div>
                      <div className="text-lg font-bold text-blue-800">{usedGunnyFromPaddy.nb}</div>
                      <div className="text-xs text-gray-500">(from NB)</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-600">SS</div>
                      <div className="text-lg font-bold text-green-800">{usedGunnyFromPaddy.onb}</div>
                      <div className="text-xs text-gray-500">(from ONB)</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-purple-600">SWP</div>
                      <div className="text-lg font-bold text-purple-800">{usedGunnyFromPaddy.ss + usedGunnyFromPaddy.swp}</div>
                      <div className="text-xs text-gray-500">(from SS + SWP)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gunny Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Gunny Bags"
              name="gunnyBags"
              type="number"
              value={riceForm.gunnyBags}
              onChange={handleRiceFormChange}
              min="0"
            />
            <FormInput
              label="Gunny Weight"
              name="gunnyWeight"
              type="number"
              value={riceForm.gunnyWeight}
              onChange={handleRiceFormChange}
              min="0"
            />
          </div>

          {/* File Upload Section */}
          <FileUpload
            label="Upload Rice Documents & Images"
            module="rice"
            onFilesChange={handleFilesChange}
            files={selectedFiles}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            maxFiles={10}
            maxSize={10}
            showPreview={true}
          />


        </form>
      </DialogBox>

      {/* Invoice Template Modal */}
      <InvoiceTemplate
        record={selectedRiceForInvoice}
        show={showInvoiceModal}
        onClose={closeInvoiceModal}
        onGenerate={handleGenerateInvoice}
        type="rice"
        title="Generate Rice Deposit Invoice"
      />

      {/* Preview Invoice Modal */}
      <PreviewInvoice
        invoiceData={previewInvoiceData}
        show={showPreviewModal}
        onClose={closePreviewModal}
        onDownload={downloadInvoice}
        type="rice"
        title="Rice Deposit Invoice Preview"
      />
    </div>
  );
};

export default RiceManagement; 