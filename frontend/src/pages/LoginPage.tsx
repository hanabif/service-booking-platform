import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, quickDemoLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('marcus@apexgrooming.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    try {
      await quickDemoLogin();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#144e3e] flex items-center justify-center text-white shadow-xs">
            <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">ServiceHub</h1>
            <p className="text-xs text-slate-400 font-semibold">Business Owner Portal</p>
          </div>
        </div>

        <h2 className="mt-6 text-center text-xl font-extrabold text-slate-900">
          Sign in to your dashboard
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Manage services, calendar availability, and customer appointments
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xs rounded-3xl sm:px-10 border border-slate-200/80">
          {/* Quick 1-Click Demo Button */}
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center gap-2 text-xs font-bold text-[#144e3e] mb-1">
              <Zap className="w-4 h-4 text-[#144e3e] fill-current" />
              <span>Instant Reviewer Access</span>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Click below to explore the full dashboard pre-seeded with appointments, services, and analytics.
            </p>
            <button
              onClick={handleDemoLogin}
              disabled={isLoading}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#144e3e] hover:bg-[#0f3c30] text-white rounded-2xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign in with Demo Account (Marcus Sterling)</span>
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-bold tracking-wider">
                Or with credentials
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-2xl border border-rose-200 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20 focus:border-[#144e3e]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20 focus:border-[#144e3e]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In as Owner'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Want to register a new business?{' '}
              <Link to="/register" className="font-bold text-[#144e3e] hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
