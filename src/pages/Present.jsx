import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Users, Zap, Trophy, BarChart2, Shield, ArrowRight,
  ChevronLeft, ChevronRight, Star, Globe, Rocket, DollarSign, Brain, Award, Flame, CheckCircle, Wallet
} from 'lucide-react';

const TOTAL_SLIDES = 11;

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
    <SlideHero />, <SlideProblem />, <SlideSolution />, <SlideHowItWorks />,
    <SlideAppDemo />, <SlideFeatures />, <SlideGamification />,
    <SlideLeaderboard />, <SlideBusinessModel />, <SlideVision />, <SlideCTA />
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
          <span className="text-xs text-slate-500">~{Math.ceil((current + 1) * (10 / TOTAL_SLIDES))} min</span>
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

const Tag = ({ children }) => <span className="text-amber-500 font-bold uppercase tracking-widest text-sm">{children}</span>;
const Glow = () => <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.12) 0%, transparent 65%)' }} />;
const SlideWrap = ({ children }) => (
  <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative">{children}</div>
);

/* ─── SLIDE 1: HERO ────────────────────────────────────── */
function SlideHero() {
  return (
    <SlideWrap>
      <Glow />
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

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="mt-10 text-slate-600 text-sm relative z-10">~10 Minute Pitch · 2026</motion.p>
    </SlideWrap>
  );
}

