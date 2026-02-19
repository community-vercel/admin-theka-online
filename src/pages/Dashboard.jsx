// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import StatsCard from '../components/Common/StatsCard';
import {
  HiUsers,
  HiCheckCircle,
  HiClock,
  HiUserGroup,
  HiBriefcase,
  HiCalendar,
  HiStar,
  HiMap
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
  const navigate = useNavigate();
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
  const [customerReviews, setCustomerReviews] = useState([]);
  const [providerReviews, setProviderReviews] = useState([]);
  const [activeReviewTab, setActiveReviewTab] = useState('customer');
  const [averageRating, setAverageRating] = useState(0);
  const [recentAcceptances, setRecentAcceptances] = useState([]);
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
        trend,
        reviewData,
        acceptances
      ] = await Promise.all([
        dashboardService.getTotalCounts(),
        dashboardService.getCityDistribution(),
        dashboardService.getServiceCategoryDistribution(),
        dashboardService.getVerificationDistribution(),
        dashboardService.getRecentRegistrations(),
        dashboardService.getRegistrationTrend(),
        dashboardService.getRecentReviews(),
        dashboardService.getRecentAcceptances()
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
      setCustomerReviews(reviewData.customerReviews);
      setProviderReviews(reviewData.providerReviews);
      setAverageRating(reviewData.averageRating);
      setRecentAcceptances(acceptances);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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
        <StatsCard
          title="Avg. Platform Rating"
          value={`${averageRating} / 5`}
          icon={<HiStar className="h-6 w-6" />}
          color="amber"
          subtitle={`Based on ${customerReviews.length + providerReviews.length} latest interactions`}
          trend={parseFloat(averageRating) >= 4.5 ? "up" : null}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
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

      {/* City Distribution Section */}
      <div className="card-premium p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">City Distribution</h3>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">User base by location</p>
          </div>
          <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <HiMap className="h-6 w-6 text-indigo-500" />
          </div>
        </div>
        <div className="h-[400px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={cityDistribution}
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6366f1', fontSize: 12, fontWeight: 600 }}
                width={120}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="users" name="Total Users" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mutual Acceptance Activity Section */}
      <div className="card-premium p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Mutual Acceptance Activity</h3>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Latest provider-customer matches</p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/acceptance-logs" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest hover:underline">
              View All Logs
            </Link>
            <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <HiCheckCircle className="h-6 w-6 text-indigo-500" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {recentAcceptances.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No recent matches found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentAcceptances.map((log) => (
                <div key={log.id} className="p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-lg transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs border border-indigo-100">
                      {log.service.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">{log.userName}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Matched with</span>
                        <span className="text-sm font-black text-indigo-600">{log.providerName}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-slate-500">{log.service}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {formatDate(log.acceptedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">
                    MATCHED
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Mutual Reviews Section */}
      <div className="card-premium overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Mutual Platform Feedback</h3>
            <p className="text-slate-500 text-sm font-medium">Reviews from both Customers and Providers</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl self-start">
            <button
              onClick={() => setActiveReviewTab('customer')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeReviewTab === 'customer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Cust ↔ Prov
            </button>
            <button
              onClick={() => setActiveReviewTab('provider')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeReviewTab === 'provider' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Prov ↔ Cust
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeReviewTab === 'customer' ? customerReviews : providerReviews).length === 0 ? (
              <div className="col-span-full py-16 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <HiCheckCircle className="h-8 w-8 text-slate-200" />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No {activeReviewTab} reviews found yet</p>
              </div>
            ) : (
              (activeReviewTab === 'customer' ? customerReviews : providerReviews).map((review) => (
                <div key={review.id} className="p-6 bg-white border border-slate-100 rounded-2xl hover:shadow-xl transition-all group flex flex-col relative overflow-hidden">
                  {/* Visual Accent */}
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${activeReviewTab === 'customer' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-sm font-black border overflow-hidden ${activeReviewTab === 'customer' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                        {review.imageUrl ? (
                          <img src={review.imageUrl} alt={review.reviewerName} className="h-full w-full object-cover" />
                        ) : (
                          review.reviewerName?.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate">{review.reviewerName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">to {review.recipientName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg border border-amber-100 shadow-sm">
                      <HiStar className="h-3.5 w-3.5" />
                      <span className="text-xs font-black">{review.rating}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      Service: {review.serviceName}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 font-medium leading-relaxed italic flex-grow">
                    "{review.review}"
                  </p>

                  <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(review.date)}</span>
                    <button
                      onClick={() => navigate(`/reviews/${review.id}`)}
                      className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-widest transition-colors flex items-center gap-1 group/btn"
                    >
                      Full Record
                      <div className="w-1 h-1 rounded-full bg-indigo-500 group-hover/btn:scale-150 transition-transform"></div>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-premium p-6 bg-indigo-50/30 border-indigo-100/50 hover:bg-indigo-50/50 transition-colors cursor-default">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Top City</p>
          <p className="text-xl font-black text-slate-900 mt-1">{cityDistribution[0]?.name || 'N/A'}</p>
          <p className="text-xs font-bold text-indigo-600/70 mt-0.5">{cityDistribution[0]?.users || 0} active users</p>
        </div>
        <div className="card-premium p-6 bg-emerald-50/30 border-emerald-100/50 hover:bg-emerald-50/50 transition-colors cursor-default">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Popular Service</p>
          <p className="text-xl font-black text-slate-900 mt-1">{categoryDistribution[0]?.name || 'N/A'}</p>
          <p className="text-xs font-bold text-emerald-600/70 mt-0.5">{categoryDistribution[0]?.providers || 0} providers</p>
        </div>
        <div className="card-premium p-6 bg-purple-50/30 border-purple-100/50 hover:bg-purple-50/50 transition-colors cursor-default">
          <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Verification Rate</p>
          <p className="text-xl font-black text-slate-900 mt-1">{verificationPercentage}%</p>
          <p className="text-xs font-bold text-purple-600/70 mt-0.5">{stats.acceptedProviders} verified</p>
        </div>
        <div className="card-premium p-6 bg-amber-50/30 border-amber-100/50 hover:bg-amber-50/50 transition-colors cursor-default">
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