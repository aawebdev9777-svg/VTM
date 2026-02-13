import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export default function PerformanceHeatmap({ transactions = [] }) {
  const today = new Date();
  const days = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayTrades = transactions.filter(t => t.created_date?.startsWith(dateStr));
    const profit = dayTrades.reduce((sum, t) => {
      if (t.type === 'sell') return sum + t.total_amount;
      if (t.type === 'buy') return sum - t.total_amount;
      return sum;
    }, 0);
    
    days.push({
      date: dateStr,
      trades: dayTrades.length,
      profit,
      day: date.getDate(),
    });
  }

  const getColor = (profit, trades) => {
    if (trades === 0) return 'bg-slate-200';
    if (profit > 500) return 'bg-green-600';
    if (profit > 0) return 'bg-green-400';
    if (profit < -500) return 'bg-red-600';
    if (profit < 0) return 'bg-red-400';
    return 'bg-slate-300';
  };

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Activity className="w-5 h-5 text-violet-600" />
          30-Day Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-10 gap-2">
          {days.map((day, i) => (
            <div
              key={i}
              className={`aspect-square rounded ${getColor(day.profit, day.trades)} transition-all hover:ring-2 hover:ring-violet-300 cursor-pointer`}
              title={`${day.date}: ${day.trades} trades, ${day.profit >= 0 ? '+' : ''}£${day.profit.toFixed(0)}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <span>Less active</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-slate-200 rounded"></div>
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <div className="w-3 h-3 bg-green-600 rounded"></div>
          </div>
          <span>More profitable</span>
        </div>
      </CardContent>
    </Card>
  );
}