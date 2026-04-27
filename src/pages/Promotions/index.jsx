// src/pages/Promotions/index.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { promotionService } from '../../services/promotionService';
import PromotionModal from './PromotionModal';
import PromotionPreview from './PromotionPreview';
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

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Listen for global search events from Navbar
  useEffect(() => {
    const handleGlobalSearch = (e) => {
      setSearch(e.detail || '');
    };
    window.addEventListener('app:search', handleGlobalSearch);
    return () => window.removeEventListener('app:search', handleGlobalSearch);
  }, []);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalClicks: 0,
    totalImpressions: 0,
    ctr: 0
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  useEffect(() => {
    filterPromotions();
  }, [promotions, search, filter]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const [promoData, statsData] = await Promise.all([
        promotionService.getPromotions(),
        promotionService.getPromotionStats()
      ]);

      setPromotions(promoData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const filterPromotions = () => {
    let result = promotions.filter(promo => {
      const matchesSearch =
        promo.title.toLowerCase().includes(search.toLowerCase()) ||
        promo.description.toLowerCase().includes(search.toLowerCase()) ||
        promo.details.toLowerCase().includes(search.toLowerCase());

      let matchesFilter = true;

      switch (filter) {
        case 'active':
          matchesFilter = promo.isActive;
          break;
        case 'inactive':
          matchesFilter = !promo.isActive;
          break;
        case 'mobile':
          matchesFilter = promo.position === 'mobile';
          break;
        default:
          matchesFilter = true;
      }

      return matchesSearch && matchesFilter;
    });

    setFilteredPromotions(result);
  };

  const handleDelete = async (promoId, promoTitle) => {
    if (window.confirm(`Are you sure you want to delete "${promoTitle}"?`)) {
      try {
        await promotionService.deletePromotion(promoId);
        setPromotions(promotions.filter(p => p.id !== promoId));
        toast.success('Promotion deleted successfully');
      } catch (error) {
        console.error('Error deleting promotion:', error);
        toast.error('Failed to delete promotion');
      }
    }
  };

  const handleEdit = (promo) => {
    setSelectedPromotion(promo);
    setIsModalOpen(true);
  };

  const handleSave = async (promoData) => {
    try {
      if (selectedPromotion) {
        // Update existing promotion
        await promotionService.updatePromotion(selectedPromotion.id, promoData);
        toast.success('Promotion updated successfully');
      } else {
        // Create new promotion
        await promotionService.createPromotion(promoData);
        toast.success('Promotion created successfully');
      }

      fetchPromotions(); // Refresh list
      setIsModalOpen(false);
      setSelectedPromotion(null);
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast.error(error.message || 'Failed to save promotion');
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
          <h1 className="text-2xl font-bold text-gray-900">Promotions Management</h1>
          <p className="text-gray-600">Create and manage mobile banner promotions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchPromotions}
            className="btn-secondary flex items-center space-x-2"
          >
            <HiRefresh className="h-5 w-5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setSelectedPromotion(null);
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <HiPlus className="h-5 w-5" />
            <span>Create Promotion</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
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
              <p className="text-sm text-gray-600">Active</p>
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
        <div className="flex-1 relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search promotions by title, description..."
            className="input-field pl-10 w-full"
          />
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <HiFilter className="h-5 w-5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field flex-grow md:flex-grow-0"
          >
            <option value="all">All Promotions</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Promotions Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredPromotions.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <HiColorSwatch className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {search ? 'No matching results found' : 'No promotions created yet'}
          </h3>
          <p className="text-gray-600">
            {search ? 'Try a different search term' : 'Create your first promotion to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromotions.map((promo) => (
            <div key={promo.id} className="card hover:shadow-lg transition-shadow">
               {/* Promotion Preview */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-center">
                <PromotionPreview ad={promo} />
              </div>

              {/* Details */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate">{promo.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{promo.description}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${promo.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {promo.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Color Preview */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: promo.bgColor }}
                    />
                    <span className="text-xs text-gray-500">BG</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: promo.textColor }}
                    />
                    <span className="text-xs text-gray-500">Text</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm pt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Clicks:</span>
                    <span className="font-medium">{promo.clicks || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Impressions:</span>
                    <span className="font-medium">{promo.impressions || 0}</span>
                  </div>
                </div>

                {promo.link && (
                  <div className="pt-2">
                    <a
                      href={promo.link}
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
                    onClick={() => handleEdit(promo)}
                    className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded-lg transition-colors"
                  >
                    <HiPencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id, promo.title)}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <HiTrash className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Promotion Modal */}
      {isModalOpen && (
        <PromotionModal
          ad={selectedPromotion}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPromotion(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Promotions;
