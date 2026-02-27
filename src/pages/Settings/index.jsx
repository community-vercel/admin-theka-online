// src/pages/Settings/index.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { settingsService } from '../../services/settingsService';
import {
  HiCog,
  HiBriefcase,
  HiHome,
  HiPlus,
  HiTrash,
  HiCheck,
  HiX,
  HiSave,
  HiRefresh,
  HiExclamationCircle,
  HiSearch,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineAdjustments,
  HiOutlineSortAscending,
  HiOutlineSortDescending
} from 'react-icons/hi';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('cities');
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState({
    skilled: [],
    unskilled: []
  });
  const [categorySubcategories, setCategorySubcategories] = useState({}); // { categoryName: [subs] }

  // Cities state
  const [newCity, setNewCity] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [cityCurrentPage, setCityCurrentPage] = useState(1);
  const [citiesPerPage] = useState(10);
  const [citySortOrder, setCitySortOrder] = useState('asc'); // 'asc' or 'desc'

  // Service Categories state
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'skilled'
  });
  const [searchCategory, setSearchCategory] = useState('');
  const [categoryCurrentPage, setCategoryCurrentPage] = useState(1);
  const [categoriesPerPage] = useState(12);
  const [categorySortOrder, setCategorySortOrder] = useState('asc');

  // Subcategories state
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); // { name, type }
  const [subcategories, setSubcategories] = useState([]);
  const [subLoading, setSubLoading] = useState(false);
  const [newSubcategory, setNewSubcategory] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [citiesData, categoriesData] = await Promise.all([
        settingsService.getCities(),
        settingsService.getServiceCategories()
      ]);

      console.log('Fetched categories:', categoriesData); // Debug log

      setCities(citiesData);
      setCategories(categoriesData);

      // Fetch subcategories for all categories
      const allCats = [...categoriesData.skilled, ...categoriesData.unskilled];
      const subData = {};

      // Fetch in parallel
      const subPromises = allCats.map(async (cat) => {
        const type = categoriesData.skilled.includes(cat) ? 'skilled' : 'unskilled';
        try {
          const subs = await settingsService.getSubcategories(type, cat);
          subData[cat] = subs;
        } catch (e) {
          console.error(`Error fetching subcategories for ${cat}:`, e);
          subData[cat] = [];
        }
      });

      await Promise.all(subPromises);
      setCategorySubcategories(subData);

    } catch (error) {
      console.error('Error fetching settings data:', error);
      toast.error('Failed to load settings data');
    } finally {
      setLoading(false);
    }
  };

  // Cities Functions
  const handleAddCity = async () => {
    if (!newCity.trim()) {
      toast.error('Please enter a city name');
      return;
    }

    try {
      const updatedCities = await settingsService.addCity(newCity.trim());
      setCities(updatedCities);
      setNewCity('');
      toast.success('City added successfully');
    } catch (error) {
      console.error('Error adding city:', error);
      toast.error(error.message || 'Failed to add city');
    }
  };

  const handleDeleteCity = async (cityName) => {
    if (window.confirm(`Are you sure you want to delete "${cityName}"? This will affect users who have selected this city.`)) {
      try {
        const updatedCities = await settingsService.deleteCity(cityName);
        setCities(updatedCities);
        toast.success('City deleted successfully');
      } catch (error) {
        console.error('Error deleting city:', error);
        toast.error('Failed to delete city');
      }
    }
  };

  // Service Categories Functions
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      const updatedCategories = await settingsService.addServiceCategory(
        newCategory.type,
        newCategory.name.trim()
      );
      setCategories(updatedCategories);
      setCategorySubcategories(prev => ({
        ...prev,
        [newCategory.name.trim()]: []
      }));
      setNewCategory({ name: '', type: 'skilled' });
      toast.success('Category added successfully');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(error.message || 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (categoryType, categoryName) => {
    if (window.confirm(`Are you sure you want to delete "${categoryName}"? This will affect service providers who have selected this category.`)) {
      try {
        const updatedCategories = await settingsService.deleteServiceCategory(
          categoryType,
          categoryName
        );
        setCategories(updatedCategories);
        toast.success('Category deleted successfully');
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  const handleManageSubcategories = async (categoryType, categoryName) => {
    setSelectedCategory({ name: categoryName, type: categoryType });
    setNewSubcategory(''); // Reset input
    setIsSubModalOpen(true);
    setSubLoading(true);
    try {
      const data = await settingsService.getSubcategories(categoryType, categoryName);
      setSubcategories(data);
      setCategorySubcategories(prev => ({ ...prev, [categoryName]: data }));
    } catch (error) {
      console.error('Error loading subcategories:', error);
      toast.error('Failed to load subcategories');
    } finally {
      setSubLoading(false);
    }
  };

  const handleAddSubcategory = async () => {
    const trimmedSub = newSubcategory.trim();

    if (!trimmedSub) {
      toast.error('Please enter a subcategory name');
      return;
    }

    if (subcategories.includes(trimmedSub)) {
      toast.error('Subcategory already exists');
      return;
    }

    if (!selectedCategory) {
      toast.error('No category selected');
      return;
    }

    try {
      const updated = [...subcategories, trimmedSub];
      await settingsService.updateSubcategories(
        selectedCategory.type,
        selectedCategory.name,
        updated
      );
      setSubcategories(updated);
      setCategorySubcategories(prev => ({
        ...prev,
        [selectedCategory.name]: updated
      }));
      setNewSubcategory('');
      toast.success('Subcategory added successfully');
    } catch (error) {
      console.error('Error adding subcategory:', error);
      toast.error(error.message || 'Failed to add subcategory');
    }
  };

  const handleDeleteSubcategory = async (subName) => {
    const updated = subcategories.filter(s => s !== subName);
    try {
      await settingsService.updateSubcategories(
        selectedCategory.type,
        selectedCategory.name,
        updated
      );
      setSubcategories(updated);
      setCategorySubcategories(prev => ({
        ...prev,
        [selectedCategory.name]: updated
      }));
      toast.success('Subcategory deleted');
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error('Failed to delete subcategory');
    }
  };

  // Filter and Sort Cities
  const filteredCities = cities
    .filter(city => city.toLowerCase().includes(searchCity.toLowerCase()))
    .sort((a, b) => {
      if (citySortOrder === 'asc') {
        return a.localeCompare(b);
      } else {
        return b.localeCompare(a);
      }
    });

  // Filter and Sort Categories
  const filteredSkilled = categories.skilled
    .filter(cat => cat.toLowerCase().includes(searchCategory.toLowerCase()))
    .sort((a, b) => {
      if (categorySortOrder === 'asc') {
        return a.localeCompare(b);
      } else {
        return b.localeCompare(a);
      }
    });

  const filteredUnskilled = categories.unskilled
    .filter(cat => cat.toLowerCase().includes(searchCategory.toLowerCase()))
    .sort((a, b) => {
      if (categorySortOrder === 'asc') {
        return a.localeCompare(b);
      } else {
        return b.localeCompare(a);
      }
    });

  // Cities Pagination
  const cityIndexOfLastItem = cityCurrentPage * citiesPerPage;
  const cityIndexOfFirstItem = cityIndexOfLastItem - citiesPerPage;
  const currentCities = filteredCities.slice(cityIndexOfFirstItem, cityIndexOfLastItem);
  const totalCityPages = Math.ceil(filteredCities.length / citiesPerPage);

  // Categories Pagination
  const allCategories = [...filteredSkilled, ...filteredUnskilled];
  const categoryIndexOfLastItem = categoryCurrentPage * categoriesPerPage;
  const categoryIndexOfFirstItem = categoryIndexOfLastItem - categoriesPerPage;
  const currentCategories = allCategories.slice(categoryIndexOfFirstItem, categoryIndexOfLastItem);
  const totalCategoryPages = Math.ceil(allCategories.length / categoriesPerPage);

  // Reset page when search changes
  useEffect(() => {
    setCityCurrentPage(1);
  }, [searchCity]);

  useEffect(() => {
    setCategoryCurrentPage(1);
  }, [searchCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage Cities </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto custom-scrollbar">
        <nav className="flex space-x-8 min-w-max pb-px">
          <button
            onClick={() => setActiveTab('cities')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${activeTab === 'cities'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <span>Cities</span>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              {cities.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${activeTab === 'services'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <HiBriefcase className="h-5 w-5" />
            <span>Service Categories</span>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              {categories.skilled.length + categories.unskilled.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchData}
          disabled={loading}
          className="btn-secondary flex items-center space-x-2"
        >
          <HiRefresh className="h-5 w-5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : activeTab === 'cities' ? (
        <CitiesTab
          cities={currentCities}
          newCity={newCity}
          setNewCity={setNewCity}
          searchCity={searchCity}
          setSearchCity={setSearchCity}
          onAddCity={handleAddCity}
          onDeleteCity={handleDeleteCity}
          totalCities={filteredCities.length}
          cityCurrentPage={cityCurrentPage}
          totalCityPages={totalCityPages}
          setCityCurrentPage={setCityCurrentPage}
          citySortOrder={citySortOrder}
          setCitySortOrder={setCitySortOrder}
          citiesPerPage={citiesPerPage}
          cityIndexOfFirstItem={cityIndexOfFirstItem}
          cityIndexOfLastItem={cityIndexOfLastItem}
        />
      ) : (
        <ServicesTab
          skilled={filteredSkilled}
          unskilled={filteredUnskilled}
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          searchCategory={searchCategory}
          setSearchCategory={setSearchCategory}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          totalSkilled={categories.skilled.length}
          totalUnskilled={categories.unskilled.length}
          categoryCurrentPage={categoryCurrentPage}
          totalCategoryPages={totalCategoryPages}
          setCategoryCurrentPage={setCategoryCurrentPage}
          categorySortOrder={categorySortOrder}
          setCategorySortOrder={setCategorySortOrder}
          categoriesPerPage={categoriesPerPage}
          categoryIndexOfFirstItem={categoryIndexOfFirstItem}
          categoryIndexOfLastItem={categoryIndexOfLastItem}
          currentCategories={currentCategories}
          onManageSubcategories={handleManageSubcategories}
          categorySubcategories={categorySubcategories}
        />
      )}

      {/* Subcategories Modal */}
      <SubcategoriesModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        category={selectedCategory}
        subcategories={subcategories}
        loading={subLoading}
        newSubcategory={newSubcategory}
        setNewSubcategory={setNewSubcategory}
        onAdd={handleAddSubcategory}
        onDelete={handleDeleteSubcategory}
      />
    </div>
  );
};

// Cities Tab Component
const CitiesTab = ({
  cities,
  newCity,
  setNewCity,
  searchCity,
  setSearchCity,
  onAddCity,
  onDeleteCity,
  totalCities,
  cityCurrentPage,
  totalCityPages,
  setCityCurrentPage,
  citySortOrder,
  setCitySortOrder,
  citiesPerPage,
  cityIndexOfFirstItem,
  cityIndexOfLastItem
}) => (
  <div className="space-y-6">
    {/* Add City Form */}
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <HiPlus className="h-5 w-5 text-blue-600" />
        <span>Add New City</span>
      </h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            placeholder="Enter city name..."
            className="input-field w-full"
            onKeyPress={(e) => e.key === 'Enter' && onAddCity()}
          />
        </div>
        <button
          onClick={onAddCity}
          className="btn-primary flex items-center justify-center space-x-2"
        >
          <HiCheck className="h-5 w-5" />
          <span>Add City</span>
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-3">
        Add cities that will be available for users to select during registration.
      </p>
    </div>

    {/* Cities List */}
    <div className="card">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">All Cities</h3>
            <p className="text-gray-600 text-sm">
              Total {totalCities} cities available
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Search cities..."
                className="input-field pl-10"
              />
            </div>
            <button
              onClick={() => setCitySortOrder(citySortOrder === 'asc' ? 'desc' : 'asc')}
              className="btn-secondary flex items-center space-x-2"
              title={`Sort ${citySortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {citySortOrder === 'asc' ? (
                <HiOutlineSortAscending className="h-5 w-5" />
              ) : (
                <HiOutlineSortDescending className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {cities.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchCity ? 'No matching cities found' : 'No cities available'}
          </h3>
          <p className="text-gray-600">
            {searchCity ? 'Try a different search term' : 'Add your first city using the form above'}
          </p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-200">
            {cities.map((city, index) => (
              <div key={city} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">
                        {city.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{city}</h4>
                      <p className="text-sm text-gray-500">
                        Item #{cityIndexOfFirstItem + index + 1}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteCity(city)}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete City"
                  >
                    <HiTrash className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cities Pagination */}
          {totalCityPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{cityIndexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(cityIndexOfLastItem, totalCities)}
                  </span> of{' '}
                  <span className="font-medium">{totalCities}</span> cities
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCityCurrentPage(Math.max(1, cityCurrentPage - 1))}
                    disabled={cityCurrentPage === 1}
                    className={`p-2 rounded-lg ${cityCurrentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <HiChevronLeft className="h-5 w-5" />
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalCityPages) }, (_, i) => {
                      let pageNum;
                      if (totalCityPages <= 5) {
                        pageNum = i + 1;
                      } else if (cityCurrentPage <= 3) {
                        pageNum = i + 1;
                      } else if (cityCurrentPage >= totalCityPages - 2) {
                        pageNum = totalCityPages - 4 + i;
                      } else {
                        pageNum = cityCurrentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCityCurrentPage(pageNum)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium ${cityCurrentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCityCurrentPage(Math.min(totalCityPages, cityCurrentPage + 1))}
                    disabled={cityCurrentPage === totalCityPages}
                    className={`p-2 rounded-lg ${cityCurrentPage === totalCityPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <HiChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  </div>
);

// Services Tab Component
const ServicesTab = ({
  skilled,
  unskilled,
  newCategory,
  setNewCategory,
  searchCategory,
  setSearchCategory,
  onAddCategory,
  onDeleteCategory,
  totalSkilled,
  totalUnskilled,
  categoryCurrentPage,
  totalCategoryPages,
  setCategoryCurrentPage,
  categorySortOrder,
  setCategorySortOrder,
  categoriesPerPage,
  categoryIndexOfFirstItem,
  categoryIndexOfLastItem,
  currentCategories,
  onManageSubcategories,
  categorySubcategories
}) => {
  return (
    <div className="space-y-6">
      {/* Add Category Form */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <HiPlus className="h-5 w-5 text-blue-600" />
          <span>Add New Service Category</span>
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Type
              </label>
              <select
                value={newCategory.type}
                onChange={(e) => setNewCategory(prev => ({ ...prev, type: e.target.value }))}
                className="input-field w-full"
              >
                <option value="skilled">Skilled Worker</option>
                <option value="unskilled">Unskilled Worker</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder={`Enter ${newCategory.type} category name...`}
                className="input-field w-full"
                onKeyPress={(e) => e.key === 'Enter' && onAddCategory()}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={onAddCategory}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <HiCheck className="h-5 w-5" />
              <span>Add Category</span>
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Add service categories that service providers can select during registration.
        </p>
      </div>

      {/* Categories List */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Service Categories</h3>
              <p className="text-gray-600 text-sm">
                {totalSkilled} skilled • {totalUnskilled} unskilled
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  placeholder="Search categories..."
                  className="input-field pl-10"
                />
              </div>
              <button
                onClick={() => setCategorySortOrder(categorySortOrder === 'asc' ? 'desc' : 'asc')}
                className="btn-secondary flex items-center space-x-2"
                title={`Sort ${categorySortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {categorySortOrder === 'asc' ? (
                  <HiOutlineSortAscending className="h-5 w-5" />
                ) : (
                  <HiOutlineSortDescending className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Skilled Categories */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h4 className="text-lg font-semibold text-gray-900">Skilled Workers</h4>
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                {skilled.length}
              </span>
            </div>
          </div>

          {skilled.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <HiExclamationCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">
                {searchCategory ? 'No matching skilled categories found' : 'No skilled categories added'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skilled.map((category) => (
                <div key={category} className="flex flex-col p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <HiBriefcase className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="font-bold text-gray-900">{category}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onManageSubcategories('skilled', category)}
                        className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Manage Subcategories"
                      >
                        <HiPlus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteCategory('skilled', category)}
                        className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Category"
                      >
                        <HiTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subcategories Display */}
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {categorySubcategories[category]?.length > 0 ? (
                      categorySubcategories[category].map((sub, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 bg-gray-50 text-gray-600 border border-gray-100 rounded-full">
                          {sub}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">No subcategories</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Unskilled Categories */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <HiHome className="h-5 w-5 text-indigo-600" />
              <h4 className="text-lg font-semibold text-gray-900">Unskilled Workers</h4>
              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                {unskilled.length}
              </span>
            </div>
          </div>

          {unskilled.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <HiExclamationCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">
                {searchCategory ? 'No matching unskilled categories found' : 'No unskilled categories added'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unskilled.map((category) => (
                <div key={category} className="flex flex-col p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <HiHome className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span className="font-bold text-gray-900">{category}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onManageSubcategories('unskilled', category)}
                        className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Manage Subcategories"
                      >
                        <HiPlus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteCategory('unskilled', category)}
                        className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Category"
                      >
                        <HiTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subcategories Display */}
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {categorySubcategories[category]?.length > 0 ? (
                      categorySubcategories[category].map((sub, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 bg-gray-50 text-gray-600 border border-gray-100 rounded-full">
                          {sub}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">No subcategories</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories Pagination */}
        {totalCategoryPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{categoryIndexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(categoryIndexOfLastItem, skilled.length + unskilled.length)}
                </span> of{' '}
                <span className="font-medium">{skilled.length + unskilled.length}</span> categories
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCategoryCurrentPage(Math.max(1, categoryCurrentPage - 1))}
                  disabled={categoryCurrentPage === 1}
                  className={`p-2 rounded-lg ${categoryCurrentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <HiChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalCategoryPages) }, (_, i) => {
                    let pageNum;
                    if (totalCategoryPages <= 5) {
                      pageNum = i + 1;
                    } else if (categoryCurrentPage <= 3) {
                      pageNum = i + 1;
                    } else if (categoryCurrentPage >= totalCategoryPages - 2) {
                      pageNum = totalCategoryPages - 4 + i;
                    } else {
                      pageNum = categoryCurrentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCategoryCurrentPage(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium ${categoryCurrentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCategoryCurrentPage(Math.min(totalCategoryPages, categoryCurrentPage + 1))}
                  disabled={categoryCurrentPage === totalCategoryPages}
                  className={`p-2 rounded-lg ${categoryCurrentPage === totalCategoryPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <HiChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Skilled Categories</p>
              <p className="text-2xl font-bold">{totalSkilled}</p>
              <p className="text-xs opacity-90 mt-2">
                Professional service categories
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Unskilled Categories</p>
              <p className="text-2xl font-bold">{totalUnskilled}</p>
              <p className="text-xs opacity-90 mt-2">
                Basic service categories
              </p>
            </div>
            <HiHome className="h-12 w-12 opacity-80" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SubcategoriesModal = ({
  isOpen,
  onClose,
  category,
  subcategories,
  loading,
  newSubcategory,
  setNewSubcategory,
  onAdd,
  onDelete
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-lg transform transition-all">
        <div className="px-6 pt-5 pb-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Manage Subcategories: <span className="text-blue-600 font-bold">{category?.name}</span>
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <HiX className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onAdd();
                  }
                }}
                placeholder="Enter subcategory name..."
                className="input-field flex-1"
                autoFocus
              />
              <button
                type="button"
                onClick={onAdd}
                className="btn-primary px-4 flex items-center justify-center whitespace-nowrap"
                disabled={loading}
              >
                <HiPlus className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : subcategories.length === 0 ? (
              <p className="text-center py-8 text-gray-500 italic">No subcategories yet</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {subcategories.map((sub, idx) => (
                  <li key={idx} className="flex items-center justify-between p-4 hover:bg-white transition-colors">
                    <span className="text-gray-800 font-medium">{sub}</span>
                    <button
                      onClick={() => onDelete(sub)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <HiTrash className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
