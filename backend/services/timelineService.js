const ActivityLog = require('../models/ActivityLog');
const moment = require('moment');
const _ = require('lodash');

class TimelineService {
  /**
   * Generate timeline for an entity
   */
  async generateTimeline(entityId, startTime, endTime) {
    const query = {
      entityId,
      timestamp: {
        $gte: new Date(startTime),
        $lte: new Date(endTime)
      }
    };
    
    const activities = await ActivityLog.find(query)
      .sort({ timestamp: 1 })
      .lean();
    
    // Group activities by hour for summary
    const groupedByHour = this.groupActivitiesByHour(activities);
    
    // Generate human-readable summary
    const summary = this.generateSummary(activities, startTime, endTime);
    
    return {
      entityId,
      timeWindow: {
        start: startTime,
        end: endTime
      },
      totalActivities: activities.length,
      activities,
      groupedByHour,
      summary,
      stats: this.calculateStats(activities)
    };
  }
  
  /**
   * Group activities by hour
   */
  groupActivitiesByHour(activities) {
    const grouped = _.groupBy(activities, activity => {
      return moment(activity.timestamp).format('YYYY-MM-DD HH:00');
    });
    
    return Object.entries(grouped).map(([hour, acts]) => ({
      hour,
      count: acts.length,
      activities: acts,
      locations: [...new Set(acts.map(a => a.location.locationName || a.location.locationId))],
      activityTypes: [...new Set(acts.map(a => a.activityType))]
    }));
  }
  
  /**
   * Generate human-readable summary
   */
  generateSummary(activities, startTime, endTime) {
    if (activities.length === 0) {
      return {
        text: `No activities recorded between ${moment(startTime).format('MMM DD, HH:mm')} and ${moment(endTime).format('MMM DD, HH:mm')}.`,
        highlights: []
      };
    }
    
    const locations = activities.map(a => a.location.locationName || a.location.locationId);
    const uniqueLocations = [...new Set(locations)];
    const activityTypes = activities.map(a => a.activityType);
    const uniqueActivityTypes = [...new Set(activityTypes)];
    
    // Find most frequent location
    const locationFreq = _.countBy(locations);
    const mostFrequentLocation = Object.entries(locationFreq)
      .sort((a, b) => b[1] - a[1])[0];
    
    // Time span
    const firstActivity = activities[0];
    const lastActivity = activities[activities.length - 1];
    const timeSpan = moment(lastActivity.timestamp).diff(moment(firstActivity.timestamp), 'hours', true);
    
    const highlights = [];
    
    // First activity
    highlights.push({
      time: firstActivity.timestamp,
      description: `Started day with ${firstActivity.activityType} at ${firstActivity.location.locationName || firstActivity.location.locationId}`,
      type: 'start'
    });
    
    // Most frequent location
    if (mostFrequentLocation) {
      highlights.push({
        description: `Most time spent at ${mostFrequentLocation[0]} (${mostFrequentLocation[1]} activities)`,
        type: 'frequent_location'
      });
    }
    
    // Activity diversity
    highlights.push({
      description: `Engaged in ${uniqueActivityTypes.length} different activity types`,
      type: 'diversity'
    });
    
    // Last activity
    highlights.push({
      time: lastActivity.timestamp,
      description: `Last seen: ${lastActivity.activityType} at ${lastActivity.location.locationName || lastActivity.location.locationId}`,
      type: 'end'
    });
    
    const text = `Between ${moment(startTime).format('MMM DD, HH:mm')} and ${moment(endTime).format('MMM DD, HH:mm')}, ` +
      `recorded ${activities.length} activities across ${uniqueLocations.length} locations. ` +
      `Most active at ${mostFrequentLocation[0]}. ` +
      `Active period: ${timeSpan.toFixed(1)} hours.`;
    
    return {
      text,
      highlights,
      metrics: {
        totalActivities: activities.length,
        uniqueLocations: uniqueLocations.length,
        uniqueActivityTypes: uniqueActivityTypes.length,
        activeHours: timeSpan.toFixed(1),
        mostFrequentLocation: mostFrequentLocation[0]
      }
    };
  }
  
  /**
   * Calculate statistics
   */
  calculateStats(activities) {
    if (activities.length === 0) {
      return {
        totalActivities: 0,
        byType: {},
        byLocation: {},
        confidenceAverage: 0
      };
    }
    
    const byType = _.countBy(activities, 'activityType');
    const byLocation = _.countBy(activities, a => a.location.locationName || a.location.locationId);
    
    const confidences = activities.map(a => a.confidence || 1);
    const confidenceAverage = _.mean(confidences);
    
    return {
      totalActivities: activities.length,
      byType,
      byLocation,
      confidenceAverage: confidenceAverage.toFixed(3),
      predictedActivities: activities.filter(a => a.isPredicted).length
    };
  }
  
  /**
   * Get today's timeline until now
   */
  async getTodayTimeline(entityId) {
    const startOfDay = moment().startOf('day').toDate();
    const now = new Date();
    
    return this.generateTimeline(entityId, startOfDay, now);
  }
  
  /**
   * Get timeline for a specific date
   */
  async getDateTimeline(entityId, date) {
    const startOfDay = moment(date).startOf('day').toDate();
    const endOfDay = moment(date).endOf('day').toDate();
    
    return this.generateTimeline(entityId, startOfDay, endOfDay);
  }
  
  /**
   * Get timeline with predictions for gaps
   */
  async getTimelineWithPredictions(entityId, startTime, endTime, predictiveService) {
    const timeline = await this.generateTimeline(entityId, startTime, endTime);
    
    // Find gaps (periods > 2 hours without activity)
    const gaps = [];
    const activities = timeline.activities;
    
    for (let i = 1; i < activities.length; i++) {
      const prevActivity = activities[i - 1];
      const currentActivity = activities[i];
      
      const gapHours = moment(currentActivity.timestamp)
        .diff(moment(prevActivity.timestamp), 'hours', true);
      
      if (gapHours > 2) {
        gaps.push({
          start: prevActivity.timestamp,
          end: currentActivity.timestamp,
          durationHours: gapHours
        });
      }
    }
    
    // Generate predictions for gaps
    const predictions = [];
    for (const gap of gaps) {
      const midpoint = moment(gap.start)
        .add(gap.durationHours / 2, 'hours')
        .toDate();
      
      try {
        const prediction = await predictiveService.predictEntityState(entityId, midpoint);
        if (prediction.prediction) {
          predictions.push({
            gap,
            prediction,
            timestamp: midpoint
          });
        }
      } catch (error) {
        console.error('Prediction error:', error);
      }
    }
    
    return {
      ...timeline,
      gaps,
      predictions
    };
  }
}

module.exports = new TimelineService();
