// src/pages/Ads/index.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adsService } from '../../services/adsService';
import AdModal from './AdModal';
import AdPreview from './AdPreview';
import { 
  HiPlus,
  HiRefresh,
  HiTrash,
  HiPencil,
  HiEye,
  HiChartBar,
  HiLink,
  HiColorSwatch,
  HiCheckCircle,
  HiXCircle,
  HiSearch,
  HiFilter
} from 'react-icons/hi';

const Ads = () => {
  const [ads, setAds] = useState([]);
  const [filteredAds, setFilteredAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalClicks: 0,
    totalImpressions: 0,
    ctr: 0
  });

  useEffect(() => {
    fetchAds();
  }, []);

  useEffect(() => {
    filterAds();
  }, [ads, search, filter]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const [adsData, statsData] = await Promise.all([
        adsService.getAds(),
        adsService.getAdStats()
      ]);
      
      setAds(adsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast.error('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  const filterAds = () => {
    let result = ads.filter(ad => {
      const matchesSearch = 
        ad.title.toLowerCase().includes(search.toLowerCase()) ||
        ad.description.toLowerCase().includes(search.toLowerCase()) ||
        ad.details.toLowerCase().includes(search.toLowerCase());
      
      let matchesFilter = true;
      
      switch (filter) {
        case 'active':
          matchesFilter = ad.isActive;
          break;
        case 'inactive':
          matchesFilter = !ad.isActive;
          break;
        case 'mobile':
          matchesFilter = ad.position === 'mobile';
          break;
        default:
          matchesFilter = true;
      }
      
      return matchesSearch && matchesFilter;
    });
    
    setFilteredAds(result);
  };

  const handleDelete = async (adId, adTitle) => {
    if (window.confirm(`Are you sure you want to delete "${adTitle}"?`)) {
      try {
        await adsService.deleteAd(adId);
        setAds(ads.filter(ad => ad.id !== adId));
        toast.success('Ad deleted successfully');
      } catch (error) {
        console.error('Error deleting ad:', error);
        toast.error('Failed to delete ad');
      }
    }
  };

  const handleEdit = (ad) => {
    setSelectedAd(ad);
    setIsModalOpen(true);
  };

  const handleSave = async (adData) => {
    try {
      if (selectedAd) {
        // Update existing ad
        await adsService.updateAd(selectedAd.id, adData);
        toast.success('Ad updated successfully');
      } else {
        // Create new ad
        await adsService.createAd(adData);
        toast.success('Ad created successfully');
      }
      
      fetchAds(); // Refresh list
      setIsModalOpen(false);
      setSelectedAd(null);
    } catch (error) {
      console.error('Error saving ad:', error);
      toast.error(error.message || 'Failed to save ad');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mobile Ads Management</h1>
          <p className="text-gray-600">Create and manage 300×50 pixel mobile banner ads</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchAds}
            className="btn-secondary flex items-center space-x-2"
          >
            <HiRefresh className="h-5 w-5" />
            <span>Refresh</span>
          </button>
          <button 
            onClick={() => {
              setSelectedAd(null);
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <HiPlus className="h-5 w-5" />
            <span>Create Ad</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Ads</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <HiChartBar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Ads</p>
              <p className="text-xl font-bold text-gray-900">{stats.active}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <HiCheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clicks</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalClicks}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <HiLink className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Impressions</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalImpressions}</p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <HiEye className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">CTR</p>
              <p className="text-xl font-bold text-gray-900">{stats.ctr}%</p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <HiChartBar className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <HiXCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ads by title, description, or details..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <HiFilter className="h-5 w-5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Ads</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="mobile">Mobile Ads</option>
          </select>
        </div>
      </div>

      {/* Ads Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <HiColorSwatch className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {search ? 'No matching ads found' : 'No ads created yet'}
          </h3>
          <p className="text-gray-600">
            {search ? 'Try a different search term' : 'Create your first ad to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map((ad) => (
            <div key={ad.id} className="card hover:shadow-lg transition-shadow">
              {/* Ad Preview */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-center">
                <AdPreview ad={ad} />
              </div>
              
              {/* Ad Details */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate">{ad.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ad.description}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    ad.isActive 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {ad.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {/* Color Preview */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <div 
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: ad.bgColor }}
                      title={`Background: ${ad.bgColor}`}
                    />
                    <span className="text-xs text-gray-500">BG</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div 
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: ad.textColor }}
                      title={`Text: ${ad.textColor}`}
                    />
                    <span className="text-xs text-gray-500">Text</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {ad.width}px × {ad.height}px
                  </div>
                </div>
                
                {/* Additional Details */}
                {ad.details && (
                  <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    <span className="font-medium">Details:</span> {ad.details}
                  </div>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Clicks:</span>
                    <span className="font-medium">{ad.clicks || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Impressions:</span>
                    <span className="font-medium">{ad.impressions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="font-medium">{formatDate(ad.createdAt)}</span>
                  </div>
                </div>
                
                {ad.link && (
                  <div className="pt-2">
                    <a 
                      href={ad.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <HiLink className="h-4 w-4" />
                      <span>View Link</span>
                    </a>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(ad)}
                    className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="Edit Ad"
                  >
                    <HiPencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id, ad.title)}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Ad"
                  >
                    <HiTrash className="h-5 w-5" />
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  ID: {ad.id.substring(0, 8)}...
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ad Modal */}
      {isModalOpen && (
        <AdModal
          ad={selectedAd}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAd(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Ads;