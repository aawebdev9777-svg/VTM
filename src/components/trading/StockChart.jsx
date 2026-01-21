import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function StockChart({ symbol, priceGbp, dailyChangePercent }) {
  const [historicalData, setHistoricalData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await base44.functions.invoke('getStockHistory', {
          symbol,
          days: timeRange
        });
        setHistoricalData(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch stock history:', error);
        setHistoricalData([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol) {
      fetchHistory();
    }
  }, [symbol, timeRange]);
  const isPositive = dailyChangePercent >= 0;
  const lineColor = isPositive ? '#10b981' : '#ef4444';

  if (isLoading) {
    return (
      <div className="h-[220px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!historicalData.length) {
    return (
      <div className="h-[220px] flex items-center justify-center">
        <p className="text-sm text-gray-400">Chart unavailable</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Price Chart</span>
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

      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => setTimeRange(30)}
          variant={timeRange === 30 ? 'default' : 'outline'}
          size="sm"
          className="text-xs"
        >
          1M
        </Button>
        <Button
          onClick={() => setTimeRange(365)}
          variant={timeRange === 365 ? 'default' : 'outline'}
          size="sm"
          className="text-xs"
        >
          1Y
        </Button>
        <Button
          onClick={() => setTimeRange(3650)}
          variant={timeRange === 3650 ? 'default' : 'outline'}
          size="sm"
          className="text-xs"
        >
          10Y
        </Button>
        <Button
          onClick={() => setTimeRange(999999)}
          variant={timeRange === 999999 ? 'default' : 'outline'}
          size="sm"
          className="text-xs"
        >
          All
        </Button>
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