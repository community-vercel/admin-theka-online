// src/components/Layout/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { 
  HiSearch, 
  HiBell, 
  HiUserCircle, 
  HiMenu, 
  HiX,
  HiChevronDown,
  HiOutlineLogout,
  HiOutlineCog,
  HiOutlineUser,
  HiOutlineSun,
  HiOutlineMoon
} from 'react-icons/hi';

const Navbar = ({ onMenuClick, isMobile, user = null }) => {
  const [search, setSearch] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchRef = useRef(null);

  // User data with fallback
  const userData = user || {
    name: 'Admin User',
    role: 'Super Admin',
    email: 'admin@example.com',
    initials: 'AU',
    avatarColor: 'from-blue-500 to-purple-600'
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target) && isSearchActive) {
        setIsSearchActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchActive]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', search);
    // Implement search logic here
  };

  // Notifications data
  const notifications = [
    { id: 1, title: 'New user registered', time: '5 min ago', read: false },
    { id: 2, title: 'Payment received', time: '1 hour ago', read: false },
    { id: 3, title: 'System update completed', time: '2 hours ago', read: true },
    { id: 4, title: 'New message from John', time: '1 day ago', read: true },
  ];

  const markAllAsRead = () => {
    setUnreadNotifications(0);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            
            {/* Left Section - Mobile Menu & Brand */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Mobile Menu Button */}
              {isMobile && (
                <button
                  onClick={onMenuClick}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Toggle menu"
                >
                  <HiMenu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              )}

              {/* Brand/Logo - Hidden on small mobile, shown on larger screens */}
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                  Dashboard
                </h1>
              </div>
            </div>

            {/* Center Section - Search Bar */}
            <div className={`flex-1 transition-all duration-300 ${isSearchActive && isMobile ? 'absolute left-0 right-0 mx-4 top-16 z-40' : 'max-w-2xl'}`}>
              <form 
                ref={searchRef}
                onSubmit={handleSearch}
                className={`relative ${isSearchActive && isMobile ? 'shadow-lg' : ''}`}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                
                {/* Mobile Search Toggle */}
                {isMobile && !isSearchActive && (
                  <button
                    type="button"
                    onClick={() => setIsSearchActive(true)}
                    className="w-full flex items-center justify-center p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <HiSearch className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-500 dark:text-gray-400">Search...</span>
                  </button>
                )}

                {/* Search Input - Always visible on desktop, conditional on mobile */}
                {(!isMobile || isSearchActive) && (
                  <div className="relative">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search users, reports, analytics..."
                      className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      autoFocus={isMobile && isSearchActive}
                    />
                    {isMobile && isSearchActive && (
                      <button
                        type="button"
                        onClick={() => setIsSearchActive(false)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                        aria-label="Close search"
                      >
                        <HiX className="h-5 w-5 text-gray-400" />
                      </button>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="hidden sm:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? (
                  <HiOutlineSun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <HiOutlineMoon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>

              {/* Notifications Dropdown */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    setIsUserMenuOpen(false);
                  }}
                  className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Notifications"
                >
                  <HiBell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {/* Notifications Dropdown Menu */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        {unreadNotifications > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-gray-700' : ''}`}
                        >
                          <p className="font-medium text-gray-900 dark:text-white">{notification.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
                      <a
                        href="#"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        View all notifications
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(!isUserMenuOpen);
                    setIsNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="User menu"
                >
                  {/* User Info - Hidden on small mobile */}
                  <div className="hidden sm:block text-right">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate max-w-[120px]">
                      {userData.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                      {userData.role}
                    </p>
                  </div>

                  {/* User Avatar */}
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r ${userData.avatarColor} rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base`}>
                    {userData.initials}
                  </div>

                  <HiChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    {/* User Info in Dropdown */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-r ${userData.avatarColor} rounded-full flex items-center justify-center text-white font-bold`}>
                          {userData.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {userData.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {userData.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <a
                        href="#"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <HiOutlineUser className="h-5 w-5" />
                        <span>Profile</span>
                      </a>
                      <a
                        href="#"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <HiOutlineCog className="h-5 w-5" />
                        <span>Settings</span>
                      </a>
                      <button
                        onClick={toggleDarkMode}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {darkMode ? (
                          <HiOutlineSun className="h-5 w-5" />
                        ) : (
                          <HiOutlineMoon className="h-5 w-5" />
                        )}
                        <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                      </button>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                      <a
                        href="#"
                        className="flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <HiOutlineLogout className="h-5 w-5" />
                        <span>Logout</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed navbar on mobile */}
      {isMobile && (
        <div className="h-16"></div>
      )}
    </>
  );
};

export default Navbar;