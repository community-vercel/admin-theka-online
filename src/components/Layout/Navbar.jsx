import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { dashboardService } from '../../services/dashboardService';
import { 
  HiSearch, 
  HiBell, 
  HiMenu, 
  HiX, 
  HiChevronDown, 
  HiChevronRight,
  HiOutlineLogout, 
  HiOutlineUser, 
  HiDotsVertical,
  HiUserAdd, 
  HiCheckCircle,
  HiClipboardList
} from 'react-icons/hi';
import { Link } from 'react-router-dom';

const Navbar = ({ onMenuClick, isMobile, user = null }) => {
  const [search, setSearch] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    fetchDynamicNotifications();
    // Refresh every 5 minutes
    const interval = setInterval(fetchDynamicNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDynamicNotifications = async () => {
    try {
      setLoading(true);
      const [registrations, acceptances] = await Promise.all([
        dashboardService.getRecentRegistrations(),
        dashboardService.getRecentAcceptances()
      ]);

      // Combine and format
      const formattedNotifications = [
        ...registrations.map(reg => ({
          id: `reg-${reg.id}`,
          title: `New ${reg.type === 'customer' ? 'Customer' : 'Provider'}`,
          message: `${reg.name} from ${reg.city} registered`,
          time: reg.date,
          icon: <HiUserAdd className="h-4 w-4 text-blue-500" />,
          link: reg.type === 'customer' ? `/users/${reg.id}` : `/verification`,
          type: 'registration',
          read: false
        })),
        ...acceptances.map(acc => ({
          id: `acc-${acc.id}`,
          title: 'New Acceptance',
          message: `${acc.userName} accepted ${acc.providerName}'s ${acc.service} request`,
          time: acc.acceptedAt,
          icon: <HiCheckCircle className="h-4 w-4 text-green-500" />,
          link: `/acceptance-logs/${acc.id}`,
          type: 'acceptance',
          read: false
        }))
      ]
      .sort((a, b) => b.time - a.time)
      .slice(0, 10);

      setNotifications(formattedNotifications);
      setUnreadNotifications(formattedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

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
    if (e) e.preventDefault();
    console.log('Searching for:', search);
    // Broadcast search event to all listeners
    window.dispatchEvent(new CustomEvent('app:search', { detail: search }));
  };

  // Broadcast on value change too for real-time results
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('app:search', { detail: search }));
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadNotifications(0);
  };

  return (
    <nav className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 bg-white/80 backdrop-blur-md px-6 border-b border-slate-100">
      {/* Mobile Menu Button - Hidden to favor Bottom Nav */}
      {isMobile && false && (
        <button
          onClick={onMenuClick}
          className="p-2.5 rounded-xl bg-slate-100/50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200"
        >
          <HiMenu className="h-6 w-6" />
        </button>
      )}

      {/* Brand/Logo - Show on all screens for context */}
      <div className="flex-shrink-0">
        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
          Dashboard
        </h1>
      </div>

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

        {/* Notifications - Hidden on Mobile (moved to More menu) */}
        {!isMobile && (
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
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">Recent Activity</span>
                    <p className="text-[10px] text-slate-400 font-medium">Last 10 dynamic updates</p>
                  </div>
                  {unreadNotifications > 0 && (
                    <button onClick={markAllAsRead} className="text-[10px] uppercase font-black text-indigo-500 hover:text-indigo-600 tracking-widest">Mark All Read</button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {loading && notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto mb-2"></div>
                      <p className="text-xs text-slate-500">Checking for updates...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <HiBell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p className="text-xs">No recent activity</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <Link 
                        key={n.id} 
                        to={n.link}
                        onClick={() => setIsNotificationsOpen(false)}
                        className={`block p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${!n.read ? 'bg-indigo-50/20' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className="mt-1 h-8 w-8 rounded-lg bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0">
                            {n.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                              <p className="text-[13px] text-slate-900 font-bold leading-tight">{n.title}</p>
                              <HiChevronRight className="h-4 w-4 text-slate-300" />
                            </div>
                            <p className="text-xs text-slate-500 leading-normal line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1.5 uppercase tracking-wider font-bold">
                              {formatDistanceToNow(new Date(n.time), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </Link>
                    )
                  ))}
                </div>
                <Link 
                  to="/acceptance-logs" 
                  onClick={() => setIsNotificationsOpen(false)}
                  className="p-3 bg-slate-50 text-center block text-[10px] font-black uppercase text-slate-400 hover:text-indigo-500 transition-colors tracking-[0.2em]"
                >
                  View All Activity Logs
                </Link>
              </div>
            )}
          </div>
        )}

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

            <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-extrabold text-indigo-600 shadow-sm group-hover:scale-105 transition-transform duration-200">
              {userData.initials}
            </div>
            <div className="p-1 rounded-lg bg-slate-50 border border-slate-100 sm:hidden">
              <HiDotsVertical className={`h-4 w-4 text-slate-500 transition-transform ${isUserMenuOpen ? 'rotate-90' : ''}`} />
            </div>
            <HiChevronDown className={`h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-transform hidden sm:block ${isUserMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300">
              <div className="p-5 bg-slate-50/50">
                <p className="font-extrabold text-slate-900 text-sm tracking-tight">{userData.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">{userData.email}</p>
              </div>
              <div className="p-3 space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all font-bold text-[13px]">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                    <HiOutlineUser className="h-5 w-5" />
                  </div>
                  <span>Account Settings</span>
                </button>
                <button className="w-full sm:hidden flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all font-bold text-[13px]">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-500">
                    <HiBell className="h-5 w-5" />
                  </div>
                  <span>Notifications</span>
                </button>
                <div className="h-px bg-slate-100 my-2 mx-4"></div>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-bold text-[13px]">
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-500">
                    <HiOutlineLogout className="h-5 w-5" />
                  </div>
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