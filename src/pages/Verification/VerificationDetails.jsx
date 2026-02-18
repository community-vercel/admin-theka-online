// src/pages/Verification/Detail.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiCheck, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { serviceProviderService } from '../../services/serviceProviderService';
import { notificationService } from '../../services/notificationService';

const VerificationDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { provider } = location.state || {};

  if (!provider) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700">No provider data found</h2>
        <button
          onClick={() => navigate('/verification')}
          className="mt-4 btn-secondary"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleApprove = async () => {
    try {
      await serviceProviderService.updateAccountStatus(provider.id, 'accepted');
      toast.success('Account approved successfully!');

      // Send push notification to service provider
      try {
        await notificationService.sendApprovalNotification(
          provider.uid,
          provider.name,
          'service_provider'
        );
        toast.success('Notification sent to service provider!');
      } catch (notifError) {
        console.warn('Failed to send notification:', notifError);
        toast('Approved, but notification failed to send', { icon: '⚠️' });
      }

      navigate('/verification');
    } catch (error) {
      toast.error('Failed to approve account');
    }
  };

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await serviceProviderService.updateAccountStatus(provider.id, 'rejected', reason);
      toast.success('Account rejected successfully!');

      // Send push notification to service provider with rejection reason
      try {
        await notificationService.sendRejectionNotification(
          provider.uid,
          provider.name,
          reason
        );
        toast.success('Rejection notification sent to service provider!');
      } catch (notifError) {
        console.warn('Failed to send notification:', notifError);
        toast('Rejected, but notification failed to send', { icon: '⚠️' });
      }

      navigate('/verification');
    } catch (error) {
      toast.error('Failed to reject account');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/verification')}
          className="btn-secondary flex items-center space-x-2"
        >
          <HiArrowLeft className="h-4 w-4" />
          <span>Back to List</span>
        </button>

        {provider.accountStatus === 'pending' && (
          <div className="flex space-x-2">
            <button
              onClick={handleApprove}
              className="btn-success flex items-center space-x-2"
            >
              <HiCheck className="h-4 w-4" />
              <span>Approve Account</span>
            </button>
            <button
              onClick={handleReject}
              className="btn-danger flex items-center space-x-2"
            >
              <HiX className="h-4 w-4" />
              <span>Reject Account</span>
            </button>
          </div>
        )}
      </div>

      {/* Provider Details Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          {/* Profile Header */}
          <div className="flex items-start space-x-4 mb-6">
            <img
              src={provider.profileImage}
              alt={provider.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{provider.name}</h1>
              <p className="text-gray-600">{provider.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {provider.serviceCategory || 'No Category'}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {provider.serviceType || 'Specialization'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${provider.accountStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  provider.accountStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {provider.accountStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-gray-900"><span className="font-medium">Phone:</span> {provider.phone}</p>
                  <p className="text-gray-900"><span className="font-medium">City:</span> {provider.city}</p>
                  <p className="text-gray-900"><span className="font-medium">User ID:</span> {provider.uid}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Service Information</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-gray-900"><span className="font-medium">Category:</span> {provider.serviceCategory || 'No Category'}</p>
                  <p className="text-gray-900"><span className="font-medium">Type:</span> {provider.serviceType || 'Specialization'}</p>
                  <p className="text-gray-900"><span className="font-medium">Total Services:</span> {provider.totalSubcategories || 0}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Subcategories</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {provider.subcategories?.map((sub, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Document Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Verification Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-2">CNIC Front</p>
                <a href={provider.cnicFront} target="_blank" rel="noopener noreferrer">
                  <img
                    src={provider.cnicFront}
                    alt="CNIC Front"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                  />
                </a>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-2">CNIC Back</p>
                <a href={provider.cnicBack} target="_blank" rel="noopener noreferrer">
                  <img
                    src={provider.cnicBack}
                    alt="CNIC Back"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                  />
                </a>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-2">Profile Image</p>
                <a href={provider.profileImage} target="_blank" rel="noopener noreferrer">
                  <img
                    src={provider.profileImage}
                    alt="Profile"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700">Account Created</p>
                <p className="text-gray-900">{provider.formattedDate}</p>
              </div>
              {provider.reason && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Rejection Reason</p>
                  <p className="text-red-600 bg-red-50 p-3 rounded-lg mt-1">{provider.reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationDetail;