import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import inventoryService from '../services/inventoryService';
import TableFilters from '../components/common/TableFilters';
import BranchFilter from '../components/common/BranchFilter';
import TableList from '../components/common/TableList';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ResponsiveFilters from '../components/common/ResponsiveFilters';
import DialogBox from '../components/common/DialogBox';
import FormInput from '../components/common/FormInput';
import FileUpload from '../components/common/FileUpload';
import FileDisplay from '../components/common/FileDisplay';
import DateRangeFilter from '../components/common/DateRangeFilter';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [expandedInventory, setExpandedInventory] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [editingInventory, setEditingInventory] = useState(null);
  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    quantity: '',
    description: '',
    branch_id: ''
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
    setError('');
    try {
      const res = await inventoryService.getAllInventory(currentBranchId);
      console.log('=== FETCH INVENTORY DEBUG ===');
      console.log('API Response:', res);
      console.log('Inventory items:', res.items);
      if (res.items && res.items.length > 0) {
        res.items.forEach((item, index) => {
          console.log(`Item ${index}:`, item);
          console.log(`Item ${index} files:`, item.files);
        });
      }
      setInventory(res.items || []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  // Modal functions
  const openInventoryModal = (item = null) => {
    setEditingInventory(item);
    setInventoryForm(
      item
        ? { name: item.name, quantity: item.quantity, description: item.description, branch_id: item.branch_id }
        : { name: '', quantity: '', description: '', branch_id: currentBranchId }
    );
    setShowInventoryModal(true);
  };

  const closeInventoryModal = () => {
    setShowInventoryModal(false);
    setEditingInventory(null);
    setInventoryForm({ name: '', quantity: '', description: '', branch_id: '' });
  };

  const handleInventoryFormChange = (e) => {
    setInventoryForm({ ...inventoryForm, [e.target.name]: e.target.value });
  };

  const handleFilesChange = (files) => {
    setSelectedFiles(files);
  };

  const handleFileUploadSuccess = (uploadedFiles) => {
    console.log('Files uploaded successfully:', uploadedFiles);
    setUploadedFiles(uploadedFiles);
    setSelectedFiles([]); // Clear selected files after upload
  };

  const saveInventory = async (e) => {
    e.preventDefault();
    console.log('=== SAVE INVENTORY DEBUG ===');
    console.log('Form data:', inventoryForm);
    console.log('Current branch ID:', currentBranchId);
    console.log('Editing inventory:', editingInventory);
    console.log('Selected files:', selectedFiles);
    console.log('Uploaded files:', uploadedFiles);
    
    setLoading(true);
    try {
      // If there are selected files but no uploaded files, upload them first
      if (selectedFiles.length > 0 && uploadedFiles.length === 0) {
        console.log('Files need to be uploaded first. Please upload files before saving.');
        setError('Please upload files before saving inventory. Click the "Upload Files" button first.');
        setLoading(false);
        return;
      }
      
      // Ensure branch_id is set for new inventory
      const formData = {
        ...inventoryForm,
        branch_id: editingInventory ? inventoryForm.branch_id : currentBranchId,
        files: uploadedFiles // Include uploaded file references
      };
      
      console.log('Final form data to send:', formData);
      
      if (editingInventory) {
        console.log('Updating inventory with ID:', editingInventory._id);
        const result = await inventoryService.updateInventory(editingInventory._id, formData);
        console.log('Update result:', result);
      } else {
        console.log('Creating new inventory');
        const result = await inventoryService.createInventory(formData);
        console.log('Create result:', result);
      }
      
      console.log('Operation successful, refreshing inventory...');
      fetchInventory();
      closeInventoryModal();
    } catch (err) {
      console.error('Error saving inventory:', err);
      setError(err.message || 'Failed to save inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInventory = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      setLoading(true);
      try {
        await inventoryService.deleteInventory(itemId);
        fetchInventory();
      } catch (err) {
        setError(err.message || 'Failed to delete inventory');
      } finally {
        setLoading(false);
      }
    }
  };

  // Define columns for the table
  const columns = [
    { key: "name", label: "Name" },
    { key: "quantity", label: "Quantity", render: (quantity) => (
      <span className="font-semibold text-indigo-600">{quantity}</span>
    )},
    { key: "description", label: "Description" },
    { key: "branch_id", label: "Branch", render: (branch) => branch?.name || "N/A" },
    { key: "files", label: "Files", render: (files) => (
      <FileDisplay 
        files={files} 
        title="" 
        showTitle={false}
        className="text-xs"
      />
    )}
  ];

  const filteredInventory = inventory.filter(item => {
    // Text search filter
    // Branch filtering is now handled automatically by the API
    const q = inventoryFilter.toLowerCase();
    const matchesText = !inventoryFilter || (
      item.name?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    );

    // Date range filter
    let matchesDate = true;
    if (dateRange.startDate || dateRange.endDate) {
      const itemDate = new Date(item.createdAt);
      if (dateRange.startDate) {
        matchesDate = matchesDate && itemDate >= new Date(dateRange.startDate);
      }
      if (dateRange.endDate) {
        matchesDate = matchesDate && itemDate <= new Date(dateRange.endDate + 'T23:59:59.999Z');
      }
    }

    return matchesText && matchesDate;
  });

  if (loading) return (
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
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Track and manage rice mill inventory</p>
          </div>
          <div className="flex justify-center sm:justify-end">
            {/* Only show Add button when a specific branch is selected (not "All Branches") */}
            {((user?.isSuperAdmin && currentBranchId && currentBranchId !== 'all') || 
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
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        <ResponsiveFilters title="Filters & Search" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TableFilters
              searchValue={inventoryFilter}
              searchPlaceholder="Search inventory items..."
              onSearchChange={(e) => setInventoryFilter(e.target.value)}
              showSelect={false}
            />
            <BranchFilter
              value={currentBranchId && currentBranchId !== 'all' ? currentBranchId : branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <DateRangeFilter
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onStartDateChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              onEndDateChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              startDateLabel="Created Date From"
              endDateLabel="Created Date To"
            />
          </div>
        </ResponsiveFilters>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Inventory Records</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {filteredInventory.length} records</p>
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
                      <span className="w-24 text-sm font-medium text-gray-600">Name:</span>
                      <span className="text-gray-900 font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Quantity:</span>
                      <span className="text-gray-900 font-medium text-indigo-600">{item.quantity}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Branch:</span>
                      <span className="text-gray-900 font-medium">{item.branch_id?.name || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">Description</h4>
                      <p className="text-gray-700">{item.description}</p>
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
            <h3 className="text-lg font-semibold text-gray-800">Inventory Records</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {filteredInventory.length} records</p>
          </div>
          
          <div className="p-4">
            {filteredInventory.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory records</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new inventory record.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInventory.map((item) => (
                  <div key={item._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Mobile Table Row */}
                    <div 
                      className="bg-white p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedInventory(expandedInventory === item._id ? null : item._id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-600">{item.description}</div>
                          <div className="text-xs text-gray-500">
                            Quantity: {item.quantity} • {item.branch_id?.name || 'N/A'}
                          </div>
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
                            <span className="ml-1 font-medium text-gray-900">{item.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Quantity:</span>
                            <span className="ml-1 font-medium text-indigo-600">{item.quantity}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Branch:</span>
                            <span className="ml-1 font-medium text-gray-900">{item.branch_id?.name || 'N/A'}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="p-3 bg-white rounded-lg border border-gray-200 w-full">
                          <h5 className="text-sm font-semibold text-gray-800 mb-2">Description</h5>
                          <p className="text-gray-700 text-sm">{item.description}</p>
                        </div>
                        
                        {/* Files */}
                        <div className="p-3 bg-white rounded-lg border border-gray-200 w-full mt-3">
                          <FileDisplay 
                            files={item.files} 
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
          loading={loading}
          size="2xl"
        >
          <form onSubmit={saveInventory} className="space-y-6">
            <FormInput
              label="Name"
              name="name"
              value={inventoryForm.name}
              onChange={handleInventoryFormChange}
              required
              icon="inventory"
            />
            <FormInput
              label="Quantity"
              name="quantity"
              type="number"
              value={inventoryForm.quantity}
              onChange={handleInventoryFormChange}
              required
              icon="weight"
            />
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
                <h4 className="text-sm font-medium text-blue-800 mb-2">📁 File Upload Instructions</h4>
                <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Select files using the upload area below</li>
                  <li>Click the "Upload Files" button to upload them to the server</li>
                  <li>Wait for upload confirmation before saving inventory</li>
                  <li>Files will be attached to your inventory record</li>
                </ol>
              </div>
              
              <FileUpload
                label="Upload Inventory Documents & Images"
                module="inventory"
                onFilesChange={handleFilesChange}
                onUploadSuccess={handleFileUploadSuccess}
                files={selectedFiles} // Only show selected files for now
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
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </span>
                ) : (
                  editingInventory ? "Update Inventory" : "Add Inventory"
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