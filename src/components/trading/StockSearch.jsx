import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from "framer-motion";

const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'JPM', name: 'JPMorgan' },
  { symbol: 'V', name: 'Visa' },
  { symbol: 'WMT', name: 'Walmart' },
];

export default function StockSearch({ onSelectStock, selectedStock }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const searchStock = async (symbol) => {
    setIsSearching(true);
    try {
      const response = await base44.functions.invoke('getStockPrice', { symbol: symbol.toUpperCase() });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Failed to fetch stock:', error);
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchStock(searchQuery.toUpperCase());
    }
  };

  const handleQuickSelect = (stock) => {
    setSearchQuery(stock.symbol);
    searchStock(stock.symbol);
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">Find Stocks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Enter stock symbol (e.g., AAPL)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
            className="flex-1 border-gray-200 focus:border-violet-400 focus:ring-violet-400"
          />
          <Button type="submit" disabled={isSearching} className="bg-violet-600 hover:bg-violet-700">
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {POPULAR_STOCKS.map((stock) => (
            <Button
              key={stock.symbol}
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect(stock)}
              className="text-xs hover:bg-violet-50 hover:border-violet-300"
            >
              {stock.symbol}
            </Button>
          ))}
        </div>

        <AnimatePresence>
          {searchResults && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                selectedStock?.symbol === searchResults.symbol 
                  ? 'bg-violet-100 border-2 border-violet-400' 
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
              onClick={() => onSelectStock(searchResults)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{searchResults.symbol}</h3>
                  <p className="text-sm text-gray-500">{searchResults.company_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    £{searchResults.price_gbp?.toFixed(2)}
                  </p>
                  <p className={`text-sm flex items-center justify-end gap-1 ${
                    searchResults.daily_change_percent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {searchResults.daily_change_percent >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {searchResults.daily_change_percent >= 0 ? '+' : ''}{searchResults.daily_change_percent?.toFixed(2)}%
                  </p>
                </div>
              </div>
              {selectedStock?.symbol === searchResults.symbol && (
                <p className="text-xs text-violet-600 mt-2 font-medium">✓ Selected for trading</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}