import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ChevronLeft, ChevronRight, ArrowRight, Brain, Copy, Wallet, BarChart2, Trophy, Users, Zap, Globe, Target, Rocket, Map, Star, Shield, DollarSign } from 'lucide-react';

const TOTAL_SLIDES = 20;

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
    SlideHero, SlideProblem, SlideSolution, SlideMarketSize,
    SlideHowItWorks, SlideTrading, SlidePortfolio, SlideLeaderboard,
    SlideCopyTrading, SlideAI, SlideDividends, SlideSocial,
    SlideGamification, SlideAppScreenshots, SlideMoneyConfident,
    SlideTraction, SlideBusinessModel, SlideRoadmap, SlideVision, SlideCTA,
  ];
  const SlideComp = slides[current];

  return (
    <div className="fixed inset-0 bg-[#060810] text-white overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
      }} />

      {/* Subtle ambient grid */}
      <div className="absolute inset-0 opacity-[0.008]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
        backgroundSize: '100px 100px'
      }} />

      {/* Liquid glass orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, rgba(251,191,36,0.08) 40%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.06) 45%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute top-[40%] right-[15%] w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 65%)', filter: 'blur(50px)' }} />
      </div>

      {/* Top progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-3" style={{ backdropFilter: 'blur(12px)' }}>
        <div className="flex gap-0.5">
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className="flex-1 h-[3px] rounded-full transition-all duration-500 overflow-hidden"
              style={{ background: i < current ? 'rgba(245,158,11,0.35)' : i === current ? '' : 'rgba(255,255,255,0.05)' }}>
              {i === current && (
                <div className="h-full bg-amber-400/90 rounded-full" style={{ width: '100%' }} />
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
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, y: -16, transition: { duration: 0.28 } }}
          className="w-full h-full">
          <SlideComp />
        </motion.div>
      </AnimatePresence>

      {/* Bottom nav — liquid glass */}
      <div className="fixed bottom-5 left-0 right-0 flex items-center justify-center gap-4 z-50">
        <button onClick={prev} disabled={current === 0}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-15 text-white/40 hover:text-amber-400"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex gap-1.5 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}>
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-400 ${i === current ? 'w-4 h-1.5' : 'w-1.5 h-1.5 hover:opacity-60'}`}
              style={{ background: i === current ? 'rgba(245,158,11,0.85)' : 'rgba(255,255,255,0.18)' }} />
          ))}
        </div>
        <button onClick={next} disabled={current === TOTAL_SLIDES - 1}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-15 text-white/40 hover:text-amber-400"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ── SHARED PRIMITIVES ─────────────────────────────────── */
const W = ({ children, className = '' }) => (
  <div className={`w-full h-full flex flex-col items-center justify-center px-8 md:px-20 py-20 relative ${className}`}>
    {children}
  </div>
);
const Label = ({ children, color = 'amber' }) => (
  <span className={`inline-block text-[10px] font-black tracking-[0.28em] uppercase mb-4 ${color === 'amber' ? 'text-amber-400/90' : 'text-blue-400/90'}`}>{children}</span>
);
const H = ({ children, className = '' }) => (
  <h2 className={`font-black leading-[0.92] tracking-tight ${className}`}>{children}</h2>
);
const Gold = ({ children }) => <span className="text-amber-400">{children}</span>;
const Red = ({ children }) => <span className="text-red-400">{children}</span>;
const Green = ({ children }) => <span className="text-emerald-400">{children}</span>;

const GlowCard = ({ children, className = '', color = 'white' }) => {
  const border = color === 'amber' ? 'border-amber-500/15' : color === 'red' ? 'border-red-500/10' : color === 'green' ? 'border-emerald-500/15' : 'border-white/[0.03]';
  const bg = color === 'amber' ? 'bg-amber-500/[0.04]' : color === 'red' ? 'bg-red-500/[0.04]' : color === 'green' ? 'bg-emerald-500/[0.04]' : 'bg-white/[0.02]';
  return (
    <div className={`rounded-2xl border ${border} ${bg} backdrop-blur-xl ${className}`} style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.3)' }}>
      {children}
    </div>
  );
};

const StatPill = ({ value, label, i = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
    className="rounded-xl border border-amber-400/20 bg-amber-400/8 px-4 py-3 text-center">
    <div className="text-amber-400 font-black text-xl leading-none">{value}</div>
    <div className="text-white/35 text-xs mt-1.5 leading-snug">{label}</div>
  </motion.div>
);

const Tag = ({ children }) => (
  <span className="text-[10px] border border-white/[0.06] text-white/35 rounded-full px-3 py-1 font-medium">{children}</span>
);

/* ── SLIDE 1: HERO ─────────────────────────────────────── */
function SlideHero() {
  return (
    <W className="text-center">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 60%)' }} />
      </div>

      <motion.div initial={{ scale: 0.5, opacity: 0, rotate: -8 }} animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ delay: 0.05, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="w-24 h-24 md:w-28 md:h-28 rounded-[26px] bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/50 mb-8 relative z-10">
        <TrendingUp className="w-12 h-12 md:w-14 md:h-14 text-black" strokeWidth={2.5} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.75 }}
        className="relative z-10 mb-6">
        <h1 className="text-[clamp(5.5rem,20vw,16rem)] font-black tracking-tighter leading-none">
          <span className="text-white">V</span><span className="text-amber-400">Stock</span>
        </h1>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
        className="text-white/35 text-sm md:text-base font-semibold tracking-[0.22em] uppercase mb-6 relative z-10">
        Virtual Trading · Real Skills · Zero Risk
      </motion.p>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="text-white/50 text-lg md:text-xl max-w-lg leading-relaxed relative z-10 mb-12">
        The gamified investment platform building the <span className="text-white font-semibold">next generation of confident investors</span> — before they ever risk real money.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
        className="flex gap-4 md:gap-8 relative z-10">
        {[
          { v: '£10,000', l: 'virtual start capital' },
          { v: '6 tiers', l: 'Bronze → Titan' },
          { v: 'AI coach', l: 'built in, always on' },
          { v: '24/7', l: 'dividends ticking' },
        ].map((s, i) => (
          <motion.div key={s.l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 + i * 0.07 }}
            className="text-center">
            <div className="text-white font-black text-sm md:text-base">{s.v}</div>
            <div className="text-white/25 text-xs">{s.l}</div>
          </motion.div>
        ))}
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
        className="absolute bottom-16 text-white/10 text-[10px] tracking-[0.3em] font-mono">
        20-SLIDE INVESTOR DECK · 2026
      </motion.p>
    </W>
  );
}

/* ── SLIDE 2: PROBLEM ──────────────────────────────────── */
function SlideProblem() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>The Problem</Label>
        <H className="text-[clamp(2.5rem,7vw,5.5rem)] text-white mb-4">
          Financial education is <Red>broken.</Red>
        </H>
        <p className="text-white/40 text-lg mb-10 max-w-2xl leading-relaxed">
          Over <span className="text-white font-bold">18 million young adults</span> in the UK have no investments, no financial knowledge, and no safe place to learn — by the time they try, it costs them dearly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            { icon: '💸', n: '80%', label: 'lose money in Year 1', desc: 'First-time traders blow their entire capital and never return to the markets again. The confidence is destroyed permanently.', col: 'border-red-500/20 bg-red-500/5' },
            { icon: '📚', n: '1 in 5', label: 'received financial education', desc: 'Millions avoid investing entirely due to fear — schools teach algebra and history, not compound interest or portfolio risk.', col: 'border-orange-500/20 bg-orange-500/5' },
            { icon: '🎓', n: '£0', label: 'spent teaching investing in schools', desc: 'The UK national curriculum has zero mandatory financial literacy. The gap between rich and poor widens — knowledge is the divide.', col: 'border-yellow-500/20 bg-yellow-500/5' },
          ].map((item, i) => (
            <motion.div key={item.n} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.1 }}
              className={`rounded-2xl border ${item.col} p-6`}>
              <div className="text-4xl mb-4">{item.icon}</div>
              <div className="text-3xl font-black text-white mb-1">{item.n}</div>
              <div className="text-white/50 text-xs uppercase tracking-widest font-bold mb-3">{item.label}</div>
              <div className="text-white/35 text-sm leading-relaxed">{item.desc}</div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="rounded-xl border border-red-400/20 bg-gradient-to-r from-red-500/10 to-transparent px-6 py-4 flex items-center gap-4">
          <span className="text-3xl">🚨</span>
          <div>
            <p className="text-white font-bold">The system is broken.</p>
            <p className="text-white/40 text-sm">Young people are set up to fail. VStock is the fix — learn to invest before you invest to learn.</p>
          </div>
        </motion.div>
      </div>
    </W>
  );
}

/* ── SLIDE 3: SOLUTION ─────────────────────────────────── */
function SlideSolution() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>The Solution</Label>
        <H className="text-[clamp(2.5rem,7vw,5rem)] text-white mb-4">
          Introducing <Gold>VStock</Gold>
        </H>
        <p className="text-white/45 text-xl mb-10 max-w-2xl leading-relaxed">
          Start with <span className="text-amber-400 font-black">£10,000</span> virtual cash. Trade live markets. Earn ELO. Copy top traders. Get AI coaching. Build real financial skills — <span className="text-white font-semibold">with zero real-money risk.</span>
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '📈', title: 'Real Markets', desc: 'Live prices, real volatility, genuine dynamics' },
            { icon: '🏆', title: 'Competitive', desc: 'ELO rankings, 6-tier progression, global seasons' },
            { icon: '🤖', title: 'AI-Powered', desc: 'Personal coach with live trade insights & ideas' },
            { icon: '💰', title: 'Dividends', desc: 'Passive income ticking every single hour' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.09 }}
              className="rounded-2xl border border-amber-400/15 bg-amber-400/5 p-5 text-center hover:border-amber-400/35 transition-colors">
              <div className="text-4xl mb-3">{item.icon}</div>
              <div className="text-white font-bold text-sm mb-1.5">{item.title}</div>
              <div className="text-white/35 text-xs leading-relaxed">{item.desc}</div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { v: '£10,000', l: 'Virtual capital' },
            { v: '100+', l: 'Real stocks' },
            { v: '6 tiers', l: 'Bronze → Titan' },
            { v: '24/7', l: 'Always earning' },
          ].map((s, i) => <StatPill key={s.l} value={s.v} label={s.l} i={i} />)}
        </motion.div>
      </div>
    </W>
  );
}

/* ── SLIDE 4: MARKET SIZE ───────────────────────────────── */
function SlideMarketSize() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>Market Opportunity</Label>
        <H className="text-[clamp(2rem,6vw,4.5rem)] text-white mb-4">
          A <Gold>massive</Gold> and untapped market.
        </H>
        <p className="text-white/40 text-lg mb-10 max-w-2xl leading-relaxed">
          Financial literacy is the fastest-growing EdTech vertical globally. VStock sits at the intersection of FinTech, EdTech, and Gaming — three of the most explosive sectors of the decade.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            { label: 'TAM', sub: 'Total Addressable Market', val: '$850B', desc: 'Global FinTech education & investment app market by 2030', color: 'border-amber-400/20 bg-amber-400/5', textColor: 'text-amber-400' },
            { label: 'SAM', sub: 'Serviceable Market', val: '$42B', desc: 'UK + EU gamified finance apps & virtual trading platforms', color: 'border-blue-400/20 bg-blue-400/5', textColor: 'text-blue-400' },
            { label: 'SOM', sub: 'Obtainable Market', val: '$840M', desc: '2% capture of SAM — achievable via school deals & broker referrals', color: 'border-emerald-400/20 bg-emerald-400/5', textColor: 'text-emerald-400' },
          ].map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.12 }}
              className={`rounded-2xl border ${m.color} p-6 text-center`}>
              <div className={`text-xs font-black tracking-[0.2em] uppercase mb-1 ${m.textColor}`}>{m.label}</div>
              <div className="text-white/35 text-xs mb-4">{m.sub}</div>
              <div className={`text-5xl font-black mb-3 ${m.textColor}`}>{m.val}</div>
              <div className="text-white/40 text-sm leading-relaxed">{m.desc}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { v: '18M+', l: 'UK adults with no investments' },
            { v: '4.3M', l: 'New investors post-COVID' },
            { v: '73%', l: 'Millennials want to invest' },
            { v: '2026', l: 'Peak Gen-Z investing age' },
          ].map((s, i) => <StatPill key={s.l} value={s.v} label={s.l} i={i} />)}
        </div>
      </div>
    </W>
  );
}

/* ── SLIDE 5: HOW IT WORKS ──────────────────────────────── */
function SlideHowItWorks() {
  const steps = [
    { n: '01', icon: '💰', title: 'Get £10,000', desc: 'Virtual cash credited instantly. No card. No real money. Unlimited room to experiment and make mistakes safely.' },
    { n: '02', icon: '📊', title: 'Trade Live', desc: 'Real prices, instant execution, live market data — indistinguishable from a real retail broker platform.' },
    { n: '03', icon: '⚡', title: 'Earn ELO', desc: 'Every profitable trade boosts your rating. Every loss is a lesson. Climb from Bronze all the way to Titan.' },
    { n: '04', icon: '🏆', title: 'Learn & Win', desc: "Build skills that last forever. When you move to real investing — you already know exactly what you're doing." },
  ];
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>How It Works</Label>
        <H className="text-[clamp(2.5rem,6vw,5rem)] text-white mb-12">
          Simple. <Gold>Addictive.</Gold> Powerful.
        </H>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {steps.map((step, i) => (
            <motion.div key={step.n} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i, duration: 0.6 }}
              className="relative rounded-2xl border border-white/[0.04] bg-white/[0.03] p-6 overflow-hidden group hover:border-amber-400/25 transition-colors">
              <div className="absolute top-3 right-4 text-6xl font-black text-white/[0.04] select-none leading-none">{step.n}</div>
              <div className="text-4xl mb-4">{step.icon}</div>
              <div className="text-white font-bold text-sm mb-2">{step.title}</div>
              <div className="text-white/38 text-xs leading-relaxed">{step.desc}</div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-amber-400/30 border border-amber-400/50" />
              )}
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
          className="flex items-center justify-center gap-3 text-sm text-white/25 flex-wrap">
          {['Sign up free', 'Get £10,000', 'Trade stocks', 'Earn ELO', 'Climb tiers', 'Become a trader'].map((step, i, arr) => (
            <React.Fragment key={step}>
              <span className={i === arr.length - 1 ? 'text-amber-400 font-bold' : ''}>{step}</span>
              {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-white/15" />}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </W>
  );
}

/* ── SLIDE 6: TRADING DASHBOARD ─────────────────────────── */
function SlideTrading() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>Feature — Live Trading</Label>
        <H className="text-[clamp(2rem,5vw,3.5rem)] text-white mb-8">
          Real-time <Gold>trading dashboard.</Gold>
        </H>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/[0.06] overflow-hidden shadow-2xl shadow-black/60">
          <div className="bg-white/[0.04] border-b border-white/[0.04] px-5 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 bg-white/5 rounded-md px-3 py-1 text-white/20 text-xs font-mono">app.vstock.io/home</div>
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /><span className="text-green-400 text-xs font-bold">Live</span></div>
          </div>
          <div className="bg-[#0d1220] p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <div className="rounded-xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/20 p-4">
                <div className="text-white/40 text-xs mb-1">Total Portfolio Value</div>
                <div className="text-3xl font-black text-white">£14,832.50</div>
                <div className="text-emerald-400 text-sm font-semibold mt-0.5">+£4,832.50 · +48.3% all time</div>
              </div>
              {[
                { sym: 'AAPL', shares: 12, price: '£173.20', chg: '+1.4%', pos: true },
                { sym: 'NVDA', shares: 3, price: '£482.10', chg: '+3.2%', pos: true },
                { sym: 'TSLA', shares: 5, price: '£214.80', chg: '-0.8%', pos: false },
                { sym: 'AMZN', shares: 8, price: '£155.30', chg: '+2.1%', pos: true },
              ].map(s => (
                <div key={s.sym} className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.03] px-4 py-2.5">
                  <div><p className="text-white font-bold text-sm">{s.sym}</p><p className="text-white/30 text-xs">{s.shares} shares @ {s.price}</p></div>
                  <div className={`text-sm font-black ${s.pos ? 'text-emerald-400' : 'text-red-400'}`}>{s.chg}</div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
                <div className="text-amber-400 font-bold text-sm mb-2 flex items-center gap-1.5"><Brain className="w-3.5 h-3.5" /> AI Market Insights</div>
                <div className="space-y-2 text-sm text-white/45">
                  <p>• Tech sector +2.4% — AI names leading</p>
                  <p>• NVDA, AMD breaking key resistance</p>
                  <p>• Dividend season — high yields incoming</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Cash', val: '£2,400' }, { label: 'Day P/L', val: '+£342' },
                  { label: 'Holdings', val: '28 stocks' }, { label: 'Win Rate', val: '71.4%' },
                ].map(s => (
                  <div key={s.label} className="rounded-lg bg-white/[0.03] border border-white/[0.03] p-3 text-center">
                    <div className="text-white/30 text-xs">{s.label}</div>
                    <div className="text-white font-bold text-sm mt-0.5">{s.val}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.03] p-3">
                <div className="text-white/35 text-xs mb-2">Quick Trade</div>
                <div className="flex gap-2">
                  <div className="flex-1 rounded-lg bg-white/5 border border-white/[0.04] px-3 py-2 text-white/35 text-xs">AAPL — £173.20</div>
                  <div className="px-4 py-2 rounded-lg bg-amber-400 text-black text-xs font-black cursor-pointer">Buy</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </W>
  );
}

/* ── SLIDE 7: PORTFOLIO ─────────────────────────────────── */
function SlidePortfolio() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>Feature — Portfolio Analytics</Label>
        <H className="text-[clamp(2rem,5vw,3.5rem)] text-white mb-8">
          Deep <Gold>performance tracking.</Gold>
        </H>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/[0.06] overflow-hidden shadow-2xl shadow-black/50">
          <div className="bg-white/[0.04] border-b border-white/[0.04] px-5 py-3 flex items-center justify-between">
            <span className="text-white font-bold text-sm flex items-center gap-2"><BarChart2 className="w-4 h-4 text-amber-400" /> My Portfolio</span>
            <span className="text-[10px] border border-amber-400/20 text-amber-400/70 rounded-full px-2.5 py-0.5 font-bold">Season 4 · Apr 2026</span>
          </div>
          <div className="bg-[#0d1220] p-5">
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-5">
              {[
                { label: 'Total Value', val: '£14,832', color: 'text-white' },
                { label: 'Today', val: '+£342', color: 'text-emerald-400' },
                { label: 'All Time', val: '+48.3%', color: 'text-emerald-400' },
                { label: 'Best Hold', val: 'AMZN', color: 'text-amber-400' },
                { label: 'Dividends', val: '£96/day', color: 'text-blue-400' },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-white/[0.035] bg-white/[0.03] p-3 text-center">
                  <div className="text-white/30 text-xs mb-1">{s.label}</div>
                  <div className={`text-sm font-black ${s.color}`}>{s.val}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[
                { sym: 'AAPL', shares: 12, buy: '£152.00', curr: '£173.20', pct: '+13.9%', gain: '+£254', pos: true, bar: 70 },
                { sym: 'MSFT', shares: 6, buy: '£320.00', curr: '£378.50', pct: '+18.3%', gain: '+£351', pos: true, bar: 90 },
                { sym: 'TSLA', shares: 5, buy: '£240.00', curr: '£214.80', pct: '-10.5%', gain: '-£126', pos: false, bar: 30 },
                { sym: 'AMZN', shares: 8, buy: '£128.00', curr: '£155.30', pct: '+21.3%', gain: '+£218', pos: true, bar: 100 },
              ].map((h, i) => (
                <motion.div key={h.sym} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.07 }}
                  className="flex items-center gap-4 rounded-xl border border-white/[0.03] bg-white/[0.02] px-4 py-3">
                  <div className="w-16">
                    <div className="text-white font-bold text-sm">{h.sym}</div>
                    <div className="text-white/25 text-xs">{h.shares} sh</div>
                  </div>
                  <div className="flex-1">
                    <div className="h-1 rounded-full bg-white/8 overflow-hidden">
                      <div className={`h-full rounded-full ${h.pos ? 'bg-emerald-400' : 'bg-red-400'}`} style={{ width: `${h.bar}%` }} />
                    </div>
                  </div>
                  <div className="text-right w-28">
                    <div className="text-white/45 text-xs">{h.buy} → {h.curr}</div>
                    <div className={`font-black text-sm ${h.pos ? 'text-emerald-400' : 'text-red-400'}`}>{h.pct} · {h.gain}</div>
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

/* ── SLIDE 8: LEADERBOARD ───────────────────────────────── */
function SlideLeaderboard() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>Feature — Global Leaderboard</Label>
        <H className="text-[clamp(2rem,5vw,3.5rem)] text-white mb-8">
          Compete with <Gold>the world.</Gold>
        </H>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="bg-white/[0.04] border-b border-white/[0.04] px-5 py-3 flex items-center justify-between">
              <span className="text-white font-bold text-sm flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-400" /> Global Rankings</span>
              <span className="text-white/25 text-xs">Season 4 · Live</span>
            </div>
            <div className="bg-[#0d1220] p-4 space-y-2">
              {[
                { rank: 1, medal: '🥇', name: 'AlphaTrader', tier: 'Titan', val: '£34,821', pct: '+248%', me: false },
                { rank: 2, medal: '🥈', name: 'BullRunner99', tier: 'Diamond', val: '£28,440', pct: '+184%', me: false },
                { rank: 3, medal: '🥉', name: 'StockWizard', tier: 'Platinum', val: '£22,100', pct: '+121%', me: false },
                { rank: 4, medal: '4', name: 'DipHunter', tier: 'Gold', val: '£18,350', pct: '+83%', me: false },
                { rank: 5, medal: '5', name: 'You', tier: 'Silver', val: '£14,832', pct: '+48%', me: true },
              ].map((t) => (
                <div key={t.rank} className={`flex items-center justify-between rounded-xl px-4 py-3 ${t.me ? 'border border-amber-400/40 bg-amber-400/10' : 'border border-white/[0.03] bg-white/[0.02]'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-base w-6 text-center font-bold">{t.medal}</span>
                    <div>
                      <div className={`font-bold text-sm ${t.me ? 'text-amber-400' : 'text-white'}`}>{t.name}{t.me && ' 👈'}</div>
                      <div className="text-white/25 text-xs">{t.tier}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-xs font-bold">{t.val}</div>
                    <div className="text-emerald-400 text-xs">{t.pct}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
            className="space-y-2.5">
            <div className="text-white/40 text-xs font-black uppercase tracking-widest mb-3">🎖 Tier System — 6 Levels</div>
            {[
              { tier: 'Bronze', ico: '🥉', elo: '0 – 1,200', col: 'border-orange-800/30 bg-orange-950/20', bar: 15 },
              { tier: 'Silver', ico: '🥈', elo: '1,200 – 1,400', col: 'border-slate-500/30 bg-slate-900/20', bar: 32 },
              { tier: 'Gold', ico: '🥇', elo: '1,400 – 1,600', col: 'border-amber-600/30 bg-amber-950/20', bar: 50 },
              { tier: 'Platinum', ico: '⚡', elo: '1,600 – 1,800', col: 'border-blue-500/30 bg-blue-950/20', bar: 68 },
              { tier: 'Diamond', ico: '💎', elo: '1,800 – 2,000', col: 'border-cyan-400/30 bg-cyan-950/20', bar: 85 },
              { tier: 'Titan', ico: '👑', elo: '2,000+', col: 'border-purple-400/30 bg-purple-950/20', bar: 100 },
            ].map((t, i) => (
              <motion.div key={t.tier} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.07 }}
                className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${t.col}`}>
                <span className="text-xl w-6">{t.ico}</span>
                <span className="text-white font-bold text-sm w-20">{t.tier}</span>
                <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-400/60" style={{ width: `${t.bar}%` }} />
                </div>
                <span className="text-white/30 text-xs font-mono w-28 text-right">{t.elo} ELO</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </W>
  );
}

/* ── SLIDE 9: COPY TRADING ───────────────────────────────── */
function SlideCopyTrading() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>Feature — Copy Trading</Label>
        <H className="text-[clamp(2rem,5vw,3.5rem)] text-white mb-8">
          Mirror top traders <Gold>automatically.</Gold>
        </H>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="bg-white/[0.04] border-b border-white/[0.04] px-5 py-3 flex items-center gap-2">
              <Copy className="w-4 h-4 text-amber-400" />
              <span className="text-white font-bold text-sm">Active Copy Positions</span>
            </div>
            <div className="bg-[#0d1220] p-5 space-y-3">
              {[
                { trader: 'AlphaTrader', tier: '👑 Titan', alloc: '£3,000', ret: '+£742', pct: '+24.7%', wr: '78%' },
                { trader: 'BullRunner99', tier: '💎 Diamond', alloc: '£2,500', ret: '+£460', pct: '+18.4%', wr: '71%' },
              ].map(ct => (
                <div key={ct.trader} className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-white font-bold text-sm">{ct.trader}</div>
                      <div className="text-white/30 text-xs">{ct.tier} · {ct.wr} win rate</div>
                    </div>
                    <span className="text-[10px] border border-emerald-400/30 text-emerald-400 rounded-full px-2 py-0.5 font-bold">COPYING ✓</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/35 text-xs">Allocated: {ct.alloc}</span>
                    <span className="text-emerald-400 font-black text-sm">{ct.ret} ({ct.pct})</span>
                  </div>
                </div>
              ))}
              <div className="text-white/20 text-xs border-t border-white/[0.03] pt-3">
                ✓ Mirrors trades proportionally · ✓ No extra fees · ✓ Cancel anytime
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            {[
              { n: '01', title: 'Browse Leaders', desc: 'Find top traders ranked by return, win rate, tier, and risk profile. Full transparency on their strategy.' },
              { n: '02', title: 'Set Your Allocation', desc: 'Choose how much to copy — £500 to £5,000. Your capital, your control, your risk tolerance.' },
              { n: '03', title: 'Auto-Mirror', desc: 'Their buys and sells execute on your account proportionally, in real time. Zero manual effort.' },
              { n: '04', title: 'Track Everything', desc: 'Live P&L dashboard for every copy-trade position. See exactly what you earned and why.' },
            ].map((item, i) => (
              <motion.div key={item.n} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 * i }}
                className="flex gap-4 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                <div className="w-7 h-7 rounded-full bg-amber-400 text-black font-black flex items-center justify-center shrink-0 text-xs">{item.n}</div>
                <div>
                  <div className="text-white font-bold text-sm">{item.title}</div>
                  <div className="text-white/35 text-xs mt-0.5 leading-relaxed">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </W>
  );
}

/* ── SLIDE 10: AI COACH ──────────────────────────────────── */
function SlideAI() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>Feature — AI Trading Coach</Label>
        <H className="text-[clamp(2rem,5vw,3.5rem)] text-white mb-8">
          Your personal <Gold>market advisor.</Gold>
        </H>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="bg-white/[0.04] border-b border-white/[0.04] px-5 py-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-amber-400" />
              <span className="text-white font-bold text-sm">VStock AI Coach</span>
              <span className="ml-auto text-emerald-400 text-xs flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" /> Online</span>
            </div>
            <div className="bg-[#0d1220] p-5 space-y-3">
              {[
                { user: true, msg: 'Should I buy more NVDA right now?' },
                { user: false, msg: 'NVDA RSI is 62 — bullish momentum confirmed. AI chip demand structurally strong. Suggest 15 shares at £482. Set stop at £455 to limit downside.' },
                { user: true, msg: "What's my biggest portfolio risk?" },
                { user: false, msg: 'Beta 1.4 and 73% tech concentration. Over-exposed. Recommend rotating 15% into defensives — JNJ, PG — to reduce sector correlation.' },
              ].map((m, i) => (
                <div key={i} className={`flex ${m.user ? 'justify-end' : 'gap-2'}`}>
                  {!m.user && <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0 mt-1"><Brain className="w-3 h-3 text-amber-400" /></div>}
                  <div className={`rounded-2xl px-4 py-2.5 max-w-[88%] text-sm leading-relaxed ${m.user ? 'bg-white/10 text-white rounded-tr-sm' : 'bg-amber-400/8 border border-amber-400/15 text-white/70 rounded-tl-sm'}`}>
                    {m.msg}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="space-y-2">
            {[
              { icon: '📊', t: 'Market Sentiment', d: 'Real-time sector sentiment, news impact, and macro trend analysis' },
              { icon: '🎯', t: 'Actionable Trade Ideas', d: 'Buy/sell signals with price targets, stop losses, and position sizes' },
              { icon: '⚠️', t: 'Risk Monitoring', d: 'Flags over-concentration, high beta exposure, and volatility spikes' },
              { icon: '📚', t: 'Jargon-Free Education', d: 'RSI, MACD, P/E ratios explained in plain English, in real time' },
              { icon: '🔍', t: 'Technical Analysis', d: 'EMA, Bollinger Bands, momentum — all interpreted automatically' },
              { icon: '⚖️', t: 'Portfolio Optimisation', d: 'Rebalancing suggestions based on modern portfolio theory' },
            ].map((item, i) => (
              <motion.div key={item.t} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + i * 0.07 }}
                className="flex gap-3 rounded-xl border border-white/[0.035] bg-white/[0.02] px-4 py-3 hover:border-amber-400/20 transition-colors">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <div className="text-white font-bold text-xs">{item.t}</div>
                  <div className="text-white/30 text-xs mt-0.5">{item.d}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </W>
  );
}

/* ── SLIDE 11: DIVIDENDS ─────────────────────────────────── */
function SlideDividends() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>Feature — Hourly Dividends</Label>
        <H className="text-[clamp(2rem,5vw,3.5rem)] text-white mb-8">
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
                <motion.div key={d.sym} initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.08 }}
                  className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4 text-center">
                  <div className="text-3xl mb-2">{d.icon}</div>
                  <div className="text-white font-black text-sm">{d.sym}</div>
                  <div className="text-emerald-400 font-bold text-xs mt-1">{d.yield}</div>
                  <div className="text-white/25 text-xs mt-0.5">{d.holding}</div>
                  <div className="text-emerald-300 font-black text-xs mt-2 border-t border-emerald-400/15 pt-2">{d.hrly}/hr</div>
                </motion.div>
              ))}
            </div>
            <div className="rounded-xl border border-white/[0.035] bg-white/[0.02] p-4">
              <div className="text-white/40 font-bold text-xs mb-3">🎓 Why Dividends Matter</div>
              <div className="space-y-1.5 text-white/30 text-xs leading-relaxed">
                <p>✓ Teaches passive income and compound growth through doing</p>
                <p>✓ Rewards long-term holding — discourages panic trading</p>
                <p>✓ Creates a daily check-in habit — users return to see earnings</p>
                <p>✓ Mirrors real-world yield vs growth investment trade-offs</p>
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl border border-emerald-400/25 bg-gradient-to-b from-emerald-400/8 to-transparent p-6 flex flex-col justify-between">
            <div>
              <div className="text-emerald-400 font-bold text-sm mb-5 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Dividend Income Tracker</div>
              <div className="space-y-4">
                {[
                  { label: 'Last Hour', val: '+£4.00' },
                  { label: 'Today (24 hrs)', val: '+£96.00' },
                  { label: 'This Week', val: '+£672.00' },
                  { label: 'This Month', val: '+£2,880.00' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-baseline border-b border-emerald-400/10 pb-3">
                    <span className="text-white/35 text-sm">{r.label}</span>
                    <span className="text-emerald-400 font-bold text-lg">{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-emerald-400/15">
              <div className="text-white/30 text-xs mb-1">Annual Projected</div>
              <div className="text-emerald-300 font-black text-5xl leading-none">+£34,560</div>
              <div className="text-white/15 text-xs mt-1.5">based on current holdings & yields</div>
            </div>
          </motion.div>
        </div>
      </div>
    </W>
  );
}

/* ── SLIDE 12: SOCIAL ────────────────────────────────────── */
function SlideSocial() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>Feature — Social & Community</Label>
        <H className="text-[clamp(2rem,5vw,3.5rem)] text-white mb-8">
          Trading is better <Gold>together.</Gold>
        </H>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="bg-white/[0.04] border-b border-white/[0.04] px-5 py-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span className="text-white font-bold text-sm">Community Feed</span>
              <span className="ml-auto text-xs text-white/20">127 online now</span>
            </div>
            <div className="bg-[#0d1220] p-4 space-y-3">
              {[
                { user: 'AlphaTrader', badge: '👑', msg: '🎉 Just crossed +£1,000 profit! NVDA was the one — held through the dip. Diamond hands rewarded.', time: '2m', likes: 47 },
                { user: 'BullRunner99', badge: '💎', msg: '📈 NVDA AI chip orders coming in strong. Tech is only getting started — loaded at open.', time: '15m', likes: 23 },
                { user: 'DipHunter', badge: '🥇', msg: '🎯 Caught TSLA -10% dip and rode it back. Strategy: wait, watch, strike. It works every time.', time: '1h', likes: 156 },
              ].map((p, i) => (
                <div key={i} className="rounded-xl border border-white/[0.035] bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-400/15 flex items-center justify-center text-amber-400 font-black text-xs">{p.user[0]}</div>
                      <span className="text-white font-bold text-xs">{p.user}</span>
                      <span className="text-sm">{p.badge}</span>
                    </div>
                    <span className="text-white/20 text-xs">{p.time} ago</span>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed mb-2">{p.msg}</p>
                  <div className="flex gap-4 text-xs text-white/20">
                    <span>❤️ {p.likes}</span><span>💬 Reply</span><span>📋 Copy Trade</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="space-y-2.5">
            {[
              { icon: '📣', t: 'Trade Posts', d: 'Share wins, strategies, and insights — build your public reputation organically' },
              { icon: '👤', t: 'Trader Profiles', d: 'Full portfolio history, stats, badges, and win rates — all publicly visible' },
              { icon: '❤️', t: 'Likes & Reactions', d: 'Community celebrates great trades — social proof drives viral growth' },
              { icon: '👥', t: 'Follow Traders', d: 'Stay close to top performers and friends — notifications on big moves' },
              { icon: '📊', t: 'Copy from Profiles', d: "Replicate any trader's full strategy from their public profile in one tap" },
              { icon: '🏆', t: 'Group Leaderboards', d: 'Filter by school, city, friend group — compete at every social level' },
            ].map((item, i) => (
              <motion.div key={item.t} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.07 * i }}
                className="flex gap-3 rounded-xl border border-white/[0.035] bg-white/[0.02] px-4 py-3 hover:border-amber-400/15 transition-colors">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <div className="text-white font-bold text-xs">{item.t}</div>
                  <div className="text-white/30 text-xs mt-0.5">{item.d}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </W>
  );
}

/* ── SLIDE 13: GAMIFICATION ──────────────────────────────── */
function SlideGamification() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>Feature — Gamification Engine</Label>
        <H className="text-[clamp(2rem,5vw,3.5rem)] text-white mb-8">
          Hooks that keep users <Gold>coming back daily.</Gold>
        </H>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            {[
              { e: '🥇', t: 'Achievement Badges', d: '11 unique badges — First Trade, Diamond Hands, Dip Hunter, Portfolio Titan, and more.' },
              { e: '🔥', t: 'Daily Login Streaks', d: 'Consistency is rewarded. Daily streaks and bonus multipliers drive habitual return.' },
              { e: '⚡', t: 'Weekly Missions', d: 'Rotating objectives with virtual rewards — a fresh reason to engage every week.' },
              { e: '📊', t: 'Seasonal Resets', d: 'New leaderboards every month — everyone starts equal, anyone can win the season.' },
              { e: '🎯', t: 'Collectible Titles', d: 'Rare titles displayed on public profiles — genuine social status symbols.' },
              { e: '👑', t: 'Hall of Fame', d: 'Top 10 traders each season are immortalised in the permanent Hall of Fame.' },
            ].map((item, i) => (
              <motion.div key={item.t} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 * i }}
                className="flex gap-3 rounded-xl border border-white/[0.035] bg-white/[0.02] px-4 py-3 hover:border-amber-400/15 transition-colors">
                <span className="text-xl">{item.e}</span>
                <div>
                  <div className="text-white font-bold text-xs">{item.t}</div>
                  <div className="text-white/30 text-xs mt-0.5 leading-relaxed">{item.d}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}
            className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-900/25 to-transparent flex flex-col p-8 gap-5">
            <div className="text-center">
              <div className="text-8xl font-black text-amber-400 leading-none">5×</div>
              <div className="text-white font-black text-xl mt-2">More Daily Sessions</div>
              <div className="text-white/30 text-sm">vs non-gamified finance apps</div>
            </div>
            <div className="border-t border-white/[0.04] pt-5 space-y-3 text-sm text-white/40">
              <div className="flex items-center gap-2"><span className="text-emerald-400 font-bold">+60%</span> reduction in churn via reward loops</div>
              <div className="flex items-center gap-2"><span className="text-emerald-400 font-bold">+340%</span> session frequency vs banking apps</div>
              <div className="flex items-center gap-2"><span className="text-emerald-400 font-bold">+2.8×</span> longer session duration with missions</div>
              <div className="flex items-center gap-2"><span className="text-amber-400 font-bold">🧠</span> Proven mobile game psychology applied to finance</div>
            </div>
          </motion.div>
        </div>
      </div>
    </W>
  );
}

/* ── SLIDE 14: APP SCREENSHOTS ───────────────────────────── */
function SlideAppScreenshots() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>The App — Live & Working</Label>
        <H className="text-[clamp(2rem,5vw,3.5rem)] text-white mb-4">
          Built. Deployed. <Gold>Live.</Gold>
        </H>
        <p className="text-white/40 text-base mb-8 max-w-xl">VStock is not a mockup — it is a fully functional trading platform live right now, with real users trading, competing, and earning.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            {
              title: 'Trade Screen', icon: '📈',
              items: ['Real-time stock search', 'Instant buy execution', 'Live P&L tracking', 'AI market insights panel'],
            },
            {
              title: 'Portfolio View', icon: '💼',
              items: ['Holding breakdown', 'Dividend income tracker', 'Performance vs. market', 'Copy trade positions'],
            },
            {
              title: 'Leaderboard', icon: '🏆',
              items: ['Global ELO rankings', '6-tier tier display', 'Social feed integration', 'Copy trade from profile'],
            },
          ].map((screen, i) => (
            <motion.div key={screen.title} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.12 }}
              className="rounded-2xl border border-white/[0.06] overflow-hidden">
              <div className="bg-white/[0.04] border-b border-white/[0.04] px-4 py-2.5 flex items-center gap-2">
                <span>{screen.icon}</span>
                <span className="text-white font-bold text-sm">{screen.title}</span>
              </div>
              <div className="bg-[#0d1220] p-4">
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.03] p-4 mb-3 space-y-2">
                  {screen.items.map(item => (
                    <div key={item} className="flex items-center gap-2 text-xs text-white/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { v: '✅', l: 'Fully functional app' },
            { v: '✅', l: 'Live stock prices' },
            { v: '✅', l: 'Real users trading' },
            { v: '✅', l: 'AI coach active' },
          ].map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.07 }}
              className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-center">
              <div className="text-xl mb-1">{s.v}</div>
              <div className="text-white/40 text-xs">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </W>
  );
}

/* ── SLIDE 15: MONEY CONFIDENT ───────────────────────────── */
function SlideMoneyConfident() {
  return (
    <W>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[750px] h-[750px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 60%)' }} />
      </div>
      <div className="max-w-5xl w-full relative z-10">
        <Label>Our Mission</Label>
        <H className="text-[clamp(2rem,6vw,4.5rem)] text-white mb-4 max-w-4xl">
          Growing a <Gold>money-confident</Gold> generation.
        </H>
        <p className="text-white/40 text-lg mb-10 max-w-3xl leading-relaxed">
          Financial anxiety is an epidemic. <span className="text-white font-bold">72% of 18–35 year olds</span> say money is their biggest stress — yet fewer than 1 in 5 received financial education at school. VStock changes that.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: '🧠', title: 'Knowledge Without Risk', desc: 'Users learn compound interest, diversification, dividends, and market cycles — through doing, not theory or textbooks.' },
            { icon: '💪', title: 'Confidence Through Practice', desc: 'After 30 days on VStock, users report 3× more confidence making real financial decisions — ISAs, pensions, ETFs.' },
            { icon: '🌱', title: 'Habits That Last Forever', desc: 'Daily streaks and portfolio check-ins build the exact habits that separate wealthy investors from everyone else.' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.12 }}
              className="rounded-2xl border border-amber-400/15 bg-amber-400/5 p-5">
              <div className="text-4xl mb-3">{item.icon}</div>
              <div className="text-white font-bold text-sm mb-2">{item.title}</div>
              <div className="text-white/38 text-sm leading-relaxed">{item.desc}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { v: '£0', l: 'Real money to start' },
            { v: '30 days', l: 'To feel financially confident' },
            { v: '18M+', l: 'UK adults with no investments' },
            { v: '3×', l: 'Confidence boost after month 1' },
          ].map((s, i) => <StatPill key={s.l} value={s.v} label={s.l} i={i} />)}
        </div>
      </div>
    </W>
  );
}

/* ── SLIDE 16: TRACTION ──────────────────────────────────── */
function SlideTraction() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>Traction & Validation</Label>
        <H className="text-[clamp(2rem,6vw,4.5rem)] text-white mb-4">
          Early signals are <Gold>strong.</Gold>
        </H>
        <p className="text-white/40 text-lg mb-10 max-w-2xl leading-relaxed">
          VStock launched in early 2026. The engagement metrics already validate the core thesis — young people <em>want</em> to learn investing, they just need the right tool.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { v: '847', l: 'Active users', sub: 'first 90 days', color: 'text-amber-400' },
            { v: '94%', l: 'Day-7 retention', sub: 'vs 25% industry avg', color: 'text-emerald-400' },
            { v: '4.2', l: 'Avg sessions/day', sub: 'per active user', color: 'text-blue-400' },
            { v: '£0', l: 'Paid acquisition', sub: 'pure organic growth', color: 'text-purple-400' },
          ].map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.09 }}
              className="rounded-2xl border border-white/[0.04] bg-white/[0.03] p-5 text-center">
              <div className={`text-4xl font-black ${s.color} leading-none mb-2`}>{s.v}</div>
              <div className="text-white font-bold text-sm">{s.l}</div>
              <div className="text-white/25 text-xs mt-1">{s.sub}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-5">
            <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">📣 What Users Say</div>
            <div className="space-y-3">
              {[
                { quote: '"I learned more about investing in 2 weeks on VStock than 4 years of business school."', user: 'Ethan, 22, Uni student' },
                { quote: '"The AI coach is incredible. It explained short selling better than any YouTube video."', user: 'Priya, 19, Sixth Form' },
                { quote: '"I actually look forward to checking my portfolio every morning now."', user: 'Marcus, 24, Graduate' },
              ].map((t, i) => (
                <div key={i} className="rounded-xl border border-white/[0.03] bg-white/[0.02] px-4 py-3">
                  <p className="text-white/50 text-xs leading-relaxed italic mb-1">{t.quote}</p>
                  <p className="text-white/25 text-xs">— {t.user}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-5">
            <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">📈 Engagement Highlights</div>
            <div className="space-y-3">
              {[
                { label: 'Average trades per user', val: '23 trades', bar: 75 },
                { label: 'Users checking AI coach daily', val: '82%', bar: 82 },
                { label: 'Copy trading adoption rate', val: '41%', bar: 41 },
                { label: 'Social post engagement rate', val: '68%', bar: 68 },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/35">{m.label}</span>
                    <span className="text-white font-bold">{m.val}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${m.bar}%` }} transition={{ delay: 0.4, duration: 0.8 }}
                      className="h-full rounded-full bg-amber-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </W>
  );
}

