import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, TrendingUp, TrendingDown, Wallet, DollarSign, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [shares, setShares] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        if (!user) base44.auth.redirectToLogin();
        setCurrentUser(user);
      })
      .catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: accounts, isLoading: accountLoading } = useQuery({
    queryKey: ['userAccount', currentUser?.email],
    queryFn: () => base44.entities.UserAccount.filter({ created_by: currentUser?.email }),
    enabled: !!currentUser?.email,
  });

  const { data: portfolio = [], isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio', currentUser?.email],
    queryFn: () => base44.entities.Portfolio.filter({ created_by: currentUser?.email }),
    enabled: !!currentUser?.email,
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

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', currentUser?.email],
    queryFn: () => base44.entities.Transaction.filter({ created_by: currentUser?.email }, '-created_date', 10),
    enabled: !!currentUser?.email,
  });

  const account = accounts?.[0];

  const portfolioValue = portfolio.reduce((sum, holding) => {
    const stockPrice = stockPrices.find(s => s.symbol === holding.symbol);
    const currentPrice = stockPrice?.price_gbp || holding.average_buy_price;
    return sum + (holding.shares * currentPrice);
  }, 0);

  const totalValue = (account?.cash_balance || 0) + portfolioValue;
  const profitLoss = totalValue - (account?.initial_balance || 10000);
  const profitPercent = ((profitLoss / (account?.initial_balance || 10000)) * 100);

  const buyMutation = useMutation({
    mutationFn: async ({ stock, shares }) => {
      const response = await base44.functions.invoke('buyStock', { stock, shares });
      if (!response.data.success) throw new Error(response.data.error || 'Transaction failed');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAccount'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setSelectedStock(null);
      setShares('');
    },
  });

  const sellMutation = useMutation({
    mutationFn: async ({ holdingId, shares }) => {
      const holding = portfolio.find(h => h.id === holdingId);
      const stockPrice = stockPrices.find(s => s.symbol === holding.symbol);
      const currentPrice = stockPrice?.price_gbp || holding.average_buy_price;
      const totalAmount = shares * currentPrice;

      await base44.entities.UserAccount.update(account.id, {
        cash_balance: account.cash_balance + totalAmount
      });

      if (shares >= holding.shares) {
        await base44.entities.Portfolio.delete(holdingId);
      } else {
        await base44.entities.Portfolio.update(holdingId, {
          shares: holding.shares - shares
        });
      }

      await base44.entities.Transaction.create({
        symbol: holding.symbol,
        company_name: holding.company_name,
        type: 'sell',
        shares: shares,
        price_per_share: currentPrice,
        total_amount: totalAmount
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAccount'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const filteredStocks = stockPrices.filter(stock =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (accountLoading || portfolioLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400 font-medium">Total Value</span>
                <Wallet className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-white mb-1">
                £{totalValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-sm font-semibold flex items-center gap-1 ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {profitLoss >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {profitLoss >= 0 ? '+' : ''}£{Math.abs(profitLoss).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%)
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400 font-medium">Cash Balance</span>
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-white">
                £{(account?.cash_balance || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-slate-400">Available to trade</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400 font-medium">Portfolio Value</span>
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-3xl font-black text-white">
                £{portfolioValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-slate-400">{portfolio.length} holdings</div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trading Panel */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-amber-500" />
                  Trade Stocks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search stocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                />

                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {filteredStocks.slice(0, 10).map(stock => (
                    <div
                      key={stock.symbol}
                      onClick={() => setSelectedStock(stock)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedStock?.symbol === stock.symbol
                          ? 'bg-amber-500/20 border border-amber-500'
                          : 'bg-slate-900/50 border border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">{stock.symbol}</div>
                          <div className="text-xs text-slate-400">£{stock.price_gbp?.toFixed(2)}</div>
                        </div>
                        <div className={`text-sm font-semibold ${(stock.daily_change_percent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {(stock.daily_change_percent || 0) >= 0 ? '+' : ''}{(stock.daily_change_percent || 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedStock && (
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">{selectedStock.symbol}</span>
                      <span className="text-slate-300">£{selectedStock.price_gbp?.toFixed(2)}</span>
                    </div>
                    <Input
                      type="number"
                      placeholder="Number of shares"
                      value={shares}
                      onChange={(e) => setShares(e.target.value)}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Total Cost:</span>
                      <span className="text-white font-bold">
                        £{(selectedStock.price_gbp * (parseInt(shares) || 0)).toFixed(2)}
                      </span>
                    </div>
                    <Button
                      onClick={() => buyMutation.mutate({ stock: selectedStock, shares: parseInt(shares) })}
                      disabled={!shares || buyMutation.isPending || (selectedStock.price_gbp * parseInt(shares)) > (account?.cash_balance || 0)}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      {buyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buy Shares'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {transactions.length === 0 && (
                    <p className="text-slate-400 text-center py-4">No transactions yet</p>
                  )}
                  {transactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${tx.type === 'buy' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <div className="text-white font-medium">{tx.symbol}</div>
                          <div className="text-xs text-slate-400">{tx.shares} shares</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${tx.type === 'buy' ? 'text-red-500' : 'text-green-500'}`}>
                          {tx.type === 'buy' ? '-' : '+'}£{tx.total_amount.toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-400">£{tx.price_per_share.toFixed(2)}/share</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Holdings */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Your Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[700px] overflow-y-auto">
                {portfolio.length === 0 && (
                  <p className="text-slate-400 text-center py-8">No holdings yet. Start trading!</p>
                )}
                {portfolio.map(holding => {
                  const stockPrice = stockPrices.find(s => s.symbol === holding.symbol);
                  const currentPrice = stockPrice?.price_gbp || holding.average_buy_price;
                  const value = holding.shares * currentPrice;
                  const invested = holding.shares * holding.average_buy_price;
                  const profit = value - invested;
                  const profitPercent = ((profit / invested) * 100);

                  return (
                    <div key={holding.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-lg font-bold text-white">{holding.symbol}</div>
                          <div className="text-sm text-slate-400">{holding.shares} shares</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">£{value.toFixed(2)}</div>
                          <div className={`text-sm font-semibold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {profit >= 0 ? '+' : ''}£{profit.toFixed(2)} ({profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="text-slate-400">
                          Avg Buy: <span className="text-white">£{holding.average_buy_price.toFixed(2)}</span>
                        </div>
                        <div className="text-slate-400">
                          Current: <span className="text-white">£{currentPrice.toFixed(2)}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => sellMutation.mutate({ holdingId: holding.id, shares: holding.shares })}
                        disabled={sellMutation.isPending}
                        variant="outline"
                        className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        {sellMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sell All'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}