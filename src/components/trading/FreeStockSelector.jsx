import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, TrendingUp, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const availableStocks = [
  { symbol: 'AAPL', name: 'Apple', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Google', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon', sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla', sector: 'Automotive' },
  { symbol: 'NVDA', name: 'NVIDIA', sector: 'Technology' },
  { symbol: 'META', name: 'Meta', sector: 'Technology' },
  { symbol: 'JPM', name: 'JPMorgan', sector: 'Finance' },
  { symbol: 'V', name: 'Visa', sector: 'Finance' },
  { symbol: 'WMT', name: 'Walmart', sector: 'Retail' },
  { symbol: 'DIS', name: 'Disney', sector: 'Entertainment' },
  { symbol: 'NFLX', name: 'Netflix', sector: 'Entertainment' }
];

export default function FreeStockSelector({ open, onClose }) {
  const [selectedStocks, setSelectedStocks] = useState([]);
  const queryClient = useQueryClient();

  const { data: stockPrices = [] } = useQuery({
    queryKey: ['stockPrices'],
    queryFn: () => base44.entities.StockPrice.list(),
    enabled: open,
  });

  const claimMutation = useMutation({
    mutationFn: async (stocks) => {
      await base44.functions.invoke('giveThreeFreeStocks', { stockSymbols: stocks });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['userAccount'] });
      onClose();
    },
  });

  const toggleStock = (symbol) => {
    if (selectedStocks.includes(symbol)) {
      setSelectedStocks(selectedStocks.filter(s => s !== symbol));
    } else if (selectedStocks.length < 3) {
      setSelectedStocks([...selectedStocks, symbol]);
    }
  };

  const handleClaim = () => {
    if (selectedStocks.length === 3) {
      claimMutation.mutate(selectedStocks);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Gift className="w-6 h-6 text-violet-600" />
            Choose Your 3 Free Stocks!
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-2">
            Select any 3 stocks to add to your portfolio. You'll receive 1 share of each.
          </p>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4 p-3 bg-violet-50 rounded-lg border border-violet-200">
            <p className="text-sm font-medium text-violet-900">
              Selected: {selectedStocks.length} / 3
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableStocks.map((stock, index) => {
              const stockPrice = stockPrices.find(sp => sp.symbol === stock.symbol);
              const isSelected = selectedStocks.includes(stock.symbol);
              const canSelect = selectedStocks.length < 3 || isSelected;

              return (
                <motion.div
                  key={stock.symbol}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-violet-50 border-violet-500 border-2'
                        : canSelect
                        ? 'hover:border-violet-300 hover:shadow-md'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => canSelect && toggleStock(stock.symbol)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{stock.symbol}</p>
                        <p className="text-xs text-gray-500">{stock.name}</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs mb-2">
                      {stock.sector}
                    </Badge>
                    {stockPrice && (
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="font-medium">
                          £{stockPrice.price_gbp?.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={claimMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleClaim}
              disabled={selectedStocks.length !== 3 || claimMutation.isPending}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {claimMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Claim {selectedStocks.length} Free Stock{selectedStocks.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}