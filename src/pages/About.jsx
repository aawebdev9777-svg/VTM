import React from 'react';
import { TrendingUp, Users, Brain, Trophy, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          About <span className="text-amber-500">VStock</span>
        </h1>
        <p className="text-xl text-slate-400 mb-12">Virtual Trading. Real Skills.</p>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            VStock is a gamified virtual stock trading platform designed to help anyone learn how to invest without risking real money. Whether you're a complete beginner who's never bought a share in your life, or an experienced investor who wants to test new strategies, VStock gives you a safe, realistic environment to practice, learn, and compete.
          </p>

          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            Every new user starts with £10,000 in virtual cash and can immediately begin trading real stocks at live market prices. The platform tracks your portfolio performance in real time, pays out hourly dividends on qualifying holdings, and ranks you on a global leaderboard against other traders. As you trade, you climb through six competitive tiers — from Bronze all the way up to Titan — earning achievements and badges along the way.
          </p>

          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            VStock is built for students learning personal finance, young professionals curious about investing, trading enthusiasts who want to sharpen their edge, and anyone who has ever wanted to participate in the stock market but felt intimidated by the risk. Our mission is to democratise financial literacy by making investing fun, social, and consequence-free.
          </p>

          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            Beyond individual trading, VStock features a social community where you can share trade ideas, post market insights, follow top performers, and even copy the trades of the best traders on the platform automatically. Our built-in AI trading coach analyses your portfolio in real time and offers personalised recommendations, risk alerts, and educational explanations to help you improve faster.
          </p>

          <p className="text-lg text-slate-300 leading-relaxed mb-8">
            VStock is developed and maintained by a passionate team of fintech and software engineers who believe that everyone deserves access to quality financial education. We are continuously improving the platform — adding new features, refining market simulations, and expanding our stock universe to give you the most realistic virtual trading experience possible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { IconComp: TrendingUp, title: 'Real Market Prices', desc: 'Trade at live prices with realistic market dynamics.' },
            { IconComp: Trophy, title: 'Compete Globally', desc: 'Climb the leaderboard through 6 competitive tiers.' },
            { IconComp: Brain, title: 'AI Trading Coach', desc: 'Personalised insights and recommendations 24/7.' },
            { IconComp: Users, title: 'Social Trading', desc: 'Follow top traders and copy their strategies.' },
            { IconComp: Shield, title: 'Zero Real Risk', desc: 'Practice freely with £10,000 virtual cash.' },
            { IconComp: Zap, title: 'Hourly Dividends', desc: 'Earn passive income on dividend-paying stocks.' },
          ].map(({ IconComp, title, desc }) => (
            <div key={title} className="p-5 bg-slate-800 rounded-xl border border-slate-700">
              <IconComp className="w-7 h-7 text-amber-500 mb-3" />
              <h3 className="font-bold text-white mb-1">{title}</h3>
              <p className="text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4 flex-wrap">
          <Link to="/Home" className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl transition-colors">
            Start Trading
          </Link>
          <Link to="/Contact" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-bold rounded-xl transition-colors">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}