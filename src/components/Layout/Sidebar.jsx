// src/components/Layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  HiHome,
  HiUsers,
  HiCheckCircle,
  HiCog,
  HiLogout,
  HiChevronRight,
  HiChevronLeft,
  HiPhotograph
} from 'react-icons/hi';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  // Update main content margin when sidebar collapses/expands
  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      if (isCollapsed) {
        mainContent.style.marginLeft = '5rem'; // 20 * 0.25rem = 5rem
      } else {
        mainContent.style.marginLeft = '16rem'; // 64 * 0.25rem = 16rem
      }
    }
  }, [isCollapsed]);

  const menuItems = [
    { path: '/dashboard', icon: <HiHome />, label: 'Dashboard' },
    { path: '/users', icon: <HiUsers />, label: 'Users' },
    { path: '/verification', icon: <HiCheckCircle />, label: 'Verification' },
    { path: '/ads', icon: <HiPhotograph />, label: 'Ads' },
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

  return (
    <aside className={`
      bg-gray-900 text-white 
      h-screen /* Full viewport height */
      fixed left-0 top-0 /* Fixed position */
      z-40 /* Above content but below modals */
      transition-all duration-300 
      ${isCollapsed ? 'w-20' : 'w-64'}
      flex flex-col
      shadow-xl /* Add shadow for depth */
    `}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-bold">T</span>
            </div>
            <h1 className="text-xl font-bold">Theka Online</h1>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <HiChevronRight className="h-5 w-5" /> : <HiChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center space-x-3 p-3 rounded-lg transition-colors
              ${isActive 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }
            `}
            title={isCollapsed ? item.label : ''}
          >
            <span className="text-xl">{item.icon}</span>
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-800">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="font-bold">A</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <p className="font-medium">Admin User</p>
              <p className="text-sm text-gray-400">Super Admin</p>
            </div>
          )} 
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Logout"
          >
            <HiLogout className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;