const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Import models for index management
const { ensureIndexes: ensureRiceDepositIndexes } = require('./models/RiceDeposit');

// Ensure proper indexes after database connection
const ensureAllIndexes = async () => {
  try {
    console.log('Ensuring proper database indexes...');
    await ensureRiceDepositIndexes();
  
    console.log('All indexes ensured successfully');
  } catch (error) {
    console.error('Error ensuring indexes:', error);
  }
};

// Call index management after a short delay to ensure database is connected
setTimeout(ensureAllIndexes, 2000);

const app = express();

// Security middleware
app.use(helmet());

// CORS - Allow frontend origin and credentials for development
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'], // Frontend URLs
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => req.method === 'OPTIONS', // Skip rate limiting for preflight requests
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/branches', require('./routes/branches'));
app.use('/api/batches', require('./routes/batches'));
app.use('/api/production', require('./routes/production'));
app.use('/api/gunny', require('./routes/gunny'));
app.use('/api/paddy', require('./routes/paddy'));
app.use('/api/rice-deposits', require('./routes/riceDeposits'));
app.use('/api/bag-weight-options', require('./routes/bagWeightOptions'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/financial-transactions', require('./routes/financialTransactions'));

// Upload routes
app.use('/api/uploads', require('./routes/uploads'));

// Document routes
app.use('/api/documents', require('./routes/documents'));

// Sales Invoice routes
app.use('/api/sales-invoices', require('./routes/salesInvoices'));
app.use('/api/qc', require('./routes/qc'));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use('/api/checkstacks', require('./routes/checkstacks'));
// app.use('/api/holds', require('./routes/holds'));
// app.use('/api/delivers', require('./routes/delivers'));

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Rice Mill Management System API',
    version: '1.0.0',
    status: 'Active'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('Shutting down due to uncaught exception');
  process.exit(1);
});

module.exports = app; 