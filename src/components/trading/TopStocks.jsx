import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Star, Activity, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const REAL_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', riskLevel: 'Low' },
  { symbol: 'MSFT', name: 'Microsoft', sector: 'Technology', riskLevel: 'Low' },
  { symbol: 'GOOGL', name: 'Alphabet', sector: 'Technology', riskLevel: 'Medium' },
  { symbol: 'AMZN', name: 'Amazon', sector: 'E-commerce', riskLevel: 'Medium' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', riskLevel: 'High' },
  { symbol: 'META', name: 'Meta', sector: 'Technology', riskLevel: 'Medium' },
  { symbol: 'NVDA', name: 'NVIDIA', sector: 'Technology', riskLevel: 'High' },
  { symbol: 'NFLX', name: 'Netflix', sector: 'Entertainment', riskLevel: 'Medium' },
  { symbol: 'AMD', name: 'AMD Inc.', sector: 'Technology', riskLevel: 'High' },
  { symbol: 'INTC', name: 'Intel', sector: 'Technology', riskLevel: 'Medium' },
  { symbol: 'JPM', name: 'JPMorgan', sector: 'Finance', riskLevel: 'Low' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Finance', riskLevel: 'Low' },
  { symbol: 'WMT', name: 'Walmart', sector: 'Retail', riskLevel: 'Low' },
  { symbol: 'DIS', name: 'Disney', sector: 'Entertainment', riskLevel: 'Medium' },
  { symbol: 'PYPL', name: 'PayPal', sector: 'Finance', riskLevel: 'High' },
  { symbol: 'CSCO', name: 'Cisco', sector: 'Technology', riskLevel: 'Low' },
  { symbol: 'ADBE', name: 'Adobe', sector: 'Technology', riskLevel: 'Medium' },
  { symbol: 'CRM', name: 'Salesforce', sector: 'Technology', riskLevel: 'Medium' },
  { symbol: 'ORCL', name: 'Oracle', sector: 'Technology', riskLevel: 'Low' },
  { symbol: 'IBM', name: 'IBM', sector: 'Technology', riskLevel: 'Low' },
];

export default function TopStocks({ onSelectStock }) {
  const [selectedSector, setSelectedSector] = useState('all');

  const [displayPrices, setDisplayPrices] = useState({});
  const [momentum, setMomentum] = useState({});

  const { data: stockPrices = [], refetch, isRefetching } = useQuery({
    queryKey: ['stockPrices'],
    queryFn: () => base44.entities.StockPrice.list(),
    refetchInterval: 5000, // Real data every 5 seconds
  });

  // When real data arrives, update display prices and start animation
  useEffect(() => {
    if (stockPrices.length > 0) {
      setDisplayPrices(stockPrices.reduce((acc, stock) => {
        acc[stock.symbol] = {
          price: stock.price_gbp,
          change: stock.daily_change_percent,
          basePrice: stock.price_gbp,
          baseChange: stock.daily_change_percent
        };
        return acc;
      }, {}));
      
      // Initialize momentum for new stocks
      setMomentum(prev => {
        const updated = { ...prev };
        stockPrices.forEach(stock => {
          if (!updated[stock.symbol]) {
            updated[stock.symbol] = (Math.random() * 0.4 - 0.2); // Random trend between -0.2% and +0.2%
          }
        });
        return updated;
      });
    }
  }, [stockPrices]);

  // Animate prices between real data updates with momentum
  useEffect(() => {
    const interval = setInterval(() => {
      setMomentum(m => {
        const updated = { ...m };
        for (const symbol in updated) {
          const trendAdjustment = (Math.random() * 0.1 - 0.05);
          updated[symbol] = Math.max(-0.5, Math.min(0.5, updated[symbol] + trendAdjustment));
        }
        return updated;
      });

      setDisplayPrices(prev => {
        const updated = {};
        for (const symbol in prev) {
          const current = prev[symbol];
          const movementPercent = momentum[symbol] || 0;
          const newPrice = current.basePrice * (1 + movementPercent / 100);
          const newChange = current.baseChange + movementPercent;

          updated[symbol] = {
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat(newChange.toFixed(2)),
            basePrice: current.basePrice,
            baseChange: current.baseChange
          };
        }
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [momentum]);

  // Trigger initial price update and subscribe to real-time changes
  useEffect(() => {
    base44.functions.invoke('getUpdatedPrices', {}).catch(err => console.error('Price update failed:', err));
    
    const unsubscribe = base44.entities.StockPrice.subscribe(() => {
      refetch();
    });

    return () => unsubscribe();
  }, [refetch]);

  // Use animated display prices
  const priceMap = displayPrices;
  
  const sectors = ['all', ...new Set(REAL_STOCKS.map(s => s.sector))];
  
  const filteredStocks = selectedSector === 'all' 
    ? REAL_STOCKS 
    : REAL_STOCKS.filter(s => s.sector === selectedSector);

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Market Prices
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-2 h-7"
          >
            <RefreshCw className={`w-3 h-3 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {sectors.map(sector => (
            <Button
              key={sector}
              variant={selectedSector === sector ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSector(sector)}
              className={selectedSector === sector ? "bg-violet-600" : ""}
            >
              {sector.charAt(0).toUpperCase() + sector.slice(1)}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {filteredStocks.map((stock, index) => {
            const stockPrice = priceMap[stock.symbol];
            const currentPrice = stockPrice?.price || 0;
            const dailyChange = stockPrice?.change || 0;
            const isPositive = dailyChange >= 0;

            return (
              <motion.button
                key={stock.symbol}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => {
                  if (currentPrice > 0) {
                    onSelectStock({
                      symbol: stock.symbol,
                      company_name: stock.name,
                      price_gbp: currentPrice,
                      daily_change_percent: dailyChange
                    });
                  }
                }}
                disabled={!currentPrice}
                className="p-3 rounded-lg border border-gray-200 hover:border-violet-400 hover:shadow-md transition-all text-left bg-white disabled:opacity-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm">{stock.symbol}</div>
                    <div className="text-xs text-gray-500 truncate">{stock.name}</div>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div className="text-base font-bold text-gray-900">
                    {currentPrice > 0 ? (
                      `£${currentPrice.toFixed(2)}`
                    ) : (
                      <span className="text-xs text-gray-400">...</span>
                    )}
                  </div>
                  {currentPrice > 0 && (
                    <div className={`text-xs font-medium ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPositive ? '+' : ''}{dailyChange.toFixed(1)}%
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}