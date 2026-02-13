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
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            ABPF Stock Analysis
          </CardTitle>
          <div className="flex gap-1">
            {['1D', '1W', '1M', '3M'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 text-xs rounded ${
                  timeframe === tf 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-gray-100 text-gray-600'
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" style={{ fontSize: '11px' }} stroke="#6b7280" />
                <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} style={{ fontSize: '11px' }} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="price" stroke="#10b981" fill="url(#priceGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="technical">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" style={{ fontSize: '11px' }} stroke="#6b7280" />
                <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} style={{ fontSize: '11px' }} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" style={{ fontSize: '11px' }} stroke="#6b7280" />
                <YAxis style={{ fontSize: '11px' }} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="volume" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
        
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-2 bg-blue-50 rounded-lg text-center">
            <p className="text-xs text-blue-600 font-semibold">RSI</p>
            <p className="text-lg font-bold text-gray-900">52.3</p>
          </div>
          <div className="p-2 bg-green-50 rounded-lg text-center">
            <p className="text-xs text-green-600 font-semibold">MACD</p>
            <p className="text-lg font-bold text-gray-900">+0.24</p>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg text-center">
            <p className="text-xs text-purple-600 font-semibold">Vol</p>
            <p className="text-lg font-bold text-gray-900">1.8%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}