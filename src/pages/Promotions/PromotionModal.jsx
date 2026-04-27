// src/pages/Promotions/PromotionModal.jsx
import { useState, useEffect } from 'react';
import { HiX, HiColorSwatch, HiLink, HiInformationCircle } from 'react-icons/hi';
import StorageImage from '../../components/Common/StorageImage';

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

const PromotionModal = ({ ad, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    details: '',
    link: '',
    bgColor: '#3B82F6',
    textColor: '#FFFFFF',
    isActive: true,
    position: 'mobile',
    companyLogo: ''
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
        position: ad.position || 'mobile',
        companyLogo: ad.companyLogo || ''
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
      alert('Please enter title');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please enter description');
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
            {ad ? 'Edit Promotion' : 'Create New Promotion'}
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
            {/* Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center space-x-2">
                <HiInformationCircle className="h-5 w-5 text-blue-600" />
                <span>Live Preview</span>
              </h3>
              <div className="flex items-center justify-center">
                <div
                  className="w-300 h-50 rounded-lg shadow-md flex items-center overflow-hidden p-2"
                  style={{
                    backgroundColor: formData.bgColor,
                    color: formData.textColor,
                    width: '300px',
                    height: '50px'
                  }}
                >
                  {formData.companyLogo && (
                    <div className="h-10 w-10 shrink-0 bg-white/20 rounded-md overflow-hidden mr-3">
                      <StorageImage src={formData.companyLogo} alt="Logo" className="h-full w-full object-contain" />
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <div className="text-xs font-bold truncate max-w-full">
                      {formData.title || 'Title'}
                    </div>
                    <div className="text-[10px] truncate max-w-full mt-0.5 opacity-90">
                      {formData.description || 'Description will appear here'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field w-full"
                  required
                  disabled={loading}
                  maxLength={30}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field w-full h-20 resize-none"
                  required
                  disabled={loading}
                  maxLength={60}
                />
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo / Image URL or Path
                </label>
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                    {formData.companyLogo ? (
                      <StorageImage src={formData.companyLogo} alt="Preview" className="h-full w-full object-contain" />
                    ) : (
                      <HiX className="h-5 w-5 opacity-20" />
                    )}
                  </div>
                  <input
                    type="text"
                    name="companyLogo"
                    value={formData.companyLogo}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="URL or storage path"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Color Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleColorSelect(color.value, 'bgColor')}
                        className={`w-6 h-6 rounded-full border ${formData.bgColor === color.value ? 'ring-2 ring-blue-500' : 'border-gray-300'}`}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TEXT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleColorSelect(color.value, 'textColor')}
                        className={`w-6 h-6 rounded-full border ${formData.textColor === color.value ? 'ring-2 ring-blue-500' : 'border-gray-300'}`}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded"
                  disabled={loading}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active
                </label>
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
              {loading ? 'Saving...' : (ad ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromotionModal;
