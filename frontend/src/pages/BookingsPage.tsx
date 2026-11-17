import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  Eye,
  Phone,
  Mail,
  User,
  Scissors,
  MessageSquare,
  Command,
} from 'lucide-react';
import { api } from '../services/api';
import type { Booking } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const BookingsPage: React.FC = () => {
  const { onBookingsUpdated } = useOutletContext<{ onBookingsUpdated?: () => void }>() || {};
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'upcoming'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [activeBookingDetails, setActiveBookingDetails] = useState<Booking | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  const loadBookings = async () => {
    try {
      const data = await api.getBookings();
      setBookings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApprove = async (id: string, ref: string) => {
    await api.updateBookingStatus(id, 'confirmed');
    showToast(`Booking ${ref} confirmed successfully!`);
    await loadBookings();
    if (onBookingsUpdated) onBookingsUpdated();
  };

  const handleComplete = async (id: string, ref: string) => {
    await api.updateBookingStatus(id, 'completed');
    showToast(`Booking ${ref} marked as completed!`);
    await loadBookings();
    if (onBookingsUpdated) onBookingsUpdated();
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    await api.updateBookingStatus(
      cancelModalBooking.id,
      'cancelled',
      cancellationReason || 'Cancelled by business owner'
    );
    showToast(`Booking ${cancelModalBooking.booking_reference} cancelled.`);
    setCancelModalBooking(null);
    setCancellationReason('');
    await loadBookings();
    if (onBookingsUpdated) onBookingsUpdated();
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const filteredBookings = bookings.filter((b) => {
    if (selectedStatus !== 'all' && b.status !== selectedStatus) return false;
    if (dateFilter === 'today' && b.booking_date !== todayStr) return false;
    if (dateFilter === 'tomorrow' && b.booking_date !== tomorrowStr) return false;
    if (dateFilter === 'upcoming' && b.booking_date < todayStr) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = b.customer_name.toLowerCase().includes(term);
      const matchRef = b.booking_reference.toLowerCase().includes(term);
      const matchService = b.service?.name.toLowerCase().includes(term);
      const matchEmail = b.customer_email.toLowerCase().includes(term);
      return matchName || matchRef || matchService || matchEmail;
    }

    return true;
  });

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl shadow-xs animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Bookings Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review, approve, and track client appointments and service schedules.
        </p>
      </div>

      {/* Filter Tabs & Search Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Bookings', count: statusCounts.all },
            { id: 'pending', label: 'Pending', count: statusCounts.pending },
            { id: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed },
            { id: 'completed', label: 'Completed', count: statusCounts.completed },
            { id: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedStatus === tab.id
                  ? 'bg-[#144e3e] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedStatus === tab.id
                    ? 'bg-emerald-400 text-[#0f3c30]'
                    : 'bg-white text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Date Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, ref (e.g. BK-8901), or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20 focus:border-[#144e3e] placeholder:text-slate-400"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-400">
              <Command className="w-2.5 h-2.5" />
              <span>F</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20 focus:border-[#144e3e] w-full sm:w-auto"
            >
              <option value="all">All Dates</option>
              <option value="today">Today ({todayStr})</option>
              <option value="tomorrow">Tomorrow ({tomorrowStr})</option>
              <option value="upcoming">Upcoming Dates</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-[#144e3e] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">No appointments match your filter</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your status tab, date range, or clear the search keyword.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Customer & Ref</th>
                  <th className="py-4 px-6">Service</th>
                  <th className="py-4 px-6">Date & Time</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Customer */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#144e3e] font-bold text-xs flex items-center justify-center shrink-0">
                          {b.customer_name[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {b.customer_name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            #{b.booking_reference} • {b.customer_phone}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-xl bg-emerald-50 text-[#144e3e]">
                          <Scissors className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-xs">{b.service?.name}</p>
                          <p className="text-[11px] text-slate-400">{b.service?.duration_minutes} min</p>
                        </div>
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">
                          {b.booking_date}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {b.start_time} - {b.end_time}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-6 font-bold text-slate-900 text-sm">
                      ${b.total_price.toFixed(2)}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <Badge status={b.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveBookingDetails(b)}
                          title="View Details"
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {b.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(b.id, b.booking_reference)}
                              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#144e3e] text-white hover:bg-[#0f3c30] transition-colors shadow-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setCancelModalBooking(b)}
                              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {b.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => handleComplete(b.id, b.booking_reference)}
                              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => setCancelModalBooking(b)}
                              className="px-3 py-1.5 text-xs font-medium rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Full Details */}
      {activeBookingDetails && (
        <Modal
          isOpen={!!activeBookingDetails}
          onClose={() => setActiveBookingDetails(null)}
          title={`Booking Details #${activeBookingDetails.booking_reference}`}
          subtitle={`Created on ${new Date(activeBookingDetails.created_at).toLocaleString()}`}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase">Status</span>
                <div className="mt-1">
                  <Badge status={activeBookingDetails.status} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Total Charge</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  ${activeBookingDetails.total_price.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Customer Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-100 bg-white">
                  <User className="w-4 h-4 text-[#144e3e]" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Name</span>
                    <span className="font-bold text-slate-900">
                      {activeBookingDetails.customer_name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-100 bg-white">
                  <Phone className="w-4 h-4 text-[#144e3e]" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Phone</span>
                    <span className="font-bold text-slate-900">
                      {activeBookingDetails.customer_phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-100 bg-white sm:col-span-2">
                  <Mail className="w-4 h-4 text-[#144e3e]" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">Email Address</span>
                    <span className="font-bold text-slate-900">
                      {activeBookingDetails.customer_email}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service & Time */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Appointment Spec
              </h4>
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-bold text-slate-900">
                    {activeBookingDetails.service?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration:</span>
                  <span className="font-bold text-slate-900">
                    {activeBookingDetails.service?.duration_minutes} minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-bold text-slate-900">
                    {activeBookingDetails.booking_date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time Slot:</span>
                  <span className="font-bold text-[#144e3e]">
                    {activeBookingDetails.start_time} - {activeBookingDetails.end_time}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Notes */}
            {activeBookingDetails.notes && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Client Notes
                </h4>
                <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{activeBookingDetails.notes}</span>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Modal: Cancellation Prompt */}
      {cancelModalBooking && (
        <Modal
          isOpen={!!cancelModalBooking}
          onClose={() => setCancelModalBooking(null)}
          title={`Cancel Booking #${cancelModalBooking.booking_reference}`}
          subtitle={`Customer: ${cancelModalBooking.customer_name}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel or decline this appointment? An automated email and push
              notification hook will be dispatched to the customer.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Cancellation (sent to customer)
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="e.g., Requested stylist unavailable, schedule adjustment..."
                rows={3}
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-2xl shadow-xs transition-colors"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
