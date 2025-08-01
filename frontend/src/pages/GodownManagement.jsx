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
import godownDepositService from "../services/godownDepositService";

const GodownManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const { currentBranchId } = useSelector((state) => state.branch);
  const [godownDeposits, setGodownDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGodownModal, setShowGodownModal] = useState(false);
  const [editingGodown, setEditingGodown] = useState(null);
  const [godownFilter, setGodownFilter] = useState("");
  const [expandedGodown, setExpandedGodown] = useState(null);
  const [stats, setStats] = useState({
    totalONB: 0,
    totalSS: 0,
    count: 0
  });
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const initialGodownForm = {
    date: "",
    gunny: {
      onb: 0,
      ss: 0,
    },
  };

  const [godownForm, setGodownForm] = useState(initialGodownForm);

  // Fetch godown deposit data
  useEffect(() => {
    fetchGodownData();
    fetchGodownStats();
  }, []);

  // Refetch data when branch changes
  useEffect(() => {
    if (currentBranchId) {
      fetchGodownData();
      fetchGodownStats();
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

  const fetchGodownData = async () => {
    try {
      setLoading(true);
      const data = await godownDepositService.getAllGodownDeposits();
      setGodownDeposits(data);
    } catch (error) {
      console.error('Error fetching godown deposit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGodownStats = async () => {
    try {
      const data = await godownDepositService.getGodownDepositStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching godown deposit stats:', error);
    }
  };

  // Godown CRUD operations
  const openGodownModal = (godown = null) => {
    setEditingGodown(godown);
    setGodownForm(
      godown
        ? {
            ...initialGodownForm,
            ...godown,
            gunny: { ...initialGodownForm.gunny, ...godown.gunny },
          }
        : initialGodownForm
    );
    setShowGodownModal(true);
  };

  const closeGodownModal = () => {
    setShowGodownModal(false);
    setEditingGodown(null);
    setGodownForm(initialGodownForm);
    setErrorMessage(null);
  };

  const handleGodownFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('gunny.')) {
      const gunnyType = name.split('.')[1];
      setGodownForm({
        ...godownForm,
        gunny: {
          ...godownForm.gunny,
          [gunnyType]: parseInt(value) || 0,
        },
      });
    } else {
      setGodownForm({
        ...godownForm,
        [name]: value,
      });
    }
  };

  const saveGodown = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingGodown) {
        await godownDepositService.updateGodownDeposit(editingGodown._id, godownForm);
      } else {
        await godownDepositService.createGodownDeposit(godownForm);
      }
      // Show success message
      setSuccessMessage(editingGodown ? 'Godown deposit updated successfully!' : 'Godown deposit created successfully!');
      // Close modal first, then refresh data
      closeGodownModal();
      // Refresh data after a short delay to ensure modal is closed
      setTimeout(() => {
        fetchGodownData();
        fetchGodownStats();
      }, 100);
    } catch (error) {
      console.error('Error saving godown deposit:', error);
      setErrorMessage('Error saving godown deposit: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const deleteGodown = async (godownId) => {
    if (window.confirm('Are you sure you want to delete this godown deposit record?')) {
      try {
        setLoading(true);
        await godownDepositService.deleteGodownDeposit(godownId);
        fetchGodownData();
        fetchGodownStats();
      } catch (error) {
        console.error('Error deleting godown deposit:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter godown deposits
  const filteredGodownDeposits = godownDeposits.filter(godown =>
    new Date(godown.date).toLocaleDateString().toLowerCase().includes(godownFilter.toLowerCase())
  );

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
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Godown Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage godown deposit records</p>
          </div>
          {currentBranchId && currentBranchId !== 'all' && (
            <div className="flex justify-center sm:justify-start">
              <Button 
                onClick={() => openGodownModal()} 
                variant="primary" 
                icon="plus"
                className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Add Godown Deposit
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{stats.count}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total ONB</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalONB}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total SS</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSS}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Filters */}
        <ResponsiveFilters title="Filters & Search" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BranchFilter
              value={currentBranchId || ''}
              onChange={(value) => console.log('Branch changed:', value)}
            />
            <TableFilters
              searchValue={godownFilter}
              onSearchChange={setGodownFilter}
              searchPlaceholder="Search by date..."
            />
          </div>
        </ResponsiveFilters>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <GroupedTable
            data={filteredGodownDeposits}
            groupedHeaders={groupedHeaders}
            actions={(godown) => [
              <Button
                key="edit"
                onClick={() => openGodownModal(godown)}
                variant="info"
                icon="edit"
              >
                Edit
              </Button>,
              <Button
                key="delete"
                onClick={() => deleteGodown(godown._id)}
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
            <h3 className="text-lg font-semibold text-gray-800">Godown Deposit Records</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {godownDeposits.length} records</p>
          </div>
          
          <div className="p-4">
            {filteredGodownDeposits.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No godown deposit records</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new godown deposit record.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredGodownDeposits.map((godown, index) => (
                  <div key={godown._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="bg-white p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedGodown(expandedGodown === godown._id ? null : godown._id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {new Date(godown.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            ONB: {godown.gunny?.onb || 0} | SS: {godown.gunny?.ss || 0}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openGodownModal(godown);
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
                              deleteGodown(godown._id);
                            }}
                            variant="danger"
                            icon="delete"
                            className="text-xs px-2 py-1"
                          >
                            Delete
                          </Button>
                          <svg 
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              expandedGodown === godown._id ? 'rotate-180' : ''
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
                    
                    {expandedGodown === godown._id && (
                      <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Date:</span>
                            <span className="ml-2 text-gray-900">
                              {new Date(godown.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">ONB:</span>
                            <span className="ml-2 text-gray-900">{godown.gunny?.onb || 0}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">SS:</span>
                            <span className="ml-2 text-gray-900">{godown.gunny?.ss || 0}</span>
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

      {/* Godown Modal */}
      <DialogBox
        show={showGodownModal}
        onClose={closeGodownModal}
        title={editingGodown ? "Edit Godown Deposit" : "Add Godown Deposit"}
        maxWidth="max-w-md"
      >
        <form onSubmit={saveGodown} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <FormInput
              label="Date"
              name="date"
              type="date"
              value={godownForm.date}
              onChange={handleGodownFormChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="ONB Count"
              name="gunny.onb"
              type="number"
              value={godownForm.gunny.onb}
              onChange={handleGodownFormChange}
              min="0"
              required
            />
            <FormInput
              label="SS Count"
              name="gunny.ss"
              type="number"
              value={godownForm.gunny.ss}
              onChange={handleGodownFormChange}
              min="0"
              required
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <Button 
              onClick={closeGodownModal} 
              variant="secondary" 
              icon="close"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              icon="save"
              disabled={loading}
            >
              {loading ? "Saving..." : (editingGodown ? "Update" : "Create")}
            </Button>
          </div>
        </form>
      </DialogBox>
    </div>
  );
};

export default GodownManagement; 