import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Users, Zap, Trophy, BarChart2, Shield, ArrowRight,
  ChevronLeft, ChevronRight, Star, Globe, Rocket, DollarSign, Bell, Copy,
  Brain, Award, Flame, Target, PieChart, Activity, Wallet, Clock, CheckCircle
} from 'lucide-react';

const TOTAL_SLIDES = 20;

export default function Present() {
  const [current, setCurrent] = useState(0);

  const goTo = (i) => setCurrent(Math.max(0, Math.min(TOTAL_SLIDES - 1, i)));
  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [current]);

  const slideComponents = [
    <SlideHero />, <SlideAgenda />, <SlideProblem />, <SlideMarketOpp />,
    <SlideSolution />, <SlideHowItWorks />, <SlideAppTrade />, <SlideAppPortfolio />,
    <SlideAppLeaderboard />, <SlideFeatures />, <SlideCopyTrading />,
    <SlideAIAssistant />, <SlideDividends />, <SlideGamification />,
    <SlideSocial />, <SlideTierSystem />, <SlideRoadmap />,
    <SlideBusinessModel />, <SlideVision />, <SlideCTA />
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden select-none">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur px-3 pt-2 pb-1">
        <div className="flex gap-0.5 mb-1">
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${i === current ? 'bg-amber-500' : i < current ? 'bg-amber-700/60' : 'bg-slate-700'}`}
            />
          ))}
        </div>
        <div className="flex justify-between items-center px-1">
          <span className="text-xs text-slate-500 font-mono">{current + 1} / {TOTAL_SLIDES}</span>
          <span className="text-xs text-slate-500">~{Math.ceil((current + 1) * (19 / TOTAL_SLIDES))} min</span>
        </div>
      </div>

      {/* Slide */}
      <AnimatePresence mode="wait">
        <motion.div key={current}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.25 } }}
        >
          {slideComponents[current]}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="fixed bottom-6 left-0 right-0 flex items-center justify-center gap-6 z-50">
        <button onClick={prev} disabled={current === 0}
          className="w-11 h-11 rounded-full bg-slate-800/90 border border-slate-700 flex items-center justify-center hover:border-amber-500 hover:text-amber-500 transition-all disabled:opacity-30">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-1.5 flex-wrap max-w-xs justify-center">
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${i === current ? 'bg-amber-500 w-5' : 'bg-slate-600 w-1.5'}`}
            />
          ))}
        </div>
        <button onClick={next} disabled={current === TOTAL_SLIDES - 1}
          className="w-11 h-11 rounded-full bg-slate-800/90 border border-slate-700 flex items-center justify-center hover:border-amber-500 hover:text-amber-500 transition-all disabled:opacity-30">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Shared helpers ─────────────────────────────────── */
const Tag = ({ children }) => (
  <span className="text-amber-500 font-bold uppercase tracking-widest text-sm">{children}</span>
);

const Glow = () => (
  <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.12) 0%, transparent 65%)' }} />
);

const SlideWrap = ({ children, className = '' }) => (
  <div className={`min-h-screen flex flex-col items-center justify-center px-6 py-20 relative ${className}`}>
    {children}
  </div>
);

/* ─── SLIDE 1: HERO ────────────────────────────────────── */
function SlideHero() {
  return (
    <SlideWrap>
      <Glow />
      <div className="absolute inset-0 overflow-hidden opacity-8">
        <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=80" className="w-full h-full object-cover opacity-10" alt="" />
      </div>
      <div className="absolute top-24 left-12 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-24 right-12 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />

      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.7 }}
        className="w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/40 mb-8 relative z-10">
        <TrendingUp className="w-12 h-12 text-slate-900" />
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="text-8xl md:text-[10rem] font-black tracking-tight text-center mb-4 relative z-10 leading-none">
        <span className="text-white">V</span><span className="text-amber-500">Stock</span>
      </motion.h1>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="text-2xl md:text-3xl text-slate-400 font-light tracking-widest uppercase mb-8 relative z-10">
        Virtual Trading. Real Skills.
      </motion.p>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        className="flex flex-wrap gap-3 justify-center relative z-10">
        {['Gamified', 'Zero Risk', 'Real Markets', 'Compete Globally', 'AI-Powered'].map(tag => (
          <span key={tag} className="px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-full text-sm text-slate-300 backdrop-blur">{tag}</span>
        ))}
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="mt-10 text-slate-600 text-sm relative z-10">19-Minute Investor Presentation · 2026</motion.p>
    </SlideWrap>
  );
}

