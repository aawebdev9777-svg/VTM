import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function StockTicker() {
  const [flashMap, setFlashMap] = useState({});
  const prevPricesRef = useRef({});

  const { data: tickerPrices = [] } = useQuery({
    queryKey: ['tickerPrices'],
    queryFn: () => base44.entities.StockPrice.list(),
    refetchInterval: 8000,
  });

  useEffect(() => {
    if (tickerPrices.length === 0) return;
    const newFlash = {};
    tickerPrices.forEach(stock => {
      const prev = prevPricesRef.current[stock.symbol];
      if (prev !== undefined && prev !== stock.price_gbp) {
        newFlash[stock.symbol] = stock.price_gbp > prev ? 'up' : 'down';
      }
      prevPricesRef.current[stock.symbol] = stock.price_gbp;
    });
    if (Object.keys(newFlash).length > 0) {
      setFlashMap(newFlash);
      setTimeout(() => setFlashMap({}), 1200);
    }
  }, [tickerPrices]);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-1.5 overflow-hidden border-b border-slate-700">
      <div className="flex whitespace-nowrap" style={{ animation: 'tickerScroll 40s linear infinite' }}>
        {[...tickerPrices, ...tickerPrices].map((stock, index) => {
          const change = stock.daily_change_percent || 0;
          const isPositive = change >= 0;
          const flash = flashMap[stock.symbol];

          return (
            <div key={index} className={`inline-flex items-center gap-2 mx-6 transition-colors duration-500 ${
              flash === 'up' ? 'text-green-300' : flash === 'down' ? 'text-red-300' : ''
            }`}>
              <span className="font-bold text-sm text-white">{stock.symbol}</span>
              <span className="text-sm">
                £{(stock.price_gbp || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}