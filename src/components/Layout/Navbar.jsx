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
    <nav className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 bg-white/80 backdrop-blur-md px-6 border-b border-slate-100">
      {/* Mobile Menu Button - Styled */}
      {isMobile && (
        <button
          onClick={onMenuClick}
          className="p-2.5 rounded-xl bg-slate-100/50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200"
        >
          <HiMenu className="h-6 w-6" />
        </button>
      )}

      {/* Brand/Logo - Mobile only title if needed, or desktop title */}
      {!isMobile && (
        <div className="flex-shrink-0">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
        </div>
      )}

      {/* Search Bar - Modern & Responsive */}
      <div className={`
        flex-1 max-w-2xl transition-all duration-300
        ${isSearchActive && isMobile ? 'fixed inset-0 z-50 flex items-center bg-white p-4 h-20 px-6 border-b border-slate-100' : 'relative hidden lg:block'}
      `}>
        <form ref={searchRef} onSubmit={handleSearch} className="w-full relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <HiSearch className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search everything..."
            className="input-field pl-12 pr-4 bg-slate-50 border-slate-100 focus:bg-white w-full"
            autoFocus={isSearchActive && isMobile}
          />
          {isSearchActive && isMobile && (
            <button
              type="button"
              onClick={() => setIsSearchActive(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <HiX className="h-5 w-5" />
            </button>
          )}
        </form>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        {/* Mobile Search Toggle */}
        {isMobile && !isSearchActive && (
          <button
            onClick={() => setIsSearchActive(true)}
            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <HiSearch className="h-6 w-6" />
          </button>
        )}

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all duration-200 relative group"
          >
            <HiBell className="h-6 w-6" />
            {unreadNotifications > 0 && (
              <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-indigo-500 ring-2 ring-white rounded-full"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
              <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <span className="font-bold text-slate-900 text-sm">Recent Notifications</span>
                {unreadNotifications > 0 && (
                  <button onClick={markAllAsRead} className="text-[10px] uppercase font-black text-indigo-500 hover:text-indigo-600 tracking-widest">Mark All Read</button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${!n.read ? 'bg-indigo-50/30' : ''}`}>
                    <p className="text-sm text-slate-700 font-semibold">{n.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative h-10 w-px bg-slate-100 mx-1 hidden sm:block"></div>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 pl-1 sm:pl-2 group"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-slate-900 leading-none">{userData.name}</p>
              <p className="text-[10px] text-indigo-500 mt-1 uppercase tracking-widest font-black leading-none">{userData.role}</p>
            </div>

            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 shadow-sm group-hover:scale-105 transition-transform duration-200">
              {userData.initials}
            </div>
            <HiChevronDown className={`h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-transform hidden sm:block ${isUserMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
              <div className="p-5 bg-slate-50">
                <p className="font-bold text-slate-900 text-sm">{userData.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{userData.email}</p>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all font-bold text-[13px]">
                  <HiOutlineUser className="h-5 w-5" />
                  <span>Account Settings</span>
                </button>
                <div className="h-px bg-slate-100 my-1"></div>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all font-bold text-[13px]">
                  <HiOutlineLogout className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;