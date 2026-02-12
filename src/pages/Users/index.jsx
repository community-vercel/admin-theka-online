// src/pages/Users/index.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';
import { notificationService } from '../../services/notificationService';
import UserModal from './UserModal';
import {
  HiEye,
  HiPencil,
  HiTrash,
  HiPlus,
  HiSearch,
  HiFilter,
  HiRefresh,
  HiUserAdd,
  HiChartBar,
  HiCheckCircle,
  HiUserGroup,
  HiBriefcase,
  HiUser,
  HiHome,
} from 'react-icons/hi';
import StatsCard from '../../components/Common/StatsCard';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCustomers: 0,
    totalProviders: 0,
    skilledProviders: 0,
    unskilledProviders: 0,
    verifiedUsers: 0,
    activeUsers: 0,
    newToday: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, search, filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);

      const userStats = await userService.getUserStats();
      setStats(userStats);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let result = users.filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.phone.includes(search) ||
        user.city.toLowerCase().includes(search.toLowerCase()) ||
        (user.serviceCategory && user.serviceCategory.toLowerCase().includes(search.toLowerCase()));

      let matchesFilter = true;

      switch (filter) {
        case 'customers':
          matchesFilter = user.userType === 'customer';
          break;
        case 'service_providers':
          matchesFilter = user.userType === 'service_provider';
          break;
        case 'skilled':
          matchesFilter = user.serviceType === 'skilled';
          break;
        case 'unskilled':
          matchesFilter = user.serviceType === 'unskilled';
          break;
        case 'active':
          matchesFilter = user.status === 'active';
          break;
        case 'pending':
          matchesFilter = user.status === 'pending';
          break;
        case 'inactive':
          matchesFilter = user.status === 'inactive';
          break;
        case 'verified':
          matchesFilter = user.isVerified;
          break;
        case 'unverified':
          matchesFilter = !user.isVerified;
          break;
        default:
          matchesFilter = true;
      }

      return matchesSearch && matchesFilter;
    });

    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleDelete = async (userId, userName, userType) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      try {
        await userService.deleteUser(userId, userType);
        setUsers(users.filter(user => user.id !== userId));
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSave = async (userData) => {
    try {
      if (selectedUser) {
        const previousStatus = selectedUser.accountStatus;
        const newStatus = userData.accountStatus;

        // Update user in database
        await userService.updateUser(selectedUser.id, selectedUser.userType, userData);
        setUsers(users.map(user =>
          user.id === selectedUser.id ? { ...user, ...userData } : user
        ));

        // Send notification if user is approved
        if (previousStatus !== 'accepted' && newStatus === 'accepted') {
          try {
            await notificationService.sendApprovalNotification(
              selectedUser.uid,
              selectedUser.name,
              selectedUser.userType
            );
            toast.success('User approved and notification sent!');
          } catch (notificationError) {
            console.warn('User updated but notification could not be sent:', notificationError);
            toast.success('User updated successfully (notification may not have been sent)');
          }
        } else if (previousStatus !== 'rejected' && newStatus === 'rejected') {
          // Send rejection notification
          try {
            await notificationService.sendRejectionNotification(
              selectedUser.uid,
              selectedUser.name,
              userData.reason || 'No reason provided'
            );
            toast.success('User rejected and notification sent!');
          } catch (notificationError) {
            console.warn('User updated but rejection notification could not be sent:', notificationError);
            toast.success('User updated successfully');
          }
        } else {
          toast.success('User updated successfully');
        }
      }
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get user type badge color
  const getUserTypeColor = (userType, serviceType) => {
    if (userType === 'customer') return 'bg-blue-100 text-blue-800';
    if (serviceType === 'skilled') return 'bg-purple-100 text-purple-800';
    if (serviceType === 'unskilled') return 'bg-indigo-100 text-indigo-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage all users (Customers & Service Providers) of Theeka</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchUsers}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <HiRefresh className="h-5 w-5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <HiUserAdd className="h-5 w-5" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatsCard
          compact
          title="Total Users"
          value={stats.totalUsers}
          icon={<HiUserGroup />}
          color="blue"
          subtitle="All platform users"
        />
        <StatsCard
          compact
          title="Customers"
          value={stats.totalCustomers}
          icon={<HiUser />}
          color="green"
          subtitle="Service seekers"
        />
        <StatsCard
          compact
          title="Providers"
          value={stats.totalProviders}
          icon={<HiBriefcase />}
          color="purple"
          subtitle="Service givers"
        />
        <StatsCard
          compact
          title="Skilled"
          value={stats.skilledProviders}
          icon={<HiCheckCircle />}
          color="yellow"
          subtitle="Qualified pros"
        />
        <StatsCard
          compact
          title="Unskilled"
          value={stats.unskilledProviders}
          icon={<HiHome />}
          color="indigo"
          subtitle="General labor"
        />
        <StatsCard
          compact
          title="New Today"
          value={stats.newToday}
          icon={<HiPlus />}
          color="red"
          subtitle="Recent signups"
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center space-x-2 w-full lg:w-auto">
          <HiFilter className="h-5 w-5 text-gray-500 shrink-0" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field flex-1 lg:w-48"
          >
            <option value="all">All Users</option>
            <option value="customers">Customers</option>
            <option value="service_providers">Providers</option>
            <option value="skilled">Skilled</option>
            <option value="unskilled">Unskilled</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
            <option value="verified">Verified</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <HiSearch className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Category
                    </th>
                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="hidden xl:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="h-9 w-9 flex-shrink-0">
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${user.userType === 'customer'
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                                : user.serviceType === 'skilled'
                                  ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                                  : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                              }`}>
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          </div>
                          <div className="ml-3 min-w-0">
                            <div className="text-sm font-medium text-gray-900 break-words">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden">
                              {user.userType === 'customer' ? 'Customer' : 'Provider'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getUserTypeColor(user.userType, user.serviceType)
                            }`}>
                            {user.userType === 'customer'
                              ? 'Customer'
                              : user.serviceType === 'skilled'
                                ? 'Skilled'
                                : 'Unskilled'
                            }
                          </span>
                          {user.serviceCategory && (
                            <div className="text-xs text-gray-600 break-words max-w-[150px]">
                              {user.serviceCategory}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 py-4">
                        <div className="text-sm text-gray-900 truncate max-w-[150px]">
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.phone}
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.city}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(user.status)
                            }`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${user.isVerified
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {user.isVerified ? '✓ Verified' : 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="hidden xl:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.formattedDate}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Link
                            to={`/users/${user.id}`}
                            state={{ user }}
                            className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <HiEye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-1.5 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <HiPencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.name, user.userType)}
                            className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <HiTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastUser, filteredUsers.length)}
                    </span> of{' '}
                    <span className="font-medium">{filteredUsers.length}</span> users
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 border border-gray-300 rounded-md text-sm transition-colors ${currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'hover:bg-gray-50'
                        }`}
                    >
                      Previous
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`px-3 py-1 border rounded-md text-sm transition-colors ${currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 border border-gray-300 rounded-md text-sm transition-colors ${currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'hover:bg-gray-50'
                        }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Type Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Customers</p>
              <p className="text-xl font-bold">{stats.totalCustomers}</p>
            </div>
            <HiUser className="h-8 w-8 opacity-80" />
          </div>
          <div className="mt-2 text-xs opacity-90">
            {Math.round((stats.totalCustomers / stats.totalUsers) * 100) || 0}% of total users
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Skilled Workers</p>
              <p className="text-xl font-bold">{stats.skilledProviders}</p>
            </div>
          </div>
          <div className="mt-2 text-xs opacity-90">
            {stats.totalProviders > 0 ? Math.round((stats.skilledProviders / stats.totalProviders) * 100) : 0}% of providers
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Unskilled Workers</p>
              <p className="text-xl font-bold">{stats.unskilledProviders}</p>
            </div>
            <HiHome className="h-8 w-8 opacity-80" />
          </div>
          <div className="mt-2 text-xs opacity-90">
            {stats.totalProviders > 0 ? Math.round((stats.unskilledProviders / stats.totalProviders) * 100) : 0}% of providers
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Verification Rate</p>
              <p className="text-xl font-bold">
                {stats.totalProviders > 0
                  ? Math.round((stats.totalProviders - filteredUsers.filter(u => u.userType === 'service_provider' && u.status === 'pending').length) / stats.totalProviders * 100)
                  : 0}%
              </p>
            </div>
            <HiCheckCircle className="h-8 w-8 opacity-80" />
          </div>
          <div className="mt-2 text-xs opacity-90">
            Service providers verified
          </div>
        </div>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <UserModal
          user={selectedUser}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Users;