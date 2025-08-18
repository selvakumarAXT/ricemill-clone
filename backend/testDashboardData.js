const mongoose = require('mongoose');
const SalesInvoice = require('./models/SalesInvoice');
const FinancialTransaction = require('./models/FinancialTransaction');
const Production = require('./models/Production');
const Paddy = require('./models/Paddy');
const Inventory = require('./models/Inventory');
require('dotenv').config();

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    console.log('\n📊 Dashboard Data Verification Report');
    console.log('=====================================\n');
    
    // Get total counts
    const [
      totalSalesInvoices,
      totalFinancialTransactions,
      totalProductions,
      totalPaddies,
      totalInventory
    ] = await Promise.all([
      SalesInvoice.countDocuments(),
      FinancialTransaction.countDocuments(),
      Production.countDocuments(),
      Paddy.countDocuments(),
      Inventory.countDocuments()
    ]);
    
    console.log('📈 Data Counts:');
    console.log(`- Sales Invoices: ${totalSalesInvoices}`);
    console.log(`- Financial Transactions: ${totalFinancialTransactions}`);
    console.log(`- Production Entries: ${totalProductions}`);
    console.log(`- Paddy Entries: ${totalPaddies}`);
    console.log(`- Inventory Items: ${totalInventory}`);
    
    // Get geographical sales data
    console.log('\n🌍 Geographical Sales Data:');
    const geographicalData = await SalesInvoice.aggregate([
      {
        $group: {
          _id: '$customer.placeOfSupply',
          totalSales: { $sum: '$totals.grandTotal' },
          invoiceCount: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);
    
    geographicalData.forEach(state => {
      console.log(`- ${state._id}: ₹${state.totalSales.toLocaleString()} (${state.invoiceCount} invoices)`);
    });
    
    // Get sales by month (last 6 months)
    console.log('\n📅 Sales by Month (Last 6 Months):');
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlySales = await SalesInvoice.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalSales: { $sum: '$totals.grandTotal' },
          invoiceCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    monthlySales.forEach(month => {
      const monthName = new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      console.log(`- ${monthName}: ₹${month.totalSales.toLocaleString()} (${month.invoiceCount} invoices)`);
    });
    
    // Get outstanding invoices (using correct status values)
    console.log('\n🚨 Outstanding Invoices:');
    const outstandingInvoices = await SalesInvoice.aggregate([
      {
        $match: {
          status: { $in: ['pending', 'overdue'] }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: { $subtract: ['$totals.grandTotal', { $ifNull: ['$paidAmount', 0] }] } }
        }
      }
    ]);
    
    outstandingInvoices.forEach(status => {
      console.log(`- ${status._id.toUpperCase()}: ${status.count} invoices, ₹${status.totalAmount.toLocaleString()} outstanding`);
    });
    
    // Get invoice status distribution
    console.log('\n📋 Invoice Status Distribution:');
    const statusDistribution = await SalesInvoice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totals.grandTotal' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    statusDistribution.forEach(status => {
      console.log(`- ${status._id.toUpperCase()}: ${status.count} invoices, ₹${status.totalAmount.toLocaleString()} total`);
    });
    
    // Get top customers
    console.log('\n👥 Top Customers:');
    const topCustomers = await SalesInvoice.aggregate([
      {
        $group: {
          _id: '$customer.name',
          totalAmount: { $sum: '$totals.grandTotal' },
          invoiceCount: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 5 }
    ]);
    
    topCustomers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer._id}: ₹${customer.totalAmount.toLocaleString()} (${customer.invoiceCount} invoices)`);
    });
    
    // Get financial summary
    console.log('\n💰 Financial Summary:');
    const financialSummary = await FinancialTransaction.aggregate([
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$transactionType', 'income'] }, '$amount', 0]
            }
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$transactionType', 'expense'] }, '$amount', 0]
            }
          },
          transactionCount: { $sum: 1 }
        }
      }
    ]);
    
    if (financialSummary.length > 0) {
      const summary = financialSummary[0];
      const netProfit = summary.totalIncome - summary.totalExpenses;
      console.log(`- Total Income: ₹${summary.totalIncome.toLocaleString()}`);
      console.log(`- Total Expenses: ₹${summary.totalExpenses.toLocaleString()}`);
      console.log(`- Net Profit: ₹${netProfit.toLocaleString()}`);
      console.log(`- Total Transactions: ${summary.transactionCount}`);
    }
    
    // Get production summary
    console.log('\n🏭 Production Summary:');
    const productionSummary = await Production.aggregate([
      {
        $group: {
          _id: '$name',
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);
    
    productionSummary.forEach(product => {
      console.log(`- ${product._id}: ${product.totalQuantity.toLocaleString()} kg (${product.count} entries)`);
    });
    
    console.log('\n✅ Data verification completed successfully!');
    console.log('\n💡 Dashboard is now ready with rich, realistic data.');
    console.log('🔗 Start your backend and frontend to explore the dashboard!');
    
  } catch (error) {
    console.error('❌ Error verifying dashboard data:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
});
