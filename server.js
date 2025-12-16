const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/database');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const pageRoutes = require('./routes/pageRoutes');
const imageRoutes = require('./routes/imageRoutes');
const comparisonRoutes = require('./routes/comparisonRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', pageRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/comparisons', comparisonRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Upload directory: ${config.uploadDir}`);
  console.log(`🗄️  MongoDB URI: ${config.mongoUri}`);
});
