import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import vendorService from "../../services/vendorService";
import FormSelect from "./FormSelect";
import LoadingSpinner from "./LoadingSpinner";

const VendorSelector = ({
  name = "vendor",
  value = "",
  onChange,
  placeholder = "Select Vendor",
  className = "",
  disabled = false,
  required = false,
  showVendorType = true,
  vendorType = null, // Filter by vendor type
  status = "active", // Filter by status
  showCreateOption = false, // Show option to create new vendor
  onVendorCreate = null, // Callback when create option is selected
  label = "Vendor",
  icon = "building",
  errorMessage = null,
}) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentBranchId } = useSelector((state) => state.branch);

  // Fetch vendors
  const fetchVendors = async () => {
    if (!currentBranchId) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        branch_id: currentBranchId,
        status: status,
        limit: 1000, // Get all vendors
      };

      if (vendorType) {
        params.vendorType = vendorType;
      }

      const response = await vendorService.getAllVendors(params);

      if (response.success) {
        let vendorOptions = response.data.map((vendor) => ({
          value: vendor._id,
          label: `${vendor.vendorCode} - ${vendor.vendorName}`,
          vendor: vendor, // Keep full vendor object for additional info
        }));

        // Add create option if enabled
        if (showCreateOption && onVendorCreate) {
          vendorOptions.unshift({
            value: "create_new",
            label: "➕ Create New Vendor",
            vendor: null,
          });
        }

        setVendors(vendorOptions);
      } else {
        throw new Error(response.message || "Failed to fetch vendors");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch vendors");
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch vendors when component mounts or dependencies change
  useEffect(() => {
    fetchVendors();
  }, [currentBranchId, vendorType, status]);

  // Handle vendor selection
  const handleVendorChange = (event) => {
    const selectedValue = event.target.value;

    if (selectedValue === "create_new" && onVendorCreate) {
      onVendorCreate();
      return;
    }

    // Find the selected vendor details
    const selectedVendorDetails = vendors.find(
      (v) => v.value === selectedValue
    )?.vendor;

    // Call onChange with both value and vendor details
    onChange(selectedValue, selectedVendorDetails);
  };

  // Get selected vendor object
  const selectedVendor = vendors.find((v) => v.value === value)?.vendor;

  // Render vendor info if selected
  const renderVendorInfo = () => {
    if (!selectedVendor || !showVendorType) return null;

    return (
      <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
        <div className="text-xs text-blue-800">
          <div className="flex items-center justify-between">
            <span className="font-medium">Type:</span>
            <span className="capitalize">
              {selectedVendor.vendorType?.replace("_", " ")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Contact:</span>
            <span>{selectedVendor.contactPerson}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Phone:</span>
            <span>{selectedVendor.phone}</span>
          </div>
          {selectedVendor.outstandingBalance > 0 && (
            <div className="flex items-center justify-between">
              <span className="font-medium text-red-600">Outstanding:</span>
              <span className="text-red-600 font-medium">
                ₹{selectedVendor.outstandingBalance?.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={className}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="flex items-center justify-center p-4 border border-gray-300 rounded-md bg-gray-50">
          <LoadingSpinner size="sm" className="mr-2" />
          <span className="text-sm text-gray-500">Loading vendors...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="p-3 border border-red-300 rounded-md bg-red-50">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 text-red-500 mr-2"
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
            <span className="text-sm text-red-700">{error}</span>
          </div>
          <button
            onClick={fetchVendors}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <FormSelect
        name={name}
        label={label}
        value={value}
        onChange={handleVendorChange}
        options={vendors}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        icon={icon}
        error={errorMessage}
      />

      {/* Show vendor info if selected */}
      {renderVendorInfo()}

      {/* Show vendor count */}
      {vendors.length > 0 && (
        <div className="mt-1 text-xs text-gray-500">
          {vendors.length} vendor{vendors.length !== 1 ? "s" : ""} available
        </div>
      )}
    </div>
  );
};

export default VendorSelector;
