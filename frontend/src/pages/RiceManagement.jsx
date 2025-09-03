import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import Button from "../components/common/Button";
import DialogBox from "../components/common/DialogBox";
import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import { Button as UIButton } from "../components/ui/button";
import Icon from "../components/common/Icon";
import GroupedTable from "../components/common/GroupedTable";
import TableFilters from "../components/common/TableFilters";
import BranchFilter from "../components/common/BranchFilter";

import LoadingSpinner from "../components/common/LoadingSpinner";
import FileUpload from "../components/common/FileUpload";
import DateRangeFilter from "../components/common/DateRangeFilter";
import riceDepositService from "../services/riceDepositService";
import { getAllPaddy } from "../services/paddyService";
import { formatWeight } from "../utils/calculations";

const RiceManagement = () => {
  const { user: _user } = useSelector((state) => state.auth);
  const { currentBranchId } = useSelector((state) => state.branch);
  const [riceDeposits, setRiceDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRiceModal, setShowRiceModal] = useState(false);
  const [editingRice, setEditingRice] = useState(null);
  const [riceFilter, setRiceFilter] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [expandedRice, setExpandedRice] = useState(null);
  const [stats, setStats] = useState({
    totalONB: 0,
    totalSS: 0,
    totalRiceBags: 0,
    totalRiceWeight: 0,
    totalRiceDeposit: 0,
    totalGunnyBags: 0,
    totalGunnyWeight: 0,
    count: 0,
    // FRK specific stats
    frkRiceBags: 0,
    frkRiceWeight: 0,
    frkGunnyBags: 0,
    frkGunnyWeight: 0,
    frkCount: 0,
  });
  const [paddyData, setPaddyData] = useState([]);
  const [varietySummary, setVarietySummary] = useState([]);
  const [riceComparison, setRiceComparison] = useState({
    actualRiceOutput: 0,
    expectedRiceOutput: 0,
    expectedByproducts: 0,
    actualByproducts: 0,
    totalPaddyWeight: 0,
    efficiency: 0,
    difference: 0,
  });
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Optional fields management
  const [showOptionalFieldsModal, setShowOptionalFieldsModal] = useState(false);
  const [selectedRiceForOptionalFields, setSelectedRiceForOptionalFields] =
    useState(null);
  const [optionalFieldsForm, setOptionalFieldsForm] = useState({
    godownDate: "",
    ackNo: "",
    sampleNumber: "",
  });

  const initialRiceForm = {
    date: "",
    truckMemo: "",
    lorryNumber: "",
    depositGodown: "",
    variety: "",
    riceBag: 0,
    riceBagFrk: 0,
    depositWeight: 0,
    depositWeightFrk: 0,
    totalRiceDeposit: 0,
    moisture: 0,
    gunny: {
      onb: 0,
      ss: 0,
      swp: 0,
    },
    gunnyBags: 0,
    gunnyWeight: 0,
  };

  const [riceForm, setRiceForm] = useState(initialRiceForm);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Calculate variety summary - Expected vs Actual vs Pending
  const calculateVarietySummary = useCallback(() => {
    console.log("Calculating variety production analysis:", {
      paddyData,
      riceDeposits,
    }); // Debug log
    const varietyMap = new Map();

    // Calculate total gunny counts (shared across all varieties)
    const totalExpectedGunny = paddyData.reduce((total, paddy) => {
      return (
        total +
        ((paddy.gunny?.nb || 0) +
          (paddy.gunny?.onb || 0) +
          (paddy.gunny?.ss || 0) +
          (paddy.gunny?.swp || 0))
      );
    }, 0);

    const totalActualGunny = riceDeposits.reduce((total, rice) => {
      return (
        total +
        ((rice.gunny?.onb || 0) +
          (rice.gunny?.ss || 0) +
          (rice.gunny?.swp || 0))
      );
    }, 0);

    const totalPendingGunny = totalExpectedGunny - totalActualGunny;

    // Calculate expected rice production from paddy data
    paddyData.forEach((paddy) => {
      const variety = paddy.paddyVariety || "Unknown";
      if (!varietyMap.has(variety)) {
        varietyMap.set(variety, {
          variety: variety,
          expectedRiceWeight: 0,
          actualRiceWeight: 0,
          actualRiceBags: 0,
          depositRecords: 0,
          // Shared gunny totals (same for all varieties)
          totalExpectedGunny: totalExpectedGunny,
          totalActualGunny: totalActualGunny,
          totalPendingGunny: totalPendingGunny,
        });
      }

      const summary = varietyMap.get(variety);
      const paddyWeight = paddy.paddy?.weight || 0;

      // Expected rice from this paddy (67%)
      summary.expectedRiceWeight += paddyWeight * 0.67;
    });

    // Calculate actual rice production from rice deposits
    riceDeposits.forEach((rice) => {
      const variety = rice.variety || "Unknown";
      if (!varietyMap.has(variety)) {
        varietyMap.set(variety, {
          variety: variety,
          expectedRiceWeight: 0,
          actualRiceWeight: 0,
          actualRiceBags: 0,
          depositRecords: 0,
          // Shared gunny totals (same for all varieties)
          totalExpectedGunny: totalExpectedGunny,
          totalActualGunny: totalActualGunny,
          totalPendingGunny: totalPendingGunny,
        });
      }

      const summary = varietyMap.get(variety);
      summary.depositRecords += 1;
      summary.actualRiceWeight +=
        (rice.depositWeight || 0) + (rice.depositWeightFrk || 0);
      summary.actualRiceBags += (rice.riceBag || 0) + (rice.riceBagFrk || 0);
    });

    // Calculate pending rice and efficiency for each variety
    const varietyArray = Array.from(varietyMap.values())
      .map((variety) => ({
        ...variety,
        pendingRiceWeight:
          variety.expectedRiceWeight - variety.actualRiceWeight,
        efficiency:
          variety.expectedRiceWeight > 0
            ? (variety.actualRiceWeight / variety.expectedRiceWeight) * 100
            : 0,
      }))
      .sort((a, b) => a.variety.localeCompare(b.variety));

    console.log("Variety production analysis calculated:", varietyArray); // Debug log
    setVarietySummary(varietyArray);
  }, [paddyData, riceDeposits]);

  // Fetch functions defined after calculateVarietySummary
  const fetchRiceData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await riceDepositService.getAllRiceDeposits();
      setRiceDeposits(data);

      // Debug: Check for rice/gunny bag mismatches
      console.log("=== RICE/GUNNY MISMATCH ANALYSIS ===");
      data.forEach((rice, index) => {
        const totalRiceBags = (rice.riceBag || 0) + (rice.riceBagFrk || 0);
        const totalGunnyBags = rice.gunnyBags || 0;
        const individualGunnyTotal =
          (rice.gunny?.onb || 0) +
          (rice.gunny?.ss || 0) +
          (rice.gunny?.swp || 0);

        if (
          totalRiceBags !== totalGunnyBags ||
          totalGunnyBags !== individualGunnyTotal
        ) {
          console.log(
            `⚠️ MISMATCH in Record ${index + 1} (${rice.truckMemo}):`
          );
          console.log(
            `  Rice Bags: ${totalRiceBags} (${rice.riceBag || 0} + ${
              rice.riceBagFrk || 0
            })`
          );
          console.log(`  Gunny Bags Field: ${totalGunnyBags}`);
          console.log(
            `  Individual Gunny: ${individualGunnyTotal} (${
              rice.gunny?.onb || 0
            } + ${rice.gunny?.ss || 0} + ${rice.gunny?.swp || 0})`
          );
          console.log(
            `  Difference: Rice-Gunny = ${
              totalRiceBags - totalGunnyBags
            }, Gunny-Individual = ${totalGunnyBags - individualGunnyTotal}`
          );
        }
      });

      const totalRice = data.reduce(
        (sum, rice) => sum + ((rice.riceBag || 0) + (rice.riceBagFrk || 0)),
        0
      );
      const totalGunny = data.reduce(
        (sum, rice) => sum + (rice.gunnyBags || 0),
        0
      );
      console.log(
        `TOTALS: Rice Bags = ${totalRice}, Gunny Bags = ${totalGunny}, Difference = ${
          totalGunny - totalRice
        }`
      );
    } catch (error) {
      console.error("Error fetching rice deposit data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRiceStats = useCallback(async () => {
    try {
      const data = await riceDepositService.getRiceDepositStats();
      console.log("Rice deposit stats from backend:", data); // Debug log
      setStats(data);
    } catch (error) {
      console.error("Error fetching rice deposit stats:", error);
    }
  }, []);

  // Calculate FRK specific statistics
  const calculateFrkStats = useCallback(() => {
    console.log("Calculating FRK stats for rice deposits:", riceDeposits); // Debug log

    const frkStats = riceDeposits.reduce(
      (acc, rice) => {
        const frkBags = rice.riceBagFrk || 0;
        const frkWeight = rice.depositWeightFrk || 0;
        const regularBags = rice.riceBag || 0;
        const regularWeight = rice.depositWeight || 0;

        if (frkBags > 0 || frkWeight > 0) {
          acc.frkCount += 1;
          acc.frkRiceBags += frkBags;
          acc.frkRiceWeight += frkWeight;

          // Calculate gunny bags proportional to FRK rice
          const totalRiceBags = regularBags + frkBags;
          const totalRiceWeight = regularWeight + frkWeight;

          // Use the gunnyBags field (total) for calculation, not individual gunny types
          const totalGunnyBags = rice.gunnyBags || 0;
          const individualGunnyTotal =
            (rice.gunny?.onb || 0) +
            (rice.gunny?.ss || 0) +
            (rice.gunny?.swp || 0);

          console.log(
            `Rice ${rice._id}: gunnyBags=${totalGunnyBags}, individual total=${individualGunnyTotal}, FRK bags=${frkBags}, regular bags=${regularBags}`
          );

          if (totalRiceBags > 0 && totalGunnyBags > 0) {
            // Proportional gunny allocation based on FRK rice bags
            const frkGunnyProportion = frkBags / totalRiceBags;
            const allocatedFrkGunny = Math.round(
              totalGunnyBags * frkGunnyProportion
            );
            acc.frkGunnyBags += allocatedFrkGunny;
            console.log(
              `FRK gunny allocation: ${allocatedFrkGunny} (${(
                frkGunnyProportion * 100
              ).toFixed(1)}% of ${totalGunnyBags})`
            );
          } else if (totalRiceWeight > 0 && totalGunnyBags > 0) {
            // Proportional gunny allocation based on FRK rice weight
            const frkGunnyProportion = frkWeight / totalRiceWeight;
            const allocatedFrkGunny = Math.round(
              totalGunnyBags * frkGunnyProportion
            );
            acc.frkGunnyBags += allocatedFrkGunny;
            console.log(
              `FRK gunny allocation (by weight): ${allocatedFrkGunny} (${(
                frkGunnyProportion * 100
              ).toFixed(1)}% of ${totalGunnyBags})`
            );
          }

          // Proportional gunny weight allocation
          if (totalRiceWeight > 0) {
            const frkGunnyWeightProportion = frkWeight / totalRiceWeight;
            acc.frkGunnyWeight += Math.round(
              (rice.gunnyWeight || 0) * frkGunnyWeightProportion
            );
          }
        }

        return acc;
      },
      {
        frkCount: 0,
        frkRiceBags: 0,
        frkRiceWeight: 0,
        frkGunnyBags: 0,
        frkGunnyWeight: 0,
      }
    );

    console.log("Final FRK stats calculated:", frkStats); // Debug log

    setStats((prev) => ({
      ...prev,
      ...frkStats,
    }));
  }, [riceDeposits]);

  const fetchPaddyData = useCallback(async () => {
    try {
      const data = await getAllPaddy();
      const paddyArray = data.data || data;
      console.log("Paddy data fetched:", paddyArray); // Debug log
      setPaddyData(paddyArray);
    } catch (error) {
      console.error("Error fetching paddy data:", error);
    }
  }, []);

  // Fetch rice deposit data
  useEffect(() => {
    fetchRiceData();
    fetchRiceStats();
    fetchPaddyData();
  }, [fetchRiceData, fetchRiceStats, fetchPaddyData]);

  // Refetch data when branch changes
  useEffect(() => {
    if (currentBranchId) {
      fetchRiceData();
      fetchRiceStats();
      fetchPaddyData();
    }
  }, [currentBranchId, fetchRiceData, fetchRiceStats, fetchPaddyData]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Calculate rice comparison statistics
  const calculateRiceComparison = useCallback(() => {
    // Separate regular rice production from FRK rice deposits
    const regularRiceWeight = riceDeposits.reduce((total, rice) => {
      return total + ((rice.depositWeight || 0) - (rice.depositWeightFrk || 0));
    }, 0);

    const frkRiceWeight = riceDeposits.reduce((total, rice) => {
      return total + (rice.depositWeightFrk || 0);
    }, 0);

    const totalActualRiceOutput = regularRiceWeight + frkRiceWeight;

    const regularRiceBags = riceDeposits.reduce((total, rice) => {
      return total + ((rice.riceBag || 0) - (rice.riceBagFrk || 0));
    }, 0);

    const frkRiceBags = riceDeposits.reduce((total, rice) => {
      return total + (rice.riceBagFrk || 0);
    }, 0);

    const totalActualRiceBags = regularRiceBags + frkRiceBags;

    // Calculate expected rice output (67% of total paddy weight)
    const totalPaddyWeight = paddyData.reduce((total, paddy) => {
      return total + (paddy.paddy?.weight || 0);
    }, 0);

    const expectedRiceOutput = totalPaddyWeight * 0.67;
    const expectedByproducts = totalPaddyWeight * 0.33;
    const actualByproducts = Math.max(0, totalPaddyWeight - regularRiceWeight);
    const difference = totalActualRiceOutput - expectedRiceOutput;
    const efficiency =
      expectedRiceOutput > 0
        ? (regularRiceWeight / expectedRiceOutput) * 100
        : 0;

    setRiceComparison({
      actualRiceOutput: totalActualRiceOutput,
      regularRiceOutput: regularRiceWeight,
      frkRiceOutput: frkRiceWeight,
      totalRiceBags: totalActualRiceBags,
      regularRiceBags: regularRiceBags,
      frkRiceBags: frkRiceBags,
      expectedRiceOutput,
      expectedByproducts,
      actualByproducts,
      totalPaddyWeight,
      efficiency,
      difference,
    });
  }, [paddyData, riceDeposits]);

  // Calculate FRK stats when rice deposits change
  useEffect(() => {
    if (riceDeposits.length > 0) {
      calculateFrkStats();
    }
  }, [riceDeposits, calculateFrkStats]);

  // Calculate variety summary when rice deposits change
  useEffect(() => {
    calculateVarietySummary();
  }, [riceDeposits, calculateVarietySummary]);

  // Update comparison when stats, paddy data, or rice deposits change
  useEffect(() => {
    if (paddyData.length > 0 || riceDeposits.length > 0) {
      calculateRiceComparison();
    }
  }, [stats, paddyData, riceDeposits, calculateRiceComparison]);

  // Rice CRUD operations
  const openRiceModal = (rice = null) => {
    setEditingRice(rice);

    const formData = rice
      ? {
          ...initialRiceForm,
          ...rice,
          gunny: { ...initialRiceForm.gunny, ...rice.gunny },
        }
      : { ...initialRiceForm };

    setRiceForm(formData);
    setShowRiceModal(true);
  };

  const closeRiceModal = () => {
    setShowRiceModal(false);
    setEditingRice(null);
    setRiceForm(initialRiceForm);
    setErrorMessage(null);
  };

  const handleRiceFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("gunny.")) {
      const gunnyType = name.split(".")[1];
      setRiceForm({
        ...riceForm,
        gunny: {
          ...riceForm.gunny,
          [gunnyType]: parseInt(value) || 0,
        },
      });
    } else {
      setRiceForm({
        ...riceForm,
        [name]: value,
      });
    }
  };

  const handleFilesChange = (files) => {
    setSelectedFiles(files);
  };

  // Optional fields modal functions
  const openOptionalFieldsModal = (rice) => {
    setSelectedRiceForOptionalFields(rice);
    setOptionalFieldsForm({
      godownDate: rice.godownDate
        ? new Date(rice.godownDate).toISOString().split("T")[0]
        : "",
      ackNo: rice.ackNo || "",
      sampleNumber: rice.sampleNumber || "",
    });
    setShowOptionalFieldsModal(true);
  };

  const closeOptionalFieldsModal = () => {
    setShowOptionalFieldsModal(false);
    setSelectedRiceForOptionalFields(null);
    setOptionalFieldsForm({
      godownDate: "",
      ackNo: "",
      sampleNumber: "",
    });
  };

  const handleOptionalFieldsFormChange = (e) => {
    const { name, value } = e.target;
    setOptionalFieldsForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveOptionalFields = async (e) => {
    e.preventDefault();
    if (!selectedRiceForOptionalFields) return;

    setLoading(true);
    try {
      const updateData = {
        ...optionalFieldsForm,
      };

      await riceDepositService.updateRiceDeposit(
        selectedRiceForOptionalFields._id,
        updateData
      );

      // Update local state
      setRiceDeposits((prev) =>
        prev.map((rice) =>
          rice._id === selectedRiceForOptionalFields._id
            ? { ...rice, ...updateData }
            : rice
        )
      );

      const hasExistingDetails =
        selectedRiceForOptionalFields.godownDate ||
        selectedRiceForOptionalFields.ackNo ||
        selectedRiceForOptionalFields.sampleNumber;

      setSuccessMessage(
        hasExistingDetails
          ? "Optional details updated successfully!"
          : "Optional details added successfully!"
      );
      closeOptionalFieldsModal();
    } catch (error) {
      console.error("Error updating optional fields:", error);
      setErrorMessage("Failed to add optional details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveRice = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Prepare form data - ensure proper structure
      const formData = {
        ...riceForm,
        // Ensure gunny object is properly structured
        gunny: {
          onb: parseInt(riceForm.gunny?.onb) || 0,
          ss: parseInt(riceForm.gunny?.ss) || 0,
          swp: parseInt(riceForm.gunny?.swp) || 0,
        },
      };

      console.log("Saving rice deposit with data:", formData); // Debug log

      if (editingRice) {
        const result = await riceDepositService.updateRiceDeposit(
          editingRice._id,
          formData
        );
        console.log("Update result:", result); // Debug log
      } else {
        const result = await riceDepositService.createRiceDeposit(formData);
        console.log("Create result:", result); // Debug log
      }

      // Show success message
      setSuccessMessage(
        editingRice
          ? "Rice deposit updated successfully!"
          : "Rice deposit created successfully!"
      );
      // Close modal first, then refresh data
      closeRiceModal();
      // Refresh data after a short delay to ensure modal is closed
      setTimeout(() => {
        fetchRiceData();
        fetchRiceStats();
        fetchPaddyData();
      }, 100);
    } catch (error) {
      console.error("Error saving rice deposit:", error);
      setErrorMessage(
        "Error saving rice deposit: " +
          (error.response?.data?.message || error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteRice = async (riceId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this rice deposit record?"
      )
    ) {
      try {
        setLoading(true);
        await riceDepositService.deleteRiceDeposit(riceId);
        fetchRiceData();
        fetchRiceStats();
        fetchPaddyData();
      } catch (error) {
        console.error("Error deleting rice deposit:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter rice deposits
  const filteredRiceDeposits = riceDeposits.filter((rice) => {
    const q = riceFilter.toLowerCase();
    const matchesText =
      rice.truckMemo?.toLowerCase().includes(q) ||
      rice.lorryNumber?.toLowerCase().includes(q) ||
      rice.depositGodown?.toLowerCase().includes(q) ||
      rice.variety?.toLowerCase().includes(q) ||
      rice.ackNo?.toLowerCase().includes(q) ||
      rice.sampleNumber?.toLowerCase().includes(q);

    // Date range filter
    let matchesDate = true;
    if (dateRange.startDate || dateRange.endDate) {
      const riceDate = new Date(rice.date);
      if (dateRange.startDate) {
        matchesDate = matchesDate && riceDate >= new Date(dateRange.startDate);
      }
      if (dateRange.endDate) {
        matchesDate =
          matchesDate &&
          riceDate <= new Date(dateRange.endDate + "T23:59:59.999Z");
      }
    }

    return matchesText && matchesDate;
  });

  // Grouped headers for the table
  const groupedHeaders = [
    {
      label: "S.NO",
      columns: [
        {
          key: "serialNumber",
        },
      ],
    },
    {
      label: "DATE",
      columns: [
        {
          key: "date",
          render: (value) => new Date(value).toLocaleDateString(),
        },
      ],
    },
    {
      label: "TRUCK MEMO",
      columns: [
        {
          key: "truckMemo",
          render: (value) => value,
        },
      ],
    },
    {
      label: "LORRY NUMBER",
      columns: [
        {
          key: "lorryNumber",
          render: (value) => value,
        },
      ],
    },
    {
      label: "DEPOSIT GODOWN",
      columns: [
        {
          key: "depositGodown",
          render: (value) => value,
        },
      ],
    },
    {
      label: "VARIETY",
      columns: [
        {
          key: "variety",
          render: (value) => value,
        },
      ],
    },
    {
      label: "OPTIONAL DETAILS",
      columns: [
        {
          key: "optionalDetails",
          label: "DETAILS",
          render: (value, row) => {
            const hasOptionalFields =
              row.godownDate || row.ackNo || row.sampleNumber;
            if (hasOptionalFields) {
              return (
                <div className="space-y-1 text-xs">
                  {row.godownDate && (
                    <div>
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(row.godownDate).toLocaleDateString()}
                    </div>
                  )}
                  {row.ackNo && (
                    <div>
                      <span className="font-medium">ACK:</span> {row.ackNo}
                    </div>
                  )}
                  {row.sampleNumber && (
                    <div>
                      <span className="font-medium">Sample:</span>{" "}
                      {row.sampleNumber}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Button
                onClick={() => openOptionalFieldsModal(row)}
                variant="outline"
                size="sm"
                icon="plus"
                className="text-xs py-1 px-2"
              >
                Godown Details
              </Button>
            );
          },
        },
      ],
    },
    {
      label: "RICE BAG",
      columns: [
        {
          key: "riceBag",
          label: "BAGS",
          render: (value) => value || 0,
        },
        {
          key: "riceBagFrk",
          label: "FRK",
          render: (value) => value || 0,
        },
      ],
    },
    {
      label: "DEPOSIT WEIGHT",
      columns: [
        {
          key: "depositWeight",
          label: "WEIGHT",
          render: (value) => value || 0,
        },
        {
          key: "depositWeightFrk",
          label: "FRK",
          render: (value) => value || 0,
        },
      ],
    },
    {
      label: "MOISTURE %",
      columns: [
        {
          key: "moisture",
          render: (value) => value || 0,
        },
      ],
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
        },
        {
          key: "gunny.swp",
          label: "SWP",
          render: (value, record) => record.gunny?.swp || 0,
        },
        {
          key: "gunnyBags",
          label: "BAGS",
          render: (value) => value || 0,
        },
        {
          key: "gunnyWeight",
          label: "WEIGHT",
          render: (value) => value || 0,
        },
      ],
    },
  ];

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="bg-card shadow-sm border-b border-border px-4 py-6 sm:px-6">
        <div className="flex flex-col space-y-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
              Rice Management
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Manage rice deposit records
            </p>
          </div>
          {currentBranchId && currentBranchId !== "all" && (
            <div className="flex justify-center sm:justify-start">
              <UIButton
                onClick={() => openRiceModal()}
                className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Icon name="add" className="mr-2 h-4 w-4" />
                Add Rice Deposit
              </UIButton>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-muted border border-border rounded-lg">
            <div className="text-foreground">
              <div className="font-medium">Success:</div>
              <div className="text-muted-foreground">{successMessage}</div>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="mt-2 text-muted-foreground hover:text-foreground text-sm"
            >
              ✕ Dismiss
            </button>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-muted border border-border rounded-lg">
            <div className="text-foreground">
              <div className="font-medium">Error:</div>
              <div className="text-muted-foreground">{errorMessage}</div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="mt-2 text-muted-foreground hover:text-foreground text-sm"
            >
              ✕ Dismiss
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          {/* Overall Stats */}
          <div className="rounded-lg border border-border bg-muted p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Total Records
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stats.count}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Rice Bags
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalRiceBags}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Manual:{" "}
                {riceDeposits.reduce(
                  (total, rice) =>
                    total + ((rice.riceBag || 0) + (rice.riceBagFrk || 0)),
                  0
                )}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Rice Weight
              </p>
              <p className="text-2xl font-bold text-foreground">
                {formatWeight(stats.totalRiceWeight)}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Gunny Bags
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalGunnyBags}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Manual Total:{" "}
                {riceDeposits.reduce(
                  (total, rice) => total + (rice.gunnyBags || 0),
                  0
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                Individual:{" "}
                {riceDeposits.reduce(
                  (total, rice) =>
                    total +
                    ((rice.gunny?.onb || 0) +
                      (rice.gunny?.ss || 0) +
                      (rice.gunny?.swp || 0)),
                  0
                )}
              </p>
            </div>
          </div>

          {/* FRK Specific Stats */}
          <div className="rounded-lg border border-border bg-muted p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                FRK Records
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stats.frkCount}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                FRK Rice Bags
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stats.frkRiceBags}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                FRK Rice Weight
              </p>
              <p className="text-2xl font-bold text-foreground">
                {formatWeight(stats.frkRiceWeight)}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                FRK Gunny Bags
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stats.frkGunnyBags}
              </p>
            </div>
          </div>
        </div>

        {/* Rice Output Comparison Summary */}
        <div className="mb-6">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                Rice Output Analysis
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Paddy Rice Production (67%) + FRK Rice Deposits = Total Rice
                Output
              </p>
            </div>

            <div className="p-6">
              {/* Rice Production Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {/* Regular Rice from Paddy */}
                <div className="text-center">
                  <div className="bg-primary/10 border border-primary rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {formatWeight(riceComparison.regularRiceOutput || 0)}
                    </div>
                    <div className="text-sm font-medium text-primary">
                      Regular Rice
                    </div>
                    <div className="text-xs text-green-500 mt-1">
                      From Paddy (67%)
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {riceComparison.regularRiceBags || 0} bags
                    </div>
                  </div>
                </div>

                {/* FRK Rice Additional */}
                <div className="text-center">
                  <div className="bg-primary/10 border border-primary rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {formatWeight(riceComparison.frkRiceOutput || 0)}
                    </div>
                    <div className="text-sm font-medium text-primary">
                      FRK Rice
                    </div>
                    <div className="text-xs text-green-500 mt-1">
                      Additional Deposits
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {riceComparison.frkRiceBags || 0} bags
                    </div>
                  </div>
                </div>

                {/* Total Rice Output */}
                <div className="text-center">
                  <div className="bg-primary/10 border border-primary rounded-lg p-4 h-32 flex flex-col justify-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {formatWeight(riceComparison.actualRiceOutput)}
                    </div>
                    <div className="text-sm font-medium text-primary">
                      Total Rice Output
                    </div>
                    <div className="text-xs text-primary/70 mt-1">
                      Regular + FRK
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {riceComparison.totalRiceBags || 0} bags
                    </div>
                  </div>
                </div>

                {/* Expected vs Actual */}
                <div className="text-center">
                  <div className="bg-primary/10 border border-primary rounded-lg p-4 h-32 flex flex-col justify-center">
                    <div className="text-xl font-bold text-primary mb-1">
                      {formatWeight(riceComparison.expectedRiceOutput)}
                    </div>
                    <div className="text-sm font-medium text-primary">
                      Expected (67%)
                    </div>
                    <div className="text-xs text-primary/70 mt-1">
                      From Paddy Only
                    </div>
                  </div>
                </div>

                {/* Efficiency */}
                <div className="text-center">
                  <div className="bg-primary/10 border border-primary rounded-lg p-4 h-32 flex flex-col justify-center">
                    <div className="text-xl font-bold mb-1 text-primary">
                      {riceComparison.efficiency.toFixed(1)}%
                    </div>
                    <div className="text-sm font-medium text-primary">
                      Paddy Efficiency
                    </div>
                    <div className="text-xs text-primary/70 mt-1">
                      Regular vs Expected
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="bg-muted rounded-lg p-3">
                  <div className="font-medium text-foreground mb-1">
                    Rice Production Summary
                  </div>
                  <div className="text-muted-foreground">
                    <div>
                      • Regular Rice:{" "}
                      {formatWeight(riceComparison.regularRiceOutput || 0)}
                      <span className="text-xs text-green-600">
                        {" "}
                        ({riceComparison.regularRiceBags || 0} bags)
                      </span>
                    </div>
                    <div>
                      • FRK Rice:{" "}
                      {formatWeight(riceComparison.frkRiceOutput || 0)}
                      <span className="text-xs text-blue-600">
                        {" "}
                        ({riceComparison.frkRiceBags || 0} bags)
                      </span>
                    </div>
                    <div className="font-medium">
                      • Total: {formatWeight(riceComparison.actualRiceOutput)}
                      <span className="text-xs">
                        {" "}
                        ({riceComparison.totalRiceBags || 0} bags)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-3">
                  <div className="font-medium text-foreground mb-1">
                    Efficiency Analysis
                  </div>
                  <div className="text-muted-foreground">
                    <div>
                      • Paddy Weight:{" "}
                      {formatWeight(riceComparison.totalPaddyWeight)}
                    </div>
                    <div>
                      • Expected (67%):{" "}
                      {formatWeight(riceComparison.expectedRiceOutput)}
                    </div>
                    <div>
                      • Paddy Efficiency: {riceComparison.efficiency.toFixed(1)}
                      %
                    </div>
                    <div>
                      • Status:{" "}
                      {riceComparison.efficiency >= 100
                        ? "✅ Above Target"
                        : riceComparison.efficiency >= 90
                        ? "⚠️ Near Target"
                        : "❌ Below Target"}
                    </div>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-3">
                  <div className="font-medium text-foreground mb-1">
                    FRK Rice Details
                  </div>
                  <div className="text-muted-foreground">
                    <div>• FRK Records: {stats.frkCount}</div>
                    <div>• FRK Rice Bags: {stats.frkRiceBags}</div>
                    <div>
                      • FRK Rice Weight: {formatWeight(stats.frkRiceWeight)}
                    </div>
                    <div>• FRK Gunny: {stats.frkGunnyBags} bags</div>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-3">
                  <div className="font-medium text-foreground mb-1">
                    FRK Impact Analysis
                  </div>
                  <div className="text-muted-foreground">
                    <div>• Base Production: 67% from paddy</div>
                    <div>
                      • FRK Addition: +
                      {formatWeight(riceComparison.frkRiceOutput || 0)}
                    </div>
                    <div>
                      • Total Increase:{" "}
                      {riceComparison.frkRiceOutput > 0 &&
                      riceComparison.expectedRiceOutput > 0
                        ? `+${(
                            (riceComparison.frkRiceOutput /
                              riceComparison.expectedRiceOutput) *
                            100
                          ).toFixed(1)}%`
                        : "0%"}
                    </div>
                    <div>
                      • FRK Contribution:{" "}
                      {stats.frkCount > 0
                        ? `${((stats.frkCount / stats.count) * 100).toFixed(
                            1
                          )}%`
                        : "0%"}{" "}
                      of records
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <GroupedTable
            tableTitle="Rice Deposit Records"
            data={filteredRiceDeposits}
            groupedHeaders={groupedHeaders}
            childFilters={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <BranchFilter
                  value={currentBranchId || ""}
                  onChange={(value) => console.log("Branch changed:", value)}
                />
                <TableFilters
                  searchValue={riceFilter}
                  onSearchChange={setRiceFilter}
                  searchPlaceholder="Search by memo, lorry, godown, variety..."
                />
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
                  startDateLabel="Date From"
                  endDateLabel="Date To"
                />
              </div>
            }
            renderDetail={(rice) => (
              <div className="p-6 bg-muted border-l border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-muted-foreground">
                        Date:
                      </span>
                      <span className="text-foreground font-medium">
                        {new Date(rice.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-muted-foreground">
                        Truck Memo:
                      </span>
                      <span className="text-foreground font-medium">
                        {rice.truckMemo}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-muted-foreground">
                        Lorry Number:
                      </span>
                      <span className="text-foreground font-medium">
                        {rice.lorryNumber}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-muted-foreground">
                        Deposit Godown:
                      </span>
                      <span className="text-foreground font-medium">
                        {rice.depositGodown}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-muted-foreground">
                        Variety:
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border`}
                      >
                        Variety {rice.variety}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-muted-foreground">
                        Ack No:
                      </span>
                      <span className="text-foreground font-medium">
                        {rice.ackNo}
                      </span>
                    </div>
                    {rice.createdAt && (
                      <div className="flex items-center">
                        <span className="w-24 text-sm font-medium text-muted-foreground">
                          Created:
                        </span>
                        <span className="text-foreground font-medium">
                          {new Date(rice.createdAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {rice.updatedAt && rice.updatedAt !== rice.createdAt && (
                      <div className="flex items-center">
                        <span className="w-24 text-sm font-medium text-muted-foreground">
                          Updated:
                        </span>
                        <span className="text-foreground font-medium">
                          {new Date(rice.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {/* Rice Summary */}
                    <div className="p-3 bg-muted rounded-lg border border-border w-full">
                      <h5 className="text-sm font-semibold text-foreground mb-2">
                        Rice Summary
                      </h5>
                      <div className="grid grid-cols-2 gap-4 text-sm w-full">
                        <div>
                          <span className="text-muted-foreground">
                            Rice Bags:
                          </span>
                          <span className="ml-1 font-medium text-foreground">
                            {rice.riceBag || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Gunny Summary */}
                    <div className="p-3 bg-muted rounded-lg border border-border w-full">
                      <h5 className="text-sm font-semibold text-foreground mb-2">
                        Gunny Summary
                      </h5>
                      <div className="grid grid-cols-3 gap-4 text-sm w-full">
                        <div className="text-center">
                          <div className="font-medium text-muted-foreground">
                            ONB
                          </div>
                          <div className="text-foreground">
                            {rice.gunny?.onb || 0}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-muted-foreground">
                            SS
                          </div>
                          <div className="text-foreground">
                            {rice.gunny?.ss || 0}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-muted-foreground">
                            SWP
                          </div>
                          <div className="text-foreground">
                            {rice.gunny?.swp || 0}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-border">
                        <div className="text-center">
                          <div className="text-xs font-medium text-muted-foreground">
                            Total Gunny
                          </div>
                          <div className="text-lg font-bold text-foreground">
                            {(rice.gunny?.onb || 0) +
                              (rice.gunny?.ss || 0) +
                              (rice.gunny?.swp || 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            actions={(rice) =>
              [
                <UIButton
                  key="edit"
                  onClick={() => openRiceModal(rice)}
                  variant="secondary"
                  size="sm"
                  className="h-8 px-2 gap-1"
                >
                  <Icon name="edit" className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit</span>
                </UIButton>,
                // Add/Edit Details button
                !(rice.godownDate || rice.ackNo || rice.sampleNumber) ? (
                  <UIButton
                    key="add-details"
                    onClick={() => openOptionalFieldsModal(rice)}
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 gap-1"
                  >
                    <Icon name="plus" className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Details</span>
                  </UIButton>
                ) : (
                  <UIButton
                    key="edit-details"
                    onClick={() => openOptionalFieldsModal(rice)}
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 gap-1"
                  >
                    <Icon name="edit" className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit Details</span>
                  </UIButton>
                ),
                <UIButton
                  key="delete"
                  onClick={() => deleteRice(rice._id)}
                  variant="destructive"
                  size="sm"
                  className="h-8 px-2 gap-1"
                >
                  <Icon name="delete" className="h-4 w-4" />
                  <span className="hidden sm:inline">Delete</span>
                </UIButton>,
              ].filter(Boolean)
            }
          />
        </div>

        {/* Mobile Table View */}
        <div className="lg:hidden bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
          <div className="px-4 py-4 border-b border-border bg-card">
            <h3 className="text-lg font-semibold text-foreground">
              Rice Deposit Records
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Total: {riceDeposits.length} records
            </p>
          </div>

          <div className="p-4">
            {filteredRiceDeposits.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-muted-foreground"
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
                <h3 className="mt-2 text-sm font-medium text-foreground">
                  No rice deposit records
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by creating a new rice deposit record.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRiceDeposits.map((rice) => (
                  <div
                    key={rice._id}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    <div
                      className="bg-card p-3 cursor-pointer hover:bg-muted transition-colors"
                      onClick={() =>
                        setExpandedRice(
                          expandedRice === rice._id ? null : rice._id
                        )
                      }
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-foreground">
                            {rice.truckMemo}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {rice.lorryNumber} • {rice.depositGodown}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(rice.date).toLocaleDateString()} •{" "}
                            {rice.variety}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openRiceModal(rice);
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
                              deleteRice(rice._id);
                            }}
                            variant="danger"
                            icon="delete"
                            className="text-xs px-2 py-1"
                          >
                            Delete
                          </Button>
                          <svg
                            className={`w-4 h-4 text-muted-foreground transition-transform ${
                              expandedRice === rice._id ? "rotate-180" : ""
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

                    {expandedRice === rice._id && (
                      <div className="p-4 bg-muted border-t border-border">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Date:
                            </span>
                            <span className="ml-2 text-foreground">
                              {new Date(rice.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Truck Memo:
                            </span>
                            <span className="ml-2 text-foreground">
                              {rice.truckMemo}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Lorry Number:
                            </span>
                            <span className="ml-2 text-foreground">
                              {rice.lorryNumber}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Deposit Godown:
                            </span>
                            <span className="ml-2 text-foreground">
                              {rice.depositGodown}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Variety:
                            </span>
                            <span className="ml-2 text-foreground">
                              {rice.variety}
                            </span>
                          </div>
                          {(rice.godownDate ||
                            rice.ackNo ||
                            rice.sampleNumber) && (
                            <div className="border-t border-border pt-2 mt-2">
                              <span className="font-medium text-muted-foreground text-sm">
                                Optional Details:
                              </span>
                              <div className="mt-1 space-y-1">
                                {rice.godownDate && (
                                  <div className="text-sm">
                                    <span className="font-medium text-muted-foreground">
                                      Godown Date:
                                    </span>
                                    <span className="ml-2 text-foreground">
                                      {new Date(
                                        rice.godownDate
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                                {rice.ackNo && (
                                  <div className="text-sm">
                                    <span className="font-medium text-muted-foreground">
                                      ACK No:
                                    </span>
                                    <span className="ml-2 text-foreground">
                                      {rice.ackNo}
                                    </span>
                                  </div>
                                )}
                                {rice.sampleNumber && (
                                  <div className="text-sm">
                                    <span className="font-medium text-muted-foreground">
                                      Sample:
                                    </span>
                                    <span className="ml-2 text-foreground">
                                      {rice.sampleNumber}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Add/Edit Details Button for Mobile */}
                          <div className="mt-2">
                            {!(
                              rice.godownDate ||
                              rice.ackNo ||
                              rice.sampleNumber
                            ) ? (
                              <Button
                                onClick={() => openOptionalFieldsModal(rice)}
                                variant="outline"
                                size="sm"
                                icon="plus"
                                className="text-xs"
                              >
                                Add Optional Details
                              </Button>
                            ) : (
                              <Button
                                onClick={() => openOptionalFieldsModal(rice)}
                                variant="outline"
                                size="sm"
                                icon="edit"
                                className="text-xs"
                              >
                                Edit Optional Details
                              </Button>
                            )}
                          </div>

                          <div>
                            <span className="font-medium text-muted-foreground">
                              Rice Bags:
                            </span>
                            <span className="ml-2 text-foreground">
                              {rice.riceBag || 0}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">
                              ONB:
                            </span>
                            <span className="ml-2 text-foreground">
                              {rice.gunny?.onb || 0}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">
                              SS:
                            </span>
                            <span className="ml-2 text-foreground">
                              {rice.gunny?.ss || 0}
                            </span>
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

      {/* Rice Modal */}
      <DialogBox
        show={showRiceModal}
        onClose={closeRiceModal}
        onSubmit={saveRice}
        title={editingRice ? "Edit Rice Deposit" : "Add Rice Deposit"}
        submitText={editingRice ? "Update" : "Create"}
        cancelText="Cancel"
        size="2xl"
      >
        <form onSubmit={saveRice} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <FormInput
              label="Date"
              name="date"
              type="date"
              value={riceForm.date}
              onChange={handleRiceFormChange}
              required
            />
            <FormInput
              label="Truck Memo"
              name="truckMemo"
              type="text"
              value={riceForm.truckMemo}
              onChange={handleRiceFormChange}
              required
            />
            <FormInput
              label="Lorry Number"
              name="lorryNumber"
              type="text"
              value={riceForm.lorryNumber}
              onChange={handleRiceFormChange}
              required
            />
            <FormInput
              label="Deposit Godown"
              name="depositGodown"
              type="text"
              value={riceForm.depositGodown}
              onChange={handleRiceFormChange}
              required
            />
            <FormSelect
              label="Variety"
              name="variety"
              value={riceForm.variety}
              onChange={handleRiceFormChange}
              options={[
                { value: "A", label: "Variety A" },
                { value: "C", label: "Variety C" },
              ]}
              placeholder="Select Variety"
              required
            />
          </div>

          {/* Variety Summary Display */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Rice Production by Variety Summary
              </label>
              {varietySummary.length > 0 ? (
                <div className="bg-muted border border-border rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {varietySummary.map((variety, index) => {
                      const isSelected = riceForm.variety === variety.variety;
                      return (
                        <div
                          key={index}
                          className={`border rounded-lg p-3 transition-all duration-200 ${
                            isSelected
                              ? "bg-primary/10 border-primary shadow-md ring-2 ring-primary/20"
                              : "bg-background border-border hover:border-muted-foreground/50"
                          }`}
                        >
                          <div className="text-center">
                            <h4
                              className={`text-sm font-semibold mb-2 ${
                                isSelected ? "text-primary" : "text-foreground"
                              }`}
                            >
                              Variety {variety.variety}
                              {isSelected && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary text-primary-foreground">
                                  Selected
                                </span>
                              )}
                            </h4>
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="text-center">
                                  <span className="text-muted-foreground">
                                    Expected Rice
                                  </span>
                                  <div className="font-bold text-blue-600">
                                    {variety.expectedRiceWeight.toFixed(0)} kg
                                  </div>
                                </div>
                                <div className="text-center">
                                  <span className="text-muted-foreground">
                                    Actual Rice
                                  </span>
                                  <div className="font-bold text-green-600">
                                    {variety.actualRiceWeight.toFixed(0)} kg
                                  </div>
                                </div>
                              </div>

                              <div className="text-center border-t pt-2">
                                <span className="text-xs text-muted-foreground">
                                  Pending Rice
                                </span>
                                <div
                                  className={`text-sm font-bold ${
                                    variety.pendingRiceWeight > 0
                                      ? "text-orange-600"
                                      : variety.pendingRiceWeight < 0
                                      ? "text-red-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {variety.pendingRiceWeight > 0 ? "+" : ""}
                                  {variety.pendingRiceWeight.toFixed(0)} kg
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs border-t pt-2">
                                <div className="text-center">
                                  <span className="text-muted-foreground">
                                    Total Expected Gunny
                                  </span>
                                  <div className="font-bold text-blue-600">
                                    {variety.totalExpectedGunny} bags
                                  </div>
                                </div>
                                <div className="text-center">
                                  <span className="text-muted-foreground">
                                    Total Actual Gunny
                                  </span>
                                  <div className="font-bold text-green-600">
                                    {variety.totalActualGunny} bags
                                  </div>
                                </div>
                              </div>

                              <div className="text-center">
                                <span className="text-xs text-muted-foreground">
                                  Total Pending Gunny
                                </span>
                                <div
                                  className={`text-sm font-bold ${
                                    variety.totalPendingGunny > 0
                                      ? "text-orange-600"
                                      : variety.totalPendingGunny < 0
                                      ? "text-red-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {variety.totalPendingGunny > 0 ? "+" : ""}
                                  {variety.totalPendingGunny} bags
                                </div>
                              </div>

                              <div className="text-center border-t pt-2">
                                <span className="text-xs text-muted-foreground">
                                  Efficiency
                                </span>
                                <div
                                  className={`text-sm font-bold ${
                                    variety.efficiency >= 100
                                      ? "text-green-600"
                                      : variety.efficiency >= 90
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {variety.efficiency.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-muted border border-border rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    No paddy or rice data available for variety analysis
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Rice Bag Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <FormInput
              label="Rice Bags"
              name="riceBag"
              type="number"
              value={riceForm.riceBag}
              onChange={handleRiceFormChange}
              min="0"
            />
            <FormInput
              label="Rice Bags FRK"
              name="riceBagFrk"
              type="number"
              value={riceForm.riceBagFrk}
              onChange={handleRiceFormChange}
              min="0"
            />
            <FormInput
              label="Deposit Weight"
              name="depositWeight"
              type="number"
              value={riceForm.depositWeight}
              onChange={handleRiceFormChange}
              min="0"
            />
            <FormInput
              label="Deposit Weight FRK"
              name="depositWeightFrk"
              type="number"
              value={riceForm.depositWeightFrk}
              onChange={handleRiceFormChange}
              min="0"
            />
            <FormInput
              label="Moisture"
              name="moisture"
              type="number"
              value={riceForm.moisture}
              onChange={handleRiceFormChange}
              min="0"
            />
          </div>

          {/* Gunny Details - Simplified */}
          <div className="space-y-4">
            <div className="bg-muted border border-border rounded-lg p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Rice Output Gunny
              </h4>
              <p className="text-xs text-muted-foreground mb-4">
                Enter the gunny bag quantities for rice output.
              </p>

              <div className="grid grid-cols-3 gap-4">
                <FormInput
                  label="ONB Bags"
                  name="gunny.onb"
                  type="number"
                  value={riceForm.gunny.onb}
                  onChange={handleRiceFormChange}
                  min="0"
                />
                <FormInput
                  label="SS Bags"
                  name="gunny.ss"
                  type="number"
                  value={riceForm.gunny.ss}
                  onChange={handleRiceFormChange}
                  min="0"
                />
                <FormInput
                  label="SWP Bags"
                  name="gunny.swp"
                  type="number"
                  value={riceForm.gunny.swp}
                  onChange={handleRiceFormChange}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Gunny Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Gunny Bags"
              name="gunnyBags"
              type="number"
              value={riceForm.gunnyBags}
              onChange={handleRiceFormChange}
              min="0"
            />
            <FormInput
              label="Gunny Weight"
              name="gunnyWeight"
              type="number"
              value={riceForm.gunnyWeight}
              onChange={handleRiceFormChange}
              min="0"
            />
          </div>

          {/* File Upload Section */}
          <FileUpload
            label="Upload Rice Documents & Images"
            module="rice"
            onFilesChange={handleFilesChange}
            files={selectedFiles}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            maxFiles={10}
            maxSize={10}
            showPreview={true}
          />
        </form>
      </DialogBox>

      {/* Optional Fields Modal */}
      <DialogBox
        show={showOptionalFieldsModal}
        onClose={closeOptionalFieldsModal}
        title={
          selectedRiceForOptionalFields &&
          (selectedRiceForOptionalFields.godownDate ||
            selectedRiceForOptionalFields.ackNo ||
            selectedRiceForOptionalFields.sampleNumber)
            ? "Edit Optional Details"
            : "Add Optional Details"
        }
        size="md"
      >
        <form onSubmit={saveOptionalFields} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <FormInput
              label="Godown Date"
              name="godownDate"
              type="date"
              value={optionalFieldsForm.godownDate}
              onChange={handleOptionalFieldsFormChange}
              placeholder="Select godown date"
            />
            <FormInput
              label="Acknowledgment Number"
              name="ackNo"
              type="text"
              value={optionalFieldsForm.ackNo}
              onChange={handleOptionalFieldsFormChange}
              placeholder="Enter ACK number"
            />
            <FormInput
              label="Sample Number"
              name="sampleNumber"
              type="text"
              value={optionalFieldsForm.sampleNumber}
              onChange={handleOptionalFieldsFormChange}
              placeholder="Enter sample number"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={closeOptionalFieldsModal}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : selectedRiceForOptionalFields &&
                  (selectedRiceForOptionalFields.godownDate ||
                    selectedRiceForOptionalFields.ackNo ||
                    selectedRiceForOptionalFields.sampleNumber)
                ? "Update Details"
                : "Save Details"}
            </Button>
          </div>
        </form>
      </DialogBox>
    </div>
  );
};

export default RiceManagement;
