import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Download, Settings, Users, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';

const StudentManagementSystem = () => {
  // State management
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
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

  // Pagination states
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1
  });

  // Debounce timer for search
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Connection status
  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle, testing, success, error

  // Load saved configuration
  useEffect(() => {
    const savedBaseUrl = localStorage.getItem('react-student-ui-baseUrl');
    const savedAuthToken = localStorage.getItem('react-student-ui-authToken');
    
    if (savedBaseUrl) {
      setApiConfig(prev => ({ ...prev, baseUrl: savedBaseUrl }));
    }
    if (savedAuthToken) {
      setApiConfig(prev => ({ ...prev, authToken: savedAuthToken }));
    }
  }, []);

  // Auto-load students on component mount
  useEffect(() => {
    loadStudents();
  }, []);

  // Load students when filters or pagination change (with debounce for filters)
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      // Reset to page 1 when filters change
      if (pagination.page > 1) {
        setPagination(prev => ({ ...prev, page: 1 }));
      } else {
        loadStudents();
      }
    }, 500); // 500ms debounce

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [filters]);

  // Load students when pagination changes
  useEffect(() => {
    loadStudents();
  }, [pagination.page, pagination.limit]);

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

  // Build query parameters for your existing API structure
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    
    // Add pagination
    params.append('page', pagination.page.toString());
    params.append('limit', pagination.limit.toString());
    
    // Add filters (only if they have values) - matching your API structure
    if (filters.firstName.trim()) {
      params.append('firstName', filters.firstName.trim());
    }
    if (filters.lastName.trim()) {
      params.append('lastName', filters.lastName.trim());
    }
    if (filters.email.trim()) {
      params.append('email', filters.email.trim());
    }
    if (filters.status) {
      params.append('status', filters.status);
    }
    
    return params.toString();
  }, [filters, pagination]);

  // Test API connection using your existing endpoint
  const testConnection = async () => {
    setConnectionStatus('testing');
    setError('');
    
    try {
      const config = getApiConfig();
      // Test with your existing search endpoint
      const response = await fetch(`${config.baseURL}/student/search?limit=1`, {
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

  // Load students from API using your existing search endpoint
  const loadStudents = async () => {
    setLoading(true);
    setError('');
    
    try {
      const config = getApiConfig();
      const queryParams = buildQueryParams();
      // Use your existing /api/student/search endpoint
      const url = `${config.baseURL}/student/search?${queryParams}`;
      
      console.log('API Call URL:', url); // Debug log to see the actual URL being called
      
      const response = await fetch(url, {
        method: 'GET',
        headers: config.headers,
        signal: AbortSignal.timeout(config.timeout)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data); // Debug log to see the response structure
      
      // Handle different response formats from your API
      if (data.students && Array.isArray(data.students)) {
        // Paginated response format: { students: [...], total: 100, ... }
        setStudents(data.students);
        setTotalCount(data.total || data.students.length);
        setPagination(prev => ({
          ...prev,
          totalPages: Math.ceil((data.total || data.students.length) / prev.limit)
        }));
      } else if (Array.isArray(data)) {
        // Simple array response: [student1, student2, ...]
        setStudents(data);
        setTotalCount(data.length);
        setPagination(prev => ({
          ...prev,
          totalPages: Math.ceil(data.length / prev.limit)
        }));
      } else if (data.data && Array.isArray(data.data)) {
        // Wrapped response format: { data: [...], count: 100 }
        setStudents(data.data);
        setTotalCount(data.count || data.total || data.data.length);
        setPagination(prev => ({
          ...prev,
          totalPages: Math.ceil((data.count || data.total || data.data.length) / prev.limit)
        }));
      } else {
        throw new Error('Invalid response format from API');
      }
      
    } catch (error) {
      console.error('Load Students Error:', error); // Debug log
      setError(`Failed to load students: ${error.message}`);
      setStudents([]);
      setTotalCount(0);
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

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newLimit) => {
    setPagination(prev => ({ 
      ...prev, 
      limit: parseInt(newLimit), 
      page: 1 // Reset to first page
    }));
  };

  // Handle API config changes
  const handleApiConfigChange = (field, value) => {
    setApiConfig(prev => ({ ...prev, [field]: value }));
    localStorage.setItem(`react-student-ui-${field}`, value);
  };

  // Export to CSV using your existing search endpoint
  const exportToCSV = async () => {
    try {
      setLoading(true);
      const config = getApiConfig();
      
      // Get all filtered results for export using your search endpoint
      const exportParams = new URLSearchParams();
      if (filters.firstName.trim()) exportParams.append('firstName', filters.firstName.trim());
      if (filters.lastName.trim()) exportParams.append('lastName', filters.lastName.trim());
      if (filters.email.trim()) exportParams.append('email', filters.email.trim());
      if (filters.status) exportParams.append('status', filters.status);
      // Remove pagination for export - get all results
      exportParams.append('limit', '1000'); // Set a high limit or check if your API supports getting all
      
      const response = await fetch(`${config.baseURL}/student/search?${exportParams.toString()}`, {
        method: 'GET',
        headers: config.headers,
        signal: AbortSignal.timeout(config.timeout)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Export API Response:', data); // Debug log
      
      // Handle different response formats
      let exportData = [];
      if (data.students && Array.isArray(data.students)) {
        exportData = data.students;
      } else if (Array.isArray(data)) {
        exportData = data;
      } else if (data.data && Array.isArray(data.data)) {
        exportData = data.data;
      }
      
      if (exportData.length === 0) {
        alert('No students to export with current filters');
        return;
      }
      
      const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Status', 'Enrollment Date'];
      const csvContent = [
        headers.join(','),
        ...exportData.map(student => [
          student.id || '',
          `"${student.firstName || ''}"`,
          `"${student.lastName || ''}"`,
          student.email || '',
          student.status || '',
          formatDate(student.enrollmentDate || student.createdAt)
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students-filtered-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export Error:', error); // Debug log
      setError(`Export failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
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

  // Pagination component
  const Pagination = () => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      const halfVisible = Math.floor(maxVisiblePages / 2);
      
      let startPage = Math.max(1, pagination.page - halfVisible);
      let endPage = Math.min(pagination.totalPages, pagination.page + halfVisible);
      
      // Adjust if we're near the beginning or end
      if (endPage - startPage + 1 < maxVisiblePages) {
        if (startPage === 1) {
          endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);
        } else {
          startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      return pages;
    };

    if (pagination.totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Show</span>
          <select
            value={pagination.limit}
            onChange={(e) => handlePageSizeChange(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span>per page</span>
          <span className="ml-4">
            Showing {Math.min((pagination.page - 1) * pagination.limit + 1, totalCount)} to{' '}
            {Math.min(pagination.page * pagination.limit, totalCount)} of {totalCount} results
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={pagination.page === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            First
          </button>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {getPageNumbers().map(pageNum => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-1 text-sm border rounded ${
                pageNum === pagination.page
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
          <button
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Last
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Student Management System</h1>
          </div>
          <p className="text-indigo-100 text-lg">Server-side filtering with real-time React integration</p>
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
            <h2 className="text-xl font-bold text-gray-800">Server-Side Filters</h2>
            {loading && (
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin ml-2" />
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
              <label className="block text-sm font-semibrel text-gray-700 mb-2">Email</label>
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
              onClick={loadStudents}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 hover:shadow-lg"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
            <button
              onClick={exportToCSV}
              disabled={loading || students.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
            >
              <Download className="w-4 h-4" />
              Export Filtered Data
            </button>
          </div>
        </div>

        {/* Student List Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">Students List</h2>
            </div>
            <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {totalCount} total students
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-gray-600 text-lg">Loading students...</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && students.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Students Found</h3>
              <p className="text-gray-500">Try adjusting your filters or add some students to get started.</p>
            </div>
          )}

          {/* Student Table */}
          {!loading && students.length > 0 && (
            <>
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
              
              {/* Pagination */}
              <Pagination />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentManagementSystem;