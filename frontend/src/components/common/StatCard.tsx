import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  isHero?: boolean;
  onClickArrow?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  isHero = false,
  onClickArrow,
}) => {
  if (isHero) {
    return (
      <div className="bg-[#144e3e] text-white rounded-3xl p-6 relative overflow-hidden shadow-xs flex flex-col justify-between h-44">
        {/* Subtle decorative ring */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full border border-white/10 pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-100 tracking-wide">{title}</span>
          <button
            onClick={onClickArrow}
            className="w-8 h-8 rounded-full border border-white/30 hover:border-white flex items-center justify-center text-white transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div>
          <div className="text-4xl font-extrabold tracking-tight text-white">{value}</div>
          {subtitle && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800/60 border border-emerald-600/40 text-[11px] font-medium text-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
              <span>{subtitle}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between h-44">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 tracking-wide">{title}</span>
        <button
          onClick={onClickArrow}
          className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-400 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <div>
        <div className="text-4xl font-extrabold tracking-tight text-slate-900">{value}</div>
        {subtitle && (
          <div className="mt-2 text-xs font-medium text-slate-400 flex items-center gap-1">
            <span>{subtitle}</span>
          </div>
        )}
      </div>
    </div>
  );
};
