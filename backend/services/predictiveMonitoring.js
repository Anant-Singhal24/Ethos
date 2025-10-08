const ActivityLog = require('../models/ActivityLog');
const Entity = require('../models/Entity');
const moment = require('moment');

class PredictiveMonitoringService {
  /**
   * Predict entity location/state at a given time
   */
  async predictEntityState(entityId, targetTime) {
    const entity = await Entity.findById(entityId);
    if (!entity) {
      throw new Error('Entity not found');
    }
    
    // Get historical activity patterns
    const historicalActivities = await ActivityLog.find({
      entityId,
      timestamp: { $lt: targetTime }
    })
      .sort({ timestamp: -1 })
      .limit(100);
    
    if (historicalActivities.length === 0) {
      return {
        prediction: null,
        confidence: 0,
        evidence: ['No historical data available'],
        method: 'insufficient_data'
      };
    }
    
    // Pattern-based prediction
    const prediction = this.patternBasedPrediction(historicalActivities, targetTime);
    
    return prediction;
  }
  
  /**
   * Pattern-based prediction using time-of-day and day-of-week patterns
   */
  patternBasedPrediction(activities, targetTime) {
    const targetMoment = moment(targetTime);
    const targetHour = targetMoment.hour();
    const targetDay = targetMoment.day();
    
    // Find similar time windows (same hour ±1, same day of week)
    const similarTimeActivities = activities.filter(activity => {
      const actMoment = moment(activity.timestamp);
      const hourDiff = Math.abs(actMoment.hour() - targetHour);
      const dayMatch = actMoment.day() === targetDay;
      
      return dayMatch && hourDiff <= 1;
    });
    
    if (similarTimeActivities.length === 0) {
      // Fall back to most recent activity
      const mostRecent = activities[0];
      return {
        prediction: {
          location: mostRecent.location,
          activityType: mostRecent.activityType,
          timestamp: targetTime
        },
        confidence: 0.3,
        evidence: [
          `Based on most recent activity at ${moment(mostRecent.timestamp).format('YYYY-MM-DD HH:mm')}`,
          `Location: ${mostRecent.location.locationName || mostRecent.location.locationId}`,
          `Activity: ${mostRecent.activityType}`
        ],
        method: 'most_recent_fallback'
      };
    }
    
    // Find most common location and activity type
    const locationFrequency = {};
    const activityFrequency = {};
    
    similarTimeActivities.forEach(activity => {
      const locKey = activity.location.locationId || activity.location.locationName || 'unknown';
      const actKey = activity.activityType;
      
      locationFrequency[locKey] = (locationFrequency[locKey] || 0) + 1;
      activityFrequency[actKey] = (activityFrequency[actKey] || 0) + 1;
    });
    
    // Get most frequent
    const mostFrequentLocation = Object.entries(locationFrequency)
      .sort((a, b) => b[1] - a[1])[0];
    const mostFrequentActivity = Object.entries(activityFrequency)
      .sort((a, b) => b[1] - a[1])[0];
    
    const confidence = mostFrequentLocation[1] / similarTimeActivities.length;
    
    // Get representative activity for location details
    const representativeActivity = similarTimeActivities.find(
      a => (a.location.locationId || a.location.locationName) === mostFrequentLocation[0]
    );
    
    return {
      prediction: {
        location: representativeActivity.location,
        activityType: mostFrequentActivity[0],
        timestamp: targetTime
      },
      confidence: Math.min(confidence, 0.9),
      evidence: [
        `Historically active at this time on ${moment(targetTime).format('dddd')}s`,
        `${mostFrequentLocation[1]} out of ${similarTimeActivities.length} similar time periods at ${mostFrequentLocation[0]}`,
        `Common activity: ${mostFrequentActivity[0]}`,
        `Pattern confidence: ${(confidence * 100).toFixed(1)}%`
      ],
      method: 'time_pattern_matching',
      sampleSize: similarTimeActivities.length
    };
  }
  
