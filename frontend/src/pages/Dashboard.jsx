import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiAlertTriangle, FiActivity, FiTrendingUp } from 'react-icons/fi';
import StatCard from '../components/StatCard';
import AlertCard from '../components/AlertCard';
import { entityAPI, alertAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [alertStats, setAlertStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [entityStatsRes, alertsRes, alertStatsRes] = await Promise.all([
        entityAPI.getStats(),
        alertAPI.getAlerts('active'),
        alertAPI.getStats(24)
      ]);
      
      setStats(entityStatsRes.data.data);
      setAlerts(alertsRes.data.data.slice(0, 5)); // Top 5 alerts
      setAlertStats(alertStatsRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCheckAlerts = async () => {
    try {
      await alertAPI.checkAlerts(12);
      fetchDashboardData();
    } catch (error) {
      console.error('Error checking alerts:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Campus Security Monitoring Overview</p>
        </div>
        <button
          onClick={handleCheckAlerts}
          className="btn-primary flex items-center space-x-2"
        >
          <FiActivity size={18} />
          <span>Run Alert Check</span>
        </button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Entities"
          value={stats?.total || 0}
          icon={FiUsers}
          color="blue"
          subtitle={`${stats?.byType?.student || 0} students, ${stats?.byType?.staff || 0} staff`}
        />
        <StatCard
          title="Active Alerts"
          value={alertStats?.activeAlerts || 0}
          icon={FiAlertTriangle}
          color="red"
          subtitle={`${alertStats?.resolvedAlerts || 0} resolved today`}
        />
        <StatCard
          title="Entities with Alerts"
          value={stats?.withAlerts || 0}
          icon={FiAlertTriangle}
          color="yellow"
          subtitle="Require attention"
        />
        <StatCard
          title="Activity Rate"
          value="92%"
          icon={FiTrendingUp}
          color="green"
          subtitle="System operational"
        />
      </div>
      
      {/* Entity Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Entity Types</h3>
          <div className="space-y-3">
            {stats?.byType && Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    type === 'student' ? 'bg-blue-500' :
                    type === 'staff' ? 'bg-green-500' :
                    type === 'asset' ? 'bg-purple-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="capitalize font-medium">{type}</span>
                </div>
                <span className="text-gray-600 font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Alert Distribution (24h)</h3>
          <div className="grid grid-cols-2 gap-4">
            {alertStats?.byType && Object.entries(alertStats.byType).map(([type, count]) => (
              <div key={type} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recent Alerts */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Active Alerts</h3>
          <Link to="/alerts" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            View All →
          </Link>
        </div>
        
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertCard
                key={alert._id}
                alert={alert}
                onAcknowledge={() => {}}
                onResolve={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FiAlertTriangle size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No active alerts</p>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/search" className="card hover:shadow-xl transition-all group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition">
              <FiUsers className="text-blue-600" size={24} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Search Entities</h4>
              <p className="text-sm text-gray-600">Find students, staff, or assets</p>
            </div>
          </div>
        </Link>
        
        <Link to="/alerts" className="card hover:shadow-xl transition-all group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition">
              <FiAlertTriangle className="text-red-600" size={24} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Manage Alerts</h4>
              <p className="text-sm text-gray-600">Review and resolve alerts</p>
            </div>
          </div>
        </Link>
        
        <Link to="/analytics" className="card hover:shadow-xl transition-all group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition">
              <FiTrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">View Analytics</h4>
              <p className="text-sm text-gray-600">Insights and trends</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
