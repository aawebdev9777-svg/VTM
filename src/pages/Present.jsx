import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { TrendingUp, ChevronLeft, ChevronRight, ArrowRight, Brain, Copy, Wallet, BarChart2, Trophy, Users, Zap, Globe } from 'lucide-react';

const TOTAL_SLIDES = 16;

/* ═══════════════════════════════════════════════════════════
   SHELL
═══════════════════════════════════════════════════════════ */
export default function Present() {
  const [current, setCurrent] = useState(0);
  const goTo = (i) => setCurrent(Math.max(0, Math.min(TOTAL_SLIDES - 1, i)));
  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [current]);

  const slides = [
    SlideHero, SlideProblem, SlideSolution, SlideHowItWorks,
    SlideTrading, SlidePortfolio, SlideLeaderboard, SlideCopyTrading,
    SlideAI, SlideDividends, SlideSocial, SlideGamification,
    SlideMoneyConfident, SlideBusinessModel, SlideVision, SlideCTA,
  ];
  const SlideComp = slides[current];

  return (
    <div className="fixed inset-0 bg-[#060810] text-white overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Ambient grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Top progress */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-3">
        <div className="flex gap-0.5">
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className="flex-1 h-0.5 rounded-full transition-all duration-500 overflow-hidden"
              style={{ background: i < current ? 'rgba(245,158,11,0.5)' : i === current ? '' : 'rgba(255,255,255,0.08)' }}>
              {i === current && (
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '100%' }} />
              )}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-2 px-0.5">
          <span className="text-[10px] text-white/20 font-mono tracking-widest">VSTOCK · 2026</span>
          <span className="text-[10px] text-white/20 font-mono">{String(current + 1).padStart(2, '0')} / {TOTAL_SLIDES}</span>
        </div>
      </div>

      {/* Slide */}
      <AnimatePresence mode="wait">
        <motion.div key={current}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, y: -16, transition: { duration: 0.3 } }}
          className="w-full h-full">
          <SlideComp />
        </motion.div>
      </AnimatePresence>

      {/* Bottom nav */}
      <div className="fixed bottom-5 left-0 right-0 flex items-center justify-center gap-5 z-50">
        <button onClick={prev} disabled={current === 0}
          className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur hover:border-amber-500/60 hover:text-amber-400 transition-all disabled:opacity-20 text-white/50">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? 'bg-amber-400 w-4 h-1.5' : 'bg-white/15 w-1.5 h-1.5 hover:bg-white/30'}`} />
          ))}
        </div>
        <button onClick={next} disabled={current === TOTAL_SLIDES - 1}
          className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur hover:border-amber-500/60 hover:text-amber-400 transition-all disabled:opacity-20 text-white/50">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARED PRIMITIVES
═══════════════════════════════════════════════════════════ */
const W = ({ children, className = '' }) => (
  <div className={`w-full h-full flex flex-col items-center justify-center px-8 md:px-16 py-20 relative ${className}`}>
    {children}
  </div>
);
const Label = ({ children }) => (
  <span className="inline-block text-amber-400/80 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">{children}</span>
);
const H = ({ children, className = '' }) => (
  <h2 className={`font-black leading-[0.95] tracking-tight ${className}`}>{children}</h2>
);
const Gold = ({ children }) => <span className="text-amber-400">{children}</span>;
const Dim = ({ children }) => <span className="text-white/30">{children}</span>;

