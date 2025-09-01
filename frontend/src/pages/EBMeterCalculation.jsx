import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import TableFilters from '../components/common/TableFilters';
import BranchFilter from '../components/common/BranchFilter';
import DateRangeFilter from '../components/common/DateRangeFilter';
import TableList from '../components/common/TableList';
import { Button as UIButton } from '../components/ui/button';
import Icon from '../components/common/Icon';
import LoadingSpinner from '../components/common/LoadingSpinner';

import FormInput from '../components/common/FormInput';
import FormSelect from '../components/common/FormSelect';
import DialogBox from '../components/common/DialogBox';
import FileUpload from '../components/common/FileUpload';
import { meterNumberService } from '../services/meterNumberService';

const EBMeterCalculation = () => {
  const [meterReadings, setMeterReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meterFilter, setMeterFilter] = useState('');
  const [meterNumberFilter, setMeterNumberFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [meterNumbers, setMeterNumbers] = useState([]);
  const [availableMeterNumbers, setAvailableMeterNumbers] = useState([]);
  const [showMeterModal, setShowMeterModal] = useState(false);
  const [showMeterNumberModal, setShowMeterNumberModal] = useState(false);
  const [editingMeter, setEditingMeter] = useState(null);
  const [expandedMeter, setExpandedMeter] = useState(null);
  const { currentBranchId } = useSelector((state) => state.branch);

  const initialMeterForm = {
    readingDate: new Date().toISOString().split('T')[0], // Always set to today
    meterNumber: 'EB001',
    pf: 1.0, // Power Factor
    startKWH: 0,
    endKWH: 0,
    consumption: 0,
    billNumber: '',
    remarks: ''
  };

  const [meterForm, setMeterForm] = useState(initialMeterForm);
  const [meterNumberForm, setMeterNumberForm] = useState({
    meterNumber: '',
    description: '',
    branch_id: currentBranchId || '',
    status: 'active'
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    fetchMeterData();
  }, [currentBranchId, meterFilter, meterNumberFilter, dateRange]);

  useEffect(() => {
    fetchMeterNumbers();
  }, [currentBranchId]);

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const fetchMeterData = async () => {
    setLoading(true);
    setError('');
    try {
      // Simulate API call - replace with actual service
     
    } catch (err) {
      setError(err.message || 'Failed to fetch meter data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMeterNumbers = async () => {
    try {
      const response = await meterNumberService.getActiveMeterNumbers(currentBranchId);
      if (response.success) {
        setAvailableMeterNumbers(response.data);
        // Also set meterNumbers for the filter dropdown
        setMeterNumbers(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch meter numbers:', err);
      // Set some default meter numbers for demo
      setAvailableMeterNumbers([
        { meterNumber: 'EB001', description: 'Main Building' },
        { meterNumber: 'EB002', description: 'Production Unit' },
        { meterNumber: 'EB003', description: 'Warehouse' }
      ]);
      setMeterNumbers([
        { meterNumber: 'EB001', description: 'Main Building' },
        { meterNumber: 'EB002', description: 'Production Unit' },
        { meterNumber: 'EB003', description: 'Warehouse' }
      ]);
    }
  };

  const openMeterModal = (meter = null) => {
    setEditingMeter(meter);
    if (meter) {
      // Format dates for HTML date inputs (YYYY-MM-DD)
      const formattedReadingDate = new Date(meter.readingDate).toISOString().split('T')[0];
      const formData = {
        ...initialMeterForm,
        ...meter,
        readingDate: formattedReadingDate
      };
      setMeterForm(formData);
    } else {
      // For new meter reading, always set today's date and check for next day's start KWH
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Check if there's a reading for tomorrow to get start KWH
      const tomorrowReading = meterReadings.find(r => r.readingDate === tomorrow);
      const startKWH = tomorrowReading ? tomorrowReading.startKWH : 0;
      
      // Automatically set end KWH if next day's start KWH is available
      let endKWH = 0;
      if (tomorrowReading && tomorrowReading.startKWH > 0) {
        endKWH = tomorrowReading.startKWH;
      }
      
      setMeterForm({
        ...initialMeterForm,
        readingDate: today, // Always set to today (read-only)
        startKWH: startKWH,
        endKWH: endKWH,
        consumption: Math.max(0, endKWH - startKWH)
      });
    }
    setShowMeterModal(true);
  };

  const closeMeterModal = () => {
    setShowMeterModal(false);
    setEditingMeter(null);
    setMeterForm(initialMeterForm);
  };

  const closeMeterNumberModal = () => {
    setShowMeterNumberModal(false);
    setMeterNumberForm({
      meterNumber: '',
      description: '',
      branch_id: currentBranchId || '',
      status: 'active'
    });
  };

  const handleMeterNumberFormChange = (e) => {
    const { name, value } = e.target;
    setMeterNumberForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveMeterNumber = async () => {
    try {
      if (!meterNumberForm.meterNumber.trim()) {
        alert('Please enter a meter number');
        return;
      }

      const response = await meterNumberService.createMeterNumber(meterNumberForm);
      if (response.success) {
        // Refresh meter numbers list
        await fetchMeterNumbers();
        // Set the new meter number in the form
        setMeterForm(prev => ({
          ...prev,
          meterNumber: response.data.meterNumber
        }));
        closeMeterNumberModal();
        alert('Meter number created successfully!');
      }
    } catch (error) {
      console.error('Error creating meter number:', error);
      alert('Failed to create meter number: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleMeterFormChange = (e) => {
    const { name, value } = e.target;
    setMeterForm(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-calculate consumption and auto-fill end KWH if needed
      if (name === 'startKWH') {
        const start = parseFloat(value || 0);
        const end = parseFloat(updated.endKWH || 0);
        updated.consumption = Math.max(0, end - start);
        
        // Auto-fill end KWH from next day's start KWH if available and end KWH is empty
        if (end === 0 && updated.readingDate) {
          const selectedDate = new Date(updated.readingDate);
          const nextDay = new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000);
          const nextDayStr = nextDay.toISOString().split('T')[0];
          const nextDayReading = meterReadings.find(r => r.readingDate === nextDayStr);
          if (nextDayReading && nextDayReading.startKWH > 0) {
            updated.endKWH = nextDayReading.startKWH;
            updated.consumption = Math.max(0, nextDayReading.startKWH - start);
          }
        }
      } else if (name === 'endKWH') {
        const start = parseFloat(updated.startKWH || 0);
        const end = parseFloat(value || 0);
        updated.consumption = Math.max(0, end - start);
      }
      
      // If end KWH is empty, consumption will be 0 (which is fine for optional field)
      
      return updated;
    });
  };

  // Function to automatically add next date's start KWH if selected date's end KWH are missing
  const autoFillNextDayStartKWH = () => {
    if (!meterForm.readingDate) return false;
    
    const selectedDate = new Date(meterForm.readingDate);
    const nextDay = new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000);
    const nextDayStr = nextDay.toISOString().split('T')[0];
    
    // Check if there's a reading for the next day
    const nextDayReading = meterReadings.find(r => r.readingDate === nextDayStr);
    
    if (nextDayReading && nextDayReading.startKWH > 0) {
      // Auto-fill selected date's end KWH with next day's start KWH
      setMeterForm(prev => ({
        ...prev,
        endKWH: nextDayReading.startKWH,
        consumption: Math.max(0, nextDayReading.startKWH - prev.startKWH)
      }));
      
      return true;
    }
    return false;
  };

  // Function to check if auto-fill is available and show notification
  const checkAutoFillAvailability = () => {
    if (!meterForm.readingDate) {
      return {
        available: false,
        message: 'Please select a date first to check auto-fill availability.',
        nextDayKWH: 0
      };
    }
    
    const selectedDate = new Date(meterForm.readingDate);
    const nextDay = new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000);
    const nextDayStr = nextDay.toISOString().split('T')[0];
    const nextDayReading = meterReadings.find(r => r.readingDate === nextDayStr);
    
    if (nextDayReading && nextDayReading.startKWH > 0) {
      return {
        available: true,
        message: `Auto-fill available: Next day's start KWH (${formatKWH(nextDayReading.startKWH)}) can be used for ${new Date(meterForm.readingDate).toLocaleDateString()}'s end KWH.`,
        nextDayKWH: nextDayReading.startKWH
      };
    }
    
    return {
      available: false,
      message: `No next day data available for auto-fill from ${new Date(meterForm.readingDate).toLocaleDateString()}.`,
      nextDayKWH: 0
    };
  };

  const handleFilesChange = (files) => {
    setSelectedFiles(files);
  };

  const saveMeter = async (e) => {
    e.preventDefault();
    
    // Check if End KWH is empty and show warning
    if (!meterForm.endKWH || meterForm.endKWH === 0) {
      if (!window.confirm('End KWH is empty. This will set consumption to 0. Do you want to continue?')) {
        return;
      }
    }
    
    try {
      setLoading(true);
      // Simulate API call - replace with actual service
      if (editingMeter) {
        // Update existing meter reading
        setMeterReadings(prev => prev.map(meter => 
          meter._id === editingMeter._id ? { ...meterForm, _id: meter._id } : meter
        ));
      } else {
        // Create new meter reading
        const newMeter = {
          ...meterForm,
          _id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setMeterReadings(prev => [newMeter, ...prev]);
      }
      closeMeterModal();
    } catch (error) {
      setError('Error saving meter reading: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteMeter = async (meterId) => {
    if (window.confirm('Are you sure you want to delete this meter reading?')) {
      try {
        setLoading(true);
        // Simulate API call - replace with actual service
        setMeterReadings(prev => prev.filter(meter => meter._id !== meterId));
      } catch (error) {
        setError('Error deleting meter reading: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };



  // Helper function to safely format KWH values
  const formatKWH = (value, fallback = '0.00') => {
    if (value === null || value === undefined || value === '' || value === 0) {
      return fallback;
    }
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      return fallback;
    }
    return num.toFixed(2);
  };

  // Helper function to safely format KWH values with custom fallback
  const formatKWHWithFallback = (value, fallback = 'Not set') => {
    if (value === null || value === undefined || value === '' || value === 0) {
      return fallback;
    }
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      return fallback;
    }
    return num.toFixed(2);
  };

  // Calculate summary statistics
  const totalUnits = meterReadings.reduce((sum, meter) => sum + meter.consumption, 0);
  const averageConsumption = meterReadings.length > 0 ? totalUnits / meterReadings.length : 0;


  // Define columns for the table - matching your checklist format
  const columns = [
    { 
      key: "readingDate", 
      label: "DATE",
      renderCell: (value) => {
        const today = new Date().toISOString().split('T')[0];
        const isToday = value === today;
        const date = new Date(value);
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'long' });
        const year = date.getFullYear();
        
        return (
          <span className={`font-semibold ${isToday ? 'text-green-600' : 'text-gray-600'}`}>
            {day} {month} {year}
          </span>
        );
      }
    },
    { 
      key: "pf", 
      label: "PF",
      renderCell: (value) => <span className="font-semibold text-blue-600">{value}</span>
    },
    { 
      key: "startKWH", 
      label: "START KWH",
      renderCell: (value) => <span className="font-semibold text-indigo-600">{formatKWH(value)}</span>
    },
    { 
      key: "endKWH", 
      label: "END KWH",
      renderCell: (value) => (
        <span className={`font-semibold ${value && value > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
          {formatKWHWithFallback(value)}
        </span>
      )
    },
    { 
      key: "consumption", 
      label: "CONSUMPTION",
      renderCell: (value) => (
        <span className={`font-semibold ${value && value > 0 ? 'text-green-600' : 'text-gray-400'}`}>
          {formatKWH(value)}
        </span>
      )
    }
  ];

  const filteredMeterReadings = meterReadings.filter(meter => {
    const q = meterFilter.toLowerCase();
    const meterNumberMatch = !meterNumberFilter || meter.meterNumber === meterNumberFilter;
    const searchMatch = (
      meter.meterNumber?.toLowerCase().includes(q) ||
      meter.billNumber?.toLowerCase().includes(q)
    );
    const dateMatch = !dateRange.startDate || new Date(meter.readingDate) >= new Date(dateRange.startDate);
    const endDateMatch = !dateRange.endDate || new Date(meter.readingDate) <= new Date(dateRange.endDate);
    
    return meterNumberMatch && searchMatch && dateMatch && endDateMatch;
  });

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="bg-card shadow-sm border-b border-border px-4 py-6 sm:px-6">
        <div className="flex flex-col space-y-4">
          <div className="text-center sm:text-left">
           
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-2">
              EB Reading Checklist
            </h2>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              MONTH: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} 
            </p>
          </div>
          <div className="flex justify-center sm:justify-start space-x-2">
            <UIButton onClick={() => openMeterModal()}>
              <Icon name="add" className="mr-2 h-4 w-4" />
              Add Meter Reading
            </UIButton>
            
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-destructive font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Monthly Summary */}
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Summary - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">{meterReadings.length}</div>
              <div className="text-sm text-muted-foreground">Days Recorded</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">{totalUnits.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total KWH</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">{(totalUnits / Math.max(meterReadings.length, 1)).toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Avg KWH/Day</div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mr-3">
                <span className="text-primary text-lg">📅</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Date</p>
                <p className="text-xl font-bold text-foreground">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mr-3">
                <span className="text-primary text-lg">⚡</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's KWH</p>
                <p className="text-xl font-bold text-foreground">{totalUnits.toFixed(2)}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted">
            <h3 className="text-lg font-semibold text-foreground">Meter Readings</h3>
            <p className="text-sm text-muted-foreground mt-1">Total: {filteredMeterReadings.length} records</p>
            {/* Filters moved inside table header */}
            <div className="mt-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-center">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Search</label>
                  <TableFilters
                    searchValue={meterFilter}
                    searchPlaceholder="Search by meter number, bill number..."
                    onSearchChange={(e) => setMeterFilter(e.target.value)}
                    showSelect={false}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Meter Number</label>
                  <FormSelect
                    value={meterNumberFilter}
                    onChange={(e) => setMeterNumberFilter(e.target.value)}
                    options={[
                      { value: '', label: 'All Meters' },
                      ...meterNumbers.map(meter => ({
                        value: meter.meterNumber,
                        label: `${meter.meterNumber} - ${meter.description}`
                      }))
                    ]}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Branch</label>
                  <BranchFilter
                    value={currentBranchId || ''}
                    onChange={(value) => {
                      console.log('Branch changed in EB Meter:', value);
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                   <DateRangeFilter
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                    onStartDateChange={(e) => handleDateRangeChange("startDate", e.target.value)}
                    onEndDateChange={(e) => handleDateRangeChange("endDate", e.target.value)}
                    startDateLabel="Reading Date From"
                    endDateLabel="Reading Date To"
                  />
                </div>
              </div>
            </div>
          </div>
          <TableList
            data={filteredMeterReadings}
            columns={columns}
            actions={(meter) => [
              <UIButton key="edit" onClick={() => openMeterModal(meter)} variant="secondary" size="sm">
                <Icon name="edit" className="mr-2 h-4 w-4" />
                Edit
              </UIButton>,
              <UIButton key="delete" onClick={() => deleteMeter(meter._id)} variant="destructive" size="sm">
                <Icon name="delete" className="mr-2 h-4 w-4" />
                Delete
              </UIButton>
            ]}
            renderDetail={(meter) => (
              <div className="p-6 bg-muted border-l-4 border-primary">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-muted-foreground">Reading Date:</span>
                      <span className="text-foreground font-medium">{new Date(meter.readingDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-muted-foreground">Meter Number:</span>
                      <span className="text-primary font-medium">{meter.meterNumber}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-muted-foreground">Bill Number:</span>
                      <span className="text-foreground font-medium">{meter.billNumber}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-muted-foreground">Power Factor:</span>
                      <span className="text-foreground font-medium">{meter.pf}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-muted-foreground">Start KWH:</span>
                      <span className="text-primary font-medium">{formatKWH(meter.startKWH)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-muted-foreground">End KWH:</span>
                      <span className="text-foreground font-medium">{formatKWHWithFallback(meter.endKWH)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-muted-foreground">Consumption:</span>
                      <span className="ml-1 font-medium text-primary">{formatKWH(meter.consumption)} KWH</span>
                    </div>
                  </div>
                </div>
                
                {/* Calculation Details */}
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Calculation Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">{formatKWH(meter.startKWH)}</div>
                      <div className="text-xs text-muted-foreground">Start KWH</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">{formatKWHWithFallback(meter.endKWH)}</div>
                      <div className="text-xs text-muted-foreground">End KWH</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">{formatKWH(meter.consumption)}</div>
                      <div className="text-xs text-muted-foreground">Consumption KWH</div>
                    </div>
                  </div>
                  
                  {meter.remarks && (
                    <div className="mt-4 p-3 bg-card rounded-lg border border-border">
                      <h4 className="text-sm font-semibold text-foreground mb-1">Remarks</h4>
                      <p className="text-muted-foreground text-sm">{meter.remarks}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          />
        </div>

        {/* Mobile Table View */}
        <div className="lg:hidden bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
          <div className="px-4 py-4 border-b border-border bg-muted">
            <h3 className="text-lg font-semibold text-foreground">Meter Readings</h3>
            <p className="text-sm text-muted-foreground mt-1">Total: {filteredMeterReadings.length} records</p>
          </div>
          
          <div className="p-4">
            {filteredMeterReadings.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-foreground">No meter readings</h3>
                <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new meter reading.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMeterReadings.map((meter) => (
                  <div key={meter._id} className="border border-border rounded-lg overflow-hidden">
                    <div 
                      className="bg-card p-3 cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => setExpandedMeter(expandedMeter === meter._id ? null : meter._id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-primary">{meter.meterNumber}</div>
                          <div className="text-sm text-muted-foreground">{new Date(meter.readingDate).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">
                            PF: {meter.pf} • {formatKWH(meter.startKWH)} → {formatKWHWithFallback(meter.endKWH)} • {formatKWH(meter.consumption)} KWH
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <UIButton
                            onClick={(e) => {
                              e.stopPropagation();
                              openMeterModal(meter);
                            }}
                            variant="secondary"
                            size="sm"
                          >
                            <Icon name="edit" className="mr-2 h-4 w-4" />
                            Edit
                          </UIButton>
                          <UIButton
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMeter(meter._id);
                            }}
                            variant="destructive"
                            size="sm"
                          >
                            <Icon name="delete" className="mr-2 h-4 w-4" />
                            Delete
                          </UIButton>
                          <svg 
                            className={`w-4 h-4 text-muted-foreground transition-transform ${
                              expandedMeter === meter._id ? 'rotate-180' : ''
                            }`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {expandedMeter === meter._id && (
                      <div className="bg-muted p-4 border-t border-border">
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">Bill Number:</span>
                            <span className="ml-1 font-medium text-foreground">{meter.billNumber}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Power Factor:</span>
                            <span className="ml-1 font-medium text-foreground">{meter.pf}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Start KWH:</span>
                            <span className="ml-1 font-medium text-primary">{formatKWH(meter.startKWH)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">End KWH:</span>
                            <span className="ml-1 font-medium text-foreground">{formatKWHWithFallback(meter.endKWH)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Consumption:</span>
                            <span className="ml-1 font-medium text-primary">{formatKWH(meter.consumption)} KWH</span>
                          </div>
                        </div>
                        {meter.remarks && (
                          <div className="p-3 bg-card rounded-lg border border-border">
                            <h5 className="text-sm font-semibold text-foreground mb-1">Remarks</h5>
                            <p className="text-muted-foreground text-sm">{meter.remarks}</p>
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

      {/* Meter Modal */}
      <DialogBox
        show={showMeterModal}
        onClose={closeMeterModal}
        title={editingMeter ? 'Edit Meter Reading' : 'Add New Meter Reading'}
        size="2xl"
      >
        <form onSubmit={saveMeter} className="space-y-6" key={editingMeter ? 'edit' : 'add'}>
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Reading Date (Auto-set)"
                name="readingDate"
                type="date"
                value={meterForm.readingDate}
                onChange={handleMeterFormChange}
                required
                icon="calendar"
                placeholder="Automatically set to today"
                readOnly
                className="bg-muted cursor-not-allowed"
              />
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Meter Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <FormSelect
                    name="meterNumber"
                    value={meterForm.meterNumber}
                    onChange={handleMeterFormChange}
                    required
                    options={[
                      { value: '', label: 'Select Meter Number' },
                      ...availableMeterNumbers.map(meter => ({
                        value: meter.meterNumber,
                        label: `${meter.meterNumber} - ${meter.description}`
                      }))
                    ]}
                    className="flex-1"
                  />
                  <UIButton
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowMeterNumberModal(true)}
                  >
                    <Icon name="add" className="h-4 w-4" />
                  </UIButton>
                </div>
              </div>
              <FormInput
                label="Bill Number"
                name="billNumber"
                value={meterForm.billNumber}
                onChange={handleMeterFormChange}
                required
                icon="file-text"
              />
            </div>
          </div>

          {/* Auto-fill Notification - Only show when auto-fill was applied */}
          {(() => {
            const autoFillInfo = checkAutoFillAvailability();
            const hasAutoFilled = meterForm.endKWH > 0 && autoFillInfo.available;
            return hasAutoFilled ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-700 text-sm">
                    ✓ Auto-filled End KWH from next day's start reading ({autoFillInfo.nextDayKWH.toFixed(2)})
                  </span>
                </div>
              </div>
            ) : null;
          })()}

          {/* Meter Readings Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Today's Meter Readings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Power Factor (PF)"
                name="pf"
                type="number"
                step="0.001"
                min="0"
                max="1"
                value={meterForm.pf}
                onChange={handleMeterFormChange}
                required
                icon="zap"
              />
              <FormInput
                label="Start KWH"
                name="startKWH"
                type="number"
                step="0.01"
                value={meterForm.startKWH}
                onChange={handleMeterFormChange}
                required
                icon="gauge"
              />
              <FormInput
                label="End KWH"
                name="endKWH"
                type="number"
                step="0.01"
                value={meterForm.endKWH}
                onChange={handleMeterFormChange}
                icon="gauge"
                placeholder="Leave empty if not available"
              />
              <FormInput
                label="Consumption (KWH)"
                name="consumption"
                type="number"
                value={meterForm.consumption}
                readOnly
                icon="calculator"
              />
            </div>
          </div>



          {/* Additional Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Additional Information</h3>
            <FormInput
              label="Remarks"
              name="remarks"
              value={meterForm.remarks}
              onChange={handleMeterFormChange}
              icon="note"
            />
            
            {/* File Upload Section */}
            <div className="space-y-2">
              <FileUpload
                label="Upload Meter Bills & Documents"
                module="meter"
                onFilesChange={handleFilesChange}
                files={selectedFiles}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                maxFiles={10}
                maxSize={10}
                showPreview={true}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-border">
            <UIButton type="button" onClick={closeMeterModal} variant="secondary">
              Cancel
            </UIButton>
            <UIButton type="submit">
              {editingMeter ? 'Update Meter Reading' : 'Create Meter Reading'}
            </UIButton>
          </div>
        </form>
      </DialogBox>

      {/* Meter Number Modal */}
      <DialogBox
        show={showMeterNumberModal}
        onClose={closeMeterNumberModal}
        title="Add New Meter Number"
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); saveMeterNumber(); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Meter Number"
              name="meterNumber"
              value={meterNumberForm.meterNumber}
              onChange={handleMeterNumberFormChange}
              required
              icon="hash"
              placeholder="e.g., EB001"
            />
            <FormInput
              label="Description"
              name="description"
              value={meterNumberForm.description}
              onChange={handleMeterNumberFormChange}
              icon="info"
              placeholder="e.g., Main Building"
            />
            <FormSelect
              label="Status"
              name="status"
              value={meterNumberForm.status}
              onChange={handleMeterNumberFormChange}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'maintenance', label: 'Under Maintenance' }
              ]}
            />
            <FormInput
              label="Installation Date"
              name="installationDate"
              type="date"
              value={meterNumberForm.installationDate || new Date().toISOString().split('T')[0]}
              onChange={handleMeterNumberFormChange}
              icon="calendar"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-border">
            <UIButton type="button" onClick={closeMeterNumberModal} variant="secondary">
              Cancel
            </UIButton>
            <UIButton type="submit">
              Create Meter Number
            </UIButton>
          </div>
        </form>
      </DialogBox>
    </div>
  );
};

export default EBMeterCalculation; 