  /**
   * Predict next likely location based on movement patterns
   */
  async predictNextLocation(entityId) {
    const recentActivities = await ActivityLog.find({
      entityId,
      'location.locationId': { $exists: true }
    })
      .sort({ timestamp: -1 })
      .limit(50);
    
    if (recentActivities.length < 2) {
      return {
        prediction: null,
        confidence: 0,
        evidence: ['Insufficient movement history'],
        method: 'insufficient_data'
      };
    }
    
    // Build transition matrix
    const transitions = {};
    
    for (let i = 0; i < recentActivities.length - 1; i++) {
      const from = recentActivities[i].location.locationId;
      const to = recentActivities[i + 1].location.locationId;
      
      if (!transitions[from]) {
        transitions[from] = {};
      }
      transitions[from][to] = (transitions[from][to] || 0) + 1;
    }
    
    // Get current location
    const currentLocation = recentActivities[0].location.locationId;
    
    if (!transitions[currentLocation]) {
      return {
        prediction: null,
        confidence: 0,
        evidence: ['No historical transitions from current location'],
        method: 'no_transitions'
      };
    }
    
    // Find most likely next location
    const nextLocations = Object.entries(transitions[currentLocation])
      .sort((a, b) => b[1] - a[1]);
    
    const mostLikely = nextLocations[0];
    const totalTransitions = Object.values(transitions[currentLocation])
      .reduce((sum, count) => sum + count, 0);
    
    const confidence = mostLikely[1] / totalTransitions;
    
    return {
      prediction: {
        locationId: mostLikely[0],
        transitionCount: mostLikely[1]
      },
      confidence,
      evidence: [
        `${mostLikely[1]} out of ${totalTransitions} transitions from ${currentLocation} went to ${mostLikely[0]}`,
        `Transition probability: ${(confidence * 100).toFixed(1)}%`
      ],
      method: 'markov_transition',
      alternatives: nextLocations.slice(1, 4).map(([loc, count]) => ({
        locationId: loc,
        probability: count / totalTransitions
      }))
    };
  }
  
  /**
   * Detect anomalies in activity patterns
   */
  async detectAnomalies(entityId, timeWindow = 24) {
    const since = moment().subtract(timeWindow, 'hours').toDate();
    
    const recentActivities = await ActivityLog.find({
      entityId,
      timestamp: { $gte: since }
    }).sort({ timestamp: 1 });
    
    const anomalies = [];
    
    // Check for unusual time gaps
    for (let i = 1; i < recentActivities.length; i++) {
      const prevActivity = recentActivities[i - 1];
      const currentActivity = recentActivities[i];
      
      const timeDiff = moment(currentActivity.timestamp)
        .diff(moment(prevActivity.timestamp), 'hours');
      
      if (timeDiff > 12) {
        anomalies.push({
          type: 'unusual_gap',
          severity: 'medium',
          description: `${timeDiff} hour gap between activities`,
          timestamp: currentActivity.timestamp,
          evidence: [
            `Previous activity: ${prevActivity.activityType} at ${moment(prevActivity.timestamp).format('YYYY-MM-DD HH:mm')}`,
            `Next activity: ${currentActivity.activityType} at ${moment(currentActivity.timestamp).format('YYYY-MM-DD HH:mm')}`
          ]
        });
      }
    }
    
    // Check for unusual locations (locations visited only once)
    const locationCounts = {};
    recentActivities.forEach(activity => {
      const locId = activity.location.locationId || 'unknown';
      locationCounts[locId] = (locationCounts[locId] || 0) + 1;
    });
    
    const unusualLocations = Object.entries(locationCounts)
      .filter(([loc, count]) => count === 1);
    
    if (unusualLocations.length > 0) {
      unusualLocations.forEach(([loc]) => {
        const activity = recentActivities.find(
          a => (a.location.locationId || 'unknown') === loc
        );
        
        anomalies.push({
          type: 'unusual_location',
          severity: 'low',
          description: `First visit to ${loc} in ${timeWindow}h window`,
          timestamp: activity.timestamp,
          evidence: [`Location: ${loc}`, `Activity: ${activity.activityType}`]
        });
      });
    }
    
    return {
      hasAnomalies: anomalies.length > 0,
      anomalies,
      timeWindow,
      totalActivities: recentActivities.length
    };
  }
}

module.exports = new PredictiveMonitoringService();
