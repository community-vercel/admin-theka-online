// src/components/Layout/Layout.jsx
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import {
  HiMenu,
  HiX,
  HiHome,
  HiUsers,
  HiCheckCircle,
  HiPhotograph,
  HiCog,
  HiUser,
  HiChartBar,
  HiBell
} from 'react-icons/hi';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();

  // Check screen size and handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false); // Auto-close sidebar on resize to desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/dashboard')) setActiveTab('dashboard');
    else if (path.includes('/users')) setActiveTab('users');
    else if (path.includes('/verification')) setActiveTab('verification');
    else if (path.includes('/ads')) setActiveTab('ads');
    else if (path.includes('/settings')) setActiveTab('settings');
    else if (path.includes('/profile')) setActiveTab('profile');
  }, [location]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Navigation handlers for mobile bottom nav
  const navigateTo = (path, tabName) => {
    navigate(path);
    setActiveTab(tabName);
    closeSidebar();
  };

  // Bottom navigation items - show only most important 3-4 items
  const bottomNavItems = [
    {
      id: 'dashboard',
      icon: <HiHome className="h-5 w-5" />,
      label: 'Home',
      path: '/dashboard',
      color: 'text-blue-600'
    },
    {
      id: 'users',
      icon: <HiUsers className="h-5 w-5" />,
      label: 'Users',
      path: '/users',
      color: 'text-purple-600'
    },
    {
      id: 'verification',
      icon: <HiCheckCircle className="h-5 w-5" />,
      label: 'Verify',
      path: '/verification',
      color: 'text-green-600'
    },
    {
      id: 'menu',
      icon: isSidebarOpen ? <HiX className="h-5 w-5" /> : <HiMenu className="h-5 w-5" />,
      label: 'Menu',
      path: null,
      color: 'text-gray-600',
      action: toggleSidebar
    }
  ];

  // Main content padding should be responsive to the sidebar state and screen size
  const mainContentClasses = `
    transition-all duration-300 ease-in-out flex-1
    ${isMobile ? 'ml-0' : 'ml-64'}
    p-4 sm:p-6 lg:p-8
    overflow-y-auto pb-24 sm:pb-8
  `;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Menu Toggle Button (Floating) */}
      {isMobile && !isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Open menu"
          style={{
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)'
          }}
        >
          <HiMenu className="h-5 w-5" />
        </button>
      )}

      {/* Sidebar - Full menu on mobile, fixed on desktop */}
      <div className={`
        fixed left-0 top-0 h-screen z-40 transition-all duration-300 ease-in-out
        ${isMobile
          ? isSidebarOpen
            ? 'translate-x-0 w-72'
            : '-translate-x-full w-72'
          : 'translate-x-0 w-64'
        }
      `}>
        <Sidebar
          onItemClick={closeSidebar}
          isMobile={isMobile}
          isCollapsed={false}
          onToggleCollapse={toggleSidebar}
        />
      </div>

      {/* Backdrop for mobile sidebar */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <div className={`
        flex-1 flex flex-col min-h-screen transition-all duration-300
        ${!isMobile ? 'pl-64' : ''}
      `}>
        {/* Navbar */}
        <Navbar
          onMenuClick={toggleSidebar}
          isMobile={isMobile}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Main Content */}
        <main className={mainContentClasses}>
          <div className="max-w-screen-2xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Professional Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg lg:hidden z-40">
          <div className="flex justify-around items-center h-16">
            {bottomNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else if (item.path) {
                    navigateTo(item.path, item.id);
                  }
                }}
                className={`
                  flex flex-col items-center justify-center 
                  w-full h-full relative transition-all duration-200
                  ${activeTab === item.id ? 'text-blue-600' : 'text-gray-500'}
                  hover:${item.color.replace('text-', 'text-')}
                `}
              >
                {/* Active indicator */}
                {activeTab === item.id && (
                  <div className="absolute top-0 w-12 h-1 bg-blue-600 rounded-b-full"></div>
                )}

                <div className={`${activeTab === item.id ? 'scale-110' : 'scale-100'} transition-transform`}>
                  {item.icon}
                </div>

                <span className="text-xs mt-1 font-medium">{item.label}</span>

                {/* Notification badge for specific items */}
                {item.id === 'verification' && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-100 text-white text-xs rounded-full flex items-center justify-center">

                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Safe area for iPhone notch */}
          <div className="h-safe-bottom bg-white"></div>
        </div>
      )}

      {/* Safe area CSS */}
      <style jsx global>{`
        .h-safe-bottom {
          height: env(safe-area-inset-bottom, 0px);
        }
        
        @supports (padding: max(0px)) {
          .pb-safe-bottom {
            padding-bottom: max(env(safe-area-inset-bottom, 0px), 1rem);
          }
        }
      `}</style>
    </div>
  );
};

// Optional: Responsive Container for content
export const ResponsiveContainer = ({ children, maxWidth = '7xl', padding = true }) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={`
      mx-auto w-full
      ${maxWidthClasses[maxWidth] || maxWidthClasses['7xl']}
      ${padding ? 'px-4 sm:px-6 lg:px-8' : ''}
    `}>
      {children}
    </div>
  );
};

// Optional: Page Container with responsive spacing
export const PageContainer = ({ children, title, actions }) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {title && (
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {title}
            </h1>
          )}
          {actions && (
            <div className="flex flex-wrap gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Page Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default Layout;