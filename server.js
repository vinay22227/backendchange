const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // Import database connection function

// Route imports
const userRoutes = require('./routes/userRoutes');
const webAppRoutes = require('./routes/webAppRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // Payment-related routes
const organizationRoutes = require('./routes/organizationRoutes'); // Organization routes
const projectRoutes = require('./routes/projectRoutes'); // Project routes
const addUserRoutes = require('./routes/addUserRoutes'); // Add user routes
const serviceRoutes = require('./routes/serviceRoutes'); // Service routes
const hubIngestRoutes = require('./routes/hubingestroutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); // Notification routes
const dataStoreRoutes = require('./routes/dataStoreRoutes'); // ✅ Import Data Store Routes

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS
app.use(
  cors({
    origin: [
      'https://demoproject-xton.vercel.app', // Production URL (no trailing slash)
      'http://localhost:3000', // Backend URL
      'http://localhost:3001', // Frontend URL
      'http://localhost:3002', // Additional frontend URL
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Handle preflight requests explicitly
app.options('*', cors());

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Initialize database and start server
const initializeServer = async () => {
  try {
    // Connect to the database
    await connectDB();
    console.log('Database connected successfully.');

    // Register API routes
    app.use('/api/user', userRoutes); // User-related routes
    app.use('/api/webapp', webAppRoutes); // Web app routes
    app.use('/api/payment', paymentRoutes); // Payment-related routes
    app.use('/api/org', organizationRoutes); // Organization routes
    app.use('/api/proj', projectRoutes); // Project routes
    app.use('/api/add-user', addUserRoutes); // Add user routes
    app.use('/api', serviceRoutes); // Service routes
    app.use('/api/hubingest', hubIngestRoutes);
    app.use('/api/subscriptions', subscriptionRoutes);
    app.use('/api/notifications', notificationRoutes); // Add the notification routes here
    app.use('/api/datastore', dataStoreRoutes); // ✅ Register Data Store Routes

    // Health check route
    app.get('/', (req, res) => {
      res.status(200).send('Server is deployed and running successfully.');
    });

    // Handle undefined routes
    app.use((req, res, next) => {
      res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.url}`,
      });
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error('Global error handler triggered:', err);
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Include stack trace in development
      });
    });

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error.message);
    process.exit(1); // Exit process if database connection fails
  }
};

// Initialize the server
initializeServer();
