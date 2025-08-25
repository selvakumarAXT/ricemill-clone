import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import inventoryService from "../services/inventoryService";
import TableList from "../components/common/TableList";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";

import DialogBox from "../components/common/DialogBox";
import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import FileUpload from "../components/common/FileUpload";
import FileDisplay from "../components/common/FileDisplay";
import DateRangeFilter from "../components/common/DateRangeFilter";
import InventoryDashboard from "../components/common/InventoryDashboard";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [expandedInventory, setExpandedInventory] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [editingInventory, setEditingInventory] = useState(null);
  const [inventoryForm, setInventoryForm] = useState({
    name: "",
    category: "other",
    quantity: "",
    unit: "units",
    gunnyType: "",
    paddyVariety: "",
    moisture: "",
    riceVariety: "",
    quality: "",
    description: "",
    branch_id: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const { currentBranchId } = useSelector((state) => state.branch);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line
  }, [currentBranchId]);

  const fetchInventory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await inventoryService.getAllInventory(currentBranchId);
      setInventory(res.items || []);
    } catch (err) {
      setError(err.message || "Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  // Modal functions
  const openInventoryModal = (item = null) => {
    setEditingInventory(item);
    setError("");
    setSuccess("");
    if (item) {
      setInventoryForm({
        name: item.name || "",
        category: item.category || "other",
        quantity: item.quantity || "",
        unit: item.unit || "units",
        gunnyType: item.gunnyType || "",
        paddyVariety: item.paddyVariety || "",
        moisture: item.moisture || "",
        riceVariety: item.riceVariety || "",
        quality: item.quality || "",
        description: item.description || "",
        branch_id: item.branch_id || currentBranchId,
      });
      setUploadedFiles(item.files || []);
    } else {
      setInventoryForm({
        name: "",
        category: "other",
        quantity: "",
        unit: "units",
        gunnyType: "",
        paddyVariety: "",
        moisture: "",
        riceVariety: "",
        quality: "",
        description: "",
        branch_id: currentBranchId,
      });
      setUploadedFiles([]);
    }
    setSelectedFiles([]);
    setShowInventoryModal(true);
  };

  const closeInventoryModal = () => {
    setShowInventoryModal(false);
    setEditingInventory(null);
    setInventoryForm({
      name: "",
      category: "other",
      quantity: "",
      unit: "units",
      gunnyType: "",
      paddyVariety: "",
      moisture: "",
      riceVariety: "",
      quality: "",
      description: "",
      branch_id: "",
    });
    setSelectedFiles([]);
    setUploadedFiles([]);
    setError("");
    setSuccess("");
  };

  const handleInventoryFormChange = (e) => {
    const { name, value } = e.target;
    setInventoryForm((prev) => ({ ...prev, [name]: value }));

    // Reset category-specific fields when category changes
    if (name === "category") {
      setInventoryForm((prev) => ({
        ...prev,
        [name]: value,
        gunnyType: "",
        paddyVariety: "",
        moisture: "",
        riceVariety: "",
        quality: "",
        unit:
          value === "gunny"
            ? "bags"
            : value === "paddy" || value === "rice"
            ? "kg"
            : "units",
      }));
    }
  };

  const handleFilesChange = (files) => {
    setSelectedFiles(files);
  };

  const handleFileUploadSuccess = (uploadedFiles) => {
    setUploadedFiles(uploadedFiles);
    setSelectedFiles([]);
  };

  const saveInventory = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    try {
      // If there are selected files but no uploaded files, upload them first
      if (selectedFiles.length > 0 && uploadedFiles.length === 0) {
        setError(
          'Please upload files before saving inventory. Click the "Upload Files" button first.'
        );
        setSaving(false);
        return;
      }

      // Ensure branch_id is set for new inventory
      const formData = {
        ...inventoryForm,
        branch_id: editingInventory ? inventoryForm.branch_id : currentBranchId,
        files: uploadedFiles,
      };

      if (editingInventory) {
        await inventoryService.updateInventory(editingInventory._id, formData);
      } else {
        await inventoryService.createInventory(formData);
      }

      setSuccess(
        editingInventory
          ? "Inventory updated successfully!"
          : "Inventory created successfully!"
      );
      fetchInventory();
      closeInventoryModal();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save inventory");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInventory = async (itemId) => {
    if (
      window.confirm("Are you sure you want to delete this inventory item?")
    ) {
      setLoading(true);
      try {
        await inventoryService.deleteInventory(itemId);
        fetchInventory();
      } catch (err) {
        setError(err.message || "Failed to delete inventory");
      } finally {
        setLoading(false);
      }
    }
  };

  // Define columns for the table
  const columns = [
    { key: "name", label: "Name", render: (name) => name || "N/A" },
    {
      key: "category",
      label: "Category",
      render: (category) => (
        <span className="capitalize font-medium text-gray-700">
          {category || "N/A"}
        </span>
      ),
    },
    {
      key: "quantity",
      label: "Quantity",
      render: (quantity, item) => (
        <span className="font-semibold text-indigo-600">
          {item.unit === "kg" && quantity >= 1000
            ? `${(quantity / 1000).toFixed(
                2
              )} Tons (${quantity.toLocaleString()} KG)`
            : `${quantity || 0} ${item.unit || "units"}`}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (description) => description || "No description",
    },
    {
      key: "branch_id",
      label: "Branch",
      render: (branch) => branch?.name || "N/A",
    },
    {
      key: "files",
      label: "Files",
      render: (files) => (
        <FileDisplay
          files={files || []}
          title=""
          showTitle={false}
          className="text-xs"
        />
      ),
    },
  ];

  const filteredInventory = inventory.filter((item) => {
    // Safety check - ensure item is valid
    if (!item || typeof item !== "object") {
      return false;
    }

    // Text search filter
    const q = inventoryFilter.toLowerCase();
    const matchesText =
      !inventoryFilter ||
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q));

    // Date range filter
    let matchesDate = true;
    if (dateRange.startDate || dateRange.endDate) {
      if (item.createdAt) {
        const itemDate = new Date(item.createdAt);
        if (dateRange.startDate) {
          matchesDate =
            matchesDate &&
            itemDate >= new Date(dateRange.startDate + "T00:00:00.000Z");
        }
        if (dateRange.endDate) {
          matchesDate =
            matchesDate &&
            itemDate <= new Date(dateRange.endDate + "T23:59:59.999Z");
        }
      } else {
        matchesDate = false;
      }
    }

    return matchesText && matchesDate;
  });

  if (loading)
    return (
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
              Inventory Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Track and manage rice mill inventory
            </p>
          </div>
          <div className="flex justify-center sm:justify-end">
            {/* Only show Add button when a specific branch is selected (not "All Branches") */}
            {((user?.isSuperAdmin &&
              currentBranchId &&
              currentBranchId !== "all") ||
              (!user?.isSuperAdmin && user?.branch?.id)) && (
              <Button
                onClick={() => openInventoryModal()}
                variant="primary"
                icon="add"
              >
                Add New Inventory
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-green-700 font-medium">{success}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Inventory Dashboard */}
        <div className="mb-8">
          <InventoryDashboard inventoryData={inventory} loading={loading} />
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              Inventory Records
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Total: {filteredInventory.length} records
            </p>
            {/* Filters moved inside table header */}
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search inventory items..."
                    value={inventoryFilter}
                    onChange={(e) => setInventoryFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4">
                <DateRangeFilter
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  onStartDateChange={(e) =>
                    setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                  onEndDateChange={(e) =>
                    setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  startDateLabel="Created Date From"
                  endDateLabel="Created Date To"
                />
              </div>
            </div>
          </div>
          <TableList
            data={filteredInventory}
            columns={columns}
            actions={(item) => [
              <Button
                key="edit"
                onClick={() => openInventoryModal(item)}
                variant="info"
                icon="edit"
              >
                Edit
              </Button>,
              <Button
                key="delete"
                onClick={() => handleDeleteInventory(item._id)}
                variant="danger"
                icon="delete"
              >
                Delete
              </Button>,
            ]}
            renderDetail={(item) => (
              <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-l-4 border-purple-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">
                        Name:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">
                        Category:
                      </span>
                      <span className="text-gray-900 font-medium capitalize">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">
                        Quantity:
                      </span>
                      <span className="text-gray-900 font-medium text-indigo-600">
                        {item.unit === "kg" && item.quantity >= 1000
                          ? `${(item.quantity / 1000).toFixed(
                              2
                            )} Tons (${item.quantity.toLocaleString()} KG)`
                          : `${item.quantity || 0} ${item.unit || "units"}`}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">
                        Branch:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {item.branch_id?.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">
                        Created:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">
                        Description
                      </h4>
                      <p className="text-gray-700">{item.description}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">
                        Files
                      </h4>
                      <FileDisplay
                        files={item.files || []}
                        title=""
                        showTitle={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          />
        </div>

        {/* Mobile Table View */}
        <div className="lg:hidden bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              Inventory Records
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Total: {filteredInventory.length} records
            </p>
          </div>

          <div className="p-4">
            {filteredInventory.length === 0 ? (
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
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No inventory records
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new inventory record.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInventory.map((item) => (
                  <div
                    key={item._id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Mobile Table Row */}
                    <div
                      className="bg-white p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() =>
                        setExpandedInventory(
                          expandedInventory === item._id ? null : item._id
                        )
                      }
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-600 capitalize">
                            {item.category}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.unit === "kg" && item.quantity >= 1000
                              ? `${(item.quantity / 1000).toFixed(
                                  2
                                )} Tons (${item.quantity.toLocaleString()} KG)`
                              : `${item.quantity || 0} ${
                                  item.unit || "units"
                                }`}{" "}
                            • {item.branch_id?.name || "N/A"}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openInventoryModal(item);
                            }}
                            variant="info"
                            icon="edit"
                            className="px-2 py-1 text-xs"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteInventory(item._id);
                            }}
                            variant="danger"
                            icon="delete"
                            className="px-2 py-1 text-xs"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detail View */}
                    {expandedInventory === item._id && (
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 border-t border-gray-200">
                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Name:</span>
                            <span className="ml-1 font-medium text-gray-900">
                              {item.name}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Category:</span>
                            <span className="ml-1 font-medium text-gray-900 capitalize">
                              {item.category}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Quantity:</span>
                            <span className="ml-1 font-medium text-indigo-600">
                              {item.unit === "kg" && item.quantity >= 1000
                                ? `${(item.quantity / 1000).toFixed(
                                    2
                                  )} Tons (${item.quantity.toLocaleString()} KG)`
                                : `${item.quantity || 0} ${
                                    item.unit || "units"
                                  }`}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Branch:</span>
                            <span className="ml-1 font-medium text-gray-900">
                              {item.branch_id?.name || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Created:</span>
                            <span className="ml-1 font-medium text-gray-900">
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="p-3 bg-white rounded-lg border border-gray-200 w-full">
                          <h5 className="text-sm font-semibold text-gray-800 mb-2">
                            Description
                          </h5>
                          <p className="text-gray-700 text-sm">
                            {item.description}
                          </p>
                        </div>

                        {/* Files */}
                        <div className="p-3 bg-white rounded-lg border border-gray-200 w-full mt-3">
                          <FileDisplay
                            files={item.files || []}
                            title="Attached Files"
                            showTitle={true}
                          />
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

      {/* Inventory Modal */}
      {showInventoryModal && (
        <DialogBox
          title={editingInventory ? "Edit Inventory" : "New Inventory"}
          onClose={closeInventoryModal}
          onSubmit={saveInventory}
          show={showInventoryModal}
          loading={saving}
          size="2xl"
        >
          <form onSubmit={saveInventory} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Name"
                name="name"
                value={inventoryForm.name}
                onChange={handleInventoryFormChange}
                required
                icon="inventory"
              />
              <FormSelect
                label="Category"
                name="category"
                value={inventoryForm.category}
                onChange={handleInventoryFormChange}
                required
                options={[
                  { value: "gunny", label: "Gunny" },
                  { value: "paddy", label: "Paddy" },
                  { value: "rice", label: "Rice" },
                  { value: "other", label: "Other" },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Quantity"
                name="quantity"
                type="number"
                value={inventoryForm.quantity}
                onChange={handleInventoryFormChange}
                required
                icon="weight"
              />
              <FormSelect
                label="Unit"
                name="unit"
                value={inventoryForm.unit}
                onChange={handleInventoryFormChange}
                required
                options={[
                  { value: "bags", label: "Bags" },
                  { value: "kg", label: "Kilograms" },
                  { value: "tons", label: "Tons" },
                  { value: "pieces", label: "Pieces" },
                  { value: "units", label: "Units" },
                ]}
              />
            </div>

            {/* Category-specific fields */}
            {inventoryForm.category === "gunny" && (
              <FormSelect
                label="Gunny Type"
                name="gunnyType"
                value={inventoryForm.gunnyType}
                onChange={handleInventoryFormChange}
                required
                options={[
                  { value: "NB", label: "NB (New Bags)" },
                  { value: "ONB", label: "ONB (Old New Bags)" },
                  { value: "SS", label: "SS (Second Sale)" },
                  { value: "SWP", label: "SWP (Second Sale with Price)" },
                ]}
              />
            )}

            {inventoryForm.category === "paddy" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Paddy Variety"
                  name="paddyVariety"
                  value={inventoryForm.paddyVariety}
                  onChange={handleInventoryFormChange}
                  required
                  icon="wheat"
                />
                <FormInput
                  label="Moisture (%)"
                  name="moisture"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={inventoryForm.moisture}
                  onChange={handleInventoryFormChange}
                  required
                  icon="droplet"
                />
              </div>
            )}

            {inventoryForm.category === "rice" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Rice Variety"
                  name="riceVariety"
                  value={inventoryForm.riceVariety}
                  onChange={handleInventoryFormChange}
                  required
                  icon="rice"
                />
                <FormSelect
                  label="Quality"
                  name="quality"
                  value={inventoryForm.quality}
                  onChange={handleInventoryFormChange}
                  required
                  options={[
                    { value: "Grade A", label: "Grade A" },
                    { value: "Grade B", label: "Grade B" },
                    { value: "Grade C", label: "Grade C" },
                    { value: "Standard", label: "Standard" },
                  ]}
                />
              </div>
            )}

            <FormInput
              label="Description"
              name="description"
              value={inventoryForm.description}
              onChange={handleInventoryFormChange}
              required
              icon="info"
            />

            {/* File Upload Section */}
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  📁 File Upload Instructions
                </h4>
                <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Select files using the upload area below</li>
                  <li>
                    Click the "Upload Files" button to upload them to the server
                  </li>
                  <li>Wait for upload confirmation before saving inventory</li>
                  <li>Files will be attached to your inventory record</li>
                </ol>
              </div>

              <FileUpload
                label="Upload Inventory Documents & Images"
                module="inventory"
                onFilesChange={handleFilesChange}
                onUploadSuccess={handleFileUploadSuccess}
                files={selectedFiles}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                maxFiles={10}
                maxSize={10}
                showPreview={true}
                disableAutoUpload={false}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={closeInventoryModal}
                className="px-6 py-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="px-6 py-2"
                disabled={saving}
              >
                {saving ? (
                  <span className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </span>
                ) : editingInventory ? (
                  "Update Inventory"
                ) : (
                  "Add Inventory"
                )}
              </Button>
            </div>
          </form>
        </DialogBox>
      )}
    </div>
  );
};

export default Inventory;
