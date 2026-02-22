import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ABPFDetailedChart({ stockData = [] }) {
  const [timeframe, setTimeframe] = useState('1D');
  
  // Generate mock technical data
  const chartData = Array.from({ length: 24 }, (_, i) => {
    const basePrice = 125.5;
    const variation = (Math.random() - 0.5) * 2;
    return {
      time: `${i}:00`,
      price: parseFloat((basePrice + variation).toFixed(2)),
      volume: Math.floor(Math.random() * 1000 + 500),
      ema9: parseFloat((basePrice + variation * 0.5).toFixed(2)),
      ema21: parseFloat((basePrice + variation * 0.3).toFixed(2)),
    };
  });

  return (
    <Card className="bg-slate-800 border-slate-700 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-green-500" />
            ABPF Stock Analysis
          </CardTitle>
          <div className="flex gap-1">
            {['1D', '1W', '1M', '3M'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 text-xs rounded ${
                  timeframe === tf 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="price" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="price">Price</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
          </TabsList>
          
          <TabsContent value="price">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" style={{ fontSize: '11px' }} stroke="#94a3b8" />
                <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} style={{ fontSize: '11px' }} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
                  labelStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="price" stroke="#10b981" fill="url(#priceGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="technical">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" style={{ fontSize: '11px' }} stroke="#94a3b8" />
                <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} style={{ fontSize: '11px' }} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
                />
                <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} name="Price" />
                <Line type="monotone" dataKey="ema9" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="EMA 9" />
                <Line type="monotone" dataKey="ema21" stroke="#ef4444" strokeWidth={1.5} dot={false} name="EMA 21" />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="volume">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" style={{ fontSize: '11px' }} stroke="#94a3b8" />
                <YAxis style={{ fontSize: '11px' }} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="volume" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
        
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-2 bg-slate-950/60 rounded-lg text-center border border-slate-700/40">
            <p className="text-xs text-blue-400 font-semibold">RSI</p>
            <p className="text-lg font-bold text-white">52.3</p>
          </div>
          <div className="p-2 bg-slate-950/60 rounded-lg text-center border border-slate-700/40">
            <p className="text-xs text-green-400 font-semibold">MACD</p>
            <p className="text-lg font-bold text-white">+0.24</p>
          </div>
          <div className="p-2 bg-slate-950/60 rounded-lg text-center border border-slate-700/40">
            <p className="text-xs text-purple-400 font-semibold">Vol</p>
            <p className="text-lg font-bold text-white">1.8%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}