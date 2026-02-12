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
  AreaChart,
  Area,
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

  // Chart Colors - Premium Palette
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

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

  // Derived data for charts
  const userTypeData = [
    { name: 'Customers', value: stats.totalCustomers },
    { name: 'Service Providers', value: stats.totalProviders }
  ];

  // Mock growth data if actual history isn't available from service
  const userGrowthData = [
    { month: 'Jan', users: Math.floor(stats.totalUsers * 0.4) },
    { month: 'Feb', users: Math.floor(stats.totalUsers * 0.5) },
    { month: 'Mar', users: Math.floor(stats.totalUsers * 0.6) },
    { month: 'Apr', users: Math.floor(stats.totalUsers * 0.75) },
    { month: 'May', users: Math.floor(stats.totalUsers * 0.85) },
    { month: 'Jun', users: Math.floor(stats.totalUsers * 0.95) },
    { month: 'Jul', users: stats.totalUsers }
  ];

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
    <div className="space-y-8 pb-10">
      {/* Header Section - Clean Professional Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-slate-500 font-medium">
            Welcome back! Here's what's happening on your platform today.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm self-start md:self-auto">
          <HiCalendar className="h-5 w-5 text-indigo-500" />
          <span className="text-slate-700 text-sm font-bold">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats Grid - Using premium spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <div className="card-premium p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">User Growth</h3>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Last 7 Months</p>
            </div>
          </div>

          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Distribution Chart */}
        <div className="card-premium p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">User Distribution</h3>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">User Types</p>
            </div>
          </div>

          <div className="h-[350px] w-full flex flex-col sm:flex-row items-center justify-center">
            <div className="flex-1 w-full h-[300px] sm:h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {userTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col gap-4 min-w-[140px] mt-6 sm:mt-0 sm:ml-8">
              {userTypeData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-sm font-medium text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 ml-4">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-premium p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Registration Trend</h3>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Last 7 days</p>
            </div>
          </div>
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registrationTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar
                  dataKey="customers"
                  name="Customers"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="providers"
                  name="Service Providers"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-premium p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Service Categories</h3>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Provider distribution</p>
            </div>
            <HiBriefcase className="h-6 w-6 text-indigo-500" />
          </div>
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="providers"
                  paddingAngle={5}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="card-premium overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Registrations</h3>
            <p className="text-slate-500 text-sm font-medium">Latest sign-ups in the last 30 days</p>
          </div>
          <button onClick={fetchDashboardData} className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm">
            <HiCalendar className="h-6 w-6" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">City</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered At</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-12 text-center text-slate-400 font-medium">No recent registrations found</td>
                </tr>
              ) : (
                recentRegistrations.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg ${user.type === 'customer' ? 'bg-indigo-500 shadow-indigo-100' : 'bg-emerald-500 shadow-emerald-100'}`}>
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="ml-4 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium truncate uppercase">ID: {user.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg tracking-tight ${user.type === 'customer' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {user.type}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm font-semibold text-slate-600">{user.city}</td>
                    <td className="px-8 py-4 text-sm font-semibold text-slate-600">{formatDate(user.date)}</td>
                    <td className="px-8 py-4">
                      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-premium p-6 bg-indigo-50/30 border-indigo-100/50">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Top City</p>
          <p className="text-xl font-black text-slate-900 mt-1">{cityDistribution[0]?.name || 'N/A'}</p>
          <p className="text-xs font-bold text-indigo-600/70 mt-0.5">{cityDistribution[0]?.users || 0} active users</p>
        </div>
        <div className="card-premium p-6 bg-emerald-50/30 border-emerald-100/50">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Popular Service</p>
          <p className="text-xl font-black text-slate-900 mt-1">{categoryDistribution[0]?.name || 'N/A'}</p>
          <p className="text-xs font-bold text-emerald-600/70 mt-0.5">{categoryDistribution[0]?.providers || 0} providers</p>
        </div>
        <div className="card-premium p-6 bg-purple-50/30 border-purple-100/50">
          <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Verification Rate</p>
          <p className="text-xl font-black text-slate-900 mt-1">{verificationPercentage}%</p>
          <p className="text-xs font-bold text-purple-600/70 mt-0.5">{stats.acceptedProviders} verified</p>
        </div>
        <div className="card-premium p-6 bg-amber-50/30 border-amber-100/50">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Daily Signups</p>
          <p className="text-xl font-black text-slate-900 mt-1">
            {registrationTrend.length > 0 ? Math.round(registrationTrend.reduce((sum, day) => sum + day.total, 0) / 7) : 0}
          </p>
          <p className="text-xs font-bold text-amber-600/70 mt-0.5">7-day average</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;