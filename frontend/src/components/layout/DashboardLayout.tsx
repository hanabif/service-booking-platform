import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { api } from '../../services/api';

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard Overview', subtitle: 'Real-time performance, appointments, and quick actions' },
  '/bookings': { title: 'Bookings Management', subtitle: 'View, filter, approve, and manage customer appointments' },
  '/services': { title: 'Services Catalog', subtitle: 'Configure offerings, pricing, durations, and visibility' },
  '/availability': { title: 'Working Hours & Slots', subtitle: 'Set weekly business hours, breaks, and holiday exceptions' },
  '/analytics': { title: 'Business Analytics', subtitle: 'Revenue metrics, booking distribution, and customer reviews' },
  '/settings': { title: 'Settings & API Config', subtitle: 'Business profile, notification preferences, and backend connections' },
};

export const DashboardLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const location = useLocation();

  const currentRouteMeta = routeTitles[location.pathname] || {
    title: 'Service Portal',
    subtitle: 'Manage your operations',
  };

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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        pendingCount={pendingCount}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title={currentRouteMeta.title}
          subtitle={currentRouteMeta.subtitle}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ onBookingsUpdated: refreshPendingCount }} />
        </main>
      </div>
    </div>
  );
};
