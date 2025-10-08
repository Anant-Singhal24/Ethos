import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiClock } from 'react-icons/fi';
import moment from 'moment';
import TimelineItem from '../components/TimelineItem';
import { timelineAPI, entityAPI } from '../services/api';

const Timeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entity, setEntity] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(moment().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const [showPredictions, setShowPredictions] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, [id]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch entity details
      const entityRes = await entityAPI.getById(id);
      setEntity(entityRes.data.data);
      
      // Fetch today's timeline
      const timelineRes = await timelineAPI.getTodayTimeline(id);
      setTimeline(timelineRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDateRangeSearch = async () => {
    try {
      setLoading(true);
      const start = moment(startDate).startOf('day').toISOString();
      const end = moment(endDate).endOf('day').toISOString();
      
      let timelineRes;
      if (showPredictions) {
        timelineRes = await timelineAPI.getTimelineWithPredictions(id, start, end);
      } else {
        timelineRes = await timelineAPI.getTimeline(id, start, end);
      }
      
      setTimeline(timelineRes.data.data);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTodayClick = async () => {
    const today = moment().format('YYYY-MM-DD');
    setStartDate(today);
    setEndDate(today);
    setLoading(true);
    
    try {
      const timelineRes = await timelineAPI.getTodayTimeline(id);
      setTimeline(timelineRes.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !timeline) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <FiArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Activity Timeline</h1>
          <p className="text-gray-600 mt-1">
            {entity?.profile?.fullName || entity?.identifiers?.student_id || 'Entity Timeline'}
          </p>
        </div>
      </div>
      
      {/* Date Range Selector */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPredictions}
                onChange={(e) => setShowPredictions(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Show Predictions
              </span>
            </label>
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={handleDateRangeSearch}
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
            <button
              onClick={handleTodayClick}
              className="btn-secondary"
            >
              Today
            </button>
          </div>
        </div>
      </div>
      
      {/* Summary */}
      {timeline && timeline.summary && (
        <div className="card bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-200">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiCalendar className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-primary-900 mb-2">Summary</h3>
              <p className="text-primary-800 mb-4">{timeline.summary.text}</p>
              
              {timeline.summary.metrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600">Activities</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {timeline.summary.metrics.totalActivities}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600">Locations</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {timeline.summary.metrics.uniqueLocations}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600">Activity Types</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {timeline.summary.metrics.uniqueActivityTypes}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600">Active Hours</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {timeline.summary.metrics.activeHours}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Predictions Info */}
      {timeline?.predictions && timeline.predictions.length > 0 && (
        <div className="card bg-purple-50 border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            🔮 Predictive Analysis
          </h3>
          <p className="text-purple-800 text-sm">
            {timeline.predictions.length} prediction(s) generated for activity gaps
          </p>
        </div>
      )}
      
      {/* Timeline */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <FiClock className="mr-2 text-primary-600" />
          Activity Timeline
        </h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : timeline?.activities && timeline.activities.length > 0 ? (
          <div className="relative">
            {timeline.activities.map((activity, index) => (
              <TimelineItem
                key={activity._id || index}
                activity={activity}
                isLast={index === timeline.activities.length - 1}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiClock size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 text-lg">No activities found for this time period</p>
            <button onClick={handleTodayClick} className="btn-primary mt-4">
              View Today's Activities
            </button>
          </div>
        )}
      </div>
      
      {/* Statistics */}
      {timeline?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Activities by Type</h3>
            <div className="space-y-2">
              {Object.entries(timeline.stats.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="capitalize text-gray-700">{type}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Top Locations</h3>
            <div className="space-y-2">
              {Object.entries(timeline.stats.byLocation)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([location, count]) => (
                  <div key={location} className="flex items-center justify-between">
                    <span className="text-gray-700 truncate mr-2">{location}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
