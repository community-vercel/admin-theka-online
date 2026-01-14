// src/pages/Verification/index.jsx
import { useState, useEffect } from 'react';
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
  HiTag
} from 'react-icons/hi';
import { serviceProviderService } from '../../services/serviceProviderService';

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
      
      toast.success('Account rejected successfully!');
    } catch (error) {
      console.error('Error rejecting account:', error);
      toast.error('Failed to reject account');
    }
  };

  const filteredRequests = requests.filter(request => 
    filter === 'all' || request.accountStatus === filter
  );

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Service Provider Verification</h1>
        <p className="page-subtitle">Review and manage service provider account requests</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
            filter === 'all' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All Requests {stats.total}
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 font-medium rounded-t-lg transition-colors flex items-center space-x-2 ${
            filter === 'pending' 
              ? 'text-yellow-600 border-b-2 border-yellow-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <HiClock className="h-5 w-5" />
          <span>Pending</span>
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
          </span>
        </button>
        <button
          onClick={() => setFilter('accepted')}
          className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
            filter === 'accepted' 
              ? 'text-green-600 border-b-2 border-green-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Accepted {stats.accepted}
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
            filter === 'rejected' 
              ? 'text-red-600 border-b-2 border-red-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Rejected {stats.rejected}
        </button>
      </div>

      {/* Requests Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <HiCheckCircle className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No verification requests</h3>
          <p className="text-gray-600">All verification requests have been processed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRequests.map((request) => (
            <div key={request.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {request.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{request.name}</h3>
                    <p className="text-sm text-gray-600">{request.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(request.accountStatus)}
                  <span className={`status-badge ${getStatusColor(request.accountStatus)}`}>
                    {request.accountStatus.charAt(0).toUpperCase() + request.accountStatus.slice(1)}
                  </span>
                </div>
              </div>

              {/* Service Provider Details */}
              <div className="space-y-3 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <HiPhone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{request.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <HiLocationMarker className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{request.city}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <HiBriefcase className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">{request.serviceCategory}</span>
                  <span className="text-sm text-gray-600">({request.serviceType})</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <HiTag className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Subcategories:</span>
                    <span className="text-sm text-gray-600">{request.totalSubcategories} services</span>
                  </div>
                  {request.subcategories && (
                    <div className="flex flex-wrap gap-1 ml-6">
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
                  )}
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Submitted:</span>
                  <span className="text-sm">{request.formattedDate}</span>
                </div>
                
                {request.reason && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                    <span className="text-sm font-medium text-red-600">Rejection Reason:</span>
                    <p className="text-sm text-red-700 mt-1">{request.reason}</p>
                  </div>
                )}
              </div>

              {/* Document Links */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Documents:</p>
                <div className="flex space-x-3">
                  {request.cnicFront && (
                    <a 
                      href={request.cnicFront} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      View CNIC Front
                    </a>
                  )}
                  {request.cnicBack && (
                    <a 
                      href={request.cnicBack} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      View CNIC Back
                    </a>
                  )}
                  {request.profileImage && (
                    <a 
                      href={request.profileImage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      View Profile Image
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <Link
                  to={`/verification/${request.id}`}
                  state={{ provider: request }}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <HiEye className="h-4 w-4" />
                  <span>View Details</span>
                </Link>

                {request.accountStatus === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="btn-success flex items-center space-x-2"
                    >
                      <HiCheck className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="btn-danger flex items-center space-x-2"
                    >
                      <HiX className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Providers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <HiUser className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <HiClock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <HiCheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <HiXCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verification;