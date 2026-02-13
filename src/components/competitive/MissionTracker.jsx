import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, CheckCircle, Circle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

const WEEKLY_MISSIONS = [
  { id: 1, title: 'Make 5 trades', target: 5, reward: '50 XP' },
  { id: 2, title: '3-day win streak', target: 3, reward: 'Streak Badge' },
  { id: 3, title: 'Gain £500 profit', target: 500, reward: '100 XP' },
  { id: 4, title: 'Beat 2 rivals', target: 2, reward: 'Rival Slayer' },
];

export default function MissionTracker({ transactions = [], rank = {} }) {
  const weeklyTrades = transactions.filter(t => {
    const daysSince = (Date.now() - new Date(t.created_date).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  }).length;
  
  const currentStreak = rank.win_streak || 0;
  const weeklyProfit = transactions
    .filter(t => {
      const daysSince = (Date.now() - new Date(t.created_date).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7 && t.type === 'sell';
    })
    .reduce((sum, t) => sum + (t.total_amount || 0), 0) - 
    transactions
    .filter(t => {
      const daysSince = (Date.now() - new Date(t.created_date).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7 && t.type === 'buy';
    })
    .reduce((sum, t) => sum + (t.total_amount || 0), 0);
  
  const getMissionProgress = (mission) => {
    switch (mission.id) {
      case 1: return { current: weeklyTrades, target: mission.target };
      case 2: return { current: currentStreak, target: mission.target };
      case 3: return { current: Math.max(0, weeklyProfit), target: mission.target };
      case 4: return { current: 0, target: mission.target };
      default: return { current: 0, target: mission.target };
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Zap className="w-5 h-5 text-yellow-400" />
          Weekly Missions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {WEEKLY_MISSIONS.map((mission, i) => {
          const progress = getMissionProgress(mission);
          const percentage = Math.min((progress.current / progress.target) * 100, 100);
          const isComplete = progress.current >= progress.target;
          
          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-3 rounded-lg border ${
                isComplete 
                  ? 'bg-green-900/20 border-green-500/30' 
                  : 'bg-slate-800/50 border-slate-700/30'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500" />
                  )}
                  <span className="text-sm font-semibold">{mission.title}</span>
                </div>
                <span className="text-xs text-yellow-400">{mission.reward}</span>
              </div>
              <Progress value={percentage} className="h-2 mb-1" />
              <p className="text-xs text-slate-400">
                {progress.current} / {progress.target} {mission.id === 3 && '(£)'}
              </p>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}