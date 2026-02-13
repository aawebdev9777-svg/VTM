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
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Target className="w-5 h-5 text-orange-500" />
          Rival Watch
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rivalAbove && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-3 bg-red-50 border-2 border-red-200 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-red-700 uppercase">Target to Beat</span>
              <TrendingUp className="w-4 h-4 text-red-600" />
            </div>
            <p className="font-bold text-lg text-gray-900">{rivalAbove.name}</p>
            <p className="text-sm text-gray-600">
              £{Math.abs(rivalAbove.totalValue - currentTrader.totalValue).toFixed(0)} ahead
            </p>
            <p className="text-xs text-orange-600 font-semibold mt-1">
              ~{tradesNeeded(rivalAbove)} winning trades to overtake
            </p>
          </motion.div>
        )}
        
        <div className="p-3 bg-gradient-to-br from-violet-100 to-purple-100 border-2 border-violet-300 rounded-lg">
          <p className="text-xs font-semibold text-violet-700 uppercase mb-1">Your Position</p>
          <p className="font-bold text-2xl text-gray-900">#{currentUserIndex + 1}</p>
          <p className="text-sm text-gray-700">
            £{currentTrader.totalValue.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
          </p>
        </div>
        
        {rivalBelow && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-3 bg-green-50 border-2 border-green-200 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-green-700 uppercase">Chasing You</span>
              <TrendingDown className="w-4 h-4 text-green-600" />
            </div>
            <p className="font-bold text-lg text-gray-900">{rivalBelow.name}</p>
            <p className="text-sm text-gray-600">
              £{Math.abs(currentTrader.totalValue - rivalBelow.totalValue).toFixed(0)} behind
            </p>
            <p className="text-xs text-amber-600 font-semibold mt-1">
              Don't let them catch you!
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}