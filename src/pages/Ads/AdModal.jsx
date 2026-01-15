// src/pages/Ads/AdModal.jsx
import { useState, useEffect } from 'react';
import { HiX, HiColorSwatch, HiLink, HiInformationCircle } from 'react-icons/hi';

// Predefined color options
const COLOR_OPTIONS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Green', value: '#10B981' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Gray', value: '#6B7280' },
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
];

const TEXT_COLORS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#000000' },
  { name: 'Gray', value: '#374151' },
  { name: 'Blue', value: '#1E40AF' },
];

const AdModal = ({ ad, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    details: '',
    link: '',
    bgColor: '#3B82F6',
    textColor: '#FFFFFF',
    isActive: true,
    position: 'mobile'
  });
  const [loading, setLoading] = useState(false);
  const [customBgColor, setCustomBgColor] = useState('');

  useEffect(() => {
    if (ad) {
      setFormData({
        title: ad.title || '',
        description: ad.description || '',
        details: ad.details || '',
        link: ad.link || '',
        bgColor: ad.bgColor || '#3B82F6',
        textColor: ad.textColor || '#FFFFFF',
        isActive: ad.isActive !== false,
        position: ad.position || 'mobile'
      });
    }
  }, [ad]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleColorSelect = (color, type) => {
    setFormData(prev => ({
      ...prev,
      [type]: color
    }));
  };

  const handleCustomColor = () => {
    if (customBgColor) {
      handleColorSelect(customBgColor, 'bgColor');
      setCustomBgColor('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter ad title');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('Please enter ad description');
      return;
    }
    
    try {
      setLoading(true);
      await onSave(formData);
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {ad ? 'Edit Ad' : 'Create New Ad'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <HiX className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Ad Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center space-x-2">
                <HiInformationCircle className="h-5 w-5 text-blue-600" />
                <span>Ad Preview (300×50 pixels)</span>
              </h3>
              <div className="flex items-center justify-center">
                <div 
                  className="w-300 h-50 rounded-lg shadow-md flex flex-col items-center justify-center overflow-hidden p-2"
                  style={{ 
                    backgroundColor: formData.bgColor,
                    color: formData.textColor
                  }}
                >
                  <div className="text-xs font-bold truncate max-w-full text-center">
                    {formData.title || 'Ad Title'}
                  </div>
                  <div className="text-[10px] text-center truncate max-w-full mt-1">
                    {formData.description || 'Ad description will appear here'}
                  </div>
                  {formData.details && (
                    <div className="text-[8px] text-center opacity-90 mt-1">
                      {formData.details}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                This is how your 300×50 pixel ad will appear on mobile
              </p>
            </div>

            {/* Ad Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ad Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="Enter ad title (short and catchy)"
                  required
                  disabled={loading}
                  maxLength={30}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max 30 characters (appears in bold)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field w-full h-50 resize-none"
                  placeholder="Enter ad description"
                  required
                  disabled={loading}
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max 60 characters (appears in regular text)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Details
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  className="input-field w-full h-16 resize-none"
                  placeholder="Additional information or call-to-action"
                  disabled={loading}
                  maxLength={40}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max 40 characters (smaller text, optional)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link URL
                </label>
                <div className="flex items-center space-x-2">
                  <HiLink className="h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="https://example.com"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Where users will be redirected when they click the ad
                </p>
              </div>

              {/* Color Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color *
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleColorSelect(color.value, 'bgColor')}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.bgColor === color.value 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.bgColor}
                      onChange={(e) => handleColorSelect(e.target.value, 'bgColor')}
                      className="w-10 h-10 cursor-pointer"
                      title="Pick custom color"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={customBgColor}
                          onChange={(e) => setCustomBgColor(e.target.value)}
                          placeholder="#FFFFFF or rgb(255,255,255)"
                          className="input-field text-sm"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={handleCustomColor}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
                          disabled={loading}
                        >
                          Set
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Current: {formData.bgColor}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Color *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TEXT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleColorSelect(color.value, 'textColor')}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.textColor === color.value 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-300'
                        } flex items-center justify-center`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {color.value === '#FFFFFF' && (
                          <div className="w-3 h-3 border border-gray-400 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {formData.textColor}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="input-field w-full"
                    disabled={loading}
                  >
                    <option value="mobile">Mobile Banner</option>
                    <option value="home">Home Page</option>
                    <option value="category">Category Page</option>
                    <option value="search">Search Results</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center space-x-2 mt-6">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 rounded"
                      disabled={loading}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Active Ad
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Inactive ads won't be shown to users
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 p-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{ad ? 'Update Ad' : 'Create Ad'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdModal;