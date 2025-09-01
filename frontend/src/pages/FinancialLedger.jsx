import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import TableFilters from "../components/common/TableFilters";
import BranchFilter from "../components/common/BranchFilter";
import TableList from "../components/common/TableList";
import LoadingSpinner from "../components/common/LoadingSpinner";

import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import DialogBox from "../components/common/DialogBox";
import FileUpload from "../components/common/FileUpload";
import DateRangeFilter from "../components/common/DateRangeFilter";
import financialService from "../services/financialService";
import { Button as UIButton } from "../components/ui/button";
import Icon from "../components/common/Icon";

const FinancialLedger = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [transactionFilter, setTransactionFilter] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const { currentBranchId } = useSelector((state) => state.branch);

  const initialTransactionForm = {
    transactionDate: "",
    transactionType: "income",
    category: "",
    description: "",
    amount: 0,
    paymentMethod: "cash",
    reference: "",
    vendor: "",
    customer: "",
    status: "completed",
    remarks: "",
  };

  const [transactionForm, setTransactionForm] = useState(
    initialTransactionForm
  );
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    fetchTransactionData();
  }, [currentBranchId]);

  // Debug effect to monitor form state changes
  useEffect(() => {
    console.log("🔄 Form state changed:", transactionForm);
  }, [transactionForm]);

  // Debug effect to monitor editingTransaction state
  useEffect(() => {
    console.log("✏️ Editing transaction changed:", editingTransaction);
  }, [editingTransaction]);

  const fetchTransactionData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await financialService.getAllTransactions(
        currentBranchId
      );
      setTransactions(response.data || response.items || []);
    } catch (err) {
      setError(err.message || "Failed to fetch transaction data");
    } finally {
      setLoading(false);
    }
  };

  const openTransactionModal = (transaction = null) => {
    console.log(
      "🔧 openTransactionModal called with:",
      transaction ? "EDIT" : "ADD"
    );
    if (transaction) {
      console.log(
        "📋 Original transaction data:",
        JSON.stringify(transaction, null, 2)
      );
    }
    setEditingTransaction(transaction);
    if (transaction) {
      // Format the date for the HTML date input (YYYY-MM-DD)
      const formattedDate = new Date(transaction.transactionDate)
        .toISOString()
        .split("T")[0];
      const formData = {
        ...initialTransactionForm,
        ...transaction,
        transactionDate: formattedDate,
      };
      console.log(
        "📝 Setting form data for EDIT:",
        JSON.stringify(formData, null, 2)
      );
      setTransactionForm(formData);
    } else {
      console.log("📝 Setting initial form data for ADD");
      setTransactionForm(initialTransactionForm);
    }
    setShowTransactionModal(true);
  };

  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    setEditingTransaction(null);
    setTransactionForm(initialTransactionForm);
  };

  const handleTransactionFormChange = (e) => {
    const { name, value } = e.target;
    setTransactionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilesChange = (files) => {
    setSelectedFiles(files);
  };

  const handleUploadSuccess = (uploadedFiles) => {
    setUploadedFiles((prev) => [...prev, ...uploadedFiles]);
  };

  const openPreview = (file) => {
    setPreviewFile(file);
    setShowPreviewModal(true);
  };

  const closePreview = () => {
    setPreviewFile(null);
    setShowPreviewModal(false);
  };

  const getFileIcon = (file) => {
    if (file.mimetype?.startsWith("image/")) {
      return "🖼️";
    } else if (file.mimetype?.includes("pdf")) {
      return "📄";
    } else if (
      file.mimetype?.includes("word") ||
      file.mimetype?.includes("document")
    ) {
      return "📝";
    } else if (
      file.mimetype?.includes("excel") ||
      file.mimetype?.includes("spreadsheet")
    ) {
      return "📊";
    } else if (file.mimetype?.includes("text")) {
      return "📄";
    } else {
      return "📎";
    }
  };

  const saveTransaction = async (e) => {
    e.preventDefault();
    console.log("💾 saveTransaction called");
    console.log("📊 editingTransaction:", editingTransaction);
    console.log("📋 transactionForm:", transactionForm);
    try {
      setLoading(true);
      if (editingTransaction) {
        console.log(
          "🔄 UPDATING existing transaction with ID:",
          editingTransaction._id
        );
        // Update existing transaction
        await financialService.updateTransaction(
          editingTransaction._id,
          transactionForm
        );
        console.log("✅ Update successful");
      } else {
        console.log("🆕 CREATING new transaction");
        // Create new transaction
        await financialService.createTransaction(transactionForm);
        console.log("✅ Create successful");
      }
      fetchTransactionData(); // Refresh the data
      closeTransactionModal();
    } catch (error) {
      console.error("❌ Error saving transaction:", error);
      setError("Error saving transaction: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (transactionId) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        setLoading(true);
        await financialService.deleteTransaction(transactionId);
        fetchTransactionData(); // Refresh the data
      } catch (error) {
        setError("Error deleting transaction: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case "income":
        return "text-secondary-foreground bg-secondary";
      case "expense":
        return "text-destructive bg-destructive/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-secondary-foreground bg-secondary";
      case "pending":
        return "text-muted-foreground bg-muted";
      case "cancelled":
        return "text-destructive bg-destructive/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "rice_sales":
        return "🍚";
      case "paddy_purchase":
        return "🌾";
      case "labor":
        return "👷";
      case "electricity":
        return "⚡";
      case "maintenance":
        return "🔧";
      case "transport":
        return "🚚";
      default:
        return "💰";
    }
  };

  // Calculate financial summary
  const totalIncome = transactions
    .filter((t) => t.transactionType === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.transactionType === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  // Define columns for the table
  const columns = [
    {
      key: "transactionDate",
      label: "Date",
      renderCell: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "transactionType",
      label: "Type",
      renderCell: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(
            value
          )}`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: "category",
      label: "Category",
      renderCell: (value) => (
        <span className="flex items-center">
          <span className="mr-1">{getCategoryIcon(value)}</span>
          <span className="capitalize">{value.replace("_", " ")}</span>
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      renderCell: (value) => <span className="text-gray-700">{value}</span>,
    },
    {
      key: "amount",
      label: "Amount",
      renderCell: (value, record) => (
        <span
          className={`font-semibold ${
            record.transactionType === "income"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          ₹{value.toLocaleString()}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
      renderCell: (value) => (
        <span className="text-gray-700 capitalize">
          {value.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      renderCell: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            value
          )}`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const q = transactionFilter.toLowerCase();
    const matchesText =
      transaction.description?.toLowerCase().includes(q) ||
      transaction.category?.toLowerCase().includes(q) ||
      transaction.transactionType?.toLowerCase().includes(q) ||
      transaction.reference?.toLowerCase().includes(q) ||
      transaction.vendor?.toLowerCase().includes(q) ||
      transaction.customer?.toLowerCase().includes(q);

    // Date range filter
    let matchesDate = true;
    if (dateRange.startDate || dateRange.endDate) {
      const transactionDate = new Date(transaction.transactionDate);
      if (dateRange.startDate) {
        matchesDate =
          matchesDate && transactionDate >= new Date(dateRange.startDate);
      }
      if (dateRange.endDate) {
        matchesDate =
          matchesDate &&
          transactionDate <= new Date(dateRange.endDate + "T23:59:59.999Z");
      }
    }

    return matchesText && matchesDate;
  });

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="bg-card shadow-sm border-b border-border px-4 py-6 sm:px-6">
        <div className="flex flex-col space-y-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Financial Ledger
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Manage financial transactions and reports
            </p>
          </div>
          <div className="flex justify-center sm:justify-start space-x-2">
            {currentBranchId && currentBranchId !== "all" && (
              <UIButton onClick={() => openTransactionModal()} size="lg">
                <Icon name="add" className="mr-2 h-4 w-4" /> Add Transaction
              </UIButton>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-destructive mr-2"
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
              <span className="text-destructive font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mr-3">
                <span className="text-muted-foreground text-lg">📈</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-xl font-bold text-foreground">
                  ₹{totalIncome.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mr-3">
                <span className="text-muted-foreground text-lg">📉</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-xl font-bold text-foreground">
                  ₹{totalExpenses.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mr-3">
                <span className="text-muted-foreground text-lg">💰</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className={`text-xl font-bold text-foreground`}>
                  ₹{netProfit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mr-3">
                <span className="text-muted-foreground text-lg">📊</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Transactions
                </p>
                <p className="text-xl font-bold text-foreground">
                  {transactions.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted">
            <h3 className="text-lg font-semibold text-foreground">
              Financial Transactions
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Total: {filteredTransactions.length} records
            </p>
            {/* Filters moved inside table header */}
            <div className="mt-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-center">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Search
                  </label>
                  <TableFilters
                    searchValue={transactionFilter}
                    searchPlaceholder="Search by description, category, reference..."
                    onSearchChange={(e) => setTransactionFilter(e.target.value)}
                    showSelect={false}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Branch
                  </label>
                  <BranchFilter
                    value={currentBranchId || ""}
                    onChange={(value) => {
                      console.log("Branch changed in Financial:", value);
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <DateRangeFilter
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                    onStartDateChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    onEndDateChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    startDateLabel="Transaction Date From"
                    endDateLabel="Transaction Date To"
                  />
                </div>
              </div>
            </div>
          </div>
          <TableList
            data={filteredTransactions}
            columns={columns}
            actions={(transaction) =>
              currentBranchId && currentBranchId !== "all"
                ? [
                    <UIButton
                      key="edit"
                      onClick={() => {
                        console.log(
                          "🔘 Edit button clicked for transaction:",
                          transaction
                        );
                        openTransactionModal(transaction);
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      <Icon name="edit" className="mr-2 h-4 w-4" /> Edit
                    </UIButton>,
                    <UIButton
                      key="delete"
                      onClick={() => deleteTransaction(transaction._id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Icon name="delete" className="mr-2 h-4 w-4" /> Delete
                    </UIButton>,
                  ]
                : []
            }
            renderDetail={(transaction) => (
              <div className="p-6 bg-muted border-l border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-muted-foreground">
                        Date:
                      </span>
                      <span className="text-foreground font-medium">
                        {new Date(
                          transaction.transactionDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-muted-foreground">
                        Type:
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(
                          transaction.transactionType
                        )}`}
                      >
                        {transaction.transactionType.charAt(0).toUpperCase() +
                          transaction.transactionType.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-muted-foreground">
                        Category:
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">
                          {getCategoryIcon(transaction.category)}
                        </span>
                        <span className="text-foreground font-medium capitalize">
                          {transaction.category.replace("_", " ")}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-muted-foreground">
                        Amount:
                      </span>
                      <span
                        className={`font-bold ${
                          transaction.transactionType === "income"
                            ? "text-foreground"
                            : "text-destructive"
                        }`}
                      >
                        ₹{transaction.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-muted-foreground">
                        Payment Method:
                      </span>
                      <span className="text-foreground font-medium capitalize">
                        {transaction.paymentMethod.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-muted-foreground">
                        Reference:
                      </span>
                      <span className="text-foreground font-medium">
                        {transaction.reference}
                      </span>
                    </div>
                    {transaction.vendor && (
                      <div className="flex items-center">
                        <span className="w-24 text-sm font-medium text-muted-foreground">
                          Vendor:
                        </span>
                        <span className="text-foreground font-medium">
                          {transaction.vendor}
                        </span>
                      </div>
                    )}
                    {transaction.customer && (
                      <div className="flex items-center">
                        <span className="w-24 text-sm font-medium text-muted-foreground">
                          Customer:
                        </span>
                        <span className="text-foreground font-medium">
                          {transaction.customer}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-muted-foreground">
                        Status:
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {transaction.status.charAt(0).toUpperCase() +
                          transaction.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {transaction.remarks && (
                  <div className="mt-4 p-3 bg-card rounded-lg border border-border">
                    <h4 className="text-sm font-semibold text-foreground mb-1">
                      Remarks
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {transaction.remarks}
                    </p>
                  </div>
                )}
              </div>
            )}
          />
        </div>

        {/* Mobile Table View */}
        <div className="lg:hidden bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
          <div className="px-4 py-4 border-b border-border bg-muted">
            <h3 className="text-lg font-semibold text-foreground">
              Financial Transactions
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Total: {filteredTransactions.length} records
            </p>
          </div>

          <div className="p-4">
            {filteredTransactions.length === 0 ? (
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-foreground">
                  No transactions
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by creating a new transaction.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    <div
                      className="bg-card p-3 cursor-pointer hover:bg-accent transition-colors"
                      onClick={() =>
                        setExpandedTransaction(
                          expandedTransaction === transaction._id
                            ? null
                            : transaction._id
                        )
                      }
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-foreground">
                            {transaction.description}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(
                              transaction.transactionDate
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {transaction.category.replace("_", " ")} •{" "}
                            {transaction.paymentMethod.replace("_", " ")}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-semibold ${
                              transaction.transactionType === "income"
                                ? "text-foreground"
                                : "text-destructive"
                            }`}
                          >
                            ₹{transaction.amount.toLocaleString()}
                          </span>
                          {currentBranchId && currentBranchId !== "all" && (
                            <>
                              <UIButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openTransactionModal(transaction);
                                }}
                                variant="secondary"
                                size="sm"
                              >
                                <Icon name="edit" className="mr-1 h-4 w-4" />{" "}
                                Edit
                              </UIButton>
                              <UIButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTransaction(transaction._id);
                                }}
                                variant="destructive"
                                size="sm"
                              >
                                <Icon name="delete" className="mr-1 h-4 w-4" />{" "}
                                Delete
                              </UIButton>
                            </>
                          )}
                          <svg
                            className={`w-4 h-4 text-muted-foreground transition-transform ${
                              expandedTransaction === transaction._id
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

                    {expandedTransaction === transaction._id && (
                      <div className="bg-muted p-4 border-t border-border">
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <span
                              className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(
                                transaction.transactionType
                              )}`}
                            >
                              {transaction.transactionType
                                .charAt(0)
                                .toUpperCase() +
                                transaction.transactionType.slice(1)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Category:
                            </span>
                            <span className="ml-1 font-medium text-foreground capitalize">
                              {transaction.category.replace("_", " ")}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Reference:
                            </span>
                            <span className="ml-1 font-medium text-foreground">
                              {transaction.reference}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Status:
                            </span>
                            <span
                              className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                transaction.status
                              )}`}
                            >
                              {transaction.status.charAt(0).toUpperCase() +
                                transaction.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        {transaction.remarks && (
                          <div className="p-3 bg-card rounded-lg border border-border">
                            <h5 className="text-sm font-semibold text-foreground mb-1">
                              Remarks
                            </h5>
                            <p className="text-muted-foreground text-sm">
                              {transaction.remarks}
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
      </div>

      {/* Transaction Modal */}
      <DialogBox
        show={showTransactionModal}
        onClose={closeTransactionModal}
        title={editingTransaction ? "Edit Transaction" : "Add New Transaction"}
        size="2xl"
      >
        {console.log(
          "🎭 Modal rendering with editingTransaction:",
          editingTransaction
        )}
        {console.log("📝 Current form state:", transactionForm)}
        {console.log(
          "🏷️ Modal title should be:",
          editingTransaction ? "Edit Transaction" : "Add New Transaction"
        )}
        <form
          onSubmit={saveTransaction}
          className="space-y-4"
          key={editingTransaction ? "edit" : "add"}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Transaction Date"
              name="transactionDate"
              type="date"
              value={transactionForm.transactionDate}
              onChange={handleTransactionFormChange}
              required
              icon="calendar"
            />
            {console.log(
              "📅 Date field value:",
              transactionForm.transactionDate
            )}
            <FormSelect
              label="Transaction Type"
              name="transactionType"
              value={transactionForm.transactionType}
              onChange={handleTransactionFormChange}
              options={[
                { value: "income", label: "Income" },
                { value: "expense", label: "Expense" },
              ]}
              icon="trending-up"
            />
            <FormSelect
              label="Category"
              name="category"
              value={transactionForm.category}
              onChange={handleTransactionFormChange}
              options={[
                { value: "rice_sales", label: "Rice Sales" },
                { value: "paddy_purchase", label: "Paddy Purchase" },
                { value: "labor", label: "Labor" },
                { value: "electricity", label: "Electricity" },
                { value: "maintenance", label: "Maintenance" },
                { value: "transport", label: "Transport" },
                { value: "rent", label: "Rent" },
                { value: "utilities", label: "Utilities" },
                { value: "insurance", label: "Insurance" },
                { value: "taxes", label: "Taxes" },
                { value: "other", label: "Other" },
              ]}
              icon="tag"
            />
            <FormInput
              label="Amount (₹)"
              name="amount"
              type="number"
              value={transactionForm.amount || ""}
              onChange={handleTransactionFormChange}
              required
              icon="dollar-sign"
            />

            <FormInput
              label="Description"
              name="description"
              value={transactionForm.description || ""}
              onChange={handleTransactionFormChange}
              required
              icon="file-text"
            />

            <FormInput
              label="Reference"
              name="reference"
              value={transactionForm.reference}
              onChange={handleTransactionFormChange}
              required
              icon="hash"
            />
            <FormSelect
              label="Payment Method"
              name="paymentMethod"
              value={transactionForm.paymentMethod}
              onChange={handleTransactionFormChange}
              options={[
                { value: "cash", label: "Cash" },
                { value: "bank_transfer", label: "Bank Transfer" },
                { value: "cheque", label: "Cheque" },
                { value: "upi", label: "UPI" },
                { value: "card", label: "Card" },
              ]}
              icon="credit-card"
            />
            <FormSelect
              label="Status"
              name="status"
              value={transactionForm.status}
              onChange={handleTransactionFormChange}
              options={[
                { value: "completed", label: "Completed" },
                { value: "pending", label: "Pending" },
                { value: "cancelled", label: "Cancelled" },
              ]}
              icon="check-circle"
            />
            <FormInput
              label="Vendor"
              name="vendor"
              value={transactionForm.vendor}
              onChange={handleTransactionFormChange}
              icon="building"
            />
            <FormInput
              label="Customer"
              name="customer"
              value={transactionForm.customer}
              onChange={handleTransactionFormChange}
              icon="user"
            />
          </div>
          <FormInput
            label="Remarks"
            name="remarks"
            value={transactionForm.remarks}
            onChange={handleTransactionFormChange}
            icon="note"
          />

          {/* File Upload Section */}
          <FileUpload
            label="Upload Documents & Receipts"
            module="financial"
            onFilesChange={handleFilesChange}
            onUploadSuccess={handleUploadSuccess}
            files={selectedFiles}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            maxFiles={10}
            maxSize={10}
            showPreview={true}
          />

          {/* Show existing uploaded files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Existing Documents
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-shadow">
                      {/* File Preview */}
                      <div className="relative mb-2">
                        {file.mimetype?.startsWith("image/") ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL}${file.url}`}
                            alt={file.originalName}
                            className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => openPreview(file)}
                          />
                        ) : (
                          <div
                            className="w-full h-24 bg-muted rounded border flex flex-col items-center justify-center cursor-pointer transition-colors"
                            onClick={() => openPreview(file)}
                          >
                            <span className="text-3xl mb-1">
                              {getFileIcon(file)}
                            </span>
                            <span className="text-xs text-muted-foreground text-center px-1">
                              {file.originalName
                                ?.split(".")
                                .pop()
                                ?.toUpperCase() || "FILE"}
                            </span>
                          </div>
                        )}

                        {/* Preview Overlay */}
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-all duration-200 rounded flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-sm font-medium">
                              Click to Preview
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="text-center">
                        <p
                          className="text-xs font-medium text-foreground truncate"
                          title={file.originalName}
                        >
                          {file.originalName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <UIButton
                          size="icon"
                          variant="secondary"
                          onClick={() => openPreview(file)}
                          title="Preview"
                        >
                          <Icon name="eye" className="h-4 w-4" />
                        </UIButton>
                        <UIButton
                          size="icon"
                          variant="secondary"
                          asChild
                          title="Download"
                        >
                          <a
                            href={`${import.meta.env.VITE_API_URL}${file.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Icon name="download" className="h-4 w-4" />
                          </a>
                        </UIButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <UIButton
              type="button"
              onClick={closeTransactionModal}
              variant="secondary"
            >
              <Icon name="close" className="mr-2 h-4 w-4" /> Cancel
            </UIButton>
            <UIButton type="submit">
              <Icon name="save" className="mr-2 h-4 w-4" />{" "}
              {editingTransaction ? "Update Transaction" : "Create Transaction"}
            </UIButton>
          </div>
        </form>
      </DialogBox>

      {/* File Preview Modal */}
      {showPreviewModal && previewFile && (
        <DialogBox
          show={showPreviewModal}
          onClose={closePreview}
          title={`Preview: ${previewFile.originalName}`}
          size="2xl"
        >
          <div className="space-y-4">
            {/* File Info */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">
                    File Name:
                  </span>
                  <p className="text-foreground">{previewFile.originalName}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    File Size:
                  </span>
                  <p className="text-foreground">
                    {(previewFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    File Type:
                  </span>
                  <p className="text-foreground">{previewFile.mimetype}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Uploaded:
                  </span>
                  <p className="text-foreground">
                    {previewFile.uploadedAt
                      ? new Date(previewFile.uploadedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* File Preview */}
            <div className="max-h-96 overflow-auto">
              {previewFile.mimetype?.startsWith("image/") ? (
                <div className="text-center">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${previewFile.url}`}
                    alt={previewFile.originalName}
                    className="max-w-full max-h-80 object-contain mx-auto rounded-lg shadow-lg"
                  />
                </div>
              ) : previewFile.mimetype?.includes("pdf") ? (
                <div className="text-center">
                  <iframe
                    src={`${import.meta.env.VITE_API_URL}${previewFile.url}`}
                    className="w-full h-96 border rounded-lg"
                    title={previewFile.originalName}
                  />
                </div>
              ) : previewFile.mimetype?.includes("text") ||
                previewFile.mimetype?.includes("csv") ? (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Text files cannot be previewed directly.
                  </p>
                  <UIButton asChild>
                    <a
                      href={`${import.meta.env.VITE_API_URL}${previewFile.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center"
                    >
                      <Icon name="fileText" className="mr-2 h-4 w-4" /> Open in
                      New Tab
                    </a>
                  </UIButton>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">
                    {getFileIcon(previewFile)}
                  </div>
                  <p className="text-lg font-medium text-foreground mb-2">
                    {previewFile.originalName}
                  </p>
                  <p className="text-muted-foreground mb-4">
                    This file type cannot be previewed directly.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <UIButton asChild>
                      <a
                        href={`${import.meta.env.VITE_API_URL}${
                          previewFile.url
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center"
                      >
                        <Icon name="fileText" className="mr-2 h-4 w-4" /> Open
                        in New Tab
                      </a>
                    </UIButton>
                    <UIButton asChild variant="secondary">
                      <a
                        href={`${import.meta.env.VITE_API_URL}${
                          previewFile.url
                        }`}
                        download={previewFile.originalName}
                        className="inline-flex items-center"
                      >
                        <Icon name="download" className="mr-2 h-4 w-4" />{" "}
                        Download
                      </a>
                    </UIButton>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-border">
              <UIButton onClick={closePreview} variant="secondary">
                <Icon name="close" className="mr-2 h-4 w-4" /> Close
              </UIButton>
              <UIButton asChild>
                <a
                  href={`${import.meta.env.VITE_API_URL}${previewFile.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  <Icon name="fileText" className="mr-2 h-4 w-4" /> Open in New
                  Tab
                </a>
              </UIButton>
              <UIButton asChild variant="secondary">
                <a
                  href={`${import.meta.env.VITE_API_URL}${previewFile.url}`}
                  download={previewFile.originalName}
                  className="inline-flex items-center"
                >
                  <Icon name="download" className="mr-2 h-4 w-4" /> Download
                </a>
              </UIButton>
            </div>
          </div>
        </DialogBox>
      )}
    </div>
  );
};

export default FinancialLedger;
