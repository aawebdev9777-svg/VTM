import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PortfolioSummary from '../components/trading/PortfolioSummary';
import StockSearch from '../components/trading/StockSearch';
import BuyStockPanel from '../components/trading/BuyStockPanel';
import HoldingsList from '../components/trading/HoldingsList';
import TopStocks from '../components/trading/TopStocks';
import AlertsPanel from '../components/alerts/AlertsPanel';
import StockNews from '../components/news/StockNews';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Home() {
  const [selectedStock, setSelectedStock] = useState(null);
  const [currentPrices, setCurrentPrices] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: stockPrices = [] } = useQuery({
    queryKey: ['stockPrices'],
    queryFn: () => base44.entities.StockPrice.list(),
    refetchInterval: 30000,
  });

  const { data: accounts, isLoading: accountLoading } = useQuery({
    queryKey: ['userAccount', currentUser?.email],
    queryFn: () => base44.entities.UserAccount.filter({ created_by: currentUser?.email }),
    enabled: !!currentUser?.email,
    refetchInterval: 2000,
  });

  const { data: portfolio = [], isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio', currentUser?.email],
    queryFn: () => base44.entities.Portfolio.filter({ created_by: currentUser?.email }),
    enabled: !!currentUser?.email,
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (!currentUser?.email) return;
    
    const unsubscribePortfolio = base44.entities.Portfolio.subscribe((event) => {
      if (event.data?.created_by === currentUser?.email) {
        queryClient.invalidateQueries({ queryKey: ['portfolio', currentUser?.email] });
      }
    });

    const unsubscribeAccount = base44.entities.UserAccount.subscribe((event) => {
      if (event.data?.created_by === currentUser?.email) {
        queryClient.invalidateQueries({ queryKey: ['userAccount', currentUser?.email] });
      }
    });

    return () => {
      unsubscribePortfolio();
      unsubscribeAccount();
    };
  }, [currentUser?.email, queryClient]);

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
    if (currentUser?.email && accounts?.length === 0) {
      createAccountMutation.mutate();
    }
  }, [accounts, currentUser?.email]);

  const account = accounts?.[0];

  const buyMutation = useMutation({
    mutationFn: async ({ stock, shares }) => {
      await base44.functions.invoke('buyStock', { stock, shares });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['userAccount', currentUser?.email] });
      await queryClient.invalidateQueries({ queryKey: ['portfolio', currentUser?.email] });
    },
  });

  const handleBuy = (stock, shares) => {
    buyMutation.mutate({ stock, shares });
  };

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
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Portfolio</h1>
            <p className="text-gray-500 mt-2">£10,000 virtual cash • Live prices</p>
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

      <div className="mb-8">
        <PortfolioSummary
          cashBalance={account?.cash_balance || 0}
          portfolioValue={portfolioValue}
          initialBalance={account?.initial_balance || 10000}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StockSearch 
            onSelectStock={handleSelectStock} 
            selectedStock={selectedStock}
          />
          <TopStocks onSelectStock={handleSelectStock} />
          <HoldingsList 
            portfolio={portfolio} 
            currentPrices={currentPrices}
          />
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
            <StockNews 
              symbol={selectedStock?.symbol} 
              companyName={selectedStock?.company_name || selectedStock?.name}
              autoLoad={!selectedStock}
            />
          </div>
        </div>

        <div className="lg:sticky lg:top-6 h-fit space-y-6">
          <BuyStockPanel
            selectedStock={selectedStock}
            cashBalance={account?.cash_balance || 0}
            onBuy={handleBuy}
            isLoading={buyMutation.isPending}
          />
          <AlertsPanel selectedStock={selectedStock} />
        </div>
      </div>
    </div>
  );
}