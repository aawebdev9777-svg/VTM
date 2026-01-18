import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Star, Activity } from "lucide-react";
import { motion } from "framer-motion";

const TOP_STOCKS = [
  { symbol: 'QNTM', name: 'QuantumLeap Technologies', sector: 'Technology', basePrice: 185.50, volatility: 0.008 },
  { symbol: 'NXON', name: 'Nexonn Systems', sector: 'Technology', basePrice: 420.75, volatility: 0.006 },
  { symbol: 'ZYPH', name: 'Zypheron Labs', sector: 'Technology', basePrice: 142.30, volatility: 0.007 },
  { symbol: 'VRTX', name: 'Vortexia Inc', sector: 'Consumer', basePrice: 178.90, volatility: 0.009 },
  { symbol: 'ELTR', name: 'Electryx Motors', sector: 'Automotive', basePrice: 243.20, volatility: 0.012 },
  { symbol: 'SYNX', name: 'Synaptic Networks', sector: 'Technology', basePrice: 488.45, volatility: 0.008 },
  { symbol: 'NPHR', name: 'Nephron Semiconductors', sector: 'Technology', basePrice: 523.80, volatility: 0.01 },
  { symbol: 'CRST', name: 'Crestmont Financial', sector: 'Finance', basePrice: 192.15, volatility: 0.005 },
  { symbol: 'PLSM', name: 'Plasmic Payments', sector: 'Finance', basePrice: 287.60, volatility: 0.006 },
  { symbol: 'MRKD', name: 'Markadian Retail Group', sector: 'Retail', basePrice: 167.45, volatility: 0.004 },
  { symbol: 'BION', name: 'Bionex Healthcare', sector: 'Healthcare', basePrice: 153.90, volatility: 0.005 },
  { symbol: 'STRM', name: 'Streamline Entertainment', sector: 'Entertainment', basePrice: 97.25, volatility: 0.008 },
  { symbol: 'FLXM', name: 'FluxMedia Streaming', sector: 'Entertainment', basePrice: 682.40, volatility: 0.011 },
  { symbol: 'AROS', name: 'Aerostar Aerospace', sector: 'Aerospace', basePrice: 218.35, volatility: 0.009 },
  { symbol: 'VELO', name: 'Velocity Sportswear', sector: 'Apparel', basePrice: 107.80, volatility: 0.007 },
  { symbol: 'CYBD', name: 'CyberDefense Systems', sector: 'Technology', basePrice: 322.50, volatility: 0.01 },
  { symbol: 'GNTX', name: 'GeneTrix Pharma', sector: 'Healthcare', basePrice: 278.95, volatility: 0.012 },
  { symbol: 'SOLR', name: 'SolarWind Energy', sector: 'Energy', basePrice: 143.70, volatility: 0.008 },
  { symbol: 'ORBN', name: 'Orbinex Space Tech', sector: 'Aerospace', basePrice: 395.20, volatility: 0.011 },
  { symbol: 'MTRX', name: 'Matrixion AI', sector: 'Technology', basePrice: 567.30, volatility: 0.009 },
];

export default function TopStocks({ onSelectStock }) {
  const [selectedSector, setSelectedSector] = useState('all');
  const [livePrices, setLivePrices] = useState({});
  const [priceChanges, setPriceChanges] = useState({});
  
  useEffect(() => {
    // Initialize prices with slight variation from base
    const initialPrices = {};
    const initialChanges = {};
    TOP_STOCKS.forEach(stock => {
      const variation = (Math.random() - 0.5) * 0.02;
      initialPrices[stock.symbol] = stock.basePrice * (1 + variation);
      initialChanges[stock.symbol] = variation * 100;
    });
    setLivePrices(initialPrices);
    setPriceChanges(initialChanges);

    // Update prices every 30 seconds with realistic movement
    const interval = setInterval(() => {
      setLivePrices(prevPrices => {
        const newPrices = {};
        const newChanges = {};
        
        TOP_STOCKS.forEach(stock => {
          const currentPrice = prevPrices[stock.symbol] || stock.basePrice;
          
          // Realistic price movement simulation
          // 1. Mean reversion - tendency to drift back to base price
          const deviation = (currentPrice - stock.basePrice) / stock.basePrice;
          const meanReversion = -deviation * 0.05;
          
          // 2. Random walk component
          const randomWalk = (Math.random() - 0.5) * 2 * stock.volatility;
          
          // 3. Momentum - small continuation of previous trend
          const momentum = (prevPrices[stock.symbol] > stock.basePrice ? 0.001 : -0.001);
          
          // Combined change
          const totalChange = meanReversion + randomWalk + momentum;
          
          // Apply change with bounds
          const newPrice = currentPrice * (1 + totalChange);
          const minPrice = stock.basePrice * 0.7;
          const maxPrice = stock.basePrice * 1.3;
          
          newPrices[stock.symbol] = Math.max(minPrice, Math.min(maxPrice, newPrice));
          newChanges[stock.symbol] = ((newPrices[stock.symbol] - currentPrice) / currentPrice) * 100;
        });
        
        setPriceChanges(newChanges);
        return newPrices;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);
  
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
                    £{price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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