import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, ShoppingCart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function BuyStockPanel({ selectedStock, cashBalance, onBuy, isLoading }) {
  const [shares, setShares] = useState('');

  if (!selectedStock) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Select a stock to buy</p>
        </CardContent>
      </Card>
    );
  }

  const totalCost = parseFloat(shares || 0) * selectedStock.price_gbp;
  const canBuy = totalCost <= cashBalance && parseFloat(shares) > 0;
  const maxBuyable = Math.floor(cashBalance / selectedStock.price_gbp);

  const handleBuy = () => {
    if (canBuy) {
      onBuy(selectedStock, parseFloat(shares));
      setShares('');
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          <div className="flex items-center justify-between">
            <span>Buy {selectedStock.symbol}</span>
            <span className="text-violet-600 text-2xl font-bold">£{selectedStock.price_gbp?.toFixed(2)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-gray-600 block mb-2">Number of Shares</label>
          <Input
            type="number"
            min="1"
            step="1"
            placeholder="0"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            className="text-lg font-semibold"
          />
          <p className="text-xs text-gray-500 mt-1">Max: {maxBuyable} shares</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const s = Math.floor(maxBuyable * 0.25);
              setShares(s.toString());
            }}
            className="text-xs"
          >
            25%
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const s = Math.floor(maxBuyable * 0.5);
              setShares(s.toString());
            }}
            className="text-xs"
          >
            50%
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShares(maxBuyable.toString())}
            className="text-xs"
          >
            Max
          </Button>
        </div>

        <motion.div 
          className="p-4 rounded-xl bg-violet-50 border border-violet-200"
          animate={{ scale: shares ? [1, 1.02, 1] : 1 }}
        >
          <div className="text-center">
            <p className="text-gray-600 text-sm">Total Cost</p>
            <p className="text-3xl font-bold text-violet-600">
              £{totalCost.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Available: £{cashBalance.toFixed(2)}</p>
          </div>
        </motion.div>

        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
          onClick={handleBuy}
          disabled={!canBuy || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Buying...
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2" />
              Buy {shares || 0} Shares
            </>
          )}
        </Button>

        {totalCost > cashBalance && shares && (
          <p className="text-sm text-red-500 text-center">Insufficient funds</p>
        )}
      </CardContent>
    </Card>
  );
}