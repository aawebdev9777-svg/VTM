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
  const [inputMode, setInputMode] = useState('shares');
  const [amount, setAmount] = useState('');

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

  const handleAmountChange = (value) => {
    setAmount(value);
    if (value && selectedStock) {
      const calculatedShares = Math.floor(parseFloat(value) / selectedStock.price_gbp);
      setShares(calculatedShares > 0 ? calculatedShares.toString() : '1');
    }
  };

  const handleSharesChange = (value) => {
    setShares(value);
    if (value && selectedStock) {
      const calculatedAmount = parseFloat(value) * selectedStock.price_gbp;
      setAmount(calculatedAmount.toFixed(2));
    }
  };

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
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                variant={inputMode === 'shares' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMode('shares')}
                className={inputMode === 'shares' ? 'bg-violet-600' : ''}
              >
                Shares
              </Button>
              <Button
                variant={inputMode === 'amount' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMode('amount')}
                className={inputMode === 'amount' ? 'bg-violet-600' : ''}
              >
                Amount (£)
              </Button>
            </div>

            {inputMode === 'shares' ? (
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Number of Shares</label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="0"
                  value={shares}
                  onChange={(e) => handleSharesChange(e.target.value)}
                  className="text-lg font-semibold"
                />
              </div>
            ) : (
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Amount to {tradeType === 'buy' ? 'Spend' : 'Receive'} (£)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="text-lg font-semibold"
                />
                <p className="text-xs text-gray-500 mt-1">≈ {shares || 0} shares</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const amt = tradeType === 'buy' ? cashBalance * 0.25 : ownedShares * selectedStock.price_gbp * 0.25;
                  const calcShares = tradeType === 'buy' ? Math.floor(amt / selectedStock.price_gbp) : Math.floor(ownedShares * 0.25);
                  setShares(calcShares.toString());
                  setAmount(amt.toFixed(2));
                }}
              >
                25%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const amt = tradeType === 'buy' ? cashBalance * 0.5 : ownedShares * selectedStock.price_gbp * 0.5;
                  const calcShares = tradeType === 'buy' ? Math.floor(amt / selectedStock.price_gbp) : Math.floor(ownedShares * 0.5);
                  setShares(calcShares.toString());
                  setAmount(amt.toFixed(2));
                }}
              >
                50%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const maxShares = tradeType === 'buy' ? maxBuyable : ownedShares;
                  setShares(maxShares.toString());
                  setAmount((maxShares * selectedStock.price_gbp).toFixed(2));
                }}
              >
                Max
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              {tradeType === 'buy' ? `Max buyable: ${maxBuyable} shares` : `You own: ${ownedShares} shares`}
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