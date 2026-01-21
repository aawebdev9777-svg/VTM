import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, ShoppingCart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import StockChart from './StockChart';

export default function BuyStockPanel({ selectedStock, cashBalance, onBuy, isLoading }) {
  const [shares, setShares] = useState('');

  const handleBuy = () => {
    if (canBuy) {
      onBuy(selectedStock, parseFloat(shares));
      setShares('');
    }
  };

  if (!selectedStock) {
    return (
      <Card className="border-0 shadow-md bg-gradient-to-br from-gray-50 to-gray-100">
        <CardContent className="py-8 text-center">
          <AlertCircle className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">Select a stock to trade</p>
        </CardContent>
      </Card>
    );
  }

  const totalCost = parseFloat(shares || 0) * selectedStock.price_gbp;
  const canBuy = totalCost <= cashBalance && parseFloat(shares) > 0 && !isLoading;
  const maxBuyable = Math.floor(cashBalance / selectedStock.price_gbp);

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Buy {selectedStock.symbol}</span>
            <span className="text-violet-600 text-xl font-bold">£{selectedStock.price_gbp?.toFixed(2)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <StockChart 
          symbol={selectedStock.symbol}
          priceGbp={selectedStock.price_gbp}
          dailyChangePercent={selectedStock.daily_change_percent}
        />
        <div>
          <label className="text-xs text-gray-600 block mb-1.5">Shares (Max: {maxBuyable})</label>
          <Input
            type="number"
            min="1"
            step="1"
            placeholder="0"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            className="text-base font-semibold h-10"
          />
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShares(Math.floor(maxBuyable * 0.25).toString())}
              className="flex-1 text-xs"
            >
              25%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShares(Math.floor(maxBuyable * 0.5).toString())}
              className="flex-1 text-xs"
            >
              50%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShares(Math.floor(maxBuyable * 0.75).toString())}
              className="flex-1 text-xs"
            >
              75%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShares(maxBuyable.toString())}
              className="flex-1 text-xs font-semibold"
            >
              MAX
            </Button>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-violet-50 border border-violet-200">
          <div className="text-center">
            <p className="text-gray-600 text-xs">Total</p>
            <p className="text-2xl font-bold text-violet-600">
              £{totalCost.toFixed(2)}
            </p>
          </div>
        </div>

        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleBuy}
          disabled={!canBuy || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buy {shares || 0} Shares
            </>
          )}
        </Button>

        {totalCost > cashBalance && shares && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-red-500 text-center font-semibold"
          >
            ⚠️ Insufficient funds - need £{(totalCost - cashBalance).toFixed(2)} more
          </motion.p>
        )}
      </CardContent>
    </Card>
  );
}