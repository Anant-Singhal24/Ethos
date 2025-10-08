const timelineService = require('../services/timelineService');
const predictiveService = require('../services/predictiveMonitoring');

/**
 * Get entity timeline
 */
exports.getTimeline = async (req, res) => {
  try {
    const { entityId } = req.params;
    const { start, end } = req.query;
    
    let timeline;
    
    if (start && end) {
      timeline = await timelineService.generateTimeline(entityId, start, end);
    } else {
      // Default to today
      timeline = await timelineService.getTodayTimeline(entityId);
    }
    
    res.json({
      success: true,
      data: timeline
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get timeline with predictions
 */
exports.getTimelineWithPredictions = async (req, res) => {
  try {
    const { entityId } = req.params;
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: 'Start and end time required'
      });
    }
    
    const timeline = await timelineService.getTimelineWithPredictions(
      entityId,
      start,
      end,
      predictiveService
    );
    
    res.json({
      success: true,
      data: timeline
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get today's timeline
 */
exports.getTodayTimeline = async (req, res) => {
  try {
    const { entityId } = req.params;
    
    const timeline = await timelineService.getTodayTimeline(entityId);
    
    res.json({
      success: true,
      data: timeline
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
