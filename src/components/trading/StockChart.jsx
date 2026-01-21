import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StockChart({ symbol, priceGbp, dailyChangePercent }) {
  // Generate simulated 30-day historical data based on current price
  const generateHistoricalData = () => {
    const data = [];
    const days = 30;
    let price = priceGbp;
    
    // Work backwards from current price
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Add some realistic variation
      const variation = (Math.random() - 0.5) * (priceGbp * 0.03);
      price = price - variation;
      
      data.push({
        date: date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
        price: parseFloat(price.toFixed(2))
      });
    }
    
    // Ensure last point is the actual current price
    data[data.length - 1].price = priceGbp;
    
    return data;
  };

  const historicalData = generateHistoricalData();
  const isPositive = dailyChangePercent >= 0;
  const lineColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">30-Day Chart</span>
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
        </div>
        <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{dailyChangePercent?.toFixed(2)}%
        </span>
      </div>
      
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={historicalData}>
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={['auto', 'auto']}
            tick={{ fontSize: 10 }}
            width={45}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value) => `£${value}`}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}