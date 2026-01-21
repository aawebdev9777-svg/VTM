import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BuyAnalysis({ stockPrices = [], displayPrices = {}, cashBalance = 0, totalPortfolioValue = 0 }) {
  const totalValue = cashBalance + totalPortfolioValue;
  const realStocks = new Set(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC', 'JPM', 'V', 'WMT', 'DIS', 'PYPL', 'CSCO', 'ADBE', 'CRM', 'ORCL', 'IBM']);
  
  const recommendations = useMemo(() => {
    return stockPrices
      .filter(stock => realStocks.has(stock.symbol))
      .map(stock => {
        const display = displayPrices[stock.symbol];
        if (!display) return null;
        
        const dailyChange = display.change || 0;
        
        // Buy dip signals - match what price will do
        if (dailyChange < -2) {
          const allocation = totalValue * 0.10;
          const shares = Math.floor(allocation / display.price);
          // Dips tend to recover 50-100% of the fall
          const recoveryTarget = Math.abs(dailyChange) * 0.75;
          const potentialGain = shares * display.price * (recoveryTarget / 100);
          
          return {
            symbol: stock.symbol,
            name: stock.name || stock.symbol,
            price: display.price,
            change: dailyChange,
            allocation: 10,
            shares,
            reason: 'Strong dip - will bounce',
            signal: 'strong',
            icon: TrendingDown,
            potentialGain,
            potentialPercent: recoveryTarget
          };
        } else if (dailyChange < -0.8) {
          const allocation = totalValue * 0.06;
          const shares = Math.floor(allocation / display.price);
          const recoveryTarget = Math.abs(dailyChange) * 0.6;
          const potentialGain = shares * display.price * (recoveryTarget / 100);
          
          return {
            symbol: stock.symbol,
            name: stock.name || stock.symbol,
            price: display.price,
            change: dailyChange,
            allocation: 6,
            shares,
            reason: 'Dip opportunity',
            signal: 'moderate',
            icon: TrendingDown,
            potentialGain,
            potentialPercent: recoveryTarget
          };
        }
        
        // Buy uptrend signals - follow momentum
        if (dailyChange > 1.2) {
          const allocation = totalValue * 0.08;
          const shares = Math.floor(allocation / display.price);
          // Momentum continues 50-80% more
          const continuationTarget = dailyChange * 0.65;
          const potentialGain = shares * display.price * (continuationTarget / 100);
          
          return {
            symbol: stock.symbol,
            name: stock.name || stock.symbol,
            price: display.price,
            change: dailyChange,
            allocation: 8,
            shares,
            reason: 'Hot trend - momentum play',
            signal: 'hot',
            icon: TrendingUp,
            potentialGain,
            potentialPercent: continuationTarget
          };
        } else if (dailyChange > 0.4) {
          const allocation = totalValue * 0.05;
          const shares = Math.floor(allocation / display.price);
          const continuationTarget = dailyChange * 0.5;
          const potentialGain = shares * display.price * (continuationTarget / 100);
          
          return {
            symbol: stock.symbol,
            name: stock.name || stock.symbol,
            price: display.price,
            change: dailyChange,
            allocation: 5,
            shares,
            reason: 'Positive momentum',
            signal: 'bullish',
            icon: TrendingUp,
            potentialGain,
            potentialPercent: continuationTarget
          };
        }
        
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => {
        // Sort by potential gain amount (highest first)
        return b.potentialGain - a.potentialGain;
      })
      .slice(0, 6);
  }, [stockPrices, displayPrices, totalValue]);

  if (recommendations.length === 0) {
    return null;
  }

  const signalColors = {
    strong: 'from-red-50 to-orange-50 border-red-500',
    hot: 'from-green-50 to-emerald-50 border-green-500',
    moderate: 'from-yellow-50 to-amber-50 border-yellow-500',
    bullish: 'from-blue-50 to-cyan-50 border-blue-500'
  };

  return (
    <Card className={`border-0 shadow-md bg-gradient-to-br ${signalColors[recommendations[0]?.signal] || signalColors.moderate} border-l-4`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-600 animate-pulse" />
          📊 Smart Trading Picks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, idx) => {
          const Icon = rec.icon;
          return (
            <motion.div
              key={rec.symbol}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="p-3 rounded-lg bg-white border-2 border-gray-100 hover:border-gray-300 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2 flex-1">
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${rec.change < 0 ? 'text-red-600' : 'text-green-600'}`} />
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{rec.symbol}</div>
                    <div className="text-xs text-gray-500">{rec.reason}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={rec.signal === 'strong' || rec.signal === 'hot' ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                    {rec.change > 0 ? '+' : ''}{rec.change.toFixed(2)}%
                  </Badge>
                  <Badge variant="outline" className="text-xs flex-shrink-0 bg-blue-50 text-blue-700 border-blue-200">
                    Upside: +£{Math.round(rec.potentialGain).toLocaleString()}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-600 text-xs">Allocate</div>
                  <div className="font-bold text-gray-900">{rec.allocation}%</div>
                  <div className="text-gray-500">£{(rec.allocation * totalValue / 100).toLocaleString('en-GB', {maximumFractionDigits: 0})}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-600 text-xs">Buy</div>
                  <div className="font-bold text-gray-900">{rec.shares.toLocaleString()}</div>
                  <div className="text-gray-500">shares</div>
                </div>
                <div className="bg-green-50 p-2 rounded border border-green-200">
                  <div className="text-green-700 text-xs font-semibold">Potential</div>
                  <div className="font-bold text-green-900">+£{Math.round(rec.potentialGain).toLocaleString()}</div>
                  <div className="text-green-600 text-xs">+{rec.potentialPercent.toFixed(1)}%</div>
                </div>
              </div>
            </motion.div>
          );
        })}
        
        <div className="pt-2 mt-2 border-t border-gray-200 text-xs text-gray-600">
          ⚡ Updates live • Follow allocations • Potential gains estimated
        </div>
      </CardContent>
    </Card>
  );
}