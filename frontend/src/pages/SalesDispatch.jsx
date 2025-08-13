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
import FileUpload from '../components/common/FileUpload';
import DateRangeFilter from '../components/common/DateRangeFilter';
import InvoiceTemplate from '../components/common/InvoiceTemplate';
import PreviewInvoice from '../components/common/PreviewInvoice';
import { formatDate, formatCurrency } from '../utils/calculations';

const SalesDispatch = () => {
  const [sales, setSales] = useState([]);
  const [byproducts, setByproducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [salesFilter, setSalesFilter] = useState('');
  const [byproductsFilter, setByproductsFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [activeTab, setActiveTab] = useState('rice'); // 'rice' or 'byproducts'
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showByproductsModal, setShowByproductsModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [editingByproduct, setEditingByproduct] = useState(null);
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState(null);
  const [expandedSale, setExpandedSale] = useState(null);
  const [expandedByproduct, setExpandedByproduct] = useState(null);
  const { currentBranchId } = useSelector((state) => state.branch);
  const { user } = useSelector((state) => state.auth);

  const initialSalesForm = {
    orderNumber: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    customerGstin: '',
    customerPan: '',
    riceVariety: '',
    quantity: 0,
    unitPrice: 0,
    totalAmount: 0,
    orderDate: '',
    deliveryDate: '',
    paymentStatus: 'pending',
    deliveryStatus: 'pending',
    paymentMethod: 'cash',
    notes: '',
    placeOfSupply: ''
  };

  const initialByproductForm = {
    date: new Date().toISOString().split('T')[0],
    vehicleNumber: '',
    material: '',
    weight: '',
    unit: 'kg',
    rate: '',
    totalAmount: 0,
    vendorName: '',
    vendorPhone: '',
    vendorEmail: '',
    vendorAddress: '',
    vendorGstin: '',
    vendorPan: '',
    paymentMethod: 'Cash',
    paymentStatus: 'Pending',
    notes: '',
    invoiceNumber: '',
    invoiceGenerated: false,
    branch_id: currentBranchId,
    createdBy: user?.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const initialInvoiceForm = {
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
    customerGstin: '',
    customerPan: '',
    customerEmail: '',
    placeOfSupply: '',
    reverseCharge: 'No',
    hsnCode: '',
    igstRate: 0,
    igstAmount: 0,
    cgstRate: 0,
    cgstAmount: 0,
    sgstRate: 0,
    sgstAmount: 0,
    totalTaxable: 0,
    totalTax: 0,
    discount: 0,
    grandTotal: 0,
    amountInWords: '',
    termsConditions: '',
    paymentTerms: '',
    bankDetails: '',
    eInvoiceFile: null
  };

  const [salesForm, setSalesForm] = useState(initialSalesForm);
  const [byproductForm, setByproductForm] = useState(initialByproductForm);
  const [invoiceForm, setInvoiceForm] = useState(initialInvoiceForm);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showInvoicePreviewModal, setShowInvoicePreviewModal] = useState(false);
  const [previewInvoiceData, setPreviewInvoiceData] = useState(null);

  // Byproducts constants
  const BYPRODUCT_TYPES = ['Husk', 'Broken Rice', 'Brown Rice', 'Bran', 'Rice Flour', 'Rice Starch', 'Rice Bran Oil', 'Other'];
  const UNITS = ['kg', 'tons', 'bags', 'quintals'];
  const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'Credit'];
  const PAYMENT_STATUS = ['Pending', 'Partial', 'Completed', 'Overdue'];

  useEffect(() => {
    fetchSalesData();
    fetchByproductsData();
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
          customerEmail: 'abc@example.com',
          customerAddress: '123 Main St, City',
          customerGstin: '22AAAAA0000A1Z5',
          customerPan: 'ABCD1234EFGH',
          placeOfSupply: 'Maharashtra',
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
          invoiceNumber: 'INV-20240115-001',
          invoiceGenerated: true,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T15:30:00Z'
        },
        {
          _id: '2',
          orderNumber: 'ORD-002',
          customerName: 'XYZ Foods',
          customerPhone: '+91 8765432109',
          customerEmail: 'xyz@example.com',
          customerAddress: '456 Market Rd, Town',
          customerGstin: '33BBBBB0000B2Z6',
          customerPan: 'EFGH5678IJKL',
          placeOfSupply: 'Karnataka',
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
          invoiceNumber: null,
          invoiceGenerated: false,
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

  const fetchByproductsData = async () => {
    try {
      // Simulate API call - replace with actual service
      const mockByproducts = [
        {
          _id: '1',
          date: '2024-01-15',
          vehicleNumber: 'TN-20-BU-4006',
          material: 'Husk',
          weight: 5000,
          unit: 'kg',
          rate: 2.5,
          totalAmount: 12500,
          vendorName: 'ABC Traders',
          vendorPhone: '+91 9876543210',
          vendorEmail: 'abc@example.com',
          vendorAddress: '123 Main St, Chennai',
          vendorGstin: '33AAAAA0000A1Z5',
          vendorPan: 'ABCD1234EFGH',
          paymentMethod: 'Cash',
          paymentStatus: 'Completed',
          notes: 'Monthly husk supply',
          invoiceNumber: 'INV-BP-20240115-001',
          invoiceGenerated: true,
          branch_id: 'branch1',
          createdBy: 'user1',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          _id: '2',
          date: '2024-01-16',
          vehicleNumber: 'TN-21-CD-5678',
          material: 'Broken Rice',
          weight: 2000,
          unit: 'kg',
          rate: 35,
          totalAmount: 70000,
          vendorName: 'XYZ Foods',
          vendorPhone: '+91 8765432109',
          vendorEmail: 'xyz@example.com',
          vendorAddress: '456 Market Rd, Madurai',
          vendorGstin: '33BBBBB0000B2Z6',
          vendorPan: 'EFGH5678IJKL',
          paymentMethod: 'Bank Transfer',
          paymentStatus: 'Pending',
          notes: 'Premium broken rice for animal feed',
          invoiceNumber: null,
          invoiceGenerated: false,
          branch_id: 'branch1',
          createdBy: 'user1',
          createdAt: '2024-01-16T11:00Z',
          updatedAt: '2024-01-16T11:00Z'
        }
      ];
      setByproducts(mockByproducts);
    } catch (err) {
      setError(err.message || 'Failed to fetch byproducts data');
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

  const openByproductsModal = (byproduct = null) => {
    setEditingByproduct(byproduct);
    if (byproduct) {
      const formData = {
        ...initialByproductForm,
        ...byproduct
      };
      setByproductForm(formData);
    } else {
      setByproductForm(initialByproductForm);
    }
    setShowByproductsModal(true);
  };

  const closeSalesModal = () => {
    setShowSalesModal(false);
    setEditingSale(null);
    setSalesForm(initialSalesForm);
  };

  const closeByproductsModal = () => {
    setShowByproductsModal(false);
    setEditingByproduct(null);
    setByproductForm(initialByproductForm);
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

  const handleByproductFormChange = (e) => {
    const { name, value } = e.target;
    setByproductForm(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-calculate total amount
      if (name === 'weight' || name === 'rate') {
        updated.totalAmount = updated.weight * updated.rate;
      }
      return updated;
    });
  };

  const handleFilesChange = (files) => {
    setSelectedFiles(files);
  };

  const handleUploadSuccess = (uploadedFiles) => {
    setUploadedFiles(prev => [...prev, ...uploadedFiles]);
  };

  const openPreview = (file) => {
    setPreviewFile(file);
    setShowPreviewModal(true);
  };

  const closePreview = () => {
    setPreviewFile(null);
    setShowPreviewModal(false);
  };

  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' and ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
    return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
  };

  const previewInvoice = (sale) => {
    const invoiceNumber = sale.invoiceNumber || generateInvoiceNumber();
    const taxableAmount = sale.totalAmount;
    const igstAmount = (taxableAmount * 18) / 100;
    const grandTotal = taxableAmount + igstAmount;
    
    setPreviewInvoiceData({
      ...sale,
      invoiceNumber,
      taxableAmount,
      igstAmount,
      grandTotal,
      amountInWords: numberToWords(Math.round(grandTotal))
    });
    setShowInvoicePreviewModal(true);
  };

  const closeInvoicePreview = () => {
    setShowInvoicePreviewModal(false);
    setPreviewInvoiceData(null);
  };

  const getFileIcon = (file) => {
    if (file.mimetype?.startsWith('image/')) {
      return '🖼️';
    } else if (file.mimetype?.includes('pdf')) {
      return '📄';
    } else if (file.mimetype?.includes('word') || file.mimetype?.includes('document')) {
      return '📝';
    } else if (file.mimetype?.includes('excel') || file.mimetype?.includes('spreadsheet')) {
      return '📊';
    } else if (file.mimetype?.includes('text')) {
      return '📄';
    } else {
      return '📎';
    }
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

  const saveByproduct = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Simulate API call - replace with actual service
      if (editingByproduct) {
        // Update existing byproduct
        setByproducts(prev => prev.map(byproduct => 
          byproduct._id === editingByproduct._id ? { ...byproductForm, _id: byproduct._id } : byproduct
        ));
      } else {
        // Create new byproduct
        const newByproduct = {
          ...byproductForm,
          _id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setByproducts(prev => [newByproduct, ...prev]);
      }
      closeByproductsModal();
    } catch (error) {
      setError('Error saving byproduct record: ' + error.message);
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

  const deleteByproduct = async (byproductId) => {
    if (window.confirm('Are you sure you want to delete this byproduct record?')) {
      try {
        setLoading(true);
        // Simulate API call - replace with actual service
        setByproducts(prev => prev.filter(byproduct => byproduct._id !== byproductId));
      } catch (error) {
        setError('Error deleting byproduct record: ' + error.message);
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
      default: return '';
    }
  };

  // Invoice Generation Functions

  const calculateInvoiceTotals = (sale, invoiceData) => {
    const taxableAmount = sale.totalAmount;
    const igstAmount = (taxableAmount * invoiceData.igstRate) / 100;
    const cgstAmount = (taxableAmount * invoiceData.cgstRate) / 100;
    const sgstAmount = (taxableAmount * invoiceData.sgstRate) / 100;
    const totalTax = igstAmount + cgstAmount + sgstAmount;
    const discount = parseFloat(invoiceData.discount) || 0;
    const grandTotal = taxableAmount + totalTax - discount;
    
    return {
      totalTaxable: taxableAmount,
      totalTax: totalTax,
      grandTotal: grandTotal,
      amountInWords: numberToWords(Math.round(grandTotal)) + ' Rupees Only'
    };
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
  };

  const generateByproductInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-BP-${year}${month}${day}-${random}`;
  };

  const openInvoiceModal = (sale) => {
    setSelectedSaleForInvoice(sale);
    setShowInvoiceGenerator(true);
  };

  const openByproductInvoiceModal = (byproduct) => {
    setSelectedSaleForInvoice(byproduct);
    setShowInvoiceGenerator(true);
  };

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setSelectedSaleForInvoice(null);
    setInvoiceForm(initialInvoiceForm);
  };

  const closeInvoiceGenerator = () => {
    setShowInvoiceGenerator(false);
    setSelectedSaleForInvoice(null);
  };

    const handleGenerateInvoice = (invoiceData) => {
    try {
      setLoading(true);
      
      // Check the type from the invoice data
      if (invoiceData.type === 'byproduct') {
        // It's a byproduct
        setByproducts(prev => prev.map(byproduct => 
          byproduct._id === selectedSaleForInvoice._id 
            ? { ...byproduct, invoiceNumber: invoiceData.invoiceNumber, invoiceGenerated: true }
            : byproduct
        ));
        alert('Byproduct invoice generated successfully!');
      } else {
        // It's a rice sale
        setSales(prev => prev.map(sale => 
          sale._id === selectedSaleForInvoice._id 
            ? { ...sale, invoiceNumber: invoiceData.invoiceNumber, invoiceGenerated: true }
            : sale
        ));
        alert('Rice sale invoice generated successfully!');
      }

      closeInvoiceGenerator();
      
    } catch (error) {
      setError('Error generating invoice: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceFormChange = (e) => {
    const { name, value } = e.target;
    setInvoiceForm(prev => {
      const updated = { ...prev, [name]: value };
      
      // Recalculate totals when tax rates change
      if (['igstRate', 'cgstRate', 'sgstRate'].includes(name) && selectedSaleForInvoice) {
        const totals = calculateInvoiceTotals(selectedSaleForInvoice, updated);
        return { ...updated, ...totals };
      }
      
      return updated;
    });
  };

  const generateInvoice = async () => {
    try {
      setLoading(true);
      
      // Create invoice data
      const invoiceData = {
        ...invoiceForm,
        saleId: selectedSaleForInvoice._id,
        customerName: selectedSaleForInvoice.customerName,
        customerAddress: selectedSaleForInvoice.customerAddress,
        customerPhone: selectedSaleForInvoice.customerPhone,
        riceVariety: selectedSaleForInvoice.riceVariety,
        quantity: selectedSaleForInvoice.quantity,
        unitPrice: selectedSaleForInvoice.unitPrice,
        generatedAt: new Date().toISOString()
      };

      // Simulate API call - replace with actual service
      console.log('Generating invoice:', invoiceData);
      
      // Check if it's a byproduct or rice sale based on the presence of material field
      if (selectedSaleForInvoice.material) {
        // It's a byproduct
        setByproducts(prev => prev.map(byproduct => 
          byproduct._id === selectedSaleForInvoice._id 
            ? { ...byproduct, invoiceNumber: invoiceForm.invoiceNumber, invoiceGenerated: true }
            : byproduct
        ));
        alert('Byproduct invoice generated successfully!');
      } else {
        // It's a rice sale
        setSales(prev => prev.map(sale => 
          sale._id === selectedSaleForInvoice._id 
            ? { ...sale, invoiceNumber: invoiceForm.invoiceNumber, invoiceGenerated: true }
            : sale
        ));
        alert('Rice sale invoice generated successfully!');
      }

      closeInvoiceModal();
      
    } catch (error) {
      setError('Error generating invoice: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateByproductInvoice = async () => {
    try {
      setLoading(true);
      
      // Create invoice data for byproduct
      const invoiceData = {
        ...invoiceForm,
        byproductId: selectedSaleForInvoice._id,
        vendorName: selectedSaleForInvoice.vendorName,
        vendorAddress: selectedSaleForInvoice.vendorAddress,
        vendorPhone: selectedSaleForInvoice.vendorPhone,
        material: selectedSaleForInvoice.material,
        weight: selectedSaleForInvoice.weight,
        unit: selectedSaleForInvoice.unit,
        rate: selectedSaleForInvoice.rate,
        totalAmount: selectedSaleForInvoice.totalAmount,
        generatedAt: new Date().toISOString()
      };

      // Simulate API call - replace with actual service
      console.log('Generating byproduct invoice:', invoiceData);
      
      // Update byproduct with invoice information
      setByproducts(prev => prev.map(byproduct => 
        byproduct._id === selectedSaleForInvoice._id 
          ? { ...byproduct, invoiceNumber: invoiceForm.invoiceNumber, invoiceGenerated: true }
          : byproduct
      ));

      closeInvoiceModal();
      
      // Show success message
      alert('Byproduct invoice generated successfully!');
      
    } catch (error) {
      setError('Error generating byproduct invoice: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (sale) => {
    try {
      setLoading(true);
      
      // Dynamically import PDF libraries
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);
      
      // Create a temporary div for the invoice content
      const invoiceDiv = document.createElement('div');
      invoiceDiv.style.width = '800px';
      invoiceDiv.style.padding = '40px';
      invoiceDiv.style.backgroundColor = 'white';
      invoiceDiv.style.fontFamily = 'Arial, sans-serif';
      invoiceDiv.style.position = 'absolute';
      invoiceDiv.style.left = '-9999px';
      invoiceDiv.style.top = '0';
      
      // Generate invoice number if not exists
      const invoiceNumber = sale.invoiceNumber || generateInvoiceNumber();
      
      // Calculate tax amounts (assuming 18% IGST for inter-state)
      const taxableAmount = sale.totalAmount;
      const igstAmount = (taxableAmount * 18) / 100;
      const grandTotal = taxableAmount + igstAmount;
      
      // Get current date for invoice
      const currentDate = new Date().toLocaleDateString();
      
      invoiceDiv.innerHTML = `
        <div style="border: 2px solid #333; padding: 20px; min-height: 1000px; font-family: Arial, sans-serif;">
          <!-- Header -->
          <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0; color: #333; font-size: 24px; font-weight: bold;">SREE ESWAR HI-TECH MODERN RICE MILL</h1>
            <p style="margin: 5px 0; color: #666; font-size: 12px;">99, REDHILLS MAIN ROAD, KILANUR VILLAGE, THIRUVALLUR, THIRUVALLUR, Tamil Nadu (33) - 602021</p>
            <p style="margin: 5px 0; color: #666; font-size: 12px;">GSTIN: 33AVLPV6754C3Z8</p>
          </div>
          
          <!-- Invoice Type and Details -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div style="flex: 1;">
              <h2 style="margin: 0; color: #333; font-size: 18px; font-weight: bold;">PURCHASE INVOICE</h2>
            </div>
            <div style="flex: 1; text-align: right;">
              <p style="margin: 2px 0; font-size: 12px;"><strong>Invoice No.:</strong> ${invoiceNumber}</p>
              <p style="margin: 2px 0; font-size: 12px;"><strong>Invoice Date:</strong> ${currentDate}</p>
              <p style="margin: 2px 0; font-size: 12px;"><strong>Reverse Charge:</strong> No</p>
              <p style="margin: 2px 0; font-size: 12px;"><strong>Original For:</strong> RECIPIENT</p>
            </div>
          </div>
          
          <!-- Vendor Details -->
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #333; font-size: 14px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Vendor Detail:</h3>
            <div style="display: flex; justify-content: space-between;">
              <div style="flex: 1;">
                <p style="margin: 3px 0; font-size: 12px;"><strong>M/S:</strong> ${sale.customerName}</p>
                <p style="margin: 3px 0; font-size: 12px; color: #666;">${sale.customerAddress}</p>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Phone:</strong> ${sale.customerPhone}</p>
                ${sale.customerEmail ? `<p style="margin: 3px 0; font-size: 12px;"><strong>Email:</strong> ${sale.customerEmail}</p>` : ''}
                ${sale.customerGstin ? `<p style="margin: 3px 0; font-size: 12px;"><strong>GSTIN:</strong> ${sale.customerGstin}</p>` : ''}
                ${sale.customerPan ? `<p style="margin: 3px 0; font-size: 12px;"><strong>PAN:</strong> ${sale.customerPan}</p>` : ''}
              </div>
              <div style="flex: 1; text-align: right;">
                <p style="margin: 3px 0; font-size: 12px;"><strong>Place of Supply:</strong> ${sale.placeOfSupply || 'Tamil Nadu (33)'}</p>
              </div>
            </div>
          </div>
          
          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #333;">
            <thead>
              <tr style="background-color: #f4f4f4;">
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px; font-weight: bold;">Sr. No.</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: left; font-size: 10px; font-weight: bold;">Name of Product/Service</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px; font-weight: bold;">HSN/SAC</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px; font-weight: bold;">Qty</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: right; font-size: 10px; font-weight: bold;">Rate</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: right; font-size: 10px; font-weight: bold;">Taxable Value</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px; font-weight: bold;">CGST</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px; font-weight: bold;">SGST</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: right; font-size: 10px; font-weight: bold;">Total</th>
              </tr>
              <tr style="background-color: #f4f4f4;">
                <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold;"></th>
                <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold;"></th>
                <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold;"></th>
                <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold;"></th>
                <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold;"></th>
                <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold;"></th>
                <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold;">%</th>
                <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold;">%</th>
                <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold;"></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px;">1</td>
                <td style="border: 1px solid #333; padding: 8px; font-size: 10px;">${sale.riceVariety.toUpperCase()}</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px;">10064000</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px;">${sale.quantity.toFixed(2)}</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: right; font-size: 10px;">${sale.unitPrice.toLocaleString()}.00</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: right; font-size: 10px;">${sale.totalAmount.toLocaleString()}.00</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px;">0</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px;">0</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: right; font-size: 10px;">${sale.totalAmount.toLocaleString()}.00</td>
              </tr>
            </tbody>
            <tfoot>
              <tr style="background-color: #f4f4f4;">
                <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px; font-weight: bold;" colspan="3">Total</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px; font-weight: bold;">${sale.quantity.toFixed(2)}</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px; font-weight: bold;"></td>
                <td style="border: 1px solid #333; padding: 8px; text-align: right; font-size: 10px; font-weight: bold;">${sale.totalAmount.toLocaleString()}.00</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px; font-weight: bold;">0.00</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px; font-weight: bold;">0.00</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: right; font-size: 10px; font-weight: bold;">${sale.totalAmount.toLocaleString()}.00</td>
              </tr>
            </tfoot>
          </table>
          
          <!-- Financial Summary -->
          <div style="display: flex; justify-content: space-between; margin-top: 20px;">
            <div style="flex: 1;">
              <p style="margin: 5px 0; font-size: 12px;"><strong>Total in words:</strong> ${numberToWords(Math.round(grandTotal))} RUPEES ONLY</p>
            </div>
            <div style="flex: 1; text-align: right;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px; text-align: right; font-size: 12px; border-bottom: 1px solid #ccc;"><strong>Taxable Amount:</strong></td>
                  <td style="padding: 4px; text-align: right; font-size: 12px; border-bottom: 1px solid #ccc;">${taxableAmount.toLocaleString()}.00</td>
                </tr>
                <tr>
                  <td style="padding: 4px; text-align: right; font-size: 12px; border-bottom: 1px solid #ccc;"><strong>Add: CGST:</strong></td>
                  <td style="padding: 4px; text-align: right; font-size: 12px; border-bottom: 1px solid #ccc;">0</td>
                </tr>
                <tr>
                  <td style="padding: 4px; text-align: right; font-size: 12px; border-bottom: 1px solid #ccc;"><strong>Add: SGST:</strong></td>
                  <td style="padding: 4px; text-align: right; font-size: 12px; border-bottom: 1px solid #ccc;">0</td>
                </tr>
                <tr>
                  <td style="padding: 4px; text-align: right; font-size: 12px; border-bottom: 1px solid #ccc;"><strong>Total Tax:</strong></td>
                  <td style="padding: 4px; text-align: right; font-size: 12px; border-bottom: 1px solid #ccc;">0.00</td>
                </tr>
                <tr>
                  <td style="padding: 4px; text-align: right; font-size: 12px; border-bottom: 1px solid #ccc;"><strong>Discount:</strong></td>
                  <td style="padding: 4px; text-align: right; font-size: 12px; border-bottom: 1px solid #ccc;">-0.00</td>
                </tr>
                <tr style="background-color: #f4f4f4;">
                  <td style="padding: 8px; text-align: right; font-size: 14px; font-weight: bold;"><strong>Total Amount After Tax:</strong></td>
                  <td style="padding: 8px; text-align: right; font-size: 14px; font-weight: bold;">₹${grandTotal.toLocaleString()}.00</td>
                </tr>
              </table>
              <p style="margin: 5px 0; font-size: 10px; text-align: center;">(E & O.E.)</p>
            </div>
          </div>
          
          <!-- Certification -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>Certification:</strong> Certified that the particulars given above are true and correct.</p>
            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
              <div style="flex: 1;">
                <p style="margin: 5px 0; font-size: 12px;"><strong>For:</strong> SREE ESWAR HI-TECH MODERN RICE MILL</p>
              </div>
              <div style="flex: 1; text-align: right;">
                <p style="margin: 5px 0; font-size: 12px;"><strong>Authorised Signatory</strong></p>
                <div style="width: 150px; height: 50px; border: 1px solid #ccc; margin-left: auto; margin-top: 10px;"></div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Add to document temporarily
      document.body.appendChild(invoiceDiv);
      
      // Convert to canvas
      const canvas = await html2canvas(invoiceDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Remove temporary div
      document.body.removeChild(invoiceDiv);
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Download PDF
      pdf.save(`Invoice-${invoiceNumber}.pdf`);
      
      // Update sale with invoice number if not already set
      if (!sale.invoiceNumber) {
        setSales(prev => prev.map(s => 
          s._id === sale._id 
            ? { ...s, invoiceNumber: invoiceNumber, invoiceGenerated: true }
            : s
        ));
      }
      
      // Show success message
      alert('Invoice generated successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Error generating PDF invoice: ' + error.message);
      
      // Fallback: Generate HTML invoice
      try {
        const invoiceNumber = sale.invoiceNumber || generateInvoiceNumber();
        const taxableAmount = sale.totalAmount;
        const igstAmount = (taxableAmount * 18) / 100;
        const grandTotal = taxableAmount + igstAmount;
        
        const invoiceHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Invoice - ${invoiceNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
              .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
              .customer-info, .invoice-info { flex: 1; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f4f4f4; }
              .totals { text-align: right; margin-top: 20px; }
              .footer { margin-top: 40px; text-align: center; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>SREE ESWAR HI-TECH MODERN RICE MILL</h1>
              <p>Invoice #: ${invoiceNumber}</p>
              <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="invoice-details">
              <div class="customer-info">
                <h3>Customer Details:</h3>
                <p><strong>Name:</strong> ${sale.customerName}</p>
                <p><strong>Address:</strong> ${sale.customerAddress}</p>
                <p><strong>Phone:</strong> ${sale.customerPhone}</p>
              </div>
              <div class="invoice-info">
                <h3>Invoice Details:</h3>
                <p><strong>Order #:</strong> ${sale.orderNumber}</p>
                <p><strong>Due Date:</strong> ${new Date(sale.deliveryDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${sale.riceVariety} Rice</td>
                  <td>${sale.quantity} kg</td>
                  <td>₹${sale.unitPrice}</td>
                  <td>₹${sale.totalAmount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="totals">
              <p><strong>Subtotal:</strong> ₹${sale.totalAmount.toLocaleString()}</p>
              <p><strong>IGST (18%):</strong> ₹${igstAmount.toLocaleString()}</p>
              <p><strong>Total:</strong> ₹${grandTotal.toLocaleString()}</p>
              <p><strong>Amount in Words:</strong> ${numberToWords(Math.round(grandTotal))} Rupees Only</p>
            </div>
            
            <div class="footer">
              <p>Thank you for your business!</p>
              <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>
          </body>
          </html>
        `;

        // Create blob and download HTML
        const blob = new Blob([invoiceHTML], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice-${invoiceNumber}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert('PDF generation failed, but HTML invoice has been downloaded instead.');
        
      } catch (fallbackError) {
        console.error('Fallback HTML generation also failed:', fallbackError);
        setError('Both PDF and HTML generation failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadByproductInvoice = async (byproduct) => {
    try {
      setLoading(true);
      
      // Generate invoice number if not exists
      const invoiceNumber = byproduct.invoiceNumber || generateByproductInvoiceNumber();
      
      // Calculate tax amounts (assuming 18% IGST for inter-state)
      const taxableAmount = byproduct.totalAmount;
      const igstAmount = (taxableAmount * 18) / 100;
      const grandTotal = taxableAmount + igstAmount;
      
      // Get current date for invoice
      const currentDate = new Date().toLocaleDateString();
      
      // Create HTML invoice for download
      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Byproduct Invoice - ${invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .invoice-info { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #333; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            .totals { margin: 20px 0; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SREE ESWAR HI-TECH MODERN RICE MILL</h1>
            <p>99, REDHILLS MAIN ROAD, KILANUR VILLAGE, THIRUVALLUR, THIRUVALLUR, Tamil Nadu (33) - 602021</p>
            <p>GSTIN: 33AVLPV6754C3Z8</p>
          </div>
          
          <div class="invoice-info">
            <h3>Invoice Details:</h3>
            <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
            <p><strong>Date:</strong> ${currentDate}</p>
            <p><strong>Vendor:</strong> ${byproduct.vendorName}</p>
            <p><strong>Phone:</strong> ${byproduct.vendorPhone}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${byproduct.material}</td>
                <td>${byproduct.weight} ${byproduct.unit}</td>
                <td>₹${byproduct.rate}</td>
                <td>₹${byproduct.totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="totals">
            <p><strong>Subtotal:</strong> ₹${byproduct.totalAmount.toLocaleString()}</p>
            <p><strong>IGST (18%):</strong> ₹${igstAmount.toLocaleString()}</p>
            <p><strong>Total:</strong> ₹${grandTotal.toLocaleString()}</p>
            <p><strong>Amount in Words:</strong> ${numberToWords(Math.round(grandTotal))} Rupees Only</p>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `;

      // Create blob and download HTML
      const blob = new Blob([invoiceHTML], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Byproduct-Invoice-${invoiceNumber}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert('Byproduct invoice downloaded successfully!');
      
    } catch (error) {
      setError('Error downloading byproduct invoice: ' + error.message);
    } finally {
      setLoading(false);
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
      key: "invoiceNumber", 
      label: "Invoice #",
      renderCell: (value, sale) => (
        <span className={`font-medium ${value ? 'text-green-600' : 'text-gray-400'}`}>
          {value || 'Not Generated'}
        </span>
      )
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

  // Define columns for byproducts table
  const byproductColumns = [
    { 
      key: "date", 
      label: "Date",
      renderCell: (value) => <span className="font-medium">{formatDate(value)}</span>
    },
    { 
      key: "vehicleNumber", 
      label: "Vehicle No.",
      renderCell: (value) => <span className="font-semibold text-blue-600">{value}</span>
    },
    { 
      key: "material", 
      label: "Material",
      renderCell: (value) => <span className="text-green-600 font-medium">{value}</span>
    },
    { 
      key: "weight", 
      label: "Weight",
      renderCell: (value, record) => <span className="font-semibold text-indigo-600">{value} {record.unit}</span>
    },
    { 
      key: "rate", 
      label: "Rate",
      renderCell: (value) => <span className="font-medium">₹{value}</span>
    },
    { 
      key: "totalAmount", 
      label: "Total Amount",
      renderCell: (value) => <span className="font-semibold text-green-600">{formatCurrency(value)}</span>
    },
    { 
      key: "invoiceNumber", 
      label: "Invoice #",
      renderCell: (value, byproduct) => (
        <span className={`font-medium ${value ? 'text-green-600' : 'text-gray-400'}`}>
          {value || 'Not Generated'}
        </span>
      )
    },
    { 
      key: "vendorName", 
      label: "Vendor",
      renderCell: (value) => <span className="font-medium">{value}</span>
    },
    { 
      key: "paymentStatus", 
      label: "Payment Status",
      renderCell: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Completed' ? 'bg-green-100 text-green-800' :
          value === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          value === 'Partial' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}
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

  const filteredByproducts = byproducts.filter(byproduct => {
    const q = byproductsFilter.toLowerCase();
    return (
      byproduct.vehicleNumber?.toLowerCase().includes(q) ||
      byproduct.material?.toLowerCase().includes(q) ||
      byproduct.vendorName?.toLowerCase().includes(q) ||
      byproduct.paymentStatus?.toLowerCase().includes(q)
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
            {/* Only show Add button when a specific branch is selected (not "All Branches") */}
            {((user?.isSuperAdmin && currentBranchId && currentBranchId !== 'all') || 
              (!user?.isSuperAdmin && user?.branch?.id)) && (
              <Button
                onClick={() => activeTab === 'rice' ? openSalesModal() : openByproductsModal()}
                variant="success"
                className="px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {activeTab === 'rice' ? '🛒 Add New Sale' : '📦 Add New Byproduct Sale'}
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
                <p className="text-sm text-gray-600">
                  {activeTab === 'rice' ? 'Total Orders' : 'Total Sales'}
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {activeTab === 'rice' ? sales.length : byproducts.length}
                </p>
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
                <p className="text-xl font-bold text-gray-900">
                  ₹{activeTab === 'rice' 
                    ? sales.reduce((sum, sale) => sum + sale.totalAmount, 0).toLocaleString()
                    : byproducts.reduce((sum, byproduct) => sum + byproduct.totalAmount, 0).toLocaleString()
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-yellow-600 text-lg">📦</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {activeTab === 'rice' ? 'Pending Delivery' : 'Pending Payment'}
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {activeTab === 'rice' 
                    ? sales.filter(sale => sale.deliveryStatus === 'pending').length
                    : byproducts.filter(byproduct => byproduct.paymentStatus === 'Pending').length
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-purple-600 text-lg">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {activeTab === 'rice' ? 'Completed' : 'Completed'}
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {activeTab === 'rice' 
                    ? sales.filter(sale => sale.deliveryStatus === 'delivered').length
                    : byproducts.filter(byproduct => byproduct.paymentStatus === 'Completed').length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switch */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('rice')}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                activeTab === 'rice'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🍚 Rice Sales
            </button>
            <button
              onClick={() => setActiveTab('byproducts')}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                activeTab === 'byproducts'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📦 Byproducts Sales
            </button>
          </div>
        </div>

        <ResponsiveFilters title="Filters & Search" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TableFilters
              searchValue={activeTab === 'rice' ? salesFilter : byproductsFilter}
              searchPlaceholder={activeTab === 'rice' 
                ? "Search by order number, customer, variety..." 
                : "Search by vehicle number, material, vendor..."
              }
              onSearchChange={(e) => activeTab === 'rice' 
                ? setSalesFilter(e.target.value) 
                : setByproductsFilter(e.target.value)
              }
              showSelect={false}
            />
            <BranchFilter
              value={currentBranchId || ''}
              onChange={(value) => {
                console.log('Branch changed in Sales:', value);
              }}
            />
          </div>
          <div className="mt-4">
            <DateRangeFilter
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onStartDateChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              onEndDateChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              startDateLabel={activeTab === 'rice' ? "Order Date From" : "Sale Date From"}
              endDateLabel={activeTab === 'rice' ? "Order Date To" : "Sale Date To"}
            />
          </div>
        </ResponsiveFilters>

        {/* Desktop Table View */}
        {activeTab === 'rice' && (
          <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Rice Sales Records</h3>
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
              </Button>,
              sale.invoiceNumber ? (
                <>
                  <Button
                    key="preview-invoice"
                    onClick={() => previewInvoice(sale)}
                    variant="secondary"
                    icon="eye"
                    className="text-xs px-2 py-1"
                  >
                    Preview
                  </Button>
                  <Button
                    key="download-invoice"
                    onClick={() => downloadInvoice(sale)}
                    variant="success"
                    icon="download"
                    className="text-xs px-2 py-1"
                  >
                    Download
                  </Button>
                </>
              ) : (
                <Button
                  key="generate-invoice"
                  onClick={() => openInvoiceModal(sale)}
                  variant="primary"
                  icon="document-text"
                  className="text-xs px-2 py-1"
                >
                  Generate Invoice
                </Button>
              )
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
                      <span className="w-24 text-sm font-medium text-gray-600">Email:</span>
                      <span className="text-gray-900 font-medium">{sale.customerEmail}</span>
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
        )}

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
                          {sale.invoiceNumber ? (
                            <>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  previewInvoice(sale);
                                }}
                                variant="secondary"
                                icon="eye"
                                className="text-xs px-2 py-1"
                              >
                                Preview
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadInvoice(sale);
                                }}
                                variant="success"
                                icon="download"
                                className="text-xs px-2 py-1"
                              >
                                Download
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                openInvoiceModal(sale);
                              }}
                              variant="primary"
                              icon="document-text"
                              className="text-xs px-2 py-1"
                            >
                              Generate Invoice
                            </Button>
                          )}
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
                            <span className="text-gray-600">Email:</span>
                            <span className="ml-1 font-medium text-gray-900">{sale.customerEmail}</span>
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

        {/* Byproducts Table View */}
        {activeTab === 'byproducts' && (
          <>
            {/* Desktop Byproducts Table */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">Byproducts Sales Records</h3>
                <p className="text-sm text-gray-600 mt-1">Total: {filteredByproducts.length} records</p>
              </div>
              <TableList
                data={filteredByproducts}
                columns={byproductColumns}
                actions={(byproduct) => [
                  <Button
                    key="edit"
                    onClick={() => openByproductsModal(byproduct)}
                    variant="info"
                    icon="edit"
                    className="text-xs px-2 py-1"
                  >
                    Edit
                  </Button>,
                  <Button
                    key="delete"
                    onClick={() => deleteByproduct(byproduct._id)}
                    variant="danger"
                    icon="delete"
                    className="text-xs px-2 py-1"
                  >
                    Delete
                  </Button>,
                  byproduct.invoiceNumber ? (
                    <>
                      <Button
                        key="download-invoice"
                        onClick={() => downloadByproductInvoice(byproduct)}
                        variant="success"
                        icon="download"
                        className="text-xs px-2 py-1"
                      >
                        Download
                      </Button>
                    </>
                  ) : (
                    <Button
                      key="generate-invoice"
                      onClick={() => openByproductInvoiceModal(byproduct)}
                      variant="primary"
                      icon="document-text"
                      className="text-xs px-2 py-1"
                    >
                      Generate Invoice
                    </Button>
                  )
                ]}
                renderDetail={(byproduct) => (
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-l-4 border-purple-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="w-24 text-sm font-medium text-gray-600">Date:</span>
                          <span className="text-gray-900 font-medium">{formatDate(byproduct.date)}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-24 text-sm font-medium text-gray-600">Vehicle:</span>
                          <span className="text-gray-900 font-medium">{byproduct.vehicleNumber}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-24 text-sm font-medium text-gray-600">Material:</span>
                          <span className="text-green-600 font-medium">{byproduct.material}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-24 text-sm font-medium text-gray-600">Weight:</span>
                          <span className="text-gray-900 font-medium">{byproduct.weight} {byproduct.unit}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-24 text-sm font-medium text-gray-600">Rate:</span>
                          <span className="text-gray-900 font-medium">₹{byproduct.rate}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="w-24 text-sm font-medium text-gray-600">Vendor:</span>
                          <span className="text-gray-900 font-medium">{byproduct.vendorName}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-24 text-sm font-medium text-gray-600">Phone:</span>
                          <span className="text-gray-900 font-medium">{byproduct.vendorPhone}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-24 text-sm font-medium text-gray-600">Email:</span>
                          <span className="text-gray-900 font-medium">{byproduct.vendorEmail}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-24 text-sm font-medium text-gray-600">Payment:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            byproduct.paymentStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                            byproduct.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            byproduct.paymentStatus === 'Partial' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {byproduct.paymentStatus}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-24 text-sm font-medium text-gray-600">Total:</span>
                          <span className="text-green-600 font-medium">{formatCurrency(byproduct.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>

            {/* Mobile Byproducts Table */}
            <div className="lg:hidden bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
              <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">Byproducts Sales Records</h3>
                <p className="text-sm text-gray-600 mt-1">Total: {filteredByproducts.length} records</p>
              </div>
              
              <div className="p-4">
                {filteredByproducts.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No byproduct sales records</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new byproduct sale record.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredByproducts.map((byproduct) => (
                      <div key={byproduct._id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div 
                          className="bg-white p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => setExpandedByproduct(expandedByproduct === byproduct._id ? null : byproduct._id)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="font-medium text-blue-600">{byproduct.vehicleNumber}</div>
                              <div className="text-sm text-gray-600">{byproduct.vendorName}</div>
                              <div className="text-xs text-gray-500">
                                {byproduct.material} • {byproduct.weight} {byproduct.unit} • {formatCurrency(byproduct.totalAmount)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openByproductsModal(byproduct);
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
                                  deleteByproduct(byproduct._id);
                                }}
                                variant="danger"
                                icon="delete"
                                className="text-xs px-2 py-1"
                              >
                                Delete
                              </Button>
                              {byproduct.invoiceNumber ? (
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    downloadByproductInvoice(byproduct);
                                  }}
                                  variant="success"
                                  icon="download"
                                  className="text-xs px-2 py-1"
                                >
                                  Download
                                </Button>
                              ) : (
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openByproductInvoiceModal(byproduct);
                                  }}
                                  variant="primary"
                                  icon="document-text"
                                  className="text-xs px-2 py-1"
                                >
                                  Generate
                                </Button>
                              )}
                              <svg 
                                className={`w-4 h-4 text-gray-400 transition-transform ${
                                  expandedByproduct === byproduct._id ? 'rotate-180' : ''
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

                        {expandedByproduct === byproduct._id && (
                          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                              <div>
                                <span className="text-gray-600">Date:</span>
                                <span className="ml-1 font-medium text-gray-900">{formatDate(byproduct.date)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Material:</span>
                                <span className="ml-1 font-medium text-green-600">{byproduct.material}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Weight:</span>
                                <span className="ml-1 font-medium text-gray-900">{byproduct.weight} {byproduct.unit}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Rate:</span>
                                <span className="ml-1 font-medium text-gray-900">₹{byproduct.rate}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Vendor:</span>
                                <span className="ml-1 font-medium text-gray-900">{byproduct.vendorName}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Phone:</span>
                                <span className="ml-1 font-medium text-gray-900">{byproduct.vendorPhone}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Payment:</span>
                                <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  byproduct.paymentStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                                  byproduct.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                  byproduct.paymentStatus === 'Partial' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {byproduct.paymentStatus}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Total:</span>
                                <span className="ml-1 font-medium text-green-600">{formatCurrency(byproduct.totalAmount)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Invoice:</span>
                                <span className={`ml-1 font-medium ${byproduct.invoiceNumber ? 'text-green-600' : 'text-gray-400'}`}>
                                  {byproduct.invoiceNumber || 'Not Generated'}
                                </span>
                              </div>
                            </div>
                            {byproduct.notes && (
                              <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <h5 className="text-sm font-semibold text-gray-800 mb-1">Notes</h5>
                                <p className="text-gray-700 text-sm">{byproduct.notes}</p>
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
          </>
        )}
      </div>

      {/* Sales Modal */}
      <DialogBox
        show={showSalesModal}
        onClose={closeSalesModal}
        title={editingSale ? 'Edit Sales Record' : 'Add New Sales Record'}
        size="2xl"
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
              label="Customer Email"
              name="customerEmail"
              value={salesForm.customerEmail}
              onChange={handleSalesFormChange}
              icon="envelope"
            />
            <FormInput
              label="Customer GSTIN"
              name="customerGstin"
              value={salesForm.customerGstin}
              onChange={handleSalesFormChange}
              icon="id-card"
            />
            <FormInput
              label="Customer Pan"
              name="customerPan"
              value={salesForm.customerPan}
              onChange={handleSalesFormChange}
              icon="id-card"
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
              label="Place of Supply"
              name="placeOfSupply"
              value={salesForm.placeOfSupply}
              onChange={handleSalesFormChange}
              required
              icon="map-pin"
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
          
          {/* File Upload Section */}
          <FileUpload
            label="Upload Documents & Invoices"
            module="sales"
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
              <h4 className="text-sm font-medium text-gray-700">Existing Documents</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                      {/* File Preview */}
                      <div className="relative mb-2">
                        {file.mimetype?.startsWith('image/') ? (
                          <img
                            src={`http://localhost:3001${file.url}`}
                            alt={file.originalName}
                            className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => openPreview(file)}
                          />
                        ) : (
                          <div 
                            className="w-full h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded border flex flex-col items-center justify-center cursor-pointer hover:bg-gradient-to-br hover:from-blue-100 hover:to-indigo-100 transition-colors"
                            onClick={() => openPreview(file)}
                          >
                            <span className="text-3xl mb-1">{getFileIcon(file)}</span>
                            <span className="text-xs text-gray-600 text-center px-1">
                              {file.originalName?.split('.').pop()?.toUpperCase() || 'FILE'}
                            </span>
                          </div>
                        )}
                        
                        {/* Preview Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-sm font-medium">Click to Preview</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* File Info */}
                      <div className="text-center">
                        <p className="text-xs font-medium text-gray-800 truncate" title={file.originalName}>
                          {file.originalName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openPreview(file)}
                          className="bg-blue-600 text-white p-1 rounded text-xs hover:bg-blue-700 transition-colors"
                          title="Preview"
                        >
                          👁️
                        </button>
                        <a
                          href={`http://localhost:3001${file.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600 text-white p-1 rounded text-xs hover:bg-green-700 transition-colors"
                          title="Download"
                        >
                          ⬇️
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
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

      {/* Invoice Generation Modal */}
      <DialogBox
        show={showInvoiceModal}
        onClose={closeInvoiceModal}
        title="Generate Invoice"
        size="3xl"
      >
        {selectedSaleForInvoice && (
          <div className="space-y-6">
            {/* Sale Information Summary */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Sale Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Order #:</span>
                  <span className="ml-2 font-medium">{selectedSaleForInvoice.orderNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">Customer:</span>
                  <span className="ml-2 font-medium">{selectedSaleForInvoice.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Rice Variety:</span>
                  <span className="ml-2 font-medium text-green-600">{selectedSaleForInvoice.riceVariety}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="ml-2 font-medium text-green-600">₹{selectedSaleForInvoice.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Invoice Details Form */}
            <form onSubmit={(e) => { e.preventDefault(); generateInvoice(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Invoice Number"
                  name="invoiceNumber"
                  value={invoiceForm.invoiceNumber}
                  onChange={handleInvoiceFormChange}
                  required
                  icon="hash"
                />
                <FormInput
                  label="Invoice Date"
                  name="invoiceDate"
                  type="date"
                  value={invoiceForm.invoiceDate}
                  onChange={handleInvoiceFormChange}
                  required
                  icon="calendar"
                />
                <FormInput
                  label="Due Date"
                  name="dueDate"
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={handleInvoiceFormChange}
                  required
                  icon="calendar"
                />
                <FormInput
                  label="Customer GSTIN"
                  name="customerGstin"
                  value={invoiceForm.customerGstin}
                  onChange={handleInvoiceFormChange}
                  icon="id-card"
                />
                <FormInput
                  label="Customer Pan"
                  name="customerPan"
                  value={invoiceForm.customerPan}
                  onChange={handleInvoiceFormChange}
                  icon="id-card"
                />
                <FormInput
                  label="Customer Email"
                  name="customerEmail"
                  value={invoiceForm.customerEmail}
                  onChange={handleInvoiceFormChange}
                  icon="envelope"
                />
                <FormInput
                  label="Place of Supply"
                  name="placeOfSupply"
                  value={invoiceForm.placeOfSupply}
                  onChange={handleInvoiceFormChange}
                  required
                  icon="map-pin"
                />
                <FormInput
                  label="Reverse Charge"
                  name="reverseCharge"
                  value={invoiceForm.reverseCharge}
                  onChange={handleInvoiceFormChange}
                  options={[
                    { value: 'Yes', label: 'Yes' },
                    { value: 'No', label: 'No' }
                  ]}
                  icon="check-circle"
                />
                <FormInput
                  label="HSN Code"
                  name="hsnCode"
                  value={invoiceForm.hsnCode}
                  onChange={handleInvoiceFormChange}
                  required
                  icon="code"
                />
              </div>

              {/* Tax Rates */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Tax Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormInput
                    label="IGST Rate (%)"
                    name="igstRate"
                    type="number"
                    value={invoiceForm.igstRate}
                    onChange={handleInvoiceFormChange}
                    icon="calculator"
                  />
                  <FormInput
                    label="CGST Rate (%)"
                    name="cgstRate"
                    type="number"
                    value={invoiceForm.cgstRate}
                    onChange={handleInvoiceFormChange}
                    icon="calculator"
                  />
                  <FormInput
                    label="SGST Rate (%)"
                    name="sgstRate"
                    type="number"
                    value={invoiceForm.sgstRate}
                    onChange={handleInvoiceFormChange}
                    icon="calculator"
                  />
                  <FormInput
                    label="Discount (₹)"
                    name="discount"
                    type="number"
                    value={invoiceForm.discount}
                    onChange={handleInvoiceFormChange}
                    icon="minus-circle"
                  />
                </div>
              </div>

              {/* Invoice Totals */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-md font-semibold text-green-800 mb-3">Invoice Totals</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Taxable Amount:</span>
                    <span className="ml-2 font-medium">₹{invoiceForm.totalTaxable.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Tax:</span>
                    <span className="ml-2 font-medium">₹{invoiceForm.totalTax.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Grand Total:</span>
                    <span className="ml-2 font-medium text-green-600">₹{invoiceForm.grandTotal.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount in Words:</span>
                    <span className="ml-2 font-medium text-xs">{invoiceForm.amountInWords}</span>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Terms & Conditions"
                  name="termsConditions"
                  value={invoiceForm.termsConditions}
                  onChange={handleInvoiceFormChange}
                  icon="document-text"
                />
                <FormInput
                  label="Payment Terms"
                  name="paymentTerms"
                  value={invoiceForm.paymentTerms}
                  onChange={handleInvoiceFormChange}
                  icon="clock"
                />
              </div>
              <FormInput
                label="Bank Details"
                name="bankDetails"
                value={invoiceForm.bankDetails}
                onChange={handleInvoiceFormChange}
                icon="bank"
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  onClick={closeInvoiceModal}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Generate Invoice
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogBox>

      {/* Invoice Preview Modal */}

        <PreviewInvoice
          invoiceData={previewInvoiceData}
          show={showInvoicePreviewModal}
          onClose={closeInvoicePreview}
          onDownload={downloadInvoice}
          type={previewInvoiceData?.material ? 'byproduct' : 'sale'}
          title="Invoice Preview"
        />

      {/* Byproducts Modal */}
      <DialogBox
        show={showByproductsModal}
        onClose={closeByproductsModal}
        title={editingByproduct ? 'Edit Byproduct Sale' : 'Add New Byproduct Sale'}
        size="2xl"
      >
        <form onSubmit={saveByproduct} className="space-y-6">
          {/* Basic Information */}
          <fieldset className="border border-gray-200 rounded p-4">
            <legend className="text-sm font-semibold text-gray-700 px-2">
              Sale Information
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Date"
                name="date"
                type="date"
                value={byproductForm.date}
                onChange={handleByproductFormChange}
                required
                icon="calendar"
              />
              <FormInput
                label="Vehicle Number"
                name="vehicleNumber"
                value={byproductForm.vehicleNumber}
                onChange={handleByproductFormChange}
                required
                placeholder="e.g., TN-20-BU-4006"
                icon="truck"
              />
              <FormSelect
                label="Material"
                name="material"
                value={byproductForm.material}
                onChange={handleByproductFormChange}
                required
                icon="package"
              >
                <option value="">Select Material</option>
                {BYPRODUCT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </FormSelect>
            </div>
          </fieldset>

          {/* Quantity and Pricing */}
          <fieldset className="border border-gray-200 rounded p-4">
            <legend className="text-sm font-semibold text-gray-700 px-2">
              Quantity & Pricing
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormInput
                label="Weight"
                name="weight"
                type="number"
                value={byproductForm.weight}
                onChange={handleByproductFormChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                icon="scale"
              />
              <FormSelect
                label="Unit"
                name="unit"
                value={byproductForm.unit}
                onChange={handleByproductFormChange}
                required
                icon="ruler"
              >
                <option value="">Select Unit</option>
                {UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </FormSelect>
              <FormInput
                label="Rate per Unit"
                name="rate"
                type="number"
                value={byproductForm.rate}
                onChange={handleByproductFormChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                icon="currency"
              />
              <FormInput
                label="Total Amount"
                name="totalAmount"
                type="number"
                value={byproductForm.totalAmount}
                readOnly
                icon="calculator"
              />
            </div>
          </fieldset>

          {/* Vendor Details */}
          <fieldset className="border border-gray-200 rounded p-4">
            <legend className="text-sm font-semibold text-gray-700 px-2">
              Vendor Details
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Vendor Name"
                name="vendorName"
                value={byproductForm.vendorName}
                onChange={handleByproductFormChange}
                required
                placeholder="Enter vendor name"
                icon="user"
              />
              <FormInput
                label="Vendor Phone"
                name="vendorPhone"
                value={byproductForm.vendorPhone}
                onChange={handleByproductFormChange}
                required
                placeholder="+91 9876543210"
                icon="phone"
              />
              <FormInput
                label="Vendor Email"
                name="vendorEmail"
                type="email"
                value={byproductForm.vendorEmail}
                onChange={handleByproductFormChange}
                placeholder="vendor@example.com"
                icon="envelope"
              />
              <FormInput
                label="Vendor GSTIN"
                name="vendorGstin"
                value={byproductForm.vendorGstin}
                onChange={handleByproductFormChange}
                placeholder="22AAAAA0000A1Z5"
                icon="id-card"
              />
              <FormInput
                label="Vendor PAN"
                name="vendorPan"
                value={byproductForm.vendorPan}
                onChange={handleByproductFormChange}
                placeholder="ABCD1234EFGH"
                icon="id-card"
              />
              <div className="md:col-span-2">
                <FormInput
                  label="Vendor Address"
                  name="vendorAddress"
                  value={byproductForm.vendorAddress}
                  onChange={handleByproductFormChange}
                  required
                  placeholder="Enter complete vendor address"
                  icon="location"
                />
              </div>
            </div>
          </fieldset>

          {/* Payment Details */}
          <fieldset className="border border-gray-200 rounded p-4">
            <legend className="text-sm font-semibold text-gray-700 px-2">
              Payment Details
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormSelect
                label="Payment Method"
                name="paymentMethod"
                value={byproductForm.paymentMethod}
                onChange={handleByproductFormChange}
                required
                icon="credit-card"
              >
                <option value="">Select Payment Method</option>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </FormSelect>
              <FormSelect
                label="Payment Status"
                name="paymentStatus"
                value={byproductForm.paymentStatus}
                onChange={handleByproductFormChange}
                required
                icon="check-circle"
              >
                <option value="">Select Payment Status</option>
                {PAYMENT_STATUS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </FormSelect>
              <FormInput
                label="Notes"
                name="notes"
                value={byproductForm.notes}
                onChange={handleByproductFormChange}
                placeholder="Additional notes or comments"
                icon="note"
              />
            </div>
          </fieldset>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={closeByproductsModal}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="success"
              disabled={loading}
            >
              {loading ? 'Saving...' : (editingByproduct ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogBox>

      {/* Invoice Generator Modal */}
      <InvoiceTemplate
        record={selectedSaleForInvoice}
        show={showInvoiceGenerator}
        onClose={closeInvoiceGenerator}
        onGenerate={handleGenerateInvoice}
        type={selectedSaleForInvoice?.material ? 'byproduct' : 'sale'}
        title={selectedSaleForInvoice?.material ? 'Generate Byproduct Invoice' : 'Generate Sales Invoice'}
      />
    </div>
  );
};

export default SalesDispatch; 