import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Car, Wrench, ClipboardList, CreditCard, BarChart3, LogOut, Menu, X, Gauge } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to:'/dashboard',       label:'Dashboard',       icon:Gauge },
  { to:'/cars',            label:'Cars',             icon:Car },
  { to:'/services',        label:'Services',         icon:Wrench },
  { to:'/service-records', label:'Service Records',  icon:ClipboardList },
  { to:'/payments',        label:'Payments',         icon:CreditCard },
  { to:'/reports',         label:'Reports',          icon:BarChart3 },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const Content = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-blue-700/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <Wrench size={18} className="text-primary-700" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">SmartPark</p>
            <p className="text-blue-200 text-[11px]">Car Repair System</p>
          </div>
        </div>
      </div>

      {/* User badge */}
      <div className="mx-3 mt-4 px-3 py-2.5 rounded-xl bg-white/10 border border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
            {user?.fullname?.[0] || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user?.fullname || 'Admin'}</p>
            <p className="text-blue-200 text-xs">Chief Mechanic</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-blue-300/70 text-[10px] font-bold uppercase tracking-widest px-3 pb-2">Menu</p>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={() => mobile && setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'bg-white text-primary-700 shadow-sm font-bold'
                         : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`
            }>
            <Icon size={17} className="flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-5 pt-2 border-t border-blue-700/40">
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-blue-200 hover:bg-red-500/80 hover:text-white transition-all">
          <LogOut size={17} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-60 bg-primary-800 min-h-screen sticky top-0 flex-shrink-0">
        <Content />
      </aside>
      <button onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 p-2.5 bg-primary-700 rounded-xl text-white shadow-lg">
        <Menu size={20} />
      </button>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative w-60 bg-primary-800 h-full shadow-2xl">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-blue-200 hover:text-white">
              <X size={20} />
            </button>
            <Content mobile />
          </aside>
        </div>
      )}
    </>
  );
}
