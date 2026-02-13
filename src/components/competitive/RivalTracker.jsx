import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RivalTracker({ leaderboard = [], currentUser }) {
  if (!currentUser || leaderboard.length === 0) return null;
  
  const currentUserIndex = leaderboard.findIndex(t => t.email === currentUser.email);
  if (currentUserIndex === -1) return null;
  
  // Get rival above
  const rivalAbove = currentUserIndex > 0 ? leaderboard[currentUserIndex - 1] : null;
  
  // Get rival below
  const rivalBelow = currentUserIndex < leaderboard.length - 1 ? leaderboard[currentUserIndex + 1] : null;
  
  const currentTrader = leaderboard[currentUserIndex];
  
  const tradesNeeded = (target) => {
    if (!target) return 0;
    const gap = target.totalValue - currentTrader.totalValue;
    const avgTradeSize = 500; // Estimate
    return Math.ceil(gap / avgTradeSize);
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Target className="w-5 h-5 text-orange-400" />
          Rival Watch
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rivalAbove && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-red-400 font-semibold">Target to Beat</span>
              <TrendingUp className="w-4 h-4 text-red-400" />
            </div>
            <p className="font-bold text-lg">{rivalAbove.name}</p>
            <p className="text-xs text-slate-300">
              £{Math.abs(rivalAbove.totalValue - currentTrader.totalValue).toFixed(0)} ahead
            </p>
            <p className="text-xs text-orange-400 mt-1">
              ~{tradesNeeded(rivalAbove)} winning trades to overtake
            </p>
          </motion.div>
        )}
        
        <div className="p-3 bg-violet-900/20 border border-violet-500/30 rounded-lg">
          <p className="text-sm text-violet-400 mb-1">Your Position</p>
          <p className="font-bold text-2xl">#{currentUserIndex + 1}</p>
          <p className="text-xs text-slate-300">
            £{currentTrader.totalValue.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
          </p>
        </div>
        
        {rivalBelow && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-400 font-semibold">Chasing You</span>
              <TrendingDown className="w-4 h-4 text-green-400" />
            </div>
            <p className="font-bold text-lg">{rivalBelow.name}</p>
            <p className="text-xs text-slate-300">
              £{Math.abs(currentTrader.totalValue - rivalBelow.totalValue).toFixed(0)} behind
            </p>
            <p className="text-xs text-yellow-400 mt-1">
              Don't let them catch you!
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}