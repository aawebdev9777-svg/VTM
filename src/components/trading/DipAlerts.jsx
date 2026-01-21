import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DipAlerts({ stockPrices = [], displayPrices = {} }) {
  const dips = useMemo(() => {
    return stockPrices
      .map(stock => {
        const display = displayPrices[stock.symbol];
        if (!display) return null;
        
        const dailyChange = display.change || 0;
        const isDip = dailyChange < -1.5;
        
        return {
          symbol: stock.symbol,
          name: stock.name || stock.symbol,
          price: display.price,
          change: dailyChange,
          isDip
        };
      })
      .filter(Boolean)
      .filter(s => s.isDip)
      .sort((a, b) => a.change - b.change)
      .slice(0, 5);
  }, [stockPrices, displayPrices]);

  if (dips.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-orange-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-orange-600" />
          💰 Buy the Dip
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {dips.map((stock, idx) => (
          <motion.div
            key={stock.symbol}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg bg-white border border-orange-200"
          >
            <div>
              <div className="font-semibold text-gray-900 text-sm">{stock.symbol}</div>
              <div className="text-xs text-gray-500">£{stock.price.toFixed(2)}</div>
            </div>
            <Badge variant="destructive" className="text-xs">
              {stock.change.toFixed(2)}%
            </Badge>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}