import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import Button from "../components/common/Button";
import DialogBox from "../components/common/DialogBox";
import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import TableList from "../components/common/TableList";
import TableFilters from "../components/common/TableFilters";
import BranchFilter from "../components/common/BranchFilter";

import LoadingSpinner from "../components/common/LoadingSpinner";
import GunnyEntryDetails from "../components/common/GunnyEntryDetails";
import PaddyEntryDetails from "../components/common/PaddyEntryDetails";
import FileUpload from "../components/common/FileUpload";
import DateRangeFilter from "../components/common/DateRangeFilter";
import gunnyService from "../services/gunnyService";
import gunnyAggregationService from "../services/gunnyAggregationService";
import branchService from "../services/branchService";
import { formatWeight } from "../utils/calculations";
import { PADDY_VARIETIES } from "../utils/constants";

const GunnyManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const { currentBranchId, availableBranches } = useSelector((state) => state.branch);
  const [gunnyRecords, setGunnyRecords] = useState([]);
  const [allGunnyData, setAllGunnyData] = useState({
    paddyRecords: [],
    riceRecords: [],

    gunnyRecords: []
  });
  const [loading, setLoading] = useState(false);
  const [aggregatedLoading, setAggregatedLoading] = useState(false);
  const [showGunnyModal, setShowGunnyModal] = useState(false);
  const [currentBranchName, setCurrentBranchName] = useState("");
  const [editingGunny, setEditingGunny] = useState(null);
  const [gunnyFilter, setGunnyFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [expandedGunny, setExpandedGunny] = useState(null);
  const [selectedSource, setSelectedSource] = useState("all");
  const [stats, setStats] = useState({
    totalNB: 0,
    totalONB: 0,
    totalSS: 0,
    totalSWP: 0,
    totalBags: 0,
    totalWeight: 0,
    count: 0
  });
  const [aggregatedStats, setAggregatedStats] = useState({
    totalRecords: 0,
    totalNB: 0,
    totalONB: 0,
    totalSS: 0,
    totalSWP: 0,
    totalBags: 0,
    totalWeight: 0,
    bySource: {
      paddy: { count: 0, nb: 0, onb: 0, ss: 0, swp: 0, bags: 0, weight: 0 },
      rice: { count: 0, nb: 0, onb: 0, ss: 0, swp: 0, bags: 0, weight: 0 },
      
      gunny: { count: 0, nb: 0, onb: 0, ss: 0, swp: 0, bags: 0, weight: 0 }
    }
  });





  const initialGunnyForm = {
    issueDate: "",
    issueMemo: "",
    lorryNumber: "",
    paddyFrom: "",
    paddyVariety: "",
    gunny: {
      nb: 0,
      onb: 0,
      ss: 0,
      swp: 0,
    },
    paddy: {
      bags: 0,
      weight: 0,
    },
  };

  const [gunnyForm, setGunnyForm] = useState(initialGunnyForm);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Fetch gunny data
  useEffect(() => {
    fetchGunnyData();
    fetchGunnyStats();
    fetchAllGunnyData();
    
    // Fetch available branches if not already loaded
    if (availableBranches.length === 0) {
      const fetchBranches = async () => {
        try {
          const branches = await branchService.getAllBranches();
          // You might need to dispatch this to Redux if you have a setAvailableBranches action
          console.log('Available branches loaded:', branches);
        } catch (error) {
          console.error('Error fetching available branches:', error);
        }
      };
      fetchBranches();
    }
  }, []);

  // Fetch branch name when branch ID changes
  const fetchBranchName = async (branchId) => {
    if (branchId && branchId !== 'all') {
      console.log('Current user:', user);
      console.log('Current branch ID:', branchId);
      
      // For now, let's use a hardcoded mapping to test the format
      // In production, this should come from the database
      const branchNameMap = {
        '688768191ce21366b297cc8a': 'Madurai',
        '688767e41ce21366b297cc45': 'Chennai'
      };
      
      const millCodeMap = {
        '688768191ce21366b297cc8a': 'MA00228891S',
        '688767e41ce21366b297cc45': 'CH00228891S'
      };
      
      const branchName = branchNameMap[branchId] || 'Branch';
      const millCode = millCodeMap[branchId] || branchId;
      
      // Store both name and mill code
      setCurrentBranchName(`${branchName} (${millCode})`);
    } else {
      setCurrentBranchName("");
    }
  };

  // Refetch data when branch changes
  useEffect(() => {
    if (currentBranchId) {
      fetchGunnyData();
      fetchGunnyStats();
      fetchAllGunnyData();
    }
  }, [currentBranchId]);

  // Fetch branch name after gunny data is loaded
  useEffect(() => {
    if (currentBranchId && gunnyRecords.length > 0) {
      fetchBranchName(currentBranchId);
    }
  }, [currentBranchId, gunnyRecords]);

  const fetchGunnyData = async () => {
    try {
      setLoading(true);
      const data = await gunnyService.getAllGunny();
      // Format the data for frontend display
      const formattedData = data.map(gunny => gunnyService.formatGunnyResponse(gunny));
      setGunnyRecords(formattedData);
    } catch (error) {
      console.error('Error fetching gunny data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGunnyStats = async () => {
    try {
      const data = await gunnyService.getGunnyStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching gunny stats:', error);
    }
  };

  const fetchAllGunnyData = async () => {
    try {
      setAggregatedLoading(true);
      const data = await gunnyAggregationService.getAllGunnyData();
      setAllGunnyData(data);
      setAggregatedStats(data.summary);
    } catch (error) {
      console.error('Error fetching all gunny data:', error);
    } finally {
      setAggregatedLoading(false);
    }
  };

  // Gunny CRUD operations
  const openGunnyModal = (gunny = null) => {
    setEditingGunny(gunny);
    setGunnyForm(
      gunny
        ? {
            ...initialGunnyForm,
            ...gunny,
            gunny: { ...initialGunnyForm.gunny, ...gunny.gunny },
            paddy: { ...initialGunnyForm.paddy, ...gunny.paddy },
          }
        : initialGunnyForm
    );
    setShowGunnyModal(true);
  };

  const closeGunnyModal = () => {
    setShowGunnyModal(false);
    setEditingGunny(null);
    setGunnyForm(initialGunnyForm);
    setSelectedFiles([]);
  };

  const handleGunnyFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "gunny") {
      setGunnyForm({
        ...gunnyForm,
        gunny: value,
      });
    } else if (name === "paddy") {
      setGunnyForm({
        ...gunnyForm,
        paddy: value,
      });
    } else {
      setGunnyForm({
        ...gunnyForm,
        [name]: value,
      });
    }
  };

  const handleFilesChange = (files) => {
    setSelectedFiles(files);
  };

  const saveGunny = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingGunny) {
        await gunnyService.updateGunny(editingGunny._id, gunnyForm, selectedFiles);
      } else {
        await gunnyService.createGunny(gunnyForm, selectedFiles);
      }
      closeGunnyModal();
      fetchGunnyData();
      fetchGunnyStats();
      // Clear selected files after successful save
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error saving gunny:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteGunny = async (gunnyId) => {
    if (window.confirm("Are you sure you want to delete this gunny record?")) {
      try {
        setLoading(true);
        console.log('Attempting to delete gunny with ID:', gunnyId);
        
        // Log the current user context
        console.log('Current user:', user);
        console.log('Current branch ID:', currentBranchId);
        
        const result = await gunnyService.deleteGunny(gunnyId);
        console.log('Delete result:', result);
        
        // Show success message
        alert('Gunny record deleted successfully!');
        
        // Refresh data
        fetchGunnyData();
        fetchGunnyStats();
        fetchAllGunnyData();
      } catch (error) {
        console.error('Error deleting gunny:', error);
        // Show error message to user
        alert(`Error deleting gunny record: ${error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Get all records from all sources
  const getAllRecords = () => {
    const allRecords = [
      ...allGunnyData.paddyRecords,
      ...allGunnyData.riceRecords,

      ...allGunnyData.gunnyRecords
    ];

    // Filter by branch
    let filteredRecords = allRecords;
    if (currentBranchId && currentBranchId !== 'all') {
      filteredRecords = allRecords.filter(record => {
        const recordBranchId = record.branch_id?._id || record.branch_id;
        return recordBranchId === currentBranchId;
      });
    }

    // Filter by source
    if (selectedSource !== "all") {
      filteredRecords = filteredRecords.filter(record => record.recordType === selectedSource);
    }

    // Filter by text search
    if (gunnyFilter) {
      const q = gunnyFilter.toLowerCase();
      filteredRecords = filteredRecords.filter(record => {
        return (
          record.issueMemo?.toLowerCase().includes(q) ||
          record.lorryNumber?.toLowerCase().includes(q) ||
          record.paddyFrom?.toLowerCase().includes(q) ||
          record.month?.toLowerCase().includes(q) ||
          record.source?.toLowerCase().includes(q)
        );
      });
    }

    // Filter by date range
    if (dateRange.startDate || dateRange.endDate) {
      filteredRecords = filteredRecords.filter(record => {
        const recordDate = new Date(record.issueDate || record.date || record.createdAt);
        let matchesDate = true;
        
        if (dateRange.startDate) {
          matchesDate = matchesDate && recordDate >= new Date(dateRange.startDate);
        }
        if (dateRange.endDate) {
          matchesDate = matchesDate && recordDate <= new Date(dateRange.endDate + 'T23:59:59.999Z');
        }
        
        return matchesDate;
      });
    }

    return filteredRecords;
  };

  // Calculate filtered statistics based on current filters
  const filteredStats = useMemo(() => {
    const filteredRecords = getAllRecords();
    
    const stats = {
      totalRecords: filteredRecords.length,
      totalNB: 0,
      totalONB: 0,
      totalSS: 0,
      totalSWP: 0,
      totalBags: 0,
      totalWeight: 0,
      bySource: {
        paddy: { count: 0, nb: 0, onb: 0, ss: 0, swp: 0, bags: 0, weight: 0 },
        rice: { count: 0, nb: 0, onb: 0, ss: 0, swp: 0, bags: 0, weight: 0 },

        gunny: { count: 0, nb: 0, onb: 0, ss: 0, swp: 0, bags: 0, weight: 0 }
      }
    };

    // Calculate totals from filtered records
    filteredRecords.forEach(record => {
      const gunny = record.gunny || {};
      const paddy = record.paddy || {};
      
      stats.totalNB += gunny.nb || 0;
      stats.totalONB += gunny.onb || 0;
      stats.totalSS += gunny.ss || 0;
      stats.totalSWP += gunny.swp || 0;
      stats.totalBags += paddy.bags || 0;
      stats.totalWeight += paddy.weight || 0;

      // Calculate by source
      const sourceKey = record.recordType;
      if (stats.bySource[sourceKey]) {
        stats.bySource[sourceKey].count += 1;
        stats.bySource[sourceKey].nb += gunny.nb || 0;
        stats.bySource[sourceKey].onb += gunny.onb || 0;
        stats.bySource[sourceKey].ss += gunny.ss || 0;
        stats.bySource[sourceKey].swp += gunny.swp || 0;
        stats.bySource[sourceKey].bags += paddy.bags || 0;
        stats.bySource[sourceKey].weight += paddy.weight || 0;
      }
    });

    return stats;
  }, [allGunnyData, currentBranchId, selectedSource, gunnyFilter, dateRange]);

  // Calculate comprehensive gunny balance statistics
  const gunnyBalanceStats = useMemo(() => {
    const stats = {
      totalPaddyGunny: { nb: 0, onb: 0, ss: 0, swp: 0, total: 0 },
      totalRiceGunny: { nb: 0, onb: 0, ss: 0, swp: 0, total: 0 },

      totalDirectGunny: { nb: 0, onb: 0, ss: 0, swp: 0, total: 0 },
      balanceGunny: { nb: 0, onb: 0, ss: 0, swp: 0, total: 0 },
      utilizationRate: { nb: 0, onb: 0, ss: 0, swp: 0, total: 0 },
      // New fields for gunny lifecycle
      gunnyEntry: { nb: 0, onb: 0, ss: 0, swp: 0, total: 0 },
      gunnyUsed: { nb: 0, onb: 0, ss: 0, swp: 0, total: 0 },
      gunnyAvailable: { nb: 0, onb: 0, ss: 0, swp: 0, total: 0 }
    };

    // Filter records by current branch
    const branchFilteredPaddy = currentBranchId && currentBranchId !== 'all' 
      ? allGunnyData.paddyRecords.filter(record => {
          const recordBranchId = record.branch_id?._id || record.branch_id;
          return recordBranchId === currentBranchId;
        })
      : allGunnyData.paddyRecords;

    const branchFilteredRice = currentBranchId && currentBranchId !== 'all' 
      ? allGunnyData.riceRecords.filter(record => {
          const recordBranchId = record.branch_id?._id || record.branch_id;
          return recordBranchId === currentBranchId;
        })
      : allGunnyData.riceRecords;



    const branchFilteredDirect = currentBranchId && currentBranchId !== 'all' 
      ? allGunnyData.gunnyRecords.filter(record => {
          const recordBranchId = record.branch_id?._id || record.branch_id;
          return recordBranchId === currentBranchId;
        })
      : allGunnyData.gunnyRecords;

    // Calculate total gunny from paddy records (GUNNY ENTRY - Import)
    branchFilteredPaddy.forEach(paddy => {
      const gunny = paddy.gunny || {};
      stats.totalPaddyGunny.nb += gunny.nb || 0;
      stats.totalPaddyGunny.onb += gunny.onb || 0;
      stats.totalPaddyGunny.ss += gunny.ss || 0;
      stats.totalPaddyGunny.swp += gunny.swp || 0;
      
      // Gunny Entry = Paddy Gunny (Import)
      stats.gunnyEntry.nb += gunny.nb || 0;
      stats.gunnyEntry.onb += gunny.onb || 0;
      stats.gunnyEntry.ss += gunny.ss || 0;
      stats.gunnyEntry.swp += gunny.swp || 0;
    });
    stats.totalPaddyGunny.total = stats.totalPaddyGunny.nb + stats.totalPaddyGunny.onb + 
                                  stats.totalPaddyGunny.ss + stats.totalPaddyGunny.swp;
    stats.gunnyEntry.total = stats.gunnyEntry.nb + stats.gunnyEntry.onb + 
                             stats.gunnyEntry.ss + stats.gunnyEntry.swp;

    // Calculate total gunny used in rice records (GUNNY USED - Export)
    branchFilteredRice.forEach(rice => {
      const gunnyUsed = rice.gunnyUsedFromPaddy || {};
      stats.totalRiceGunny.nb += gunnyUsed.nb || 0;
      stats.totalRiceGunny.onb += gunnyUsed.onb || 0;
      stats.totalRiceGunny.ss += gunnyUsed.ss || 0;
      stats.totalRiceGunny.swp += gunnyUsed.swp || 0;
      
      // Gunny Used = Rice Gunny Used (Export)
      stats.gunnyUsed.nb += gunnyUsed.nb || 0;
      stats.gunnyUsed.onb += gunnyUsed.onb || 0;
      stats.gunnyUsed.ss += gunnyUsed.ss || 0;
      stats.gunnyUsed.swp += gunnyUsed.swp || 0;
    });
    stats.totalRiceGunny.total = stats.totalRiceGunny.nb + stats.totalRiceGunny.onb + 
                                 stats.totalRiceGunny.ss + stats.totalRiceGunny.swp;
    stats.gunnyUsed.total = stats.gunnyUsed.nb + stats.gunnyUsed.onb + 
                            stats.gunnyUsed.ss + stats.gunnyUsed.swp;

    

    // Calculate total direct gunny records
    branchFilteredDirect.forEach(gunny => {
      const gunnyData = gunny.gunny || {};
      stats.totalDirectGunny.nb += gunnyData.nb || 0;
      stats.totalDirectGunny.onb += gunnyData.onb || 0;
      stats.totalDirectGunny.ss += gunnyData.ss || 0;
      stats.totalDirectGunny.swp += gunnyData.swp || 0;
    });
    stats.totalDirectGunny.total = stats.totalDirectGunny.nb + stats.totalDirectGunny.onb + 
                                   stats.totalDirectGunny.ss + stats.totalDirectGunny.swp;

    // Calculate balance gunny (total available - total used)
    stats.balanceGunny.nb = stats.totalPaddyGunny.nb - stats.totalRiceGunny.nb;
    stats.balanceGunny.onb = stats.totalPaddyGunny.onb - stats.totalRiceGunny.onb;
    stats.balanceGunny.ss = stats.totalPaddyGunny.ss - stats.totalRiceGunny.ss;
    stats.balanceGunny.swp = stats.totalPaddyGunny.swp - stats.totalRiceGunny.swp;
    stats.balanceGunny.total = stats.balanceGunny.nb + stats.balanceGunny.onb + 
                               stats.balanceGunny.ss + stats.balanceGunny.swp;

    // Calculate gunny available (Gunny Entry - Gunny Used)
    stats.gunnyAvailable.nb = stats.gunnyEntry.nb - stats.gunnyUsed.nb;
    stats.gunnyAvailable.onb = stats.gunnyEntry.onb - stats.gunnyUsed.onb;
    stats.gunnyAvailable.ss = stats.gunnyEntry.ss - stats.gunnyUsed.ss;
    stats.gunnyAvailable.swp = stats.gunnyEntry.swp - stats.gunnyUsed.swp;
    stats.gunnyAvailable.total = stats.gunnyAvailable.nb + stats.gunnyAvailable.onb + 
                                 stats.gunnyAvailable.ss + stats.gunnyAvailable.swp;

    // Calculate utilization rate (percentage used)
    stats.utilizationRate.nb = stats.totalPaddyGunny.nb > 0 ? 
      ((stats.totalRiceGunny.nb / stats.totalPaddyGunny.nb) * 100) : 0;
    stats.utilizationRate.onb = stats.totalPaddyGunny.onb > 0 ? 
      ((stats.totalRiceGunny.onb / stats.totalPaddyGunny.onb) * 100) : 0;
    stats.utilizationRate.ss = stats.totalPaddyGunny.ss > 0 ? 
      ((stats.totalRiceGunny.ss / stats.totalPaddyGunny.ss) * 100) : 0;
    stats.utilizationRate.swp = stats.totalPaddyGunny.swp > 0 ? 
      ((stats.totalRiceGunny.swp / stats.totalPaddyGunny.swp) * 100) : 0;
    stats.utilizationRate.total = stats.totalPaddyGunny.total > 0 ? 
      ((stats.totalRiceGunny.total / stats.totalPaddyGunny.total) * 100) : 0;

    return stats;
  }, [allGunnyData, currentBranchId]);

  // Filter gunny records (for original gunny management)
  const filteredGunnyRecords = gunnyRecords.filter((gunny) => {
    // Text search filter
    const q = gunnyFilter.toLowerCase();
    const matchesText = !gunnyFilter || (
      gunny.issueMemo?.toLowerCase().includes(q) ||
      gunny.lorryNumber?.toLowerCase().includes(q) ||
      gunny.paddyFrom?.toLowerCase().includes(q)
    );

    return matchesText;
  });

  // Table columns for comprehensive gunny records
  const comprehensiveColumns = [
    { key: "source", label: "Source", render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'Paddy Management' ? 'bg-blue-100 text-blue-800' :
        value === 'Rice Management' ? 'bg-green-100 text-green-800' :

        'bg-gray-100 text-gray-800'
      }`}>
        {value}
      </span>
    )},
            { key: "branch", label: "Branch", render: (value, record) => {
          if (currentBranchId === 'all') {
            const branchName = record.branch_id?.name || record.branch?.name;
            const branchId = record.branch_id?._id || record.branch_id;
            return branchName ? `${branchName} (${branchId})` : (branchId || 'N/A');
          }
          return currentBranchName || 'Current Branch';
        }},
    { key: "displayDate", label: "Date" },
    { key: "issueMemo", label: "Memo/Details", render: (value, record) => {
      if (record.recordType === 'rice') return `Month: ${record.month}`;

      return value || 'N/A';
    }},
    { key: "lorryNumber", label: "Lorry/Vehicle", render: (value, record) => {
      if (record.recordType === 'rice') return 'N/A';
      return value || 'N/A';
    }},
    { key: "paddyFrom", label: "Source/Variety", render: (value, record) => {
      if (record.recordType === 'rice') return 'N/A';
      return value || 'N/A';
    }},
    { 
      key: "gunny", 
      label: "Gunny Details", 
      render: (gunny) => (
        <div className="text-xs">
          <div className="flex justify-between">
            <span className="text-blue-600">NB:</span>
            <span>{gunny?.nb || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-600">ONB:</span>
            <span>{gunny?.onb || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-600">SS:</span>
            <span>{gunny?.ss || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-600">SWP:</span>
            <span>{gunny?.swp || 0}</span>
          </div>
        </div>
      )
    },
    { 
      key: "paddy", 
      label: "Paddy Details", 
      render: (paddy, record) => {
        if (record.recordType === 'rice') {
          return <span className="text-gray-500 text-xs">N/A</span>;
        }
        return (
          <div className="text-xs">
            <div className="flex justify-between">
              <span className="text-indigo-600">Bags:</span>
              <span>{paddy?.bags || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-600">Weight:</span>
              <span>{formatWeight(paddy?.weight || 0)}</span>
            </div>
          </div>
        );
      }
    },
    { key: "createdBy", label: "Created By", render: (user) => user?.name || "N/A" },
  ];

  // Table columns for gunny records (original)
  const gunnyColumns = [
    { key: "issueDate", label: "Issue Date", render: (value) => new Date(value).toLocaleDateString() },
    { key: "issueMemo", label: "Issue Memo" },
    { key: "lorryNumber", label: "Lorry Number" },
    { key: "paddyFrom", label: "Paddy From" },
    { key: "paddyVariety", label: "Paddy Variety" },
    { 
      key: "gunny", 
      label: "Gunny Details", 
      render: (gunny) => (
        <div className="text-xs">
          <div>NB: {gunny.nb}</div>
          <div>ONB: {gunny.onb}</div>
          <div>SS: {gunny.ss}</div>
          <div>SWP: {gunny.swp}</div>
        </div>
      )
    },
    { 
      key: "paddy", 
      label: "Paddy Details", 
      render: (paddy) => (
        <div className="text-xs">
          <div>Bags: {paddy.bags}</div>
          <div>Weight: {formatWeight(paddy.weight)}</div>
        </div>
      )
    },
    { key: "createdBy", label: "Created By", render: (user) => user?.name || "N/A" }
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
              Gunny Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage gunny records and track inventory</p>
          </div>
          {currentBranchId && currentBranchId !== 'all' && (
            <div className="flex justify-center sm:justify-start">
                              <Button
                  onClick={() => openGunnyModal()}
                  variant="primary" 
                  icon="plus"
                  className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300"
                >
                Add New Gunny Record
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6">
        {/* Comprehensive Statistics Cards */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Comprehensive Gunny Statistics (All Sources) - Balance Included
            </h3>
            <div className="flex items-center gap-2">
              {aggregatedLoading && (
                <div className="flex items-center text-sm text-gray-600">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Loading...</span>
                </div>
              )}
              <Button
                onClick={fetchAllGunnyData}
                variant="secondary"
                icon="refresh"
                disabled={aggregatedLoading}
                className="text-xs"
              >
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Overall Totals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 mb-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 rounded-lg border border-gray-200 text-center">
              <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Records</h4>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{filteredStats.totalRecords}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-lg border border-blue-200 text-center">
              <h4 className="text-xs sm:text-sm font-medium text-blue-600 mb-1">Total NB</h4>
              <p className="text-lg sm:text-2xl font-bold text-blue-700">{filteredStats.totalNB}</p>
              <p className="text-xs text-blue-600">Balance: {gunnyBalanceStats.balanceGunny.nb}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 rounded-lg border border-green-200 text-center">
              <h4 className="text-xs sm:text-sm font-medium text-green-600 mb-1">Total ONB</h4>
              <p className="text-lg sm:text-2xl font-bold text-green-700">{filteredStats.totalONB}</p>
              <p className="text-xs text-green-600">Balance: {gunnyBalanceStats.balanceGunny.onb}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 sm:p-4 rounded-lg border border-yellow-200 text-center">
              <h4 className="text-xs sm:text-sm font-medium text-yellow-600 mb-1">Total SS</h4>
              <p className="text-lg sm:text-2xl font-bold text-yellow-700">{filteredStats.totalSS}</p>
              <p className="text-xs text-yellow-600">Balance: {gunnyBalanceStats.balanceGunny.ss}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 rounded-lg border border-purple-200 text-center">
              <h4 className="text-xs sm:text-sm font-medium text-purple-600 mb-1">Total SWP</h4>
              <p className="text-lg sm:text-2xl font-bold text-purple-700">{filteredStats.totalSWP}</p>
              <p className="text-xs text-purple-600">Balance: {gunnyBalanceStats.balanceGunny.swp}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 sm:p-4 rounded-lg border border-indigo-200 text-center">
              <h4 className="text-xs sm:text-sm font-medium text-indigo-600 mb-1">Total Bags</h4>
              <p className="text-lg sm:text-2xl font-bold text-indigo-700">{filteredStats.totalBags}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 sm:p-4 rounded-lg border border-red-200 text-center">
              <h4 className="text-xs sm:text-sm font-medium text-red-600 mb-1">Total Weight</h4>
              <p className="text-lg sm:text-2xl font-bold text-red-700">{formatWeight(filteredStats.totalWeight)}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 sm:p-4 rounded-lg border border-orange-200 text-center">
              <h4 className="text-xs sm:text-sm font-medium text-orange-600 mb-1">Total Balance</h4>
              <p className="text-lg sm:text-2xl font-bold text-orange-700">{gunnyBalanceStats.balanceGunny.nb + gunnyBalanceStats.balanceGunny.onb}</p>
              <p className="text-xs text-orange-600">NB+ONB: {((gunnyBalanceStats.totalRiceGunny.nb + gunnyBalanceStats.totalRiceGunny.onb) / (gunnyBalanceStats.totalPaddyGunny.nb + gunnyBalanceStats.totalPaddyGunny.onb) * 100).toFixed(1)}% Used</p>
            </div>
          </div>

          {/* Breakdown by Source */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Paddy Management (Source)
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Records:</span>
                  <span className="font-medium">{filteredStats.bySource.paddy.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">NB:</span>
                  <span className="font-medium">{gunnyBalanceStats.totalPaddyGunny.nb}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">ONB:</span>
                  <span className="font-medium">{gunnyBalanceStats.totalPaddyGunny.onb}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">SS:</span>
                  <span className="font-medium">{gunnyBalanceStats.totalPaddyGunny.ss}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">SWP:</span>
                  <span className="font-medium">{gunnyBalanceStats.totalPaddyGunny.swp}</span>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <div className="flex justify-between font-semibold">
                    <span className="text-blue-800">Total:</span>
                    <span className="text-blue-900">{gunnyBalanceStats.totalPaddyGunny.total}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Rice Management (Consumption)
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Records:</span>
                  <span className="font-medium">{filteredStats.bySource.rice.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">NB Used:</span>
                  <span className="font-medium">{filteredStats.bySource.rice.nb || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">ONB Used:</span>
                  <span className="font-medium">{filteredStats.bySource.rice.onb || 0}</span>
                </div>
                <div className="pt-2 border-t border-green-200">
                  <div className="flex justify-between font-semibold">
                    <span className="text-green-800">Total Used Gunnys:</span>
                    <span className="text-green-900">{(filteredStats.bySource.rice.nb || 0) + (filteredStats.bySource.rice.onb || 0)}</span>
                  </div>
                </div>
                <div className="pt-1 border-t border-green-200">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600">Rice NB:</span>
                    <span className="font-medium">{filteredStats.bySource.rice.nb || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600">Rice ONB:</span>
                    <span className="font-medium">{filteredStats.bySource.rice.onb || 0}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-green-200">
                  <div className="flex justify-between font-semibold">
                    <span className="text-green-800">Total Used:</span>
                    <span className="text-green-900">{gunnyBalanceStats.totalRiceGunny.total}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-green-200">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600">Utilization Rate (NB+ONB):</span>
                    <span className="font-medium text-green-800">
                      {(() => {
                        const riceUsed = (filteredStats.bySource.rice.nb || 0) + (filteredStats.bySource.rice.onb || 0);
                        const paddyAvailable = gunnyBalanceStats.totalPaddyGunny.nb + gunnyBalanceStats.totalPaddyGunny.onb;
                        return paddyAvailable > 0 ? ((riceUsed / paddyAvailable) * 100).toFixed(1) : '0.0';
                      })()}%
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-green-200">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600">Rice Output:</span>
                    <span className="font-medium text-green-800">{filteredStats.bySource.rice.weight || 0} kg</span>
                  </div>
                </div>
              </div>
            </div>



            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                Direct Gunny Management
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Records:</span>
                  <span className="font-medium">{filteredStats.bySource.gunny.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">NB:</span>
                  <span className="font-medium">{gunnyBalanceStats.totalDirectGunny.nb}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">ONB:</span>
                  <span className="font-medium">{gunnyBalanceStats.totalDirectGunny.onb}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">SS:</span>
                  <span className="font-medium">{gunnyBalanceStats.totalDirectGunny.ss}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">SWP:</span>
                  <span className="font-medium">{gunnyBalanceStats.totalDirectGunny.swp}</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-800">Total:</span>
                    <span className="text-gray-900">{gunnyBalanceStats.totalDirectGunny.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Branch Filter Summary */}
        {/* {currentBranchId && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                        <span className="text-sm font-medium text-blue-800">
          {currentBranchId === 'all' ? 'Showing data from all branches' : `Showing data for branch`}
        </span>
              </div>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {getAllRecords().length} records
              </span>
            </div>
          </div>
        )} */}

        {/* Desktop Table View - Comprehensive Gunny Data */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Comprehensive Gunny Records (All Sources)</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {getAllRecords().length} records</p>
            {/* Filters moved inside table header */}
            <div className="mt-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-center">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <TableFilters
                    searchValue={gunnyFilter}
                    searchPlaceholder="Search by memo, lorry number, or source..."
                    onSearchChange={(e) => setGunnyFilter(e.target.value)}
                    showSelect={false}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white shadow-sm"
                  >
                    <option value="all">All Sources</option>
                    <option value="paddy">Paddy Management</option>
                    <option value="rice">Rice Management</option>
                    <option value="gunny">Gunny Management</option>
                  </select>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                  <BranchFilter
                    value={currentBranchId || ''}
                    onChange={(value) => {
                      console.log('Branch changed in Gunny Management:', value);
                      // The data will be refetched automatically by the useEffect
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                   <DateRangeFilter
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                    onStartDateChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    onEndDateChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    startDateLabel="Issue Date From"
                    endDateLabel="Issue Date To"
                  />
                </div>
              </div>
            </div>
          </div>
          {aggregatedLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="ml-3 text-gray-600">Loading comprehensive gunny data...</span>
            </div>
          ) : (
            <TableList
              data={getAllRecords()}
              columns={comprehensiveColumns}
              actions={(record) => [
                <Button
                  key="edit"
                  onClick={() => openGunnyModal(record)}
                  variant="info"
                  icon="edit"
                  className="text-xs px-2 py-1"
                >
                  Edit
                </Button>,
                <Button
                  key="delete"
                  onClick={() => deleteGunny(record._id)}
                  variant="danger"
                  icon="delete"
                  className="text-xs px-2 py-1"
                >
                  Delete
                </Button>
              ]}
              renderDetail={(record) => (
                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-amber-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="w-24 text-sm font-medium text-gray-600">Source:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.source === 'Paddy Management' ? 'bg-blue-100 text-blue-800' :
                          record.source === 'Rice Management' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record.source}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-24 text-sm font-medium text-gray-600">Date:</span>
                        <span className="text-gray-900 font-medium">{record.displayDate}</span>
                      </div>
                      {record.recordType === 'gunny' && (
                        <>
                          <div className="flex items-center">
                            <span className="w-24 text-sm font-medium text-gray-600">Issue Memo:</span>
                            <span className="text-gray-900 font-medium">{record.issueMemo}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-24 text-sm font-medium text-gray-600">Lorry Number:</span>
                            <span className="text-gray-900 font-medium">{record.lorryNumber}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-24 text-sm font-medium text-gray-600">Paddy From:</span>
                            <span className="text-gray-900 font-medium">{record.paddyFrom}</span>
                          </div>
                        </>
                      )}
                      {record.recordType === 'rice' && (
                        <div className="flex items-center">
                          <span className="w-24 text-sm font-medium text-gray-600">Month:</span>
                          <span className="text-gray-900 font-medium">{record.month}</span>
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
                            <div className="text-gray-900">{record.gunny?.nb || 0}</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-green-600">ONB</div>
                            <div className="text-gray-900">{record.gunny?.onb || 0}</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-yellow-600">SS</div>
                            <div className="text-gray-900">{record.gunny?.ss || 0}</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-purple-600">SWP</div>
                            <div className="text-gray-900">{record.gunny?.swp || 0}</div>
                          </div>
                        </div>
                      </div>

                      {/* Paddy Summary (only for gunny and paddy records) */}
                      {(record.recordType === 'gunny' || record.recordType === 'paddy') && (
                        <div className="p-3 bg-white rounded-lg border border-gray-200 w-full">
                          <h5 className="text-sm font-semibold text-gray-800 mb-2">Paddy Summary</h5>
                          <div className="grid grid-cols-2 gap-4 text-sm w-full">
                            <div>
                              <span className="text-gray-600">Bags:</span>
                              <span className="ml-1 font-medium text-indigo-600">{record.paddy?.bags || 0}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Weight:</span>
                              <span className="ml-1 font-medium text-red-600">{formatWeight(record.paddy?.weight || 0)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            />
          )}
        </div>

        {/* Mobile Table View - Comprehensive Gunny Data */}
        <div className="lg:hidden bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">All Gunny Records</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {getAllRecords().length} records from all sources</p>
          </div>
          
          <div className="p-4">
            {getAllRecords().length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No gunny records found</h3>
                <p className="mt-1 text-sm text-gray-500">No gunny data available from any management module.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {getAllRecords().map((record, index) => (
                  <div key={`${record.recordType}-${record._id || index}`} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-white p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              record.source === 'Paddy Management' ? 'bg-blue-100 text-blue-800' :
                              record.source === 'Rice Management' ? 'bg-green-100 text-green-800' :
                              record.source === 'Godown Management' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {record.source}
                            </span>
                                    {currentBranchId === 'all' && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            {(() => {
              const branchName = record.branch_id?.name || record.branch?.name;
              const branchId = record.branch_id?._id || record.branch_id;
              return branchName ? `${branchName} (${branchId})` : (branchId || 'N/A');
            })()}
          </span>
        )}
        {currentBranchId !== 'all' && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {currentBranchName || currentBranchId}
          </span>
        )}
                          </div>
                          <div className="font-medium text-gray-900">
                            {record.recordType === 'rice' ? `Month: ${record.month}` :
                             record.issueMemo || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {record.recordType === 'gunny' ? record.lorryNumber : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {record.displayDate} • {record.recordType === 'gunny' ? record.paddyFrom : 'N/A'}
                          </div>
                        </div>
                        <div className="text-xs text-right">
                          <div className="font-medium text-blue-600">NB: {record.gunny?.nb || 0}</div>
                          <div className="font-medium text-green-600">ONB: {record.gunny?.onb || 0}</div>
                          <div className="font-medium text-yellow-600">SS: {record.gunny?.ss || 0}</div>
                          <div className="font-medium text-purple-600">SWP: {record.gunny?.swp || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Original Gunny Management Records */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Gunny Management Records</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {filteredGunnyRecords.length} records</p>
          </div>
          
          <div className="p-4">
            {filteredGunnyRecords.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No gunny records</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new gunny record.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredGunnyRecords.map((gunny) => (
                  <div key={gunny._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Mobile Table Row */}
                    <div 
                      className="bg-white p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedGunny(expandedGunny === gunny._id ? null : gunny._id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{gunny.issueMemo}</div>
                          <div className="text-sm text-gray-600">{gunny.lorryNumber}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(gunny.issueDate).toLocaleDateString()} • {gunny.paddyFrom}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openGunnyModal(gunny);
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
                              deleteGunny(gunny._id);
                            }}
                            variant="danger"
                            icon="delete"
                            className="text-xs px-2 py-1"
                          >
                            Delete
                          </Button>
                          <svg 
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              expandedGunny === gunny._id ? 'rotate-180' : ''
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
                    {expandedGunny === gunny._id && (
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 border-t border-gray-200">
                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <span className="ml-1 font-medium text-gray-900">
                              {new Date(gunny.issueDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Source:</span>
                            <span className="ml-1 font-medium text-gray-900">{gunny.paddyFrom}</span>
                          </div>
                        </div>

                        {/* Gunny Summary */}
                        <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200 w-full">
                          <h5 className="text-sm font-semibold text-gray-800 mb-2">Gunny Summary</h5>
                          <div className="grid grid-cols-4 gap-1 text-xs w-full">
                            <div className="text-center">
                              <div className="font-medium text-blue-600 truncate">NB</div>
                              <div className="text-gray-900 truncate">{gunny.gunny?.nb || 0}</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-green-600 truncate">ONB</div>
                              <div className="text-gray-900 truncate">{gunny.gunny?.onb || 0}</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-yellow-600 truncate">SS</div>
                              <div className="text-gray-900 truncate">{gunny.gunny?.ss || 0}</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-purple-600 truncate">SWP</div>
                              <div className="text-gray-900 truncate">{gunny.gunny?.swp || 0}</div>
                            </div>
                          </div>
                        </div>

                        {/* Paddy Summary */}
                        <div className="p-3 bg-white rounded-lg border border-gray-200 w-full">
                          <h5 className="text-sm font-semibold text-gray-800 mb-2">Paddy Summary</h5>
                          <div className="grid grid-cols-2 gap-2 text-xs w-full">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 truncate">Bags:</span>
                              <span className="font-medium text-indigo-600 ml-2">{gunny.paddy?.bags || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 truncate">Weight:</span>
                              <span className="font-medium text-red-600 ml-2">{formatWeight(gunny.paddy?.weight || 0)}</span>
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
      </div>

      {/* Gunny Modal */}
      <DialogBox
        show={showGunnyModal}
        onClose={closeGunnyModal}
        onSubmit={saveGunny}
        title={editingGunny ? "Edit Gunny Record" : "Add New Gunny Record"}
        submitText={editingGunny ? "Update" : "Create"}
        cancelText="Cancel"
        size="2xl"
      >
        <form onSubmit={saveGunny} className="space-y-6">
          {/* Basic Information */}
          <fieldset className="border border-gray-200 rounded p-4">
            <legend className="text-sm font-semibold text-gray-700 px-2">
              Basic Information
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Issue Date"
                name="issueDate"
                type="date"
                value={gunnyForm.issueDate}
                onChange={handleGunnyFormChange}
                required
              />
              <FormInput
                label="Issue Memo"
                name="issueMemo"
                type="text"
                value={gunnyForm.issueMemo}
                onChange={handleGunnyFormChange}
                required
              />
              <FormInput
                label="Lorry Number"
                name="lorryNumber"
                type="text"
                value={gunnyForm.lorryNumber}
                onChange={handleGunnyFormChange}
                required
              />
              <FormInput
                label="Paddy From"
                name="paddyFrom"
                type="text"
                value={gunnyForm.paddyFrom}
                onChange={handleGunnyFormChange}
                required
                placeholder="Enter paddy source (e.g., farmer name, location, trader, etc.)"
              />
              <FormSelect
                label="Paddy Variety"
                name="paddyVariety"
                value={gunnyForm.paddyVariety}
                onChange={handleGunnyFormChange}
                options={PADDY_VARIETIES.map(variety => ({ value: variety, label: variety }))}
                required
              />
            </div>
          </fieldset>

          {/* Gunny Details */}
          <GunnyEntryDetails
            gunnyData={gunnyForm.gunny}
            onChange={handleGunnyFormChange}
          />

          {/* Paddy Details */}
          <PaddyEntryDetails
            paddyData={gunnyForm.paddy}
            onChange={handleGunnyFormChange}
          />

          {/* File Upload Section */}
          <FileUpload
            label="Upload Gunny Documents & Images"
            module="gunny"
            onFilesChange={handleFilesChange}
            files={selectedFiles}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            maxFiles={10}
            maxSize={10}
            showPreview={true}
          />


        </form>
      </DialogBox>
    </div>
  );
};

export default GunnyManagement; 