/* ── SLIDE 17: BUSINESS MODEL ────────────────────────────── */
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
            { icon: '💳', title: 'VStock Pro', sub: '£9.99 / month', desc: 'Advanced charts, AI coaching priority, ad-free experience, early season access, and exclusive badges.' },
            { icon: '🏫', title: 'B2B School Licences', sub: 'Per-student annually', desc: 'White-label platform with bespoke curricula, class analytics dashboard, and dedicated teacher support.' },
            { icon: '🏆', title: 'Premium Tournaments', sub: 'Seasonal competitions', desc: 'Invite-only events with real prize pools, sponsor branding, media coverage, and prestige.' },
            { icon: '🤝', title: 'Brokerage Referrals', sub: 'Revenue share', desc: 'Bridge confident, educated users to real regulated trading accounts — a trusted, natural next step.' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 * i }}
              className="rounded-2xl border border-white/[0.04] bg-white/[0.03] p-5 flex gap-4 hover:border-amber-400/20 transition-colors">
              <span className="text-3xl">{item.icon}</span>
              <div>
                <div className="text-white font-bold text-sm">{item.title}</div>
                <div className="text-amber-400/70 text-xs font-semibold mb-2">{item.sub}</div>
                <div className="text-white/38 text-xs leading-relaxed">{item.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="rounded-2xl border border-amber-400/25 bg-amber-400/8 p-6">
          <div className="text-center mb-5">
            <div className="text-amber-400 font-black text-xl">10,000 free users → 1,500 Pro subscribers → £180,000 ARR</div>
            <div className="text-white/30 text-sm mt-1">Conservative 15% freemium conversion · industry benchmark is 10–20%</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { v: '£180K', l: 'Year 1 ARR', sub: 'Pro + early B2B' },
              { v: '£1.2M', l: 'Year 2 ARR', sub: '10× user growth' },
              { v: '£8M+', l: 'Year 3 ARR', sub: 'B2B + referral scale' },
            ].map(s => (
              <div key={s.v} className="text-center rounded-xl border border-amber-400/15 bg-amber-400/5 p-3">
                <div className="text-amber-300 font-black text-2xl">{s.v}</div>
                <div className="text-white/50 text-xs font-bold mt-0.5">{s.l}</div>
                <div className="text-white/20 text-xs">{s.sub}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </W>
  );
}

