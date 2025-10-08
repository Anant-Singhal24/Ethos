const Entity = require('../models/Entity');
const ActivityLog = require('../models/ActivityLog');
const entityResolution = require('../services/entityResolution');

/**
 * Search entities
 */
exports.searchEntities = async (req, res) => {
  try {
    const { query, type, limit = 20 } = req.query;
    
    let searchQuery = {};
    
    if (type) {
      searchQuery.entityType = type;
    }
    
    if (query) {
      searchQuery.$or = [
        { 'identifiers.student_id': { $regex: query, $options: 'i' } },
        { 'identifiers.staff_id': { $regex: query, $options: 'i' } },
        { 'identifiers.email': { $regex: query, $options: 'i' } },
        { 'identifiers.card_id': { $regex: query, $options: 'i' } },
        { 'profile.fullName': { $regex: query, $options: 'i' } },
        { 'profile.firstName': { $regex: query, $options: 'i' } },
        { 'profile.lastName': { $regex: query, $options: 'i' } }
      ];
    }
    
    const entities = await Entity.find(searchQuery)
      .limit(parseInt(limit))
      .sort({ 'lastSeen.timestamp': -1 });
    
    res.json({
      success: true,
      count: entities.length,
      data: entities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get entity by ID
 */
exports.getEntityById = async (req, res) => {
  try {
    const entity = await Entity.findById(req.params.id);
    
    if (!entity) {
      return res.status(404).json({
        success: false,
        message: 'Entity not found'
      });
    }
    
    // Get activity count
    const activityCount = await ActivityLog.countDocuments({ entityId: entity._id });
    
    res.json({
      success: true,
      data: {
        ...entity.toObject(),
        activityCount
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
 * Resolve entity across sources
 */
exports.resolveEntity = async (req, res) => {
  try {
    const identifiers = req.body;
    
    const resolution = await entityResolution.resolveEntity(identifiers);
    
    res.json({
      success: true,
      data: resolution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all entities
 */
exports.getAllEntities = async (req, res) => {
  try {
    const { type, page = 1, limit = 50 } = req.query;
    
    const query = type ? { entityType: type } : {};
    
    const entities = await Entity.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ 'lastSeen.timestamp': -1 });
    
    const total = await Entity.countDocuments(query);
    
    res.json({
      success: true,
      data: entities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
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
 * Get entity statistics
 */
exports.getEntityStats = async (req, res) => {
  try {
    const totalEntities = await Entity.countDocuments();
    const byType = await Entity.aggregate([
      { $group: { _id: '$entityType', count: { $sum: 1 } } }
    ]);
    
    const withAlerts = await Entity.countDocuments({ 'alertStatus.hasAlert': true });
    
    res.json({
      success: true,
      data: {
        total: totalEntities,
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        withAlerts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
