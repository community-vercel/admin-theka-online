// src/components/Layout/Sidebar.jsx
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import {
  HiHome,
  HiUsers,
  HiCheckCircle,
  HiCog,
  HiLogout,
  HiChevronRight,
  HiChevronLeft,
  HiPhotograph,
  HiChartBar,
  HiDocumentReport,
  HiCollection,
  HiCash,
  HiShoppingCart
} from 'react-icons/hi';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import toast from 'react-hot-toast';

const Sidebar = ({ isMobile, onItemClick, isCollapsed = false, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extended menu items for full sidebar
  const menuItems = [
    { path: '/dashboard', icon: <HiHome />, label: 'Dashboard' },
    { path: '/users', icon: <HiUsers />, label: 'Users Management' },
    { path: '/verification', icon: <HiCheckCircle />, label: 'Verification', badge: '' },
    { path: '/ads', icon: <HiPhotograph />, label: 'Ads Management' },
    { path: '/settings', icon: <HiCog />, label: 'Settings' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  // On mobile, sidebar is always expanded when open
  const shouldShowLabels = !isCollapsed || isMobile;

  // Your logo URL
  const logoUrl = "https://play-lh.googleusercontent.com/UOGpk5_SOc9SfmhOt2iHKULwVVlRzDwIZzTM0XXrkpfbXn6YyugxWk2lA-Y6Y-WkriF3dFBk7_hqjZz2NbMh=w240-h480-rw";

  return (
    <aside className={`
      bg-gray-900 text-white 
      h-screen
      fixed left-0 top-0
      z-40
      transition-all duration-300 
      ${isMobile ? 'w-72' : isCollapsed ? 'w-20' : 'w-64'}
      flex flex-col
      shadow-2xl
    `}>
      {/* Sidebar Header with Logo */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        {shouldShowLabels ? (
          <div className="flex items-center space-x-3">
            {/* Logo Container */}
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden">
              {/* Logo Image */}
              <img 
                src={logoUrl} 
                alt="Theka Online Logo" 
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="font-bold text-white">T</span>';
                }}
              />
            </div>
            <h1 className="text-xl font-bold">Theka Online</h1>
          </div>
        ) : (
          // Collapsed Logo View
          <div className="flex items-center justify-center w-full">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden">
              <img 
                src={logoUrl} 
                alt="Theka Online Logo" 
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="font-bold text-white text-sm">T</span>';
                }}
              />
            </div>
          </div>
        )}
        
        {/* Collapse Toggle (Desktop only) */}
        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <HiChevronRight className="h-5 w-5" /> : <HiChevronLeft className="h-5 w-5" />}
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-2 md:p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleItemClick}
            className={({ isActive }) => `
              flex items-center justify-between space-x-3 p-3 rounded-lg transition-colors
              ${isActive 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }
            `}
            title={!shouldShowLabels ? item.label : ''}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {shouldShowLabels && (
                <span className="font-medium truncate">{item.label}</span>
              )}
            </div>
            
            {/* Badge */}
            {item.badge && shouldShowLabels && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-800 bg-gray-850">
        <div className={`flex items-center ${shouldShowLabels ? 'space-x-3' : 'justify-center'}`}>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            {/* User Avatar with fallback to initials */}
            <img 
              src="https://ui-avatars.com/api/?name=Admin+User&background=random&color=fff&bold=true" 
              alt="Admin User" 
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="font-bold text-white">A</span>';
              }}
            />
          </div>
          
          {shouldShowLabels && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">Admin User</p>
              <p className="text-sm text-gray-400 truncate">Super Admin</p>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
            title="Logout"
            aria-label="Logout"
          >
            <HiLogout className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;