import React from 'react';
import type { BookingStatus } from '../../types';

interface BadgeProps {
  status?: BookingStatus | 'active' | 'inactive' | 'in_progress';
  text?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, text, size = 'md' }) => {
  const getStyles = () => {
    switch (status) {
      case 'completed':
        return 'bg-[#e8f7f0] text-[#144e3e] border border-[#a7f3d0]/60';
      case 'confirmed':
        return 'bg-[#e8f7f0] text-[#144e3e] border border-[#a7f3d0]/60';
      case 'in_progress':
        return 'bg-[#fef9c3] text-[#854d0e] border border-[#fde047]/60';
      case 'pending':
        return 'bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]/60';
      case 'cancelled':
        return 'bg-slate-100 text-slate-500 border border-slate-200';
      case 'active':
        return 'bg-[#e8f7f0] text-[#144e3e] border border-[#a7f3d0]/60';
      case 'inactive':
        return 'bg-slate-100 text-slate-500 border border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getLabel = () => {
    if (text) return text;
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
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

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium tracking-tight ${sizeClasses} ${getStyles()}`}
    >
      {getLabel()}
    </span>
  );
};
