import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Briefcase, TrendingUp, TrendingDown, DollarSign, Percent, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Portfolio() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [sellShares, setSellShares] = useState('');

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: portfolio = [] } = useQuery({
    queryKey: ['portfolio', currentUser?.email],
    queryFn: async () => {
      const allPortfolio = await base44.entities.Portfolio.list();
      return allPortfolio.filter(p => p.created_by === currentUser?.email);
    },
    enabled: !!currentUser?.email,
    refetchInterval: 2000,
  });

  const { data: stockPrices = [] } = useQuery({
    queryKey: ['stockPrices'],
    queryFn: () => base44.entities.StockPrice.list(),
    refetchInterval: 2000,
  });

  const { data: accounts } = useQuery({
    queryKey: ['userAccount', currentUser?.email],
    queryFn: async () => {
      const allAccounts = await base44.entities.UserAccount.list();
      return allAccounts.filter(acc => acc.created_by === currentUser?.email);
    },
    enabled: !!currentUser?.email,
    refetchInterval: 2000,
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribePortfolio = base44.entities.Portfolio.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    });

    const unsubscribePrices = base44.entities.StockPrice.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['stockPrices'] });
    });

    const unsubscribeAccount = base44.entities.UserAccount.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['userAccount'] });
    });

    return () => {
      unsubscribePortfolio();
      unsubscribePrices();
      unsubscribeAccount();
    };
  }, [queryClient]);

  const account = accounts?.[0];
  const cashBalance = account?.cash_balance || 10000;

  // Calculate portfolio metrics
  const portfolioWithMetrics = portfolio.map(holding => {
    const latestPrice = stockPrices.find(sp => sp.symbol === holding.symbol)?.price_gbp || holding.average_buy_price;
    const currentValue = holding.shares * latestPrice;
    const costBasis = holding.shares * holding.average_buy_price;
    const profitLoss = currentValue - costBasis;
    const profitLossPercent = ((latestPrice - holding.average_buy_price) / holding.average_buy_price) * 100;

    return {
      ...holding,
      currentPrice: latestPrice,
      currentValue,
      costBasis,
      profitLoss,
      profitLossPercent
    };
  });

  const totalPortfolioValue = portfolioWithMetrics.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCostBasis = portfolioWithMetrics.reduce((sum, h) => sum + h.costBasis, 0);
  const totalProfitLoss = totalPortfolioValue - totalCostBasis;
  const totalProfitLossPercent = totalCostBasis > 0 ? (totalProfitLoss / totalCostBasis) * 100 : 0;
  const totalValue = cashBalance + totalPortfolioValue;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-violet-600" />
          Portfolio Analysis
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Detailed view of your holdings and performance
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Value</p>
                  <p className="text-lg font-bold text-gray-900">£{totalValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Invested</p>
                  <p className="text-lg font-bold text-gray-900">£{totalPortfolioValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  totalProfitLoss >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {totalProfitLoss >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">P/L Amount</p>
                  <p className={`text-lg font-bold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalProfitLoss >= 0 ? '+' : ''}£{totalProfitLoss.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  totalProfitLossPercent >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Percent className={`w-6 h-6 ${totalProfitLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">P/L Percent</p>
                  <p className={`text-lg font-bold ${totalProfitLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalProfitLossPercent >= 0 ? '+' : ''}{totalProfitLossPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Holdings Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Your Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {portfolio.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No holdings yet</p>
              <p className="text-sm text-gray-400 mt-1">Start trading to build your portfolio</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Stock</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Shares</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Cost</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Current</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Value</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">P/L</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioWithMetrics.map((holding, index) => (
                    <motion.tr
                      key={holding.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-bold text-gray-900">{holding.symbol}</p>
                          <p className="text-xs text-gray-500">{holding.company_name}</p>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4 text-gray-900">{holding.shares.toLocaleString()}</td>
                      <td className="text-right py-4 px-4 text-gray-900">£{holding.average_buy_price?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-right py-4 px-4 text-gray-900">£{holding.currentPrice?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-right py-4 px-4 font-medium text-gray-900">
                        £{holding.currentValue?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="text-right py-4 px-4">
                        <div className="flex flex-col items-end gap-1">
                          <p className={`font-bold ${holding.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {holding.profitLoss >= 0 ? '+' : ''}£{holding.profitLoss?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <Badge variant={holding.profitLoss >= 0 ? 'default' : 'destructive'} className="text-xs">
                            {holding.profitLossPercent >= 0 ? '+' : ''}{holding.profitLossPercent?.toFixed(2)}%
                          </Badge>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}