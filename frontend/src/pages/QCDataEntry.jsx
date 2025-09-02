import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import TableFilters from "../components/common/TableFilters";
import BranchFilter from "../components/common/BranchFilter";
import TableList from "../components/common/TableList";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";

import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import DialogBox from "../components/common/DialogBox";
import FileUpload from "../components/common/FileUpload";
import qcService from "../services/qcService";
import riceDepositService from "../services/riceDepositService";

const QCDataEntry = () => {
  const [qcRecords, setQcRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qcFilter, setQcFilter] = useState("");
  const [showQcModal, setShowQcModal] = useState(false);
  const [editingQc, setEditingQc] = useState(null);
  const [expandedQc, setExpandedQc] = useState(null);
  const { currentBranchId } = useSelector((state) => state.branch);
  const { user } = useSelector((state) => state.auth);

  // New state for rice data auto-population
  const [riceVarieties, setRiceVarieties] = useState([]);
  const [riceDeposits, setRiceDeposits] = useState([]);
  const [selectedRiceDeposit, setSelectedRiceDeposit] = useState(null);

  const initialQcForm = {
    batchNumber: "",
    riceVariety: "",
    sampleDate: "",
    moistureContent: 0,
    brokenRice: 0,
    foreignMatter: 0,
    yellowKernels: 0,
    immatureKernels: 0,
    damagedKernels: 0,
    headRice: 0,
    totalDefects: 0,
    qualityGrade: "A",
    testMethod: "manual",
    testerName: "",
    remarks: "",
    status: "pending",
  };

  const [qcForm, setQcForm] = useState(initialQcForm);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    fetchQcData();
    if (currentBranchId) {
      fetchRiceData();
    }
  }, [currentBranchId]);

  const fetchQcData = async () => {
    if (!currentBranchId) {
      setQcRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await qcService.getAllQC();
      setQcRecords(data.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch QC data");
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch rice data for auto-population
  const fetchRiceData = async () => {
    try {
      // Fetch rice deposits to get available varieties and data
      const riceData = await riceDepositService.getAllRiceDeposits();
      setRiceDeposits(riceData.data || riceData || []);

      // Extract unique rice varieties
      const varieties = [
        ...new Set(
          riceData.data?.map((rice) => rice.variety) ||
            riceData?.map((rice) => rice.variety) ||
            []
        ),
      ];
      setRiceVarieties(varieties);
    } catch (err) {
      console.error("Error fetching rice data:", err);
    }
  };

  // Auto-generate batch number based on rice variety and date
  const generateBatchNumber = (riceVariety, date) => {
    if (!riceVariety || !date) return "";

    const dateStr = new Date(date).toISOString().slice(0, 10).replace(/-/g, "");
    const varietyCode = riceVariety.toUpperCase();
    const randomSuffix = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    return `QC-${varietyCode}-${dateStr}-${randomSuffix}`;
  };

  // Auto-populate QC form when rice variety or deposit is selected
  const handleRiceVarietyChange = (variety) => {
    setQcForm((prev) => ({
      ...prev,
      riceVariety: variety,
    }));

    // Auto-generate batch number
    if (variety && qcForm.sampleDate) {
      const batchNumber = generateBatchNumber(variety, qcForm.sampleDate);
      setQcForm((prev) => ({
        ...prev,
        batchNumber,
      }));
    }

    // Find rice deposit with this variety and auto-populate moisture
    const riceDeposit = riceDeposits.find((rice) => rice.variety === variety);
    if (riceDeposit && riceDeposit.moisture !== undefined) {
      setQcForm((prev) => ({
        ...prev,
        moistureContent: riceDeposit.moisture,
      }));
    }
  };

  // Auto-populate QC form when rice deposit is selected
  const handleRiceDepositSelection = (depositId) => {
    if (!depositId) {
      setSelectedRiceDeposit(null);
      return;
    }

    const deposit = riceDeposits.find((rice) => rice._id === depositId);
    if (deposit) {
      setSelectedRiceDeposit(deposit);

      // Auto-populate form fields
      setQcForm((prev) => ({
        ...prev,
        riceVariety: deposit.variety || "",
        moistureContent: deposit.moisture || 0,
        batchNumber: generateBatchNumber(
          deposit.variety,
          qcForm.sampleDate || new Date()
        ),
        remarks: `QC for Rice Deposit: ${deposit.truckMemo} - ${deposit.ackNo}`,
      }));
    }
  };

  const openQcModal = (qc = null) => {
    setEditingQc(qc);
    if (qc) {
      // Format date for HTML date input (YYYY-MM-DD)
      const formattedSampleDate = new Date(qc.sampleDate)
        .toISOString()
        .split("T")[0];
      const formData = {
        ...initialQcForm,
        ...qc,
        sampleDate: formattedSampleDate,
      };
      setQcForm(formData);
    } else {
      // For new QC record, auto-populate some fields
      const today = new Date().toISOString().split("T")[0];
      const formData = {
        ...initialQcForm,
        sampleDate: today,
        testerName: user?.name || "",
        batchNumber: generateBatchNumber("", today),
      };
      setQcForm(formData);
    }
    setShowQcModal(true);
  };

  const closeQcModal = () => {
    setShowQcModal(false);
    setEditingQc(null);
    setQcForm(initialQcForm);
    setSelectedFiles([]);
    setSelectedRiceDeposit(null);
  };

  const handleQcFormChange = (e) => {
    const { name, value } = e.target;
    setQcForm((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-calculate total defects and head rice
      if (
        [
          "brokenRice",
          "foreignMatter",
          "yellowKernels",
          "immatureKernels",
          "damagedKernels",
        ].includes(name)
      ) {
        const totalDefects =
          parseFloat(updated.brokenRice || 0) +
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
        updated.qualityGrade = "A";
      } else if (totalDefects <= 7) {
        updated.qualityGrade = "B";
      } else if (totalDefects <= 12) {
        updated.qualityGrade = "C";
      } else {
        updated.qualityGrade = "D";
      }

      // Auto-generate batch number when rice variety or sample date changes
      if (name === "riceVariety" || name === "sampleDate") {
        if (updated.riceVariety && updated.sampleDate) {
          updated.batchNumber = generateBatchNumber(
            updated.riceVariety,
            updated.sampleDate
          );
        }
      }

      return updated;
    });
  };

  const handleFilesChange = (files) => {
    setSelectedFiles(files);
  };

  const saveQc = async (e) => {
    e.preventDefault();

    if (!currentBranchId) {
      setError("Please select a branch before saving QC record");
      return;
    }

    try {
      setLoading(true);

      // Add loading timeout to prevent infinite loading
      const loadingTimeout = setTimeout(() => {
        setError(
          "QC creation is taking longer than expected. Please check your connection and try again."
        );
        setLoading(false);
      }, 20000); // 20 seconds timeout

      // Add branch_id to form data
      const formDataWithBranch = {
        ...qcForm,
        branch_id: currentBranchId,
      };

      if (editingQc) {
        await qcService.updateQC(
          editingQc._id,
          formDataWithBranch,
          selectedFiles
        );
      } else {
        await qcService.createQC(formDataWithBranch, selectedFiles);
      }

      clearTimeout(loadingTimeout);
      fetchQcData(); // Refresh data after save
      closeQcModal();
      setSelectedFiles([]); // Clear selected files
    } catch (error) {
      setError("Error saving QC record: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteQc = async (qcId) => {
    if (window.confirm("Are you sure you want to delete this QC record?")) {
      try {
        setLoading(true);
        await qcService.deleteQC(qcId);
        fetchQcData(); // Refresh data after delete
      } catch (error) {
        setError("Error deleting QC record: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800";
      case "B":
        return "bg-blue-100 text-blue-800";
      case "C":
        return "bg-yellow-100 text-yellow-800";
      case "D":
        return "bg-orange-100 text-orange-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter QC records based on search
  const filteredQcRecords = qcRecords.filter((qc) => {
    if (!qcFilter) return true;
    const searchTerm = qcFilter.toLowerCase();
    return (
      qc.batchNumber?.toLowerCase().includes(searchTerm) ||
      qc.riceVariety?.toLowerCase().includes(searchTerm) ||
      qc.qualityGrade?.toLowerCase().includes(searchTerm) ||
      qc.testerName?.toLowerCase().includes(searchTerm)
    );
  });

  // Table columns configuration
  const columns = [
    { key: "batchNumber", label: "Batch Number" },
    { key: "riceVariety", label: "Rice Variety" },
    {
      key: "sampleDate",
      label: "Sample Date",
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "qualityGrade",
      label: "Quality Grade",
      render: (value) => `Grade ${value}`,
    },
    {
      key: "status",
      label: "Status",
      render: (value) => value.charAt(0).toUpperCase() + value.slice(1),
    },
    { key: "testerName", label: "Tester" },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                QC Data Entry
              </h1>
              <p className="text-gray-600 mt-2">
                Manage quality control records for rice batches
              </p>
            </div>
            <Button
              onClick={() => openQcModal()}
              variant="primary"
              icon="plus"
              className="px-6 py-3"
            >
              Add QC Record
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-red-600 text-lg">⚠️</span>
                </div>
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          {!currentBranchId ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-yellow-600 text-lg">⚠️</span>
                </div>
                <div>
                  <p className="text-yellow-800 font-medium">
                    No Branch Selected
                  </p>
                  <p className="text-yellow-700 text-sm">
                    Please select a branch to view and manage QC records.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 text-lg">🔬</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Tests</p>
                    <p className="text-xl font-bold text-gray-900">
                      {qcRecords.length}
                    </p>
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
                    <p className="text-xl font-bold text-gray-900">
                      {
                        qcRecords.filter((qc) => qc.status === "approved")
                          .length
                      }
                    </p>
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
                    <p className="text-xl font-bold text-gray-900">
                      {qcRecords.filter((qc) => qc.status === "pending").length}
                    </p>
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
                    <p className="text-xl font-bold text-gray-900">
                      {
                        qcRecords.filter((qc) => qc.status === "rejected")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Table View */}
          {!currentBranchId ? (
            <div className="hidden lg:block bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                  QC Records
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Please select a branch to view QC records
                </p>
              </div>
              <div className="p-8 text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔬</span>
                </div>
                <p className="text-lg font-medium">No Branch Selected</p>
                <p className="text-sm">
                  Select a branch from the filter above to view QC records
                </p>
              </div>
            </div>
          ) : (
            <div className="hidden lg:block bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                  QC Records
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Total: {filteredQcRecords.length} records
                </p>
                {/* Filters moved inside table header */}
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <TableFilters
                      searchValue={qcFilter}
                      searchPlaceholder="Search by batch number, variety, grade..."
                      onSearchChange={(e) => setQcFilter(e.target.value)}
                      showSelect={false}
                    />
                    <BranchFilter
                      value={currentBranchId || ""}
                      onChange={(value) => {
                        console.log("Branch changed in QC:", value);
                      }}
                    />
                  </div>
                </div>
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
                  </Button>,
                ]}
                renderDetail={(qc) => (
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="w-24 text-sm font-medium text-gray-600">
                            Batch #:
                          </span>
                          <span className="text-gray-900 font-medium">
                            {qc.batchNumber}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-24 text-sm font-medium text-gray-600">
                            Rice Variety:
                          </span>
                          <span className="text-green-600 font-medium">
                            {qc.riceVariety}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-24 text-sm font-medium text-gray-600">
                            Sample Date:
                          </span>
                          <span className="text-gray-900 font-medium">
                            {new Date(qc.sampleDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-24 text-sm font-medium text-gray-600">
                            Tester:
                          </span>
                          <span className="text-gray-900 font-medium">
                            {qc.testerName}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="w-24 text-sm font-medium text-gray-600">
                            Quality Grade:
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(
                              qc.qualityGrade
                            )}`}
                          >
                            Grade {qc.qualityGrade}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-24 text-sm font-medium text-gray-600">
                            Status:
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              qc.status
                            )}`}
                          >
                            {qc.status.charAt(0).toUpperCase() +
                              qc.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-24 text-sm font-medium text-gray-600">
                            Test Method:
                          </span>
                          <span className="text-gray-900 font-medium">
                            {qc.testMethod}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quality Metrics */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">
                        Quality Metrics (%)
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Moisture</div>
                          <div className="text-lg font-semibold text-indigo-600">
                            {qc.moistureContent}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">
                            Broken Rice
                          </div>
                          <div className="text-lg font-semibold text-orange-600">
                            {qc.brokenRice}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">
                            Foreign Matter
                          </div>
                          <div className="text-lg font-semibold text-red-600">
                            {qc.foreignMatter}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Head Rice</div>
                          <div className="text-lg font-semibold text-green-600">
                            {qc.headRice}
                          </div>
                        </div>
                      </div>
                    </div>

                    {qc.remarks && (
                      <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">
                          Remarks
                        </h4>
                        <p className="text-gray-700 text-sm">{qc.remarks}</p>
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
          )}

          {/* Mobile Table View */}
          {!currentBranchId ? (
            <div className="lg:hidden bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                  QC Records
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Please select a branch to view QC records
                </p>
              </div>
              <div className="p-8 text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔬</span>
                </div>
                <p className="text-lg font-medium">No Branch Selected</p>
                <p className="text-sm">
                  Select a branch from the filter above to view QC records
                </p>
              </div>
            </div>
          ) : (
            <div className="lg:hidden bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
              <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                  QC Records
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Total: {filteredQcRecords.length} records
                </p>
              </div>

              <div className="p-4">
                {filteredQcRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No QC records
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating a new QC record.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredQcRecords.map((qc) => (
                      <div
                        key={qc._id}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <div
                          className="bg-white p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() =>
                            setExpandedQc(expandedQc === qc._id ? null : qc._id)
                          }
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="font-medium text-blue-600">
                                {qc.batchNumber}
                              </div>
                              <div className="text-sm text-gray-600">
                                {qc.riceVariety}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(qc.sampleDate).toLocaleDateString()} •
                                Grade {qc.qualityGrade} • {qc.status}
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
                                  expandedQc === qc._id ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {expandedQc === qc._id && (
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                              <div>
                                <span className="text-gray-600">
                                  Rice Variety:
                                </span>
                                <span className="ml-1 font-medium text-green-600">
                                  {qc.riceVariety}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Sample Date:
                                </span>
                                <span className="ml-1 font-medium text-gray-900">
                                  {new Date(qc.sampleDate).toLocaleDateString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Moisture:</span>
                                <span className="ml-1 font-medium text-indigo-600">
                                  {qc.moistureContent}%
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Head Rice:
                                </span>
                                <span className="ml-1 font-medium text-green-600">
                                  {qc.headRice}%
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Total Defects:
                                </span>
                                <span className="ml-1 font-medium text-red-600">
                                  {qc.totalDefects}%
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Quality Grade:
                                </span>
                                <span
                                  className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(
                                    qc.qualityGrade
                                  )}`}
                                >
                                  Grade {qc.qualityGrade}
                                </span>
                              </div>
                            </div>

                            {qc.remarks && (
                              <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-800 mb-1">
                                  Remarks
                                </h4>
                                <p className="text-gray-700 text-sm">
                                  {qc.remarks}
                                </p>
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
          )}
        </div>
      </div>

      {/* QC Modal */}
      <DialogBox
        show={showQcModal}
        onClose={closeQcModal}
        title={editingQc ? "Edit QC Record" : "Add New QC Record"}
        size="2xl"
      >
        <form
          onSubmit={saveQc}
          className="space-y-4"
          key={editingQc ? "edit" : "add"}
        >
          {/* Auto-population Section */}
          {!editingQc && (
            <div className="bg-accent/50 border border-accent rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-accent-foreground mb-3">
                🚀 Auto-Populate from Rice Data
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-accent-foreground mb-2">
                    Select Rice Deposit (Optional)
                  </label>
                  <select
                    value={selectedRiceDeposit?._id || ""}
                    onChange={(e) => handleRiceDepositSelection(e.target.value)}
                    className="block w-full border border-input rounded-md shadow-sm focus:ring-2 focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground"
                  >
                    <option value="">Select a rice deposit...</option>
                    {riceDeposits.map((rice) => (
                      <option key={rice._id} value={rice._id}>
                        {rice.truckMemo} - {rice.variety} - {rice.ackNo}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    This will auto-populate variety, moisture, and generate
                    batch number
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-foreground mb-2">
                    Available Rice Varieties
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {riceVarieties.map((variety) => (
                      <button
                        key={variety}
                        type="button"
                        onClick={() => handleRiceVarietyChange(variety)}
                        className="px-3 py-1 text-xs font-medium bg-accent text-accent-foreground rounded-full hover:bg-accent/80 transition-colors"
                      >
                        {variety}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click to auto-populate variety and generate batch number
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Batch Number"
              name="batchNumber"
              value={qcForm.batchNumber || ""}
              onChange={handleQcFormChange}
              required
              icon="hash"
            />
            <FormInput
              label="Rice Variety"
              name="riceVariety"
              value={qcForm.riceVariety || ""}
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
              icon="scissors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Defects (%)
              </label>
              <input
                type="text"
                value={qcForm.totalDefects}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto-calculated from individual defect percentages
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Head Rice (%)
              </label>
              <input
                type="text"
                value={qcForm.headRice}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto-calculated (100% - Total Defects)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Quality Grade"
              name="qualityGrade"
              value={qcForm.qualityGrade}
              onChange={handleQcFormChange}
              required
              options={[
                { value: "A", label: "Grade A (≤3% defects)" },
                { value: "B", label: "Grade B (≤7% defects)" },
                { value: "C", label: "Grade C (≤12% defects)" },
                { value: "D", label: "Grade D (>12% defects)" },
                { value: "Rejected", label: "Rejected" },
              ]}
            />
            <FormSelect
              label="Test Method"
              name="testMethod"
              value={qcForm.testMethod}
              onChange={handleQcFormChange}
              required
              options={[
                { value: "manual", label: "Manual Testing" },
                { value: "automated", label: "Automated Testing" },
                { value: "hybrid", label: "Hybrid Testing" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Status"
              name="status"
              value={qcForm.status}
              onChange={handleQcFormChange}
              required
              options={[
                { value: "pending", label: "Pending Review" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
                { value: "under_review", label: "Under Review" },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={qcForm.remarks}
              onChange={handleQcFormChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes or observations..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documents
            </label>
            <FileUpload
              onFilesChange={handleFilesChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              multiple
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload supporting documents (optional)
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={closeQcModal}
              variant="secondary"
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon="save"
              className="px-6 py-2"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : editingQc ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </DialogBox>
    </div>
  );
};

export default QCDataEntry;
