require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');

// Import routes
const entityRoutes = require('./routes/entityRoutes');
const timelineRoutes = require('./routes/timelineRoutes');
const alertRoutes = require('./routes/alertRoutes');
const predictionRoutes = require('./routes/predictionRoutes');

// Initialize express
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/entities', entityRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/predictions', predictionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Ethos API Server',
    version: '1.0.0',
    endpoints: {
      entities: '/api/entities',
      timeline: '/api/timeline',
      alerts: '/api/alerts',
      predictions: '/api/predictions'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health\n`);
});
