import React, { useState, useEffect } from "react";
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
import gunnyService from "../services/gunnyService";

const GunnyManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const { currentBranchId } = useSelector((state) => state.branch);
  const [gunnyRecords, setGunnyRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGunnyModal, setShowGunnyModal] = useState(false);
  const [editingGunny, setEditingGunny] = useState(null);
  const [gunnyFilter, setGunnyFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [stats, setStats] = useState({
    totalNB: 0,
    totalONB: 0,
    totalSS: 0,
    totalSWP: 0,
    totalBags: 0,
    totalWeight: 0,
    count: 0
  });

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

  // Fetch gunny data
  useEffect(() => {
    fetchGunnyData();
    fetchGunnyStats();
  }, []);

  const fetchGunnyData = async () => {
    try {
      setLoading(true);
      const data = await gunnyService.getAllGunny();
      setGunnyRecords(data);
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

  const saveGunny = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingGunny) {
        await gunnyService.updateGunny(editingGunny._id, gunnyForm);
      } else {
        await gunnyService.createGunny(gunnyForm);
      }
      closeGunnyModal();
      fetchGunnyData();
      fetchGunnyStats();
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
        await gunnyService.deleteGunny(gunnyId);
        fetchGunnyData();
        fetchGunnyStats();
      } catch (error) {
        console.error('Error deleting gunny:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter gunny records
  const filteredGunnyRecords = gunnyRecords.filter((gunny) => {
    // Text search filter
    const q = gunnyFilter.toLowerCase();
    const matchesText = !gunnyFilter || (
      gunny.issueMemo?.toLowerCase().includes(q) ||
      gunny.lorryNumber?.toLowerCase().includes(q) ||
      gunny.paddyFrom?.toLowerCase().includes(q)
    );

    // Branch filter - use currentBranchId if set, otherwise use branchFilter
    const effectiveBranchFilter = currentBranchId && currentBranchId !== 'all' ? currentBranchId : branchFilter;
    const matchesBranch = !effectiveBranchFilter || gunny.branch_id === effectiveBranchFilter;

    return matchesText && matchesBranch;
  });

  // Table columns for gunny records
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
          <div>Weight: {paddy.weight} kg</div>
        </div>
      )
    },
    { key: "createdBy", label: "Created By", render: (user) => user?.name || "N/A" },
    {
      key: "actions",
      label: "Actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            onClick={() => openGunnyModal(record)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-xs"
          >
            Edit
          </Button>
          <Button
            onClick={() => deleteGunny(record._id)}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Gunny Management</h1>
        <p className="text-gray-600">Manage gunny records and track inventory</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Records</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.count}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total NB</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.totalNB}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total ONB</h3>
          <p className="text-2xl font-bold text-green-600">{stats.totalONB}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total SS</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.totalSS}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total SWP</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.totalSWP}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Bags</h3>
          <p className="text-2xl font-bold text-indigo-600">{stats.totalBags}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Weight</h3>
          <p className="text-2xl font-bold text-red-600">{stats.totalWeight} kg</p>
        </div>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <TableFilters
            searchValue={gunnyFilter}
            searchPlaceholder="Search by memo, lorry number, or source..."
            onSearchChange={(e) => setGunnyFilter(e.target.value)}
            showSelect={false}
          />
          <BranchFilter
            value={currentBranchId && currentBranchId !== 'all' ? currentBranchId : branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          />
        </div>
        <Button
          onClick={() => openGunnyModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Add New Gunny Record
        </Button>
      </div>

      {/* Gunny Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <TableList
          data={filteredGunnyRecords}
          columns={gunnyColumns}
          emptyMessage="No gunny records found"
        />
      </div>

      {/* Gunny Modal */}
      <DialogBox
        show={showGunnyModal}
        onClose={closeGunnyModal}
        title={editingGunny ? "Edit Gunny Record" : "Add New Gunny Record"}
        size="lg"
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
              <FormSelect
                label="Paddy From"
                name="paddyFrom"
                value={gunnyForm.paddyFrom}
                onChange={handleGunnyFormChange}
                options={PADDY_SOURCES.map(source => ({ value: source, label: source }))}
                required
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

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              onClick={closeGunnyModal}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              disabled={loading}
            >
              {loading ? "Saving..." : editingGunny ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </DialogBox>
    </div>
  );
};

export default GunnyManagement; 