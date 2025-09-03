import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import ReactApexChart from "react-apexcharts";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SouthIndiaSalesChart from "../components/charts/SouthIndiaSalesChart";

import { dashboardService } from "../services/dashboardService";

// Resolve CSS variable HSL values to CSS color strings usable by ApexCharts
// Converts space-separated HSL (CSS Color 4) to comma-separated HSL/HSLA
const resolveVar = (name) => {
  if (typeof window === "undefined") return undefined;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  if (!raw) return undefined;
  // If already comma-separated, return as hsl()
  if (raw.includes(",")) return `hsl(${raw})`;
  // Support optional alpha like: "220 90% 50% / 0.6"
  const [hslPart, alphaPart] = raw.split("/").map((s) => s && s.trim());
  const parts = (hslPart || "").split(/\s+/).filter(Boolean);
  if (parts.length >= 3) {
    const [h, s, l] = parts;
    if (alphaPart) {
      return `hsla(${h}, ${s}, ${l}, ${alphaPart})`;
    }
    return `hsl(${h}, ${s}, ${l})`;
  }
  // Fallback to raw if unexpected
  return raw;
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState({});
  const [selectedPeriod] = useState("current_month");
  const [dateRange, setDateRange] = useState({
    startDate: "2025-01-01",
    endDate: "2025-06-30",
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { currentBranchId } = useSelector((state) => state.branch);
  const { user } = useSelector((state) => state.auth);

  // Track theme changes to recompute chart colors when .dark class toggles
  const [, setThemeVersion] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new MutationObserver(() => setThemeVersion((v) => v + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Theme-aware chart colors
  const themeColors = {
    primary: resolveVar("--primary") || "#10b981",
    accent: resolveVar("--accent") || "#3b82f6",
    secondary: resolveVar("--secondary") || "#8b5cf6",
    warning: resolveVar("--warning") || "#f59e0b",
    destructive: resolveVar("--destructive") || "#ef4444",
    border: resolveVar("--border") || "#e5e7eb",
    mutedFg: resolveVar("--muted-foreground") || "#6b7280",
  };

  // ApexCharts theme mode (sync with class-based dark mode)
  const apexMode =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let response;

      if (user?.role === "superadmin") {
        // Fetch superadmin dashboard data with optional branch filtering
        response = await dashboardService.getDashboardData({
          period: selectedPeriod,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });
      } else {
        // Fetch branch-specific dashboard data
        const branchId = currentBranchId || user?.branchId;
        if (!branchId) {
          throw new Error("Branch ID not found");
        }
        response = await dashboardService.getBranchDashboard(branchId, {
          period: selectedPeriod,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });
      }

      if (response.success) {
        setDashboardData(response.data);
        setLastUpdated(new Date());
      } else {
        setError(response.message || "Failed to fetch dashboard data");
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, [user?.role, currentBranchId, user?.branchId, selectedPeriod, dateRange]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchDashboardData();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchDashboardData]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle date range changes
  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
    // Data will be refetched automatically due to useEffect dependency
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  // Manual refresh
  const handleManualRefresh = () => {
    fetchDashboardData();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };
  const formatNumber = (number) => {
    return new Intl.NumberFormat("en-IN").format(number || 0);
  };

  if (loading) return <LoadingSpinner fullPage />;

  // Extract data from API response with defaults
  const {
    overview = {},
    sales = {},
    outstanding = {},
    products = {},
    customers = {},
    invoices = {},
    geographical = {},
    purchaseInvoices = [],
  } = dashboardData;

  const {
    totalRevenue = 0,
    totalExpenses = 0,
    totalPurchase = 0,
    totalIncome = 0,
  } = overview;

  const {
    salesData = [0, 0, 0, 0, 0, 0],
    purchaseData = [0, 0, 0, 0, 0, 0],
    newCustomerSales = [0, 0, 0, 0, 0, 0],
    existingCustomerSales = [0, 0, 0, 0, 0, 0],
    invoiceCounts = {
      sales: [0, 0, 0, 0, 0, 0],
      purchases: [0, 0, 0, 0, 0, 0],
    },
    invoiceAmounts = {
      sales: [0, 0, 0, 0, 0, 0],
      purchases: [0, 0, 0, 0, 0, 0],
    },
  } = sales;

  // Generate dynamic month labels based on actual data length
  const generateMonthLabels = (dataLength) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentDate = new Date();
    const labels = [];

    for (let i = dataLength - 1; i >= 0; i--) {
      const monthDate = new Date(currentDate);
      monthDate.setMonth(currentDate.getMonth() - i);
      const monthName = months[monthDate.getMonth()];
      const year = monthDate.getFullYear();
      labels.push(`${monthName} ${year}`);
    }

    return labels;
  };

  // Generate dynamic month labels for charts
  // Use real month data from backend if available, otherwise fallback to generated labels
  const monthLabels =
    dashboardData.sales?.months || generateMonthLabels(salesData.length);

  const {
    salesOutstanding = {
      current: 0,
      overdue_1_15: 0,
      overdue_16_30: 0,
      overdue_30_plus: 0,
    },
    purchaseOutstanding = {
      current: 0,
      overdue_1_15: 0,
      overdue_16_30: 0,
      overdue_30_plus: 0,
    },
  } = outstanding;

  const { bestSelling = [], leastSelling = [], lowStock = [] } = products;

  const { topCustomers = [], topVendors = [] } = customers;

  const { dueInvoices = [] } = invoices;

  const totalSalesOutstanding =
    salesOutstanding.current +
    salesOutstanding.overdue_1_15 +
    salesOutstanding.overdue_16_30 +
    salesOutstanding.overdue_30_plus;
  const totalPurchaseOutstanding =
    purchaseOutstanding.current +
    purchaseOutstanding.overdue_1_15 +
    purchaseOutstanding.overdue_16_30 +
    purchaseOutstanding.overdue_30_plus;

  // Helpers for Key Metrics trends and progress
  const getDeltaPct = (arr) => {
    if (!Array.isArray(arr) || arr.length < 2) return null;
    const prev = arr[arr.length - 2] || 0;
    const curr = arr[arr.length - 1] || 0;
    if (prev === 0) return null;
    return ((curr - prev) / Math.abs(prev)) * 100;
  };

  const getLastVsMaxPct = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return 0;
    const curr = arr[arr.length - 1] || 0;
    const max = Math.max(...arr);
    if (max <= 0) return 0;
    return (curr / max) * 100;
  };

  const salesDelta = getDeltaPct(salesData);
  const purchaseDelta = getDeltaPct(purchaseData);
  const salesProgress = Math.max(0, Math.min(100, getLastVsMaxPct(salesData)));
  const purchaseProgress = Math.max(
    0,
    Math.min(100, getLastVsMaxPct(purchaseData))
  );

  // Series for outstanding donut chart
  const salesOutstandingSeries = [
    salesOutstanding.current || 0,
    salesOutstanding.overdue_1_15 || 0,
    salesOutstanding.overdue_16_30 || 0,
    salesOutstanding.overdue_30_plus || 0,
  ];
  const purchaseOutstandingSeries = [
    purchaseOutstanding.current || 0,
    purchaseOutstanding.overdue_1_15 || 0,
    purchaseOutstanding.overdue_16_30 || 0,
    purchaseOutstanding.overdue_30_plus || 0,
  ];

  // Chart configurations
  const newVsExistingChartOptions = {
    chart: {
      type: "bar",
      height: 300,
      toolbar: { show: false },
      stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    colors: [themeColors.primary, themeColors.accent],
    grid: {
      borderColor: themeColors.border,
      strokeDashArray: 4,
    },
    xaxis: {
      categories: monthLabels,
      labels: { style: { colors: themeColors.mutedFg, fontSize: "12px" } },
    },
    yaxis: {
      labels: {
        style: { colors: themeColors.mutedFg, fontSize: "12px" },
        formatter: (value) => formatCurrency(value * 1000),
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: { colors: themeColors.mutedFg },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => formatCurrency(value * 1000),
      },
    },
    theme: { mode: apexMode },
  };

  const invoiceCountChartOptions = {
    chart: {
      type: "bar",
      height: 300,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    colors: [themeColors.primary, themeColors.accent],
    grid: {
      borderColor: themeColors.border,
      strokeDashArray: 4,
    },
    xaxis: {
      categories: monthLabels,
      labels: { style: { colors: themeColors.mutedFg, fontSize: "12px" } },
    },
    yaxis: {
      labels: {
        style: { colors: themeColors.mutedFg, fontSize: "12px" },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: { colors: themeColors.mutedFg },
    },
    theme: { mode: apexMode },
  };

  const invoiceAmountChartOptions = {
    chart: {
      type: "area",
      height: 300,
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: [3, 2],
    },
    colors: [themeColors.primary, themeColors.accent],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.3,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    markers: { size: 3 },
    grid: {
      borderColor: themeColors.border,
      strokeDashArray: 4,
    },
    xaxis: {
      categories: monthLabels,
      labels: { style: { colors: themeColors.mutedFg, fontSize: "12px" } },
    },
    yaxis: {
      labels: {
        style: { colors: themeColors.mutedFg, fontSize: "12px" },
        formatter: (value) => formatCurrency(value * 1000),
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: { colors: themeColors.mutedFg },
    },
    tooltip: {
      y: {
        formatter: (value) => formatCurrency(value * 1000),
      },
    },
    theme: { mode: apexMode },
  };

  const outstandingDonutOptions = {
    chart: { type: "donut" },
    labels: ["Current", "Overdue 1-15", "Overdue 16-30", "30+ Days"],
    colors: [
      themeColors.primary,
      themeColors.accent,
      themeColors.warning,
      themeColors.destructive,
    ],
    legend: { position: "bottom", labels: { colors: themeColors.mutedFg } },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    tooltip: { y: { formatter: (value) => formatCurrency(value) } },
    theme: { mode: apexMode },
  };

  return (
    <div className="bg-background">
      {/* Main Dashboard */}
      <div className="space-y-6">
        {/* Stack */}
        <div className="flex flex-col gap-6">
          {/* Controls + Summary */}
          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  Dashboard
                </h1>
                {user?.role === "superadmin" && currentBranchId && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-xs">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Branch filter
                    <button
                      onClick={() => window.location.reload()}
                      className="ml-1 underline decoration-primary/40 hover:decoration-primary"
                    >
                      Clear
                    </button>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Last Updated: {lastUpdated.toLocaleTimeString()}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      handleDateRangeChange({
                        ...dateRange,
                        startDate: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-input bg-background rounded-lg text-sm"
                  />
                  <span className="text-muted-foreground">To</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      handleDateRangeChange({
                        ...dateRange,
                        endDate: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-input bg-background rounded-lg text-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleManualRefresh}
                  size="sm"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Refresh"}
                </Button>
                <Button
                  variant={autoRefresh ? "default" : "outline"}
                  onClick={toggleAutoRefresh}
                  size="sm"
                >
                  {autoRefresh ? "Stop Auto-refresh" : "Auto-refresh"}
                </Button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-center bg-destructive/10 text-destructive border border-destructive/30 rounded-lg p-3">
                <svg
                  className="w-5 h-5 mr-2"
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
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Key Metrics (compact, above grid) */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Total Paddy */}
                  <div className="rounded-lg bg-primary/10 border border-primary p-4">
                    <p className="text-xs text-primary font-medium">
                      Total Paddy
                    </p>
                    <div className="mt-1">
                      <div className="text-xl font-semibold text-primary">
                        {dashboardData.overview?.totalPaddy || 0} MT
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-primary/70">
                      Current Stock
                    </div>
                  </div>

                  {/* Total Rice */}
                  <div className="rounded-lg bg-accent/10 border border-accent p-4">
                    <p className="text-xs text-accent font-medium">
                      Total Rice
                    </p>
                    <div className="mt-1">
                      <div className="text-xl font-semibold text-accent">
                        {dashboardData.overview?.totalRice || 0} MT
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-accent/70">
                      Available Stock
                    </div>
                  </div>

                  {/* Gunny Stocks */}
                  <div className="rounded-lg bg-green-500/10 border border-green-500 p-4">
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Gunny Stocks
                    </p>
                    <div className="mt-1">
                      <div className="text-xl font-semibold text-green-600 dark:text-green-400">
                        {dashboardData.overview?.gunnyStocks || 0}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-green-600/70 dark:text-green-400/70">
                      Bags Available
                    </div>
                  </div>

                  {/* EB Meter Usage */}
                  <div className="rounded-lg bg-orange-500/10 border border-orange-500 p-4">
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      EB Meter Usage
                    </p>
                    <div className="mt-1">
                      <div className="text-xl font-semibold text-orange-600 dark:text-orange-400">
                        {dashboardData.overview?.ebMeterUsage || 0} kWh
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-orange-600/70 dark:text-orange-400/70">
                      This Month
                    </div>
                  </div>

                  {/* By Products List */}
                  <div className="rounded-lg bg-purple-500/10 border border-purple-500 p-4">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                      By Products
                    </p>
                    <div className="mt-1">
                      <div className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                        {dashboardData.overview?.byProductCount || 0}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-purple-600/70 dark:text-purple-400/70">
                      Active Items
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bento Grid */}
            <div className="grid grid-cols-4 md:grid-cols-8 xl:grid-cols-12 gap-6 auto-rows-[160px]">
              {/* Revenue vs Purchase (Area) */}
              <div className="col-span-4 md:col-span-8 xl:col-span-8 row-span-3">
                <Card className="border h-full">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">
                      Revenue vs Purchase (INR)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReactApexChart
                      options={invoiceAmountChartOptions}
                      series={[
                        { name: "Sale", data: invoiceAmounts.sales },
                        { name: "Purchase", data: invoiceAmounts.purchases },
                      ]}
                      type="area"
                      height={300}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Invoice Count (Horizontal Bars) */}
              <div className="col-span-4 md:col-span-8 xl:col-span-4 row-span-3">
                <Card className="border h-full">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">
                      Invoice Count
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReactApexChart
                      options={invoiceCountChartOptions}
                      series={[
                        { name: "Sale", data: invoiceCounts.sales },
                        { name: "Purchase", data: invoiceCounts.purchases },
                      ]}
                      type="bar"
                      height={300}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* New vs Existing (Stacked Bar) */}
              <div className="col-span-4 md:col-span-4 xl:col-span-4 row-span-3">
                <Card className="border h-full">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">
                      New vs Existing Customers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReactApexChart
                      options={newVsExistingChartOptions}
                      series={[
                        { name: "New Customer Sale", data: newCustomerSales },
                        {
                          name: "Existing Customer Sale",
                          data: existingCustomerSales,
                        },
                      ]}
                      type="bar"
                      height={300}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* South India Sales */}
              <div className="col-span-4 md:col-span-4 xl:col-span-4 row-span-3">
                <Card className="border h-full">
                  <CardContent className="p-6">
                    <SouthIndiaSalesChart
                      data={geographical}
                      title="South India Sales Overview"
                      height={300}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Outstanding Donuts */}
              <div className="col-span-4 md:col-span-4 xl:col-span-4 row-span-3">
                <Card className="border h-full">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">
                      Sales Outstanding
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReactApexChart
                      options={outstandingDonutOptions}
                      series={salesOutstandingSeries}
                      type="donut"
                      height={300}
                    />
                    <div className="mt-4 text-sm text-muted-foreground">
                      Total: {formatCurrency(totalSalesOutstanding)}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="col-span-4 md:col-span-4 xl:col-span-4 row-span-3">
                <Card className="border h-full">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">
                      Purchase Outstanding
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReactApexChart
                      options={outstandingDonutOptions}
                      series={purchaseOutstandingSeries}
                      type="donut"
                      height={300}
                    />
                    <div className="mt-4 text-sm text-muted-foreground">
                      Total: {formatCurrency(totalPurchaseOutstanding)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lists */}
              <div className="col-span-4 md:col-span-4 xl:col-span-4 row-span-3">
                <Card className="border h-full">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">
                      Best Selling Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {bestSelling.length > 0 ? (
                        bestSelling.map((product, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm text-muted-foreground truncate">
                              {product.name}
                            </span>
                            <span className="text-sm font-medium">
                              {formatNumber(product.quantity)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-4">
                          No data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="col-span-4 md:col-span-4 xl:col-span-4 row-span-3">
                <Card className="border h-full">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">
                      Least Selling Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {leastSelling.length > 0 ? (
                        leastSelling.map((product, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm text-muted-foreground truncate">
                              {product.name}
                            </span>
                            <span className="text-sm font-medium">
                              {formatNumber(product.quantity)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-4">
                          No data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="col-span-4 md:col-span-4 xl:col-span-4 row-span-3">
                <Card className="border h-full">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">
                      Low Stock
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {lowStock.length > 0 ? (
                        lowStock.map((product, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm text-muted-foreground truncate">
                              {product.name}
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                product.quantity < 0
                                  ? "text-destructive"
                                  : "text-foreground"
                              }`}
                            >
                              {formatNumber(product.quantity)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-4">
                          No low stock items
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customers/Vendors */}
              <div className="col-span-4 md:col-span-4 xl:col-span-4 row-span-3">
                <Card className="border h-full">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">
                      Top Customers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topCustomers.length > 0 ? (
                        topCustomers.map((customer, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm text-muted-foreground truncate">
                              {customer.name}
                            </span>
                            <span className="text-sm font-medium">
                              {formatCurrency(customer.amount)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-4">
                          No customer data
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="col-span-4 md:col-span-4 xl:col-span-4 row-span-3">
                <Card className="border h-full">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">
                      Top Vendors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topVendors.length > 0 ? (
                        topVendors.map((vendor, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm text-muted-foreground truncate">
                              {vendor.name}
                            </span>
                            <span className="text-sm font-medium">
                              {formatCurrency(vendor.amount)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-4">
                          No vendor data
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Due Invoices */}
              <div className="col-span-4 md:col-span-8 xl:col-span-6 row-span-4">
                <Card className="border h-full">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">
                      Sales Invoice Due
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 px-4">
                              Invoice No.
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 px-4">
                              Company Name
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 px-4">
                              Name
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 px-4">
                              Due Date
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 px-4">
                              Due From
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 px-4">
                              Remaining Payment
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {dueInvoices.length > 0 ? (
                            dueInvoices.map((invoice, index) => (
                              <tr key={index} className="hover:bg-muted">
                                <td className="py-3 px-4 text-sm text-foreground">
                                  {invoice.invoiceNo}
                                </td>
                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                  {invoice.companyName}
                                </td>
                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                  {invoice.name}
                                </td>
                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                  {invoice.dueDate}
                                </td>
                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                  {invoice.dueFrom}
                                </td>
                                <td className="py-3 px-4 text-sm font-medium text-foreground">
                                  {formatCurrency(invoice.remainingPayment)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="6"
                                className="text-center text-muted-foreground py-4"
                              >
                                No outstanding invoices
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      Total: {formatCurrency(totalSalesOutstanding)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="col-span-4 md:col-span-8 xl:col-span-6 row-span-4">
                <Card className="border h-full">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">
                      Purchase Invoice Due
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 px-4">
                              Invoice No.
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 px-4">
                              Company Name
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 px-4">
                              Name
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 px-4">
                              Due Date
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 px-4">
                              Due From
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 px-4">
                              Remaining Payment
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {purchaseInvoices.length > 0 ? (
                            purchaseInvoices.map((invoice, index) => (
                              <tr key={index} className="hover:bg-muted">
                                <td className="py-3 px-4 text-sm text-foreground">
                                  {invoice.invoiceNo}
                                </td>
                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                  {invoice.companyName}
                                </td>
                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                  {invoice.name}
                                </td>
                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                  {invoice.dueDate}
                                </td>
                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                  {invoice.dueFrom}
                                </td>
                                <td className="py-3 px-4 text-sm font-medium text-foreground">
                                  {formatCurrency(invoice.remainingPayment)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="6"
                                className="text-center text-muted-foreground py-4"
                              >
                                No outstanding purchase invoices
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      Total: {formatCurrency(totalPurchaseOutstanding)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
