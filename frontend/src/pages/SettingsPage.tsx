import React, { useState } from 'react';
import {
  Building2,
  Save,
  CheckCircle2,
  Database,
  Radio,
  RefreshCw,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  isMockMode,
  setMockMode,
  getApiUrl,
  setApiUrl,
  api,
} from '../services/api';

export const SettingsPage: React.FC = () => {
  const { business, updateBusinessProfile } = useAuth();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [formData, setFormData] = useState({
    name: business?.name || '',
    category: business?.category || '',
    phone: business?.phone || '',
    email: business?.email || '',
    address: business?.address || '',
    city: business?.city || '',
    state: business?.state || '',
    postal_code: business?.postal_code || '',
    description: business?.description || '',
  });

  const [useMock, setUseMockState] = useState(isMockMode());
  const [backendUrl, setBackendUrlState] = useState(getApiUrl());
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [pinging, setPinging] = useState(false);

  const [emailNewBooking, setEmailNewBooking] = useState(true);
  const [pushCancellation, setPushCancellation] = useState(true);
  const [dailyBriefing, setDailyBriefing] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateBusinessProfile(formData);
      showToast('Business details updated successfully!');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleToggleMockMode = (mock: boolean) => {
    setUseMockState(mock);
    setMockMode(mock);
    showToast(`Switched to ${mock ? 'Mock Demo Mode' : 'Live Django REST API'} mode.`);
  };

  const handleSaveBackendUrl = () => {
    setApiUrl(backendUrl);
    showToast('Backend API Base URL updated.');
  };

  const handlePingBackend = async () => {
    setPinging(true);
    setPingStatus(null);
    try {
      const res = await fetch(`${backendUrl.replace(/\/$/, '')}/health/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setPingStatus('success');
      } else {
        setPingStatus(`error: HTTP ${res.status}`);
      }
    } catch {
      setPingStatus('offline');
    } finally {
      setPinging(false);
    }
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to restore initial demo data?')) {
      api.resetMockData();
      showToast('Demo data reset to default seed state!');
      window.location.reload();
    }
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

      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Settings & Backend Config
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage business profile, notifications, and switch between Mock and Django REST API.
        </p>
      </div>

      {/* Grid: Profile Form + System Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Business Profile Form */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="p-2 rounded-2xl bg-emerald-50 text-[#144e3e]">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Business Profile</h3>
                <p className="text-xs text-slate-400">
                  Visible to customers in the Flutter mobile application
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Industry Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Public Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business Bio / Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#144e3e] hover:bg-[#0f3c30] text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Notification Hooks Configuration */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-2xl bg-emerald-50 text-[#144e3e]">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Notification Hooks</h3>
                <p className="text-xs text-slate-400">
                  Django email & push notification event triggers
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">Instant Email on New Booking</p>
                  <p className="text-[11px] text-slate-400">Receive an email whenever a customer submits an appointment</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNewBooking}
                  onChange={(e) => setEmailNewBooking(e.target.checked)}
                  className="w-4 h-4 rounded text-[#144e3e] focus:ring-[#144e3e]"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">Push Alert on Cancellation</p>
                  <p className="text-[11px] text-slate-400">Notify immediately when an appointment is modified</p>
                </div>
                <input
                  type="checkbox"
                  checked={pushCancellation}
                  onChange={(e) => setPushCancellation(e.target.checked)}
                  className="w-4 h-4 rounded text-[#144e3e] focus:ring-[#144e3e]"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">Daily Morning Agenda Briefing</p>
                  <p className="text-[11px] text-slate-400">Get a summary at 08:00 AM of today's booked schedule</p>
                </div>
                <input
                  type="checkbox"
                  checked={dailyBriefing}
                  onChange={(e) => setDailyBriefing(e.target.checked)}
                  className="w-4 h-4 rounded text-[#144e3e] focus:ring-[#144e3e]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Backend API & Developer Switch */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-2xl bg-emerald-50 text-[#144e3e]">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Backend Connection</h3>
                <p className="text-xs text-slate-400">Configure data source & API endpoint</p>
              </div>
            </div>

            {/* Mode Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Active Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleMockMode(true)}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                    useMock
                      ? 'border-[#144e3e] bg-emerald-50/60 text-[#144e3e] ring-2 ring-[#144e3e]/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block font-bold">Mock Demo</span>
                  <span className="text-[10px] font-normal text-slate-400">
                    Local state
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleMockMode(false)}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                    !useMock
                      ? 'border-[#144e3e] bg-emerald-50/60 text-[#144e3e] ring-2 ring-[#144e3e]/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block font-bold">Django API</span>
                  <span className="text-[10px] font-normal text-slate-400">
                    Live endpoint
                  </span>
                </button>
              </div>
            </div>

            {/* Base API URL */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 block">
                API Base URL (Django)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={backendUrl}
                  onChange={(e) => setBackendUrlState(e.target.value)}
                  placeholder="http://127.0.0.1:8000/api"
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20"
                />
                <button
                  onClick={handleSaveBackendUrl}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-colors"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Ping Health Test */}
            <div className="pt-2">
              <button
                onClick={handlePingBackend}
                disabled={pinging}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors"
              >
                <Radio className={`w-3.5 h-3.5 ${pinging ? 'animate-pulse text-[#144e3e]' : ''}`} />
                <span>{pinging ? 'Checking connection...' : 'Test Backend Health Ping'}</span>
              </button>

              {pingStatus && (
                <div
                  className={`mt-2 p-2.5 rounded-2xl text-xs font-medium text-center ${
                    pingStatus === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {pingStatus === 'success'
                    ? 'Backend is online and responding (200 OK)!'
                    : `Backend unreachable at ${backendUrl} (run Django backend next)`}
                </div>
              )}
            </div>

            {/* Reset Demo Data */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleResetData}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-rose-600 hover:bg-rose-50 rounded-2xl text-xs font-semibold border border-rose-200 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo Seed Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