/* ─── SLIDE 2: AGENDA ─────────────────────────────────── */
function SlideAgenda() {
  const items = [
    { num: '01', label: 'The Problem' }, { num: '02', label: 'Market Opportunity' },
    { num: '03', label: 'Our Solution' }, { num: '04', label: 'Live App Demo' },
    { num: '05', label: 'Core Features' }, { num: '06', label: 'Gamification Engine' },
    { num: '07', label: 'Social Layer' }, { num: '08', label: 'Tier System' },
    { num: '09', label: 'Roadmap' }, { num: '10', label: 'Business Model & Vision' },
  ];
  return (
    <SlideWrap>
      <div className="max-w-4xl w-full">
        <Tag>Today's Agenda</Tag>
        <h2 className="text-5xl md:text-7xl font-black mt-2 mb-10">What we'll <span className="text-amber-500">cover.</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item, i) => (
            <motion.div key={item.num} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
              className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-2xl font-black text-amber-500/40 w-12 shrink-0">{item.num}</span>
              <span className="text-white font-semibold">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 3: PROBLEM ─────────────────────────────────── */
function SlideProblem() {
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>The Problem</Tag>
        <h2 className="text-5xl md:text-7xl font-black mt-2 mb-10 leading-tight">
          Learning to trade <span className="text-amber-500">costs too much.</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: '💸', title: 'Real Money Lost', desc: 'The average beginner loses £3,200 in their first year of trading — before they ever understand the basics.' },
            { icon: '😰', title: 'Fear Paralysis', desc: 'Fear of financial loss prevents millions of people from ever attempting to invest, widening the wealth gap.' },
            { icon: '🎓', title: 'No Safe Sandbox', desc: 'Education platforms teach theory — but there\'s no interactive environment to practice real market decisions.' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.15 }}
              className="p-6 bg-slate-900 rounded-2xl border border-red-500/20 hover:border-red-500/50 transition-all">
              <div className="text-5xl mb-4">{item.icon}</div>
              <div className="text-lg font-bold text-white mb-2">{item.title}</div>
              <div className="text-slate-400 text-sm leading-relaxed">{item.desc}</div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-center">
          <p className="text-red-400 text-xl font-bold">80% of retail traders lose money in Year 1</p>
          <p className="text-slate-400 mt-1">Primarily due to lack of a risk-free learning environment</p>
        </motion.div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 4: MARKET OPPORTUNITY ─────────────────────── */
function SlideMarketOpp() {
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>Market Opportunity</Tag>
        <h2 className="text-5xl md:text-7xl font-black mt-2 mb-10">A <span className="text-amber-500">massive</span> market.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { value: '$12.1B', label: 'Fintech EdTech Market', sub: 'Growing at 18% CAGR', color: 'text-amber-500' },
            { value: '14M+', label: 'New Retail Traders', sub: 'Entering markets annually', color: 'text-emerald-400' },
            { value: '65%', label: 'Under 35', sub: 'Of new stock investors', color: 'text-blue-400' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.12 }}
              className="p-8 bg-slate-900 rounded-2xl border border-slate-800 text-center">
              <div className={`text-5xl font-black mb-2 ${stat.color}`}>{stat.value}</div>
              <div className="text-white font-bold mb-1">{stat.label}</div>
              <div className="text-slate-500 text-sm">{stat.sub}</div>
            </motion.div>
          ))}
        </div>
        <div className="relative rounded-2xl overflow-hidden h-48">
          <img src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&q=80" alt="market" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 flex items-center pl-8">
            <div>
              <p className="text-2xl font-black text-white">Gen Z wants to invest.</p>
              <p className="text-slate-400 mt-1">But they need a safe place to learn first. That's VStock.</p>
            </div>
          </div>
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 5: SOLUTION ─────────────────────────────────── */
function SlideSolution() {
  return (
    <SlideWrap>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
      <div className="max-w-5xl w-full">
        <Tag>The Solution</Tag>
        <h2 className="text-5xl md:text-7xl font-black mt-2 mb-4">Introducing <span className="text-amber-500">VStock</span></h2>
        <p className="text-slate-400 text-xl mb-10 max-w-2xl leading-relaxed">
          A fully gamified virtual stock trading platform. Trade with £10,000 of virtual money, compete on global leaderboards, follow AI-driven insights, and build real financial skills — with zero real-money risk.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="relative rounded-2xl overflow-hidden h-56">
            <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80" alt="Trading" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <div className="text-white font-bold text-lg">Real-Time Market Data</div>
              <div className="text-slate-300 text-sm">Live prices · Real dynamics</div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            className="relative rounded-2xl overflow-hidden h-56">
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" alt="Analytics" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <div className="text-white font-bold text-lg">Deep Portfolio Analytics</div>
              <div className="text-slate-300 text-sm">Track every trade · See every gain</div>
            </div>
          </motion.div>
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 6: HOW IT WORKS ─────────────────────────────── */
function SlideHowItWorks() {
  const steps = [
    { n: '1', icon: <Wallet className="w-6 h-6" />, title: 'Get £10,000', desc: 'Every user starts with £10,000 of virtual GBP to deploy into the markets.' },
    { n: '2', icon: <TrendingUp className="w-6 h-6" />, title: 'Trade Live', desc: 'Buy and sell real stocks at real prices. Your portfolio updates in real-time.' },
    { n: '3', icon: <Trophy className="w-6 h-6" />, title: 'Earn ELO', desc: 'Every profitable trade earns you ELO points. Climb from Bronze to Titan.' },
    { n: '4', icon: <Brain className="w-6 h-6" />, title: 'Learn & Win', desc: 'Use AI insights, copy top traders, and develop real financial intuition.' },
  ];
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>How It Works</Tag>
        <h2 className="text-5xl md:text-7xl font-black mt-2 mb-10">Simple. <span className="text-amber-500">Addictive.</span> Effective.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div key={step.n} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 * i }}
              className="relative p-6 bg-slate-900 rounded-2xl border border-slate-800">
              <div className="absolute -top-4 -left-2 text-6xl font-black text-slate-800">{step.n}</div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 mb-4 mt-2">
                {step.icon}
              </div>
              <div className="text-white font-bold mb-2">{step.title}</div>
              <div className="text-slate-400 text-sm leading-relaxed">{step.desc}</div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-5 h-5 text-amber-500" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="mt-8 flex flex-wrap gap-4 justify-center">
          {['No deposit required', 'Instant onboarding', 'Available 24/7', 'Web & Mobile'].map(t => (
            <span key={t} className="flex items-center gap-2 text-sm text-slate-400">
              <CheckCircle className="w-4 h-4 text-green-500" />{t}
            </span>
          ))}
        </motion.div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 7: APP DEMO — TRADING ─────────────────────── */
function SlideAppTrade() {
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>Live App · Trading Dashboard</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-8">Buy & sell in <span className="text-amber-500">seconds.</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Mocked App UI */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-slate-400 text-xs ml-2">VStock — Trade</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">Total Portfolio Value</div>
                <div className="text-2xl font-black text-white">£14,832.50</div>
                <div className="text-green-400 text-sm font-semibold">+£4,832.50 (+48.3%)</div>
              </div>
              {[
                { symbol: 'AAPL', price: '£173.20', change: '+1.4%', shares: 12 },
                { symbol: 'TSLA', price: '£214.80', change: '-0.8%', shares: 5 },
                { symbol: 'NVDA', price: '£482.10', change: '+3.2%', shares: 3 },
              ].map(s => (
                <div key={s.symbol} className="flex items-center justify-between bg-slate-800/50 rounded-xl p-3">
                  <div>
                    <div className="text-white font-bold text-sm">{s.symbol}</div>
                    <div className="text-slate-400 text-xs">{s.shares} shares</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm font-semibold">{s.price}</div>
                    <div className={`text-xs font-bold ${s.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{s.change}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {[
              { icon: <Activity className="w-5 h-5" />, title: 'Real-Time Prices', desc: 'Prices update every 5 seconds, mirroring real market fluctuations and volatility.' },
              { icon: <BarChart2 className="w-5 h-5" />, title: 'Technical Charts', desc: 'Full OHLCV charts with EMA, RSI, MACD, Bollinger Bands and volume analysis.' },
              { icon: <Bell className="w-5 h-5" />, title: 'Price Alerts', desc: 'Set custom alerts for any stock. Get notified when targets are hit.' },
              { icon: <PieChart className="w-5 h-5" />, title: 'Portfolio Analytics', desc: 'Deep P&L breakdown, sector allocation, and performance benchmarking.' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                className="flex gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">{item.icon}</div>
                <div>
                  <div className="text-white font-bold text-sm">{item.title}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 8: APP DEMO — PORTFOLIO ───────────────────── */
function SlideAppPortfolio() {
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>Live App · Portfolio View</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-8">Your wealth, <span className="text-amber-500">visualised.</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            {[
              { icon: <DollarSign className="w-5 h-5" />, title: 'Cash + Investments', desc: 'See your total wealth: cash balance plus live portfolio valuation at a glance.' },
              { icon: <TrendingUp className="w-5 h-5" />, title: 'Profit & Loss Tracking', desc: 'Every holding shows unrealised P&L, cost basis, and percentage return.' },
              { icon: <Clock className="w-5 h-5" />, title: 'Transaction History', desc: 'Full log of every buy, sell, and dividend payment with timestamps.' },
              { icon: <Flame className="w-5 h-5" />, title: 'Dividend Income', desc: 'Certain stocks pay hourly dividends. Watch your passive income grow.' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                className="flex gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">{item.icon}</div>
                <div>
                  <div className="text-white font-bold text-sm">{item.title}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mocked Portfolio UI */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-slate-400 text-xs ml-2">VStock — Portfolio</span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Total Value', val: '£14,832', color: 'text-white' },
                  { label: 'Cash', val: '£2,400', color: 'text-emerald-400' },
                  { label: 'Return', val: '+48.3%', color: 'text-green-400' },
                ].map(s => (
                  <div key={s.label} className="bg-slate-800 rounded-xl p-3 text-center">
                    <div className={`text-lg font-black ${s.color}`}>{s.val}</div>
                    <div className="text-slate-500 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { s: 'AAPL', b: '£152.00', c: '£173.20', pct: '+13.9%' },
                  { s: 'MSFT', b: '£320.00', c: '£378.50', pct: '+18.3%' },
                  { s: 'TSLA', b: '£240.00', c: '£214.80', pct: '-10.5%' },
                  { s: 'AMZN', b: '£128.00', c: '£155.30', pct: '+21.3%' },
                ].map(h => (
                  <div key={h.s} className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-lg">
                    <span className="text-white font-bold text-sm w-14">{h.s}</span>
                    <span className="text-slate-400 text-xs">{h.b}</span>
                    <span className="text-white text-xs">{h.c}</span>
                    <span className={`text-xs font-bold ${h.pct.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{h.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 9: APP DEMO — LEADERBOARD ─────────────────── */
function SlideAppLeaderboard() {
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>Live App · Leaderboard</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-8">Compete with <span className="text-amber-500">everyone.</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mocked Leaderboard */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <span className="text-white font-bold text-sm flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> Global Leaderboard</span>
              <span className="text-slate-400 text-xs">This Season</span>
            </div>
            <div className="p-4 space-y-2">
              {[
                { rank: 1, name: 'AlphaTrader', tier: '🏆 Titan', val: '£34,821', pct: '+248%', medal: 'text-amber-400' },
                { rank: 2, name: 'BullRunner99', tier: '💎 Diamond', val: '£28,440', pct: '+184%', medal: 'text-slate-300' },
                { rank: 3, name: 'StockWizard', tier: '⚡ Platinum', val: '£22,100', pct: '+121%', medal: 'text-orange-400' },
                { rank: 4, name: 'DipHunter', tier: '🥇 Gold', val: '£18,350', pct: '+83%', medal: 'text-slate-400' },
                { rank: 5, name: 'YouAreHere', tier: '🥈 Silver', val: '£14,832', pct: '+48%', medal: 'text-blue-400' },
              ].map((t, i) => (
                <div key={t.rank} className={`flex items-center gap-3 p-2.5 rounded-xl ${t.name === 'YouAreHere' ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-800/50'}`}>
                  <span className={`text-sm font-black w-6 text-center ${t.medal}`}>#{t.rank}</span>
                  <div className="flex-1">
                    <div className={`text-sm font-bold ${t.name === 'YouAreHere' ? 'text-amber-400' : 'text-white'}`}>{t.name === 'YouAreHere' ? '← YOU' : t.name}</div>
                    <div className="text-xs text-slate-500">{t.tier}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-xs font-bold">{t.val}</div>
                    <div className="text-green-400 text-xs">{t.pct}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
              <h3 className="text-white font-bold text-lg mb-3">Why leaderboards work</h3>
              <div className="space-y-3">
                {[
                  '📈 Creates urgency to trade and improve',
                  '🏆 Status rewards drive daily retention',
                  '🔄 Seasons reset keep everyone competitive',
                  '💬 Social bragging generates organic growth',
                ].map(t => <p key={t} className="text-slate-300 text-sm">{t}</p>)}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden h-36">
              <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80" alt="competition" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 to-transparent" />
              <div className="absolute inset-0 flex items-center pl-5">
                <p className="text-white font-bold">Competition drives <span className="text-amber-400">5x more sessions</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 10: FEATURES ───────────────────────────────── */
function SlideFeatures() {
  const features = [
    { icon: <TrendingUp className="w-5 h-5" />, color: 'from-green-500 to-emerald-600', title: 'Live Trading', desc: 'Real-time prices. Instant execution. Full market simulation.' },
    { icon: <Trophy className="w-5 h-5" />, color: 'from-amber-500 to-orange-600', title: 'ELO System', desc: 'Ranked matchmaking-style progression with 6 tiers.' },
    { icon: <Copy className="w-5 h-5" />, color: 'from-blue-500 to-indigo-600', title: 'Copy Trading', desc: 'Allocate funds to top traders and mirror their moves.' },
    { icon: <Brain className="w-5 h-5" />, color: 'from-purple-500 to-violet-600', title: 'AI Coach', desc: 'Personal trading AI powered by real-time market context.' },
    { icon: <BarChart2 className="w-5 h-5" />, color: 'from-pink-500 to-rose-600', title: 'Dividends', desc: 'Hourly yield mechanics reward long-term holders.' },
    { icon: <Bell className="w-5 h-5" />, color: 'from-cyan-500 to-teal-600', title: 'Price Alerts', desc: 'Custom triggers for any stock in the universe.' },
    { icon: <Users className="w-5 h-5" />, color: 'from-rose-500 to-red-600', title: 'Social Feed', desc: 'Share trades, post insights, build your trading rep.' },
    { icon: <Award className="w-5 h-5" />, color: 'from-yellow-500 to-amber-600', title: 'Achievements', desc: 'Unlock badges that showcase your trading milestones.' },
    { icon: <Shield className="w-5 h-5" />, color: 'from-slate-500 to-slate-600', title: 'Zero Risk', desc: 'All virtual. All the experience. None of the loss.' },
  ];
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>Platform Features</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-8 text-center">Everything a trader <span className="text-amber-500">needs.</span></h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="p-4 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-600 transition-all group flex gap-3 items-start">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform`}>{f.icon}</div>
              <div>
                <div className="text-white font-bold text-sm">{f.title}</div>
                <div className="text-slate-500 text-xs mt-0.5">{f.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 11: COPY TRADING ────────────────────────────── */
function SlideCopyTrading() {
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>Feature Spotlight</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-4">Copy Trading — <span className="text-amber-500">Follow the best.</span></h2>
        <p className="text-slate-400 text-lg mb-8 max-w-2xl">Allocate a portion of your virtual portfolio to automatically mirror a top trader's moves. When they profit, you profit.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            {[
              { step: '1', title: 'Browse Top Traders', desc: 'See the leaderboard of top performers ranked by return, win rate, and consistency.' },
              { step: '2', title: 'Allocate Funds', desc: 'Choose how much of your virtual £ to put behind a specific leader.' },
              { step: '3', title: 'Auto Mirror', desc: 'Their buys become your buys. Their sells become your sells. Proportionally.' },
              { step: '4', title: 'Track Performance', desc: 'A live P&L dashboard shows exactly how your copy-trade is performing.' },
            ].map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }}
                className="flex gap-4 items-start p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-900 font-black flex items-center justify-center shrink-0">{s.step}</div>
                <div>
                  <div className="text-white font-bold">{s.title}</div>
                  <div className="text-slate-400 text-sm mt-0.5">{s.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="relative rounded-2xl overflow-hidden h-80">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" alt="copy trading" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-white font-bold text-lg">Social trading amplifies learning</p>
              <p className="text-slate-400 text-sm">Beginners learn by watching experts win</p>
            </div>
          </div>
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 12: AI ASSISTANT ───────────────────────────── */
function SlideAIAssistant() {
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>AI-Powered</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-4">Your personal <span className="text-amber-500">trading coach.</span></h2>
        <p className="text-slate-400 text-lg mb-8 max-w-2xl">Every user gets an AI assistant trained on market data. Ask anything — market analysis, trade recommendations, risk management strategies.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mock AI Chat */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white text-sm font-bold">VStock AI</div>
                <div className="text-green-400 text-xs">● Online</div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-end">
                <div className="bg-slate-700 rounded-2xl rounded-tr-sm px-4 py-2 max-w-xs">
                  <p className="text-white text-sm">Should I buy NVDA right now?</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Brain className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
                  <p className="text-slate-300 text-sm">NVDA is showing bullish momentum. RSI at 62 — not overbought yet. With AI chip demand strong, a position looks reasonable. Consider a 15-share entry at current £482.10. Stop loss at £455. 🎯</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-slate-700 rounded-2xl rounded-tr-sm px-4 py-2 max-w-xs">
                  <p className="text-white text-sm">What's my portfolio risk level?</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Brain className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
                  <p className="text-slate-300 text-sm">Your portfolio beta is 1.4 — moderately high risk. 73% in tech. I'd suggest diversifying into some defensive stocks like JNJ or PG to reduce volatility. 📊</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { icon: '📊', title: 'Market Analysis', desc: 'Real-time sentiment analysis on any stock or sector' },
              { icon: '🎯', title: 'Trade Ideas', desc: 'Actionable buy/sell recommendations with price targets' },
              { icon: '⚠️', title: 'Risk Alerts', desc: 'Warns you when your portfolio is over-concentrated' },
              { icon: '📚', title: 'Education', desc: 'Explains terms, patterns, and strategies in plain English' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                className="flex gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="text-white font-bold">{item.title}</div>
                  <div className="text-slate-400 text-sm">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 13: DIVIDENDS ──────────────────────────────── */
function SlideDividends() {
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>Passive Income Mechanic</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-4">Dividends that <span className="text-amber-500">tick every hour.</span></h2>
        <p className="text-slate-400 text-lg mb-10 max-w-2xl">Certain stocks pay hourly dividend yields, rewarding long-term holders and teaching the concept of passive income through compounding returns.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="grid grid-cols-2 gap-4">
            {[
              { symbol: 'ABPF', yield: '0.08%/hr', annual: '~700%', icon: '🏦' },
              { symbol: 'JNJ', yield: '0.04%/hr', annual: '~350%', icon: '💊' },
              { symbol: 'T', yield: '0.06%/hr', annual: '~525%', icon: '📡' },
              { symbol: 'VZ', yield: '0.05%/hr', annual: '~438%', icon: '📶' },
            ].map((d, i) => (
              <motion.div key={d.symbol} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.1 }}
                className="p-5 bg-slate-900 rounded-2xl border border-emerald-500/20 text-center">
                <div className="text-3xl mb-2">{d.icon}</div>
                <div className="text-white font-black text-lg">{d.symbol}</div>
                <div className="text-emerald-400 font-bold text-sm mt-1">{d.yield}</div>
                <div className="text-slate-500 text-xs">≈ {d.annual} equiv.</div>
              </motion.div>
            ))}
          </div>
          <div className="space-y-5">
            <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl">
              <h3 className="text-emerald-400 font-bold text-lg mb-2">Why dividends work in VStock</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex gap-2"><span className="text-emerald-400">→</span>Creates incentive to hold long-term, not just day-trade</li>
                <li className="flex gap-2"><span className="text-emerald-400">→</span>Teaches compounding and passive income fundamentals</li>
                <li className="flex gap-2"><span className="text-emerald-400">→</span>Rewards patient, disciplined investors on the leaderboard</li>
                <li className="flex gap-2"><span className="text-emerald-400">→</span>Creates realistic yield vs. growth trade-off decisions</li>
              </ul>
            </div>
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <p className="text-slate-400 text-sm">Example: £5,000 in ABPF at 0.08%/hr</p>
              <p className="text-white font-bold text-2xl mt-1">+£4.00 / hour</p>
              <p className="text-emerald-400 text-sm">+£96 / day · +£2,880 / month</p>
            </div>
          </div>
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 14: GAMIFICATION ───────────────────────────── */
function SlideGamification() {
  const badges = [
    { emoji: '🥇', name: 'First Trade', desc: 'Execute your first buy order' },
    { emoji: '💎', name: 'Diamond Hands', desc: 'Hold a position for 7+ days' },
    { emoji: '🎯', name: 'Dip Hunter', desc: 'Buy a stock at a 10%+ dip' },
    { emoji: '🔥', name: 'On Fire', desc: '5 consecutive winning trades' },
    { emoji: '👑', name: 'Dividend King', desc: 'Earn £1,000 in dividends' },
    { emoji: '🚀', name: 'Profit 1K', desc: 'Reach £1,000 total profit' },
  ];
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>Gamification Engine</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-4">Hooks that <span className="text-amber-500">keep users coming back.</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-slate-400 text-lg mb-6">VStock uses proven mobile game psychology to turn investing into an addictive daily habit.</p>
            <div className="space-y-3">
              {[
                { icon: '🏆', label: 'Achievement Badges', desc: 'Unlock collectible badges for trading milestones' },
                { icon: '🔥', label: 'Daily Streaks', desc: 'Login streaks and daily trading challenges' },
                { icon: '⚡', label: 'Missions', desc: 'Weekly objectives with virtual currency rewards' },
                { icon: '📊', label: 'Seasonal Resets', desc: 'New seasons keep the competitive ladder fresh' },
              ].map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="text-white font-semibold text-sm">{item.label}</div>
                    <div className="text-slate-500 text-xs">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-4 font-semibold uppercase tracking-wider">Achievement Badges</p>
            <div className="grid grid-cols-3 gap-3">
              {badges.map((b, i) => (
                <motion.div key={b.name} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.08 }}
                  className="p-3 bg-slate-900 rounded-xl border border-amber-500/20 text-center hover:border-amber-500/60 transition-all">
                  <div className="text-3xl mb-1">{b.emoji}</div>
                  <div className="text-white font-bold text-xs">{b.name}</div>
                  <div className="text-slate-500 text-xs mt-0.5 leading-tight">{b.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 15: SOCIAL ─────────────────────────────────── */
function SlideSocial() {
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>Social Layer</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-4">Trading is better <span className="text-amber-500">together.</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            {[
              { icon: '📣', title: 'Trade Posts', desc: 'Share your best trades with the community. Flex your wins.' },
              { icon: '❤️', title: 'Likes & Reactions', desc: 'Community validates great trades and insights with likes.' },
              { icon: '👤', title: 'Trader Profiles', desc: 'Public profiles with portfolios, stats, and achievement walls.' },
              { icon: '📋', title: 'Copy Anyone', desc: 'From any profile, copy their strategy with one click.' },
              { icon: '💬', title: 'Market Insights', desc: 'Share your market thesis. Build a following. Become a leader.' },
            ].map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 * i }}
                className="flex gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <div className="text-white font-bold">{s.title}</div>
                  <div className="text-slate-400 text-sm">{s.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden h-48">
              <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80" alt="social" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-white font-bold">Community-driven growth</p>
                <p className="text-slate-400 text-sm">Viral sharing = free acquisition</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { val: '5x', label: 'More Sessions', sub: 'with social features' },
                { val: '3x', label: 'Retention', sub: 'vs solo trading apps' },
                { val: '40%', label: 'Viral K-Factor', sub: 'from share mechanics' },
              ].map(s => (
                <div key={s.label} className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                  <div className="text-amber-500 font-black text-xl">{s.val}</div>
                  <div className="text-white text-xs font-semibold">{s.label}</div>
                  <div className="text-slate-500 text-xs">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 16: TIER SYSTEM ─────────────────────────────── */
function SlideTierSystem() {
  const tiers = [
    { tier: 'Bronze', range: '0 – 1,199 ELO', color: 'from-orange-900 to-orange-800', border: 'border-orange-700/40', icon: '🥉', users: '40%' },
    { tier: 'Silver', range: '1,200 – 1,399', color: 'from-slate-700 to-slate-600', border: 'border-slate-500/40', icon: '🥈', users: '25%' },
    { tier: 'Gold', range: '1,400 – 1,599', color: 'from-yellow-800 to-yellow-700', border: 'border-yellow-600/40', icon: '🥇', users: '18%' },
    { tier: 'Platinum', range: '1,600 – 1,799', color: 'from-cyan-900 to-cyan-800', border: 'border-cyan-600/40', icon: '⚡', users: '10%' },
    { tier: 'Diamond', range: '1,800 – 1,999', color: 'from-blue-900 to-blue-800', border: 'border-blue-500/40', icon: '💎', users: '5%' },
    { tier: 'Titan', range: '2,000+', color: 'from-amber-800 to-amber-700', border: 'border-amber-500/60', icon: '🏆', users: '2%' },
  ];
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>ELO Ranking System</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-4">Six tiers. <span className="text-amber-500">One goal.</span></h2>
        <p className="text-slate-400 text-lg mb-8 max-w-2xl">Our ELO system adjusts dynamically based on the quality of trades — not just profit. Smart risk management is rewarded at every level.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {tiers.map((t, i) => (
            <motion.div key={t.tier} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`p-4 rounded-2xl bg-gradient-to-b ${t.color} border ${t.border} text-center`}>
              <div className="text-4xl mb-2">{t.icon}</div>
              <div className="text-white font-black text-sm">{t.tier}</div>
              <div className="text-white/60 text-xs mt-1">{t.range}</div>
              <div className="mt-2 text-white/40 text-xs">{t.users} of players</div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '📈', title: 'Dynamic ELO', desc: 'Win = +ELO based on opponent rank. Lose = -ELO proportional to risk.' },
            { icon: '🔄', title: 'Seasonal Resets', desc: 'Seasons refresh monthly. Top 10 earn permanent hall-of-fame status.' },
            { icon: '🎁', title: 'Tier Rewards', desc: 'Higher tiers unlock exclusive features, profile flair, and bragging rights.' },
          ].map(item => (
            <div key={item.title} className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="text-white font-bold text-sm">{item.title}</div>
                <div className="text-slate-500 text-xs mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 17: ROADMAP ─────────────────────────────────── */
function SlideRoadmap() {
  const phases = [
    { phase: 'Phase 1', label: 'Now — Live', color: 'bg-green-500', items: ['Core trading engine', 'ELO leaderboard', 'Portfolio analytics', 'AI assistant', 'Copy trading', 'Dividends system'] },
    { phase: 'Phase 2', label: 'Q2 2026', color: 'bg-amber-500', items: ['Mobile app (iOS & Android)', 'Season tournaments', 'Advanced charting', 'Options simulation', 'Group challenges'] },
    { phase: 'Phase 3', label: 'Q4 2026', color: 'bg-blue-500', items: ['Crypto markets', 'Forex trading sim', 'Paper-to-real bridge', 'API for educators', 'White-label B2B'] },
  ];
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>Product Roadmap</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-10">Where we're <span className="text-amber-500">headed.</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {phases.map((phase, i) => (
            <motion.div key={phase.phase} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
              className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-slate-900 ${phase.color} mb-4`}>
                {phase.label}
              </div>
              <div className="text-white font-black text-xl mb-4">{phase.phase}</div>
              <ul className="space-y-2">
                {phase.items.map(item => (
                  <li key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-8 relative rounded-2xl overflow-hidden h-32">
          <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80" alt="roadmap" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-950/75 flex items-center justify-center">
            <p className="text-white font-bold text-xl text-center">Phase 3 target: Bridge virtual learning to real-world investing</p>
          </div>
        </motion.div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 18: BUSINESS MODEL ─────────────────────────── */
function SlideBusinessModel() {
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>Business Model</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-10">How VStock <span className="text-amber-500">makes money.</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[
            { icon: '💳', title: 'VStock Pro — £9.99/mo', desc: 'Advanced charts, unlimited price alerts, AI priority access, exclusive badge set, and an ad-free experience.', badge: 'Core Revenue' },
            { icon: '🏫', title: 'B2B Education Licences', desc: 'White-label VStock for schools, universities and financial literacy programs. Per-seat annual contracts.', badge: 'Scalable B2B' },
            { icon: '🏆', title: 'Tournament Entry Fees', desc: 'Premium seasonal tournaments with exclusive prizes. Small virtual currency entry fee creates high-value events.', badge: 'Engagement Boost' },
            { icon: '🤝', title: 'Brokerage Referrals', desc: 'Partner with real brokerages to refer users who are "ready to go real." Revenue-share on referrals.', badge: 'Viral Bridge' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 * i }}
              className="p-5 bg-slate-900 rounded-2xl border border-slate-800">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{item.icon}</span>
                <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full font-semibold">{item.badge}</span>
              </div>
              <div className="text-white font-bold mb-2">{item.title}</div>
              <div className="text-slate-400 text-sm leading-relaxed">{item.desc}</div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center">
          <p className="text-amber-400 font-bold text-lg">Target: 10,000 free users → 1,500 Pro converts = £180K ARR</p>
          <p className="text-slate-400 text-sm mt-1">Conservative 15% conversion rate based on comparable gamified SaaS products</p>
        </motion.div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 19: VISION ─────────────────────────────────── */
function SlideVision() {
  return (
    <SlideWrap>
      <Glow />
      <div className="max-w-4xl w-full relative z-10">
        <Tag>Vision & Mission</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-6 leading-tight">
          Democratising <span className="text-amber-500">financial literacy</span> for the next generation.
        </h2>
        <p className="text-slate-300 text-xl leading-relaxed mb-10">
          VStock exists because we believe the wealth gap isn't just a money problem — it's a knowledge problem. 
          By making investing fun, social, and risk-free, we can onboard a new generation of financially literate individuals who 
          understand markets before they risk a single real pound.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Globe className="w-6 h-6" />, title: '1M Users by 2027', desc: 'Across 15+ countries through partnerships and viral growth' },
            { icon: <Rocket className="w-6 h-6" />, title: 'Category Leader', desc: 'The #1 virtual trading platform for education and entertainment' },
            { icon: <Star className="w-6 h-6" />, title: 'Real Bridge', desc: 'A trusted pipeline from simulation to real brokerage accounts' },
          ].map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.12 }}
              className="p-5 bg-slate-900/80 rounded-2xl border border-amber-500/20 text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 mx-auto mb-3">{v.icon}</div>
              <div className="text-white font-bold">{v.title}</div>
              <div className="text-slate-400 text-sm mt-1">{v.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 20: CTA ─────────────────────────────────────── */
function SlideCTA() {
  return (
    <SlideWrap>
      <div className="absolute inset-0 opacity-5">
        <img src="https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1600&q=80" className="w-full h-full object-cover" alt="" />
      </div>
      <div style={{ background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.18) 0%, transparent 70%)' }} className="absolute inset-0" />

      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.7 }}
        className="w-28 h-28 bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/50 mb-8 relative z-10">
        <TrendingUp className="w-14 h-14 text-slate-900" />
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="text-7xl md:text-9xl font-black text-center mb-3 relative z-10">
        <span className="text-white">V</span><span className="text-amber-500">Stock</span>
      </motion.h1>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="text-2xl text-slate-400 text-center mb-2 relative z-10">The future of learning to trade.</motion.p>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="text-slate-500 text-center mb-10 relative z-10">No risk. Real skills. Compete with everyone.</motion.p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row gap-4 relative z-10 mb-10">
        <a href="/Home" className="flex items-center justify-center gap-2 px-10 py-4 bg-amber-500 hover:bg-amber-600 rounded-2xl text-slate-900 font-black text-xl transition-all shadow-lg shadow-amber-500/30">
          Try VStock Now <ArrowRight className="w-6 h-6" />
        </a>
        <div className="flex items-center justify-center gap-2 px-10 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold text-lg">
          <Wallet className="w-5 h-5 text-amber-500" />
          <span>£10,000</span><span className="text-slate-400 font-normal text-base">virtual to start</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="flex flex-wrap gap-6 justify-center text-center relative z-10">
        {['Zero Financial Risk', 'Real Market Data', 'AI Trading Coach', 'ELO Leaderboards', 'Copy Trading', 'Dividends'].map(item => (
          <div key={item} className="flex items-center gap-2 text-slate-400 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />{item}
          </div>
        ))}
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        className="mt-12 text-slate-700 text-xs relative z-10">Thank you · VStock 2026 · Virtual Trading. Real Skills.</motion.p>
    </SlideWrap>
  );
}