import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { api } from '../../services/api';

export const DashboardLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const location = useLocation();

  const refreshPendingCount = async () => {
    try {
      const bookings = await api.getBookings();
      const pending = bookings.filter((b) => b.status === 'pending');
      setPendingCount(pending.length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshPendingCount();
    const interval = setInterval(refreshPendingCount, 15000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex font-sans antialiased">
      {/* Sidebar */}
      <Sidebar
        pendingCount={pendingCount}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ onBookingsUpdated: refreshPendingCount }} />
        </main>
      </div>
    </div>
  );
};
