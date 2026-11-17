import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Scissors,
  Clock,
  BarChart3,
  Settings,
  LogOut,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  pendingCount?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ pendingCount = 0, isOpen, onClose }) => {
  const { user, business, logout } = useAuth();

  const menuNav = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Bookings', href: '/bookings', icon: CalendarCheck, badge: pendingCount > 0 ? pendingCount : undefined },
    { name: 'Services', href: '/services', icon: Scissors },
    { name: 'Availability', href: '/availability', icon: Clock },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const generalNav = [
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-slate-200/80 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-[#144e3e] flex items-center justify-center text-white shadow-xs">
            {/* Custom rounded brand emblem inspired by Donezo */}
            <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-300" />
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-slate-900 text-lg tracking-tight truncate">
              {business?.name ? business.name.split(' ')[0] : 'Donezo'}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Service Platform
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {/* MENU Group */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Menu
            </div>
            {menuNav.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-[#144e3e] text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-emerald-300' : 'text-slate-500'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                          isActive
                            ? 'bg-emerald-400 text-[#0f3c30]'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* GENERAL Group */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              General
            </div>
            {generalNav.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-[#144e3e] text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-emerald-300' : 'text-slate-500'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                )}
              </NavLink>
            ))}

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:text-rose-600 hover:bg-rose-50/60 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Logout</span>
            </button>
          </div>

          {/* Download Mobile App Promotional Card (Exact Donezo Image 1 style) */}
          <div className="pt-2">
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#134437] to-[#09221b] text-white relative overflow-hidden shadow-xs border border-[#1b5545]">
              {/* Background circular decoration */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full border border-emerald-500/20 pointer-events-none" />
              <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full border border-emerald-500/10 pointer-events-none" />

              <div className="relative z-10 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-900/60 border border-emerald-600/40 flex items-center justify-center text-emerald-300">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-tight">
                    Download our Mobile App
                  </h4>
                  <p className="text-[11px] text-emerald-200/80 mt-0.5 leading-snug">
                    Flutter app for customer booking & real-time updates.
                  </p>
                </div>
                <div className="pt-1">
                  <span className="inline-flex items-center justify-center w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs">
                    Android App MVP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                }
                alt={user?.first_name || 'Owner'}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 shrink-0"
              />
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user ? `${user.first_name} ${user.last_name}` : 'Marcus Sterling'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
