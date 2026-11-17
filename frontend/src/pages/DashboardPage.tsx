import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Plus,
  Play,
  Pause,
  Square,
  Check,
  X,
  CheckCircle2,
  Scissors,
} from 'lucide-react';
import { api } from '../services/api';
import type { Booking, AnalyticsSummary, Service } from '../types';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';

export const DashboardPage: React.FC = () => {
  const { onBookingsUpdated } = useOutletContext<{ onBookingsUpdated?: () => void }>() || {};
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Time tracker demo state
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(45 * 60 + 8); // 00:45:08

  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const loadData = async () => {
    try {
      const [allBookings, stats, allServices] = await Promise.all([
        api.getBookings(),
        api.getAnalytics(),
        api.getServices(),
      ]);
      setBookings(allBookings);
      setAnalytics(stats);
      setServices(allServices);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string, ref: string) => {
    await api.updateBookingStatus(id, 'confirmed');
    setActionSuccess(`Booking ${ref} confirmed successfully!`);
    setTimeout(() => setActionSuccess(null), 4000);
    await loadData();
    if (onBookingsUpdated) onBookingsUpdated();
  };

  const handleDecline = async (id: string, ref: string) => {
    await api.updateBookingStatus(id, 'cancelled', 'Declined by business owner');
    setActionSuccess(`Booking ${ref} declined.`);
    setTimeout(() => setActionSuccess(null), 4000);
    await loadData();
    if (onBookingsUpdated) onBookingsUpdated();
  };

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.booking_date === todayStr);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#144e3e] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading clean dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {actionSuccess && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl shadow-xs animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Top Header Section (Title + Subtitle + Buttons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Plan, prioritize, and accomplish your bookings with ease.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#144e3e] hover:bg-[#0f3c30] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </Link>
          <Link
            to="/bookings"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-xs transition-colors"
          >
            <span>View All Bookings</span>
          </Link>
        </div>
      </div>

      {/* 4 Top KPI Cards (Donezo Reference Image 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hero Forest Green Card */}
        <StatCard
          title="Total Bookings"
          value={analytics?.total_bookings || 84}
          subtitle="↗ Increased by 18.5% this month"
          isHero={true}
        />

        {/* Regular White Cards */}
        <StatCard
          title="Completed Bookings"
          value="28"
          subtitle="↗ 96.2% on-time completion"
        />

        <StatCard
          title="Today's Appointments"
          value={todayBookings.length || 6}
          subtitle="↗ 4 confirmed, 2 pending"
        />

        <StatCard
          title="Pending Approvals"
          value={pendingBookings.length}
          subtitle={pendingBookings.length > 0 ? "Requires owner attention" : "All clear"}
        />
      </div>

      {/* Middle Row Grid (Donezo Style: Project Analytics + Reminders + Services) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Widget 1: Booking Analytics Capsule Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Booking Analytics</h3>
              <p className="text-[11px] text-slate-400">Appointment traffic across 7 days</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              This Week
            </span>
          </div>

          {/* Capsule Pill Chart (Exact Donezo Style) */}
          <div className="my-6 flex items-end justify-between gap-3 h-44 px-2">
            {[
              { day: 'S', height: 'h-24', type: 'striped' },
              { day: 'M', height: 'h-28', type: 'mint' },
              { day: 'T', height: 'h-36', type: 'dark', pill: '74%' },
              { day: 'W', height: 'h-40', type: 'dark' },
              { day: 'T', height: 'h-32', type: 'striped' },
              { day: 'F', height: 'h-24', type: 'striped' },
              { day: 'S', height: 'h-28', type: 'striped' },
            ].map((col, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                {col.pill && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 shadow-xs">
                    {col.pill}
                  </span>
                )}
                <div
                  className={`w-full max-w-[38px] ${col.height} rounded-full transition-transform hover:scale-105 ${
                    col.type === 'dark'
                      ? 'bg-[#144e3e]'
                      : col.type === 'mint'
                      ? 'bg-[#a7f3d0]'
                      : 'pattern-stripes border border-slate-200'
                  }`}
                  title={`${col.day}: ${col.type === 'dark' ? 'Peak slots' : col.type === 'mint' ? 'Normal slots' : 'Open slots'}`}
                />
                <span className="text-xs font-semibold text-slate-400">{col.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#144e3e]" />
              <span className="font-medium text-slate-600">Peak Sessions</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a7f3d0]" />
              <span className="font-medium text-slate-600">Standard</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-slate-300 pattern-stripes" />
              <span className="font-medium text-slate-600">Available</span>
            </span>
          </div>
        </div>

        {/* Widget 2: Next Appointment Reminder (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Reminders
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-2 leading-snug">
              Session with David Vance (VIP Package)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Time: 11:00 am - 12:15 pm
            </p>
          </div>

          <div className="my-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#144e3e] text-white flex items-center justify-center shrink-0">
              <Scissors className="w-4 h-4 text-emerald-200" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-[#144e3e]">Royal Grooming Suite</p>
              <p className="text-[11px] text-emerald-700/80">Stylist Station #1 Ready</p>
            </div>
          </div>

          <button
            onClick={() => setActionSuccess('Session marked active in salon queue!')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#144e3e] hover:bg-[#0f3c30] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Session</span>
          </button>
        </div>

        {/* Widget 3: Popular Services List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Services Menu</h3>
            <Link
              to="/services"
              className="text-xs font-semibold text-[#144e3e] hover:underline flex items-center gap-1"
            >
              <span>+ New</span>
            </Link>
          </div>

          <div className="space-y-3.5 my-3">
            {services.slice(0, 4).map((s, i) => {
              const iconColors = [
                'text-indigo-600 bg-indigo-50',
                'text-emerald-600 bg-emerald-50',
                'text-amber-600 bg-amber-50',
                'text-violet-600 bg-violet-50',
              ][i % 4];

              return (
                <div key={s.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl ${iconColors}`}>
                      <Scissors className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-slate-900 truncate">{s.name}</p>
                      <p className="text-[11px] text-slate-400">{s.duration_minutes} min</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 text-sm shrink-0">
                    ${s.price.toFixed(0)}
                  </span>
                </div>
              );
            })}
          </div>

          <Link
            to="/services"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 text-center block pt-2 border-t border-slate-100"
          >
            Manage all {services.length} services →
          </Link>
        </div>
      </div>

      {/* Bottom Row Grid (Customer Requests Table + Capacity Gauge + Time Tracker) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Widget 4: Customer Requests & Approvals (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Customer Requests</h3>
              <p className="text-[11px] text-slate-400">Incoming bookings awaiting response</p>
            </div>
            <Link
              to="/bookings"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1 rounded-full border border-slate-200 hover:bg-slate-50"
            >
              See All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 my-2">
            {pendingBookings.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No pending requests. All bookings confirmed!
              </div>
            ) : (
              pendingBookings.slice(0, 3).map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#144e3e] font-bold text-xs flex items-center justify-center shrink-0">
                      {b.customer_name[0]}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {b.customer_name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {b.service?.name} • {b.start_time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge status="pending" size="sm" />
                    <button
                      onClick={() => handleApprove(b.id, b.booking_reference)}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                      title="Approve"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDecline(b.id, b.booking_reference)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                      title="Decline"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Automated customer SMS/push confirmation enabled</span>
          </div>
        </div>

        {/* Widget 5: Booking Progress Gauge (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Capacity & Completion</h3>
          </div>

          {/* Semi-circular radial gauge representation (Donezo style) */}
          <div className="my-4 flex flex-col items-center justify-center">
            <div className="relative w-36 h-20 overflow-hidden flex items-end justify-center">
              {/* Outer arch */}
              <div className="absolute top-0 w-36 h-36 rounded-full border-[14px] border-[#144e3e] border-b-transparent border-l-transparent transform -rotate-45" />
              {/* Center text */}
              <div className="text-center z-10 -mb-2">
                <span className="text-3xl font-extrabold text-slate-900">96%</span>
                <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                  Fulfilled
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#144e3e]" />
              <span>Completed</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-300" />
              <span>In Progress</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full pattern-stripes border border-slate-300" />
              <span>Pending</span>
            </span>
          </div>
        </div>

        {/* Widget 6: Time Tracker (4 cols) (Exact Donezo Image 1 style) */}
        <div className="lg:col-span-4 rounded-3xl p-6 bg-gradient-to-b from-[#134437] to-[#0a271f] text-white shadow-xs border border-[#1b5545] relative overflow-hidden flex flex-col justify-between">
          {/* Background subtle wavy curves */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#a7f3d0_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-200 tracking-wide">
              Active Session Timer
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-[10px] text-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>

          <div className="relative z-10 my-4 text-center">
            <span className="font-mono text-4xl sm:text-5xl font-extrabold tracking-wider text-white">
              {formatTimer(timerSeconds)}
            </span>
            <p className="text-[11px] text-emerald-200/80 mt-1">
              Client: David Vance • Royal VIP Treatment
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="w-10 h-10 rounded-full bg-white text-[#144e3e] flex items-center justify-center hover:bg-emerald-50 transition-colors shadow-xs"
              title={isTimerRunning ? 'Pause timer' : 'Resume timer'}
            >
              {isTimerRunning ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(0);
                setActionSuccess('Session finished and archived!');
              }}
              className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow-xs"
              title="End session"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