const Card = ({ children, className = '', glow = false }) => (
  <div className={`rounded-2xl border ${glow ? 'border-amber-500/20 bg-amber-500/5' : 'border-white/8 bg-white/[0.03]'} backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

const Stat = ({ value, label, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.6 }}
    className="text-center">
    <div className="text-3xl md:text-4xl font-black text-amber-400 leading-none">{value}</div>
    <div className="text-white/40 text-xs mt-1.5 leading-snug">{label}</div>
  </motion.div>
);

const Pill = ({ children }) => (
  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400/80 border border-amber-400/20 rounded-full px-2.5 py-0.5 bg-amber-400/5">
    {children}
  </span>
);

/* ═══════════════════════════════════════════════════════════
   SLIDE 1 — HERO
═══════════════════════════════════════════════════════════ */
function SlideHero() {
  return (
    <W className="text-center">
      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 65%)' }} />
      </div>

      <motion.div initial={{ scale: 0.6, opacity: 0, rotate: -6 }} animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-20 h-20 md:w-24 md:h-24 rounded-[22px] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/40 mb-8 relative z-10">
        <TrendingUp className="w-10 h-10 md:w-12 md:h-12 text-black" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7 }}
        className="relative z-10 mb-5">
        <h1 className="text-[clamp(5rem,18vw,14rem)] font-black tracking-tighter leading-none">
          <span className="text-white">V</span><span className="text-amber-400">Stock</span>
        </h1>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="text-white/40 text-sm md:text-base font-medium tracking-[0.2em] uppercase mb-6 relative z-10">
        Virtual Trading · Real Skills · Zero Risk
      </motion.p>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        className="text-white/50 text-base md:text-lg max-w-xl leading-relaxed relative z-10">
        The gamified investment platform turning the next generation into confident, capable investors — before they ever risk real money.
      </motion.p>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
        className="flex gap-6 mt-10 relative z-10">
        {[{ v: '£10,000', l: 'virtual start' }, { v: '6 tiers', l: 'of competition' }, { v: 'AI coach', l: 'built in' }].map(s => (
          <div key={s.l} className="text-center">
            <div className="text-white font-black text-sm">{s.v}</div>
            <div className="text-white/30 text-xs">{s.l}</div>
          </div>
        ))}
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
        className="absolute bottom-16 text-white/15 text-[10px] tracking-widest font-mono">
        16-SLIDE DEEP DIVE · 2026
      </motion.p>
    </W>
  );
}

/* ═══════════════════════════════════════════════════════════
   SLIDE 2 — PROBLEM
═══════════════════════════════════════════════════════════ */
function SlideProblem() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>The Problem</Label>
        <H className="text-[clamp(2.5rem,7vw,5.5rem)] text-white mb-3">
          Learning to invest <Gold>costs too much.</Gold>
        </H>
        <p className="text-white/45 text-lg mb-10 max-w-2xl leading-relaxed">
          Over <span className="text-white font-semibold">18 million young adults</span> in the UK have no investments, no financial education, and no safe place to learn.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: '💸', n: '80%', label: 'lose money in Year 1', desc: 'First-time traders blow their capital — and never return to the markets again.' },
            { icon: '😰', n: '1 in 5', label: 'got financial education', desc: 'Millions never invest due to fear of losing money they simply cannot afford.' },
            { icon: '🎓', n: '£0', label: 'taught about investing', desc: 'Schools cover algebra and history — not compound interest or portfolio risk.' },
          ].map((item, i) => (
            <motion.div key={item.n} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.12 }}
              className="rounded-2xl border border-red-500/15 bg-red-500/5 p-6">
              <div className="text-4xl mb-3">{item.icon}</div>
              <div className="text-2xl font-black text-red-400 mb-0.5">{item.n}</div>
              <div className="text-white/60 text-xs mb-3 uppercase tracking-wide font-semibold">{item.label}</div>
              <div className="text-white/40 text-sm leading-relaxed">{item.desc}</div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="rounded-xl border border-red-400/20 bg-red-400/5 px-6 py-4 text-center">
          <p className="text-red-300 font-semibold text-base">The system is broken. <span className="text-white">VStock is the fix.</span></p>
        </motion.div>
      </div>
    </W>
  );
}

/* ═══════════════════════════════════════════════════════════
   SLIDE 3 — SOLUTION
═══════════════════════════════════════════════════════════ */
function SlideSolution() {
  return (
    <W>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
      <div className="max-w-5xl w-full">
        <Label>The Solution</Label>
        <H className="text-[clamp(2.5rem,7vw,5.5rem)] text-white mb-4">
          Introducing <Gold>VStock</Gold>
        </H>
        <p className="text-white/50 text-xl mb-10 max-w-2xl leading-relaxed">
          Start with <span className="text-amber-400 font-bold">£10,000</span> virtual cash. Trade live markets. Earn ELO. Copy top traders. Get AI coaching. Collect dividends hourly. Build real financial skills — <span className="text-white font-semibold">with zero real-money risk.</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: '📈', title: 'Real Markets', desc: 'Live stock prices, actual volatility, real-world market dynamics every second.' },
            { icon: '🏆', title: 'Competitive', desc: 'ELO rankings, 6-tier progression, global seasons, and copy trading built in.' },
            { icon: '🤖', title: 'AI-Powered', desc: 'A personal trading coach with live insights, risk analysis, and trade ideas.' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-center hover:border-amber-400/30 transition-colors">
              <div className="text-4xl mb-4">{item.icon}</div>
              <div className="text-white font-bold text-base mb-2">{item.title}</div>
              <div className="text-white/40 text-sm leading-relaxed">{item.desc}</div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { v: '£10,000', l: 'Virtual capital to start' },
            { v: '100+', l: 'Real stocks to trade' },
            { v: '6 tiers', l: 'Bronze → Titan' },
            { v: '24/7', l: 'Dividends ticking' },
          ].map(s => (
            <div key={s.l} className="rounded-xl border border-amber-400/15 bg-amber-400/5 p-3 text-center">
              <div className="text-amber-400 font-black text-lg">{s.v}</div>
              <div className="text-white/35 text-xs mt-1">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </W>
  );
}

/* ═══════════════════════════════════════════════════════════
   SLIDE 4 — HOW IT WORKS
═══════════════════════════════════════════════════════════ */
function SlideHowItWorks() {
  const steps = [
    { n: '01', icon: '💰', title: 'Get £10,000', desc: 'Virtual cash credited instantly. No card. No real money. Just unlimited room to experiment.' },
    { n: '02', icon: '📊', title: 'Trade Live', desc: 'Real prices, instant execution, live market data — indistinguishable from a real broker platform.' },
    { n: '03', icon: '⚡', title: 'Earn ELO', desc: 'Every profitable trade boosts your rating. Every loss is a lesson. Climb from Bronze all the way to Titan.' },
    { n: '04', icon: '🏆', title: 'Learn & Win', desc: "Build skills you keep forever. When you move to real investing — you already know what you're doing." },
  ];
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>How It Works</Label>
        <H className="text-[clamp(2.5rem,7vw,5rem)] text-white mb-12">
          Simple. <Gold>Addictive.</Gold> Powerful.
        </H>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <motion.div key={step.n} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i, duration: 0.6 }}
              className="relative rounded-2xl border border-white/8 bg-white/[0.03] p-6 overflow-hidden">
              <div className="absolute top-3 right-4 text-5xl font-black text-white/5 select-none leading-none">{step.n}</div>
              <div className="text-3xl mb-4">{step.icon}</div>
              <div className="text-white font-bold text-sm mb-2">{step.title}</div>
              <div className="text-white/40 text-xs leading-relaxed">{step.desc}</div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
          className="mt-8 flex items-center justify-center gap-3 text-sm text-white/30">
          <span>Sign up</span>
          <ChevronRight className="w-3 h-3" />
          <span>Get £10,000</span>
          <ChevronRight className="w-3 h-3" />
          <span>Trade</span>
          <ChevronRight className="w-3 h-3" />
          <span>Climb</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-amber-400 font-semibold">Win</span>
        </motion.div>
      </div>
    </W>
  );
}

/* ═══════════════════════════════════════════════════════════
   SLIDE 5 — TRADING DASHBOARD
═══════════════════════════════════════════════════════════ */
function SlideTrading() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>Feature — Live Trading</Label>
        <H className="text-[clamp(2rem,5vw,4rem)] text-white mb-8">
          Real-time <Gold>trading dashboard.</Gold>
        </H>

        {/* Fake browser chrome */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
          {/* Chrome bar */}
          <div className="bg-white/[0.04] border-b border-white/8 px-5 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 bg-white/5 rounded-md px-3 py-1 text-white/20 text-xs font-mono">app.vstock.io/home</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-semibold">Live</span>
            </div>
          </div>

          <div className="bg-[#0d1220] p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left */}
            <div className="space-y-3">
              <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/15 p-4">
                <div className="text-white/40 text-xs mb-1">Total Portfolio Value</div>
                <div className="text-3xl font-black text-white">£14,832.50</div>
                <div className="text-green-400 text-sm font-semibold mt-0.5">+£4,832.50 · +48.3% from start</div>
              </div>
              {[
                { sym: 'AAPL', shares: 12, price: '£173.20', chg: '+1.4%', pos: true },
                { sym: 'NVDA', shares: 3, price: '£482.10', chg: '+3.2%', pos: true },
                { sym: 'TSLA', shares: 5, price: '£214.80', chg: '-0.8%', pos: false },
                { sym: 'AMZN', shares: 8, price: '£155.30', chg: '+2.8%', pos: true },
              ].map(s => (
                <div key={s.sym} className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 px-4 py-2.5">
                  <div>
                    <div className="text-white font-bold text-sm">{s.sym}</div>
                    <div className="text-white/30 text-xs">{s.shares} shares @ {s.price}</div>
                  </div>
                  <div className={`text-sm font-bold ${s.pos ? 'text-green-400' : 'text-red-400'}`}>{s.chg}</div>
                </div>
              ))}
            </div>

            {/* Right */}
            <div className="space-y-3">
              <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 p-4">
                <div className="text-amber-400 font-bold text-sm mb-2">🔍 AI Market Insights</div>
                <div className="space-y-1.5 text-sm text-white/50">
                  <p>• Tech sector +2.4% today — AI names leading the charge</p>
                  <p>• NVDA, AMD, MSFT all breaking key resistance levels</p>
                  <p>• Dividend season approaching — high yields incoming</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Cash Available', val: '£2,400.00' },
                  { label: 'Day P/L', val: '+£342.00' },
                  { label: 'Holdings', val: '28 stocks' },
                  { label: 'Sectors', val: '8 diversified' },
                ].map(s => (
                  <div key={s.label} className="rounded-lg bg-white/[0.03] border border-white/5 p-3 text-center">
                    <div className="text-white/35 text-xs">{s.label}</div>
                    <div className="text-white font-bold text-sm mt-1">{s.val}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
                <div className="text-white/40 text-xs mb-2">Quick Trade</div>
                <div className="flex gap-2">
                  <div className="flex-1 rounded-lg bg-white/5 border border-white/8 px-3 py-2 text-white/40 text-xs">AAPL — £173.20</div>
                  <div className="px-4 py-2 rounded-lg bg-amber-400 text-black text-xs font-black">Buy</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </W>
  );
}

/* ═══════════════════════════════════════════════════════════
   SLIDE 6 — PORTFOLIO
═══════════════════════════════════════════════════════════ */
function SlidePortfolio() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>Feature — Portfolio Analytics</Label>
        <H className="text-[clamp(2rem,5vw,4rem)] text-white mb-8">
          Deep <Gold>performance tracking.</Gold>
        </H>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
          <div className="bg-white/[0.04] border-b border-white/8 px-5 py-3 flex items-center justify-between">
            <span className="text-white font-bold text-sm flex items-center gap-2"><BarChart2 className="w-4 h-4 text-amber-400" /> Portfolio</span>
            <Pill>Season 4 · April 2026</Pill>
          </div>

          <div className="bg-[#0d1220] p-5">
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Total Value', val: '£14,832', color: 'text-white' },
                { label: 'Today Return', val: '+£342 (+2.4%)', color: 'text-green-400' },
                { label: 'Best Position', val: 'AMZN +21.3%', color: 'text-green-400' },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-white/6 bg-white/[0.03] p-4">
                  <div className="text-white/35 text-xs mb-1">{s.label}</div>
                  <div className={`text-lg font-black ${s.color}`}>{s.val}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {[
                { sym: 'AAPL', shares: 12, buy: '£152.00', curr: '£173.20', pct: '+13.9%', gain: '+£254.40', pos: true },
                { sym: 'MSFT', shares: 6, buy: '£320.00', curr: '£378.50', pct: '+18.3%', gain: '+£351.00', pos: true },
                { sym: 'TSLA', shares: 5, buy: '£240.00', curr: '£214.80', pct: '-10.5%', gain: '-£126.00', pos: false },
                { sym: 'AMZN', shares: 8, buy: '£128.00', curr: '£155.30', pct: '+21.3%', gain: '+£218.40', pos: true },
              ].map((h, i) => (
                <motion.div key={h.sym} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.07 }}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                  <div>
                    <div className="text-white font-bold text-sm">{h.sym}</div>
                    <div className="text-white/30 text-xs">{h.shares} shares · avg {h.buy}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/60 text-xs">{h.buy} → {h.curr}</div>
                    <div className={`font-black text-sm ${h.pos ? 'text-green-400' : 'text-red-400'}`}>{h.pct} · {h.gain}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </W>
  );
}

/* ═══════════════════════════════════════════════════════════
   SLIDE 7 — LEADERBOARD
═══════════════════════════════════════════════════════════ */
function SlideLeaderboard() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>Feature — Global Leaderboard</Label>
        <H className="text-[clamp(2rem,5vw,4rem)] text-white mb-8">
          Compete with <Gold>the world.</Gold>
        </H>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="bg-white/[0.04] border-b border-white/8 px-5 py-3 flex items-center justify-between">
              <span className="text-white font-bold text-sm flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-400" /> Global Rankings</span>
              <span className="text-white/30 text-xs">Season 4</span>
            </div>
            <div className="bg-[#0d1220] p-4 space-y-2">
              {[
                { rank: 1, medal: '🥇', name: 'AlphaTrader', tier: 'Titan', val: '£34,821', pct: '+248%' },
                { rank: 2, medal: '🥈', name: 'BullRunner99', tier: 'Diamond', val: '£28,440', pct: '+184%' },
                { rank: 3, medal: '🥉', name: 'StockWizard', tier: 'Platinum', val: '£22,100', pct: '+121%' },
                { rank: 4, medal: '#4', name: 'DipHunter', tier: 'Gold', val: '£18,350', pct: '+83%' },
                { rank: 5, medal: '#5', name: 'You', tier: 'Silver', val: '£14,832', pct: '+48%', isMe: true },
              ].map((t) => (
                <div key={t.rank} className={`flex items-center justify-between rounded-xl px-4 py-3 ${t.isMe ? 'border border-amber-400/30 bg-amber-400/8' : 'border border-white/5 bg-white/[0.02]'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-base w-6 text-center">{t.medal}</span>
                    <div>
                      <div className={`font-bold text-sm ${t.isMe ? 'text-amber-400' : 'text-white'}`}>{t.name}{t.isMe && ' (You)'}</div>
                      <div className="text-white/30 text-xs">{t.tier}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-xs font-bold">{t.val}</div>
                    <div className="text-green-400 text-xs">{t.pct}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
            className="space-y-3">
            <div className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">🎖 Tier System</div>
            {[
              { tier: 'Bronze', ico: '🥉', elo: '0 – 1,200', col: 'border-orange-700/30 bg-orange-900/10' },
              { tier: 'Silver', ico: '🥈', elo: '1,200 – 1,400', col: 'border-slate-500/30 bg-slate-800/20' },
              { tier: 'Gold', ico: '🥇', elo: '1,400 – 1,600', col: 'border-amber-600/30 bg-amber-900/10' },
              { tier: 'Platinum', ico: '⚡', elo: '1,600 – 1,800', col: 'border-blue-500/30 bg-blue-900/10' },
              { tier: 'Diamond', ico: '💎', elo: '1,800 – 2,000', col: 'border-cyan-400/30 bg-cyan-900/10' },
              { tier: 'Titan', ico: '🏆', elo: '2,000+', col: 'border-purple-400/30 bg-purple-900/10' },
            ].map((t, i) => (
              <motion.div key={t.tier} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07 }}
                className={`flex items-center justify-between rounded-xl border px-4 py-2.5 ${t.col}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{t.ico}</span>
                  <span className="text-white font-bold text-sm">{t.tier}</span>
                </div>
                <span className="text-white/35 text-xs font-mono">{t.elo} ELO</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </W>
  );
}

/* ═══════════════════════════════════════════════════════════
   SLIDE 8 — COPY TRADING
═══════════════════════════════════════════════════════════ */
function SlideCopyTrading() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>Feature — Copy Trading</Label>
        <H className="text-[clamp(2rem,5vw,4rem)] text-white mb-8">
          Follow top traders <Gold>automatically.</Gold>
        </H>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="bg-white/[0.04] border-b border-white/8 px-5 py-3 flex items-center gap-2">
              <Copy className="w-4 h-4 text-amber-400" />
              <span className="text-white font-bold text-sm">Active Copy Trades</span>
            </div>
            <div className="bg-[#0d1220] p-5 space-y-4">
              {[
                { trader: 'AlphaTrader', alloc: '£3,000', ret: '+£742', pct: '+24.7%' },
                { trader: 'BullRunner99', alloc: '£2,500', ret: '+£460', pct: '+18.4%' },
              ].map(ct => (
                <div key={ct.trader} className="rounded-xl border border-amber-400/15 bg-amber-400/5 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-white font-bold text-sm">{ct.trader}</div>
                      <div className="text-white/35 text-xs">Allocated: {ct.alloc}</div>
                    </div>
                    <Pill>Copying ✓</Pill>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Return</span>
                    <span className="text-green-400 font-black">{ct.ret} ({ct.pct})</span>
                  </div>
                </div>
              ))}
              <div className="text-white/25 text-xs border-t border-white/5 pt-4">
                Mirrors their buys & sells proportionally. No extra fees. Cancel anytime.
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            {[
              { n: '01', title: 'Browse Leaders', desc: 'Find top traders by return, win-rate, tier, and strategy style — all publicly ranked.' },
              { n: '02', title: 'Allocate Capital', desc: 'Choose how much to copy — from £500 to £5,000 per leader per season.' },
              { n: '03', title: 'Auto-Mirror', desc: 'Their trades execute on your account proportionally, in real time, automatically.' },
              { n: '04', title: 'Track P&L', desc: 'Live dashboard shows every copy-trade position, return, and exit performance.' },
            ].map((item, i) => (
              <motion.div key={item.n} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 * i }}
                className="flex gap-4 rounded-xl border border-white/7 bg-white/[0.02] p-4">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-black font-black flex items-center justify-center shrink-0 text-xs">{item.n}</div>
                <div>
                  <div className="text-white font-bold text-sm">{item.title}</div>
                  <div className="text-white/40 text-xs mt-0.5 leading-relaxed">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </W>
  );
}

/* ═══════════════════════════════════════════════════════════
   SLIDE 9 — AI COACH
═══════════════════════════════════════════════════════════ */
function SlideAI() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>Feature — AI Trading Coach</Label>
        <H className="text-[clamp(2rem,5vw,4rem)] text-white mb-8">
          Your personal <Gold>trading advisor.</Gold>
        </H>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="bg-white/[0.04] border-b border-white/8 px-5 py-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-amber-400" />
              <span className="text-white font-bold text-sm">VStock AI Coach</span>
              <span className="ml-auto text-green-400 text-xs flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" /> Online</span>
            </div>
            <div className="bg-[#0d1220] p-5 space-y-3">
              {[
                { user: true, msg: 'Should I buy NVDA right now?' },
                { user: false, msg: 'NVDA RSI at 62 — bullish momentum confirmed. AI chip demand remains structurally strong. Recommend 15 shares at £482. Set stop at £455.' },
                { user: true, msg: "What's my biggest risk right now?" },
                { user: false, msg: 'Beta 1.4, 73% in tech. Over-concentrated. Rotate 15% into defensive plays — JNJ, PG — to reduce sector exposure.' },
              ].map((m, i) => (
                <div key={i} className={`flex ${m.user ? 'justify-end' : 'gap-2'}`}>
                  {!m.user && <Brain className="w-5 h-5 text-amber-400 shrink-0 mt-1" />}
                  <div className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-sm leading-relaxed ${m.user ? 'bg-white/10 text-white rounded-tr-sm' : 'bg-amber-400/8 border border-amber-400/15 text-white/75 rounded-tl-sm'}`}>
                    {m.msg}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="space-y-2">
            {[
              { icon: '📊', t: 'Market Analysis', d: 'Real-time sentiment across stocks, sectors, and macro themes' },
              { icon: '🎯', t: 'Trade Ideas', d: 'Actionable buy/sell signals with price targets and stop levels' },
              { icon: '⚠️', t: 'Risk Alerts', d: 'Flags over-concentration, volatility spikes, and sector exposure' },
              { icon: '📚', t: 'Education', d: 'RSI, MACD, P/E — explained in plain, jargon-free English, instantly' },
              { icon: '🔍', t: 'Technical Analysis', d: 'EMA, Bollinger Bands, momentum — all interpreted for you' },
              { icon: '⚖️', t: 'Portfolio Optimisation', d: 'Rebalancing suggestions tailored to your risk tolerance' },
            ].map((item, i) => (
              <motion.div key={item.t} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
                className="flex gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3">
                <span className="text-lg">{item.icon}</span>
                <div>
                  <div className="text-white font-bold text-xs">{item.t}</div>
                  <div className="text-white/35 text-xs mt-0.5">{item.d}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </W>
  );
}

/* ═══════════════════════════════════════════════════════════
   SLIDE 10 — DIVIDENDS
═══════════════════════════════════════════════════════════ */
function SlideDividends() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>Feature — Hourly Dividends</Label>
        <H className="text-[clamp(2rem,5vw,4rem)] text-white mb-8">
          Passive income <Gold>every single hour.</Gold>
        </H>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { sym: 'ABPF', yield: '0.08%/hr', holding: '£5,000', hrly: '+£4.00', icon: '🏦' },
                { sym: 'JNJ', yield: '0.04%/hr', holding: '£3,500', hrly: '+£1.40', icon: '💊' },
                { sym: 'T', yield: '0.06%/hr', holding: '£2,800', hrly: '+£1.68', icon: '📡' },
                { sym: 'VZ', yield: '0.05%/hr', holding: '£2,200', hrly: '+£1.10', icon: '📶' },
              ].map((d, i) => (
                <motion.div key={d.sym} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.08 }}
                  className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                  <div className="text-3xl mb-2">{d.icon}</div>
                  <div className="text-white font-black text-base">{d.sym}</div>
                  <div className="text-emerald-400 font-bold text-xs mt-1">{d.yield}</div>
                  <div className="text-white/30 text-xs mt-0.5">{d.holding}</div>
                  <div className="text-emerald-300 font-black text-xs mt-1.5">{d.hrly}/hr</div>
                </motion.div>
              ))}
            </div>

            <div className="rounded-xl border border-white/6 bg-white/[0.02] p-4 text-sm">
              <div className="text-white/50 font-semibold mb-3">Why Dividends?</div>
              <div className="space-y-2 text-white/35 text-xs">
                <p>✓ Teaches passive income and compound growth in practice</p>
                <p>✓ Rewards long-term holding — discourages frantic day-trading</p>
                <p>✓ Creates daily check-in habit — users return to see earnings</p>
                <p>✓ Mirrors real-world yield vs growth investment trade-offs</p>
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6 flex flex-col justify-between">
            <div>
              <div className="text-emerald-400 font-bold text-sm mb-4">💰 Dividend Income Tracker</div>
              <div className="space-y-4">
                {[
                  { label: 'Today (24 hrs)', val: '+£96.00' },
                  { label: 'This Week', val: '+£672.00' },
                  { label: 'This Month', val: '+£2,880.00' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-baseline border-b border-emerald-400/10 pb-3">
                    <span className="text-white/40 text-sm">{r.label}</span>
                    <span className="text-emerald-400 font-bold text-lg">{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-emerald-400/15">
              <div className="text-white/35 text-xs mb-1">Annual Projected</div>
              <div className="text-emerald-300 font-black text-4xl">+£34,560</div>
              <div className="text-white/20 text-xs mt-1">based on current holdings & yields</div>
            </div>
          </motion.div>
        </div>
      </div>
    </W>
  );
}

/* ═══════════════════════════════════════════════════════════
   SLIDE 11 — SOCIAL
═══════════════════════════════════════════════════════════ */
function SlideSocial() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>Feature — Social & Community</Label>
        <H className="text-[clamp(2rem,5vw,4rem)] text-white mb-8">
          Trading is better <Gold>together.</Gold>
        </H>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="bg-white/[0.04] border-b border-white/8 px-5 py-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span className="text-white font-bold text-sm">Community Feed</span>
            </div>
            <div className="bg-[#0d1220] p-4 space-y-3">
              {[
                { user: 'AlphaTrader', msg: '🎉 Just crossed +£1,000 profit! NVDA was the one. Held through the dip — worth it.', time: '2m ago', likes: 47 },
                { user: 'BullRunner99', msg: '📈 NVDA +3.2% today. AI boom is only getting started — loaded up at open.', time: '15m ago', likes: 23 },
                { user: 'DipHunter', msg: '🎯 Caught the TSLA dip at -10% and rode it all the way back. Diamond hands win.', time: '45m ago', likes: 156 },
              ].map((p, i) => (
                <div key={i} className="rounded-xl border border-white/6 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 font-black text-xs">{p.user[0]}</div>
                      <span className="text-white font-bold text-xs">{p.user}</span>
                    </div>
                    <span className="text-white/25 text-xs">{p.time}</span>
                  </div>
                  <p className="text-white/55 text-sm leading-relaxed mb-2">{p.msg}</p>
                  <div className="flex gap-4 text-xs text-white/25">
                    <span>❤️ {p.likes}</span>
                    <span>💬 Reply</span>
                    <span>📋 Copy Trade</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="space-y-2.5">
            {[
              { icon: '📣', t: 'Trade Posts', d: 'Share wins, strategies, and market insights — build your reputation publicly' },
              { icon: '👥', t: 'Trader Profiles', d: 'Public profiles with full portfolio history, stats, and badges on display' },
              { icon: '❤️', t: 'Likes & Reactions', d: 'Community celebrates great trades — social proof builds engagement naturally' },
              { icon: '👤', t: 'Follow Traders', d: 'Stay close to top performers and friends — get notified on their big trades' },
              { icon: '📊', t: 'Copy Profiles', d: "Replicate any trader's full strategy directly from their public profile page" },
              { icon: '🏆', t: 'Leaderboard', d: 'Filter by school, city, friend group — compete at every level' },
            ].map((item, i) => (
              <motion.div key={item.t} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i }}
                className="flex gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <div className="text-white font-bold text-xs">{item.t}</div>
                  <div className="text-white/35 text-xs mt-0.5">{item.d}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </W>
  );
}

/* ═══════════════════════════════════════════════════════════
   SLIDE 12 — GAMIFICATION
═══════════════════════════════════════════════════════════ */
function SlideGamification() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>Feature — Gamification</Label>
        <H className="text-[clamp(2rem,5vw,4rem)] text-white mb-8">
          Hooks that keep users <Gold>coming back daily.</Gold>
        </H>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            {[
              { e: '🥇', t: 'Achievements', d: 'First Trade, Diamond Hands, Dip Hunter, Dividend King — 11 unique badges to unlock and display.' },
              { e: '🔥', t: 'Daily Streaks', d: 'Login streaks and daily challenges that reward consistency — just like the top fitness apps.' },
              { e: '⚡', t: 'Weekly Missions', d: 'Rotating objectives with virtual rewards — fresh challenge every single week.' },
              { e: '📊', t: 'Seasonal Resets', d: 'Brand-new leaderboards every month — everyone starts equal, everyone has a shot.' },
              { e: '🎯', t: 'Collectible Badges', d: 'Rare, unique badges displayed on public profiles — a genuine social status symbol.' },
              { e: '👑', t: 'Hall of Fame', d: 'Top 10 traders each season enter the permanent Hall of Fame — immortalised forever.' },
            ].map((item, i) => (
              <motion.div key={item.t} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.07 * i }}
                className="flex gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3">
                <span className="text-xl">{item.e}</span>
                <div>
                  <div className="text-white font-bold text-xs">{item.t}</div>
                  <div className="text-white/35 text-xs mt-0.5 leading-relaxed">{item.d}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}
            className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-900/30 to-transparent flex flex-col items-center justify-center p-8 text-center gap-4">
            <div className="text-7xl font-black text-amber-400 leading-none">5×</div>
            <div className="text-white font-black text-xl">More Daily Sessions</div>
            <div className="text-white/35 text-sm">vs non-gamified finance apps</div>
            <div className="w-full border-t border-white/8 pt-4 space-y-2.5 text-sm text-white/45">
              <p>📈 Proven mobile game psychology drives daily habit</p>
              <p>🎮 Reward loops reduce churn by over 60%</p>
              <p>⚙️ Compounding engagement — stronger every week</p>
              <p>🧠 Intrinsic motivation through progress & competition</p>
            </div>
          </motion.div>
        </div>
      </div>
    </W>
  );
}

/* ═══════════════════════════════════════════════════════════
   SLIDE 13 — MONEY-CONFIDENT GENERATION
═══════════════════════════════════════════════════════════ */
function SlideMoneyConfident() {
  return (
    <W>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%)' }} />
      </div>
      <div className="max-w-5xl w-full relative z-10">
        <Label>Our Mission</Label>
        <H className="text-[clamp(2rem,6vw,4.5rem)] text-white mb-4 max-w-4xl">
          Growing a <Gold>money-confident</Gold> generation.
        </H>
        <p className="text-white/45 text-lg mb-10 max-w-3xl leading-relaxed">
          Financial anxiety is an epidemic. <span className="text-white font-semibold">72% of 18–35 year olds</span> say money is their biggest stress — yet fewer than 1 in 5 received any financial education at school. VStock changes that.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: '🧠', title: 'Knowledge Without Risk', desc: 'Users learn compound interest, diversification, dividends, and market cycles — through doing, not theory.' },
            { icon: '💪', title: 'Confidence Through Practice', desc: 'After 30 days on VStock, users report 3× more confidence making real financial decisions — savings, ISAs, pensions.' },
            { icon: '🌱', title: 'Habits That Last Forever', desc: 'Daily streaks and portfolio check-ins build the exact habits that distinguish wealthy investors from the rest.' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.12 }}
              className="rounded-2xl border border-amber-400/15 bg-amber-400/5 p-5">
              <div className="text-4xl mb-3">{item.icon}</div>
              <div className="text-white font-bold text-sm mb-2">{item.title}</div>
              <div className="text-white/40 text-sm leading-relaxed">{item.desc}</div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { v: '£0', l: 'Real money to start' },
            { v: '30 days', l: 'To feel financially confident' },
            { v: '18M+', l: 'UK adults with no investments' },
            { v: '3×', l: 'Confidence boost after month 1' },
          ].map(s => (
            <div key={s.v} className="rounded-xl border border-amber-400/20 bg-amber-400/8 p-4 text-center">
              <div className="text-2xl font-black text-amber-400">{s.v}</div>
              <div className="text-white/35 text-xs mt-1.5 leading-snug">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </W>
  );
}

/* ═══════════════════════════════════════════════════════════
   SLIDE 14 — BUSINESS MODEL
═══════════════════════════════════════════════════════════ */
function SlideBusinessModel() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>Business Model</Label>
        <H className="text-[clamp(2rem,6vw,4.5rem)] text-white mb-8">
          Four clear <Gold>revenue streams.</Gold>
        </H>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            { icon: '💳', title: 'VStock Pro', sub: '£9.99 / month', desc: 'Advanced charts, AI coaching priority, ad-free experience, and early season access.' },
            { icon: '🏫', title: 'B2B Licences', sub: 'Schools & Universities', desc: 'White-label platform with bespoke curricula, analytics dashboard, and dedicated support.' },
            { icon: '🏆', title: 'Premium Tournaments', sub: 'Seasonal Events', desc: 'Invite-only competitions with real prize pools, sponsor branding, and press coverage.' },
            { icon: '🤝', title: 'Brokerage Referrals', sub: 'Revenue-Share', desc: 'Bridge confident users to real regulated trading accounts — a natural next step.' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 flex gap-4">
              <span className="text-3xl">{item.icon}</span>
              <div>
                <div className="text-white font-bold text-sm">{item.title}</div>
                <div className="text-amber-400/70 text-xs font-semibold mb-1">{item.sub}</div>
                <div className="text-white/40 text-xs leading-relaxed">{item.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="rounded-2xl border border-amber-400/25 bg-amber-400/8 p-6">
          <div className="text-center mb-4">
            <div className="text-amber-400 font-black text-xl">10,000 free users → 1,500 Pro → £180,000 ARR</div>
            <div className="text-white/35 text-sm mt-1">Conservative 15% conversion · industry benchmark is 10–20%</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { v: '£180K', l: 'Year 1 ARR', sub: 'Conservative baseline' },
              { v: '£1.2M', l: 'Year 2 ARR', sub: '10× user growth' },
              { v: '£8M+', l: 'Year 3 ARR', sub: 'B2B + referrals scale' },
            ].map(s => (
              <div key={s.v} className="text-center rounded-xl border border-amber-400/15 bg-amber-400/5 p-3">
                <div className="text-amber-300 font-black text-xl">{s.v}</div>
                <div className="text-white/60 text-xs font-bold mt-0.5">{s.l}</div>
                <div className="text-white/25 text-xs">{s.sub}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </W>
  );
}

/* ═══════════════════════════════════════════════════════════
   SLIDE 15 — VISION
═══════════════════════════════════════════════════════════ */
function SlideVision() {
  return (
    <W>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 60%)' }} />
      </div>
      <div className="max-w-4xl w-full relative z-10">
        <Label>Vision · 2026 – 2030</Label>
        <H className="text-[clamp(2.5rem,7vw,5.5rem)] text-white mb-5">
          Democratising <br /><Gold>financial literacy</Gold><br /> globally.
        </H>
        <p className="text-white/40 text-xl mb-12 max-w-2xl leading-relaxed">
          Making investing fun, social, and risk-free — so the next generation builds real skills, real confidence, and real wealth before they ever touch real money.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: '🌍', title: '1M Users by 2027', desc: '15+ countries via school partnerships, broker deals, and organic virality' },
            { icon: '📈', title: 'Category Leader', desc: '#1 virtual trading education platform globally — the Duolingo of finance' },
            { icon: '🌉', title: 'The Real Bridge', desc: 'A direct, trusted pipeline from simulated learning to real brokerage accounts' },
          ].map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 + i * 0.12 }}
              className="rounded-2xl border border-amber-400/15 bg-amber-400/5 p-6 text-center">
              <div className="text-4xl mb-3">{v.icon}</div>
              <div className="text-white font-bold text-sm mb-2">{v.title}</div>
              <div className="text-white/40 text-xs leading-relaxed">{v.desc}</div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
          className="flex flex-wrap gap-3 justify-center">
          {['Duolingo for Finance', 'School Curricula', 'B2C + B2B', 'Brokerage Pipeline', '15+ Countries', 'Hall of Fame'].map(tag => (
            <span key={tag} className="text-xs border border-white/10 text-white/40 rounded-full px-4 py-1.5">{tag}</span>
          ))}
        </motion.div>
      </div>
    </W>
  );
}

