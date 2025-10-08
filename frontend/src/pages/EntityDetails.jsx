import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiClock, FiUser, FiMail, FiActivity, FiAlertCircle } from 'react-icons/fi';
import moment from 'moment';
import { entityAPI, predictionAPI } from '../services/api';

const EntityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entity, setEntity] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchEntityDetails();
  }, [id]);
  
  const fetchEntityDetails = async () => {
    try {
      setLoading(true);
      const response = await entityAPI.getById(id);
      setEntity(response.data.data);
      
      // Fetch predictions
      try {
        const predRes = await predictionAPI.predictNextLocation(id);
        setPrediction(predRes.data.data);
      } catch (error) {
        console.error('Error fetching prediction:', error);
      }
      
      // Fetch anomalies
      try {
        const anomRes = await predictionAPI.detectAnomalies(id, 24);
        setAnomalies(anomRes.data.data);
      } catch (error) {
        console.error('Error fetching anomalies:', error);
      }
    } catch (error) {
      console.error('Error fetching entity:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  if (!entity) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Entity not found</p>
        <button onClick={() => navigate('/search')} className="btn-primary mt-4">
          Back to Search
        </button>
      </div>
    );
  }
  
  const typeColors = {
    student: 'bg-blue-100 text-blue-800',
    staff: 'bg-green-100 text-green-800',
    asset: 'bg-purple-100 text-purple-800',
    device: 'bg-yellow-100 text-yellow-800',
  };
  
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entity Details</h1>
          <p className="text-gray-600 mt-1">Comprehensive entity information and activity</p>
        </div>
      </div>
      
      {/* Entity Card */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-3xl">
              {entity.entityType === 'student' ? '🎓' :
               entity.entityType === 'staff' ? '👔' :
               entity.entityType === 'asset' ? '📦' : '💻'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {entity.profile?.fullName || entity.identifiers?.student_id || 'Unknown'}
              </h2>
              <span className={`badge ${typeColors[entity.entityType]} mt-2`}>
                {entity.entityType}
              </span>
            </div>
          </div>
          
          {entity.alertStatus?.hasAlert && (
            <div className="bg-red-100 border border-red-200 rounded-lg p-3">
              <div className="flex items-center text-red-800 font-medium mb-1">
                <FiAlertCircle className="mr-2" />
                Active Alert
              </div>
              <p className="text-sm text-red-700">{entity.alertStatus.alertMessage}</p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Identifiers */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Identifiers</h3>
            <div className="space-y-2 text-sm">
              {entity.identifiers?.student_id && (
                <div>
                  <span className="text-gray-500">Student ID:</span>
                  <span className="ml-2 font-medium">{entity.identifiers.student_id}</span>
                </div>
              )}
              {entity.identifiers?.staff_id && (
                <div>
                  <span className="text-gray-500">Staff ID:</span>
                  <span className="ml-2 font-medium">{entity.identifiers.staff_id}</span>
                </div>
              )}
              {entity.identifiers?.card_id && (
                <div>
                  <span className="text-gray-500">Card ID:</span>
                  <span className="ml-2 font-medium">{entity.identifiers.card_id}</span>
                </div>
              )}
              {entity.identifiers?.email && (
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2 font-medium">{entity.identifiers.email}</span>
                </div>
              )}
              {entity.identifiers?.device_hash && (
                <div>
                  <span className="text-gray-500">Device:</span>
                  <span className="ml-2 font-mono text-xs">{entity.identifiers.device_hash.substring(0, 16)}...</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Profile */}
          {entity.profile && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Profile</h3>
              <div className="space-y-2 text-sm">
                {entity.profile.department && (
                  <div className="flex items-center">
                    <span className="text-gray-500">Department:</span>
                    <span className="ml-2 font-medium">{entity.profile.department}</span>
                  </div>
                )}
                {entity.profile.role && (
                  <div className="flex items-center">
                    <span className="text-gray-500">Role:</span>
                    <span className="ml-2 font-medium">{entity.profile.role}</span>
                  </div>
                )}
                {entity.profile.phoneNumber && (
                  <div className="flex items-center">
                    <span className="text-gray-500">Phone:</span>
                    <span className="ml-2 font-medium">{entity.profile.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Last Activity */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Last Activity</h3>
            <div className="space-y-2 text-sm">
              {entity.lastSeen?.timestamp && (
                <div>
                  <div className="flex items-center text-gray-500 mb-1">
                    <FiClock className="mr-2" size={14} />
                    <span>Time</span>
                  </div>
                  <p className="font-medium">{moment(entity.lastSeen.timestamp).format('MMM DD, YYYY HH:mm')}</p>
                  <p className="text-gray-500 text-xs">{moment(entity.lastSeen.timestamp).fromNow()}</p>
                </div>
              )}
              {entity.lastSeen?.location && (
                <div>
                  <div className="flex items-center text-gray-500 mb-1 mt-3">
                    <FiMapPin className="mr-2" size={14} />
                    <span>Location</span>
                  </div>
                  <p className="font-medium">{entity.lastSeen.location}</p>
                </div>
              )}
              {entity.lastSeen?.activity && (
                <div>
                  <div className="flex items-center text-gray-500 mb-1 mt-3">
                    <FiActivity className="mr-2" size={14} />
                    <span>Activity</span>
                  </div>
                  <p className="font-medium capitalize">{entity.lastSeen.activity}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Activity Count */}
        {entity.activityCount !== undefined && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Activities Recorded:</span>
              <span className="text-2xl font-bold text-primary-600">{entity.activityCount}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Predictions and Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Location Prediction */}
        {prediction && prediction.prediction && (
          <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">
              🔮 Predicted Next Location
            </h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3">
                <p className="font-medium text-gray-900">{prediction.prediction.locationId}</p>
                <p className="text-sm text-gray-600">
                  Confidence: {(prediction.confidence * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-sm text-purple-800">
                <p className="font-medium mb-1">Evidence:</p>
                <ul className="space-y-1">
                  {prediction.evidence.map((e, i) => (
                    <li key={i}>• {e}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Anomalies */}
        {anomalies && anomalies.hasAnomalies && (
          <div className="card bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200">
            <h3 className="text-lg font-semibold text-orange-900 mb-4">
              ⚠️ Detected Anomalies (24h)
            </h3>
            <div className="space-y-2">
              {anomalies.anomalies.slice(0, 3).map((anomaly, i) => (
                <div key={i} className="bg-white rounded-lg p-3">
                  <p className="font-medium text-gray-900 capitalize">{anomaly.type.replace('_', ' ')}</p>
                  <p className="text-sm text-gray-700">{anomaly.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {moment(anomaly.timestamp).format('MMM DD, HH:mm')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex items-center space-x-4">
        <Link to={`/timeline/${entity._id}`} className="btn-primary flex items-center space-x-2">
          <FiActivity size={18} />
          <span>View Timeline</span>
        </Link>
        <button className="btn-secondary">
          Export Report
        </button>
      </div>
    </div>
  );
};

export default EntityDetails;
