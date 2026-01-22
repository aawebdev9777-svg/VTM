import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Coins } from "lucide-react";
import { motion } from "framer-motion";

export default function PortfolioSummary({ cashBalance, portfolioValue, initialBalance = 10000, leaderboard = [], currentUserEmail }) {
  const totalValue = cashBalance + portfolioValue;
  const totalReturn = totalValue - initialBalance;
  const returnPercentage = initialBalance > 0 ? (totalReturn / initialBalance) * 100 : 0;
  const isProfit = returnPercentage >= 0;
  
  const currentUserData = leaderboard.find(u => u.email === currentUserEmail);
  const hourlyDividends = currentUserData?.hourlyDividends || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.03, y: -4 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-xs md:text-sm font-medium opacity-90 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              Cash Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-2xl md:text-3xl font-bold">£{cashBalance.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.03, y: -4 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-violet-500 via-violet-600 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-xs md:text-sm font-medium opacity-90 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <PiggyBank className="w-4 h-4" />
              </div>
              Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-2xl md:text-3xl font-bold">£{portfolioValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.03, y: -4 }}
        className="sm:col-span-2 lg:col-span-1"
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-yellow-600 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-xs md:text-sm font-medium opacity-90 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
              Hourly Dividends
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-2xl md:text-3xl font-bold">
              💰 £{hourlyDividends.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/hr
            </p>
            <p className="text-xs md:text-sm opacity-75 mt-1">
              £{totalValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}