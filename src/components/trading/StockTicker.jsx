import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TICKER_STOCKS = [
  { symbol: 'QNTM', basePrice: 185.50, volatility: 0.008 },
  { symbol: 'NXON', basePrice: 420.75, volatility: 0.006 },
  { symbol: 'ZYPH', basePrice: 142.30, volatility: 0.007 },
  { symbol: 'VRTX', basePrice: 178.90, volatility: 0.009 },
  { symbol: 'ELTR', basePrice: 243.20, volatility: 0.012 },
  { symbol: 'SYNX', basePrice: 488.45, volatility: 0.008 },
  { symbol: 'NPHR', basePrice: 523.80, volatility: 0.01 },
  { symbol: 'CRST', basePrice: 192.15, volatility: 0.005 },
  { symbol: 'PLSM', basePrice: 287.60, volatility: 0.006 },
  { symbol: 'MRKD', basePrice: 167.45, volatility: 0.004 },
];

export default function StockTicker() {
  const [prices, setPrices] = useState({});
  const [changes, setChanges] = useState({});

  useEffect(() => {
    // Initialize prices
    const initialPrices = {};
    const initialChanges = {};
    TICKER_STOCKS.forEach(stock => {
      const variation = (Math.random() - 0.5) * 0.02;
      initialPrices[stock.symbol] = stock.basePrice * (1 + variation);
      initialChanges[stock.symbol] = variation * 100;
    });
    setPrices(initialPrices);
    setChanges(initialChanges);

    // Update every 5 seconds for more dynamic feel
    const interval = setInterval(() => {
      setPrices(prevPrices => {
        const newPrices = {};
        const newChanges = {};
        
        TICKER_STOCKS.forEach(stock => {
          const currentPrice = prevPrices[stock.symbol] || stock.basePrice;
          const deviation = (currentPrice - stock.basePrice) / stock.basePrice;
          const meanReversion = -deviation * 0.05;
          const randomWalk = (Math.random() - 0.5) * 2 * stock.volatility;
          const momentum = (prevPrices[stock.symbol] > stock.basePrice ? 0.001 : -0.001);
          const totalChange = meanReversion + randomWalk + momentum;
          const newPrice = currentPrice * (1 + totalChange);
          const minPrice = stock.basePrice * 0.7;
          const maxPrice = stock.basePrice * 1.3;
          
          newPrices[stock.symbol] = Math.max(minPrice, Math.min(maxPrice, newPrice));
          newChanges[stock.symbol] = ((newPrices[stock.symbol] - currentPrice) / currentPrice) * 100;
        });
        
        setChanges(newChanges);
        return newPrices;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-violet-900 to-slate-900 text-white py-2 overflow-hidden border-b border-violet-700">
      <div className="flex animate-scroll whitespace-nowrap">
        {[...TICKER_STOCKS, ...TICKER_STOCKS].map((stock, index) => {
          const price = prices[stock.symbol] || stock.basePrice;
          const change = changes[stock.symbol] || 0;
          const isPositive = change >= 0;

          return (
            <div key={index} className="inline-flex items-center gap-2 mx-6">
              <span className="font-bold text-sm">{stock.symbol}</span>
              <span className="text-sm">
                £{price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`flex items-center gap-1 text-xs font-medium ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? '+' : ''}{change.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
      `}</style>
    </div>
  );
}