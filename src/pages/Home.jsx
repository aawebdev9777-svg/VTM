import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PortfolioSummary from '../components/trading/PortfolioSummary';
import StockSearch from '../components/trading/StockSearch';
import TradePanel from '../components/trading/TradePanel';
import HoldingsList from '../components/trading/HoldingsList';
import { Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Home() {
  const [selectedStock, setSelectedStock] = useState(null);
  const [currentPrices, setCurrentPrices] = useState({});
  const queryClient = useQueryClient();

  // Fetch user account
  const { data: accounts, isLoading: accountLoading } = useQuery({
    queryKey: ['userAccount'],
    queryFn: () => base44.entities.UserAccount.list(),
  });

  // Fetch portfolio
  const { data: portfolio = [], isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => base44.entities.Portfolio.list(),
  });

  // Create account if doesn't exist
  const createAccountMutation = useMutation({
    mutationFn: () => base44.entities.UserAccount.create({ 
      cash_balance: 10000, 
      initial_balance: 10000 
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userAccount'] }),
  });

  useEffect(() => {
    if (accounts && accounts.length === 0) {
      createAccountMutation.mutate();
    }
  }, [accounts]);

  const account = accounts?.[0];

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

  const handleSelectStock = (stock) => {
    setSelectedStock(stock);
    setCurrentPrices(prev => ({
      ...prev,
      [stock.symbol]: stock.price_gbp
    }));
  };

  // Calculate portfolio value
  const portfolioValue = portfolio.reduce((sum, holding) => {
    const price = currentPrices[holding.symbol] || holding.average_buy_price;
    return sum + (holding.shares * price);
  }, 0);

  if (accountLoading || portfolioLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-violet-600" />
                Stock Trading Simulator
              </h1>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                Practice trading with £10,000 virtual cash • Live market prices
              </p>
            </div>
            <div className="flex gap-2">
              <Link to={createPageUrl('Transactions')}>
                <Button variant="outline" size="sm">
                  History
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => queryClient.invalidateQueries()}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="mb-6">
          <PortfolioSummary
            cashBalance={account?.cash_balance || 10000}
            portfolioValue={portfolioValue}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <StockSearch 
              onSelectStock={handleSelectStock} 
              selectedStock={selectedStock}
            />
            <HoldingsList 
              portfolio={portfolio} 
              currentPrices={currentPrices}
            />
          </div>
          <div className="lg:sticky lg:top-6 h-fit">
            <TradePanel
              selectedStock={selectedStock}
              cashBalance={account?.cash_balance || 10000}
              portfolio={portfolio}
              onTrade={handleTrade}
            />
          </div>
        </div>
      </div>
    </div>
  );
}