/* ═══════════════════════════════════════════════════════════
   SLIDE 16 — CTA
═══════════════════════════════════════════════════════════ */
function SlideCTA() {
  return (
    <W className="text-center">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.14) 0%, transparent 60%)' }} />
      </div>

      <motion.div initial={{ scale: 0.6, opacity: 0, rotate: 6 }} animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-20 h-20 md:w-28 md:h-28 rounded-[22px] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/50 mb-8 relative z-10">
        <TrendingUp className="w-10 h-10 md:w-14 md:h-14 text-black" />
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="text-[clamp(5rem,18vw,13rem)] font-black tracking-tighter leading-none relative z-10 mb-4">
        <span className="text-white">V</span><span className="text-amber-400">Stock</span>
      </motion.h1>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
        className="text-white/40 text-lg md:text-xl mb-2 relative z-10">The future of learning to invest.</motion.p>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="text-white/25 text-sm md:text-base mb-10 relative z-10 font-medium tracking-wide">
        Zero Risk · Real Skills · Real Confidence · Compete with the World
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
        className="flex flex-col sm:flex-row gap-4 relative z-10 mb-10">
        <a href="/Home"
          className="flex items-center justify-center gap-2 px-10 py-4 bg-amber-400 hover:bg-amber-300 rounded-2xl text-black font-black text-lg transition-all shadow-xl shadow-amber-500/30">
          Try VStock Free <ArrowRight className="w-5 h-5" />
        </a>
        <div className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/10 bg-white/5 text-white font-semibold text-sm backdrop-blur">
          <Wallet className="w-4 h-4 text-amber-400" />
          <span>£10,000 virtual · No card required</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
        className="flex gap-8 relative z-10">
        {[{ v: '£0', l: 'to start' }, { v: '6 tiers', l: 'to climb' }, { v: 'AI coach', l: 'included' }, { v: '24/7', l: 'dividends' }].map(s => (
          <div key={s.l} className="text-center">
            <div className="text-amber-400 font-black text-sm">{s.v}</div>
            <div className="text-white/20 text-xs">{s.l}</div>
          </div>
        ))}
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
        className="absolute bottom-16 text-white/10 text-[10px] tracking-[0.3em] font-mono">
        VSTOCK · GROWING A MONEY-CONFIDENT GENERATION · 2026
      </motion.p>
    </W>
  );
}