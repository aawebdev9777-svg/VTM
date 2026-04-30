import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Home, BarChart2, Trophy, User, Wallet, TrendingUp, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV = [
  { name: 'Home',        href: '/Home',        icon: Home },
  { name: 'Portfolio',   href: '/Portfolio',   icon: BarChart2 },
  { name: 'Leaderboard', href: '/Leaderboard', icon: Trophy },
  { name: 'Profile',     href: '/Profile',     icon: User },
  { name: 'Wallet',      href: '/Wallet',      icon: Wallet },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  const handleLogout = async () => {
    await base44.auth.logout();
    base44.auth.redirectToLogin();
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* Top Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d1220]/90 backdrop-blur border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/Home" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-black" />
            </div>
            <span className="font-black text-lg tracking-tight">V<span className="text-amber-500">Stock</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(item => {
              const active = currentPageName === item.name;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    active ? 'bg-amber-500/15 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <button onClick={handleLogout} className="hidden md:flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="pt-14 pb-20 md:pb-6 min-h-screen">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d1220]/95 backdrop-blur border-t border-white/5">
        <div className="flex items-center justify-around py-2">
          {NAV.map(item => {
            const Icon = item.icon;
            const active = currentPageName === item.name;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                  active ? 'text-amber-400' : 'text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}