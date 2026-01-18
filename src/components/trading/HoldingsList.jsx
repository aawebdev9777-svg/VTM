import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

export default function HoldingsList({ portfolio, currentPrices }) {
  if (portfolio.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Your Holdings
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No stocks in your portfolio yet</p>
          <p className="text-sm text-gray-400 mt-1">Search for a stock and buy to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Your Holdings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {portfolio.map((holding, index) => {
            const currentPrice = currentPrices[holding.symbol] || holding.average_buy_price;
            const totalValue = holding.shares * currentPrice;
            const totalCost = holding.shares * holding.average_buy_price;
            const profitLoss = totalValue - totalCost;
            const profitPercent = ((currentPrice - holding.average_buy_price) / holding.average_buy_price) * 100;
            const isProfit = profitLoss >= 0;

            return (
              <motion.div
                key={holding.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{holding.symbol}</h3>
                    <p className="text-sm text-gray-500">{holding.company_name}</p>
                    <p className="text-xs text-gray-400 mt-1">{holding.shares} shares @ £{holding.average_buy_price?.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      £{totalValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className={`text-sm flex items-center justify-end gap-1 ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                      {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isProfit ? '+' : ''}£{profitLoss.toFixed(2)} ({isProfit ? '+' : ''}{profitPercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}