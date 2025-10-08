import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import EntityCard from '../components/EntityCard';
import { entityAPI } from '../services/api';

const EntitySearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [entityType, setEntityType] = useState('');
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  useEffect(() => {
    fetchAllEntities();
  }, []);
  
  const fetchAllEntities = async () => {
    try {
      setLoading(true);
      const response = await entityAPI.getAll('', 1, 50);
      setEntities(response.data.data);
    } catch (error) {
      console.error('Error fetching entities:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim() && !entityType) {
      fetchAllEntities();
      return;
    }
    
    try {
      setLoading(true);
      setHasSearched(true);
      const response = await entityAPI.search(searchQuery, entityType, 50);
      setEntities(response.data.data);
    } catch (error) {
      console.error('Error searching entities:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    setSearchQuery('');
    setEntityType('');
    setHasSearched(false);
    fetchAllEntities();
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Entity Search</h1>
        <p className="text-gray-600 mt-1">Search for students, staff, assets, or devices</p>
      </div>
      
      {/* Search Form */}
      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Query
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter name, ID, email, or card number..."
                  className="input-field pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entity Type
              </label>
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="input-field pl-10"
                >
                  <option value="">All Types</option>
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="asset">Asset</option>
                  <option value="device">Device</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button type="submit" className="btn-primary">
              Search
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
      
      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {hasSearched ? 'Search Results' : 'All Entities'}
            <span className="text-gray-500 font-normal ml-2">({entities.length})</span>
          </h2>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : entities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entities.map((entity) => (
              <EntityCard key={entity._id} entity={entity} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <FiSearch size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 text-lg">
              {hasSearched ? 'No entities found matching your search' : 'No entities available'}
            </p>
            {hasSearched && (
              <button onClick={handleReset} className="btn-primary mt-4">
                View All Entities
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntitySearch;
