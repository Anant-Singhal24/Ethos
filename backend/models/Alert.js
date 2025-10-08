const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entity',
    required: true
  },
  
  alertType: {
    type: String,
    required: true,
    enum: ['inactive', 'anomaly', 'unauthorized_access', 'missing', 'suspicious_pattern']
  },
  
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  title: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  details: {
    lastSeenTimestamp: Date,
    lastSeenLocation: String,
    hoursSinceLastActivity: Number,
    relatedActivities: [String],
    anomalyScore: Number
  },
  
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved'],
    default: 'active'
  },
  
  acknowledgedBy: String,
  acknowledgedAt: Date,
  resolvedBy: String,
  resolvedAt: Date,
  resolutionNotes: String,
  
  triggeredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

AlertSchema.index({ entityId: 1, status: 1 });
AlertSchema.index({ alertType: 1, status: 1 });
AlertSchema.index({ triggeredAt: -1 });

module.exports = mongoose.model('Alert', AlertSchema);
