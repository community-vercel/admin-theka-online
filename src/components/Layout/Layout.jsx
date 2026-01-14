// src/components/Layout/Layout.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Fixed Sidebar */}
        <div className="fixed left-0 top-0 h-screen z-40">
          <Sidebar />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 ml-64">
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 p-6 overflow-y-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;