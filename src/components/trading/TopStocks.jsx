import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Star } from "lucide-react";
import { motion } from "framer-motion";

const TOP_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive' },
  { symbol: 'META', name: 'Meta Platforms', sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology' },
  { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Finance' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Finance' },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Retail' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { symbol: 'PG', name: 'Procter & Gamble', sector: 'Consumer' },
  { symbol: 'DIS', name: 'The Walt Disney', sector: 'Entertainment' },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Entertainment' },
  { symbol: 'BA', name: 'Boeing Co.', sector: 'Aerospace' },
  { symbol: 'NKE', name: 'Nike Inc.', sector: 'Apparel' },
  { symbol: 'ABPF', name: 'AB Portfolio Finance', sector: 'Finance' },
];

export default function TopStocks({ onSelectStock }) {
  const [selectedSector, setSelectedSector] = React.useState('all');
  
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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {filteredStocks.map((stock, index) => (
            <motion.button
              key={stock.symbol}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onSelectStock(stock)}
              className="p-3 rounded-lg border-2 border-gray-200 hover:border-violet-400 hover:bg-violet-50 transition-all text-left"
            >
              <div className="font-bold text-gray-900">{stock.symbol}</div>
              <div className="text-xs text-gray-500 truncate">{stock.name}</div>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}