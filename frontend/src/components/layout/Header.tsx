import React from 'react';
import { Menu, Search, Bell, Mail, Database, ShieldCheck, Command } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { isMock, user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#f4f5f7]/90 backdrop-blur-md transition-all">
      {/* Left: Mobile Toggle & Quick Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 text-slate-600 rounded-xl hover:bg-white lg:hidden border border-slate-200"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search booking, service, or customer..."
            className="w-full pl-10 pr-12 py-2 rounded-2xl bg-white border border-slate-200/80 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20 focus:border-[#144e3e] shadow-xs"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-500">
            <Command className="w-2.5 h-2.5" />
            <span>F</span>
          </div>
        </div>
      </div>

      {/* Right: Actions, Mode, and User Profile */}
      <div className="flex items-center gap-3">
        {/* Backend mode switcher pill */}
        <Link
          to="/settings"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors shadow-xs ${
            isMock
              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          }`}
          title="Click to toggle or configure backend API"
        >
          {isMock ? (
            <>
              <Database className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Mock Mode</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Django API</span>
            </>
          )}
        </Link>

        {/* Circular Action Icons */}
        <button
          className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-xs transition-colors"
          title="Inbox"
        >
          <Mail className="w-4 h-4" />
        </button>

        <button
          className="relative w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-xs transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        </button>

        {/* User Pill (Donezo / Nexus style) */}
        <div className="hidden sm:flex items-center gap-2.5 pl-2 py-1 pr-3 bg-white rounded-full border border-slate-200/80 shadow-xs">
          <img
            src={
              user?.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
            }
            alt={user?.first_name || 'User'}
            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
          />
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              {user ? `${user.first_name} ${user.last_name}` : 'Marcus Sterling'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium leading-none">
              {user?.email || 'owner@shop.com'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
