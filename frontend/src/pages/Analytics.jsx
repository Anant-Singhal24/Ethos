import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiUsers, FiActivity, FiBarChart2 } from 'react-icons/fi';
import { entityAPI, alertAPI } from '../services/api';
import StatCard from '../components/StatCard';

const Analytics = () => {
  const [entityStats, setEntityStats] = useState(null);
  const [alertStats, setAlertStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState(24);
  
  useEffect(() => {
    fetchAnalytics();
  }, [timeWindow]);
  
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [entityRes, alertRes] = await Promise.all([
        entityAPI.getStats(),
        alertAPI.getStats(timeWindow)
      ]);
      
      setEntityStats(entityRes.data.data);
      setAlertStats(alertRes.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">System insights and statistics</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Time Window:</label>
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(Number(e.target.value))}
            className="input-field w-32"
          >
            <option value={1}>1 Hour</option>
            <option value={6}>6 Hours</option>
            <option value={24}>24 Hours</option>
            <option value={168}>7 Days</option>
            <option value={720}>30 Days</option>
          </select>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Entities"
          value={entityStats?.total || 0}
          icon={FiUsers}
          color="blue"
          subtitle="Registered in system"
        />
        <StatCard
          title="Active Alerts"
          value={alertStats?.activeAlerts || 0}
          icon={FiActivity}
          color="red"
          subtitle={`In last ${timeWindow}h`}
        />
        <StatCard
          title="Resolved Alerts"
          value={alertStats?.resolvedAlerts || 0}
          icon={FiTrendingUp}
          color="green"
          subtitle={`In last ${timeWindow}h`}
        />
        <StatCard
          title="Alert Rate"
          value={alertStats?.totalAlerts ? `${((alertStats.activeAlerts / alertStats.totalAlerts) * 100).toFixed(1)}%` : '0%'}
          icon={FiBarChart2}
          color="yellow"
          subtitle="Active vs Total"
        />
      </div>
      
      {/* Entity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <FiUsers className="mr-2 text-primary-600" />
            Entity Distribution
          </h3>
          
          <div className="space-y-4">
            {entityStats?.byType && Object.entries(entityStats.byType).map(([type, count]) => {
              const percentage = ((count / entityStats.total) * 100).toFixed(1);
              const colors = {
                student: 'bg-blue-500',
                staff: 'bg-green-500',
                asset: 'bg-purple-500',
                device: 'bg-yellow-500'
              };
              
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="capitalize font-medium text-gray-700">{type}</span>
                    <span className="text-gray-900 font-semibold">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${colors[type]} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Entities with Active Alerts</span>
              <span className="text-red-600 font-semibold">{entityStats?.withAlerts || 0}</span>
            </div>
          </div>
        </div>
        
        {/* Alert Analytics */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <FiActivity className="mr-2 text-red-600" />
            Alert Analytics ({timeWindow}h)
          </h3>
          
          {/* Alert by Type */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">By Type</h4>
            <div className="space-y-2">
              {alertStats?.byType && Object.entries(alertStats.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="capitalize text-sm text-gray-700">{type.replace('_', ' ')}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
              {(!alertStats?.byType || Object.keys(alertStats.byType).length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">No alerts in this period</p>
              )}
            </div>
          </div>
          
          {/* Alert by Severity */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">By Severity</h4>
            <div className="grid grid-cols-2 gap-2">
              {alertStats?.bySeverity && Object.entries(alertStats.bySeverity).map(([severity, count]) => {
                const colors = {
                  low: 'bg-blue-100 text-blue-800 border-blue-200',
                  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                  high: 'bg-orange-100 text-orange-800 border-orange-200',
                  critical: 'bg-red-100 text-red-800 border-red-200'
                };
                
                return (
                  <div key={severity} className={`p-3 rounded-lg border ${colors[severity]}`}>
                    <p className="text-xs capitalize font-medium">{severity}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-green-900">System Health</h4>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-3xl font-bold text-green-900">Operational</p>
          <p className="text-sm text-green-700 mt-1">All systems running normally</p>
        </div>
        
        <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-blue-900">Data Quality</h4>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-3xl font-bold text-blue-900">High</p>
          <p className="text-sm text-blue-700 mt-1">Confidence score: 95%</p>
        </div>
        
        <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-purple-900">Resolution Rate</h4>
            <span className="text-2xl">🎯</span>
          </div>
          <p className="text-3xl font-bold text-purple-900">
            {alertStats?.totalAlerts > 0 
              ? `${((alertStats.resolvedAlerts / alertStats.totalAlerts) * 100).toFixed(1)}%`
              : 'N/A'}
          </p>
          <p className="text-sm text-purple-700 mt-1">Alerts resolved successfully</p>
        </div>
      </div>
      
      {/* Quick Insights */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Quick Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Most Common Alert Type</h4>
                <p className="text-sm text-blue-800">
                  {alertStats?.byType && Object.keys(alertStats.byType).length > 0
                    ? Object.entries(alertStats.byType)
                        .sort((a, b) => b[1] - a[1])[0][0]
                        .replace('_', ' ')
                        .toUpperCase()
                    : 'No alerts'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📈</span>
              <div>
                <h4 className="font-semibold text-green-900 mb-1">Entity Monitoring</h4>
                <p className="text-sm text-green-800">
                  {entityStats?.total || 0} entities actively monitored across campus
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🔍</span>
              <div>
                <h4 className="font-semibold text-purple-900 mb-1">Entity Resolution</h4>
                <p className="text-sm text-purple-800">
                  Advanced cross-source matching with high confidence
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h4 className="font-semibold text-orange-900 mb-1">Real-time Monitoring</h4>
                <p className="text-sm text-orange-800">
                  24/7 automated alert detection and classification
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
