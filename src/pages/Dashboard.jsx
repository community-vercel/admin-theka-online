// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import StatsCard from '../components/Common/StatsCard';
import {
  HiUsers,
  HiCheckCircle,
  HiClock,
  HiUserGroup,
  HiBriefcase,
  HiCalendar
} from 'react-icons/hi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCustomers: 0,
    totalProviders: 0,
    acceptedProviders: 0,
    pendingVerification: 0,
    verifiedUsers: 0
  });
  const [cityDistribution, setCityDistribution] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [verificationDistribution, setVerificationDistribution] = useState([]);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [registrationTrend, setRegistrationTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        totalCounts,
        cities,
        categories,
        verification,
        recent,
        trend
      ] = await Promise.all([
        dashboardService.getTotalCounts(),
        dashboardService.getCityDistribution(),
        dashboardService.getServiceCategoryDistribution(),
        dashboardService.getVerificationDistribution(),
        dashboardService.getRecentRegistrations(),
        dashboardService.getRegistrationTrend()
      ]);

      setStats({
        totalUsers: totalCounts.totalUsers,
        totalCustomers: totalCounts.totalCustomers,
        totalProviders: totalCounts.totalProviders,
        acceptedProviders: totalCounts.acceptedProviders,
        pendingVerification: totalCounts.pendingVerification,
        verifiedUsers: totalCounts.totalCustomers + totalCounts.acceptedProviders
      });

      setCityDistribution(cities);
      setCategoryDistribution(categories);
      setVerificationDistribution(verification);
      setRecentRegistrations(recent);
      setRegistrationTrend(trend);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Calculate verification percentage
  const verificationPercentage = stats.totalProviders > 0
    ? Math.round((stats.acceptedProviders / stats.totalProviders) * 100)
    : 0;

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Welcome back! Real-time insights from your platform.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm self-start md:self-auto">
          <HiCalendar className="h-4 w-4 text-blue-500" />
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<HiUsers className="h-6 w-6" />}
          color="blue"
          subtitle={`${stats.totalCustomers} customers, ${stats.totalProviders} providers`}
        />
        <StatsCard
          title="Service Providers"
          value={stats.acceptedProviders.toLocaleString()}
          icon={<HiCheckCircle className="h-6 w-6" />}
          color="green"
          subtitle={`${verificationPercentage}% approved rate`}
        />
        <StatsCard
          title="Pending Verification"
          value={stats.pendingVerification}
          icon={<HiClock className="h-6 w-6" />}
          color="yellow"
          subtitle="Awaiting admin review"
          trend={stats.pendingVerification > 10 ? "up" : null}
          change={stats.pendingVerification > 0 ? "Action needed" : null}
        />
        <StatsCard
          title="Verified Users"
          value={stats.verifiedUsers.toLocaleString()}
          icon={<HiUserGroup className="h-6 w-6" />}
          color="purple"
          subtitle={`${Math.round((stats.verifiedUsers / stats.totalUsers) * 100) || 0}% of total platform`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trend Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Registration Trend</h3>
              <p className="text-gray-600 text-sm">Last 7 days</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registrationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.5rem'
                  }}
                  formatter={(value, name) => [
                    value,
                    name === 'customers' ? 'Customers' :
                      name === 'providers' ? 'Service Providers' : 'Total Users'
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="customers"
                  name="Customers"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="providers"
                  name="Service Providers"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Category Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Service Categories</h3>
              <p className="text-gray-600 text-sm">Provider distribution by category</p>
            </div>
            <HiBriefcase className="h-6 w-6 text-green-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="providers"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [value, 'Providers']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.5rem'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* City Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">City Distribution</h3>
              <p className="text-gray-600 text-sm">Top cities by user count</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cityDistribution}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#6B7280"
                  width={90}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.5rem'
                  }}
                  formatter={(value) => [value, 'Users']}
                />
                <Bar
                  dataKey="users"
                  fill="#8B5CF6"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Verification Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Verification Status</h3>
              <p className="text-gray-600 text-sm">Service provider verification overview</p>
            </div>
            <div className="flex items-center space-x-2">
              {verificationDistribution.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={verificationDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {verificationDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [value, 'Providers']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.5rem'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Registrations</h3>
            <p className="text-gray-600 text-sm">Latest sign-ups in the last 30 days</p>
          </div>
          <HiCalendar className="h-6 w-6 text-indigo-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No recent registrations found
                  </td>
                </tr>
              ) : (
                recentRegistrations.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${user.type === 'customer'
                              ? 'bg-blue-500'
                              : 'bg-green-500'
                            }`}>
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${user.type === 'customer'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                        }`}>
                        {user.type === 'customer' ? 'Customer' : 'Service Provider'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {recentRegistrations.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <button
              onClick={fetchDashboardData}
              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
            >
              Refresh Data
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Top City</p>
          <p className="text-xl font-bold">
            {cityDistribution.length > 0 ? cityDistribution[0].name : 'N/A'}
          </p>
          <p className="text-sm opacity-90 mt-1">
            {cityDistribution.length > 0 ? `${cityDistribution[0].users} users` : 'No data'}
          </p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Popular Service</p>
          <p className="text-xl font-bold">
            {categoryDistribution.length > 0 ? categoryDistribution[0].name : 'N/A'}
          </p>
          <p className="text-sm opacity-90 mt-1">
            {categoryDistribution.length > 0 ? `${categoryDistribution[0].providers} providers` : 'No data'}
          </p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Verification Rate</p>
          <p className="text-xl font-bold">{verificationPercentage}%</p>
          <p className="text-sm opacity-90 mt-1">
            {stats.acceptedProviders} of {stats.totalProviders} providers verified
          </p>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Avg. Daily Signups</p>
          <p className="text-xl font-bold">
            {registrationTrend.length > 0
              ? Math.round(registrationTrend.reduce((sum, day) => sum + day.total, 0) / 7)
              : 0}
          </p>
          <p className="text-sm opacity-90 mt-1">Last 7 days average</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;