import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import TableFilters from '../components/common/TableFilters';
import BranchFilter from '../components/common/BranchFilter';
import TableList from '../components/common/TableList';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ResponsiveFilters from '../components/common/ResponsiveFilters';
import FormInput from '../components/common/FormInput';
import FormSelect from '../components/common/FormSelect';
import DialogBox from '../components/common/DialogBox';

const SalesDispatch = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [salesFilter, setSalesFilter] = useState('');
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [expandedSale, setExpandedSale] = useState(null);
  const { currentBranchId } = useSelector((state) => state.branch);

  const initialSalesForm = {
    orderNumber: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    riceVariety: '',
    quantity: 0,
    unitPrice: 0,
    totalAmount: 0,
    orderDate: '',
    deliveryDate: '',
    paymentStatus: 'pending',
    deliveryStatus: 'pending',
    paymentMethod: 'cash',
    notes: ''
  };

  const [salesForm, setSalesForm] = useState(initialSalesForm);

  useEffect(() => {
    fetchSalesData();
  }, [currentBranchId]);

  const fetchSalesData = async () => {
    setLoading(true);
    setError('');
    try {
      // Simulate API call - replace with actual service
      const mockSales = [
        {
          _id: '1',
          orderNumber: 'ORD-001',
          customerName: 'ABC Traders',
          customerPhone: '+91 9876543210',
          customerAddress: '123 Main St, City',
          riceVariety: 'Basmati',
          quantity: 500,
          unitPrice: 120,
          totalAmount: 60000,
          orderDate: '2024-01-15',
          deliveryDate: '2024-01-20',
          paymentStatus: 'completed',
          deliveryStatus: 'delivered',
          paymentMethod: 'bank_transfer',
          notes: 'Premium quality rice',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T15:30:00Z'
        },
        {
          _id: '2',
          orderNumber: 'ORD-002',
          customerName: 'XYZ Foods',
          customerPhone: '+91 8765432109',
          customerAddress: '456 Market Rd, Town',
          riceVariety: 'Sona Masoori',
          quantity: 300,
          unitPrice: 85,
          totalAmount: 25500,
          orderDate: '2024-01-16',
          deliveryDate: '2024-01-22',
          paymentStatus: 'pending',
          deliveryStatus: 'in_transit',
          paymentMethod: 'cash',
          notes: 'Regular order',
          createdAt: '2024-01-16T11:00:00Z',
          updatedAt: '2024-01-18T09:15:00Z'
        }
      ];
      setSales(mockSales);
    } catch (err) {
      setError(err.message || 'Failed to fetch sales data');
    } finally {
      setLoading(false);
    }
  };

  const openSalesModal = (sale = null) => {
  
    setEditingSale(sale);
    if (sale) {
      // Format dates for HTML date inputs (YYYY-MM-DD)
      const formattedOrderDate = new Date(sale.orderDate).toISOString().split('T')[0];
      const formattedDeliveryDate = new Date(sale.deliveryDate).toISOString().split('T')[0];
      const formData = {
        ...initialSalesForm,
        ...sale,
        orderDate: formattedOrderDate,
        deliveryDate: formattedDeliveryDate
      };
      setSalesForm(formData);
    } else {
      setSalesForm(initialSalesForm);
    }
    setShowSalesModal(true);
  };

  const closeSalesModal = () => {
    setShowSalesModal(false);
    setEditingSale(null);
    setSalesForm(initialSalesForm);
  };

  const handleSalesFormChange = (e) => {
    const { name, value } = e.target;
    setSalesForm(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-calculate total amount
      if (name === 'quantity' || name === 'unitPrice') {
        updated.totalAmount = updated.quantity * updated.unitPrice;
      }
      return updated;
    });
  };

  const saveSales = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Simulate API call - replace with actual service
      if (editingSale) {
        // Update existing sale
        setSales(prev => prev.map(sale => 
          sale._id === editingSale._id ? { ...salesForm, _id: sale._id } : sale
        ));
      } else {
        // Create new sale
        const newSale = {
          ...salesForm,
          _id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setSales(prev => [newSale, ...prev]);
      }
      closeSalesModal();
    } catch (error) {
      setError('Error saving sales record: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSales = async (saleId) => {
    if (window.confirm('Are you sure you want to delete this sales record?')) {
      try {
        setLoading(true);
        // Simulate API call - replace with actual service
        setSales(prev => prev.filter(sale => sale._id !== saleId));
      } catch (error) {
        setError('Error deleting sales record: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'in_transit':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash': return '💵';
      case 'bank_transfer': return '🏦';
      case 'cheque': return '📄';
      case 'upi': return '📱';
      default: return '💰';
    }
  };

  // Define columns for the table
  const columns = [
    { 
      key: "orderNumber", 
      label: "Order #",
      renderCell: (value) => <span className="font-semibold text-blue-600">{value}</span>
    },
    { key: "customerName", label: "Customer" },
    { 
      key: "riceVariety", 
      label: "Rice Variety",
      renderCell: (value) => <span className="text-green-600 font-medium">{value}</span>
    },
    { 
      key: "quantity", 
      label: "Quantity (kg)",
      renderCell: (value) => <span className="font-semibold text-indigo-600">{value.toLocaleString()}</span>
    },
    { 
      key: "totalAmount", 
      label: "Total Amount",
      renderCell: (value) => <span className="font-semibold text-green-600">₹{value.toLocaleString()}</span>
    },
    { 
      key: "paymentStatus", 
      label: "Payment",
      renderCell: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value.replace('_', ' ')}
        </span>
      )
    },
    { 
      key: "deliveryStatus", 
      label: "Delivery",
      renderCell: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value.replace('_', ' ')}
        </span>
      )
    }
  ];

  const filteredSales = sales.filter(sale => {
    const q = salesFilter.toLowerCase();
    return (
      sale.orderNumber?.toLowerCase().includes(q) ||
      sale.customerName?.toLowerCase().includes(q) ||
      sale.riceVariety?.toLowerCase().includes(q) ||
      sale.paymentStatus?.toLowerCase().includes(q) ||
      sale.deliveryStatus?.toLowerCase().includes(q)
    );
  });

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-6 sm:px-6">
        <div className="flex flex-col space-y-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Sales & Dispatch
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage rice sales, orders, and delivery tracking</p>
          </div>
          <div className="flex justify-center sm:justify-start space-x-2">
            <Button
              onClick={() => openSalesModal()}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              🛒 Add New Sale
            </Button>
            {sales.length > 0 && (
              <Button
                onClick={() => {
                  openSalesModal(sales[0]);
                }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                🧪 Test Edit
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 text-lg">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-xl font-bold text-gray-900">{sales.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-green-600 text-lg">💰</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold text-gray-900">₹{sales.reduce((sum, sale) => sum + sale.totalAmount, 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-yellow-600 text-lg">📦</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Delivery</p>
                <p className="text-xl font-bold text-gray-900">{sales.filter(sale => sale.deliveryStatus === 'pending').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-purple-600 text-lg">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-bold text-gray-900">{sales.filter(sale => sale.deliveryStatus === 'delivered').length}</p>
              </div>
            </div>
          </div>
        </div>

        <ResponsiveFilters title="Filters & Search" className="mb-6">
          <TableFilters
            searchValue={salesFilter}
            searchPlaceholder="Search by order number, customer, variety..."
            onSearchChange={(e) => setSalesFilter(e.target.value)}
            showSelect={false}
          />
          <BranchFilter
            value={currentBranchId || ''}
            onChange={(value) => {
              console.log('Branch changed in Sales:', value);
            }}
          />
        </ResponsiveFilters>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Sales Records</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {filteredSales.length} records</p>
          </div>
          <TableList
            data={filteredSales}
            columns={columns}
            actions={(sale) => [
              <Button
                key="edit"
                onClick={() => openSalesModal(sale)}
                variant="info"
                icon="edit"
                className="text-xs px-2 py-1"
              >
                Edit
              </Button>,
              <Button
                key="delete"
                onClick={() => deleteSales(sale._id)}
                variant="danger"
                icon="delete"
                className="text-xs px-2 py-1"
              >
                Delete
              </Button>
            ]}
            renderDetail={(sale) => (
              <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 border-l-4 border-green-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Order #:</span>
                      <span className="text-gray-900 font-medium">{sale.orderNumber}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Customer:</span>
                      <span className="text-gray-900 font-medium">{sale.customerName}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Phone:</span>
                      <span className="text-gray-900 font-medium">{sale.customerPhone}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Address:</span>
                      <span className="text-gray-900 font-medium">{sale.customerAddress}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Rice Variety:</span>
                      <span className="text-green-600 font-medium">{sale.riceVariety}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Quantity:</span>
                      <span className="text-gray-900 font-medium">{sale.quantity} kg</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Unit Price:</span>
                      <span className="text-gray-900 font-medium">₹{sale.unitPrice}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Total:</span>
                      <span className="text-green-600 font-bold">₹{sale.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <span className="w-20 text-sm font-medium text-gray-600">Order Date:</span>
                      <span className="text-gray-900">{new Date(sale.orderDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 text-sm font-medium text-gray-600">Delivery Date:</span>
                      <span className="text-gray-900">{new Date(sale.deliveryDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 text-sm font-medium text-gray-600">Payment:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.paymentStatus)}`}>
                        {sale.paymentStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  {sale.notes && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-1">Notes</h4>
                      <p className="text-gray-700 text-sm">{sale.notes}</p>
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
            <h3 className="text-lg font-semibold text-gray-800">Sales Records</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {filteredSales.length} records</p>
          </div>
          
          <div className="p-4">
            {filteredSales.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No sales records</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new sales record.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSales.map((sale) => (
                  <div key={sale._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="bg-white p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedSale(expandedSale === sale._id ? null : sale._id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-blue-600">{sale.orderNumber}</div>
                          <div className="text-sm text-gray-600">{sale.customerName}</div>
                          <div className="text-xs text-gray-500">
                            {sale.riceVariety} • {sale.quantity} kg • ₹{sale.totalAmount.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openSalesModal(sale);
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
                              deleteSales(sale._id);
                            }}
                            variant="danger"
                            icon="delete"
                            className="text-xs px-2 py-1"
                          >
                            Delete
                          </Button>
                          <svg 
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              expandedSale === sale._id ? 'rotate-180' : ''
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

                    {expandedSale === sale._id && (
                      <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Customer:</span>
                            <span className="ml-1 font-medium text-gray-900">{sale.customerName}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Phone:</span>
                            <span className="ml-1 font-medium text-gray-900">{sale.customerPhone}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Rice Variety:</span>
                            <span className="ml-1 font-medium text-green-600">{sale.riceVariety}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Quantity:</span>
                            <span className="ml-1 font-medium text-gray-900">{sale.quantity} kg</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="ml-1 font-medium text-green-600">₹{sale.totalAmount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Payment:</span>
                            <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.paymentStatus)}`}>
                              {sale.paymentStatus.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        {sale.notes && (
                          <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <h5 className="text-sm font-semibold text-gray-800 mb-1">Notes</h5>
                            <p className="text-gray-700 text-sm">{sale.notes}</p>
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

      {/* Sales Modal */}
      <DialogBox
        show={showSalesModal}
        onClose={closeSalesModal}
        title={editingSale ? 'Edit Sales Record' : 'Add New Sales Record'}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={saveSales} className="space-y-4" key={editingSale ? 'edit' : 'add'}>
         
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Order Number"
              name="orderNumber"
              value={salesForm.orderNumber || ''}
              onChange={handleSalesFormChange}
              required
              icon="hash"
            />
           
            <FormInput
              label="Customer Name"
              name="customerName"
              value={salesForm.customerName || ''}
              onChange={handleSalesFormChange}
              required
              icon="user"
            />
         
            <FormInput
              label="Customer Phone"
              name="customerPhone"
              value={salesForm.customerPhone}
              onChange={handleSalesFormChange}
              required
              icon="phone"
            />
            <FormInput
              label="Rice Variety"
              name="riceVariety"
              value={salesForm.riceVariety}
              onChange={handleSalesFormChange}
              required
              icon="grain"
            />
            <FormInput
              label="Quantity (kg)"
              name="quantity"
              type="number"
              value={salesForm.quantity}
              onChange={handleSalesFormChange}
              required
              icon="scale"
            />
            <FormInput
              label="Unit Price (₹)"
              name="unitPrice"
              type="number"
              value={salesForm.unitPrice}
              onChange={handleSalesFormChange}
              required
              icon="currency-rupee"
            />
            <FormInput
              label="Total Amount (₹)"
              name="totalAmount"
              type="number"
              value={salesForm.totalAmount}
              readOnly
              icon="calculator"
            />
            <FormInput
              label="Order Date"
              name="orderDate"
              type="date"
              value={salesForm.orderDate}
              onChange={handleSalesFormChange}
              required
              icon="calendar"
            />
            <FormInput
              label="Delivery Date"
              name="deliveryDate"
              type="date"
              value={salesForm.deliveryDate}
              onChange={handleSalesFormChange}
              required
              icon="truck"
            />
            <FormSelect
              label="Payment Status"
              name="paymentStatus"
              value={salesForm.paymentStatus}
              onChange={handleSalesFormChange}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
              icon="credit-card"
            />
            <FormSelect
              label="Delivery Status"
              name="deliveryStatus"
              value={salesForm.deliveryStatus}
              onChange={handleSalesFormChange}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'in_transit', label: 'In Transit' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
              icon="truck"
            />
            <FormSelect
              label="Payment Method"
              name="paymentMethod"
              value={salesForm.paymentMethod}
              onChange={handleSalesFormChange}
              options={[
                { value: 'cash', label: 'Cash' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'cheque', label: 'Cheque' },
                { value: 'upi', label: 'UPI' }
              ]}
              icon="wallet"
            />
          </div>
          <FormInput
            label="Customer Address"
            name="customerAddress"
            value={salesForm.customerAddress}
            onChange={handleSalesFormChange}
            required
            icon="map-pin"
          />
          <FormInput
            label="Notes"
            name="notes"
            value={salesForm.notes}
            onChange={handleSalesFormChange}
            icon="note"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeSalesModal();
              }} 
              variant="secondary"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingSale ? 'Update Sale' : 'Create Sale'}
            </Button>
          </div>
        </form>
      </DialogBox>
    </div>
  );
};

export default SalesDispatch; 