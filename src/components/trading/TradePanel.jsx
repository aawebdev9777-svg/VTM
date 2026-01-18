import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpCircle, ArrowDownCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function TradePanel({ selectedStock, cashBalance, portfolio, onTrade }) {
  const [shares, setShares] = useState('');
  const [tradeType, setTradeType] = useState('buy');

  if (!selectedStock) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Search and select a stock to start trading</p>
        </CardContent>
      </Card>
    );
  }

  const ownedStock = portfolio.find(p => p.symbol === selectedStock.symbol);
  const ownedShares = ownedStock?.shares || 0;
  const totalCost = parseFloat(shares || 0) * selectedStock.price_gbp;
  const canBuy = totalCost <= cashBalance && parseFloat(shares) > 0;
  const canSell = parseFloat(shares) <= ownedShares && parseFloat(shares) > 0;

  const handleTrade = () => {
    if ((tradeType === 'buy' && canBuy) || (tradeType === 'sell' && canSell)) {
      onTrade(tradeType, selectedStock, parseFloat(shares));
      setShares('');
    }
  };

  const maxBuyable = Math.floor(cashBalance / selectedStock.price_gbp);

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center justify-between">
          <span>Trade {selectedStock.symbol}</span>
          <span className="text-violet-600">£{selectedStock.price_gbp?.toFixed(2)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tradeType} onValueChange={setTradeType} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="buy" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              Sell
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Number of Shares</label>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="0"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="text-lg font-semibold"
              />
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              {tradeType === 'buy' ? (
                <>
                  <span>Max buyable: {maxBuyable} shares</span>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto text-violet-600"
                    onClick={() => setShares(maxBuyable.toString())}
                  >
                    Max
                  </Button>
                </>
              ) : (
                <>
                  <span>You own: {ownedShares} shares</span>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto text-violet-600"
                    onClick={() => setShares(ownedShares.toString())}
                  >
                    Sell All
                  </Button>
                </>
              )}
            </div>

            <motion.div 
              className="p-4 rounded-xl bg-gray-50"
              animate={{ scale: shares ? [1, 1.02, 1] : 1 }}
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  £{totalCost.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </motion.div>

            <Button
              className={`w-full py-6 text-lg font-semibold ${
                tradeType === 'buy' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-red-500 hover:bg-red-600'
              }`}
              onClick={handleTrade}
              disabled={tradeType === 'buy' ? !canBuy : !canSell}
            >
              {tradeType === 'buy' ? 'Buy' : 'Sell'} {shares || 0} Shares
            </Button>

            {tradeType === 'buy' && totalCost > cashBalance && shares && (
              <p className="text-sm text-red-500 text-center">Insufficient funds</p>
            )}
            {tradeType === 'sell' && parseFloat(shares) > ownedShares && shares && (
              <p className="text-sm text-red-500 text-center">You don't own enough shares</p>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}