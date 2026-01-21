import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Trophy, TrendingUp, TrendingDown, Medal, Award, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Leaderboard() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: accounts = [] } = useQuery({
    queryKey: ['allAccounts'],
    queryFn: () => base44.asServiceRole.entities.UserAccount.list(),
    refetchInterval: 10000,
  });

  const { data: portfolios = [] } = useQuery({
    queryKey: ['allPortfolios'],
    queryFn: () => base44.asServiceRole.entities.Portfolio.list(),
    refetchInterval: 10000,
  });

  const { data: stockPrices = [] } = useQuery({
    queryKey: ['stockPrices'],
    queryFn: () => base44.entities.StockPrice.list(),
    refetchInterval: 30000,
  });

  const priceMap = {};
  stockPrices.forEach(sp => {
    priceMap[sp.symbol] = sp.price_gbp;
  });

  const leaderboardData = accounts
    .filter(acc => !acc.created_by?.includes('admin'))
    .map(account => {
      const userPortfolio = portfolios.filter(p => p.created_by === account.created_by);
      const portfolioValue = userPortfolio.reduce((sum, holding) => {
        const price = priceMap[holding.symbol] || holding.average_buy_price;
        return sum + (holding.shares * price);
      }, 0);

      const totalValue = account.cash_balance + portfolioValue;
      const initialBalance = account.initial_balance || 10000;
      const profitLoss = totalValue - initialBalance;
      const percentageGain = ((totalValue - initialBalance) / initialBalance) * 100;

      return {
        email: account.created_by,
        totalValue,
        profitLoss,
        percentageGain,
        portfolioValue,
        cashBalance: account.cash_balance,
      };
    })
    .sort((a, b) => b.percentageGain - a.percentageGain);

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-orange-600" />;
    return null;
  };

  const getRankBadge = (index) => {
    if (index === 0) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    if (index === 1) return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
    if (index === 2) return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">Top traders ranked by portfolio performance</p>
      </motion.div>

      <div className="space-y-3">
        {leaderboardData.map((trader, index) => {
          const isCurrentUser = trader.email === currentUser?.email;
          
          return (
            <motion.div
              key={trader.email}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`border-0 shadow-md hover:shadow-lg transition-all ${
                isCurrentUser ? 'ring-2 ring-violet-500' : ''
              } ${index < 3 ? 'bg-gradient-to-r from-gray-50 to-white' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${getRankBadge(index)}`}>
                      {getRankIcon(index) || `#${index + 1}`}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">
                          {trader.email.split('@')[0]}
                        </p>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs bg-violet-100 text-violet-700 border-violet-300">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Portfolio: £{trader.portfolioValue.toFixed(2)} • Cash: £{trader.cashBalance.toFixed(2)}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {trader.percentageGain >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`font-bold text-lg ${
                          trader.percentageGain >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trader.percentageGain >= 0 ? '+' : ''}{trader.percentageGain.toFixed(2)}%
                        </span>
                      </div>
                      <p className={`text-sm ${
                        trader.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trader.profitLoss >= 0 ? '+' : ''}£{trader.profitLoss.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}