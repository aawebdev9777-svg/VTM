import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PortfolioSummary from '../components/trading/PortfolioSummary';
import StockSearch from '../components/trading/StockSearch';
import TradePanel from '../components/trading/TradePanel';
import HoldingsList from '../components/trading/HoldingsList';
import TopStocks from '../components/trading/TopStocks';
import AlertsPanel from '../components/alerts/AlertsPanel';
import TradingChat from '../components/chat/TradingChat';
import StockNews from '../components/news/StockNews';
import { Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Home() {
  const [selectedStock, setSelectedStock] = useState(null);
  const [currentPrices, setCurrentPrices] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  // Fetch and update stock prices every 30 seconds
  const { data: stockPrices = [] } = useQuery({
    queryKey: ['stockPrices'],
    queryFn: async () => {
      return await base44.entities.StockPrice.list();
    },
    refetchInterval: 30000,
  });

  // Fetch user account (filtered by current user)
  const { data: accounts, isLoading: accountLoading } = useQuery({
    queryKey: ['userAccount', currentUser?.email],
    queryFn: async () => {
      const allAccounts = await base44.entities.UserAccount.list();
      const userAccounts = allAccounts.filter(acc => acc.created_by === currentUser?.email);
      return userAccounts.length > 0 ? userAccounts : [];
    },
    enabled: !!currentUser?.email,
  });

  // Fetch portfolio (filtered by current user)
  const { data: portfolio = [], isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio', currentUser?.email],
    queryFn: async () => {
      const allPortfolio = await base44.entities.Portfolio.list();
      return allPortfolio.filter(p => p.created_by === currentUser?.email);
    },
    enabled: !!currentUser?.email,
  });

  // Create account if doesn't exist
  const createAccountMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.UserAccount.create({ 
        cash_balance: 10000, 
        initial_balance: 10000 
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userAccount', currentUser?.email] }),
  });

  useEffect(() => {
    if (currentUser?.email && accounts && accounts.length === 0) {
      createAccountMutation.mutate();
    }
  }, [accounts, currentUser?.email]);

  const account = accounts?.[0];

  // Auto-update portfolio stock prices
  useEffect(() => {
    if (!portfolio || portfolio.length === 0) return;
    
    const updatePrices = async () => {
      const symbols = [...new Set(portfolio.map(p => p.symbol))];
      for (const symbol of symbols) {
        try {
          const response = await base44.functions.invoke('getStockPrice', { symbol });
          const existingPrices = await base44.entities.StockPrice.filter({ symbol });
          
          const priceData = {
            symbol,
            price_gbp: response.data.price_gbp,
            price_usd: response.data.price_usd,
            daily_change_percent: response.data.daily_change_percent,
            updated_at: new Date().toISOString()
          };

          if (existingPrices.length > 0) {
            await base44.entities.StockPrice.update(existingPrices[0].id, priceData);
          } else {
            await base44.entities.StockPrice.create(priceData);
          }
        } catch (error) {
          console.error(`Failed to update ${symbol}:`, error);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['stockPrices'] });
    };

    updatePrices();
    const interval = setInterval(updatePrices, 30000);
    return () => clearInterval(interval);
  }, [portfolio, queryClient]);

  // Trade mutation
  const tradeMutation = useMutation({
    mutationFn: async ({ type, stock, shares }) => {
      const totalAmount = shares * stock.price_gbp;
      
      if (type === 'buy') {
        // Update cash balance
        await base44.entities.UserAccount.update(account.id, {
          cash_balance: account.cash_balance - totalAmount
        });
        
        // Check if already own this stock
        const existingHolding = portfolio.find(p => p.symbol === stock.symbol);
        
        if (existingHolding) {
          const newTotalShares = existingHolding.shares + shares;
          const newAvgPrice = (
            (existingHolding.shares * existingHolding.average_buy_price) + totalAmount
          ) / newTotalShares;
          
          await base44.entities.Portfolio.update(existingHolding.id, {
            shares: newTotalShares,
            average_buy_price: newAvgPrice
          });
        } else {
          await base44.entities.Portfolio.create({
            symbol: stock.symbol,
            company_name: stock.company_name,
            shares: shares,
            average_buy_price: stock.price_gbp
          });
        }
        
        // Record transaction
        await base44.entities.Transaction.create({
          symbol: stock.symbol,
          company_name: stock.company_name,
          type: 'buy',
          shares: shares,
          price_per_share: stock.price_gbp,
          total_amount: totalAmount
        });
      } else {
        // Sell
        await base44.entities.UserAccount.update(account.id, {
          cash_balance: account.cash_balance + totalAmount
        });
        
        const existingHolding = portfolio.find(p => p.symbol === stock.symbol);
        
        if (existingHolding.shares === shares) {
          await base44.entities.Portfolio.delete(existingHolding.id);
        } else {
          await base44.entities.Portfolio.update(existingHolding.id, {
            shares: existingHolding.shares - shares
          });
        }
        
        await base44.entities.Transaction.create({
          symbol: stock.symbol,
          company_name: stock.company_name,
          type: 'sell',
          shares: shares,
          price_per_share: stock.price_gbp,
          total_amount: totalAmount
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAccount'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });

  const handleTrade = (type, stock, shares) => {
    tradeMutation.mutate({ type, stock, shares });
  };

  // Update current prices from StockPrice entity
  useEffect(() => {
    if (stockPrices.length > 0) {
      const pricesMap = {};
      stockPrices.forEach(sp => {
        pricesMap[sp.symbol] = sp.price_gbp;
      });
      setCurrentPrices(pricesMap);
    }
  }, [stockPrices]);

  const handleSelectStock = async (stock) => {
    // If stock is from TopStocks component (no price), fetch it
    if (!stock.price_gbp) {
      try {
        const response = await base44.functions.invoke('getStockPrice', { symbol: stock.symbol });
        const stockData = {
          ...response.data,
          company_name: response.data.name
        };
        
        setSelectedStock(stockData);
        setCurrentPrices(prev => ({
          ...prev,
          [stock.symbol]: stockData.price_gbp
        }));
      } catch (error) {
        console.error('Failed to fetch stock:', error);
      }
    } else {
      setSelectedStock(stock);
      setCurrentPrices(prev => ({
        ...prev,
        [stock.symbol]: stock.price_gbp
      }));
    }
  };

  // Calculate portfolio value
  const portfolioValue = portfolio.reduce((sum, holding) => {
    const price = currentPrices[holding.symbol] || holding.average_buy_price;
    return sum + (holding.shares * price);
  }, 0);

  if (accountLoading || portfolioLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Portfolio
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  £10,000 virtual cash • Live prices
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => queryClient.invalidateQueries()}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
        </motion.div>

        <div className="mb-6">
          <PortfolioSummary
              cashBalance={account?.cash_balance || 0}
              portfolioValue={portfolioValue}
              initialBalance={account?.initial_balance || 10000}
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <StockSearch 
              onSelectStock={handleSelectStock} 
              selectedStock={selectedStock}
            />
            <TopStocks onSelectStock={handleSelectStock} />
            <HoldingsList 
              portfolio={portfolio} 
              currentPrices={currentPrices}
            />
          </div>
          <div className="lg:sticky lg:top-6 h-fit space-y-4">
            <TradePanel
              selectedStock={selectedStock}
              cashBalance={account?.cash_balance || 0}
              portfolio={portfolio}
              onTrade={handleTrade}
            />
            <AlertsPanel selectedStock={selectedStock} />
          </div>
        </div>

      <TradingChat />

      <div className="mt-12 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
        <StockNews 
          symbol={selectedStock?.symbol} 
          companyName={selectedStock?.company_name || selectedStock?.name}
          autoLoad={!selectedStock}
        />
      </div>
    </div>
  );
}