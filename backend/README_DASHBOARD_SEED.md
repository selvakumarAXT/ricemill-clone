# Dashboard Seed Data

This script adds comprehensive dashboard data to your existing Rice Mill application.

## What It Does

- **Adds 6 months of historical data** for dashboard testing
- **Creates Sales Invoices** with geographical distribution across South Indian states
- **Generates Financial Transactions** (income/expenses) for financial charts
- **Adds Production Data** across different rice varieties
- **Creates Paddy Entries** with realistic quantities
- **Distributes data across all branches** for branch-wise analytics

## Prerequisites

1. **Run the basic seed first**: `node seedAllModules.js` (creates users and branches)
2. **MongoDB running** on localhost:27017
3. **Database 'ricemill'** exists

## How to Use

### Step 1: Run the Dashboard Seed
```bash
cd backend
node seedDashboardData.js
```

### Step 2: Verify the Data
```bash
node testDashboardData.js
```

### Step 3: Start Your Application
```bash
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend
cd ../frontend
npm run dev
```

## What You'll Get

- **150+ Sales Invoices** with realistic customer data
- **200+ Financial Transactions** with proper categorization
- **90+ Production Entries** across 7 rice varieties
- **120+ Paddy Entries** with moisture and gunny data
- **Geographical data** across Tamil Nadu, Karnataka, Andhra Pradesh, Telangana, Kerala
- **6 months of trends** for all charts and analytics

## Dashboard Features Now Available

- Sales trends over 6 months
- Geographical sales charts
- Financial income vs expenses
- Production quantity trends
- Outstanding invoice tracking
- Branch-wise data distribution
- Customer and vendor analytics

## Data Structure

The script respects your existing schema:
- **SalesInvoice**: Proper customer info, items, totals, payment details
- **FinancialTransaction**: Income/expense categories, amounts, payment methods
- **Production**: Rice varieties, quantities, quality, status
- **Paddy**: Varieties A/C only, moisture, gunny bags, weights
- **Inventory**: Stock levels for different rice types

## Troubleshooting

- **"No superadmin found"**: Run `seedAllModules.js` first
- **"No branches found"**: Run `seedAllModules.js` first
- **MongoDB connection error**: Ensure MongoDB is running
- **Permission errors**: Check database access

## Next Steps

After seeding:
1. Start your backend and frontend
2. Login with existing credentials
3. Navigate to Dashboard
4. Explore all charts and analytics
5. Test different date ranges and filters

Your dashboard will now display rich, realistic data instead of empty charts! 🚀
