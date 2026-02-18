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
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header Section - Premium Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage and monitor all platform users across categories</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
          >
            <HiRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
          >
            <HiUserAdd className="h-5 w-5" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <StatsCard compact title="Total" value={stats.totalUsers} icon={<HiUserGroup />} color="blue" />
        <StatsCard compact title="Customers" value={stats.totalCustomers} icon={<HiUser />} color="emerald" />
        <StatsCard compact title="Providers" value={stats.totalProviders} icon={<HiBriefcase />} color="indigo" />
        <StatsCard compact title="Skilled" value={stats.skilledProviders} icon={<HiCheckCircle />} color="violet" />
        <StatsCard compact title="Unskilled" value={stats.unskilledProviders} icon={<HiHome />} color="amber" />
        <StatsCard compact title="Today" value={stats.newToday} icon={<HiPlus />} color="rose" />
      </div>

      {/* Modern Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <HiSearch className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone or category..."
            className="input-field pl-12 bg-white/50 focus:bg-white border-slate-200"
          />
        </div>
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400">
            <HiFilter className="h-5 w-5" />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field bg-white border-slate-200 font-semibold text-slate-700"
          >
            <option value="all">All Access Levels</option>
            <option value="customers">Customers Only</option>
            <option value="service_providers">All Providers</option>
            <option value="skilled">Skilled Workers</option>
            <option value="unskilled">General Labor</option>
            <option value="active">Active Accounts</option>
            <option value="pending">Pending Review</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="card-premium overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing User Data...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl mb-6">
              <HiSearch className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No users found</h3>
            <p className="text-slate-500 mt-2">We couldn't find any results matching your current criteria.</p>
            <button onClick={() => { setSearch(''); setFilter('all'); }} className="mt-6 text-indigo-600 font-bold hover:underline">Clear all filters</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Identity</th>
                    <th className="hidden sm:table-cell px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Specialization</th>
                    <th className="hidden md:table-cell px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Network</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Standing</th>
                    <th className="px-6 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-white font-black shadow-lg ${user.userType === 'customer'
                            ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-100'
                            : 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-100'
                            }`}>
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{user.name}</p>
                            <p className="text-[11px] text-slate-400 uppercase font-black tracking-tight mt-0.5">{user.userType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-5">
                        <div className="space-y-1.5">
                          <span className={`status-badge ${user.serviceType === 'skilled' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                            {user.serviceType || 'Standard'}
                          </span>
                          <p className="text-xs font-bold text-slate-500 truncate max-w-[180px]">{user.serviceCategory || 'No Category'}</p>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-5">
                        <div className="flex flex-col gap-1 min-w-0">
                          <p className="text-sm font-bold text-slate-700">{user.phone}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{user.email}</p>
                          <p className="text-[10px] text-slate-300 font-medium uppercase tracking-tighter">{user.city}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <span className={`status-badge w-fit ${user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {user.status}
                          </span>
                          {user.isVerified && (
                            <div className="flex items-center gap-1 text-indigo-500 font-bold text-[10px] uppercase tracking-wider">
                              <HiCheckCircle className="h-3.5 w-3.5" />
                              <span>Verified</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/users/${user.id}`} state={{ user }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                            <HiEye className="h-5 w-5" />
                          </Link>
                          <button onClick={() => handleEdit(user)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all">
                            <HiPencil className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleDelete(user.id, user.name, user.userType)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                            <HiTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Premium Pagination */}
            {totalPages > 1 && (
              <div className="px-8 py-5 border-t border-slate-50 bg-slate-50/30">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Showing <span className="text-slate-900">{indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)}</span> of {filteredUsers.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-white"
                    >
                      Prev
                    </button>
                    <div className="flex items-center gap-1 px-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1).map((p, i, arr) => (
                        <div key={p} className="flex items-center gap-1">
                          {i > 0 && arr[i - 1] !== p - 1 && <span className="text-slate-300">...</span>}
                          <button
                            onClick={() => paginate(p)}
                            className={`h-9 w-9 rounded-xl text-xs font-bold transition-all ${currentPage === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-white'}`}
                          >
                            {p}
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-white"
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