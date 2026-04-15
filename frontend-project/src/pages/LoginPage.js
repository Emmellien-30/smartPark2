import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, User, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getError } from '../utils/helpers';

export default function LoginPage() {
  const { login }   = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]       = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) { toast.error('Enter username and password'); return; }
    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success('Welcome to CRPMS!');
      navigate('/dashboard');
    } catch (err) { toast.error(getError(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header band */}
          <div className="bg-gradient-to-r from-primary-700 to-primary-800 px-8 py-7 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Wrench size={28} className="text-primary-700" />
            </div>
            <h1 className="text-2xl font-bold text-white">SmartPark CRPMS</h1>
            <p className="text-primary-200 text-sm mt-1">Car Repair Payment Management System</p>
            <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-white text-xs font-medium">
              Rubavu District, Western Province — Rwanda
            </span>
          </div>

          <div className="px-8 py-7">
            <h2 className="text-lg font-bold text-gray-800 mb-5 text-center">Sign in to your account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-field">Username</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="username" value={form.username}
                    onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                    placeholder="Enter username" className="input-field pl-9" autoComplete="username" disabled={loading} />
                </div>
              </div>
              <div>
                <label className="label-field">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="password" type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Enter password" className="input-field pl-9 pr-10"
                    autoComplete="current-password" disabled={loading} />
                  <button type="button" onClick={() => setShowPwd(p => !p)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 text-base mt-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="mt-5 p-3 bg-primary-50 rounded-xl border border-primary-100 text-center">
              <p className="text-xs text-primary-600 font-medium">
                Default: <strong>admin</strong> / <strong>admin123</strong>
              </p>
            </div>
          </div>
        </div>
        <p className="text-center text-primary-200 text-xs mt-4">© 2025 SmartPark CRPMS — Rwanda</p>
      </div>
    </div>
  );
}
