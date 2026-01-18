import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function MarketStats() {
  const { data: stockPrices = [] } = useQuery({
    queryKey: ['marketStockPrices'],
    queryFn: () => base44.entities.StockPrice.list(),
    refetchInterval: 30000,
  });

  const { data: allTransactions = [] } = useQuery({
    queryKey: ['marketTransactions'],
    queryFn: () => base44.asServiceRole.entities.Transaction.list(),
  });

  const { data: allPortfolios = [] } = useQuery({
    queryKey: ['marketPortfolios'],
    queryFn: () => base44.asServiceRole.entities.Portfolio.list(),
  });

  // Calculate market stats
  const totalVolume = allTransactions.reduce((sum, t) => sum + t.total_amount, 0);
  const avgPrice = stockPrices.length > 0 ? stockPrices.reduce((sum, s) => sum + s.price_gbp, 0) / stockPrices.length : 0;
  const totalShares = allPortfolios.reduce((sum, p) => sum + p.shares, 0);
  
  const marketCapitalization = allPortfolios.reduce((sum, p) => {
    const price = stockPrices.find(sp => sp.symbol === p.symbol)?.price_gbp || p.average_buy_price;
    return sum + (p.shares * price);
  }, 0);

  // Top gainers/losers
  const topMovers = stockPrices
    .sort((a, b) => Math.abs(b.daily_change_percent || 0) - Math.abs(a.daily_change_percent || 0))
    .slice(0, 5);

  // Most traded
  const tradedCounts = {};
  allTransactions.forEach(t => {
    tradedCounts[t.symbol] = (tradedCounts[t.symbol] || 0) + 1;
  });
  const mostTraded = Object.entries(tradedCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Market Cap</p>
                  <p className="text-sm font-bold text-gray-900">£{marketCapitalization.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Volume</p>
                  <p className="text-sm font-bold text-gray-900">£{totalVolume.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg Price</p>
                  <p className="text-sm font-bold text-gray-900">£{avgPrice.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Shares</p>
                  <p className="text-sm font-bold text-gray-900">{totalShares.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Movers */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm">Top Movers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topMovers.map((stock) => (
              <div key={stock.symbol} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{stock.symbol}</span>
                  {stock.daily_change_percent >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <span className={`text-sm font-bold ${stock.daily_change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.daily_change_percent >= 0 ? '+' : ''}{(stock.daily_change_percent || 0).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Most Traded */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm">Most Traded</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mostTraded.map(([symbol, count]) => (
              <div key={symbol} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <span className="font-medium text-sm">{symbol}</span>
                <span className="text-sm font-bold text-gray-700">{count} trades</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}