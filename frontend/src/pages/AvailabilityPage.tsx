import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  Copy,
  Plus,
  Trash2,
  Smartphone,
} from 'lucide-react';
import { api } from '../services/api';
import type { AvailabilitySettings, DaySchedule, SpecialDate } from '../types';
import { Modal } from '../components/common/Modal';

export const AvailabilityPage: React.FC = () => {
  const [settings, setSettings] = useState<AvailabilitySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Preview state
  const [previewDayOfWeek, setPreviewDayOfWeek] = useState<number>(1); // Monday default

  // Special date modal state
  const [isSpecialModalOpen, setIsSpecialModalOpen] = useState(false);
  const [newSpecialDate, setNewSpecialDate] = useState({
    date: new Date().toISOString().split('T')[0],
    reason: '',
    is_closed: true,
  });

  const loadAvailability = async () => {
    try {
      const data = await api.getAvailability();
      setSettings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDayChange = (index: number, updates: Partial<DaySchedule>) => {
    if (!settings) return;
    const newSchedule = [...settings.weekly_schedule];
    newSchedule[index] = { ...newSchedule[index], ...updates };
    setSettings({ ...settings, weekly_schedule: newSchedule });
  };

  const handleCopyMondayToWeekdays = () => {
    if (!settings) return;
    const monday = settings.weekly_schedule.find((d) => d.day_of_week === 1);
    if (!monday) return;

    const newSchedule = settings.weekly_schedule.map((day) => {
      if (day.day_of_week >= 1 && day.day_of_week <= 5) {
        return {
          ...day,
          is_open: monday.is_open,
          open_time: monday.open_time,
          close_time: monday.close_time,
          break_start: monday.break_start,
          break_end: monday.break_end,
        };
      }
      return day;
    });

    setSettings({ ...settings, weekly_schedule: newSchedule });
    showToast('Applied Monday schedule to Tuesday through Friday!');
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await api.updateAvailability(settings);
      showToast('Weekly schedule & slot settings saved successfully!');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSpecialDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !newSpecialDate.reason.trim()) return;

    const entry: SpecialDate = {
      id: `sp_${Date.now()}`,
      date: newSpecialDate.date,
      reason: newSpecialDate.reason,
      is_closed: newSpecialDate.is_closed,
    };

    setSettings({
      ...settings,
      special_dates: [...settings.special_dates, entry],
    });

    setIsSpecialModalOpen(false);
    setNewSpecialDate({
      date: new Date().toISOString().split('T')[0],
      reason: '',
      is_closed: true,
    });
    showToast(`Added holiday exception for ${entry.date}`);
  };

  const handleDeleteSpecialDate = (id: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      special_dates: settings.special_dates.filter((d) => d.id !== id),
    });
  };

  // Generate preview slots for selected day
  const generatePreviewSlots = () => {
    if (!settings) return [];
    const day = settings.weekly_schedule.find((d) => d.day_of_week === previewDayOfWeek);
    if (!day || !day.is_open) return [];

    const slots: { time: string; isBreak: boolean }[] = [];
    const [startH, startM] = day.open_time.split(':').map(Number);
    const [endH, endM] = day.close_time.split(':').map(Number);

    const breakStart = day.break_start ? day.break_start.split(':').map(Number) : null;
    const breakEnd = day.break_end ? day.break_end.split(':').map(Number) : null;

    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const interval = settings.slot_duration_minutes || 30;

    while (currentMinutes + interval <= endMinutes) {
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

      let isBreak = false;
      if (breakStart && breakEnd) {
        const breakStartMin = breakStart[0] * 60 + breakStart[1];
        const breakEndMin = breakEnd[0] * 60 + breakEnd[1];
        if (currentMinutes >= breakStartMin && currentMinutes < breakEndMin) {
          isBreak = true;
        }
      }

      slots.push({ time: timeStr, isBreak });
      currentMinutes += interval;
    }

    return slots;
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#144e3e] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading availability...</p>
        </div>
      </div>
    );
  }

  const previewSlots = generatePreviewSlots();

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl shadow-xs animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Availability & Working Hours
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Define recurring hours of operation, midday break intervals, and appointment slot increments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMondayToWeekdays}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-xs transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Mon to Weekdays</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#144e3e] hover:bg-[#0f3c30] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Weekly Schedule + Slot Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Weekly Schedule List */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Operating Days & Working Hours
              </span>
              <span className="text-xs text-slate-400">24h format</span>
            </div>

            <div className="divide-y divide-slate-100">
              {settings.weekly_schedule.map((day, idx) => (
                <div
                  key={day.day_name}
                  className={`p-5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    day.is_open ? 'hover:bg-slate-50/70' : 'bg-slate-50/30 opacity-70'
                  }`}
                >
                  {/* Day Toggle */}
                  <div className="flex items-center gap-3 w-36">
                    <input
                      type="checkbox"
                      id={`day_${day.day_of_week}`}
                      checked={day.is_open}
                      onChange={(e) => handleDayChange(idx, { is_open: e.target.checked })}
                      className="w-4 h-4 rounded text-[#144e3e] focus:ring-[#144e3e]"
                    />
                    <label
                      htmlFor={`day_${day.day_of_week}`}
                      className={`text-sm font-bold cursor-pointer ${
                        day.is_open ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {day.day_name}
                    </label>
                  </div>

                  {/* Hours inputs */}
                  {day.is_open ? (
                    <div className="flex flex-wrap items-center gap-3 text-xs flex-1">
                      <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
                        <span className="text-slate-400 font-semibold">Open:</span>
                        <input
                          type="time"
                          value={day.open_time}
                          onChange={(e) => handleDayChange(idx, { open_time: e.target.value })}
                          className="bg-transparent font-bold text-slate-900 focus:outline-none"
                        />
                        <span className="text-slate-300">-</span>
                        <input
                          type="time"
                          value={day.close_time}
                          onChange={(e) => handleDayChange(idx, { close_time: e.target.value })}
                          className="bg-transparent font-bold text-slate-900 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 bg-amber-50/60 px-3 py-1.5 rounded-2xl border border-amber-200/60">
                        <span className="text-amber-800 font-bold">Break:</span>
                        <input
                          type="time"
                          value={day.break_start || ''}
                          onChange={(e) => handleDayChange(idx, { break_start: e.target.value })}
                          className="bg-transparent font-bold text-amber-900 focus:outline-none"
                        />
                        <span className="text-amber-300">-</span>
                        <input
                          type="time"
                          value={day.break_end || ''}
                          onChange={(e) => handleDayChange(idx, { break_end: e.target.value })}
                          className="bg-transparent font-bold text-amber-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 text-xs font-bold text-rose-500 py-1">
                      Closed all day
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Special date exceptions */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Holidays & Custom Date Exceptions
                </h3>
                <p className="text-xs text-slate-400">
                  Override working hours on specific calendar dates
                </p>
              </div>

              <button
                onClick={() => setIsSpecialModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-emerald-50 text-[#144e3e] hover:bg-emerald-100 text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Date Exception</span>
              </button>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {settings.special_dates.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">No holiday exceptions added yet.</p>
              ) : (
                settings.special_dates.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{item.date}</span>
                      <span className="text-slate-400 ml-2">({item.reason})</span>
                      {item.is_closed ? (
                        <span className="ml-2 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold">
                          Closed
                        </span>
                      ) : (
                        <span className="ml-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                          Custom Hours ({item.open_time} - {item.close_time})
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteSpecialDate(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-xl"
                      title="Remove date"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Slot Config & Live Customer App Simulator */}
        <div className="lg:col-span-4 space-y-5">
          {/* Slot Config */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Appointment Slot Config</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Base Slot Duration
              </label>
              <select
                value={settings.slot_duration_minutes}
                onChange={(e) =>
                  setSettings({ ...settings, slot_duration_minutes: parseInt(e.target.value) || 30 })
                }
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes (Standard)</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Turnover Buffer Between Bookings
              </label>
              <select
                value={settings.buffer_time_minutes}
                onChange={(e) =>
                  setSettings({ ...settings, buffer_time_minutes: parseInt(e.target.value) || 0 })
                }
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20"
              >
                <option value={0}>No buffer (0 min)</option>
                <option value={5}>5 minutes sanitation buffer</option>
                <option value={10}>10 minutes turnover buffer</option>
                <option value={15}>15 minutes buffer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Advance Booking Window
              </label>
              <select
                value={settings.advance_booking_days}
                onChange={(e) =>
                  setSettings({ ...settings, advance_booking_days: parseInt(e.target.value) || 30 })
                }
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20"
              >
                <option value={7}>7 days in advance</option>
                <option value={14}>14 days in advance</option>
                <option value={30}>30 days in advance (Standard)</option>
                <option value={60}>60 days in advance</option>
              </select>
            </div>
          </div>

          {/* Interactive Customer Slot Simulator */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#144e3e] font-bold text-xs">
                <Smartphone className="w-4 h-4" />
                <span>Flutter App Time Slots</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Simulator</span>
            </div>

            <p className="text-xs text-slate-400">
              Select a day below to verify the exact booking buttons generated in the mobile customer app:
            </p>

            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {settings.weekly_schedule.map((d) => (
                <button
                  key={d.day_name}
                  onClick={() => setPreviewDayOfWeek(d.day_of_week)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-bold shrink-0 transition-colors ${
                    previewDayOfWeek === d.day_of_week
                      ? 'bg-[#144e3e] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d.day_name.slice(0, 3)}
                </button>
              ))}
            </div>

            <div className="pt-2">
              {previewSlots.length === 0 ? (
                <div className="p-5 text-center text-rose-500 bg-rose-50 rounded-2xl text-xs font-semibold">
                  Business is closed on this day.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1">
                  {previewSlots.map((slot, i) => (
                    <div
                      key={i}
                      className={`text-center py-2 px-1 text-xs rounded-2xl font-bold border ${
                        slot.isBreak
                          ? 'bg-amber-50 text-amber-700 border-amber-200 line-through opacity-60'
                          : 'bg-emerald-50/70 text-[#144e3e] border-emerald-200/60 hover:bg-[#144e3e] hover:text-white cursor-pointer transition-colors shadow-xs'
                      }`}
                      title={slot.isBreak ? 'Break time' : 'Available bookable slot'}
                    >
                      {slot.time}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add Special Date */}
      {isSpecialModalOpen && (
        <Modal
          isOpen={isSpecialModalOpen}
          onClose={() => setIsSpecialModalOpen(false)}
          title="Add Holiday or Exception"
          subtitle="Set custom status for a specific calendar date"
          maxWidth="sm"
        >
          <form onSubmit={handleAddSpecialDate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={newSpecialDate.date}
                onChange={(e) => setNewSpecialDate({ ...newSpecialDate, date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason / Holiday Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Labor Day, Staff Training..."
                value={newSpecialDate.reason}
                onChange={(e) => setNewSpecialDate({ ...newSpecialDate, reason: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is_closed_toggle"
                checked={newSpecialDate.is_closed}
                onChange={(e) =>
                  setNewSpecialDate({ ...newSpecialDate, is_closed: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#144e3e] focus:ring-[#144e3e]"
              />
              <label htmlFor="is_closed_toggle" className="text-xs font-semibold text-slate-700">
                Mark as Closed all day
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSpecialModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-2xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 text-xs font-bold bg-[#144e3e] hover:bg-[#0f3c30] text-white rounded-2xl shadow-xs"
              >
                Add Exception
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
