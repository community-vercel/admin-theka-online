// src/components/Layout/Layout.jsx
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Check screen size and handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false); // Auto-close mobile sidebar on resize to desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar - Desktop (Fixed) */}
      {!isMobile && (
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      )}

      {/* Mobile Sidebar Overlay & Component */}
      {isMobile && isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 animate-in slide-in-from-right duration-300">
            <Sidebar isMobile={true} onItemClick={() => setIsSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className={`
        flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out w-full overflow-x-hidden
        ${!isMobile ? (isCollapsed ? 'ml-20' : 'ml-64') : 'ml-0'}
        ${isMobile ? 'pb-28' : ''}
      `}>
        {/* Navbar */}
        <Navbar
          onMenuClick={() => setIsSidebarOpen(true)}
          isMobile={isMobile}
        />

        {/* Page Content with Premium Breathability */}
        <main className="flex-1 p-4 sm:p-10 lg:p-12 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>

        {/* Global Footer - Professional SaaS Style */}
        <footer className="px-10 py-8 border-t border-slate-100 hidden sm:flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-6">
            <p>© 2026 THEKA ONLINE ADMIN</p>
            <div className="hidden md:flex items-center gap-2 text-emerald-500">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>Platform Live</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:text-indigo-500 cursor-pointer transition-colors duration-200">Release Notes v2.0</span>
            <span className="hover:text-indigo-500 cursor-pointer transition-colors duration-200">Support Center</span>
            <span className="hover:text-indigo-500 cursor-pointer transition-colors duration-200">API Status</span>
          </div>
        </footer>
      </div>

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <BottomNav onMoreClick={() => setIsSidebarOpen(true)} />
      )}
    </div>
  );
};

export default Layout;
