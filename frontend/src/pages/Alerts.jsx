import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiFilter } from 'react-icons/fi';
import AlertCard from '../components/AlertCard';
import { alertAPI } from '../services/api';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  
  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, typeFilter, severityFilter]);
  
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await alertAPI.getAlerts(statusFilter, typeFilter, severityFilter);
      setAlerts(response.data.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAcknowledge = async (alertId) => {
    try {
      await alertAPI.acknowledge(alertId, 'Security Team');
      fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };
  
  const handleResolve = async (alertId) => {
    const notes = prompt('Enter resolution notes (optional):');
    try {
      await alertAPI.resolve(alertId, 'Security Team', notes || 'Resolved');
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };
  
  const handleCheckAlerts = async () => {
    try {
      setLoading(true);
      await alertAPI.checkAlerts(12);
      await fetchAlerts();
      alert('Alert check completed!');
    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  };
  
  const activeCount = alerts.filter(a => a.status === 'active').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alert Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage security alerts</p>
        </div>
        <button
          onClick={handleCheckAlerts}
          className="btn-primary flex items-center space-x-2"
          disabled={loading}
        >
          <FiAlertTriangle size={18} />
          <span>Run Alert Check</span>
        </button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-red-50 to-orange-50 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700 mb-1">Active Alerts</p>
              <p className="text-3xl font-bold text-red-900">{activeCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <FiAlertTriangle className="text-white" size={24} />
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700 mb-1">Critical</p>
              <p className="text-3xl font-bold text-orange-900">{criticalCount}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <FiAlertTriangle className="text-white" size={24} />
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">Total Alerts</p>
              <p className="text-3xl font-bold text-green-900">{alerts.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <FiFilter className="text-gray-600" />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="inactive">Inactive</option>
              <option value="anomaly">Anomaly</option>
              <option value="unauthorized_access">Unauthorized Access</option>
              <option value="missing">Missing</option>
              <option value="suspicious_pattern">Suspicious Pattern</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Alerts List */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">
          Alerts ({alerts.length})
        </h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertCard
                key={alert._id}
                alert={alert}
                onAcknowledge={handleAcknowledge}
                onResolve={handleResolve}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiCheckCircle size={48} className="mx-auto mb-4 text-green-500" />
            <p className="text-gray-600 text-lg">No alerts found</p>
            <p className="text-gray-500 text-sm mt-2">All clear! No alerts match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
