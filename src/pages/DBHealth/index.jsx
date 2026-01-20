// src/pages/DBHealth/index.jsx
import { useState, useEffect } from 'react';
import { 
  HiDatabase,
  HiServer,
  HiCheckCircle,
  HiExclamationCircle,
  HiXCircle,
  HiClock,
  HiRefresh,
  HiDownload,
  HiChartBar,
  HiTrendingUp,
  HiTrendingDown,
  HiEye,
  HiInformationCircle,
  HiShieldCheck,
  HiLightningBolt,
  HiArchive,
  HiUsers,
  HiUserGroup,
  HiPhotograph,
  HiCollection,
  HiCash,
  HiShoppingCart
} from 'react-icons/hi';
import { getDBHealthMetrics, getHealthHistory } from '../../services/dbHealthService';
import { dashboardService } from '../../services/dashboardService';
import { customerService } from '../../services/customerService';
import { serviceProviderService } from '../../services/serviceProviderService';
import { adsService } from '../../services/adsService';
import { settingsService } from '../../services/settingsService';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

const DBHealth = () => {
  const [healthData, setHealthData] = useState(null);
  const [healthHistory, setHealthHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState(24);
  const [realStats, setRealStats] = useState(null);
  const [collectionData, setCollectionData] = useState([]);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [health, history, stats, collections] = await Promise.all([
        getDBHealthMetrics(),
        getHealthHistory(timeRange),
        getRealDatabaseStats(),
        getAllCollectionData()
      ]);
      
      setHealthData(health);
      setHealthHistory(history);
      setRealStats(stats);
      setCollectionData(collections);
      
    } catch (error) {
      console.error('Failed to load health data:', error);
      toast.error('Failed to load database health information');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Get real database stats from your services
  const getRealDatabaseStats = async () => {
    try {
      // Get stats from dashboard service
      const dashboardStats = await dashboardService.getTotalCounts();
      
      // Get user stats
      const userStats = await userService.getUserStats();
      
      // Get ad stats if available
      let adStats = { total: 0, active: 0, inactive: 0, totalClicks: 0, totalImpressions: 0, ctr: 0 };
      try {
        adStats = await adsService.getAdStats();
      } catch (error) {
        console.log('Ad stats not available:', error.message);
      }
      
      // Get service provider stats
      const providers = await serviceProviderService.getServiceProviders();
      const providerStats = await serviceProviderService.getStatusCounts(providers);
      
      // Get city distribution
      const cityDistribution = await dashboardService.getCityDistribution();
      
      // Get service category distribution
      const categoryDistribution = await dashboardService.getServiceCategoryDistribution();
      
      // Get verification distribution
      const verificationDistribution = await dashboardService.getVerificationDistribution();
      
      // Get recent registrations
      const recentRegistrations = await dashboardService.getRecentRegistrations();
      
      // Get registration trend
      const registrationTrend = await dashboardService.getRegistrationTrend();
      
      return {
        dashboard: dashboardStats,
        users: userStats,
        ads: adStats,
        providers: providerStats,
        cityDistribution,
        categoryDistribution,
        verificationDistribution,
        recentRegistrations: recentRegistrations.slice(0, 5), // Limit to 5
        registrationTrend,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting real stats:', error);
      return null;
    }
  };

  // Get detailed collection data
  const getAllCollectionData = async () => {
    try {
      const collections = [
        { name: 'Customers', service: customerService, method: 'getCustomers' },
        { name: 'ServiceProviders', service: serviceProviderService, method: 'getServiceProviders' },
        { name: 'Ads', service: adsService, method: 'getAds' }
      ];
      
      const collectionData = [];
      
      for (const collection of collections) {
        try {
          const startTime = Date.now();
          const data = await collection.service[collection.method]();
          const responseTime = Date.now() - startTime;
          
          // Find most recent document
          let lastUpdated = null;
          if (data.length > 0) {
            const docsWithDates = data.filter(d => d.createdAt);
            if (docsWithDates.length > 0) {
              const mostRecent = docsWithDates.reduce((latest, current) => {
                return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
              });
              lastUpdated = mostRecent.createdAt;
            }
          }
          
          collectionData.push({
            name: collection.name,
            documentCount: data.length,
            responseTime,
            lastUpdated,
            status: responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'slow' : 'degraded',
            sampleSize: Math.min(3, data.length),
            sampleData: data.slice(0, 3)
          });
        } catch (error) {
          console.error(`Error fetching ${collection.name}:`, error);
          collectionData.push({
            name: collection.name,
            documentCount: 0,
            responseTime: 0,
            lastUpdated: null,
            status: 'error',
            error: error.message
          });
        }
      }
      
      return collectionData;
    } catch (error) {
      console.error('Error getting collection data:', error);
      return [];
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHealthData();
    toast.success('Health data refreshed');
  };

  const handleExport = () => {
    if (!healthData || !realStats) return;
    
    const report = {
      generatedAt: new Date().toISOString(),
      healthData,
      realStats,
      history: healthHistory,
      collectionData
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `db-health-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Health report exported');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'degraded': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'offline': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <HiCheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <HiExclamationCircle className="h-5 w-5 text-yellow-500" />;
      case 'degraded': return <HiExclamationCircle className="h-5 w-5 text-orange-500" />;
      case 'critical': return <HiXCircle className="h-5 w-5 text-red-500" />;
      default: return <HiClock className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getHealthScore = () => {
    if (!healthData) return 0;
    
    const stats = healthData.statistics;
    if (!stats) return 0;
    
    // Simple health score calculation
    let score = stats.healthPercentage * 0.6;
    
    if (healthData.connectivity?.connected) {
      score += 20;
      if (healthData.connectivity.responseTime < 500) score += 5;
    }
    
    if (healthData.performance?.averageReadTime) {
      if (healthData.performance.averageReadTime < 200) score += 15;
      else if (healthData.performance.averageReadTime < 500) score += 10;
      else score += 5;
    }
    
    return Math.min(100, Math.round(score));
  };

  // Collection icons mapping
  const getCollectionIcon = (collectionName) => {
    switch (collectionName) {
      case 'Customers': return <HiUsers className="h-4 w-4 text-blue-600" />;
      case 'ServiceProviders': return <HiUserGroup className="h-4 w-4 text-purple-600" />;
      case 'Ads': return <HiPhotograph className="h-4 w-4 text-green-600" />;
      case 'Cities': return <HiCollection className="h-4 w-4 text-yellow-600" />;
      case 'ServiceCategories': return <HiCollection className="h-4 w-4 text-indigo-600" />;
      default: return <HiArchive className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading database health information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Database Health Monitor</h1>
          <p className="text-gray-600 mt-1">Comprehensive monitoring of Firebase Firestore database health and performance</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => {
              setTimeRange(Number(e.target.value));
              loadHealthData();
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={1}>Last 1 hour</option>
            <option value={6}>Last 6 hours</option>
            <option value={24}>Last 24 hours</option>
            <option value={168}>Last 7 days</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary flex items-center space-x-2"
          >
            <HiRefresh className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={handleExport}
            className="btn-primary flex items-center space-x-2"
          >
            <HiDownload className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Overall Health Status */}
      {healthData && (
        <div className={`rounded-xl border p-6 ${getStatusColor(healthData.overallStatus)}`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-white">
                <HiDatabase className="h-8 w-8 text-gray-700" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusIcon(healthData.overallStatus)}
                  <h2 className="text-xl font-bold text-gray-900">Database Health Status</h2>
                </div>
                <p className="text-gray-700">
                  Last checked: {formatTime(healthData.timestamp)}
                </p>
                {healthData.connectivity && (
                  <p className="text-sm text-gray-600 mt-1">
                    Response time: {formatDuration(healthData.connectivity.responseTime)}
                  </p>
                )}
                {realStats && (
                  <p className="text-sm text-gray-600 mt-1">
                    Total documents: {realStats.dashboard?.totalUsers?.toLocaleString() || 0}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={
                      healthData.overallStatus === 'healthy' ? '#10b981' :
                      healthData.overallStatus === 'warning' ? '#f59e0b' :
                      healthData.overallStatus === 'degraded' ? '#f97316' :
                      '#ef4444'
                    }
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${getHealthScore() * 2.83} 283`}
                    transform="rotate(-90 50 50)"
                  />
                  <text
                    x="50"
                    y="50"
                    textAnchor="middle"
                    dy="0.3em"
                    fontSize="20"
                    fontWeight="bold"
                    fill={
                      healthData.overallStatus === 'healthy' ? '#10b981' :
                      healthData.overallStatus === 'warning' ? '#f59e0b' :
                      healthData.overallStatus === 'degraded' ? '#f97316' :
                      '#ef4444'
                    }
                  >
                    {getHealthScore()}%
                  </text>
                </svg>
              </div>
              <p className="text-sm text-gray-600 mt-2">Health Score</p>
            </div>
          </div>
        </div>
      )}

      {/* Real Data Stats */}
      {realStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HiUsers className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {realStats.dashboard?.totalUsers?.toLocaleString() || 0}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">Total Users</h3>
            <p className="text-sm text-gray-600 mt-1">
              {realStats.dashboard?.totalCustomers || 0} customers + {realStats.dashboard?.totalProviders || 0} providers
            </p>
          </div>

          {/* Service Providers */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <HiUserGroup className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {realStats.providers?.accepted || 0}/{realStats.providers?.total || 0}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">Service Providers</h3>
            <p className="text-sm text-gray-600 mt-1">
              {realStats.providers?.pending || 0} pending verification
            </p>
          </div>

          {/* Ads Performance */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <HiPhotograph className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {realStats.ads?.ctr || 0}%
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">Ads Performance</h3>
            <p className="text-sm text-gray-600 mt-1">
              {realStats.ads?.totalClicks || 0} clicks / {realStats.ads?.totalImpressions || 0} impressions
            </p>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <HiClock className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {realStats.recentRegistrations?.length || 0}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">Recent Registrations</h3>
            <p className="text-sm text-gray-600 mt-1">
              Last 30 days activity
            </p>
          </div>
        </div>
      )}

      {/* Collections Health with Real Data */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Collections Health</h3>
              <p className="text-gray-600 text-sm mt-1">Real-time data from your collections</p>
            </div>
            <HiArchive className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collection
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sample Data
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {collectionData.map((collection) => (
                <tr key={collection.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getCollectionIcon(collection.name)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {collection.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Firestore Collection
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {collection.documentCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {collection.sampleSize} samples
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      collection.responseTime < 500 ? 'text-green-600' :
                      collection.responseTime < 1500 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {formatDuration(collection.responseTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {collection.lastUpdated ? formatTime(collection.lastUpdated) : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      collection.status === 'healthy' ? 'bg-green-100 text-green-800' :
                      collection.status === 'slow' ? 'bg-yellow-100 text-yellow-800' :
                      collection.status === 'degraded' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getStatusIcon(collection.status)}
                      <span className="ml-1">{collection.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {collection.sampleData?.map((doc, index) => (
                        <div key={index} className="text-xs text-gray-600 truncate max-w-[200px]">
                          {doc.name || doc.title || doc.id}
                        </div>
                      ))}
                      {collection.error && (
                        <div className="text-xs text-red-600 truncate max-w-[200px]">
                          {collection.error}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real Data Statistics */}
      {realStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">User Distribution</h3>
              <HiUsers className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <HiUsers className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Total Users</p>
                    <p className="text-sm text-gray-600">All registered users</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    {realStats.users?.totalUsers?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <HiCheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Verified Users</p>
                    <p className="text-sm text-gray-600">Accepted and verified</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    {realStats.users?.verifiedUsers?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <HiUserGroup className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Service Providers</p>
                    <p className="text-sm text-gray-600">Skilled & Unskilled</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    {realStats.users?.skilledProviders || 0} skilled / {realStats.users?.unskilledProviders || 0} unskilled
                  </p>
                </div>
              </div>
            </div>

            {/* City Distribution */}
            {realStats.cityDistribution && realStats.cityDistribution.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Top Cities</h4>
                <div className="space-y-2">
                  {realStats.cityDistribution.slice(0, 5).map((city, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{city.name}</span>
                      <span className="text-sm font-medium text-gray-900">{city.users} users</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Service Categories */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Service Categories</h3>
              <HiCollection className="h-5 w-5 text-gray-400" />
            </div>
            
            {realStats.categoryDistribution && realStats.categoryDistribution.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Popular Services</h4>
                <div className="space-y-3">
                  {realStats.categoryDistribution.slice(0, 5).map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-yellow-500' :
                          index === 3 ? 'bg-purple-500' :
                          'bg-gray-500'
                        }`}></div>
                        <span className="text-sm text-gray-900">{category.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {category.providers} providers
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <HiCollection className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No service category data available</p>
              </div>
            )}

            {/* Verification Status */}
            {realStats.verificationDistribution && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Verification Status</h4>
                <div className="grid grid-cols-3 gap-3">
                  {realStats.verificationDistribution.map((status, index) => (
                    <div key={index} className="text-center">
                      <div
                        className="h-2 rounded-full mb-2"
                        style={{ backgroundColor: status.color }}
                      ></div>
                      <p className="text-xs font-medium text-gray-900">{status.name}</p>
                      <p className="text-lg font-bold" style={{ color: status.color }}>
                        {status.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Registrations */}
            {realStats.recentRegistrations && realStats.recentRegistrations.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Registrations</h4>
                <div className="space-y-2">
                  {realStats.recentRegistrations.map((registration, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          registration.type === 'customer' ? 'bg-blue-500' : 'bg-green-500'
                        }`}></div>
                        <span className="text-gray-900 truncate max-w-[120px]">
                          {registration.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          registration.type === 'customer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {registration.type === 'customer' ? 'Customer' : 'Provider'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Registration Trend Chart */}
      {realStats?.registrationTrend && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Registration Trend</h3>
              <p className="text-gray-600 text-sm mt-1">User registrations over the last 7 days</p>
            </div>
            <HiChartBar className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="h-64">
            <div className="flex items-end h-48 space-x-2">
              {realStats.registrationTrend.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex space-x-1">
                    <div 
                      className="flex-1 bg-blue-500 rounded-t"
                      style={{ height: `${(day.customers / Math.max(...realStats.registrationTrend.map(d => d.total))) * 100}%` }}
                      title={`${day.customers} customers`}
                    ></div>
                    <div 
                      className="flex-1 bg-green-500 rounded-t"
                      style={{ height: `${(day.providers / Math.max(...realStats.registrationTrend.map(d => d.total))) * 100}%` }}
                      title={`${day.providers} providers`}
                    ></div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs text-gray-600">{day.day}</p>
                    <p className="text-xs font-medium text-gray-900">{day.total}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center space-x-6 mt-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Customers</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Service Providers</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Database Performance</h3>
            <HiLightningBolt className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Connectivity Status</span>
              <span className={`text-sm font-medium ${
                healthData?.connectivity?.connected ? 'text-green-600' : 'text-red-600'
              }`}>
                {healthData?.connectivity?.connected ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className={`text-sm font-medium ${
                healthData?.connectivity?.responseTime < 500 ? 'text-green-600' :
                healthData?.connectivity?.responseTime < 1000 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {formatDuration(healthData?.connectivity?.responseTime || 0)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Checked</span>
              <span className="text-sm text-gray-900">
                {formatTime(healthData?.timestamp)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Health Score</span>
              <span className={`text-sm font-bold ${
                getHealthScore() > 80 ? 'text-green-600' :
                getHealthScore() > 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {getHealthScore()}%
              </span>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
            <HiInformationCircle className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database Service</span>
              <span className="text-sm font-medium text-gray-900">Firebase Firestore</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Project ID</span>
              <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                {import.meta.env.VITE_APP_PROJECT_ID || 'Not configured'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Environment</span>
              <span className={`text-sm font-medium px-2 py-1 rounded ${
                import.meta.env.MODE === 'production' ? 'bg-green-100 text-green-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {import.meta.env.MODE || 'development'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Collections</span>
              <span className="text-sm font-medium text-gray-900">
                {collectionData.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <HiLightningBolt className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Monitor Collection Growth</p>
                <p className="text-sm text-gray-600 mt-1">
                  {realStats?.dashboard?.totalUsers || 0} total users. Consider implementing data archiving for older records.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <HiCheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Verification Status</p>
                <p className="text-sm text-gray-600 mt-1">
                  {realStats?.providers?.pending || 0} pending verifications. Review them regularly to maintain service quality.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <HiChartBar className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Performance Optimization</p>
                <p className="text-sm text-gray-600 mt-1">
                  Current response time: {formatDuration(healthData?.connectivity?.responseTime || 0)}. 
                  {healthData?.connectivity?.responseTime > 500 && ' Consider optimizing queries.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DBHealth;