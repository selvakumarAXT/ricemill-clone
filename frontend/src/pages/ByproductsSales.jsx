import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Button from "../components/common/Button";
import DialogBox from "../components/common/DialogBox";
import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import GroupedTable from "../components/common/GroupedTable";
import LoadingSpinner from "../components/common/LoadingSpinner";
import BranchFilter from "../components/common/BranchFilter";
import DateRangeFilter from "../components/common/DateRangeFilter";
import FileUpload from "../components/common/FileUpload";
import { formatDate, formatCurrency } from "../utils/calculations";
import InvoiceTemplate from "../components/common/InvoiceTemplate";
import PreviewInvoice from "../components/common/PreviewInvoice";
import VendorSelector from "../components/common/VendorSelector"; // Added import for VendorSelector

const ByproductsSales = () => {
  const { user } = useSelector((state) => state.auth);
  const { currentBranchId } = useSelector((state) => state.branch);

  const [byproducts, setByproducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingByproduct, setEditingByproduct] = useState(null);
  const [expandedByproduct, setExpandedByproduct] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedByproductForInvoice, setSelectedByproductForInvoice] =
    useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewInvoiceData, setPreviewInvoiceData] = useState(null);
  const [vendors, setVendors] = useState([]); // Added state for vendors

  // Byproduct types
  const BYPRODUCT_TYPES = [
    "Husk",
    "Broken Rice",
    "Brown Rice",
    "Bran",
    "Rice Flour",
    "Rice Starch",
    "Rice Bran Oil",
    "Other",
  ];

  // Units for byproducts
  const UNITS = ["kg", "tons", "bags", "quintals"];

  // Payment methods
  const PAYMENT_METHODS = [
    "Cash",
    "Bank Transfer",
    "Cheque",
    "UPI",
    "Credit",
    "Other",
  ];

  // Payment status
  const PAYMENT_STATUS = ["Pending", "Partial", "Completed", "Overdue"];

  const initialByproductForm = {
    date: new Date().toISOString().split("T")[0],
    vehicleNumber: "",
    material: "",
    weight: "",
    unit: "kg",
    rate: "",
    totalAmount: 0,
    vendorName: "",
    vendorPhone: "",
    vendorEmail: "",
    vendorAddress: "",
    vendorGstin: "",
    vendorPan: "",
    paymentMethod: "Cash",
    paymentStatus: "Pending",
    notes: "",
    invoiceNumber: "",
    invoiceGenerated: false,
    branch_id: currentBranchId,
    createdBy: user?.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    vendor_id: "", // Added vendor_id to initialByproductForm
  };

  const [byproductForm, setByproductForm] = useState(initialByproductForm);

  useEffect(() => {
    fetchByproductsData();
    fetchVendors(); // Fetch vendors on component mount
  }, [currentBranchId]);

  const fetchByproductsData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call when backend is ready
      // For now, set empty array to remove default data
      setByproducts([]);
    } catch (err) {
      setError(err.message || "Failed to fetch byproducts data");
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call to fetch vendors when backend is ready
      // For now, set empty array to remove default data
      setVendors([]);
    } catch (err) {
      setError(err.message || "Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };

  const clearVendorSelection = () => {
    setByproductForm((prev) => ({
      ...prev,
      vendor_id: "",
      vendorName: "",
      vendorPhone: "",
      vendorEmail: "",
      vendorAddress: "",
      vendorGstin: "",
      vendorPan: "",
    }));
  };

  const getSelectedVendor = () => {
    return vendors.find((v) => v._id === byproductForm.vendor_id);
  };

  const openModal = (byproduct = null) => {
    setEditingByproduct(byproduct);
    if (byproduct) {
      const formattedDate = new Date(byproduct.date)
        .toISOString()
        .split("T")[0];
      const formData = {
        ...initialByproductForm,
        ...byproduct,
        date: formattedDate,
      };
      setByproductForm(formData);
    } else {
      setByproductForm({
        ...initialByproductForm,
        branch_id: currentBranchId,
        createdBy: user?.id,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingByproduct(null);
    setByproductForm(initialByproductForm);
    setSelectedFiles([]);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setByproductForm((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-calculate total amount
      if (name === "weight" || name === "rate") {
        const weight = parseFloat(updated.weight) || 0;
        const rate = parseFloat(updated.rate) || 0;
        updated.totalAmount = weight * rate;
      }

      return updated;
    });
  };

  const handleFilesChange = (files) => {
    setSelectedFiles(files);
  };

  const saveByproduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      if (editingByproduct) {
        // Update existing
        const updatedByproducts = byproducts.map((item) =>
          item._id === editingByproduct._id
            ? {
                ...byproductForm,
                _id: item._id,
                updatedAt: new Date().toISOString(),
              }
            : item
        );
        setByproducts(updatedByproducts);
        setSuccessMessage("Byproduct sale updated successfully!");
      } else {
        // Create new
        const newByproduct = {
          ...byproductForm,
          _id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setByproducts((prev) => [newByproduct, ...prev]);
        setSuccessMessage("Byproduct sale created successfully!");
      }

      closeModal();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to save byproduct sale");
    } finally {
      setLoading(false);
    }
  };

  const deleteByproduct = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this byproduct sale?")
    ) {
      try {
        // TODO: Replace with actual API call
        setByproducts((prev) => prev.filter((item) => item._id !== id));
        setSuccessMessage("Byproduct sale deleted successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        setError(err.message || "Failed to delete byproduct sale");
      }
    }
  };

  const openInvoiceModal = (byproduct) => {
    setSelectedByproductForInvoice(byproduct);
    setShowInvoiceModal(true);
  };

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setSelectedByproductForInvoice(null);
  };

  const handleGenerateInvoice = (invoiceData) => {
    try {
      setLoading(true);

      // Update byproduct with invoice information
      setByproducts((prev) =>
        prev.map((byproduct) =>
          byproduct._id === selectedByproductForInvoice._id
            ? {
                ...byproduct,
                invoiceNumber: invoiceData.invoiceNumber,
                invoiceGenerated: true,
              }
            : byproduct
        )
      );

      alert("Byproduct invoice generated successfully!");
      closeInvoiceModal();
    } catch (error) {
      setError("Error generating invoice: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openPreviewModal = (byproduct) => {
    setPreviewInvoiceData(byproduct);
    setShowPreviewModal(true);
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewInvoiceData(null);
  };

  const downloadInvoice = async (byproduct) => {
    try {
      setLoading(true);
      // TODO: Implement actual PDF download
      alert("Invoice download functionality coming soon!");
    } catch (error) {
      setError("Error downloading invoice: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (rowIndex) => {
    setExpandedByproduct(expandedByproduct === rowIndex ? null : rowIndex);
  };

  const renderDetail = (byproduct) => (
    <div className="p-4 bg-gray-50 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Vendor Details</h4>
          <p>
            <span className="font-medium">Name:</span> {byproduct.vendorName}
          </p>
          <p>
            <span className="font-medium">Phone:</span> {byproduct.vendorPhone}
          </p>
          <p>
            <span className="font-medium">Email:</span> {byproduct.vendorEmail}
          </p>
          <p>
            <span className="font-medium">Address:</span>{" "}
            {byproduct.vendorAddress}
          </p>
          <p>
            <span className="font-medium">GSTIN:</span> {byproduct.vendorGstin}
          </p>
          <p>
            <span className="font-medium">PAN:</span> {byproduct.vendorPan}
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Payment Details</h4>
          <p>
            <span className="font-medium">Method:</span>{" "}
            {byproduct.paymentMethod}
          </p>
          <p>
            <span className="font-medium">Status:</span>
            <span
              className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                byproduct.paymentStatus === "Completed"
                  ? "bg-green-100 text-green-800"
                  : byproduct.paymentStatus === "Pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : byproduct.paymentStatus === "Partial"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {byproduct.paymentStatus}
            </span>
          </p>
          <p>
            <span className="font-medium">Notes:</span>{" "}
            {byproduct.notes || "No notes"}
          </p>
          <p>
            <span className="font-medium">Invoice:</span>
            <span
              className={`ml-2 font-medium ${
                byproduct.invoiceNumber ? "text-green-600" : "text-gray-400"
              }`}
            >
              {byproduct.invoiceNumber || "Not Generated"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );

  // Table columns configuration
  const columns = [
    { key: "date", label: "Date", render: (value) => formatDate(value) },
    { key: "vehicleNumber", label: "Vehicle No." },
    {
      key: "invoiceNumber",
      label: "Invoice #",
      render: (value) => (
        <span
          className={`font-medium ${
            value ? "text-green-600" : "text-gray-400"
          }`}
        >
          {value || "Not Generated"}
        </span>
      ),
    },
    { key: "material", label: "Material" },
    {
      key: "weight",
      label: "Weight",
      render: (value, record) => `${value} ${record.unit}`,
    },
    { key: "rate", label: "Rate", render: (value) => `₹${value}` },
    {
      key: "totalAmount",
      label: "Total Amount",
      render: (value) => formatCurrency(value),
    },
    { key: "vendorName", label: "Vendor" },
    {
      key: "paymentStatus",
      label: "Payment Status",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "Completed"
              ? "bg-green-100 text-green-800"
              : value === "Pending"
              ? "bg-yellow-100 text-yellow-800"
              : value === "Partial"
              ? "bg-blue-100 text-blue-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  // Ensure all columns have valid keys
  const validColumns = columns.filter(
    (col) => col.key && col.key !== undefined
  );

  // Debug logging
  console.log("Columns:", columns);
  console.log("Valid Columns:", validColumns);
  console.log("Grouped Headers:", groupedHeaders);

  // Grouped headers for better organization
  const groupedHeaders = [
    {
      label: "Sale Information",
      columns: validColumns.filter((col) =>
        ["date", "vehicleNumber", "material"].includes(col.key)
      ),
    },
    {
      label: "Quantity & Pricing",
      columns: validColumns.filter((col) =>
        ["weight", "rate", "totalAmount"].includes(col.key)
      ),
    },
    {
      label: "Vendor & Payment",
      columns: validColumns.filter((col) =>
        ["vendorName", "paymentStatus"].includes(col.key)
      ),
    },
    {
      label: "Invoice & Documents",
      columns: validColumns.filter((col) =>
        ["invoiceNumber"].includes(col.key)
      ),
    },
  ];

  // Actions for each row
  const actions = (record) => [
    <button
      key="edit"
      onClick={() => openModal(record)}
      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
    >
      Edit
    </button>,
    record.invoiceNumber ? (
      <>
        <button
          key="preview-invoice"
          onClick={() => openPreviewModal(record)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors mr-1"
        >
          Preview
        </button>
        <button
          key="download-invoice"
          onClick={() => downloadInvoice(record)}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
        >
          Download
        </button>
      </>
    ) : (
      <button
        key="generate-invoice"
        onClick={() => openInvoiceModal(record)}
        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
      >
        Generate Invoice
      </button>
    ),
    <button
      key="delete"
      onClick={() => deleteByproduct(record._id)}
      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
    >
      Delete
    </button>,
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Byproducts Sales
          </h1>
          <p className="text-gray-600">
            Manage sales of rice mill byproducts like husk, broken rice, brown
            rice, and bran
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Byproducts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <GroupedTable
            data={byproducts}
            columns={validColumns}
            groupedHeaders={groupedHeaders}
            actions={actions}
            renderDetail={renderDetail}
            onRowClick={handleRowClick}
            expandedRow={expandedByproduct}
            tableTitle="Byproducts Sales"
            showRowNumbers={true}
            selectable={false}
            childFilters={
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                  <BranchFilter />
                  <DateRangeFilter
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                    onStartDateChange={(date) =>
                      setDateRange((prev) => ({ ...prev, startDate: date }))
                    }
                    onEndDateChange={(date) =>
                      setDateRange((prev) => ({ ...prev, endDate: date }))
                    }
                  />
                </div>
                <Button
                  onClick={() => openModal()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                >
                  + New Byproduct Sale
                </Button>
              </div>
            }
          />
        </div>

        {/* Add/Edit Modal */}
        <DialogBox
          show={showModal}
          onClose={closeModal}
          onSubmit={saveByproduct}
          title={
            editingByproduct ? "Edit Byproduct Sale" : "Add New Byproduct Sale"
          }
          submitText={editingByproduct ? "Update" : "Create"}
          cancelText="Cancel"
          size="2xl"
        >
          <form onSubmit={saveByproduct} className="space-y-6">
            {/* Basic Information */}
            <fieldset className="border border-gray-200 rounded p-4">
              <legend className="text-sm font-semibold text-gray-700 px-2">
                Sale Information
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  label="Date"
                  name="date"
                  type="date"
                  value={byproductForm.date}
                  onChange={handleFormChange}
                  required
                  icon="calendar"
                />
                <FormInput
                  label="Vehicle Number"
                  name="vehicleNumber"
                  value={byproductForm.vehicleNumber}
                  onChange={handleFormChange}
                  required
                  placeholder="e.g., TN-20-BU-4006"
                  icon="truck"
                />
                <FormSelect
                  label="Material"
                  name="material"
                  value={byproductForm.material}
                  onChange={handleFormChange}
                  required
                  icon="package"
                >
                  <option value="">Select Material</option>
                  {BYPRODUCT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </FormSelect>
              </div>
            </fieldset>

            {/* Quantity and Pricing */}
            <fieldset className="border border-gray-200 rounded p-4">
              <legend className="text-sm font-semibold text-gray-700 px-2">
                Quantity & Pricing
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormInput
                  label="Weight"
                  name="weight"
                  type="number"
                  value={byproductForm.weight}
                  onChange={handleFormChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  icon="scale"
                />
                <FormSelect
                  label="Unit"
                  name="unit"
                  value={byproductForm.unit}
                  onChange={handleFormChange}
                  required
                  icon="ruler"
                >
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </FormSelect>
                <FormInput
                  label="Rate per Unit"
                  name="rate"
                  type="number"
                  value={byproductForm.rate}
                  onChange={handleFormChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  icon="currency-rupee"
                />
                <FormInput
                  label="Total Amount"
                  name="totalAmount"
                  type="number"
                  value={byproductForm.totalAmount}
                  readOnly
                  className="bg-gray-50"
                  icon="calculator"
                />
              </div>
            </fieldset>

            {/* Vendor Details */}
            <fieldset className="border border-gray-200 rounded p-4">
              <legend className="text-sm font-semibold text-gray-700 px-2">
                Vendor Details
              </legend>

              {/* Vendor Selection Dropdown */}
              <div className="mb-4">
                <VendorSelector
                  value={byproductForm.vendor_id}
                  onChange={(vendorId) => {
                    setByproductForm((prev) => ({
                      ...prev,
                      vendor_id: vendorId,
                    }));
                  }}
                  onVendorSelect={(vendor) => {
                    if (vendor) {
                      setByproductForm((prev) => ({
                        ...prev,
                        vendorName: vendor.vendorName,
                        vendorPhone: vendor.phone,
                        vendorEmail: vendor.email,
                        vendorAddress: `${vendor.address}, ${vendor.city}, ${vendor.state} - ${vendor.pincode}`,
                        vendorGstin:
                          vendor.gstNumber ||
                          vendor.companyGstin ||
                          vendor.vendorGstin,
                        vendorPan: vendor.panNumber || vendor.gstinPan,
                      }));
                    } else {
                      setByproductForm((prev) => ({
                        ...prev,
                        vendorName: "",
                        vendorPhone: "",
                        vendorEmail: "",
                        vendorAddress: "",
                        vendorGstin: "",
                        vendorPan: "",
                      }));
                    }
                  }}
                  placeholder="Select a vendor to auto-fill details"
                  label="Select Vendor"
                  required={false}
                  showVendorType={true}
                />

                {/* Help text */}
                <div className="mt-1 text-xs text-gray-600">
                  💡 Select a vendor from the dropdown to automatically populate
                  vendor details. You can still edit the fields manually if
                  needed.
                </div>

                {/* Clear Vendor Button */}
                {byproductForm.vendor_id && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={clearVendorSelection}
                      className="text-sm text-red-600 hover:text-red-800 underline flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Clear Vendor Selection
                    </button>
                  </div>
                )}
              </div>

              {/* Selected Vendor Info Display */}
              {byproductForm.vendor_id && getSelectedVendor() && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-blue-600 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="font-medium text-blue-800">
                        Selected Vendor: {getSelectedVendor()?.vendorName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={clearVendorSelection}
                      className="text-sm text-red-600 hover:text-red-800 underline"
                    >
                      Change Vendor
                    </button>
                  </div>
                </div>
              )}

              {/* Vendor Information Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Vendor Name"
                  name="vendorName"
                  value={byproductForm.vendorName}
                  onChange={handleFormChange}
                  required
                  placeholder="Enter vendor name"
                  icon="user"
                  className={
                    byproductForm.vendor_id ? "bg-blue-50 border-blue-300" : ""
                  }
                />
                <FormInput
                  label="Vendor Phone"
                  name="vendorPhone"
                  value={byproductForm.vendorPhone}
                  onChange={handleFormChange}
                  required
                  placeholder="+91 9876543210"
                  icon="phone"
                  className={
                    byproductForm.vendor_id ? "bg-blue-50 border-blue-300" : ""
                  }
                />
                <FormInput
                  label="Vendor Email"
                  name="vendorEmail"
                  type="email"
                  value={byproductForm.vendorEmail}
                  onChange={handleFormChange}
                  placeholder="vendor@example.com"
                  icon="mail"
                  className={
                    byproductForm.vendor_id ? "bg-blue-50 border-blue-300" : ""
                  }
                />
                <FormInput
                  label="Vendor GSTIN"
                  name="vendorGstin"
                  value={byproductForm.vendorGstin}
                  onChange={handleFormChange}
                  placeholder="22AAAAA0000A1Z5"
                  icon="file-text"
                  className={
                    byproductForm.vendor_id ? "bg-blue-50 border-blue-300" : ""
                  }
                />
                <FormInput
                  label="Vendor PAN"
                  name="vendorPan"
                  value={byproductForm.vendorPan}
                  onChange={handleFormChange}
                  placeholder="ABCD1234EFGH"
                  icon="credit-card"
                  className={
                    byproductForm.vendor_id ? "bg-blue-50 border-blue-300" : ""
                  }
                />
                <FormInput
                  label="Vendor Address"
                  name="vendorAddress"
                  value={byproductForm.vendorAddress}
                  onChange={handleFormChange}
                  placeholder="Enter vendor address"
                  icon="map-pin"
                  className={
                    byproductForm.vendor_id ? "bg-blue-50 border-blue-300" : ""
                  }
                />
              </div>

              {/* Auto-populated indicator */}
              {byproductForm.vendor_id && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center text-sm text-green-700">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Vendor details have been auto-populated. You can still edit
                    these fields if needed.
                  </div>
                </div>
              )}
            </fieldset>

            {/* Payment Details */}
            <fieldset className="border border-gray-200 rounded p-4">
              <legend className="text-sm font-semibold text-gray-700 px-2">
                Payment Details
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormSelect
                  label="Payment Method"
                  name="paymentMethod"
                  value={byproductForm.paymentMethod}
                  onChange={handleFormChange}
                  required
                  icon="credit-card"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </FormSelect>
                <FormSelect
                  label="Payment Status"
                  name="paymentStatus"
                  value={byproductForm.paymentStatus}
                  onChange={handleFormChange}
                  required
                  icon="check-circle"
                >
                  {PAYMENT_STATUS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </FormSelect>
                <FormInput
                  label="Notes"
                  name="notes"
                  value={byproductForm.notes}
                  onChange={handleFormChange}
                  placeholder="Additional notes..."
                  icon="file-text"
                />
              </div>
            </fieldset>

            {/* File Upload */}
            <FileUpload
              label="Upload Related Documents"
              module="byproducts"
              onFilesChange={handleFilesChange}
              files={selectedFiles}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
              maxFiles={5}
              maxSize={10}
              showPreview={true}
              disableAutoUpload={true}
            />
          </form>
        </DialogBox>

        {/* Invoice Template Modal */}
        <InvoiceTemplate
          record={selectedByproductForInvoice}
          show={showInvoiceModal}
          onClose={closeInvoiceModal}
          onGenerate={handleGenerateInvoice}
          type="byproduct"
          title="Generate Byproduct Invoice"
        />

        {/* Preview Invoice Modal */}
        <PreviewInvoice
          invoiceData={previewInvoiceData}
          show={showPreviewModal}
          onClose={closePreviewModal}
          onDownload={downloadInvoice}
          type="byproduct"
          title="Byproduct Invoice Preview"
        />
      </div>
    </div>
  );
};

export default ByproductsSales;
