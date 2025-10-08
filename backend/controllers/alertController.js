const alertService = require('../services/alertService');

/**
 * Get all alerts
 */
exports.getAlerts = async (req, res) => {
  try {
    const { status, type, severity } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (type) filters.alertType = type;
    if (severity) filters.severity = severity;
    
    const alerts = await alertService.getActiveAlerts(filters);
    
    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Check for new alerts
 */
exports.checkAlerts = async (req, res) => {
  try {
    const { thresholdHours = 12 } = req.query;
    
    const inactiveAlerts = await alertService.checkInactiveEntities(parseInt(thresholdHours));
    const anomalyAlerts = await alertService.checkAnomalies();
    
    const allNewAlerts = [...inactiveAlerts, ...anomalyAlerts];
    
    res.json({
      success: true,
      message: `Found ${allNewAlerts.length} new alerts`,
      data: {
        inactive: inactiveAlerts,
        anomalies: anomalyAlerts,
        total: allNewAlerts.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Acknowledge alert
 */
exports.acknowledgeAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { acknowledgedBy } = req.body;
    
    const alert = await alertService.acknowledgeAlert(id, acknowledgedBy);
    
    res.json({
      success: true,
      message: 'Alert acknowledged',
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Resolve alert
 */
exports.resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolvedBy, notes } = req.body;
    
    const alert = await alertService.resolveAlert(id, resolvedBy, notes);
    
    res.json({
      success: true,
      message: 'Alert resolved',
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get alert statistics
 */
exports.getAlertStats = async (req, res) => {
  try {
    const { timeWindow = 24 } = req.query;
    
    const stats = await alertService.getAlertStatistics(parseInt(timeWindow));
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