/* ─── SLIDE 2: PROBLEM ─────────────────────────────────── */
function SlideProblem() {
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>The Problem</Tag>
        <h2 className="text-5xl md:text-7xl font-black mt-2 mb-10 leading-tight">
          Learning to trade <span className="text-amber-500">costs too much.</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '💸', title: 'Real Money Lost', desc: '80% of beginner traders lose money in Year 1' },
            { icon: '😰', title: 'Fear Paralysis', desc: 'Millions never invest due to fear of loss' },
            { icon: '🎓', title: 'No Practice Ground', desc: 'No safe place to learn real market skills' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.15 }}
              className="p-6 bg-slate-900 rounded-2xl border border-red-500/20">
              <div className="text-5xl mb-4">{item.icon}</div>
              <div className="text-lg font-bold text-white mb-2">{item.title}</div>
              <div className="text-slate-400 text-sm leading-relaxed">{item.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 3: SOLUTION ─────────────────────────────────── */
function SlideSolution() {
  return (
    <SlideWrap>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
      <div className="max-w-5xl w-full">
        <Tag>The Solution</Tag>
        <h2 className="text-5xl md:text-7xl font-black mt-2 mb-4">Introducing <span className="text-amber-500">VStock</span></h2>
        <p className="text-slate-400 text-xl mb-10 max-w-3xl leading-relaxed">
          A gamified virtual trading platform. Start with £10,000 virtual, compete on leaderboards, use AI insights, and build real financial skills — zero real-money risk.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '📈', title: 'Real Markets', desc: 'Live stock prices, actual market dynamics' },
            { icon: '🏆', title: 'Competitive', desc: 'ELO rankings, 6-tier system, seasons' },
            { icon: '🤖', title: 'AI-Powered', desc: 'Personal trading coach with market insights' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
              <span className="text-3xl">{item.icon}</span>
              <div className="text-white font-bold mt-2">{item.title}</div>
              <div className="text-slate-400 text-sm mt-1">{item.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 4: HOW IT WORKS ─────────────────────────────── */
function SlideHowItWorks() {
  const steps = [
    { n: '1', title: 'Get £10,000', desc: 'Virtual cash to deploy' },
    { n: '2', title: 'Trade Live', desc: 'Real prices, instant execution' },
    { n: '3', title: 'Earn ELO', desc: 'Climb Bronze → Titan' },
    { n: '4', title: 'Learn & Win', desc: 'Build real skills, top leaderboard' },
  ];
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>How It Works</Tag>
        <h2 className="text-5xl md:text-7xl font-black mt-2 mb-10">Simple. <span className="text-amber-500">Addictive.</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <motion.div key={step.n} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 * i }}
              className="relative p-6 bg-slate-900 rounded-2xl border border-slate-800">
              <div className="absolute -top-4 -left-2 text-5xl font-black text-slate-800">{step.n}</div>
              <div className="text-white font-bold mb-2 mt-2">{step.title}</div>
              <div className="text-slate-400 text-sm">{step.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 5: APP DEMO ────────────────────────────────── */
function SlideAppDemo() {
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>Live App Demo</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-8">Built. <span className="text-amber-500">Live.</span> Real-Time.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mock Trading UI */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-slate-400 text-xs ml-2">VStock — Trading</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Portfolio Value</div>
                <div className="text-2xl font-black text-white">£14,832</div>
                <div className="text-green-400 text-sm font-semibold">+48.3%</div>
              </div>
              {[
                { symbol: 'AAPL', price: '£173.20', change: '+1.4%' },
                { symbol: 'TSLA', price: '£214.80', change: '-0.8%' },
                { symbol: 'NVDA', price: '£482.10', change: '+3.2%' },
              ].map(s => (
                <div key={s.symbol} className="flex justify-between bg-slate-800/50 rounded-lg p-3">
                  <div>
                    <div className="text-white font-bold text-sm">{s.symbol}</div>
                    <div className="text-slate-400 text-xs">{s.price}</div>
                  </div>
                  <div className={`text-xs font-bold ${s.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{s.change}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {[
              { icon: '📊', title: 'Real-Time Prices', desc: 'Live market updates every 5 seconds' },
              { icon: '🎯', title: 'Technical Analysis', desc: 'Full charts with RSI, EMA, MACD' },
              { icon: '💰', title: 'Dividends', desc: 'Hourly yields on select stocks' },
              { icon: '🔔', title: 'Price Alerts', desc: 'Custom triggers for any stock' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                className="flex gap-3 p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="text-white font-bold text-sm">{item.title}</div>
                  <div className="text-slate-400 text-xs">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 6: FEATURES ─────────────────────────────────── */
function SlideFeatures() {
  const features = [
    { icon: TrendingUp, title: 'Live Trading' }, { icon: Trophy, title: 'ELO Rankings' },
    { icon: Users, title: 'Copy Trading' }, { icon: Brain, title: 'AI Coach' },
    { icon: Flame, title: 'Dividends' }, { icon: Award, title: 'Achievements' },
  ];
  return (
    <SlideWrap>
      <div className="max-w-4xl w-full">
        <Tag>Core Features</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-8 text-center">Complete platform.</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="p-4 bg-slate-900 rounded-lg border border-slate-800 text-center">
                <Icon className="w-6 h-6 mx-auto text-amber-500 mb-2" />
                <div className="text-white font-bold text-sm">{f.title}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 7: GAMIFICATION ─────────────────────────────── */
function SlideGamification() {
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>Engagement Engine</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-8">Keeps users <span className="text-amber-500">hooked.</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-3">
            {[
              { emoji: '🏆', title: 'Badges', desc: 'Collectible achievements unlock with milestones' },
              { emoji: '🔥', title: 'Daily Streaks', desc: 'Login streaks reward consistent engagement' },
              { emoji: '⚡', title: 'Missions', desc: 'Weekly objectives with rewards' },
              { emoji: '📊', title: 'Seasonal Resets', desc: 'Fresh leaderboards every month' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 * i }}
                className="flex gap-3 p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <div className="text-white font-bold text-sm">{item.title}</div>
                  <div className="text-slate-400 text-xs">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Psychology stat */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
            className="relative rounded-2xl overflow-hidden h-56 bg-gradient-to-br from-amber-900/40 to-slate-900 border border-amber-500/20 flex items-center justify-center">
            <div className="text-center">
              <p className="text-5xl font-black text-amber-400 mb-2">5x</p>
              <p className="text-white font-bold">More Daily Sessions</p>
              <p className="text-slate-400 text-sm mt-1">with gamification</p>
            </div>
          </motion.div>
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 8: LEADERBOARD ────────────────────────────────── */
function SlideLeaderboard() {
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>Competitive Core</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-8">Compete to <span className="text-amber-500">dominate.</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Leaderboard UI */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
              <span className="text-white font-bold text-sm">🏆 Top Traders</span>
            </div>
            <div className="p-4 space-y-2">
              {[
                { rank: 1, name: 'AlphaTrader', tier: '🏆 Titan', val: '+248%' },
                { rank: 2, name: 'BullRunner', tier: '💎 Diamond', val: '+184%' },
                { rank: 3, name: 'StockWizard', tier: '⚡ Platinum', val: '+121%' },
                { rank: 5, name: 'You', tier: '🥈 Silver', val: '+48%' },
              ].map((t) => (
                <div key={t.rank} className={`flex items-center justify-between p-2 rounded-lg ${t.name === 'You' ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-800/50'}`}>
                  <div>
                    <div className="text-white text-sm font-bold">#{t.rank} {t.name}</div>
                    <div className="text-slate-400 text-xs">{t.tier}</div>
                  </div>
                  <div className="text-green-400 font-bold text-xs">{t.val}</div>
                </div>
              ))}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="space-y-4">
            <div className="p-5 bg-slate-900 rounded-xl border border-slate-800">
              <h3 className="text-white font-bold text-lg mb-3">ELO System</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" />6 tiers from Bronze to Titan</li>
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" />ELO based on quality wins, not just profit</li>
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" />Monthly seasons with resets</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 9: BUSINESS MODEL ────────────────────────────── */
function SlideBusinessModel() {
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>Business Model</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-8">Revenue <span className="text-amber-500">streams.</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            { icon: '💳', title: 'VStock Pro', desc: '£9.99/mo · Advanced charts, AI priority' },
            { icon: '🏫', title: 'B2B Licenses', desc: 'White-label for schools & universities' },
            { icon: '🏆', title: 'Tournaments', desc: 'Premium seasonal events with prizes' },
            { icon: '🤝', title: 'Brokerage Referrals', desc: 'Bridge users to real trading platforms' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
              className="p-4 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-2xl">{item.icon}</span>
              <div className="text-white font-bold mt-2">{item.title}</div>
              <div className="text-slate-400 text-xs mt-1">{item.desc}</div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center">
          <p className="text-amber-400 font-bold">10k free users → 1.5k Pro = £180k ARR</p>
        </motion.div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 10: VISION ────────────────────────────────────── */
function SlideVision() {
  return (
    <SlideWrap>
      <Glow />
      <div className="max-w-4xl w-full relative z-10">
        <Tag>Vision</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-6">
          Democratizing financial <span className="text-amber-500">literacy</span>
        </h2>
        <p className="text-slate-300 text-lg mb-10 max-w-2xl leading-relaxed">
          Making investing fun, social, and risk-free so the next generation can build real skills before risking real money.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '🌍', title: '1M Users by 2027' },
            { icon: '📈', title: 'Category Leader' },
            { icon: '🌉', title: 'Real Bridge' },
          ].map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.12 }}
              className="p-5 bg-slate-900/80 rounded-lg border border-amber-500/20 text-center">
              <span className="text-3xl">{v.icon}</span>
              <div className="text-white font-bold mt-2 text-sm">{v.title}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 11: CTA ─────────────────────────────────────── */
function SlideCTA() {
  return (
    <SlideWrap>
      <div style={{ background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.18) 0%, transparent 70%)' }} className="absolute inset-0" />

      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.7 }}
        className="w-28 h-28 bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/50 mb-8 relative z-10">
        <TrendingUp className="w-14 h-14 text-slate-900" />
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="text-7xl md:text-9xl font-black text-center mb-6 relative z-10">
        <span className="text-white">V</span><span className="text-amber-500">Stock</span>
      </motion.h1>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="text-2xl text-slate-400 text-center mb-3 relative z-10">The future of learning to trade.</motion.p>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="text-slate-500 text-center mb-10 relative z-10 font-semibold">Zero Risk. Real Skills. Compete with Everyone.</motion.p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row gap-4 relative z-10">
        <a href="/Home" className="flex items-center justify-center gap-2 px-10 py-4 bg-amber-500 hover:bg-amber-600 rounded-2xl text-slate-900 font-black text-lg transition-all shadow-lg shadow-amber-500/30">
          Try VStock Now <ArrowRight className="w-5 h-5" />
        </a>
        <div className="flex items-center justify-center gap-2 px-10 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold">
          <Wallet className="w-4 h-4 text-amber-500" />
          <span>£10,000</span><span className="text-slate-400 font-normal text-sm">virtual</span>
        </div>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        className="mt-12 text-slate-700 text-xs relative z-10">VStock 2026 · Virtual Trading. Real Skills.</motion.p>
    </SlideWrap>
  );
}