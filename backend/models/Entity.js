const mongoose = require('mongoose');

const EntitySchema = new mongoose.Schema({
  // Primary identifiers
  entityType: {
    type: String,
    required: true,
    enum: ['student', 'staff', 'asset', 'device']
  },
  
  // Multiple identifier fields for entity resolution
  identifiers: {
    student_id: String,
    staff_id: String,
    email: String,
    card_id: String,
    device_hash: String,
    face_id: String,
    name: String,
    nameVariants: [String]
  },
  
  // Profile information
  profile: {
    firstName: String,
    lastName: String,
    fullName: String,
    department: String,
    role: String,
    phoneNumber: String,
    photo: String,
    faceEmbedding: [Number]
  },
  
  // Resolved entity mapping
  resolvedEntities: [{
    sourceId: String,
    sourceType: String,
    confidence: Number,
    timestamp: Date
  }],
  
  // Last activity tracking
  lastSeen: {
    timestamp: Date,
    location: String,
    source: String,
    activity: String
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Alert status
  alertStatus: {
    hasAlert: Boolean,
    alertType: String,
    alertMessage: String,
    alertTimestamp: Date
  }
}, {
  timestamps: true
});

// Indexes for fast lookups
EntitySchema.index({ 'identifiers.student_id': 1 });
EntitySchema.index({ 'identifiers.staff_id': 1 });
EntitySchema.index({ 'identifiers.email': 1 });
EntitySchema.index({ 'identifiers.card_id': 1 });
EntitySchema.index({ 'identifiers.device_hash': 1 });
EntitySchema.index({ entityType: 1 });
EntitySchema.index({ 'lastSeen.timestamp': -1 });

module.exports = mongoose.model('Entity', EntitySchema);
