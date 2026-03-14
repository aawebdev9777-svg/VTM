import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, Zap, Trophy, BarChart2, Shield, ArrowRight, ChevronDown, Star, Globe, Rocket } from 'lucide-react';

const slides = [
  { id: 0 },
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 6 },
];

export default function Present() {
  const [current, setCurrent] = useState(0);

  const goTo = (i) => setCurrent(i);
  const next = () => setCurrent(prev => (prev + 1) % slides.length);
  const prev = () => setCurrent(prev => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex gap-1 p-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`flex-1 h-1 rounded-full transition-all duration-300 ${i === current ? 'bg-amber-500' : i < current ? 'bg-amber-700' : 'bg-slate-700'}`}
          />
        ))}
      </div>

      {/* Slide Content */}
      <AnimatePresence mode="wait">
        {current === 0 && <SlideHero key={0} />}
        {current === 1 && <SlideProblem key={1} />}
        {current === 2 && <SlideSolution key={2} />}
        {current === 3 && <SlideFeatures key={3} />}
        {current === 4 && <SlideLeaderboard key={4} />}
        {current === 5 && <SlideTraction key={5} />}
        {current === 6 && <SlideCTA key={6} />}
      </AnimatePresence>

      {/* Navigation */}
      <div className="fixed bottom-6 left-0 right-0 flex items-center justify-center gap-6 z-50">
        <button onClick={prev} className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:border-amber-500 transition-all">
          <ChevronDown className="w-4 h-4 rotate-90" />
        </button>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${i === current ? 'bg-amber-500 w-6' : 'bg-slate-600 w-2'}`}
            />
          ))}
        </div>
        <button onClick={next} className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:border-amber-500 transition-all">
          <ChevronDown className="w-4 h-4 -rotate-90" />
        </button>
      </div>
    </div>
  );
}

const slideVariants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.3 } },
};

function SlideHero() {
  return (
    <motion.div variants={slideVariants} initial="initial" animate="animate" exit="exit"
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.15) 0%, transparent 65%)' }} />
      <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=80" alt="bg" className="w-full h-full object-cover" />
      </div>

      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}
        className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/30 mb-8">
        <TrendingUp className="w-10 h-10 text-slate-900" />
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="text-7xl md:text-9xl font-black tracking-tight text-center mb-4">
        <span className="text-white">V</span><span className="text-amber-500">Stock</span>
      </motion.h1>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="text-2xl md:text-3xl text-slate-400 font-light tracking-widest uppercase mb-6">
        Virtual Trading. Real Skills.
      </motion.p>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        className="flex flex-wrap gap-3 justify-center">
        {['No Real Money', 'Real Markets', 'Compete & Learn'].map(tag => (
          <span key={tag} className="px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-full text-sm text-slate-300 backdrop-blur">
            {tag}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}

function SlideProblem() {
  return (
    <motion.div variants={slideVariants} initial="initial" animate="animate" exit="exit"
      className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      <div className="max-w-4xl w-full">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="text-amber-500 font-bold uppercase tracking-widest text-sm mb-4">The Problem</motion.div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-5xl md:text-6xl font-black mb-10 leading-tight">
          Learning to trade <br /><span className="text-amber-500">costs too much.</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '💸', title: 'Real Money Risk', desc: 'Beginners lose thousands learning the basics of trading.' },
            { icon: '😰', title: 'Fear of Failure', desc: 'The fear of financial loss stops people from ever starting.' },
            { icon: '🎓', title: 'No Practice Ground', desc: 'There\'s no safe environment to build genuine trading skills.' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.15 }}
              className="p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-red-500/40 transition-all">
              <div className="text-4xl mb-3">{item.icon}</div>
              <div className="text-lg font-bold text-white mb-2">{item.title}</div>
              <div className="text-slate-400 text-sm leading-relaxed">{item.desc}</div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="mt-10 p-5 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <p className="text-red-400 text-center text-lg font-medium">
            80% of retail traders lose money in their first year — mostly because they had no safe place to learn.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

function SlideSolution() {
  return (
    <motion.div variants={slideVariants} initial="initial" animate="animate" exit="exit"
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-600" />
      <div className="max-w-5xl w-full">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-amber-500 font-bold uppercase tracking-widest text-sm mb-4">The Solution</motion.div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-5xl md:text-6xl font-black mb-6">
          Introducing <span className="text-amber-500">VStock</span>
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="text-slate-400 text-xl mb-10 max-w-2xl leading-relaxed">
          A gamified virtual stock trading platform where you trade with virtual money, compete on leaderboards, and build real financial skills — zero risk, maximum fun.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            className="relative rounded-2xl overflow-hidden h-64">
            <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80" alt="Trading" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <div className="text-white font-bold text-lg">Real-Time Markets</div>
              <div className="text-slate-400 text-sm">Live prices, real dynamics</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
            className="relative rounded-2xl overflow-hidden h-64">
            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" alt="Analytics" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <div className="text-white font-bold text-lg">Portfolio Analytics</div>
              <div className="text-slate-400 text-sm">Track every move</div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function SlideFeatures() {
  const features = [
    { icon: <TrendingUp className="w-6 h-6" />, color: 'from-green-500 to-emerald-600', title: 'Live Trading', desc: 'Buy & sell stocks with real-time price data. Feel the market pulse.' },
    { icon: <Trophy className="w-6 h-6" />, color: 'from-amber-500 to-orange-600', title: 'ELO Rankings', desc: 'Compete with a tier system from Bronze to Titan. Climb the leaderboard.' },
    { icon: <Users className="w-6 h-6" />, color: 'from-blue-500 to-indigo-600', title: 'Copy Trading', desc: 'Follow top traders and automatically mirror their moves.' },
    { icon: <Zap className="w-6 h-6" />, color: 'from-purple-500 to-violet-600', title: 'AI Assistant', desc: 'Your personal AI trading coach giving market insights and tips.' },
    { icon: <BarChart2 className="w-6 h-6" />, color: 'from-pink-500 to-rose-600', title: 'Dividends', desc: 'Earn hourly dividend yields on your holdings. Passive income mechanic.' },
    { icon: <Shield className="w-6 h-6" />, color: 'from-cyan-500 to-teal-600', title: 'Risk Free', desc: 'Zero real money. All the experience. Start with £10,000 virtual.' },
  ];

  return (
    <motion.div variants={slideVariants} initial="initial" animate="animate" exit="exit"
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-5xl w-full">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-amber-500 font-bold uppercase tracking-widest text-sm mb-4 text-center">Core Features</motion.div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-5xl md:text-6xl font-black mb-10 text-center">
          Everything you need <br /><span className="text-amber-500">to trade like a pro.</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="p-5 bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-600 transition-all group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <div className="text-white font-bold mb-1">{f.title}</div>
              <div className="text-slate-400 text-sm leading-relaxed">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SlideLeaderboard() {
  const traders = [
    { rank: 1, name: 'AlphaTrader', tier: 'Titan', profit: '+£24,830', change: '+148%', color: 'text-amber-400' },
    { rank: 2, name: 'StockWizard', tier: 'Diamond', profit: '+£18,200', change: '+82%', color: 'text-slate-300' },
    { rank: 3, name: 'BullRunner', tier: 'Platinum', profit: '+£12,500', change: '+55%', color: 'text-orange-400' },
    { rank: 4, name: 'DipHunter', tier: 'Gold', profit: '+£9,100', change: '+41%', color: 'text-slate-400' },
  ];

  return (
    <motion.div variants={slideVariants} initial="initial" animate="animate" exit="exit"
      className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-4xl w-full">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-amber-500 font-bold uppercase tracking-widest text-sm mb-4">Compete & Win</motion.div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-5xl md:text-6xl font-black mb-4">
          The <span className="text-amber-500">Leaderboard</span><br />makes it addictive.
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="text-slate-400 text-lg mb-10">Climb tiers from Bronze to Titan. Every trade affects your ELO rating.</motion.p>

        <div className="space-y-3">
          {traders.map((trader, i) => (
            <motion.div key={trader.name}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.12 }}
              className={`flex items-center gap-4 p-4 rounded-2xl ${i === 0 ? 'bg-amber-500/10 border border-amber-500/40' : 'bg-slate-900 border border-slate-800'}`}>
              <div className={`text-2xl font-black w-8 text-center ${trader.color}`}>#{trader.rank}</div>
              <div className="flex-1">
                <div className="text-white font-bold">{trader.name}</div>
                <div className="text-slate-500 text-xs">{trader.tier} Tier</div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold">{trader.profit}</div>
                <div className="text-green-500 text-xs">{trader.change}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="mt-8 relative rounded-2xl overflow-hidden h-32">
          <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80" alt="charts" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
            <p className="text-white font-bold text-xl">Tier progression keeps users engaged & coming back</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function SlideTraction() {
  const stats = [
    { value: '£10K', label: 'Starting Balance', sub: 'Virtual GBP per user' },
    { value: '6', label: 'Tier Levels', sub: 'Bronze → Titan' },
    { value: '24/7', label: 'Market Hours', sub: 'Always trading' },
    { value: 'AI', label: 'Personal Coach', sub: 'Powered by LLM' },
  ];

  return (
    <motion.div variants={slideVariants} initial="initial" animate="animate" exit="exit"
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=80" alt="bg" className="w-full h-full object-cover" />
      </div>
      <div className="max-w-4xl w-full relative z-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-amber-500 font-bold uppercase tracking-widest text-sm mb-4">Platform Stats</motion.div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-5xl md:text-6xl font-black mb-10">
          Built to <span className="text-amber-500">scale.</span>
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.12 }}
              className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-center">
              <div className="text-4xl font-black text-amber-500 mb-1">{stat.value}</div>
              <div className="text-white font-semibold text-sm">{stat.label}</div>
              <div className="text-slate-500 text-xs mt-1">{stat.sub}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: <Globe className="w-5 h-5" />, title: 'Web + Mobile Ready', desc: 'Responsive design that works on every device.' },
            { icon: <Rocket className="w-5 h-5" />, title: 'Instant Onboarding', desc: 'Sign up and start trading in under 60 seconds.' },
            { icon: <Star className="w-5 h-5" />, title: 'Gamified Experience', desc: 'Achievements, streaks, and badges keep users engaged.' },
            { icon: <Users className="w-5 h-5" />, title: 'Social Layer', desc: 'Share trades, post insights, follow top traders.' },
          ].map((item, i) => (
            <motion.div key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                {item.icon}
              </div>
              <div>
                <div className="text-white font-semibold text-sm">{item.title}</div>
                <div className="text-slate-500 text-xs mt-0.5">{item.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SlideCTA() {
  return (
    <motion.div variants={slideVariants} initial="initial" animate="animate" exit="exit"
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div style={{ background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.2) 0%, transparent 70%)' }} className="absolute inset-0" />
      <div className="absolute inset-0 opacity-5">
        <img src="https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1600&q=80" alt="bg" className="w-full h-full object-cover" />
      </div>

      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.7 }}
        className="w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/40 mb-8">
        <TrendingUp className="w-12 h-12 text-slate-900" />
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="text-6xl md:text-8xl font-black text-center mb-4">
        <span className="text-white">V</span><span className="text-amber-500">Stock</span>
      </motion.h1>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="text-2xl text-slate-400 text-center mb-2">The future of learning to trade.</motion.p>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="text-slate-500 text-center mb-10">No risk. Real skills. Compete with everyone.</motion.p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row gap-4">
        <a href="/Home" className="flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 rounded-2xl text-slate-900 font-black text-lg transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50">
          Start Trading <ArrowRight className="w-5 h-5" />
        </a>
        <div className="flex items-center gap-2 px-8 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold text-lg">
          <span>£10,000</span><span className="text-slate-400 font-normal text-base">virtual to start</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="mt-16 flex flex-wrap gap-8 justify-center text-center">
        {['Zero Financial Risk', 'Real Market Data', 'Competitive Rankings', 'AI Trading Coach'].map(item => (
          <div key={item} className="flex items-center gap-2 text-slate-400 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {item}
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}