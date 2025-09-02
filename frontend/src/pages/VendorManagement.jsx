import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import GroupedTable from "../components/common/GroupedTable";
import { Button as UIButton } from "../components/ui/button";
import Icon from "../components/common/Icon";
import LoadingSpinner from "../components/common/LoadingSpinner";
import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import DialogBox from "../components/common/DialogBox";
import FileUpload from "../components/common/FileUpload";
import FileDisplay from "../components/common/FileDisplay";
import DateRangeFilter from "../components/common/DateRangeFilter";

import vendorService from "../services/vendorService";

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [selectedVendorForTransaction, setSelectedVendorForTransaction] =
    useState(null);
  const [expandedVendor, setExpandedVendor] = useState(null);
  const { currentBranchId } = useSelector((state) => state.branch);
  const { user } = useSelector((state) => state.auth);

  const initialVendorForm = {
    vendorCode: "",
    vendorName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    placeOfSupply: "",
    gstNumber: "",
    panNumber: "",
    vendorType: "supplier",
    creditLimit: 0,
    paymentTerms: "30_days",
    rating: 5,
    status: "active",
    remarks: "",
  };

  const initialTransactionForm = {
    amount: "",
    type: "payment_given",
    reference: "",
    description: "",
    remarks: "",
    adjustmentType: "positive",
  };

  const [vendorForm, setVendorForm] = useState(initialVendorForm);
  const [transactionForm, setTransactionForm] = useState(
    initialTransactionForm
  );
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filter states
  const [searchFilter, setSearchFilter] = useState("");
  const [vendorTypeFilter, setVendorTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [balanceStatusFilter, setBalanceStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (user) {
      fetchVendorData();
    }
  }, [
    currentBranchId,
    user,
    searchFilter,
    vendorTypeFilter,
    statusFilter,
    balanceStatusFilter,
    dateRange,
  ]);

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleDateRangeChange = (field, value) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const fetchVendorData = async () => {
    // For superadmins, if no branch is selected, we can still fetch vendors
    // For regular users, branch_id is required
    if (!currentBranchId && !user?.isSuperAdmin) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const params = {
        page: 1,
        limit: 100,
        search: searchFilter,
        vendorType: vendorTypeFilter,
        status: statusFilter,
        balanceStatus: balanceStatusFilter,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };

      // Only add branch_id if it's set
      if (currentBranchId) {
        params.branch_id = currentBranchId;
      }

      const response = await vendorService.getAllVendors(params);

      if (response.success) {
        setVendors(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch vendor data");
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
      setError(err.message || "Failed to fetch vendor data");
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const openVendorModal = (vendor = null) => {
    setEditingVendor(vendor);
    if (vendor) {
      const formData = {
        ...initialVendorForm,
        ...vendor,
      };
      setVendorForm(formData);
      setUploadedFiles(vendor.documents || []);
    } else {
      setVendorForm(initialVendorForm);
      setUploadedFiles([]);
    }
    setSelectedFiles([]);
    setShowVendorModal(true);
  };

  const openTransactionModal = (vendor) => {
    setSelectedVendorForTransaction(vendor);
    setTransactionForm(initialTransactionForm);
    setShowTransactionModal(true);
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();

    if (!currentBranchId) {
      setError("Please select a branch first");
      return;
    }

    try {
      let response;
      if (editingVendor) {
        response = await vendorService.updateVendor(
          editingVendor._id,
          vendorForm,
          selectedFiles
        );
      } else {
        response = await vendorService.createVendor(vendorForm, selectedFiles);
      }

      if (response.success) {
        setSuccessMessage(response.message);
        setShowVendorModal(false);
        fetchVendorData();
      }
    } catch (err) {
      setError(err.message || "Failed to save vendor");
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await vendorService.addVendorTransaction(
        selectedVendorForTransaction._id,
        transactionForm
      );

      if (response.success) {
        setSuccessMessage("Transaction added successfully");
        setShowTransactionModal(false);
        fetchVendorData();
      }
    } catch (err) {
      setError(err.message || "Failed to add transaction");
    }
  };

  const handleDeleteVendor = async (vendorId) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        const response = await vendorService.deleteVendor(vendorId);
        if (response.success) {
          setSuccessMessage("Vendor deleted successfully");
          fetchVendorData();
        }
      } catch (err) {
        setError(err.message || "Failed to delete vendor");
      }
    }
  };

  const filteredVendors = vendors.filter((vendor) => {
    if (
      searchFilter &&
      !vendor.vendorName.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !vendor.vendorCode.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !vendor.contactPerson.toLowerCase().includes(searchFilter.toLowerCase())
    ) {
      return false;
    }
    if (vendorTypeFilter && vendor.vendorType !== vendorTypeFilter)
      return false;
    if (statusFilter && vendor.status !== statusFilter) return false;
    if (balanceStatusFilter) {
      if (balanceStatusFilter === "settled" && vendor.currentBalance !== 0)
        return false;
      if (
        balanceStatusFilter === "vendor_owes_us" &&
        vendor.currentBalance <= 0
      )
        return false;
      if (balanceStatusFilter === "we_owe_vendor" && vendor.currentBalance >= 0)
        return false;
    }
    return true;
  });

  const vendorColumns = [
    "Code",
    "Name",
    "Contact",
    "Phone",
    "GSTIN",
    "PAN",
    "Place of Supply",
    "Type",
    "Status",
    "Balance",
    "Actions",
  ];

  // Transform vendor data for table display
  const transformVendorDataForTable = (vendors) => {
    return vendors.map((vendor) => ({
      id: vendor._id,
      Code: vendor.vendorCode,
      Name: vendor.vendorName,
      Contact: vendor.contactPerson,
      Phone: vendor.phone,
      GSTIN: vendor.gstNumber || "-",
      PAN: vendor.panNumber || "-",
      "Place of Supply": vendor.placeOfSupply,
      Type:
        vendor.vendorType
          ?.replace("_", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()) || "-",
      Status:
        vendor.status?.charAt(0).toUpperCase() + vendor.status?.slice(1) || "-",
      Balance: vendor.currentBalance || 0,
      Actions: vendor._id, // This will be handled by the actions prop
      // Keep original data for detail view and actions
      ...vendor,
    }));
  };

  const tableData = transformVendorDataForTable(filteredVendors);

  const renderVendorDetail = (vendor) => (
    <div className="p-4 bg-muted rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-foreground mb-2">
            Contact Information
          </h4>
          <p>
            <span className="font-medium">Email:</span> {vendor.email}
          </p>
          <p>
            <span className="font-medium">Address:</span> {vendor.address}
          </p>
          <p>
            <span className="font-medium">City:</span> {vendor.city},{" "}
            {vendor.state} - {vendor.pincode}
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">
            Financial Summary
          </h4>
          <p>
            <span className="font-medium">Credit Limit:</span> ₹
            {vendor.creditLimit?.toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Payments Given:</span> ₹
            {vendor.totalPaymentsGiven?.toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Payments Received:</span> ₹
            {vendor.totalPaymentsReceived?.toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Current Balance:</span>
            <span className={`ml-2 font-bold text-foreground`}>
              ₹{Math.abs(vendor.currentBalance)?.toLocaleString()}
              {vendor.currentBalance > 0
                ? " (Vendor owes us)"
                : vendor.currentBalance < 0
                ? " (We owe vendor)"
                : " (Settled)"}
            </span>
          </p>
        </div>
      </div>
      {vendor.documents && vendor.documents.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-foreground mb-2">Documents</h4>
          <FileDisplay files={vendor.documents} />
        </div>
      )}
    </div>
  );

  const renderVendorActions = (vendor) => (
    <div className="flex flex-wrap gap-2">
      <UIButton
        onClick={() => openVendorModal(vendor)}
        variant="secondary"
        size="sm"
        className="h-8 px-2 gap-1"
      >
        <Icon name="edit" className="h-4 w-4" />
        <span className="hidden sm:inline">Edit</span>
      </UIButton>
      <UIButton
        onClick={() => openTransactionModal(vendor)}
        variant="default"
        size="sm"
        className="h-8 px-2 gap-1"
      >
        <Icon name="add" className="h-4 w-4" />
        <span className="hidden sm:inline">Transaction</span>
      </UIButton>
      <UIButton
        onClick={() => handleDeleteVendor(vendor._id)}
        variant="destructive"
        size="sm"
        className="h-8 px-2 gap-1"
      >
        <Icon name="delete" className="h-4 w-4" />
        <span className="hidden sm:inline">Delete</span>
      </UIButton>
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Vendor Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage vendor information and financial transactions
          </p>
        </div>
        {((user?.isSuperAdmin &&
          currentBranchId &&
          currentBranchId !== "all") ||
          (!user?.isSuperAdmin && user?.branch?.id)) && (
          <UIButton
            onClick={() => openVendorModal()}
            variant="default"
            className="w-full sm:w-auto gap-2"
          >
            <Icon name="add" className="h-4 w-4" />
            <span>Add New Vendor</span>
          </UIButton>
        )}
      </div>

      {error && (
        <div className="bg-muted border border-border text-foreground px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-muted border border-border text-foreground px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {!currentBranchId && !user?.isSuperAdmin ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-lg">
            Please select a branch to view vendors
          </p>
        </div>
      ) : (
        <>
          {/* Always show the table with filters and headers */}
          <GroupedTable
            tableTitle="Vendor Records"
            data={tableData}
            columns={vendorColumns}
            groupedHeaders={[
              {
                label: "Vendor Information",
                columns: [
                  { key: "Code", label: "Code" },
                  { key: "Name", label: "Name" },
                  { key: "Contact", label: "Contact" },
                  { key: "Phone", label: "Phone" },
                  { key: "GSTIN", label: "GSTIN" },
                  { key: "PAN", label: "PAN" },
                  { key: "Place of Supply", label: "Place of Supply" },
                ],
              },
              {
                label: "Status & Financial",
                columns: [
                  { key: "Type", label: "Type" },
                  { key: "Status", label: "Status" },
                  {
                    key: "Balance",
                    label: "Balance",
                    render: (value, row) => {
                      const balance = row.currentBalance || 0;
                      const isPositive = balance > 0;
                      const isNegative = balance < 0;

                      return (
                        <div className="text-center">
                          <span className="font-semibold text-foreground">
                            ₹{Math.abs(balance).toLocaleString()}
                          </span>
                          <div className="text-xs text-muted-foreground mt-1">
                            {isPositive
                              ? "Vendor owes us"
                              : isNegative
                              ? "We owe vendor"
                              : "Settled"}
                          </div>
                        </div>
                      );
                    },
                  },
                ],
              },
            ]}
            childFilters={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search Filter */}
                <div className="min-w-[200px] flex-shrink-0">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Search vendors..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors shadow-sm bg-background text-foreground"
                  />
                </div>

                {/* Vendor Type Filter */}
                <div className="min-w-[180px] flex-shrink-0">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Vendor Type
                  </label>
                  <select
                    value={vendorTypeFilter}
                    onChange={(e) => setVendorTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors bg-background text-foreground shadow-sm"
                  >
                    <option value="">All Types</option>
                    <option value="supplier">Supplier</option>
                    <option value="contractor">Contractor</option>
                    <option value="service_provider">Service Provider</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Balance Status Filter */}
                <div className="min-w-[200px] flex-shrink-0">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Balance Status
                  </label>
                  <select
                    value={balanceStatusFilter}
                    onChange={(e) => setBalanceStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors bg-background text-foreground shadow-sm"
                  >
                    <option value="">All Balances</option>
                    <option value="settled">Settled</option>
                    <option value="vendor_owes_us">Vendor Owes Us</option>
                    <option value="we_owe_vendor">We Owe Vendor</option>
                  </select>
                </div>
              </div>
            }
            renderDetail={renderVendorDetail}
            actions={renderVendorActions}
            emptyMessage={
              filteredVendors.length === 0 && !loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-lg">
                    {vendors.length === 0
                      ? "No vendors found"
                      : "No vendors match the current filters"}
                  </p>
                </div>
              ) : null
            }
          />
        </>
      )}

      {/* Vendor Modal */}
      <DialogBox
        show={showVendorModal}
        onClose={() => setShowVendorModal(false)}
        title={editingVendor ? "Edit Vendor" : "Add New Vendor"}
        size="lg"
      >
        <form onSubmit={handleVendorSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Vendor Code"
              value={vendorForm.vendorCode}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, vendorCode: e.target.value })
              }
              required
            />
            <FormInput
              label="Vendor Name"
              value={vendorForm.vendorName}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, vendorName: e.target.value })
              }
              required
            />
            <FormInput
              label="Contact Person"
              value={vendorForm.contactPerson}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, contactPerson: e.target.value })
              }
              required
            />
            <FormInput
              label="Phone"
              value={vendorForm.phone}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, phone: e.target.value })
              }
              required
            />
            <FormInput
              label="Email"
              type="email"
              value={vendorForm.email}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, email: e.target.value })
              }
              required
            />
            <FormInput
              label="Place of Supply"
              value={vendorForm.placeOfSupply}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, placeOfSupply: e.target.value })
              }
              required
            />
            <FormInput
              label="GST Number"
              value={vendorForm.gstNumber}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, gstNumber: e.target.value })
              }
            />
            <FormInput
              label="PAN Number"
              value={vendorForm.panNumber}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, panNumber: e.target.value })
              }
            />
            <FormSelect
              label="Vendor Type"
              value={vendorForm.vendorType}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, vendorType: e.target.value })
              }
              options={[
                { value: "supplier", label: "Supplier" },
                { value: "contractor", label: "Contractor" },
                { value: "service_provider", label: "Service Provider" },
                { value: "other", label: "Other" },
              ]}
            />
            <FormSelect
              label="Status"
              value={vendorForm.status}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, status: e.target.value })
              }
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "suspended", label: "Suspended" },
              ]}
            />
            <FormInput
              label="Credit Limit"
              type="number"
              value={vendorForm.creditLimit}
              onChange={(e) =>
                setVendorForm({
                  ...vendorForm,
                  creditLimit: parseFloat(e.target.value) || 0,
                })
              }
            />
            <FormSelect
              label="Payment Terms"
              value={vendorForm.paymentTerms}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, paymentTerms: e.target.value })
              }
              options={[
                { value: "immediate", label: "Immediate" },
                { value: "7_days", label: "7 Days" },
                { value: "15_days", label: "15 Days" },
                { value: "30_days", label: "30 Days" },
                { value: "45_days", label: "45 Days" },
                { value: "60_days", label: "60 Days" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Address"
              value={vendorForm.address}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, address: e.target.value })
              }
              required
            />
            <FormInput
              label="City"
              value={vendorForm.city}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, city: e.target.value })
              }
              required
            />
            <FormInput
              label="State"
              value={vendorForm.state}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, state: e.target.value })
              }
              required
            />
            <FormInput
              label="Pincode"
              value={vendorForm.pincode}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, pincode: e.target.value })
              }
              required
            />
          </div>

          <FormInput
            label="Remarks"
            value={vendorForm.remarks}
            onChange={(e) =>
              setVendorForm({ ...vendorForm, remarks: e.target.value })
            }
            multiline
          />

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Documents
            </label>
            <FileUpload
              onFilesSelected={setSelectedFiles}
              uploadedFiles={uploadedFiles}
              onFilesUploaded={setUploadedFiles}
              disableAutoUpload={true}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <UIButton
              type="button"
              variant="secondary"
              onClick={() => setShowVendorModal(false)}
            >
              Cancel
            </UIButton>
            <UIButton type="submit" variant="default">
              {editingVendor ? "Update Vendor" : "Create Vendor"}
            </UIButton>
          </div>
        </form>
      </DialogBox>

      {/* Transaction Modal */}
      <DialogBox
        show={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        title="Add Financial Transaction"
        size="md"
      >
        <form onSubmit={handleTransactionSubmit} className="space-y-4">
          <div className="bg-muted p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-foreground mb-2">
              Vendor: {selectedVendorForTransaction?.vendorName}
            </h4>
            <p className="text-muted-foreground text-sm">
              Current Balance: ₹
              {selectedVendorForTransaction?.currentBalance?.toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Amount"
              type="number"
              step="0.01"
              value={transactionForm.amount}
              onChange={(e) =>
                setTransactionForm({
                  ...transactionForm,
                  amount: e.target.value,
                })
              }
              required
            />
            <FormSelect
              label="Transaction Type"
              value={transactionForm.type}
              onChange={(e) =>
                setTransactionForm({ ...transactionForm, type: e.target.value })
              }
              options={[
                {
                  value: "payment_given",
                  label: "Payment Given (We paid vendor)",
                },
                {
                  value: "payment_received",
                  label: "Payment Received (Vendor paid us)",
                },
                { value: "credit", label: "Credit (Vendor owes us)" },
                { value: "debit", label: "Debit (We owe vendor)" },
                { value: "adjustment", label: "Adjustment" },
              ]}
            />
          </div>

          {transactionForm.type === "adjustment" && (
            <FormSelect
              label="Adjustment Type"
              value={transactionForm.adjustmentType}
              onChange={(e) =>
                setTransactionForm({
                  ...transactionForm,
                  adjustmentType: e.target.value,
                })
              }
              options={[
                { value: "positive", label: "Positive (In our favor)" },
                { value: "negative", label: "Negative (In vendor favor)" },
              ]}
            />
          )}

          <FormInput
            label="Reference"
            value={transactionForm.reference}
            onChange={(e) =>
              setTransactionForm({
                ...transactionForm,
                reference: e.target.value,
              })
            }
            placeholder="Invoice number, receipt number, etc."
          />

          <FormInput
            label="Description"
            value={transactionForm.description}
            onChange={(e) =>
              setTransactionForm({
                ...transactionForm,
                description: e.target.value,
              })
            }
            placeholder="Brief description of the transaction"
          />

          <FormInput
            label="Remarks"
            value={transactionForm.remarks}
            onChange={(e) =>
              setTransactionForm({
                ...transactionForm,
                remarks: e.target.value,
              })
            }
            multiline
          />

          <div className="flex justify-end gap-3 pt-4">
            <UIButton
              type="button"
              variant="secondary"
              onClick={() => setShowTransactionModal(false)}
            >
              Cancel
            </UIButton>
            <UIButton type="submit" variant="default">
              Add Transaction
            </UIButton>
          </div>
        </form>
      </DialogBox>
    </div>
  );
};

export default VendorManagement;
