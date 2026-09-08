import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { OfflineBanner } from './OfflineBanner';

export const DashboardLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-30">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-fade-in"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl animate-fade-in-down">
            <Sidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
        <OfflineBanner />
        <main
          key={location.pathname}
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto page-enter"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
