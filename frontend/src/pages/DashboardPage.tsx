import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Calendar,
  Clock,
  DollarSign,
  Star,
  Check,
  X,
  AlertCircle,
  ArrowRight,
  Plus,
  Phone,
  Scissors,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import type { Booking, AnalyticsSummary } from '../types';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';

export const DashboardPage: React.FC = () => {
  const { onBookingsUpdated } = useOutletContext<{ onBookingsUpdated?: () => void }>() || {};
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [allBookings, stats] = await Promise.all([
        api.getBookings(),
        api.getAnalytics(),
      ]);
      setBookings(allBookings);
      setAnalytics(stats);
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
  const todayBookings = bookings
    .filter((b) => b.booking_date === todayStr)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading dashboard overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {actionSuccess && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{actionSuccess}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Appointments"
          value={todayBookings.length}
          icon={Calendar}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          badgeText={todayBookings.length > 0 ? 'Active' : undefined}
        />
        <StatCard
          title="Pending Approvals"
          value={pendingBookings.length}
          icon={AlertCircle}
          iconColor={pendingBookings.length > 0 ? 'text-amber-600' : 'text-slate-400'}
          iconBg={pendingBookings.length > 0 ? 'bg-amber-50' : 'bg-slate-100'}
          badgeText={pendingBookings.length > 0 ? 'Needs Action' : 'All Clear'}
        />
        <StatCard
          title="Total Gross Revenue"
          value={`$${(analytics?.total_revenue || 0).toLocaleString()}`}
          change={analytics?.revenue_change_percent}
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Customer Satisfaction"
          value={`${analytics?.average_rating || 5.0} / 5.0`}
          icon={Star}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
          period="from 128 reviews"
        />
      </div>

      {/* Main Grid: Pending Action Cards + Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Pending Approvals & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Required: Pending Bookings */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Pending Bookings ({pendingBookings.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Review and confirm or decline incoming customer requests
                  </p>
                </div>
              </div>

              <Link
                to="/bookings"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingBookings.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-800">You're all caught up!</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    No pending booking requests are awaiting your review.
                  </p>
                </div>
              ) : (
                pendingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">
                          {booking.customer_name}
                        </span>
                        <span className="text-xs text-slate-400">#{booking.booking_reference}</span>
                        <Badge status="pending" size="sm" />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-medium text-indigo-700">
                          <Scissors className="w-3.5 h-3.5" />
                          {booking.service?.name} (${booking.total_price})
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {booking.booking_date}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {booking.start_time} - {booking.end_time}
                        </span>
                      </div>

                      {booking.notes && (
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                          "{booking.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(booking.id, booking.booking_reference)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecline(booking.id, booking.booking_reference)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/services"
              className="group p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-3"
            >
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Add New Service</p>
                <p className="text-xs text-slate-500">Add haircut, package, price</p>
              </div>
            </Link>

            <Link
              to="/availability"
              className="group p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-3"
            >
              <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Set Hours & Slots</p>
                <p className="text-xs text-slate-500">Configure weekly schedule</p>
              </div>
            </Link>

            <Link
              to="/analytics"
              className="group p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-3"
            >
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">View Revenue Trends</p>
                <p className="text-xs text-slate-500">Weekly breakdown & reviews</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column (1 col): Today's Schedule Agenda */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Today's Schedule</h3>
                <p className="text-xs text-slate-500">Chronological appointment agenda</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {todayBookings.length} Slots
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {todayBookings.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-medium">No bookings scheduled for today.</p>
                </div>
              ) : (
                todayBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start gap-3"
                  >
                    <div className="text-center w-14 shrink-0 py-1 px-1 rounded-lg bg-indigo-50 border border-indigo-100">
                      <span className="text-xs font-bold text-indigo-700 block">
                        {b.start_time}
                      </span>
                      <span className="text-[10px] text-indigo-500 font-medium block">
                        {b.end_time}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {b.customer_name}
                        </p>
                        <Badge status={b.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                        {b.service?.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {b.customer_phone}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">${b.total_price}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Business Card Summary */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-md">
            <span className="text-xs font-semibold tracking-wider text-indigo-300 uppercase">
              Customer Experience
            </span>
            <p className="text-lg font-bold text-white mt-1">96.2% On-Time Completion</p>
            <p className="text-xs text-slate-300 mt-1">
              Your average appointment rating is 4.9 stars. Customers highlight prompt service and skilled barbers.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Next available slot:</span>
              <span className="font-semibold text-emerald-400">Today at 17:30</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
