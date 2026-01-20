// src/pages/Verification/index.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  HiCheck, 
  HiX, 
  HiEye, 
  HiClock, 
  HiCheckCircle, 
  HiXCircle,
  HiUser,
  HiPhone,
  HiMail,
  HiLocationMarker,
  HiBriefcase,
  HiTag,
  HiDocumentText,
  HiChevronDown,
  HiChevronUp,
  HiFilter,
  HiDownload
} from 'react-icons/hi';
import { serviceProviderService } from '../../services/serviceProviderService';
import DataTable from '../../components/Common/DataTable';

const Verification = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    date: 'all',
    sortBy: 'newest'
  });

  // Fetch service providers from Firestore
  useEffect(() => {
    fetchServiceProviders();
  }, []);

  const fetchServiceProviders = async () => {
    try {
      setLoading(true);
      const data = await serviceProviderService.getServiceProviders();
      setRequests(data);
      
      // Calculate stats
      const counts = serviceProviderService.getStatusCounts(data);
      setStats(counts);
    } catch (error) {
      console.error('Error fetching service providers:', error);
      toast.error('Failed to load verification requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (providerId) => {
    try {
      await serviceProviderService.updateAccountStatus(providerId, 'accepted');
      
      // Update local state
      setRequests(requests.map(req => 
        req.id === providerId ? { 
          ...req, 
          accountStatus: 'accepted',
          reviewedAt: new Date().toISOString()
        } : req
      ));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        accepted: prev.accepted + 1
      }));

      // Remove from selected if present
      setSelectedRequests(prev => prev.filter(id => id !== providerId));
      
      toast.success('Account approved successfully!');
    } catch (error) {
      console.error('Error approving account:', error);
      toast.error('Failed to approve account');
    }
  };

  const handleReject = async (providerId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      await serviceProviderService.updateAccountStatus(providerId, 'rejected', reason);
      
      // Update local state
      setRequests(requests.map(req => 
        req.id === providerId ? { 
          ...req, 
          accountStatus: 'rejected',
          reason: reason,
          reviewedAt: new Date().toISOString()
        } : req
      ));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        rejected: prev.rejected + 1
      }));

      // Remove from selected if present
      setSelectedRequests(prev => prev.filter(id => id !== providerId));
      
      toast.success('Account rejected successfully!');
    } catch (error) {
      console.error('Error rejecting account:', error);
      toast.error('Failed to reject account');
    }
  };

  // Bulk actions
  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) {
      toast.error('Please select at least one request');
      return;
    }

    if (!window.confirm(`Approve ${selectedRequests.length} selected requests?`)) return;

    try {
      const promises = selectedRequests.map(id => 
        serviceProviderService.updateAccountStatus(id, 'accepted')
      );
      await Promise.all(promises);
      
      // Update local state
      setRequests(requests.map(req => 
        selectedRequests.includes(req.id) ? { 
          ...req, 
          accountStatus: 'accepted',
          reviewedAt: new Date().toISOString()
        } : req
      ));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - selectedRequests.length),
        accepted: prev.accepted + selectedRequests.length
      }));
      
      setSelectedRequests([]);
      setSelectAll(false);
      toast.success(`${selectedRequests.length} requests approved successfully!`);
    } catch (error) {
      console.error('Error bulk approving:', error);
      toast.error('Failed to approve selected requests');
    }
  };

  const handleBulkReject = async () => {
    if (selectedRequests.length === 0) {
      toast.error('Please select at least one request');
      return;
    }

    const reason = prompt('Enter rejection reason for all selected requests:');
    if (!reason) return;

    if (!window.confirm(`Reject ${selectedRequests.length} selected requests?`)) return;

    try {
      const promises = selectedRequests.map(id => 
        serviceProviderService.updateAccountStatus(id, 'rejected', reason)
      );
      await Promise.all(promises);
      
      // Update local state
      setRequests(requests.map(req => 
        selectedRequests.includes(req.id) ? { 
          ...req, 
          accountStatus: 'rejected',
          reason: reason,
          reviewedAt: new Date().toISOString()
        } : req
      ));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - selectedRequests.length),
        rejected: prev.rejected + selectedRequests.length
      }));
      
      setSelectedRequests([]);
      setSelectAll(false);
      toast.success(`${selectedRequests.length} requests rejected successfully!`);
    } catch (error) {
      console.error('Error bulk rejecting:', error);
      toast.error('Failed to reject selected requests');
    }
  };

  // Selection handling
  const handleSelectRequest = (id) => {
    setSelectedRequests(prev => 
      prev.includes(id) 
        ? prev.filter(reqId => reqId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRequests([]);
    } else {
      const pendingIds = filteredRequests
        .filter(req => req.accountStatus === 'pending')
        .map(req => req.id);
      setSelectedRequests(pendingIds);
    }
    setSelectAll(!selectAll);
  };

  // Filter and sort requests
  const filteredRequests = requests.filter(request => {
    if (filter !== 'all' && request.accountStatus !== filter) return false;
    
    if (filters.category !== 'all' && request.serviceCategory !== filters.category) return false;
    
    // Date filtering (simplified)
    if (filters.date !== 'all') {
      const requestDate = new Date(request.createdAt);
      const now = new Date();
      const diffDays = Math.floor((now - requestDate) / (1000 * 60 * 60 * 24));
      
      switch (filters.date) {
        case 'today': return diffDays === 0;
        case 'week': return diffDays <= 7;
        case 'month': return diffDays <= 30;
        default: return true;
      }
    }
    
    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest': 
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest': 
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'name': 
        return a.name.localeCompare(b.name);
      default: 
        return 0;
    }
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <HiClock className="h-5 w-5 text-yellow-500" />;
      case 'accepted': return <HiCheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected': return <HiXCircle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Export functionality
  const handleExport = () => {
    const dataToExport = filteredRequests.map(request => ({
      Name: request.name,
      Email: request.email,
      Phone: request.phone,
      City: request.city,
      Category: request.serviceCategory,
      Status: request.accountStatus,
      'Submitted Date': request.formattedDate,
      'Reviewed Date': request.reviewedAt ? new Date(request.reviewedAt).toLocaleDateString() : 'N/A',
      'Rejection Reason': request.reason || 'N/A'
    }));

    // Convert to CSV
    const csvContent = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `verification_requests_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Data exported successfully!');
  };

  // Responsive table columns
  const tableColumns = [
    {
      Header: (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Select</span>
        </div>
      ),
      accessor: 'select',
      Cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedRequests.includes(row.original.id)}
          onChange={() => handleSelectRequest(row.original.id)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          disabled={row.original.accountStatus !== 'pending'}
        />
      ),
      width: 80
    },
    {
      Header: 'Provider',
      accessor: 'name',
      Cell: ({ value, row }) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
            {value?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{value}</p>
            <p className="text-sm text-gray-600 truncate">{row.original.email}</p>
          </div>
        </div>
      )
    },
    {
      Header: 'Contact',
      accessor: 'phone',
      Cell: ({ value, row }) => (
        <div>
          <p className="text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{row.original.city}</p>
        </div>
      )
    },
    {
      Header: 'Service',
      accessor: 'serviceCategory',
      Cell: ({ value, row }) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{row.original.serviceType}</p>
        </div>
      )
    },
    {
      Header: 'Status',
      accessor: 'accountStatus',
      Cell: ({ value }) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      Header: 'Date',
      accessor: 'formattedDate',
      Cell: ({ value, row }) => (
        <div>
          <p className="text-gray-900">{value}</p>
          {row.original.reviewedAt && (
            <p className="text-xs text-gray-500">Reviewed: {new Date(row.original.reviewedAt).toLocaleDateString()}</p>
          )}
        </div>
      )
    },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Link
            to={`/verification/${row.original.id}`}
            state={{ provider: row.original }}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            title="View Details"
          >
            <HiEye className="h-4 w-4" />
          </Link>
          {row.original.accountStatus === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(row.original.id)}
                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                title="Approve"
              >
                <HiCheck className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleReject(row.original.id)}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                title="Reject"
              >
                <HiX className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Service Provider Verification</h1>
          <p className="text-sm sm:text-base text-gray-600">Review and manage service provider account requests</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center space-x-2"
          >
            <HiDownload className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center space-x-2"
          >
            <HiFilter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {showFilters ? <HiChevronUp className="h-4 w-4" /> : <HiChevronDown className="h-4 w-4" />}
          </button>
          
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
            >
              Grid
            </button>
            
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Painter">Painter</option>
                {/* Add more categories */}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filters.date}
                onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedRequests.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-blue-800">
              {selectedRequests.length} request{selectedRequests.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedRequests([])}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear selection
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleBulkApprove}
              className="btn-success flex items-center space-x-2"
            >
              <HiCheck className="h-4 w-4" />
              <span>Approve Selected</span>
            </button>
            <button
              onClick={handleBulkReject}
              className="btn-danger flex items-center space-x-2"
            >
              <HiX className="h-4 w-4" />
              <span>Reject Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs - Mobile Responsive */}
      <div className="overflow-x-auto">
        <div className="flex space-x-2 border-b border-gray-200 min-w-max">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 sm:px-4 py-2 font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              filter === 'all' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All <span className="hidden sm:inline">({stats.total})</span>
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 sm:px-4 py-2 font-medium rounded-t-lg transition-colors flex items-center space-x-1 sm:space-x-2 whitespace-nowrap ${
              filter === 'pending' 
                ? 'text-yellow-600 border-b-2 border-yellow-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <HiClock className="h-4 w-4" />
            <span>Pending</span>
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              {stats.pending}
            </span>
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-3 sm:px-4 py-2 font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              filter === 'accepted' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Accepted <span className="hidden sm:inline">({stats.accepted})</span>
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 sm:px-4 py-2 font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              filter === 'rejected' 
                ? 'text-red-600 border-b-2 border-red-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Rejected <span className="hidden sm:inline">({stats.rejected})</span>
          </button>
        </div>
      </div>

      {/* Stats Summary - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Providers</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-1 sm:p-2 bg-blue-50 rounded-lg">
              <HiUser className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Pending Review</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <div className="p-1 sm:p-2 bg-yellow-50 rounded-lg">
              <HiClock className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Approved</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.accepted}</p>
            </div>
            <div className="p-1 sm:p-2 bg-green-50 rounded-lg">
              <HiCheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Rejected</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
            <div className="p-1 sm:p-2 bg-red-50 rounded-lg">
              <HiXCircle className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Requests Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <HiCheckCircle className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No verification requests</h3>
          <p className="text-sm text-gray-600">All verification requests have been processed.</p>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View - Responsive
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow">
              {/* Selection Checkbox for pending requests */}
              {request.accountStatus === 'pending' && (
                <div className="mb-4">
                  <input
                    type="checkbox"
                    checked={selectedRequests.includes(request.id)}
                    onChange={() => handleSelectRequest(request.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {request.name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{request.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{request.email}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(request.accountStatus)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.accountStatus)}`}>
                      {request.accountStatus.charAt(0).toUpperCase() + request.accountStatus.slice(1)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{request.formattedDate}</span>
                </div>
              </div>

              {/* Service Provider Details */}
              <div className="space-y-3 mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <HiPhone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">{request.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <HiLocationMarker className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">{request.city}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <HiBriefcase className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">{request.serviceCategory}</span>
                  <span className="text-xs sm:text-sm text-gray-600">({request.serviceType})</span>
                </div>
                
                {request.subcategories && request.subcategories.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <HiTag className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      <span className="text-xs sm:text-sm font-medium">Services:</span>
                    </div>
                    <div className="flex flex-wrap gap-1 ml-5">
                      {request.subcategories.slice(0, 3).map((sub, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          {sub}
                        </span>
                      ))}
                      {request.subcategories.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          +{request.subcategories.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {request.reason && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                    <span className="text-xs sm:text-sm font-medium text-red-600">Rejection Reason:</span>
                    <p className="text-xs sm:text-sm text-red-700 mt-1">{request.reason}</p>
                  </div>
                )}
              </div>

              {/* Document Links */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Documents:</p>
                <div className="flex flex-wrap gap-2">
                  {request.cnicFront && (
                    <a 
                      href={request.cnicFront} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 underline flex items-center space-x-1"
                    >
                      <HiDocumentText className="h-3 w-3" />
                      <span>CNIC Front</span>
                    </a>
                  )}
                  {request.cnicBack && (
                    <a 
                      href={request.cnicBack} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 underline flex items-center space-x-1"
                    >
                      <HiDocumentText className="h-3 w-3" />
                      <span>CNIC Back</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <Link
                  to={`/verification/${request.id}`}
                  state={{ provider: request }}
                  className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg text-sm flex items-center space-x-1"
                >
                  <HiEye className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Details</span>
                </Link>

                {request.accountStatus === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm flex items-center space-x-1"
                    >
                      <HiCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm flex items-center space-x-1"
                    >
                      <HiX className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Table View
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <DataTable
            columns={tableColumns}
            data={filteredRequests}
            itemsPerPage={10}
            responsiveBreakpoint="md"
          />
        </div>
      )}
    </div>
  );
};

export default Verification;