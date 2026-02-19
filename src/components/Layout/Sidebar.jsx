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
  HiClipboardList,
  HiCollection,
  HiCash,
  HiShoppingCart,
  HiDatabase,
  HiLightningBolt,
  HiUserCircle
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
    { path: '/reviews', icon: <HiCheckCircle />, label: 'Reviews' },
    { path: '/ads', icon: <HiPhotograph />, label: 'Ads Management' },
    { path: '/acceptance-logs', icon: <HiClipboardList />, label: 'Acceptance Logs' },
    { path: '/settings', icon: <HiCog />, label: 'Settings' },
    { path: '/db/health', icon: <HiDatabase />, label: 'DB Health' },
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
      bg-white border-r border-slate-200/60
      h-screen fixed top-0 z-40
      transition-all duration-300 ease-in-out
      ${isMobile ? 'right-0 w-72' : isCollapsed ? 'left-0 w-20' : 'left-0 w-64'}
      flex flex-col shadow-[0_0_20px_rgba(0,0,0,0.02)]
    `}>
      {/* Sidebar Header with Logo */}
      <div className="h-20 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-sm border border-slate-100 flex-shrink-0 p-1">
            <img
              src={logoUrl}
              alt="Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          {shouldShowLabels && (
            <div className="overflow-hidden whitespace-nowrap">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">Theka</span>
              <span className="text-xl font-medium text-slate-400">Online</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleItemClick}
              className={`
                group flex items-center px-4 py-3.5 rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
              title={!shouldShowLabels ? item.label : ''}
            >
              <span className={`
                text-2xl flex-shrink-0 transition-transform duration-200
                ${isActive ? 'scale-110' : 'group-hover:scale-110'}
              `}>
                {item.icon}
              </span>
              {shouldShowLabels && (
                <span className="ml-4 font-bold text-[13px] tracking-wide">
                  {item.label}
                </span>
              )}
              {item.badge && shouldShowLabels && (
                <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              {isActive && shouldShowLabels && !item.badge && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200"></div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Logout Section */}
      <div className="p-4 border-t border-slate-100">
        {shouldShowLabels ? (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                <HiUserCircle className="h-7 w-7" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">Super Admin</p>
                <p className="text-[10px] text-indigo-500 uppercase tracking-widest font-black leading-none mt-1">PRO Access</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all duration-200 shadow-sm"
            >
              <HiLogout className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
              <HiUserCircle className="h-7 w-7" />
            </div>
            <button
              onClick={handleLogout}
              className="p-3 text-slate-400 hover:text-rose-500 hover:bg-slate-50 rounded-xl transition-all duration-200"
              title="Logout"
            >
              <HiLogout className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;