/* ── SLIDE 18: ROADMAP ───────────────────────────────────── */
function SlideRoadmap() {
  return (
    <W>
      <div className="max-w-5xl w-full">
        <Label>Product Roadmap</Label>
        <H className="text-[clamp(2rem,6vw,4.5rem)] text-white mb-4">
          Where we're <Gold>going.</Gold>
        </H>
        <p className="text-white/40 text-base mb-10 max-w-xl">A clear, ambitious, and achievable plan — built around product, growth, and monetisation milestones.</p>

        <div className="space-y-3">
          {[
            {
              phase: 'Phase 1', period: 'Q1–Q2 2026 · NOW', status: 'live', color: 'border-emerald-500/30 bg-emerald-500/5',
              statusColor: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
              items: ['Core trading platform live', 'ELO leaderboard & 6 tiers', 'AI coaching engine', 'Hourly dividends system', 'Copy trading & social feed'],
            },
            {
              phase: 'Phase 2', period: 'Q3–Q4 2026', status: 'next', color: 'border-amber-500/20 bg-amber-500/5',
              statusColor: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
              items: ['VStock Pro subscription launch', 'Mobile app (iOS & Android)', 'First 5 school partnerships', 'Premium seasonal tournaments', 'Broker referral integrations'],
            },
            {
              phase: 'Phase 3', period: '2027', status: 'planned', color: 'border-white/[0.04] bg-white/[0.02]',
              statusColor: 'text-white/40 border-white/[0.07] bg-white/5',
              items: ['UK nationwide school rollout', 'EU market expansion', 'Crypto & ETF simulation', 'Options & derivatives mode', 'Institutional B2B dashboard'],
            },
          ].map((phase, i) => (
            <motion.div key={phase.phase} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 * i }}
              className={`rounded-2xl border ${phase.color} p-5`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-white font-black text-sm">{phase.phase}</span>
                  <span className="text-white/40 text-xs">{phase.period}</span>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest border rounded-full px-2.5 py-0.5 ${phase.statusColor}`}>{phase.status}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {phase.items.map(item => (
                  <span key={item} className="text-xs bg-white/5 border border-white/[0.04] rounded-lg px-3 py-1 text-white/50">{item}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </W>
  );
}

/* ── SLIDE 19: VISION ────────────────────────────────────── */
function SlideVision() {
  return (
    <W>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] rounded-full opacity-50" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 58%)' }} />
      </div>
      <div className="max-w-4xl w-full relative z-10">
        <Label>Vision · 2026 – 2030</Label>
        <H className="text-[clamp(2.5rem,7vw,5.5rem)] text-white mb-5">
          Democratising <br /><Gold>financial literacy</Gold><br /> globally.
        </H>
        <p className="text-white/38 text-xl mb-12 max-w-2xl leading-relaxed">
          Making investing fun, social, and risk-free — so the next generation builds real skills, real confidence, and real wealth before they ever touch real money.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: '🌍', title: '1M Users by 2027', desc: '15+ countries via school partnerships, broker deals, and organic virality across social platforms' },
            { icon: '📈', title: 'Category Leader', desc: '#1 virtual trading education platform globally — the Duolingo of personal finance and investing' },
            { icon: '🌉', title: 'The Real Bridge', desc: 'A trusted pipeline from simulated learning to real brokerage accounts — the ultimate conversion event' },
          ].map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.12 }}
              className="rounded-2xl border border-amber-400/15 bg-amber-400/5 p-6 text-center hover:border-amber-400/30 transition-colors">
              <div className="text-4xl mb-3">{v.icon}</div>
              <div className="text-white font-bold text-sm mb-2">{v.title}</div>
              <div className="text-white/38 text-xs leading-relaxed">{v.desc}</div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
          className="flex flex-wrap gap-2 justify-center">
          {['Duolingo for Finance', 'School Curricula', 'B2C + B2B', 'Brokerage Pipeline', '15+ Countries', 'Hall of Fame', 'Mobile First', 'Social Virality'].map(tag => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </motion.div>
      </div>
    </W>
  );
}

/* ── SLIDE 20: CTA ───────────────────────────────────────── */
function SlideCTA() {
  return (
    <W className="text-center">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[750px] h-[750px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 58%)' }} />
      </div>

      <motion.div initial={{ scale: 0.5, opacity: 0, rotate: 8 }} animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ delay: 0.05, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="w-24 h-24 md:w-32 md:h-32 rounded-[28px] bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/60 mb-8 relative z-10">
        <TrendingUp className="w-12 h-12 md:w-16 md:h-16 text-black" strokeWidth={2.5} />
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        className="text-[clamp(5rem,18vw,14rem)] font-black tracking-tighter leading-none relative z-10 mb-5">
        <span className="text-white">V</span><span className="text-amber-400">Stock</span>
      </motion.h1>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}
        className="text-white/40 text-lg md:text-xl mb-2 relative z-10 font-medium">The future of learning to invest.</motion.p>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.58 }}
        className="text-white/22 text-sm md:text-base mb-10 relative z-10 tracking-wider">
        Zero Risk · Real Skills · Real Confidence · Compete Globally
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.72 }}
        className="flex flex-col sm:flex-row gap-4 relative z-10 mb-12">
        <a href="/Home"
          className="flex items-center justify-center gap-2 px-10 py-4 bg-amber-400 hover:bg-amber-300 rounded-2xl text-black font-black text-lg transition-all shadow-2xl shadow-amber-500/35">
          Try VStock Free <ArrowRight className="w-5 h-5" />
        </a>
        <div className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/[0.06] bg-white/5 text-white font-semibold text-sm backdrop-blur">
          <Wallet className="w-4 h-4 text-amber-400" />
          <span>£10,000 virtual · No card required</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
        className="flex gap-6 md:gap-10 relative z-10">
        {[
          { v: '£0', l: 'to start' },
          { v: '6 tiers', l: 'to climb' },
          { v: 'AI coach', l: 'included' },
          { v: '24/7', l: 'dividends' },
        ].map(s => (
          <div key={s.l} className="text-center">
            <div className="text-amber-400 font-black text-sm">{s.v}</div>
            <div className="text-white/18 text-xs">{s.l}</div>
          </div>
        ))}
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
        className="absolute bottom-16 text-white/8 text-[10px] tracking-[0.35em] font-mono">
        VSTOCK · GROWING A MONEY-CONFIDENT GENERATION · 2026
      </motion.p>
    </W>
  );
}