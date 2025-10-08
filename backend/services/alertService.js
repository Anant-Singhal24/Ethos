const Alert = require('../models/Alert');
const Entity = require('../models/Entity');
const ActivityLog = require('../models/ActivityLog');
const moment = require('moment');

class AlertService {
  /**
   * Check for inactive entities (no activity in X hours)
   */
  async checkInactiveEntities(thresholdHours = 12) {
    const cutoffTime = moment().subtract(thresholdHours, 'hours').toDate();
    
    const entities = await Entity.find({ isActive: true });
    const newAlerts = [];
    
    for (const entity of entities) {
      // Skip if already has an active inactive alert
      const existingAlert = await Alert.findOne({
        entityId: entity._id,
        alertType: 'inactive',
        status: 'active'
      });
      
      if (existingAlert) continue;
      
      // Check last activity
      const lastActivity = await ActivityLog.findOne({
        entityId: entity._id
      }).sort({ timestamp: -1 });
      
      if (!lastActivity || lastActivity.timestamp < cutoffTime) {
        const hoursSince = lastActivity 
          ? moment().diff(moment(lastActivity.timestamp), 'hours', true)
          : null;
        
        const alert = new Alert({
          entityId: entity._id,
          alertType: 'inactive',
          severity: hoursSince > 24 ? 'high' : 'medium',
          title: `No Activity Detected - ${entity.profile.fullName || entity.identifiers.student_id}`,
          message: hoursSince 
            ? `No activity recorded for ${hoursSince.toFixed(1)} hours`
            : 'No activity recorded in system',
          details: {
            lastSeenTimestamp: lastActivity?.timestamp,
            lastSeenLocation: lastActivity?.location?.locationName || lastActivity?.location?.locationId,
            hoursSinceLastActivity: hoursSince
          }
        });
        
        await alert.save();
        
        // Update entity alert status
        entity.alertStatus = {
          hasAlert: true,
          alertType: 'inactive',
          alertMessage: alert.message,
          alertTimestamp: new Date()
        };
        await entity.save();
        
        newAlerts.push(alert);
      }
    }
    
    return newAlerts;
  }
  
  /**
   * Check for anomalous patterns
   */
  async checkAnomalies() {
    const recentTimeWindow = moment().subtract(24, 'hours').toDate();
    
    // Find entities with unusual activity patterns
    const entities = await Entity.find({ isActive: true });
    const newAlerts = [];
    
    for (const entity of entities) {
      const recentActivities = await ActivityLog.find({
        entityId: entity._id,
        timestamp: { $gte: recentTimeWindow }
      }).sort({ timestamp: 1 });
      
      if (recentActivities.length === 0) continue;
      
      // Check for rapid location changes (> 5 different locations in 1 hour)
      const oneHourAgo = moment().subtract(1, 'hour').toDate();
      const veryRecentActivities = recentActivities.filter(
        a => a.timestamp >= oneHourAgo
      );
      
      if (veryRecentActivities.length > 0) {
        const uniqueLocations = new Set(
          veryRecentActivities
            .map(a => a.location.locationId)
            .filter(Boolean)
        );
        
        if (uniqueLocations.size > 5) {
          const existingAlert = await Alert.findOne({
            entityId: entity._id,
            alertType: 'suspicious_pattern',
            status: 'active',
            'details.anomalyScore': { $gt: 0 }
          });
          
          if (!existingAlert) {
            const alert = new Alert({
              entityId: entity._id,
              alertType: 'suspicious_pattern',
              severity: 'medium',
              title: `Unusual Activity Pattern - ${entity.profile.fullName || entity.identifiers.student_id}`,
              message: `Detected ${uniqueLocations.size} location changes in 1 hour`,
              details: {
                anomalyScore: uniqueLocations.size / 5,
                relatedActivities: veryRecentActivities.map(a => 
                  `${a.activityType} at ${a.location.locationName || a.location.locationId}`
                )
              }
            });
            
            await alert.save();
            newAlerts.push(alert);
          }
        }
      }
    }
    
    return newAlerts;
  }
  
  /**
   * Get all active alerts
   */
  async getActiveAlerts(filters = {}) {
    const query = { status: 'active', ...filters };
    
    const alerts = await Alert.find(query)
      .populate('entityId')
      .sort({ triggeredAt: -1 });
    
    return alerts;
  }
  
  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId, acknowledgedBy) {
    const alert = await Alert.findById(alertId);
    
    if (!alert) {
      throw new Error('Alert not found');
    }
    
    alert.status = 'acknowledged';
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date();
    
    await alert.save();
    
    return alert;
  }
  
  /**
   * Resolve an alert
   */
  async resolveAlert(alertId, resolvedBy, resolutionNotes) {
    const alert = await Alert.findById(alertId);
    
    if (!alert) {
      throw new Error('Alert not found');
    }
    
    alert.status = 'resolved';
    alert.resolvedBy = resolvedBy;
    alert.resolvedAt = new Date();
    alert.resolutionNotes = resolutionNotes;
    
    await alert.save();
    
    // Update entity alert status
    const entity = await Entity.findById(alert.entityId);
    if (entity && entity.alertStatus.hasAlert) {
      entity.alertStatus.hasAlert = false;
      await entity.save();
    }
    
    return alert;
  }
  
  /**
   * Get alert statistics
   */
  async getAlertStatistics(timeWindow = 24) {
    const since = moment().subtract(timeWindow, 'hours').toDate();
    
    const totalAlerts = await Alert.countDocuments({
      triggeredAt: { $gte: since }
    });
    
    const activeAlerts = await Alert.countDocuments({
      status: 'active',
      triggeredAt: { $gte: since }
    });
    
    const alertsByType = await Alert.aggregate([
      { $match: { triggeredAt: { $gte: since } } },
      { $group: { _id: '$alertType', count: { $sum: 1 } } }
    ]);
    
    const alertsBySeverity = await Alert.aggregate([
      { $match: { triggeredAt: { $gte: since } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    
    return {
      totalAlerts,
      activeAlerts,
      resolvedAlerts: totalAlerts - activeAlerts,
      byType: alertsByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      bySeverity: alertsBySeverity.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      timeWindow
    };
  }
}

module.exports = new AlertService();
