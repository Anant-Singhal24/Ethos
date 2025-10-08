import React from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiMapPin, FiClock, FiAlertCircle } from 'react-icons/fi';
import moment from 'moment';

const EntityCard = ({ entity }) => {
  const typeColors = {
    student: 'bg-blue-100 text-blue-800',
    staff: 'bg-green-100 text-green-800',
    asset: 'bg-purple-100 text-purple-800',
    device: 'bg-yellow-100 text-yellow-800',
  };
  
  const typeIcons = {
    student: '🎓',
    staff: '👔',
    asset: '📦',
    device: '💻',
  };
  
  return (
    <Link to={`/entity/${entity._id}`}>
      <div className="card hover:shadow-xl transition-all duration-200 cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-2xl">
              {typeIcons[entity.entityType]}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary-600 transition">
                {entity.profile?.fullName || entity.identifiers?.student_id || entity.identifiers?.staff_id || 'Unknown'}
              </h3>
              <span className={`badge ${typeColors[entity.entityType]} mt-1`}>
                {entity.entityType}
              </span>
            </div>
          </div>
          
          {entity.alertStatus?.hasAlert && (
            <div className="text-red-500 animate-pulse">
              <FiAlertCircle size={20} />
            </div>
          )}
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          {entity.identifiers?.email && (
            <div className="flex items-center">
              <FiUser size={14} className="mr-2 text-gray-400" />
              <span className="truncate">{entity.identifiers.email}</span>
            </div>
          )}
          
          {entity.profile?.department && (
            <div className="flex items-center">
              <span className="mr-2 text-gray-400">🏢</span>
              <span>{entity.profile.department}</span>
            </div>
          )}
          
          {entity.lastSeen?.timestamp && (
            <div className="flex items-center">
              <FiClock size={14} className="mr-2 text-gray-400" />
              <span>Last seen {moment(entity.lastSeen.timestamp).fromNow()}</span>
            </div>
          )}
          
          {entity.lastSeen?.location && (
            <div className="flex items-center">
              <FiMapPin size={14} className="mr-2 text-gray-400" />
              <span className="truncate">{entity.lastSeen.location}</span>
            </div>
          )}
        </div>
        
        {entity.alertStatus?.hasAlert && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
            <FiAlertCircle size={12} className="inline mr-1" />
            {entity.alertStatus.alertMessage}
          </div>
        )}
        
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="text-gray-500">
            {entity.identifiers?.student_id || entity.identifiers?.staff_id || entity.identifiers?.card_id}
          </span>
          <span className="text-primary-600 font-medium group-hover:underline">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EntityCard;
