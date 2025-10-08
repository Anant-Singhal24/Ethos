const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  // Entity reference
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entity',
    required: true
  },
  
  // Activity details
  activityType: {
    type: String,
    required: true,
    enum: ['swipe', 'wifi', 'library', 'booking', 'cctv', 'helpdesk', 'other']
  },
  
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  
  // Location information
  location: {
    locationId: String,
    locationName: String,
    building: String,
    floor: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Source-specific data
  sourceData: {
    // Swipe data
    cardId: String,
    accessGranted: Boolean,
    
    // WiFi data
    deviceHash: String,
    apId: String,
    signalStrength: Number,
    
    // Library data
    bookId: String,
    bookTitle: String,
    action: String, // checkout, return
    
    // Booking data
    roomId: String,
    purpose: String,
    duration: Number,
    
    // CCTV data
    cameraId: String,
    frameId: String,
    imageUrl: String,
    
    // Helpdesk/Notes
    ticketId: String,
    notes: String,
    category: String
  },
  
  // Data quality metrics
  confidence: {
    type: Number,
    default: 1.0,
    min: 0,
    max: 1
  },
  
  // Provenance
  dataSource: {
    type: String,
    required: true
  },
  
  sourceRecordId: String,
  
  // Inference flag (for predicted activities)
  isPredicted: {
    type: Boolean,
    default: false
  },
  
  predictionMetadata: {
    method: String,
    evidence: [String],
    confidence: Number
  }
}, {
  timestamps: true
});

// Compound indexes
ActivityLogSchema.index({ entityId: 1, timestamp: -1 });
ActivityLogSchema.index({ activityType: 1, timestamp: -1 });
ActivityLogSchema.index({ 'location.locationId': 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
