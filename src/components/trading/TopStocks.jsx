import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Star, Activity } from "lucide-react";
import { motion } from "framer-motion";

const TOP_STOCKS = [
  { symbol: 'APPL-P', name: 'Apple Pair Tech', sector: 'Technology', basePrice: 180, volatility: 0.02 },
  { symbol: 'MSFT-P', name: 'MicroSoft Pair', sector: 'Technology', basePrice: 420, volatility: 0.015 },
  { symbol: 'GOOGL-P', name: 'Google Pair', sector: 'Technology', basePrice: 145, volatility: 0.018 },
  { symbol: 'AMZN-P', name: 'Amazon Pair', sector: 'Consumer', basePrice: 175, volatility: 0.025 },
  { symbol: 'TSLA-P', name: 'Tesla Pair Motors', sector: 'Automotive', basePrice: 245, volatility: 0.035 },
  { symbol: 'META-P', name: 'Meta Pair Social', sector: 'Technology', basePrice: 485, volatility: 0.022 },
  { symbol: 'NVDA-P', name: 'Nvidia Pair Chips', sector: 'Technology', basePrice: 525, volatility: 0.028 },
  { symbol: 'JPM-P', name: 'JPMorgan Pair Bank', sector: 'Finance', basePrice: 195, volatility: 0.012 },
  { symbol: 'V-P', name: 'Visa Pair Payments', sector: 'Finance', basePrice: 285, volatility: 0.014 },
  { symbol: 'WMT-P', name: 'Walmart Pair Retail', sector: 'Retail', basePrice: 165, volatility: 0.011 },
  { symbol: 'JNJ-P', name: 'Johnson Pair Health', sector: 'Healthcare', basePrice: 155, volatility: 0.01 },
  { symbol: 'DIS-P', name: 'Disney Pair Entertainment', sector: 'Entertainment', basePrice: 95, volatility: 0.02 },
  { symbol: 'NFLX-P', name: 'Netflix Pair Streaming', sector: 'Entertainment', basePrice: 685, volatility: 0.03 },
  { symbol: 'BA-P', name: 'Boeing Pair Aerospace', sector: 'Aerospace', basePrice: 215, volatility: 0.025 },
  { symbol: 'NKE-P', name: 'Nike Pair Sports', sector: 'Apparel', basePrice: 105, volatility: 0.016 },
  { symbol: 'CYBER-P', name: 'CyberSecure Pair', sector: 'Technology', basePrice: 325, volatility: 0.027 },
  { symbol: 'BIOX-P', name: 'BioXcel Pair Pharma', sector: 'Healthcare', basePrice: 275, volatility: 0.032 },
  { symbol: 'GRNE-P', name: 'GreenEarth Pair Energy', sector: 'Energy', basePrice: 145, volatility: 0.022 },
];

export default function TopStocks({ onSelectStock }) {
  const [selectedSector, setSelectedSector] = useState('all');
  const [livePrices, setLivePrices] = useState({});
  const [priceChanges, setPriceChanges] = useState({});
  
  useEffect(() => {
    // Initialize prices
    const initialPrices = {};
    const initialChanges = {};
    TOP_STOCKS.forEach(stock => {
      initialPrices[stock.symbol] = stock.basePrice;
      initialChanges[stock.symbol] = 0;
    });
    setLivePrices(initialPrices);
    setPriceChanges(initialChanges);

    // Update prices every 30 seconds
    const interval = setInterval(() => {
      const newPrices = {};
      const newChanges = {};
      
      TOP_STOCKS.forEach(stock => {
        const change = (Math.random() - 0.5) * 2 * stock.volatility;
        const currentPrice = livePrices[stock.symbol] || stock.basePrice;
        const newPrice = currentPrice * (1 + change);
        newPrices[stock.symbol] = newPrice;
        newChanges[stock.symbol] = change * 100;
      });
      
      setLivePrices(newPrices);
      setPriceChanges(newChanges);
    }, 30000);

    return () => clearInterval(interval);
  }, [livePrices]);
  
  const sectors = ['all', ...new Set(TOP_STOCKS.map(s => s.sector))];
  
  const filteredStocks = selectedSector === 'all' 
    ? TOP_STOCKS 
    : TOP_STOCKS.filter(s => s.sector === selectedSector);

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Popular Stocks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredStocks.map((stock, index) => {
            const price = livePrices[stock.symbol] || stock.basePrice;
            const change = priceChanges[stock.symbol] || 0;
            const isPositive = change >= 0;

            return (
              <motion.button
                key={stock.symbol}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onSelectStock({ ...stock, price_gbp: price, daily_change_percent: change })}
                className="p-4 rounded-xl border-2 border-gray-200 hover:border-violet-400 hover:shadow-lg transition-all text-left bg-white"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{stock.symbol}</div>
                    <div className="text-xs text-gray-500 truncate">{stock.name}</div>
                  </div>
                  <Activity className="w-4 h-4 text-violet-500" />
                </div>
                
                <div className="flex items-end justify-between mt-3">
                  <div className="text-xl font-bold text-gray-900">
                    £{price.toFixed(2)}
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(change).toFixed(2)}%
                  </div>
                </div>
                
                {/* Mini price chart simulation */}
                <div className="mt-3 flex items-end gap-0.5 h-8">
                  {[...Array(12)].map((_, i) => {
                    const height = 20 + Math.random() * 80;
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-t ${isPositive ? 'bg-green-200' : 'bg-red-200'}`}
                        style={{ height: `${height}%` }}
                      />
                    );
                  })}
                </div>
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}