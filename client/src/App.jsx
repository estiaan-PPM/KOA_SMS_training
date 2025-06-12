import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, Download, Settings, Users, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';

const StudentManagementSystem = () => {
  // State management
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiConfig, setApiConfig] = useState({
    baseUrl: 'http://localhost:3000/api',
    authToken: ''
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    firstName: '',
    lastName: '',
    email: '',
    status: ''
  });

  // Connection status
  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle, testing, success, error

  // Load saved configuration
  useEffect(() => {
    const savedConfig = JSON.parse(localStorage.getItem('react-student-ui-config') || '{}');
    if (savedConfig.baseUrl) {
      setApiConfig(prev => ({ ...prev, baseUrl: savedConfig.baseUrl }));
    }
    if (savedConfig.authToken) {
      setApiConfig(prev => ({ ...prev, authToken: savedConfig.authToken }));
    }
  }, []);

  // Auto-load students on component mount
  useEffect(() => {
    loadStudents();
  }, []);

  // Load students when filters change (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadStudents();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters]);

  // API configuration
  const getApiConfig = () => ({
    baseURL: apiConfig.baseUrl.trim(),
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      ...(apiConfig.authToken.trim() && {
        'Authorization': `Bearer ${apiConfig.authToken.trim()}`
      })
    }
  });

  // Build query parameters from filters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim()) {
        params.append(key, value.trim());
      }
    });
    
    return params.toString();
  };

  // Test API connection
  const testConnection = async () => {
    setConnectionStatus('testing');
    setError('');
    
    try {
      const config = getApiConfig();
      const response = await fetch(`${config.baseURL}/students`, {
        method: 'GET',
        headers: config.headers,
        signal: AbortSignal.timeout(config.timeout)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      setConnectionStatus('success');
      setTimeout(() => setConnectionStatus('idle'), 3000);
      
      // Auto-load students after successful connection
      await loadStudents();
      
    } catch (error) {
      setConnectionStatus('error');
      setError(`Connection failed: ${error.message}`);
      setTimeout(() => setConnectionStatus('idle'), 3000);
    }
  };

  // Load students from API with server-side filtering
  const loadStudents = async () => {
    setLoading(true);
    setError('');
    
    try {
      const config = getApiConfig();
      const queryParams = buildQueryParams();
      
      // Use search endpoint if filters are applied, otherwise use regular endpoint
      const endpoint = queryParams 
        ? `${config.baseURL}/students/search?${queryParams}`
        : `${config.baseURL}/students`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: config.headers,
        signal: AbortSignal.timeout(config.timeout)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
      
    } catch (error) {
      setError(`Failed to load students: ${error.message}`);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      firstName: '',
      lastName: '',
      email: '',
      status: ''
    });
  };

  // Handle API config changes
  const handleApiConfigChange = (field, value) => {
    const newConfig = { ...apiConfig, [field]: value };
    setApiConfig(newConfig);
    
    // Save to localStorage
    const savedConfig = JSON.parse(localStorage.getItem('react-student-ui-config') || '{}');
    savedConfig[field] = value;
    localStorage.setItem('react-student-ui-config', JSON.stringify(savedConfig));
  };

  // Manual refresh
  const handleRefresh = () => {
    loadStudents();
  };

  // Format date utility
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get full name
  const getFullName = (student) => {
    const firstName = student.firstName || '';
    const lastName = student.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'N/A';
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
      switch (status?.toLowerCase()) {
        case 'active':
          return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
        case 'inactive':
          return { color: 'bg-red-100 text-red-800', icon: X };
        case 'pending':
          return { color: 'bg-yellow-100 text-yellow-800', icon: Clock };
        default:
          return { color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
      }
    };

    const config = getStatusConfig(status);
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase ${config.color}`}>
        <IconComponent size={12} />
        {status || 'Unknown'}
      </span>
    );
  };

  // Connection status indicator
  const ConnectionIndicator = () => {
    switch (connectionStatus) {
      case 'testing':
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <Settings className="w-4 h-4 text-gray-600" />;
    }
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value && value.trim());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Student Management System</h1>
          </div>
          <p className="text-indigo-100 text-lg">Manage and filter students with server-side API filtering</p>
        </div>

        {/* API Configuration */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-lg border border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="font-semibold text-gray-700 whitespace-nowrap">API Base URL:</label>
              <input
                type="text"
                value={apiConfig.baseUrl}
                onChange={(e) => handleApiConfigChange('baseUrl', e.target.value)}
                placeholder="http://localhost:3000/api"
                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors min-w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="font-semibold text-gray-700 whitespace-nowrap">Auth Token:</label>
              <input
                type="password"
                value={apiConfig.authToken}
                onChange={(e) => handleApiConfigChange('authToken', e.target.value)}
                placeholder="Bearer token (optional)"
                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors min-w-48"
              />
            </div>
            <button
              onClick={testConnection}
              disabled={connectionStatus === 'testing'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
            >
              <ConnectionIndicator />
              {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Search className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-800">Filter Students</h2>
            {hasActiveFilters && (
              <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-semibold">
                Filters Active
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                value={filters.firstName}
                onChange={(e) => handleFilterChange('firstName', e.target.value)}
                placeholder="Search by first name..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                value={filters.lastName}
                onChange={(e) => handleFilterChange('lastName', e.target.value)}
                placeholder="Search by last name..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="text"
                value={filters.email}
                onChange={(e) => handleFilterChange('email', e.target.value)}
                placeholder="Search by email..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Student List Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">Students List</h2>
              {hasActiveFilters && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                  Filtered Results
                </span>
              )}
            </div>
            <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {students.length} {hasActiveFilters ? 'filtered ' : ''}students
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-gray-600 text-lg">
                {hasActiveFilters ? 'Searching students...' : 'Loading students...'}
              </span>
            </div>
          )}

          {/* Empty State */}
          {!loading && students.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {hasActiveFilters ? 'No Students Match Your Filters' : 'No Students Found'}
              </h3>
              <p className="text-gray-500">
                {hasActiveFilters 
                  ? 'Try adjusting your search criteria or clear the filters to see all students.'
                  : 'Try adjusting your filters or add some students to get started.'
                }
              </p>
            </div>
          )}

          {/* Student Table */}
          {!loading && students.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">First Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Last Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Enrollment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student, index) => (
                    <tr key={student.id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.firstName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.lastName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={student.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(student.enrollmentDate || student.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentManagementSystem;