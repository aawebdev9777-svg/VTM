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
import FreeStockSelector from '../components/trading/FreeStockSelector';
import BuyAnalysis from '../components/trading/BuyAnalysis';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Home() {
  const [selectedStock, setSelectedStock] = useState(null);
  const [currentPrices, setCurrentPrices] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [showFreeStockModal, setShowFreeStockModal] = useState(false);
  const [displayPrices, setDisplayPrices] = useState({});
  const buyPanelRef = React.useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

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

  const { data: accounts, isLoading: accountLoading } = useQuery({
    queryKey: ['userAccount', currentUser?.email],
    queryFn: () => base44.entities.UserAccount.filter({ created_by: currentUser?.email }),
    enabled: !!currentUser?.email,
    refetchInterval: 10000,
  });

  const { data: portfolio = [], isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio', currentUser?.email],
    queryFn: () => base44.entities.Portfolio.filter({ created_by: currentUser?.email }),
    enabled: !!currentUser?.email,
    refetchInterval: 10000,
  });

  const { data: myCopyTrades = [] } = useQuery({
    queryKey: ['myCopyTrades', currentUser?.email],
    queryFn: () => base44.entities.CopyTrade.filter({ follower_email: currentUser?.email, is_active: true }),
    enabled: !!currentUser?.email,
    refetchInterval: 15000,
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getLeaderboard', {});
      return response.data.leaderboard || [];
    },
    refetchInterval: 5000,
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
    mutationFn: async (userEmail) => {
      const initialAmount = 10000;
      return base44.entities.UserAccount.create({ 
        cash_balance: initialAmount, 
        initial_balance: initialAmount,
        free_stocks_available: 3
      });
    },
    onSuccess: (data, userEmail) => {
      queryClient.invalidateQueries({ queryKey: ['userAccount', userEmail] });
    },
  });

  useEffect(() => {
    if (currentUser?.email && accounts?.length === 0) {
      createAccountMutation.mutate(currentUser.email);
    }
  }, [accounts, currentUser?.email]);

  const account = accounts?.[0];

  // Check if user has free stocks available
  useEffect(() => {
    if (account?.free_stocks_available > 0) {
      setShowFreeStockModal(true);
    }
  }, [account?.free_stocks_available]);

  const buyMutation = useMutation({
    mutationFn: async ({ stock, shares }) => {
      const response = await base44.functions.invoke('buyStock', { stock, shares });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Transaction failed');
      }
      
      return response.data;
    },
    onSuccess: async (data) => {
      // Update queries with fresh data from server
      queryClient.setQueryData(['userAccount', currentUser?.email], [data.data.account]);
      queryClient.setQueryData(['portfolio', currentUser?.email], data.data.portfolio);
      
      // Invalidate to ensure consistency
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['stockPrices'] }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
      ]);
    },
    onError: (error) => {
      alert(error.message || 'Transaction failed. Please try again.');
    }
  });

  const handleBuy = (stock, shares) => {
    buyMutation.mutate({ stock, shares });
  };

  useEffect(() => {
    if (stockPrices.length > 0) {
      const pricesMap = {};
      const displayMap = {};
      stockPrices.forEach(sp => {
        pricesMap[sp.symbol] = sp.price_gbp;
        displayMap[sp.symbol] = { price: sp.price_gbp, change: sp.daily_change_percent };
      });
      setCurrentPrices(pricesMap);
      setDisplayPrices(displayMap);
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
    
    // Scroll to buy panel
    setTimeout(() => {
      buyPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const portfolioValue = portfolio.reduce((sum, holding) => {
    const price = currentPrices[holding.symbol] || holding.average_buy_price;
    return sum + (holding.shares * price);
  }, 0);

  // Calculate copy trade value
  const copyTradeValue = myCopyTrades.reduce((sum, ct) => {
    const leaderData = leaderboard.find(l => l.email === ct.leader_email);
    const currentValue = ct.investment_amount * (1 + ((leaderData?.percentageReturn || 0) / 100));
    return sum + currentValue;
  }, 0);

  if (accountLoading || portfolioLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  const handleFreeStockClose = async () => {
    setShowFreeStockModal(false);
    // Update account to remove free stock flag
    if (account?.id) {
      await base44.entities.UserAccount.update(account.id, { free_stocks_available: 0 });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-6 pb-20">
      <FreeStockSelector 
        open={showFreeStockModal} 
        onClose={handleFreeStockClose}
      />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                ABPF Trading
              </h1>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mt-1">Virtual Portfolio • Live Market Data</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries()}
            className="gap-2 h-8"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </motion.div>

      <div className="mb-4">
        <PortfolioSummary
          cashBalance={account?.cash_balance || 0}
          portfolioValue={portfolioValue + copyTradeValue}
          initialBalance={account?.initial_balance || account?.cash_balance || 10000}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
         <div className="lg:col-span-2 space-y-4">
           <div ref={buyPanelRef}>
             <BuyStockPanel
               selectedStock={selectedStock}
               cashBalance={account?.cash_balance || 0}
               onBuy={handleBuy}
               isLoading={buyMutation.isPending}
             />
           </div>
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

        <div className="space-y-4">
          <BuyAnalysis 
            stockPrices={stockPrices} 
            displayPrices={displayPrices} 
            cashBalance={account?.cash_balance || 0} 
            totalPortfolioValue={portfolioValue + copyTradeValue} 
          />
          <AlertsPanel selectedStock={selectedStock} />
        </div>
      </div>
    </div>
  );
}