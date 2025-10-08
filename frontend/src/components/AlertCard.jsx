import React from 'react';
import { FiAlertTriangle, FiAlertCircle, FiInfo, FiCheckCircle } from 'react-icons/fi';
import moment from 'moment';

const AlertCard = ({ alert, onAcknowledge, onResolve }) => {
  const severityConfig = {
    low: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: FiInfo },
    medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: FiAlertCircle },
    high: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: FiAlertTriangle },
    critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: FiAlertTriangle },
  };
  
  const config = severityConfig[alert.severity] || severityConfig.medium;
  const Icon = config.icon;
  
  const statusColors = {
    active: 'bg-red-100 text-red-800',
    acknowledged: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
  };
  
  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4 mb-3 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <Icon className={`${config.text} mt-1`} size={20} />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-semibold text-gray-900">{alert.title}</h4>
              <span className={`badge ${statusColors[alert.status]}`}>
                {alert.status}
              </span>
              <span className={`badge ${config.text} ${config.bg}`}>
                {alert.severity}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
            
            {alert.details && (
              <div className="text-xs text-gray-600 space-y-1">
                {alert.details.lastSeenTimestamp && (
                  <p>Last seen: {moment(alert.details.lastSeenTimestamp).format('MMM DD, YYYY HH:mm')}</p>
                )}
                {alert.details.lastSeenLocation && (
                  <p>Location: {alert.details.lastSeenLocation}</p>
                )}
                {alert.details.hoursSinceLastActivity && (
                  <p>Hours inactive: {alert.details.hoursSinceLastActivity.toFixed(1)}</p>
                )}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              Triggered: {moment(alert.triggeredAt).fromNow()}
            </p>
          </div>
        </div>
        
        {alert.status === 'active' && (
          <div className="flex flex-col space-y-2 ml-4">
            <button
              onClick={() => onAcknowledge(alert._id)}
              className="text-xs px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition"
            >
              Acknowledge
            </button>
            <button
              onClick={() => onResolve(alert._id)}
              className="text-xs px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition"
            >
              Resolve
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertCard;
