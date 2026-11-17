import React from 'react';
import type { BookingStatus } from '../../types';

interface BadgeProps {
  status?: BookingStatus | 'active' | 'inactive';
  text?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, text, size = 'md' }) => {
  const getStyles = () => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/20';
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-emerald-500/20';
      case 'completed':
        return 'bg-blue-50 text-blue-800 border-blue-200 ring-blue-500/20';
      case 'cancelled':
        return 'bg-rose-50 text-rose-800 border-rose-200 ring-rose-500/20';
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'inactive':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getLabel = () => {
    if (text) return text;
    switch (status) {
      case 'pending':
        return 'Pending Approval';
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      default:
        return status;
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500 animate-pulse';
      case 'confirmed':
        return 'bg-emerald-500';
      case 'completed':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-rose-500';
      case 'active':
        return 'bg-emerald-500';
      case 'inactive':
        return 'bg-slate-400';
      default:
        return 'bg-slate-400';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${getStyles()}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
      <span>{getLabel()}</span>
    </span>
  );
};
