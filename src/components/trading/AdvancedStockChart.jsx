import React, { useEffect, useState, useRef } from 'react';
import { createChart, ColorType, LineStyle } from 'lightweight-charts';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { calculateSMA, calculateEMA, calculateRSI, calculateMACD, enrichChartData } from './chartIndicators';

export default function AdvancedStockChart({ symbol, priceGbp, dailyChangePercent }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState('candlestick');
  const [indicators, setIndicators] = useState({
    sma20: false,
    sma50: false,
    ema12: false,
    rsi: false,
    macd: false
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await base44.functions.invoke('getStockHistory', {
          symbol,
          days: 60
        });
        const enriched = enrichChartData(response.data.data || []);
        setHistoricalData(enriched);
      } catch (error) {
        console.error('Failed to fetch stock history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol) fetchHistory();
  }, [symbol]);

  useEffect(() => {
    if (!historicalData.length || !containerRef.current) return;

    // Clean up old chart
    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#ffffff' } },
      width: containerRef.current.clientWidth,
      height: 400,
      timeScale: { timeVisible: true },
    });

    // Add candlestick/bar/line series
    let series;
    if (chartType === 'candlestick') {
      series = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#10b981',
        wickDownColor: '#ef4444',
        wickUpColor: '#10b981',
      });
    } else if (chartType === 'bar') {
      series = chart.addBarSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
      });
    } else {
      series = chart.addLineSeries({
        color: dailyChangePercent >= 0 ? '#10b981' : '#ef4444',
        lineWidth: 2,
      });
      series.setData(historicalData.map(d => ({ time: d.time, value: d.close })));
    }

    if (chartType !== 'line') {
      series.setData(historicalData);
    }

    // Add moving averages
    if (indicators.sma20) {
      const sma20 = calculateSMA(historicalData, 20);
      const smaData = historicalData
        .map((d, i) => sma20[i] !== null ? { time: d.time, value: sma20[i] } : null)
        .filter(d => d !== null);
      if (smaData.length) {
        const smaSeries = chart.addLineSeries({ color: '#f59e0b', lineWidth: 1 });
        smaSeries.setData(smaData);
      }
    }

    if (indicators.sma50) {
      const sma50 = calculateSMA(historicalData, 50);
      const smaData = historicalData
        .map((d, i) => sma50[i] !== null ? { time: d.time, value: sma50[i] } : null)
        .filter(d => d !== null);
      if (smaData.length) {
        const smaSeries = chart.addLineSeries({ color: '#8b5cf6', lineWidth: 1 });
        smaSeries.setData(smaData);
      }
    }

    if (indicators.ema12) {
      const ema12 = calculateEMA(historicalData, 12);
      const emaData = historicalData
        .map((d, i) => ema12[i] !== null ? { time: d.time, value: ema12[i] } : null)
        .filter(d => d !== null);
      if (emaData.length) {
        const emaSeries = chart.addLineSeries({ color: '#ec4899', lineWidth: 1 });
        emaSeries.setData(emaData);
      }
    }

    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [historicalData, chartType, indicators, dailyChangePercent]);

  const isPositive = dailyChangePercent >= 0;

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">Advanced Chart</CardTitle>
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
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Chart Type Selection */}
        <div className="flex gap-2 flex-wrap">
          {['candlestick', 'bar', 'line'].map(type => (
            <Button
              key={type}
              variant={chartType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType(type)}
              className={chartType === type ? 'bg-violet-600' : ''}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>

        {/* Indicator Toggles */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {[
            { key: 'sma20', label: 'SMA 20' },
            { key: 'sma50', label: 'SMA 50' },
            { key: 'ema12', label: 'EMA 12' },
            { key: 'rsi', label: 'RSI' },
            { key: 'macd', label: 'MACD' },
          ].map(ind => (
            <Button
              key={ind.key}
              variant={indicators[ind.key] ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIndicators(prev => ({ ...prev, [ind.key]: !prev[ind.key] }))}
              className={indicators[ind.key] ? 'bg-blue-600' : ''}
            >
              {ind.label}
            </Button>
          ))}
        </div>

        {/* Chart Container */}
        <div
          ref={containerRef}
          className="w-full bg-white rounded-lg border border-gray-200"
          style={{ height: '400px' }}
        />

        <div className="text-xs text-gray-500 text-center">
          60-day historical data • Technical indicators for analysis
        </div>
      </CardContent>
    </Card>
  );
}