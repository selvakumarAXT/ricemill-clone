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
import { 
  getAllPaddy, 
  createPaddy, 
  updatePaddy, 
  deletePaddy, 
  formatPaddyData, 
  formatPaddyResponse 
} from "../services/paddyService";
import WarningBox from "../components/common/WarningBox";

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
  const [branchFilter, setBranchFilter] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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
    const weight = bags * 500; // Weight = Bags * 500kg
    
    return {
      gunnyTotal,
      bags,
      weight
    };
  }, [paddyForm.gunny?.nb, paddyForm.gunny?.onb, paddyForm.gunny?.ss, paddyForm.gunny?.swp]);

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

  // Fetch paddy data
  useEffect(() => {
    const fetchPaddies = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllPaddy();
        const formattedPaddies = response.data.map(formatPaddyResponse);
        setPaddies(formattedPaddies);
      } catch (error) {
        console.error("Error fetching paddies:", error);
        setError(error.message || "Failed to fetch paddy records");
        setPaddies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPaddies();
  }, []);

  // Paddy CRUD operations
  const openPaddyModal = (paddy = null) => {
    setEditingPaddy(paddy);
    const formData = paddy
      ? {
          ...initialPaddyForm,
          ...paddy,
          gunny: { ...initialPaddyForm.gunny, ...(paddy.gunny || {}) },
          paddy: { ...initialPaddyForm.paddy, ...(paddy.paddy || {}) },
        }
      : initialPaddyForm;
    
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

  const savePaddy = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const formattedPaddy = formatPaddyData(paddyForm);
      if (editingPaddy) {
        const response = await updatePaddy(editingPaddy.id, formattedPaddy);
        setPaddies(prev => prev.map(p => p.id === editingPaddy.id ? formatPaddyResponse(response.data) : p));
        setSuccessMessage("Paddy record updated successfully!");
      } else {
        const response = await createPaddy(formattedPaddy);
        setPaddies(prev => [...prev, formatPaddyResponse(response.data)]);
        setSuccessMessage("Paddy record created successfully!");
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
      setPaddies(prev => prev.filter(p => p.id !== paddyId));
      setSuccessMessage("Paddy record deleted successfully!");
    } catch (error) {
      console.error("Error deleting paddy:", error);
      setError(error.message || "Failed to delete paddy record");
    } finally {
      setLoading(false);
    }
  };

  // Filter paddy data
  const filteredPaddies = paddies.filter((paddy) => {
    // Text search filter
    const q = paddyFilter.toLowerCase();
    const matchesText = !paddyFilter || (
      paddy.issueMemo?.toLowerCase().includes(q) ||
      paddy.lorryNumber?.toLowerCase().includes(q) ||
      paddy.paddyFrom?.toLowerCase().includes(q) ||
      paddy.paddyVariety?.toLowerCase().includes(q)
    );
    // Variety filter
    const matchesVariety = !paddyVarietyFilter || paddy.paddyVariety === paddyVarietyFilter;

    // Source filter
    const matchesSource = !paddySourceFilter || paddy.paddyFrom === paddySourceFilter;

    // Branch filter - use currentBranchId if set, otherwise use branchFilter
    const effectiveBranchFilter = currentBranchId && currentBranchId !== 'all' ? currentBranchId : branchFilter;
    const matchesBranch = !effectiveBranchFilter || paddy.branch_id === effectiveBranchFilter;

    return matchesText && matchesVariety && matchesSource && matchesBranch;
  });

  // Table columns configuration
  const columns = [
    {
      key: "issueDate",
      label: "Issue Date",
      render: (value) => new Date(value).toLocaleDateString(),
    },
    { key: "issueMemo", label: "Issue Memo" },
    { key: "lorryNumber", label: "Lorry Number" },
    { key: "paddyFrom", label: "Paddy From" },
    { key: "paddyVariety", label: "Paddy Variety" },
    {
      key: "gunny",
      label: "Gunny (NB/ONB/SS/SWP)",
      render: (gunny) =>
        `${gunny?.nb || 0}/${gunny?.onb || 0}/${gunny?.ss || 0}/${
          gunny?.swp || 0
        }`,
    },
    {
      key: "paddy",
      label: "Paddy (Bags/Weight)",
      render: (paddy) => `${paddy?.bags || 0}/${paddy?.weight || 0} kg`,
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-black)]">
          Paddy Management
        </h1>
        <Button onClick={() => openPaddyModal()} variant="primary" icon="plus">
          Add Paddy
        </Button>
      </div>

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

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <TableFilters
            searchValue={paddyFilter}
            searchPlaceholder="Search paddy records..."
            onSearchChange={(e) => setPaddyFilter(e.target.value)}
            showSelect={false}
          />
          <TableFilters
            searchValue=""
            selectValue={paddyVarietyFilter}
            selectOptions={PADDY_VARIETIES.map(variety => ({
              value: variety,
              label: `Variety ${variety}`
            }))}
            onSelectChange={(e) => setPaddyVarietyFilter(e.target.value)}
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
            onSelectChange={(e) => setPaddySourceFilter(e.target.value)}
            selectPlaceholder="All Sources"
            showSearch={false}
            showSelect={true}
          />
          <BranchFilter
            value={currentBranchId && currentBranchId !== 'all' ? currentBranchId : branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Paddy Table */}
      <div className="bg-[var(--color-bg-white)] rounded-lg shadow">
        <TableList
          data={filteredPaddies}
          columns={columns}
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
          renderDetail={(paddy) => (
            <div className="p-4 space-y-2">
              <p>
                <strong>Issue Date:</strong>{" "}
                {new Date(paddy.issueDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Issue Memo:</strong> {paddy.issueMemo}
              </p>
              <p>
                <strong>Lorry Number:</strong> {paddy.lorryNumber}
              </p>
              <p>
                <strong>Paddy From:</strong> {paddy.paddyFrom}
              </p>
              <p>
                <strong>Paddy Variety:</strong> {paddy.paddyVariety}
              </p>
              <p>
                <strong>Gunny NB:</strong> {paddy.gunny?.nb || 0}
              </p>
              <p>
                <strong>Gunny ONB:</strong> {paddy.gunny?.onb || 0}
              </p>
              <p>
                <strong>Gunny SS:</strong> {paddy.gunny?.ss || 0}
              </p>
              <p>
                <strong>Gunny SWP:</strong> {paddy.gunny?.swp || 0}
              </p>
              <p>
                <strong>Paddy Bags:</strong> {paddy.paddy?.bags || 0}
              </p>
              <p>
                <strong>Paddy Weight:</strong> {paddy.paddy?.weight || 0} kg
              </p>
            </div>
          )}
        />
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
                  <span className="ml-1 text-lg font-bold">{memoizedCalculations.weight.toLocaleString()} kg</span>
                </div>
              </div>
              <div className="text-xs mt-2 text-green-600">
                Formula: Gunny Total → Bags → Weight (1 bag = 500kg)
              </div>
            </div>
          </div>

          {/* Paddy Details */}
          <PaddyEntryDetails
            paddyData={paddyForm.paddy}
            onChange={handlePaddyFormChange}
            enableAutoCalculation={false} // Disable auto-calculation since bags are controlled by gunny count
            disabled={true} // Disable both fields since they're auto-calculated
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
  );
};

export default PaddyManagement;
