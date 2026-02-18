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
import StatsCard from '../../components/Common/StatsCard';

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
          <p className="font-medium text-gray-900">{value || 'No Category'}</p>
          <p className="text-sm text-gray-600">{row.original.serviceType || 'Specialization'}</p>
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
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header Section - Premium Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Verification Center</h1>
          <p className="text-slate-500 mt-1 font-medium">Verify and authenticate service provider credentials</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
          >
            <HiDownload className="h-4 w-4" />
            <span>Export Registry</span>
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${showFilters ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <HiFilter className="h-4 w-4" />
            <span>Advanced Filters</span>
          </button>

          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Modern Filters Panel */}
      {showFilters && (
        <div className="card-premium p-6 sm:p-8 bg-slate-50/50 border-slate-100 shadow-inner">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Domain</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="input-field bg-white border-slate-200 font-semibold"
              >
                <option value="all">All Service Categories</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Painter">Painter</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Timeframe</label>
              <select
                value={filters.date}
                onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                className="input-field bg-white border-slate-200 font-semibold"
              >
                <option value="all">Entire History</option>
                <option value="today">Today Only</option>
                <option value="week">Past 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Arrangement</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="input-field bg-white border-slate-200 font-semibold"
              >
                <option value="newest">Recent First</option>
                <option value="oldest">Chronological</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Command Bar */}
      {selectedRequests.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 transform animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-xl">
            <div className="flex items-center gap-3 border-r border-slate-100 pr-6 mr-2">
              <span className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white">
                {selectedRequests.length}
              </span>
              <span className="text-sm font-bold text-slate-900 whitespace-nowrap">Requests Selected</span>
              <button
                onClick={() => setSelectedRequests([])}
                className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest ml-2"
              >
                Cancel
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkApprove}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-xs hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-900/20"
              >
                <HiCheck className="h-4 w-4" />
                <span>Bulk Approve</span>
              </button>
              <button
                onClick={handleBulkReject}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl font-bold text-xs hover:bg-rose-600 transition-all shadow-lg shadow-rose-900/20"
              >
                <HiX className="h-4 w-4" />
                <span>Bulk Reject</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Segmented Filter Tabs */}
      <div className="flex bg-slate-100/50 p-1.5 rounded-2xl w-fit">
        {['all', 'pending', 'accepted', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === status ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {status} {status === 'pending' && stats.pending > 0 && <span className="ml-1.5 text-amber-500">•</span>}
          </button>
        ))}
      </div>

      {/* Performance Summary Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard compact title="Repository" value={stats.total} icon={<HiUser />} color="blue" />
        <StatsCard compact title="Action Required" value={stats.pending} icon={<HiClock />} color="amber" pulse={stats.pending > 0} />
        <StatsCard compact title="Verified" value={stats.accepted} icon={<HiCheckCircle />} color="emerald" />
        <StatsCard compact title="Restricted" value={stats.rejected} icon={<HiXCircle />} color="rose" />
      </div>

      {/* Main Content Viewport */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-80 gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
          <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Processing Registry...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="card-premium py-20 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-50 text-slate-200 rounded-[2.5rem] mb-6 shadow-inner">
            <HiCheckCircle className="h-12 w-12" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">System Operational</h3>
          <p className="text-slate-400 mt-2 font-semibold">All verification requests have been successfully finalized.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredRequests.map((request) => (
            <div key={request.id} className="card-premium card-hover p-6 group">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-100 shrink-0">
                    <div className="h-full w-full rounded-[14px] bg-white flex items-center justify-center text-indigo-600 font-black text-xl">
                      {request.name?.charAt(0)}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 truncate text-lg tracking-tight">{request.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate uppercase font-black tracking-tight">
                      {request.serviceCategory || 'No Category'} • {request.serviceType || 'Specialization'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`status-badge ${getStatusColor(request.accountStatus)}`}>
                    {request.accountStatus}
                  </span>
                  {request.accountStatus === 'pending' && (
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(request.id)}
                      onChange={() => handleSelectRequest(request.id)}
                      className="h-5 w-5 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400">
                    <HiPhone className="h-4 w-4" />
                  </div>
                  <span>{request.phone}</span>
                </div>

                <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400">
                    <HiLocationMarker className="h-4 w-4" />
                  </div>
                  <span>{request.city}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <Link
                  to={`/verification/${request.id}`}
                  state={{ provider: request }}
                  className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-widest hover:text-indigo-600 transition-colors"
                >
                  <HiEye className="h-4 w-4" />
                  <span>Inspect</span>
                </Link>

                {request.accountStatus === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(request.id)}
                      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <HiX className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="flex items-center gap-2 px-5 py-2 bg-emerald-500 text-white rounded-xl font-bold text-xs hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all"
                    >
                      <HiCheck className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-premium overflow-hidden">
          <DataTable data={filteredRequests} columns={tableColumns} />
        </div>
      )}
    </div>
  );
};

export default Verification;