import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  CalendarCheck,
  Star,
  Award,
  CornerDownRight,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import type { AnalyticsSummary, Review } from '../types';
import { StatCard } from '../components/common/StatCard';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [stats, revs] = await Promise.all([api.getAnalytics(), api.getReviews()]);
      setAnalytics(stats);
      setReviews(revs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendReply = async (reviewId: string) => {
    const reply = replyTextMap[reviewId];
    if (!reply || !reply.trim()) return;

    await api.replyToReview(reviewId, reply);
    setToastMessage('Reply published to customer!');
    setTimeout(() => setToastMessage(null), 4000);
    setReplyTextMap({ ...replyTextMap, [reviewId]: '' });
    await loadData();
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading business analytics...</p>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...analytics.daily_revenue.map((d) => d.amount), 1);
  const totalBookingsCount = analytics.status_distribution.reduce((acc, s) => acc + s.count, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl shadow-xs animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Gross Revenue"
          value={`$${analytics.total_revenue.toLocaleString()}`}
          change={analytics.revenue_change_percent}
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Total Bookings Made"
          value={analytics.total_bookings}
          change={analytics.bookings_change_percent}
          icon={CalendarCheck}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Completion Rate"
          value={`${analytics.completion_rate}%`}
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          period="last 30 days"
        />
        <StatCard
          title="Average Rating"
          value={`${analytics.average_rating} / 5.0`}
          icon={Star}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
          period="from verified visits"
        />
      </div>

      {/* Charts Grid: 7-Day Revenue Trend + Booking Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Revenue Bar Visualizer */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-900">7-Day Revenue Trend</h3>
                <p className="text-xs text-slate-500">
                  Gross revenue and appointment volume for the past week
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                +18.5% this week
              </span>
            </div>

            {/* Custom SVG / CSS Bar Chart */}
            <div className="mt-8 flex items-end justify-between gap-2 sm:gap-6 h-52 px-2">
              {analytics.daily_revenue.map((item, idx) => {
                const heightPercent = Math.max(15, Math.round((item.amount / maxRevenue) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[11px] font-semibold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      ${item.amount}
                    </span>

                    <div className="w-full max-w-[48px] bg-slate-100 rounded-xl h-40 flex items-end p-1 overflow-hidden">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-lg group-hover:from-indigo-500 group-hover:to-violet-400 transition-all shadow-xs"
                      />
                    </div>

                    <div className="text-center">
                      <span className="text-xs font-semibold text-slate-800 block">
                        {item.day_label}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{item.bookings} bks</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Peak day: Friday ($890.00 / 19 appointments)</span>
            <span>Average revenue/day: $515.00</span>
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Status Distribution</h3>
            <p className="text-xs text-slate-500">Breakdown of appointments across lifecycle</p>
          </div>

          <div className="space-y-4 pt-2">
            {analytics.status_distribution.map((item) => {
              const pct = Math.round((item.count / totalBookingsCount) * 100);
              const colorClass = {
                confirmed: 'bg-emerald-500',
                completed: 'bg-blue-500',
                pending: 'bg-amber-500',
                cancelled: 'bg-rose-500',
              }[item.status];

              return (
                <div key={item.status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 capitalize">
                      {item.status} ({item.count})
                    </span>
                    <span className="font-medium text-slate-500">{pct}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${pct}%` }} className={`h-full ${colorClass} rounded-full`} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2">
            <Award className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              Low cancellation rate (&lt;4%) indicates high customer retention and reliable scheduling.
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top Services Leaderboard & Customer Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Top Performing Services</h3>
              <p className="text-xs text-slate-500">Ranked by total bookings and revenue generated</p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {analytics.top_services.map((srv, index) => (
              <div key={srv.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                    #{index + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{srv.name}</h4>
                    <span className="text-xs text-slate-400">{srv.bookings_count} bookings</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900">
                    ${srv.revenue.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-emerald-600 block font-medium">
                    ${(srv.revenue / srv.bookings_count).toFixed(0)} avg/client
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Reviews & Feedback */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Customer Reviews</h3>
              <p className="text-xs text-slate-500">Feedback from confirmed mobile app appointments</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span>4.9 / 5</span>
            </div>
          </div>

          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{rev.customer_name}</span>
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(rev.rating) ? 'fill-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-slate-400">{new Date(rev.created_at).toLocaleDateString()}</span>
                </div>

                <p className="text-slate-700 leading-relaxed italic">"{rev.comment}"</p>

                {rev.reply ? (
                  <div className="mt-2 pl-3 border-l-2 border-indigo-400 bg-indigo-50/50 p-2 rounded-r-lg">
                    <span className="font-semibold text-indigo-900 block">Your Reply:</span>
                    <p className="text-indigo-800 mt-0.5">{rev.reply}</p>
                  </div>
                ) : (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-2">
                    <CornerDownRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Type a public owner response..."
                      value={replyTextMap[rev.id] || ''}
                      onChange={(e) =>
                        setReplyTextMap({ ...replyTextMap, [rev.id]: e.target.value })
                      }
                      className="flex-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleSendReply(rev.id)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1 transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      Reply
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
