import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Users, Zap, Trophy, BarChart2, Shield, ArrowRight,
  ChevronLeft, ChevronRight, Star, Globe, Rocket, DollarSign, Brain, Award, Flame, CheckCircle, Wallet, Copy, MessageCircle
} from 'lucide-react';

const TOTAL_SLIDES = 15;

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
    <SlideTrading />, <SlidePortfolio />, <SlideLeaderboardApp />, <SlideCopyTrading />,
    <SlideAIAssistant />, <SlideDividends />, <SlideSocial />, <SlideGamification />,
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
          <span className="text-xs text-slate-500">~{Math.ceil((current + 1) * (15 / TOTAL_SLIDES))} min</span>
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
        className="mt-10 text-slate-600 text-sm relative z-10">~15 Minute Deep Dive · 2026</motion.p>
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

/* ─── SLIDE 5: TRADING DASHBOARD ────────────────────────────────── */
function SlideTrading() {
  return (
    <SlideWrap>
      <div className="max-w-6xl w-full">
        <Tag>Feature: Live Trading</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-8">Real-time <span className="text-amber-500">trading dashboard.</span></h2>
        <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
          <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <span className="text-white font-bold flex items-center gap-2">📊 VStock Trading</span>
            <span className="text-slate-400 text-xs">Live Prices</span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side - Portfolio summary */}
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-400 mb-1">Total Portfolio Value</div>
                <div className="text-3xl font-black text-white">£14,832.50</div>
                <div className="text-green-400 text-sm font-semibold">+£4,832.50 (+48.3%)</div>
              </div>
              <div className="space-y-2">
                {[
                  { symbol: 'AAPL', price: '£173.20', change: '+1.4%', shares: 12 },
                  { symbol: 'TSLA', price: '£214.80', change: '-0.8%', shares: 5 },
                  { symbol: 'NVDA', price: '£482.10', change: '+3.2%', shares: 3 },
                  { symbol: 'AMZN', price: '£155.30', change: '+2.8%', shares: 8 },
                ].map(s => (
                  <div key={s.symbol} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                    <div>
                      <div className="text-white font-bold text-sm">{s.symbol}</div>
                      <div className="text-slate-400 text-xs">{s.shares} shares @ {s.price}</div>
                    </div>
                    <div className={`text-xs font-bold ${s.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{s.change}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Market news and quick stats */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4">
                <div className="text-white font-bold mb-2">🔍 Market Insights</div>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>• Tech sector +2.4% today</p>
                  <p>• AI stocks trending up</p>
                  <p>• Dividend season starting</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Cash', val: '£2,400' },
                  { label: 'Day Change', val: '+£342' },
                  { label: 'Holdings', val: '28' },
                  { label: 'Diversity', val: '8 sectors' },
                ].map(s => (
                  <div key={s.label} className="bg-slate-800 rounded-lg p-3 text-center">
                    <div className="text-slate-400 text-xs">{s.label}</div>
                    <div className="text-white font-bold mt-1">{s.val}</div>
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

/* ─── SLIDE 6: PORTFOLIO VIEW ────────────────────────────── */
function SlidePortfolio() {
  return (
    <SlideWrap>
      <div className="max-w-6xl w-full">
        <Tag>Feature: Portfolio Analytics</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-8">Deep <span className="text-amber-500">performance tracking.</span></h2>
        <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
          <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
            <span className="text-white font-bold">💼 Your Portfolio</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Total Value', val: '£14,832', color: 'text-white' },
                { label: 'Today Return', val: '+£342 (+2.4%)', color: 'text-green-400' },
                { label: 'Best Position', val: 'AMZN +21.3%', color: 'text-green-400' },
              ].map(s => (
                <div key={s.label} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="text-slate-400 text-xs mb-1">{s.label}</div>
                  <div className={`text-xl font-black ${s.color}`}>{s.val}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="text-white font-bold text-sm mb-3">Holdings Breakdown</div>
              {[
                { s: 'AAPL', buy: '£152.00', curr: '£173.20', shares: 12, pct: '+13.9%', gain: '+£254' },
                { s: 'MSFT', buy: '£320.00', curr: '£378.50', shares: 6, pct: '+18.3%', gain: '+353' },
                { s: 'TSLA', buy: '£240.00', curr: '£214.80', shares: 5, pct: '-10.5%', gain: '-126' },
                { s: 'AMZN', buy: '£128.00', curr: '£155.30', shares: 8, pct: '+21.3%', gain: '+219' },
              ].map(h => (
                <div key={h.s} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex-1">
                    <div className="text-white font-bold text-sm">{h.s}</div>
                    <div className="text-slate-400 text-xs">{h.shares} shares</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-slate-300">{h.buy} → {h.curr}</div>
                    <div className={`font-bold ${h.pct.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{h.pct}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 7: LEADERBOARD ────────────────────────────── */
function SlideLeaderboardApp() {
  return (
    <SlideWrap>
      <div className="max-w-6xl w-full">
        <Tag>Feature: Global Leaderboard</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-8">Compete with <span className="text-amber-500">everyone.</span></h2>
        <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
          <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <span className="text-white font-bold">🏆 Global Leaderboard</span>
            <span className="text-slate-400 text-xs">This Season</span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Leaderboard */}
            <div className="space-y-2">
              {[
                { rank: 1, name: 'AlphaTrader', tier: '🏆 Titan', val: '£34,821', pct: '+248%' },
                { rank: 2, name: 'BullRunner99', tier: '💎 Diamond', val: '£28,440', pct: '+184%' },
                { rank: 3, name: 'StockWizard', tier: '⚡ Platinum', val: '£22,100', pct: '+121%' },
                { rank: 4, name: 'DipHunter', tier: '🥇 Gold', val: '£18,350', pct: '+83%' },
                { rank: 5, name: 'You', tier: '🥈 Silver', val: '£14,832', pct: '+48%' },
              ].map((t) => (
                <div key={t.rank} className={`flex items-center justify-between p-3 rounded-lg ${t.name === 'You' ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-800/50'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-black w-8">#{t.rank}</span>
                    <div>
                      <div className="text-white text-sm font-bold">{t.name}</div>
                      <div className="text-slate-400 text-xs">{t.tier}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-xs font-bold">{t.val}</div>
                    <div className="text-green-400 text-xs">{t.pct}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tier system */}
            <div className="space-y-3">
              <div className="text-white font-bold text-sm mb-2">🎖️ Tier Progression</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { tier: 'Bronze', ico: '🥉', elo: '0-1.2k' },
                  { tier: 'Silver', ico: '🥈', elo: '1.2k-1.4k' },
                  { tier: 'Gold', ico: '🥇', elo: '1.4k-1.6k' },
                  { tier: 'Platinum', ico: '⚡', elo: '1.6k-1.8k' },
                  { tier: 'Diamond', ico: '💎', elo: '1.8k-2k' },
                  { tier: 'Titan', ico: '🏆', elo: '2k+' },
                ].map(t => (
                  <div key={t.tier} className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
                    <div className="text-2xl">{t.ico}</div>
                    <div className="text-white text-xs font-bold mt-1">{t.tier}</div>
                    <div className="text-slate-400 text-xs mt-1">{t.elo}</div>
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

/* ─── SLIDE 8: COPY TRADING ────────────────────────────── */
function SlideCopyTrading() {
  return (
    <SlideWrap>
      <div className="max-w-6xl w-full">
        <Tag>Feature: Copy Trading</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-8">Follow top <span className="text-amber-500">traders automatically.</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Copy Trading UI */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
              <span className="text-white font-bold">📋 Active Copy Trades</span>
            </div>
            <div className="p-6 space-y-4">
              {[
                { trader: 'AlphaTrader', allocation: '£3,000', return: '+£742', pct: '+24.7%' },
                { trader: 'BullRunner99', allocation: '£2,500', return: '+£460', pct: '+18.4%' },
              ].map(ct => (
                <div key={ct.trader} className="border border-amber-500/20 rounded-lg p-4 bg-amber-500/5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-white font-bold">{ct.trader}</div>
                      <div className="text-slate-400 text-sm">Allocation: {ct.allocation}</div>
                    </div>
                    <Copy className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Return:</span>
                    <span className="text-green-400 font-bold">{ct.return} ({ct.pct})</span>
                  </div>
                </div>
              ))}
              <div className="text-xs text-slate-400 pt-4 border-t border-slate-700">
                💡 Your copy trades mirror their buys & sells proportionally. Zero extra fees.
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="space-y-3">
            {[
              { step: '1', title: 'Browse Leaders', desc: 'Find top traders by return, win-rate, and strategy' },
              { step: '2', title: 'Allocate Capital', desc: 'Choose how much to copy (£500-£5000)' },
              { step: '3', title: 'Auto Mirror', desc: 'Their trades execute on your account proportionally' },
              { step: '4', title: 'Track P&L', desc: 'Live dashboard shows copy-trade performance' },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 * i }}
                className="flex gap-4 p-4 bg-slate-900 rounded-lg border border-slate-800">
                <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-900 font-black flex items-center justify-center shrink-0 text-sm">{item.step}</div>
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

/* ─── SLIDE 9: AI ASSISTANT ────────────────────────────── */
function SlideAIAssistant() {
  return (
    <SlideWrap>
      <div className="max-w-6xl w-full">
        <Tag>Feature: AI Trading Coach</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-8">Your personal <span className="text-amber-500">trading advisor.</span></h2>
        <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
          <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex items-center gap-3">
            <Brain className="w-5 h-5 text-amber-500" />
            <span className="text-white font-bold">🤖 VStock AI Coach</span>
            <span className="text-green-400 text-xs ml-auto">● Online</span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chat */}
            <div className="space-y-3">
              <div className="flex justify-end">
                <div className="bg-slate-700 rounded-2xl rounded-tr-sm px-4 py-2 max-w-xs">
                  <p className="text-white text-sm">Should I buy NVDA right now?</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Brain className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
                  <p className="text-slate-300 text-sm"><strong>Analysis:</strong> NVDA showing bullish RSI at 62. AI chip demand strong. Recommend 15 shares at £482/share. Stop: £455.</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-slate-700 rounded-2xl rounded-tr-sm px-4 py-2 max-w-xs">
                  <p className="text-white text-sm">What's my portfolio risk?</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Brain className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
                  <p className="text-slate-300 text-sm"><strong>Risk Report:</strong> Beta 1.4 (moderate-high). 73% in tech. Diversify into JNJ, PG for stability.</p>
                </div>
              </div>
            </div>

            {/* Capabilities */}
            <div className="space-y-3">
              <div className="text-white font-bold text-sm mb-2">💡 AI Capabilities</div>
              {[
                { icon: '📊', title: 'Market Analysis', desc: 'Real-time sentiment on stocks & sectors' },
                { icon: '🎯', title: 'Trade Ideas', desc: 'Actionable buy/sell with price targets' },
                { icon: '⚠️', title: 'Risk Alerts', desc: 'Warns on over-concentration, volatility' },
                { icon: '📚', title: 'Education', desc: 'Explains trading concepts in plain English' },
                { icon: '🔍', title: 'Technical', desc: 'RSI, MACD, EMA analysis & interpretation' },
                { icon: '💰', title: 'Portfolio Opt', desc: 'Rebalancing suggestions for max returns' },
              ].map((item, i) => (
                <div key={item.title} className="flex gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <span className="text-xl">{item.icon}</span>
                  <div className="text-sm flex-1">
                    <div className="text-white font-bold">{item.title}</div>
                    <div className="text-slate-400 text-xs">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 10: DIVIDENDS ────────────────────────────── */
function SlideDividends() {
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>Feature: Hourly Dividends</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-8">Passive income that <span className="text-amber-500">ticks every hour.</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              { symbol: 'ABPF', yield: '0.08%/hr', annual: '~700%', icon: '🏦', holding: '£5,000' },
              { symbol: 'JNJ', yield: '0.04%/hr', annual: '~350%', icon: '💊', holding: '£3,500' },
              { symbol: 'T', yield: '0.06%/hr', annual: '~525%', icon: '📡', holding: '£2,800' },
              { symbol: 'VZ', yield: '0.05%/hr', annual: '~438%', icon: '📶', holding: '£2,200' },
            ].map((d, i) => (
              <motion.div key={d.symbol} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 * i }}
                className="p-4 bg-slate-900 rounded-xl border border-emerald-500/30 text-center">
                <div className="text-3xl mb-2">{d.icon}</div>
                <div className="text-white font-black text-lg">{d.symbol}</div>
                <div className="text-emerald-400 font-bold text-sm mt-1">{d.yield}</div>
                <div className="text-slate-500 text-xs mt-0.5">{d.holding}</div>
                <div className="text-emerald-300 text-xs font-bold mt-1">+£4/hr</div>
              </motion.div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="p-5 bg-gradient-to-br from-emerald-500/15 to-transparent border border-emerald-500/30 rounded-xl">
              <h3 className="text-emerald-400 font-bold mb-3">💰 Dividend Income Tracker</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Today:</span>
                  <span className="text-emerald-400 font-bold">+£96.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">This Week:</span>
                  <span className="text-emerald-400 font-bold">+£672.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">This Month:</span>
                  <span className="text-emerald-400 font-bold">+£2,880.00</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-emerald-500/20">
                  <span className="text-white font-bold">Annual (Projected):</span>
                  <span className="text-emerald-300 font-black">+£34,560</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
              <div className="text-slate-300 text-sm">
                <p className="mb-2"><strong>Why Dividends?</strong></p>
                <ul className="space-y-1 text-xs">
                  <li>✓ Teaches passive income concepts</li>
                  <li>✓ Rewards long-term holding</li>
                  <li>✓ Creates daily engagement</li>
                  <li>✓ Realistic yield vs growth trade-offs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 11: SOCIAL & COMMUNITY ─────────────────────────── */
function SlideSocial() {
  return (
    <SlideWrap>
      <div className="max-w-6xl w-full">
        <Tag>Feature: Social & Community</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-8">Trading is better <span className="text-amber-500">together.</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Social Feed */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
              <span className="text-white font-bold">💬 Community Feed</span>
            </div>
            <div className="p-4 space-y-4">
              {[
                { user: 'AlphaTrader', action: '🎉 Just hit +£1,000 profit!', time: '2 mins ago', likes: 47 },
                { user: 'BullRunner99', action: '📈 NVDA +3.2% today. AI boom continues!', time: '15 mins ago', likes: 23 },
                { user: 'DipHunter', action: '🎯 Caught the TSLA dip at -10%', time: '45 mins ago', likes: 156 },
              ].map((post, i) => (
                <div key={i} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-bold text-white text-sm">{post.user}</div>
                    <span className="text-slate-400 text-xs">{post.time}</span>
                  </div>
                  <p className="text-slate-300 text-sm mb-2">{post.action}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>❤️ {post.likes} likes</span>
                    <span>💬 Reply</span>
                    <span>📋 Copy</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Features */}
          <div className="space-y-3">
            <div className="text-white font-bold text-sm mb-2">🌐 Social Features</div>
            {[
              { icon: '📣', title: 'Trade Posts', desc: 'Share wins, strategies, and market insights' },
              { icon: '👥', title: 'Trader Profiles', desc: 'Public profiles with full portfolio history' },
              { icon: '❤️', title: 'Likes & Reactions', desc: 'Celebrate great trades with community' },
              { icon: '👤', title: 'Follow Traders', desc: 'Keep up with top performers & friends' },
              { icon: '📊', title: 'Copy Profiles', desc: 'Copy any trader\'s strategy directly' },
              { icon: '🏆', title: 'Leaderboard', desc: 'Compete & climb the global rankings' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 * i }}
                className="flex gap-3 p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-2xl">{item.icon}</span>
                <div className="text-sm flex-1">
                  <div className="text-white font-bold">{item.title}</div>
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

/* ─── SLIDE 12: GAMIFICATION ───────────────────────────────── */
function SlideGamification() {
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>Feature: Gamification</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-8">Hooks that keep users <span className="text-amber-500">hooked.</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {[
              { emoji: '🥇', title: 'Achievements', desc: 'First Trade, Diamond Hands, Dip Hunter, Dividend King, etc' },
              { emoji: '🔥', title: 'Daily Streaks', desc: 'Login streaks & daily trading challenges' },
              { emoji: '⚡', title: 'Missions', desc: 'Weekly objectives with virtual currency rewards' },
              { emoji: '📊', title: 'Seasonal Resets', desc: 'Fresh leaderboards every month' },
              { emoji: '🎯', title: 'Badges', desc: 'Collectible, unique achievement badges' },
              { emoji: '👑', title: 'Hall of Fame', desc: 'Top 10 traders enter permanent hall of fame' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 * i }}
                className="flex gap-3 p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-2xl">{item.emoji}</span>
                <div className="text-sm flex-1">
                  <div className="text-white font-bold">{item.title}</div>
                  <div className="text-slate-400 text-xs">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
            className="relative rounded-2xl overflow-hidden h-full bg-gradient-to-br from-amber-900/40 to-slate-900 border border-amber-500/30 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-5xl font-black text-amber-400 mb-2">5x</p>
            <p className="text-white font-bold">More Daily Sessions</p>
            <p className="text-slate-400 text-sm mt-2 mb-6">with gamification mechanics</p>
            <div className="text-xs text-slate-400 space-y-1">
              <p>📈 Proven mobile game psychology</p>
              <p>🎮 Habit-forming reward loops</p>
              <p>⚙️ Compounding engagement growth</p>
            </div>
          </motion.div>
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 13: BUSINESS MODEL ──────────────────────────── */
function SlideBusinessModel() {
  return (
    <SlideWrap>
      <div className="max-w-5xl w-full">
        <Tag>Business Model</Tag>
        <h2 className="text-4xl md:text-6xl font-black mt-2 mb-8">Revenue <span className="text-amber-500">streams.</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            { icon: '💳', title: 'VStock Pro', desc: '£9.99/mo · Advanced charts, AI priority, ad-free' },
            { icon: '🏫', title: 'B2B Licenses', desc: 'White-label for schools & universities' },
            { icon: '🏆', title: 'Tournaments', desc: 'Premium seasonal events with cash prizes' },
            { icon: '🤝', title: 'Brokerage Referrals', desc: 'Bridge to real trading · Revenue-share model' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 * i }}
              className="p-4 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-2xl">{item.icon}</span>
              <div className="text-white font-bold mt-2 text-sm">{item.title}</div>
              <div className="text-slate-400 text-xs mt-1">{item.desc}</div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="p-5 bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/40 rounded-xl text-center">
          <p className="text-amber-400 font-bold text-lg">10k free users → 1.5k Pro converts → £180k ARR</p>
          <p className="text-slate-400 text-sm mt-2">Conservative 15% conversion (industry: 10-20%)</p>
        </motion.div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 14: VISION ────────────────────────────────── */
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
            { icon: '🌍', title: '1M Users by 2027', sub: '15+ countries via partnerships' },
            { icon: '📈', title: 'Category Leader', sub: '#1 virtual trading education platform' },
            { icon: '🌉', title: 'Real Bridge', sub: 'Pipeline to real brokerages' },
          ].map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.12 }}
              className="p-5 bg-slate-900/80 rounded-lg border border-amber-500/30 text-center">
              <span className="text-3xl">{v.icon}</span>
              <div className="text-white font-bold mt-2">{v.title}</div>
              <div className="text-slate-400 text-xs mt-1">{v.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideWrap>
  );
}

/* ─── SLIDE 15: CTA ────────────────────────────────────── */
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