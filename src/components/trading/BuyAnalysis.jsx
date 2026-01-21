import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BuyAnalysis({ stockPrices = [], displayPrices = {}, cashBalance = 0 }) {
  const recommendations = useMemo(() => {
    return stockPrices
      .map(stock => {
        const display = displayPrices[stock.symbol];
        if (!display) return null;
        
        const dailyChange = display.change || 0;
        
        // Buy signal logic
        if (dailyChange < -2) {
          // Strong dip - allocate 10% of cash
          const allocation = cashBalance * 0.10;
          const shares = Math.floor(allocation / display.price);
          
          return {
            symbol: stock.symbol,
            name: stock.name || stock.symbol,
            price: display.price,
            change: dailyChange,
            allocation: 10,
            shares,
            reason: 'Strong dip detected',
            signal: 'strong'
          };
        } else if (dailyChange < -1) {
          // Moderate dip - allocate 6% of cash
          const allocation = cashBalance * 0.06;
          const shares = Math.floor(allocation / display.price);
          
          return {
            symbol: stock.symbol,
            name: stock.name || stock.symbol,
            price: display.price,
            change: dailyChange,
            allocation: 6,
            shares,
            reason: 'Moderate dip',
            signal: 'moderate'
          };
        }
        
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.change - b.change)
      .slice(0, 5);
  }, [stockPrices, displayPrices, cashBalance]);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-green-50 border-l-4 border-green-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-green-600" />
          📊 Buy Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, idx) => (
          <motion.div
            key={rec.symbol}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-3 rounded-lg bg-white border border-green-200"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-semibold text-gray-900 text-sm">{rec.symbol}</div>
                <div className="text-xs text-gray-500">{rec.reason}</div>
              </div>
              <Badge variant={rec.signal === 'strong' ? 'default' : 'secondary'} className="text-xs">
                {rec.change.toFixed(2)}%
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-600">Allocate</div>
                <div className="font-bold text-gray-900">{rec.allocation}% (£{(rec.allocation * cashBalance / 100).toFixed(2)})</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-600">Buy</div>
                <div className="font-bold text-gray-900">{rec.shares} shares</div>
              </div>
            </div>
          </motion.div>
        ))}
        
        <div className="pt-2 mt-2 border-t border-green-200 text-xs text-gray-600">
          💡 Tip: Follow allocation amounts for optimal risk management
        </div>
      </CardContent>
    </Card>
  );
}