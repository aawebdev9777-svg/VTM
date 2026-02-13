import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ label, value, change, icon: Icon, delay = 0 }) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white hover:shadow-xl transition-all">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">{label}</span>
            {Icon && <Icon className="w-4 h-4 text-slate-400" />}
          </div>
          <p className="text-2xl font-bold mb-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{isPositive ? '+' : ''}{change}%</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}