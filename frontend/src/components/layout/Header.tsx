import React from 'react';
import { Menu, Database, ShieldCheck, ExternalLink, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onOpenMobileMenu }) => {
  const { isMock, business } = useAuth();

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 text-slate-500 rounded-lg hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Date display */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/60">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formattedDate}</span>
        </div>

        {/* API / Mock status badge */}
        <Link
          to="/settings"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            isMock
              ? 'bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100'
          }`}
          title="Click to configure API settings"
        >
          {isMock ? (
            <>
              <Database className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Mode:</span>
              <span className="font-semibold">Mock Demo</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Mode:</span>
              <span className="font-semibold">Django API</span>
            </>
          )}
        </Link>

        {/* Business Slug preview badge */}
        <div className="hidden lg:flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50/70 border border-indigo-100 px-3 py-1.5 rounded-lg font-medium">
          <span className="text-slate-400">slug:</span>
          <span>/{business?.slug || 'my-shop'}</span>
          <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
        </div>
      </div>
    </header>
  );
};
