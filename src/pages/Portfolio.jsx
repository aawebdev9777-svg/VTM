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
    queryFn: () => base44.entities.Portfolio.filter({ created_by: currentUser?.email }),
    enabled: !!currentUser?.email,
    refetchInterval: 2000,
  });

  const { data: stockPrices = [] } = useQuery({
    queryKey: ['stockPrices'],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('getUpdatedPrices', {});
        return response.data.prices || [];
      } catch {
        return base44.entities.StockPrice.list();
      }
    },
    refetchInterval: 5000,
  });

  const { data: accounts } = useQuery({
    queryKey: ['userAccount', currentUser?.email],
    queryFn: () => base44.entities.UserAccount.filter({ created_by: currentUser?.email }),
    enabled: !!currentUser?.email,
    refetchInterval: 2000,
  });

  const { data: myCopyTrades = [] } = useQuery({
    queryKey: ['myCopyTrades', currentUser?.email],
    queryFn: () => base44.entities.CopyTrade.filter({ follower_email: currentUser?.email, is_active: true }),
    enabled: !!currentUser?.email,
    refetchInterval: 2000,
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getLeaderboard', {});
      return response.data.leaderboard || [];
    },
    refetchInterval: 5000,
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

  const sellMutation = useMutation({
    mutationFn: async ({ holding, shares }) => {
      const totalAmount = shares * holding.currentPrice;
      const newShares = holding.shares - shares;

      // Update cash balance
      await base44.entities.UserAccount.update(account.id, {
        cash_balance: account.cash_balance + totalAmount
      });

      // Update or delete holding
      if (newShares === 0) {
        await base44.entities.Portfolio.delete(holding.id);
      } else {
        await base44.entities.Portfolio.update(holding.id, {
          shares: newShares
        });
      }

      // Record transaction
      await base44.entities.Transaction.create({
        symbol: holding.symbol,
        company_name: holding.company_name,
        type: 'sell',
        shares: shares,
        price_per_share: holding.currentPrice,
        total_amount: totalAmount
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', currentUser?.email] });
      queryClient.invalidateQueries({ queryKey: ['userAccount', currentUser?.email] });
      setSellDialogOpen(false);
      setSelectedHolding(null);
      setSellShares('');
    },
  });

  const stopCopyTradeMutation = useMutation({
    mutationFn: async (copyTrade) => {
      // Calculate current value
      const leaderData = leaderboard.find(l => l.email === copyTrade.leader_email);
      const currentValue = copyTrade.investment_amount * (1 + ((leaderData?.percentageReturn || 0) / 100));

      // Stop copy trade
      await base44.entities.CopyTrade.update(copyTrade.id, {
        is_active: false
      });

      // Add value back to cash balance
      await base44.entities.UserAccount.update(account.id, {
        cash_balance: account.cash_balance + currentValue
      });

      // Record transaction
      await base44.entities.Transaction.create({
        symbol: 'COPY',
        company_name: `Stop Copy Trading - ${copyTrade.leader_email.split('@')[0]}`,
        type: 'sell',
        shares: 0,
        price_per_share: 0,
        total_amount: currentValue
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCopyTrades', currentUser?.email] });
      queryClient.invalidateQueries({ queryKey: ['userAccount', currentUser?.email] });
      queryClient.invalidateQueries({ queryKey: ['recentTransactions'] });
    },
  });

  const handleSell = () => {
    const shares = parseFloat(sellShares);
    if (shares > 0 && shares <= selectedHolding.shares) {
      sellMutation.mutate({ holding: selectedHolding, shares });
    }
  };

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

  // Calculate copy trade values
  const copyTradesWithMetrics = myCopyTrades.map(ct => {
    const leaderData = leaderboard.find(l => l.email === ct.leader_email);
    const currentValue = ct.investment_amount * (1 + ((leaderData?.percentageReturn || 0) / 100));
    const profitLoss = currentValue - ct.investment_amount;
    return {
      ...ct,
      currentValue,
      profitLoss,
      leaderName: ct.leader_email.split('@')[0],
      leaderReturn: leaderData?.percentageReturn || 0,
    };
  });

  const totalCopyTradeValue = copyTradesWithMetrics.reduce((sum, ct) => sum + ct.currentValue, 0);
  const totalCopyTradeInvested = myCopyTrades.reduce((sum, ct) => sum + ct.investment_amount, 0);
  const totalCopyTradePL = totalCopyTradeValue - totalCopyTradeInvested;

  const totalPortfolioValue = portfolioWithMetrics.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCostBasis = portfolioWithMetrics.reduce((sum, h) => sum + h.costBasis, 0);
  
  // Combined metrics including copy trades
  const combinedInvested = totalCostBasis + totalCopyTradeInvested;
  const combinedCurrentValue = totalPortfolioValue + totalCopyTradeValue;
  const combinedProfitLoss = (totalPortfolioValue - totalCostBasis) + totalCopyTradePL;
  const combinedProfitLossPercent = combinedInvested > 0 ? (combinedProfitLoss / combinedInvested) * 100 : 0;
  const totalValue = cashBalance + totalPortfolioValue + totalCopyTradeValue;

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
                  <p className="text-lg font-bold text-gray-900">£{combinedInvested.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
                combinedProfitLoss >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {combinedProfitLoss >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500">P/L Amount</p>
                <p className={`text-lg font-bold ${combinedProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {combinedProfitLoss >= 0 ? '+' : ''}£{combinedProfitLoss.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                combinedProfitLossPercent >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Percent className={`w-6 h-6 ${combinedProfitLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">P/L Percent</p>
                <p className={`text-lg font-bold ${combinedProfitLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {combinedProfitLossPercent >= 0 ? '+' : ''}{combinedProfitLossPercent.toFixed(2)}%
                </p>
              </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Copy Trading Holdings */}
      {myCopyTrades.length > 0 && (
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle>Copy Trading Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trader</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Invested</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Current Value</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">P/L</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {copyTradesWithMetrics.map((ct, index) => (
                    <motion.tr
                      key={ct.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-bold text-gray-900">Copying {ct.leaderName}</p>
                          <p className="text-xs text-gray-500">Return: {ct.leaderReturn >= 0 ? '+' : ''}{ct.leaderReturn.toFixed(2)}%</p>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4 text-gray-900">
                        £{ct.investment_amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="text-right py-4 px-4 font-medium text-gray-900">
                        £{ct.currentValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="text-right py-4 px-4">
                        <div className="flex flex-col items-end gap-1">
                          <p className={`font-bold ${ct.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {ct.profitLoss >= 0 ? '+' : ''}£{ct.profitLoss.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <Badge variant={ct.profitLoss >= 0 ? 'default' : 'destructive'} className="text-xs">
                            {ct.leaderReturn >= 0 ? '+' : ''}{ct.leaderReturn.toFixed(2)}%
                          </Badge>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => stopCopyTradeMutation.mutate(ct)}
                          disabled={stopCopyTradeMutation.isPending}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          {stopCopyTradeMutation.isPending ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Stopping...
                            </>
                          ) : (
                            'Stop'
                          )}
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Holdings Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Stock Holdings</CardTitle>
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
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
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
                      <td className="text-right py-4 px-4">
                        <Dialog open={sellDialogOpen && selectedHolding?.id === holding.id} onOpenChange={(open) => {
                          setSellDialogOpen(open);
                          if (!open) {
                            setSelectedHolding(null);
                            setSellShares('');
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedHolding(holding)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Sell
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Sell {holding.symbol}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <p className="text-sm text-gray-600 mb-2">Shares owned: {holding.shares}</p>
                                <p className="text-sm text-gray-600 mb-2">Current price: £{holding.currentPrice?.toFixed(2)}</p>
                                <label className="text-sm text-gray-600 block mb-2">Shares to sell</label>
                                <Input
                                  type="number"
                                  placeholder="Enter shares"
                                  value={sellShares}
                                  onChange={(e) => setSellShares(e.target.value)}
                                  min="0"
                                  max={holding.shares}
                                  step="1"
                                  className="h-10"
                                />
                                {sellShares && (
                                  <p className="text-sm text-gray-600 mt-2">Total: £{(parseFloat(sellShares) * holding.currentPrice).toFixed(2)}</p>
                                )}
                              </div>
                              <Button
                                onClick={handleSell}
                                disabled={!sellShares || parseFloat(sellShares) <= 0 || parseFloat(sellShares) > holding.shares || sellMutation.isPending}
                                className="w-full bg-red-600 hover:bg-red-700"
                              >
                                {sellMutation.isPending ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Selling...
                                  </>
                                ) : (
                                  'Sell'
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
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