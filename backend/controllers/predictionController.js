const predictiveService = require('../services/predictiveMonitoring');

/**
 * Predict entity state at a given time
 */
exports.predictState = async (req, res) => {
  try {
    const { entityId } = req.params;
    const { time } = req.query;
    
    if (!time) {
      return res.status(400).json({
        success: false,
        message: 'Time parameter required'
      });
    }
    
    const prediction = await predictiveService.predictEntityState(entityId, new Date(time));
    
    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Predict next location
 */
exports.predictNextLocation = async (req, res) => {
  try {
    const { entityId } = req.params;
    
    const prediction = await predictiveService.predictNextLocation(entityId);
    
    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Detect anomalies
 */
exports.detectAnomalies = async (req, res) => {
  try {
    const { entityId } = req.params;
    const { timeWindow = 24 } = req.query;
    
    const anomalies = await predictiveService.detectAnomalies(entityId, parseInt(timeWindow));
    
    res.json({
      success: true,
      data: anomalies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
