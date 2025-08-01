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
import { 
  getAllPaddy, 
  createPaddy, 
  updatePaddy, 
  deletePaddy, 
  formatPaddyData, 
  formatPaddyResponse 
} from "../services/paddyService";
import { getBagWeightOptions, getDefaultBagWeightOption, formatBagWeightOptions } from "../services/bagWeightOptionService";
import WarningBox from "../components/common/WarningBox";
import { formatWeight } from "../utils/calculations";

const PaddyManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const { currentBranchId } = useSelector((state) => state.branch);
  const [paddies, setPaddies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPaddyModal, setShowPaddyModal] = useState(false);
  const [editingPaddy, setEditingPaddy] = useState(null);
  const [paddyFilter, setPaddyFilter] = useState("");
  const [paddyVarietyFilter, setPaddyVarietyFilter] = useState("");
  const [paddySourceFilter, setPaddySourceFilter] = useState("");
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

  // Paddy varieties options
  const PADDY_VARIETIES = ["A", "C"];

  // Paddy sources
  const PADDY_SOURCES = [
    "Local Farmers",
    "Traders",
    "Cooperative Societies",
    "Government Procurement",
    "Other",
  ];

  const initialPaddyForm = {
    issueDate: "",
    issueMemo: "",
    lorryNumber: "",
    paddyFrom: "",
    paddyVariety: "A",
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

  // Memoized calculations for performance
  const memoizedCalculations = useMemo(() => {
    const gunnyTotal = 
      (parseInt(paddyForm.gunny?.nb) || 0) +
      (parseInt(paddyForm.gunny?.onb) || 0) +
      (parseInt(paddyForm.gunny?.ss) || 0) +
      (parseInt(paddyForm.gunny?.swp) || 0);
    
    const bags = gunnyTotal; // Bags = Total Gunny
    const weight = bags * currentBagWeight; // Weight = Bags * currentBagWeight
    
    return {
      gunnyTotal,
      bags,
      weight
    };
  }, [paddyForm.gunny?.nb, paddyForm.gunny?.onb, paddyForm.gunny?.ss, paddyForm.gunny?.swp, currentBagWeight]);

  // Auto-update bags and weight when gunny changes
  useEffect(() => {
    setPaddyForm(prev => ({
      ...prev,
      paddy: {
        ...prev.paddy,
        bags: memoizedCalculations.bags,
        weight: memoizedCalculations.weight
      }
    }));
  }, [memoizedCalculations.bags, memoizedCalculations.weight]);

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
  const fetchPaddies = async (page = 1, limit = 10, search = '', sortBy = 'issueDate', sortOrder = 'desc', variety = '', source = '') => {
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
        source: source || undefined
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
      fetchPaddies(1, paginationData.limit, paddyFilter, sortData.col, sortData.dir, paddyVarietyFilter, paddySourceFilter);
    }
  }, [currentBranchId]);



  // Handle page change
  const handlePageChange = (newPage) => {
    fetchPaddies(newPage, paginationData.limit, paddyFilter, sortData.col, sortData.dir, paddyVarietyFilter, paddySourceFilter);
  };

  // Handle page size change
  const handlePageSizeChange = (newLimit) => {
    fetchPaddies(1, newLimit, paddyFilter, sortData.col, sortData.dir, paddyVarietyFilter, paddySourceFilter);
  };

  // Handle sorting
  const handleSort = (newSort) => {
    setSortData(newSort);
    const sortBy = newSort.col !== null ? ['issueDate', 'issueMemo', 'lorryNumber', 'paddyFrom', 'paddyVariety'][newSort.col] : 'issueDate';
    const sortOrder = newSort.dir;
    fetchPaddies(1, paginationData.limit, paddyFilter, sortBy, sortOrder, paddyVarietyFilter, paddySourceFilter);
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
    setShowPaddyModal(true);
  };

  const closePaddyModal = () => {
    setShowPaddyModal(false);
    setEditingPaddy(null);
    setPaddyForm(initialPaddyForm);
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

  // Handle gunny total change to update bag count (now simplified due to useMemo)
  const handleGunnyTotalChange = (totalGunny) => {
    // This is now handled automatically by useMemo and useEffect
    // Keeping for backward compatibility with GunnyEntryDetails
    console.log('Gunny total updated via callback:', totalGunny);
  };

  const handleBagWeightChange = (newWeight) => {
    setCurrentBagWeight(newWeight);
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
      
      if (editingPaddy) {
        const response = await updatePaddy(editingPaddy.id, formattedPaddy);
        setSuccessMessage("Paddy record updated successfully!");
        // Refresh current page data
        fetchPaddies(paginationData.page, paginationData.limit, paddyFilter, sortData.col, sortData.dir);
      } else {
        const response = await createPaddy(formattedPaddy);
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

  const deletePaddy = async (paddyId) => {
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
    fetchPaddies(1, paginationData.limit, newFilter, sortData.col, sortData.dir, paddyVarietyFilter, paddySourceFilter);
  };

  const handleVarietyFilterChange = (newVariety) => {
    setPaddyVarietyFilter(newVariety);
    // Trigger API call with new filters
    fetchPaddies(1, paginationData.limit, paddyFilter, sortData.col, sortData.dir, newVariety, paddySourceFilter);
  };

  const handleSourceFilterChange = (newSource) => {
    setPaddySourceFilter(newSource);
    // Trigger API call with new filters
    fetchPaddies(1, paginationData.limit, paddyFilter, sortData.col, sortData.dir, paddyVarietyFilter, newSource);
  };

  // Server-side filtering is now handled by the API
  const filteredPaddies = paddies;

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
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Add Paddy
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

      {/* Responsive Filters */}
      <ResponsiveFilters title="Filters & Search" className="mb-6">
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
        <TableFilters
          searchValue=""
          selectValue={paddySourceFilter}
          selectOptions={PADDY_SOURCES.map(source => ({
            value: source,
            label: source
          }))}
          onSelectChange={(e) => handleSourceFilterChange(e.target.value)}
          selectPlaceholder="All Sources"
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
      </ResponsiveFilters>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <GroupedTable
            data={filteredPaddies}
            groupedHeaders={groupedHeaders}
            serverSidePagination={true}
            paginationData={paginationData}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSort={handleSort}
            sortData={sortData}
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
                onClick={() => deletePaddy(paddy.id)}
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
                              deletePaddy(paddy.id);
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
            <FormSelect
              label="Paddy From"
              name="paddyFrom"
              value={paddyForm.paddyFrom}
              onChange={handlePaddyFormChange}
              required
            >
              <option value="">Select Source</option>
              {PADDY_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </FormSelect>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Paddy Variety"
              name="paddyVariety"
              value={paddyForm.paddyVariety}
              onChange={handlePaddyFormChange}
              required
            >
              {PADDY_VARIETIES.map((variety) => (
                <option key={variety} value={variety}>
                  {variety}
                </option>
              ))}
            </FormSelect>
          </div>

          {/* Gunny Details */}
          <GunnyEntryDetails
            gunnyData={paddyForm.gunny}
            onChange={handlePaddyFormChange}
            enableAutoCalculation={true}
            onGunnyTotalChange={handleGunnyTotalChange}
          />

          {/* Auto-calculation Status */}
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm text-green-800">
              <div className="font-medium mb-2">🔄 Auto-Calculation Status:</div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-medium">Total Gunny:</span>
                  <span className="ml-1 text-lg font-bold">{memoizedCalculations.gunnyTotal}</span>
                </div>
                <div>
                  <span className="font-medium">Bags:</span>
                  <span className="ml-1 text-lg font-bold">{memoizedCalculations.bags}</span>
                </div>
                <div>
                  <span className="font-medium">Weight:</span>
                                          <span className="ml-1 text-lg font-bold">{formatWeight(memoizedCalculations.weight)}</span>
                </div>
              </div>
              <div className="text-xs mt-2 text-green-600">
                Formula: Gunny Total → Bags → Weight (1 bag = {currentBagWeight}kg = {(currentBagWeight/1000).toFixed(2)} tons)
              </div>
            </div>
          </div>

          {/* Paddy Details */}
          <PaddyEntryDetails
            paddyData={paddyForm.paddy}
            onChange={handlePaddyFormChange}
            enableAutoCalculation={false} // Disable auto-calculation since bags are controlled by gunny count
            disabled={true} // Disable both fields since they're auto-calculated
            onBagWeightChange={handleBagWeightChange}
          />

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <Button onClick={closePaddyModal} variant="secondary" icon="close">
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon="save">
              {editingPaddy ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogBox>
      </div>
    </div>
  );
};

export default PaddyManagement;
