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
import documentService from "../services/documentService";

const DocumentUploads = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({});
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [expandedDocument, setExpandedDocument] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState("all"); // 'all', 'module'
  const [selectedModule, setSelectedModule] = useState("");
  const { currentBranchId } = useSelector((state) => state.branch);
  const { user } = useSelector((state) => state.auth);

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    module: "",
    category: "",
    fileType: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  // Pagination states
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const initialDocumentForm = {
    title: "",
    description: "",
    module: "general",
    category: "other",
    version: "1.0",
    status: "active",
    remarks: "",
    tags: "",
  };

  const [documentForm, setDocumentForm] = useState(initialDocumentForm);

  useEffect(() => {
    fetchDocumentData();
    fetchDocumentStats();
  }, [
    currentBranchId,
    filters,
    pagination.page,
    pagination.limit,
    viewMode,
    selectedModule,
  ]);

  const fetchDocumentData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      if (currentBranchId) {
        params.branch_id = currentBranchId;
      }

      let response;
      if (viewMode === "module" && selectedModule) {
        response = await documentService.getDocumentsByModule(
          selectedModule,
          params
        );
      } else {
        response = await documentService.getDocuments(params);
      }

      if (response.success) {
        setDocuments(response.data);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
        }));
      } else {
        setError(response.message || "Failed to fetch documents");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch document data");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentStats = async () => {
    try {
      const params = {};
      if (currentBranchId) {
        params.branch_id = currentBranchId;
      }
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (viewMode === "module" && selectedModule)
        params.module = selectedModule;
      else if (filters.module) params.module = filters.module;

      const response = await documentService.getDocumentStats(params);
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const openDocumentModal = (document = null) => {
    setEditingDocument(document);
    setSelectedFile(null);
    if (document) {
      const formData = {
        ...initialDocumentForm,
        ...document,
        tags: document.tags ? document.tags.join(", ") : "",
      };
      setDocumentForm(formData);
    } else {
      setDocumentForm(initialDocumentForm);
    }
    setShowDocumentModal(true);
  };

  const closeDocumentModal = () => {
    setShowDocumentModal(false);
    setEditingDocument(null);
    setSelectedFile(null);
    setDocumentForm(initialDocumentForm);
  };

  const handleDocumentFormChange = (e) => {
    const { name, value } = e.target;
    setDocumentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (files) => {
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const saveDocument = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      console.log("Starting document save...");
      console.log("Editing document:", editingDocument);
      console.log("Selected file:", selectedFile);
      console.log("Document form:", documentForm);
      console.log("Current branch ID:", currentBranchId);

      if (editingDocument) {
        // Update existing document
        const response = await documentService.updateDocument(
          editingDocument._id,
          documentForm
        );
        if (response.success) {
          setDocuments((prev) =>
            prev.map((doc) =>
              doc._id === editingDocument._id ? response.data : doc
            )
          );
          closeDocumentModal();
        } else {
          setError(response.message || "Failed to update document");
        }
      } else {
        // Create new document
        if (!selectedFile) {
          setError("Please select a file to upload");
          return;
        }

        // Prepare document data with branch ID and proper module mapping
        const documentData = {
          ...documentForm,
          branchId: currentBranchId || "default",
          // Map module names to match the new upload structure
          // 'general' in form maps to 'documents' for upload, then back to 'general' for database
          module:
            documentForm.module === "general"
              ? "documents"
              : documentForm.module,
        };

        console.log("Document data prepared:", documentData);

        const response = await documentService.uploadDocument(
          selectedFile,
          documentData
        );
        console.log("Upload response:", response);

        if (response.success) {
          setDocuments((prev) => [response.data, ...prev]);
          closeDocumentModal();
          fetchDocumentStats(); // Refresh stats
        } else {
          setError(response.message || "Failed to create document");
        }
      }
    } catch (error) {
      console.error("Error in saveDocument:", error);
      setError("Error saving document: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (documentId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        setLoading(true);
        const response = await documentService.deleteDocument(documentId);
        if (response.success) {
          setDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
          fetchDocumentStats(); // Refresh stats
        } else {
          setError(response.message || "Failed to delete document");
        }
      } catch (error) {
        setError("Error deleting document: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const downloadDocument = async (document) => {
    try {
      setLoading(true);

      // First increment download count
      const downloadResponse = await documentService.downloadDocument(
        document._id
      );
      if (downloadResponse.success) {
        // Update the document in the list with new download count
        setDocuments((prev) =>
          prev.map((doc) =>
            doc._id === document._id
              ? { ...doc, downloadCount: downloadResponse.data.downloadCount }
              : doc
          )
        );

        // Then download the actual file
        await documentService.downloadFile(
          document.fileUrl,
          document.originalName
        );
      } else {
        setError(downloadResponse.message || "Failed to download document");
      }
    } catch (error) {
      setError("Error downloading document: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setSelectedModule("");
    setFilters((prev) => ({ ...prev, module: "" }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setFilters((prev) => ({ ...prev, module }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Define columns for the table
  const columns = [
    {
      key: "title",
      label: "Document Title",
      renderCell: (value, document) => (
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-900 truncate">{value}</div>
          <div className="text-sm text-gray-500 truncate">
            {document.originalName}
          </div>
        </div>
      ),
    },
    {
      key: "module",
      label: "Module",
      renderCell: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {documentService.getModuleOptions().find((opt) => opt.value === value)
            ?.label || value}
        </span>
      ),
    },
    {
      key: "category",
      label: "Category",
      renderCell: (value) => (
        <span className="flex items-center">
          <span className="mr-1">{documentService.getCategoryIcon(value)}</span>
          <span className="capitalize">{value.replace("_", " ")}</span>
        </span>
      ),
    },
    {
      key: "fileType",
      label: "File Type",
      renderCell: (value) => (
        <span className="flex items-center">
          <span className="mr-1">{documentService.getFileTypeIcon(value)}</span>
          <span className="uppercase">{value}</span>
        </span>
      ),
    },
    {
      key: "fileSizeFormatted",
      label: "File Size",
      renderCell: (value) => <span className="text-gray-700">{value}</span>,
    },
    {
      key: "uploadedBy_name",
      label: "Uploaded By",
      renderCell: (value) => <span className="text-gray-700">{value}</span>,
    },
    {
      key: "createdAt",
      label: "Created Time",
      renderCell: (value) => (
        <div className="text-sm">
          <div className="text-gray-900">
            {new Date(value).toLocaleDateString()}
          </div>
          <div className="text-gray-500">
            {new Date(value).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      key: "downloadCount",
      label: "Downloads",
      renderCell: (value) => (
        <span className="text-purple-600 font-medium">{value}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      renderCell: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${documentService.getStatusColor(
            value
          )}`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
  ];

  if (loading && documents.length === 0) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-6 sm:px-6">
        <div className="flex flex-col space-y-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              All Modules - Document Uploads & History
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              View and manage uploaded files from all modules
            </p>
          </div>
          <div className="flex justify-center sm:justify-start space-x-2">
            <Button
              onClick={() => openDocumentModal()}
              variant="success"
              className="px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              📁 Upload Document
            </Button>
            <Button
              onClick={() => handleViewModeChange("all")}
              variant={viewMode === "all" ? "primary" : "secondary"}
              className="px-4 py-2 rounded-lg font-medium"
            >
              📋 All Documents
            </Button>
            <Button
              onClick={() => handleViewModeChange("module")}
              variant={viewMode === "module" ? "primary" : "secondary"}
              className="px-4 py-2 rounded-lg font-medium"
            >
              📁 By Module
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6">
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

        {/* Module Selection (when in module view) */}
        {viewMode === "module" && (
          <div className="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Select Module
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {documentService.getModuleOptions().map((module) => (
                <button
                  key={module.value}
                  onClick={() => handleModuleSelect(module.value)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                    selectedModule === module.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">
  
                      {module.value === "paddy" && "🌾"}
                      {module.value === "rice" && "🍚"}
                      {module.value === "gunny" && "🛍️"}
                      {module.value === "inventory" && "📦"}
                      {module.value === "financial" && "💰"}
                      {module.value === "quality" && "🔬"}
                      {module.value === "sales" && "📈"}
                      {module.value === "vendor" && "👥"}
                      {module.value === "eb_meter" && "⚡"}

                      {module.value === "users" && "👤"}
                      {module.value === "branches" && "🏢"}
                      {module.value === "general" && "📁"}
                    </div>
                    <div className="truncate">{module.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 text-lg">📁</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {viewMode === "module" && selectedModule
                    ? `${
                        documentService
                          .getModuleOptions()
                          .find((opt) => opt.value === selectedModule)?.label
                      } Documents`
                    : "Total Documents"}
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {stats.totalDocuments || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-green-600 text-lg">💾</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Size</p>
                <p className="text-xl font-bold text-green-600">
                  {stats.totalSize || "0 B"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-purple-600 text-lg">⬇️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Downloads</p>
                <p className="text-xl font-bold text-purple-600">
                  {stats.totalDownloads || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-yellow-600 text-lg">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Documents</p>
                <p className="text-xl font-bold text-yellow-600">
                  {stats.activeDocuments || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Module Statistics (when viewing all) */}
        {viewMode === "all" &&
          stats.moduleStats &&
          stats.moduleStats.length > 0 && (
            <div className="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Documents by Module
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {stats.moduleStats.map((moduleStat) => (
                  <div
                    key={moduleStat._id}
                    className="text-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="text-lg mb-1">
  
                      {moduleStat._id === "paddy" && "🌾"}
                      {moduleStat._id === "rice" && "🍚"}
                      {moduleStat._id === "gunny" && "🛍️"}
                      {moduleStat._id === "inventory" && "📦"}
                      {moduleStat._id === "financial" && "💰"}
                      {moduleStat._id === "quality" && "🔬"}
                      {moduleStat._id === "sales" && "📈"}
                      {moduleStat._id === "vendor" && "👥"}
                      {moduleStat._id === "eb_meter" && "⚡"}

                      {moduleStat._id === "users" && "👤"}
                      {moduleStat._id === "branches" && "🏢"}
                      {moduleStat._id === "general" && "📁"}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {documentService
                        .getModuleOptions()
                        .find((opt) => opt.value === moduleStat._id)?.label ||
                        moduleStat._id}
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {moduleStat.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              {viewMode === "module" && selectedModule
                ? `${
                    documentService
                      .getModuleOptions()
                      .find((opt) => opt.value === selectedModule)?.label
                  } Documents`
                : "All Modules - Document Records"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Total: {pagination.total} records • Page {pagination.page} of{" "}
              {pagination.totalPages}
            </p>
            {/* Filters moved inside table header */}
            <div className="mt-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-center">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <TableFilters
                    searchValue={filters.search}
                    searchPlaceholder="Search documents..."
                    onSearchChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    showSelect={false}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <FormSelect
                    name="category"
                    value={filters.category}
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                    options={[
                      { value: "", label: "All Categories" },
                      ...documentService.getCategoryOptions(),
                    ]}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                  <BranchFilter
                    value={currentBranchId || ""}
                    onChange={(value) => {
                      console.log("Branch changed in Documents:", value);
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                   <div className="grid grid-cols-2 gap-2">
                    <FormInput
                      name="startDate"
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    />
                    <FormInput
                      name="endDate"
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange("endDate", e.target.value)}
                    />
                  </div>
                </div>
              </div>
       
         
            </div>
          </div>
          <TableList
            data={documents}
            columns={columns}
            actions={(document) => [
              <Button
                key="download"
                onClick={() => downloadDocument(document)}
                variant="success"
                icon="download"
                className="text-xs px-2 py-1"
              >
                Download
              </Button>,
              <Button
                key="edit"
                onClick={() => openDocumentModal(document)}
                variant="info"
                icon="edit"
                className="text-xs px-2 py-1"
              >
                Edit
              </Button>,
              <Button
                key="delete"
                onClick={() => deleteDocument(document._id)}
                variant="danger"
                icon="delete"
                className="text-xs px-2 py-1"
              >
                Delete
              </Button>,
            ]}
            renderDetail={(document) => (
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">
                        Title:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {document.title}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">
                        Module:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {documentService
                          .getModuleOptions()
                          .find((opt) => opt.value === document.module)
                          ?.label || document.module}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">
                        Category:
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">
                          {documentService.getCategoryIcon(document.category)}
                        </span>
                        <span className="text-gray-900 font-medium capitalize">
                          {document.category.replace("_", " ")}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">
                        File Name:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {document.originalName}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">
                        Uploaded By:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {document.uploadedBy_name}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">
                        File Type:
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">
                          {documentService.getFileTypeIcon(document.fileType)}
                        </span>
                        <span className="text-gray-900 font-medium uppercase">
                          {document.fileType}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">
                        File Size:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {document.fileSizeFormatted}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">
                        Version:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {document.version}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">
                        Downloads:
                      </span>
                      <span className="text-purple-600 font-medium">
                        {document.downloadCount}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">
                        Created:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {new Date(document.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Document Details */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    Document Details
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {document.fileSizeFormatted}
                      </div>
                      <div className="text-xs text-gray-600">File Size</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {document.downloadCount}
                      </div>
                      <div className="text-xs text-gray-600">Downloads</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {document.version}
                      </div>
                      <div className="text-xs text-gray-600">Version</div>
                    </div>
                    <div className="text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${documentService.getStatusColor(
                          document.status
                        )}`}
                      >
                        {document.status.charAt(0).toUpperCase() +
                          document.status.slice(1)}
                      </span>
                      <div className="text-xs text-gray-600 mt-1">Status</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Upload Date:</span>
                      <span className="font-medium">
                        {new Date(document.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Upload Time:</span>
                      <span className="font-medium">
                        {new Date(document.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    {document.lastDownloadedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Downloaded:</span>
                        <span className="font-medium">
                          {new Date(document.lastDownloadedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {document.description && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-1">
                        Description
                      </h4>
                      <p className="text-gray-700 text-sm">
                        {document.description}
                      </p>
                    </div>
                  )}

                  {document.remarks && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-1">
                        Remarks
                      </h4>
                      <p className="text-gray-700 text-sm">
                        {document.remarks}
                      </p>
                    </div>
                  )}

                  {document.tags && document.tags.length > 0 && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-1">
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {document.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          />
        </div>

        {/* Mobile Table View */}
        <div className="lg:hidden bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              {viewMode === "module" && selectedModule
                ? `${
                    documentService
                      .getModuleOptions()
                      .find((opt) => opt.value === selectedModule)?.label
                  } Documents`
                : "All Modules - Document Records"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Total: {pagination.total} records • Page {pagination.page} of{" "}
              {pagination.totalPages}
            </p>
          </div>

          <div className="p-4">
            {documents.length === 0 ? (
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No documents
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by uploading a new document.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((document) => (
                  <div
                    key={document._id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div
                      className="bg-white p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() =>
                        setExpandedDocument(
                          expandedDocument === document._id
                            ? null
                            : document._id
                        )
                      }
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {document.title}
                          </div>
                          <div className="text-sm text-gray-600">
                            {document.originalName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {document.fileSizeFormatted} •{" "}
                            {document.uploadedBy_name} •{" "}
                            {new Date(document.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                              {documentService
                                .getModuleOptions()
                                .find((opt) => opt.value === document.module)
                                ?.label || document.module}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${documentService.getStatusColor(
                                document.status
                              )}`}
                            >
                              {document.status.charAt(0).toUpperCase() +
                                document.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadDocument(document);
                            }}
                            variant="success"
                            icon="download"
                            className="text-xs px-2 py-1"
                          >
                            Download
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDocumentModal(document);
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
                              deleteDocument(document._id);
                            }}
                            variant="danger"
                            icon="delete"
                            className="text-xs px-2 py-1"
                          >
                            Delete
                          </Button>
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              expandedDocument === document._id
                                ? "rotate-180"
                                : ""
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

                    {expandedDocument === document._id && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Category:</span>
                            <span className="ml-1 font-medium text-gray-900 capitalize">
                              {document.category.replace("_", " ")}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">File Type:</span>
                            <span className="ml-1 font-medium text-gray-900 uppercase">
                              {document.fileType}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Version:</span>
                            <span className="ml-1 font-medium text-gray-900">
                              {document.version}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Downloads:</span>
                            <span className="ml-1 font-medium text-purple-600">
                              {document.downloadCount}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Created:</span>
                            <span className="ml-1 font-medium text-gray-900">
                              {new Date(document.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {document.description && (
                          <div className="p-3 bg-white rounded-lg border border-gray-200 mb-3">
                            <h5 className="text-sm font-semibold text-gray-800 mb-1">
                              Description
                            </h5>
                            <p className="text-gray-700 text-sm">
                              {document.description}
                            </p>
                          </div>
                        )}
                        {document.remarks && (
                          <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <h5 className="text-sm font-semibold text-gray-800 mb-1">
                              Remarks
                            </h5>
                            <p className="text-gray-700 text-sm">
                              {document.remarks}
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex items-center space-x-2">
              <Button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                variant="secondary"
                className="px-3 py-2"
              >
                Previous
              </Button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                variant="secondary"
                className="px-3 py-2"
              >
                Next
              </Button>
            </nav>
          </div>
        )}
      </div>

      {/* Document Modal */}
      <DialogBox
        show={showDocumentModal}
        onClose={closeDocumentModal}
        title={editingDocument ? "Edit Document" : "Upload New Document"}
        size="2xl"
        onSubmit={saveDocument}
        submitText={editingDocument ? "Update Document" : "Upload Document"}
        cancelText="Cancel"
      >
        <div className="space-y-4">
          {!editingDocument && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <FileUpload
                module="documents"
                onFilesChange={handleFileSelect}
                multiple={false}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv"
                disableAutoUpload={true}
                showPreview={true}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Document Title"
              name="title"
              value={documentForm.title}
              onChange={handleDocumentFormChange}
              required
              icon="file-text"
            />
            <FormSelect
              label="Module"
              name="module"
              value={documentForm.module}
              onChange={handleDocumentFormChange}
              options={documentService.getModuleOptions()}
              icon="folder"
            />
            <FormSelect
              label="Category"
              name="category"
              value={documentForm.category}
              onChange={handleDocumentFormChange}
              options={documentService.getCategoryOptions()}
              icon="tag"
            />
            <FormInput
              label="Version"
              name="version"
              value={documentForm.version}
              onChange={handleDocumentFormChange}
              required
              icon="hash"
            />
            <FormSelect
              label="Status"
              name="status"
              value={documentForm.status}
              onChange={handleDocumentFormChange}
              options={documentService.getStatusOptions()}
              icon="check-circle"
            />
            <FormInput
              label="Tags (comma separated)"
              name="tags"
              value={documentForm.tags}
              onChange={handleDocumentFormChange}
              icon="tag"
            />
          </div>
          <FormInput
            label="Description"
            name="description"
            value={documentForm.description}
            onChange={handleDocumentFormChange}
            icon="note"
          />
          <FormInput
            label="Remarks"
            name="remarks"
            value={documentForm.remarks}
            onChange={handleDocumentFormChange}
            icon="note"
          />
        </div>
      </DialogBox>
    </div>
  );
};

export default DocumentUploads;
