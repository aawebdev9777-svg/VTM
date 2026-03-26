import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import StockTicker from './components/trading/StockTicker';
import AIWidget from './components/ai/AIWidget';
import { 
  Menu, 
  X, 
  Home, 
  TrendingUp, 
  LogOut,
  User,
  Wallet,
  Shield,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children, currentPageName }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await base44.auth.me();
        setIsAdmin(user?.email === 'aa.web.dev9777@gmail.com');
      } catch (error) {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  const navigation = [
      { name: 'Home', href: createPageUrl('Home'), icon: Home },
      { name: 'Portfolio', href: createPageUrl('Portfolio'), icon: TrendingUp },
      { name: 'Community', href: createPageUrl('Leaderboard'), icon: Trophy },
      { name: 'Profile', href: createPageUrl('Profile'), icon: User },
      { name: 'Wallet', href: createPageUrl('Wallet'), icon: Wallet },
      ...(isAdmin ? [
        { name: 'Admin', href: createPageUrl('Admin'), icon: Shield }
      ] : []),
    ];

  const isActive = (pageName) => {
    return currentPageName === pageName;
  };

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
      await base44.auth.redirectToLogin();
    } catch (error) {
      console.error('Logout error:', error);
      await base44.auth.redirectToLogin();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Stock Ticker */}
      <StockTicker />

      {/* Header */}
      <header className="bg-slate-800/95 backdrop-blur-md border-b border-slate-700 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-slate-900" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">
                VTM
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.name);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      active
                        ? 'bg-slate-700 text-amber-400 font-medium'
                        : 'text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hidden md:flex text-slate-300 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </Button>

        
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-700 bg-slate-800"
            >
              <nav className="px-4 py-4 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.name);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        active
                          ? 'bg-slate-700 text-amber-400 font-medium'
                          : 'text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-slate-700/50 w-full transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="pb-20 md:pb-0">{children}</main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 z-50">
        <div className="flex items-center justify-around py-2 px-2">
          {navigation.map(item => {
            const Icon = item.icon;
            const active = isActive(item.name);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
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

      {/* AI Widget */}
      <AIWidget />
    </div>
  );
}