import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import Button from "../components/common/Button";
import DialogBox from "../components/common/DialogBox";
import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import TableList from "../components/common/TableList";
import GroupedTable from "../components/common/GroupedTable";
import TableFilters from "../components/common/TableFilters";
import BranchFilter from "../components/common/BranchFilter";
import ResponsiveFilters from "../components/common/ResponsiveFilters";
import LoadingSpinner from "../components/common/LoadingSpinner";
import GunnyEntryDetails from "../components/common/GunnyEntryDetails";
import PaddyEntryDetails from "../components/common/PaddyEntryDetails";
import FileUpload from "../components/common/FileUpload";
import DateRangeFilter from "../components/common/DateRangeFilter";
import { 
  getAllPaddy, 
  createPaddy, 
  updatePaddy, 
  deletePaddy, 
  formatPaddyData, 
  formatPaddyResponse,
  testPaddyAPI,
  testSimplePaddyAPI,
  testPaddyCreate
} from "../services/paddyService";
import { getBagWeightOptions, getDefaultBagWeightOption, formatBagWeightOptions } from "../services/bagWeightOptionService";
import WarningBox from "../components/common/WarningBox";
import { formatWeight } from "../utils/calculations";
import { PADDY_VARIETIES } from "../utils/constants";

const PaddyManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const { currentBranchId } = useSelector((state) => state.branch);
  const [paddies, setPaddies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPaddyModal, setShowPaddyModal] = useState(false);
  const [editingPaddy, setEditingPaddy] = useState(null);
  const [paddyFilter, setPaddyFilter] = useState("");
  const [paddyVarietyFilter, setPaddyVarietyFilter] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const [expandedPaddy, setExpandedPaddy] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentBagWeight, setCurrentBagWeight] = useState(50); // Default 50kg per bag
  
  // Server-side pagination state
  const [paginationData, setPaginationData] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [sortData, setSortData] = useState({ col: null, dir: 'asc' });





  const initialPaddyForm = {
    issueDate: "",
    issueMemo: "",
    lorryNumber: "",
    paddyFrom: "",
    paddyVariety: "A",
    moisture: "",
    gunny: {
      nb: '',
      onb: '',
      ss: '',
      swp: '',
    },
    paddy: {
      bags: '',
      weight: '',
    },
    branch_id: currentBranchId,
    createdBy: user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const [paddyForm, setPaddyForm] = useState(initialPaddyForm);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);





  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Load default bag weight when branch changes
  useEffect(() => {
    const loadDefaultBagWeight = async () => {
      if (!currentBranchId) return;
      
      try {
        const response = await getBagWeightOptions(currentBranchId);
        if (response.success) {
          const defaultOption = getDefaultBagWeightOption(response.data);
          setCurrentBagWeight(parseFloat(defaultOption.value));
        }
      } catch (error) {
        console.error('Error loading default bag weight:', error);
        // Keep default 50kg if API fails
      }
    };

    loadDefaultBagWeight();
  }, [currentBranchId]);

  // Fetch paddy data with server-side pagination
  const fetchPaddies = async (page = 1, limit = 10, search = '', sortBy = 'issueDate', sortOrder = 'desc', variety = '', startDate = '', endDate = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        variety: variety || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };
      
      console.log('Fetching paddies with params:', params);
      console.log('Current branch ID:', currentBranchId);
      const response = await getAllPaddy(params);
      console.log('Raw API response:', response);
      
      if (response.success) {
        const formattedPaddies = response.data.map(formatPaddyResponse);
        console.log('Formatted paddies:', formattedPaddies);
        setPaddies(formattedPaddies);
        setPaginationData(response.pagination);
      } else {
        throw new Error(response.message || 'Failed to fetch paddy records');
      }
    } catch (error) {
      console.error("Error fetching paddies:", error);
      setError(error.message || "Failed to fetch paddy records");
      setPaddies([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    // Only fetch if currentBranchId is available
    if (currentBranchId !== undefined) {
      fetchPaddies(1, paginationData.limit, paddyFilter, sortData.col, sortData.dir, paddyVarietyFilter, dateRange.startDate, dateRange.endDate);
    }
  }, [currentBranchId, dateRange]);



  // Handle page change
  const handlePageChange = (newPage) => {
    fetchPaddies(newPage, paginationData.limit, paddyFilter, sortData.col, sortData.dir, paddyVarietyFilter, dateRange.startDate, dateRange.endDate);
  };

  // Handle page size change
  const handlePageSizeChange = (newLimit) => {
    fetchPaddies(1, newLimit, paddyFilter, sortData.col, sortData.dir, paddyVarietyFilter, dateRange.startDate, dateRange.endDate);
  };

  // Handle sorting
  const handleSort = (newSort) => {
    setSortData(newSort);
    const sortBy = newSort.col !== null ? ['issueDate', 'issueMemo', 'lorryNumber', 'paddyFrom', 'paddyVariety'][newSort.col] : 'issueDate';
    const sortOrder = newSort.dir;
    fetchPaddies(1, paginationData.limit, paddyFilter, sortBy, sortOrder, paddyVarietyFilter, dateRange.startDate, dateRange.endDate);
  };

  // Paddy CRUD operations
  const openPaddyModal = (paddy = null) => {
    setEditingPaddy(paddy);
    
    // Debug: Check if the paddy data is already formatted
    console.log('Raw paddy data:', paddy);
    
    const formData = paddy
      ? {
          ...initialPaddyForm,
          issueDate: paddy.issueDate || "", // Explicitly set the date
          issueMemo: paddy.issueMemo || "",
          lorryNumber: paddy.lorryNumber || "",
          paddyFrom: paddy.paddyFrom || "",
          paddyVariety: paddy.paddyVariety || "A",
          moisture: paddy.moisture || "",
          gunny: { ...initialPaddyForm.gunny, ...(paddy.gunny || {}) },
          paddy: { ...initialPaddyForm.paddy, ...(paddy.paddy || {}) },
        }
      : initialPaddyForm;
    
    console.log('Form data after setting:', formData);
    console.log('Issue date in form:', formData.issueDate);
    
    // Set the bag weight from the record if editing, otherwise use default
    if (paddy && paddy.bagWeight) {
      setCurrentBagWeight(paddy.bagWeight);
    } else {
      setCurrentBagWeight(50); // Default 50kg
    }
    
    setPaddyForm(formData);
    
    // Set existing files if editing
    if (paddy && paddy.documents) {
      setUploadedFiles(paddy.documents);
    } else {
      setUploadedFiles([]);
    }
    
    setShowPaddyModal(true);
  };

  const closePaddyModal = () => {
    setShowPaddyModal(false);
    setEditingPaddy(null);
    setPaddyForm(initialPaddyForm);
    setSelectedFiles([]);
    setUploadedFiles([]);
  };

  const handlePaddyFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "gunny") {
      setPaddyForm({
        ...paddyForm,
        gunny: value,
      });
    } else if (name === "paddy") {
      setPaddyForm({
        ...paddyForm,
        paddy: value,
      });
    } else {
      setPaddyForm({ ...paddyForm, [name]: value });
    }
  };



  const handleBagWeightChange = (newWeight) => {
    setCurrentBagWeight(newWeight);
  };

  const handleFilesChange = (files) => {
    console.log('Files selected:', files);
    setSelectedFiles(files);
  };

  const handleFileUploadSuccess = (uploadedFiles) => {
    console.log('Files uploaded successfully:', uploadedFiles);
    setUploadedFiles(uploadedFiles);
    setSelectedFiles([]); // Clear selected files after upload
  };



  const savePaddy = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const formattedPaddy = formatPaddyData(paddyForm);
      // Add the current bag weight to the data
      formattedPaddy.bagWeight = currentBagWeight;
      
      console.log('Saving paddy with uploaded files:', uploadedFiles);
      console.log('Formatted paddy data:', formattedPaddy);
      console.log('Editing Paddy object:', editingPaddy);
      console.log('Editing Paddy ID:', editingPaddy?.id);
      
      if (editingPaddy) {
        console.log('Attempting to update Paddy with ID:', editingPaddy.id);
        const response = await updatePaddy(editingPaddy.id, formattedPaddy, uploadedFiles);
        setSuccessMessage("Paddy record updated successfully!");
        // Refresh current page data
        fetchPaddies(paginationData.page, paginationData.limit, paddyFilter, sortData.col, sortData.dir);
      } else {
        console.log('Creating new Paddy record');
        const response = await createPaddy(formattedPaddy, uploadedFiles);
        setSuccessMessage("Paddy record created successfully!");
        // Refresh current page data
        fetchPaddies(paginationData.page, paginationData.limit, paddyFilter, sortData.col, sortData.dir);
      }
      closePaddyModal();
    } catch (error) {
      console.error("Error saving paddy:", error);
      setError(error.message || "Failed to save paddy record");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaddy = async (paddyId) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await deletePaddy(paddyId);
      setSuccessMessage("Paddy record deleted successfully!");
      // Refresh current page data
      fetchPaddies(paginationData.page, paginationData.limit, paddyFilter, sortData.col, sortData.dir);
    } catch (error) {
      console.error("Error deleting paddy:", error);
      setError(error.message || "Failed to delete paddy record");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes for server-side filtering
  const handleFilterChange = (newFilter) => {
    setPaddyFilter(newFilter);
    fetchPaddies(1, paginationData.limit, newFilter, sortData.col, sortData.dir, paddyVarietyFilter);
  };

  const handleVarietyFilterChange = (newVariety) => {
    setPaddyVarietyFilter(newVariety);
    // Trigger API call with new filters
    fetchPaddies(1, paginationData.limit, paddyFilter, sortData.col, sortData.dir, newVariety, dateRange.startDate, dateRange.endDate);
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };



  // Server-side filtering is now handled by the API
  const filteredPaddies = paddies;

  // Calculate summary statistics
  const calculateSummaryStats = () => {
    const stats = {
      totalPaddyBags: 0,
      totalPaddyWeight: 0,
      totalRiceOutput: 0,
      totalByProducts: 0,
      totalGunny: 0,
      averageMoisture: 0,
      recordCount: paddies.length
    };

    if (paddies.length > 0) {
      let totalMoisture = 0;
      let moistureCount = 0;

      paddies.forEach(paddy => {
        // Paddy totals
        stats.totalPaddyBags += paddy.paddy?.bags || 0;
        stats.totalPaddyWeight += paddy.paddy?.weight || 0;
        
        // Rice output (67% of paddy weight)
        const riceOutput = (paddy.paddy?.weight || 0) * 0.67;
        stats.totalRiceOutput += riceOutput;
        
        // By-products (33% of paddy weight - husk, bran, etc.)
        const byProducts = (paddy.paddy?.weight || 0) * 0.33;
        stats.totalByProducts += byProducts;
        
        // Gunny totals
        const gunnyTotal = (paddy.gunny?.nb || 0) + (paddy.gunny?.onb || 0) + (paddy.gunny?.ss || 0) + (paddy.gunny?.swp || 0);
        stats.totalGunny += gunnyTotal;
        
        // Moisture average
        if (paddy.moisture !== undefined && paddy.moisture !== null) {
          totalMoisture += paddy.moisture;
          moistureCount++;
        }
      });

      // Calculate average moisture
      if (moistureCount > 0) {
        stats.averageMoisture = totalMoisture / moistureCount;
      }
    }

    return stats;
  };

  const summaryStats = calculateSummaryStats();

  // Table columns configuration
//   const columns = [
//     {
//       key: "issueDate",
//       label: "Issue Date",
//       render: (value) => new Date(value).toLocaleDateString(),
//     },
//     { key: "issueMemo", label: "Issue Memo" },
//     { key: "lorryNumber", label: "Lorry Number" },
//     { key: "paddyFrom", label: "Paddy From" },
//     { key: "paddyVariety", label: "Variety" },
//     {
//       key: "gunny",
//       label: "Gunny (NB/ONB/SS/SWP)",
//       render: (gunny) =>
//         `${gunny?.nb || 0}/${gunny?.onb || 0}/${gunny?.ss || 0}/${
//           gunny?.swp || 0
//         }`,
//     },
//     {
//       key: "paddy",
//       label: "Paddy (Bags/Weight)",
//       render: (paddy) => `${paddy?.bags || 0}/${formatWeight(paddy?.weight || 0)}`,
//     },
//   ];

const groupedHeaders = [
  {
    // label: "S.NO",
    columns: [
      {
        key: "serialNumber",
        label: "S.NO",
      }
    ]
  },
  {
    // label: "ISSUE DATE",
    columns: [
      {
        key: "issueDate",
        label: "ISSUE DATE",
        render: (value) => new Date(value).toLocaleDateString(),
      }
    ]
  },
  {
    // label: "ISSUE MEMO",
    columns: [
      {
        key: "issueMemo",
        label: "ISSUE MEMO",
        render: (value) => value,
      }
    ]
  },
  {
    // label: "PADDY FROM",
    columns: [
      {
        key: "paddyFrom",
        label: "PADDY FROM",
        render: (value) => value,
      }
    ]
  },
  {
    // label: "PADDY VARIETY",
    columns: [
      {
        key: "paddyVariety",
        label: "PADDY VARIETY",
        render: (value) => value,
      }
    ]
  },
 
  {
    label: "GUNNY",
    columns: [
      {
        key: "gunny.nb",
        label: "NB",
        render: (value, record) => record.gunny?.nb || 0,
      },
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
      }
    ]
  },
  {
    label: "PADDY",
    columns: [
      {
        key: "paddy.bags",
        label: "BAGS",
        render: (value, record) => record.paddy?.bags || 0,
      },
      {
        key: "paddy.weight",
        label: "WEIGHT",
        render: (value, record) => formatWeight(record.paddy?.weight || 0),
      }
    ]
  },
  {
    columns: [
      {
        key: "riceOutput",
        label: "RICE OUTPUT",
        render: (value, record) => {
          const paddyWeight = record.paddy?.weight || 0;
          const riceOutput = paddyWeight * 0.67; // 67% of paddy weight
          return formatWeight(riceOutput);
        },
      }
    ]
  }, {
    // label: "MOISTURE",
    columns: [
      {
        key: "moisture",
        label: "MOISTURE (%)",
        render: (value) => value ? `${value}%` : '0%',
      }
    ]
  },
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
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Paddy Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage rice paddy inventory</p>
          </div>
          {currentBranchId && currentBranchId !== 'all' && (
            <div className="flex justify-center sm:justify-start">
              <Button
                onClick={() => openPaddyModal()}
                variant="primary"
                icon="plus"
                className="px-6 py-3"
              >
                Add New Paddy
              </Button>
            
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6">

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800">
            <div className="font-medium">Error:</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-800">
            <div className="font-medium">Success:</div>
            <div>{successMessage}</div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-lg font-semibold text-gray-800">Summary Statistics</h3>
            <p className="text-sm text-gray-600 mt-1">Total records: {summaryStats.recordCount}</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Paddy */}
              <div className="text-center">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {summaryStats.totalPaddyBags.toLocaleString()}
                  </div>
                  <div className="text-sm font-medium text-gray-700">Total Paddy Bags</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatWeight(summaryStats.totalPaddyWeight)}
                  </div>
                </div>
              </div>

              {/* Rice Output */}
              <div className="text-center">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {formatWeight(summaryStats.totalRiceOutput)}
                  </div>
                  <div className="text-sm font-medium text-gray-700">Rice Output</div>
                  <div className="text-xs text-gray-500 mt-1">
                    67% of paddy weight
                  </div>
                </div>
              </div>

              {/* By-Products */}
              <div className="text-center">
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {formatWeight(summaryStats.totalByProducts)}
                  </div>
                  <div className="text-sm font-medium text-gray-700">By-Products</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Husk, bran, etc. (33%)
                  </div>
                </div>
              </div>

              {/* Gunny & Moisture */}
              <div className="text-center">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {summaryStats.totalGunny.toLocaleString()}
                  </div>
                  <div className="text-sm font-medium text-gray-700">Total Gunny</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Avg. Moisture: {summaryStats.averageMoisture.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="font-medium text-gray-700 mb-1">Processing Ratio</div>
                <div className="text-gray-600">
                  <div>• Rice: 67% of paddy weight</div>
                  <div>• By-products: 33% of paddy weight</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="font-medium text-gray-700 mb-1">Weight Distribution</div>
                <div className="text-gray-600">
                  <div>• Total Paddy: {formatWeight(summaryStats.totalPaddyWeight)}</div>
                  <div>• Total Rice: {formatWeight(summaryStats.totalRiceOutput)}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="font-medium text-gray-700 mb-1">Quality Metrics</div>
                <div className="text-gray-600">
                  <div>• Average Moisture: {summaryStats.averageMoisture.toFixed(1)}%</div>
                  <div>• Total Records: {summaryStats.recordCount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Filters */}
      <ResponsiveFilters title="Filters & Search" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TableFilters
            searchValue={paddyFilter}
            searchPlaceholder="Search paddy records..."
            onSearchChange={(e) => handleFilterChange(e.target.value)}
            showSelect={false}
          />
          <TableFilters
            searchValue=""
            selectValue={paddyVarietyFilter}
            selectOptions={PADDY_VARIETIES.map(variety => ({
              value: variety,
              label: `Variety ${variety}`
            }))}
            onSelectChange={(e) => handleVarietyFilterChange(e.target.value)}
            selectPlaceholder="All Varieties"
            showSearch={false}
            showSelect={true}
          />
          <BranchFilter
            value={currentBranchId || ''}
            onChange={(e) => {
              // The BranchFilter component will handle Redux updates for superadmin users
              // This will automatically trigger a re-fetch when currentBranchId changes
              console.log('Branch filter changed:', e.target.value);
            }}
          />
        </div>
        <div className="mt-4">
          <DateRangeFilter
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onStartDateChange={(e) => handleDateRangeChange('startDate', e.target.value)}
            onEndDateChange={(e) => handleDateRangeChange('endDate', e.target.value)}
            startDateLabel="Issue Date From"
            endDateLabel="Issue Date To"
          />
        </div>
      </ResponsiveFilters>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <GroupedTable
            tableTitle="Paddy Records"
            data={filteredPaddies}
            groupedHeaders={groupedHeaders}
            serverSidePagination={true}
            paginationData={paginationData}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSort={handleSort}
            sortData={sortData}
            renderDetail={(paddy) => (
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Issue Date:</span>
                      <span className="text-gray-900 font-medium">
                        {new Date(paddy.issueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Issue Memo:</span>
                      <span className="text-gray-900 font-medium">{paddy.issueMemo}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Lorry Number:</span>
                      <span className="text-gray-900 font-medium">{paddy.lorryNumber}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Paddy From:</span>
                      <span className="text-gray-900 font-medium">{paddy.paddyFrom}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Variety:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        paddy.paddyVariety === 'A' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        Variety {paddy.paddyVariety}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Moisture:</span>
                      <span className="text-gray-900 font-medium">{paddy.moisture || 0}%</span>
                    </div>
                    {paddy.bagWeight && (
                      <div className="flex items-center">
                        <span className="w-24 text-sm font-medium text-gray-600">Bag Weight:</span>
                        <span className="text-gray-900 font-medium">{paddy.bagWeight} kg</span>
                      </div>
                    )}
                    {paddy.createdAt && (
                      <div className="flex items-center">
                        <span className="w-24 text-sm font-medium text-gray-600">Created:</span>
                        <span className="text-gray-900 font-medium">
                          {new Date(paddy.createdAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {paddy.updatedAt && paddy.updatedAt !== paddy.createdAt && (
                      <div className="flex items-center">
                        <span className="w-24 text-sm font-medium text-gray-600">Updated:</span>
                        <span className="text-gray-900 font-medium">
                          {new Date(paddy.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {/* Gunny Summary */}
                    <div className="p-3 bg-white rounded-lg border border-gray-200 w-full">
                      <h5 className="text-sm font-semibold text-gray-800 mb-2">Gunny Summary</h5>
                      <div className="grid grid-cols-4 gap-2 text-xs w-full">
                        <div className="text-center">
                          <div className="font-medium text-blue-600">NB</div>
                          <div className="text-gray-900">{paddy.gunny?.nb || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-green-600">ONB</div>
                          <div className="text-gray-900">{paddy.gunny?.onb || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-yellow-600">SS</div>
                          <div className="text-gray-900">{paddy.gunny?.ss || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-purple-600">SWP</div>
                          <div className="text-gray-900">{paddy.gunny?.swp || 0}</div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-center">
                          <div className="text-xs font-medium text-gray-600">Total Gunny</div>
                          <div className="text-lg font-bold text-indigo-600">
                            {(paddy.gunny?.nb || 0) + (paddy.gunny?.onb || 0) + (paddy.gunny?.ss || 0) + (paddy.gunny?.swp || 0)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paddy Summary */}
                    <div className="p-3 bg-white rounded-lg border border-gray-200 w-full">
                      <h5 className="text-sm font-semibold text-gray-800 mb-2">Paddy Summary</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm w-full">
                        <div>
                          <span className="text-gray-600">Bags:</span>
                          <span className="ml-1 font-medium text-indigo-600">{paddy.paddy?.bags || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Weight:</span>
                          <span className="ml-1 font-medium text-red-600">{formatWeight(paddy.paddy?.weight || 0)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rice Output Calculation */}
                    <div className="p-3 bg-white rounded-lg border border-gray-200 w-full">
                      <h5 className="text-sm font-semibold text-gray-800 mb-2">Expected Rice Output</h5>
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">(67% of paddy weight)</div>
                        <div className="text-lg font-bold text-green-600">
                          {formatWeight((paddy.paddy?.weight || 0) * 0.67)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            actions={(paddy) => [
              <Button
                key="edit"
                onClick={() => openPaddyModal(paddy)}
                variant="info"
                icon="edit"
              >
                Edit
              </Button>,
              <Button
                key="delete"
                onClick={() => handleDeletePaddy(paddy.id)}
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
            <h3 className="text-lg font-semibold text-gray-800">Paddy Records</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {paginationData.total} records</p>
          </div>
          
          <div className="p-4">
            {filteredPaddies.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No paddy records</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new paddy record.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPaddies.map((paddy) => (
                  <div key={paddy.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Mobile Table Row */}
                    <div 
                      className="bg-white p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedPaddy(expandedPaddy === paddy.id ? null : paddy.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{paddy.issueMemo}</div>
                          <div className="text-sm text-gray-600">{paddy.lorryNumber}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(paddy.issueDate).toLocaleDateString()} • {paddy.paddyVariety}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openPaddyModal(paddy);
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
                              handleDeletePaddy(paddy.id);
                            }}
                            variant="danger"
                            icon="delete"
                            className="text-xs px-2 py-1"
                          >
                            Delete
                          </Button>
                          <svg 
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              expandedPaddy === paddy.id ? 'rotate-180' : ''
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
                    {expandedPaddy === paddy.id && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border-t border-gray-200">
                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <span className="ml-1 font-medium text-gray-900">
                              {new Date(paddy.issueDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Variety:</span>
                            <span className="ml-1 font-medium text-gray-900">{paddy.paddyVariety}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Source:</span>
                            <span className="ml-1 font-medium text-gray-900">{paddy.paddyFrom}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Moisture:</span>
                            <span className="ml-1 font-medium text-gray-900">{paddy.moisture || 0}%</span>
                          </div>
                        </div>

                        {/* Gunny Summary */}
                        <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200 w-full">
                          <h5 className="text-sm font-semibold text-gray-800 mb-2">Gunny Summary</h5>
                          <div className="grid grid-cols-4 gap-1 text-xs w-full">
                            <div className="text-center">
                              <div className="font-medium text-blue-600 truncate">NB</div>
                              <div className="text-gray-900 truncate">{paddy.gunny?.nb || 0}</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-blue-600 truncate">ONB</div>
                              <div className="text-gray-900 truncate">{paddy.gunny?.onb || 0}</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-blue-600 truncate">SS</div>
                              <div className="text-gray-900 truncate">{paddy.gunny?.ss || 0}</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-blue-600 truncate">SWP</div>
                              <div className="text-gray-900 truncate">{paddy.gunny?.swp || 0}</div>
                            </div>
                          </div>
                        </div>

                        {/* Paddy Summary */}
                        <div className="p-3 bg-white rounded-lg border border-gray-200 w-full">
                          <h5 className="text-sm font-semibold text-gray-800 mb-2">Paddy Summary</h5>
                          <div className="grid grid-cols-2 gap-2 text-xs w-full">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 truncate">Bags:</span>
                              <span className="font-medium text-green-600 ml-2">{paddy.paddy?.bags || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 truncate">Weight:</span>
                              <span className="font-medium text-green-600 ml-2">{formatWeight(paddy.paddy?.weight || 0)}</span>
                            </div>
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

      {/* Paddy Form Modal */}
      <DialogBox
        title={editingPaddy ? "Edit Paddy Details" : "Add Paddy Details"}
        show={showPaddyModal}
        onClose={closePaddyModal}
        onSubmit={savePaddy}
        submitText={editingPaddy ? "Update" : "Create"}
        cancelText="Cancel"
        size="2xl"
      >
        <form onSubmit={savePaddy} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Issue Date"
              name="issueDate"
              type="date"
              value={paddyForm.issueDate}
              onChange={handlePaddyFormChange}
              required
              icon="calendar"
            />
            <FormInput
              label="Issue Memo"
              name="issueMemo"
              value={paddyForm.issueMemo}
              onChange={handlePaddyFormChange}
              required
              icon="file"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Lorry Number"
              name="lorryNumber"
              value={paddyForm.lorryNumber}
              onChange={handlePaddyFormChange}
              required
              icon="truck"
            />
            <FormInput
              label="Paddy From"
              name="paddyFrom"
              value={paddyForm.paddyFrom}
              onChange={handlePaddyFormChange}
              required
              icon="location"
              placeholder="Enter paddy source (e.g., farmer name, location, trader, etc.)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Paddy Variety"
              name="paddyVariety"
              value={paddyForm.paddyVariety}
              onChange={handlePaddyFormChange}
              required
              icon="seedling"
            >
              {PADDY_VARIETIES.map((variety) => (
                <option key={variety} value={variety}>
                  {variety}
                </option>
              ))}
            </FormSelect>
            <FormInput
              label="Moisture (%)"
              name="moisture"
              type="number"
              value={paddyForm.moisture}
              onChange={handlePaddyFormChange}
              min="0"
              max="100"
              step="0.1"
              icon="droplet"
            />
          </div>

          {/* Gunny Details */}
          <GunnyEntryDetails
            gunnyData={paddyForm.gunny}
            onChange={handlePaddyFormChange}
            enableAutoCalculation={true}
          />



          {/* Paddy Details */}
          <PaddyEntryDetails
            paddyData={paddyForm.paddy}
            onChange={handlePaddyFormChange}
            enableAutoCalculation={true} // Enable auto-calculation for manual input
            disabled={false} // Enable both fields for manual editing
            onBagWeightChange={handleBagWeightChange}
          />

          {/* File Upload Section */}
          <FileUpload
            label="Upload Paddy Documents & Images"
            module="paddy"
            onFilesChange={handleFilesChange}
            onUploadSuccess={handleFileUploadSuccess}
            files={selectedFiles}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            maxFiles={10}
            maxSize={10}
            showPreview={true}
            disableAutoUpload={false}
          />


        </form>
      </DialogBox>
      </div>
    </div>
  );
};

export default PaddyManagement;
