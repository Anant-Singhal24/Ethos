import React from 'react';
import moment from 'moment';
import { FiMapPin, FiClock, FiActivity } from 'react-icons/fi';

const TimelineItem = ({ activity, isLast }) => {
  const activityIcons = {
    swipe: '🔑',
    wifi: '📡',
    library: '📚',
    booking: '📅',
    cctv: '📹',
    helpdesk: '💬',
    other: '📍',
  };
  
  const activityColors = {
    swipe: 'bg-blue-100 text-blue-800 border-blue-200',
    wifi: 'bg-purple-100 text-purple-800 border-purple-200',
    library: 'bg-green-100 text-green-800 border-green-200',
    booking: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    cctv: 'bg-red-100 text-red-800 border-red-200',
    helpdesk: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    other: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  
  const colorClass = activityColors[activity.activityType] || activityColors.other;
  const icon = activityIcons[activity.activityType] || activityIcons.other;
  
  return (
    <div className="relative pl-8 pb-8">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
      )}
      
      {/* Timeline dot */}
      <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white border-2 border-primary-500 flex items-center justify-center text-lg shadow-sm">
        {icon}
      </div>
      
      {/* Content */}
      <div className="card ml-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className={`badge ${colorClass} border`}>
              {activity.activityType}
            </span>
            {activity.isPredicted && (
              <span className="badge bg-purple-100 text-purple-800 border border-purple-200">
                Predicted
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500 flex items-center">
            <FiClock size={14} className="mr-1" />
            {moment(activity.timestamp).format('HH:mm:ss')}
          </span>
        </div>
        
        <div className="space-y-2">
          {activity.location && (
            <div className="flex items-start text-sm">
              <FiMapPin className="text-gray-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <p className="font-medium text-gray-900">
                  {activity.location.locationName || activity.location.locationId}
                </p>
                {activity.location.building && (
                  <p className="text-gray-500 text-xs">
                    {activity.location.building}
                    {activity.location.floor && ` - Floor ${activity.location.floor}`}
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Source-specific details */}
          {activity.sourceData && (
            <div className="text-xs text-gray-600 space-y-1 mt-2 p-2 bg-gray-50 rounded">
              {activity.sourceData.cardId && (
                <p>Card ID: {activity.sourceData.cardId}</p>
              )}
              {activity.sourceData.bookTitle && (
                <p>Book: {activity.sourceData.bookTitle}</p>
              )}
              {activity.sourceData.notes && (
                <p>Notes: {activity.sourceData.notes}</p>
              )}
              {activity.sourceData.purpose && (
                <p>Purpose: {activity.sourceData.purpose}</p>
              )}
            </div>
          )}
          
          {/* Prediction metadata */}
          {activity.isPredicted && activity.predictionMetadata && (
            <div className="text-xs bg-purple-50 border border-purple-200 rounded p-2 mt-2">
              <p className="font-medium text-purple-800 mb-1">
                Prediction (Confidence: {(activity.predictionMetadata.confidence * 100).toFixed(0)}%)
              </p>
              <p className="text-purple-700">Method: {activity.predictionMetadata.method}</p>
              {activity.predictionMetadata.evidence && (
                <ul className="mt-1 space-y-1 text-purple-600">
                  {activity.predictionMetadata.evidence.map((e, i) => (
                    <li key={i}>• {e}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
            <span>Source: {activity.dataSource}</span>
            <span>Confidence: {((activity.confidence || 1) * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;
